import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth-server'
import { randomBytes, createHash } from 'crypto'
import { demoDropsStore, uploadedFilesStore } from '@/lib/demo-storage'
import { uploadFileToStorage } from '@/lib/firebase-storage'
import { createDrop, getDrops, FirestoreDrop } from '@/lib/firestore-drops'
import { canUsePhysicalMode, validateRadius, validateFileSize, getTierLimits } from '@/lib/tiers'

// Force this route to be dynamic (not statically rendered)
export const dynamic = 'force-dynamic'

// Add CORS headers for mobile app
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  // Prevent caching
  response.headers.set('Cache-Control', 'no-store, no-cache')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Content-Type', 'application/json; charset=utf-8')
  return response
}

// Handle preflight requests
export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}

export async function GET(request: NextRequest) {
  try {
    console.log('API route called with:', request.url)
    
    // Fetch drops from Firestore
    const firestoreDrops = await getDrops({ scope: 'public' })
    console.log(`Found ${firestoreDrops.length} drops in Firestore`)
    
    // Combine with demo drops for backward compatibility
    const allDrops = [...firestoreDrops, ...demoDropsStore]
    
    console.log('Returning drops:', allDrops.length)
    const response = NextResponse.json({ drops: allDrops })
    return addCorsHeaders(response)
    
  } catch (error) {
    console.error('Error in drops API:', error)
    const response = NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/drops called')
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    
    // Verify authentication
    const user = await verifyAuthToken(request)
    if (!user) {
      console.log('No valid auth token found')
      const response = NextResponse.json(
        { error: 'No auth token' },
        { status: 401 }
      )
      return addCorsHeaders(response)
    }
    
    console.log('Authenticated user:', user.uid)
    
    // Parse form data
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string || ''
    const secret = formData.get('secret') as string
    const lat = parseFloat(formData.get('lat') as string)
    const lng = parseFloat(formData.get('lng') as string)
    const geofenceRadiusM = parseInt(formData.get('geofenceRadiusM') as string)
    const scope = formData.get('scope') as 'public' | 'private'
    const dropType = formData.get('dropType') as 'private' | 'public' | 'hunt' || 'private'
    const retrievalMode = formData.get('retrievalMode') as 'remote' | 'physical'
    const huntCode = formData.get('huntCode') as string || null
    const huntDifficulty = formData.get('huntDifficulty') as 'beginner' | 'intermediate' | 'expert' | 'master' || null
    const expiresAt = formData.get('expiresAt') ? new Date(formData.get('expiresAt') as string) : null
    
    // Get files
    const files = formData.getAll('files') as File[]
    
    console.log('Drop data:', {
      title,
      description,
      lat,
      lng,
      geofenceRadiusM,
      scope,
      dropType,
      huntCode: huntCode || undefined,
      huntDifficulty: huntDifficulty || undefined,
      retrievalMode,
      filesCount: files.length
    })
    
    // ============================================
    // VALIDATION - Tier Restrictions
    // ============================================
    
    // 1. Validate physical mode access
    if (retrievalMode === 'physical' && !canUsePhysicalMode(user.tier)) {
      console.log(`❌ Physical mode not available for ${user.tier} tier`)
      const response = NextResponse.json({
        error: 'Physical Mode Requires Premium',
        message: 'Physical unlock mode (GPS validated) is available for Premium and Business tiers only.',
        tier: user.tier,
        upgradeRequired: true,
        upgradeTo: 'premium'
      }, { status: 403 })
      return addCorsHeaders(response)
    }
    
    // 2. Validate radius
    const radiusValidation = validateRadius(geofenceRadiusM, user.tier)
    if (!radiusValidation.valid) {
      console.log(`❌ Invalid radius: ${radiusValidation.error}`)
      const response = NextResponse.json({
        error: 'Invalid Radius',
        message: radiusValidation.error,
        min: radiusValidation.min,
        max: radiusValidation.max,
        tier: user.tier
      }, { status: 400 })
      return addCorsHeaders(response)
    }
    
    // 3. Validate file sizes
    for (const file of files) {
      const sizeValidation = validateFileSize(file.size, user.tier)
      if (!sizeValidation.valid) {
        console.log(`❌ File too large: ${sizeValidation.error}`)
        const response = NextResponse.json({
          error: 'File Too Large',
          message: sizeValidation.error,
          fileName: file.name,
          maxMB: sizeValidation.maxMB,
          tier: user.tier
        }, { status: 400 })
        return addCorsHeaders(response)
      }
    }
    
    // Create a functional drop that gets stored and can be unearthed
    const dropId = `drop_${Date.now()}_${randomBytes(4).toString('hex')}`
    
    // Hash the secret for storage (case-sensitive)
    const secretHash = createHash('sha256').update(secret.trim()).digest('hex')
    
    // Process uploaded files
    const processedFiles = await Promise.all(
      files.map(async (file, index) => {
        const buffer = await file.arrayBuffer()
        const fileId = `${dropId}_file_${index}`
        
        try {
          // Upload to Firebase Storage (persistent)
          const storagePath = await uploadFileToStorage(
            Buffer.from(buffer),
            file.name,
            file.type,
            dropId
          )
          
          console.log(`✅ Uploaded file to Firebase Storage: ${file.name} (${buffer.byteLength} bytes)`)
          
          return {
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date(),
            storagePath, // Store the Firebase Storage path
            downloadUrl: `/api/drops/${dropId}/files/${file.name}`
          }
        } catch (error) {
          // Fallback to in-memory storage if Firebase fails (for development)
          console.warn(`⚠️ Firebase upload failed, using in-memory storage: ${error}`)
          uploadedFilesStore[fileId] = {
            name: file.name,
            content: Buffer.from(buffer),
            type: file.type
          }
          
          return {
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date(),
            downloadUrl: `/api/drops/${dropId}/files/${file.name}`
          }
        }
      })
    )
    
    // Create the new drop
    const newDrop: FirestoreDrop = {
      id: dropId,
      title,
      description,
      coords: { lat, lng, geohash: `demo_${lat}_${lng}` },
      geofenceRadiusM,
      scope,
      dropType,
      huntCode: huntCode || undefined,
      huntDifficulty: huntDifficulty || undefined,
      retrievalMode,
      tier: user.tier,
      ownerId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: expiresAt || undefined,
      stats: { views: 0, unlocks: 0 },
      files: processedFiles.map(f => ({
        ...f,
        uploadedAt: f.uploadedAt instanceof Date ? f.uploadedAt : new Date(),
      })),
      secretHash // Store for unearth validation
    }
    
    // Save to Firestore
    try {
      await createDrop(newDrop)
      console.log('✅ Drop saved to Firestore:', dropId)
    } catch (firestoreError) {
      console.error('⚠️ Failed to save to Firestore, adding to memory fallback:', firestoreError)
      // Fallback: add to demo storage if Firestore fails
      demoDropsStore.push(newDrop as any)
    }
    
    console.log('Created functional drop:', {
      id: newDrop.id,
      title: newDrop.title,
      dropType: newDrop.dropType,
      huntCode: newDrop.huntCode,
      filesCount: newDrop.files?.length || 0,
      location: `${lat}, ${lng}`,
      canBeUnearthed: true
    })
    
    const successMessage = dropType === 'hunt' 
      ? `Treasure hunt created! Share hunt code "${huntCode}" with participants for proximity hints.`
      : `Drop created successfully! You can now unearth it with the secret phrase.`
    
    const response = NextResponse.json({
      success: true,
      drop: newDrop,
      message: successMessage
    })
    return addCorsHeaders(response)
    
  } catch (error) {
    console.error('Error creating drop:', error)
    const response = NextResponse.json(
      { error: 'Failed to create drop', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}
