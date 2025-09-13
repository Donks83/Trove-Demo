import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth-server'
import { randomBytes, createHash } from 'crypto'
import { demoDropsStore, uploadedFilesStore } from '@/lib/demo-storage'

export async function GET(request: NextRequest) {
  try {
    console.log('API route called with:', request.url)
    
    // Return drops from our demo storage
    console.log('Returning drops from storage:', demoDropsStore.length)
    return NextResponse.json({ drops: demoDropsStore })
    
  } catch (error) {
    console.error('Error in drops API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
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
      return NextResponse.json(
        { error: 'No auth token' },
        { status: 401 }
      )
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
      huntCode,
      huntDifficulty,
      retrievalMode,
      filesCount: files.length
    })
    
    // Create a functional drop that gets stored and can be unearthed
    const dropId = `drop_${Date.now()}_${randomBytes(4).toString('hex')}`
    
    // Hash the secret for storage (simplified for demo)
    const secretHash = createHash('sha256').update(secret.trim().toLowerCase()).digest('hex')
    
    // Process uploaded files
    const processedFiles = await Promise.all(
      files.map(async (file, index) => {
        const buffer = await file.arrayBuffer()
        const fileId = `${dropId}_file_${index}`
        
        // Store file content in memory for demo
        uploadedFilesStore[fileId] = {
          name: file.name,
          content: Buffer.from(buffer),
          type: file.type
        }
        
        console.log(`Stored file: ${file.name} (${buffer.byteLength} bytes)`)
        
        return {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
          downloadUrl: `/api/drops/${dropId}/files/${file.name}`
        }
      })
    )
    
    // Create the new drop
    const newDrop = {
      id: dropId,
      title,
      description,
      coords: { lat, lng, geohash: `demo_${lat}_${lng}` },
      geofenceRadiusM,
      scope,
      dropType,
      huntCode,
      huntDifficulty,
      retrievalMode,
      tier: user.tier,
      ownerId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt,
      stats: { views: 0, unlocks: 0 },
      files: processedFiles,
      secretHash // Store for unearth validation
    }
    
    // Add to our demo storage
    demoDropsStore.push(newDrop)
    
    console.log('Created functional drop:', {
      id: newDrop.id,
      title: newDrop.title,
      dropType: newDrop.dropType,
      huntCode: newDrop.huntCode,
      filesCount: newDrop.files.length,
      location: `${lat}, ${lng}`,
      canBeUnearthed: true
    })
    
    const successMessage = dropType === 'hunt' 
      ? `Treasure hunt created! Share hunt code "${huntCode}" with participants for proximity hints.`
      : `Drop created successfully! You can now unearth it with the secret phrase.`
    
    return NextResponse.json({
      success: true,
      drop: newDrop,
      message: successMessage
    })
    
  } catch (error) {
    console.error('Error creating drop:', error)
    return NextResponse.json(
      { error: 'Failed to create drop', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
