import { NextRequest, NextResponse } from 'next/server'
import { demoDropsStore } from '@/lib/demo-storage'
import { createHash } from 'crypto'
import { getDrop, updateDropStats, getDropsNearLocation } from '@/lib/firestore-drops'
import { verifyAuthToken } from '@/lib/auth-server'

// Add CORS headers for mobile app
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

// Handle preflight requests
export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/drops/unearth called')
    
    const { coords, secret } = await request.json()
    console.log('Unearth request:', { coords, secret: secret ? '***' : 'none' })
    
    if (!secret) {
      const response = NextResponse.json(
        { success: false, error: 'Secret phrase is required' },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }
    
    // Verify user (optional but recommended for private drops)
    const user = await verifyAuthToken(request)
    
    const secretToCheck = secret.trim().toLowerCase()
    
    // Hash the provided secret to compare with stored hashes
    const secretHash = createHash('sha256').update(secretToCheck).digest('hex')
    
    console.log('Looking for drops near:', coords || 'no location provided')
    console.log('Demo drops available:', demoDropsStore.length)
    
    // Get drops from both sources
    let allDrops: any[] = [...demoDropsStore]
    
    // If coordinates provided, search nearby in Firestore
    if (coords && coords.lat && coords.lng) {
      const { lat, lng } = coords
      const firestoreDrops = await getDropsNearLocation(lat, lng, 10) // Search within 10km
      console.log(`Found ${firestoreDrops.length} Firestore drops nearby`)
      allDrops = [...firestoreDrops, ...demoDropsStore]
    } else {
      // No coords provided - can only unlock remote drops
      // Still get all Firestore drops (inefficient but works for demo)
      console.log('No coordinates provided - only remote drops can be unlocked')
    }
    
    // Find matching drops
    for (const drop of allDrops) {
      console.log(`Checking drop: ${drop.title} (${drop.dropType}, ${drop.retrievalMode})`)
      
      // Check secret first (fastest check)
      if (drop.secretHash !== secretHash) {
        continue // Wrong secret, skip this drop
      }
      
      console.log('✅ Secret matches!')
      
      // ============================================
      // SCOPE/PRIVACY CHECK
      // ============================================
      if (drop.scope === 'private') {
        // Private drops can only be unlocked by owner
        if (!user || user.uid !== drop.ownerId) {
          console.log('❌ Private drop - user is not the owner')
          continue // Skip this drop
        }
        console.log('✅ Private drop - user is owner')
      }
      
      // ============================================
      // RETRIEVAL MODE CHECK
      // ============================================
      if (drop.retrievalMode === 'physical') {
        // Physical mode requires location
        if (!coords || !coords.lat || !coords.lng) {
          console.log('❌ Physical drop requires location')
          const response = NextResponse.json({
            success: false,
            error: 'Location Required',
            message: 'This drop requires physical presence. Please enable location services and try again.',
            dropType: drop.dropType,
            retrievalMode: 'physical'
          })
          return addCorsHeaders(response)
        }
        
        // Calculate distance
        const distance = calculateDistance(
          coords.lat, coords.lng,
          drop.coords.lat, drop.coords.lng
        )
        
        console.log(`Distance to drop: ${Math.round(distance)}m (geofence: ${drop.geofenceRadiusM}m)`)
        
        // Check if within geofence
        if (distance > drop.geofenceRadiusM) {
          console.log(`❌ Too far away: ${Math.round(distance)}m > ${drop.geofenceRadiusM}m`)
          const response = NextResponse.json({
            success: false,
            error: 'Too Far Away',
            message: `You're ${Math.round(distance)}m from this drop. You need to be within ${drop.geofenceRadiusM}m to unlock it.`,
            distance: Math.round(distance),
            required: drop.geofenceRadiusM,
            dropType: drop.dropType,
            retrievalMode: 'physical',
            hint: distance < drop.geofenceRadiusM * 2 ? 'You\'re getting close!' : 'Keep moving towards the location'
          })
          return addCorsHeaders(response)
        }
        
        console.log('✅ Within geofence for physical drop')
      } else {
        // Remote mode - no location check needed
        console.log('✅ Remote drop - no location validation required')
      }
      
      // ============================================
      // SUCCESS - UNLOCK THE DROP
      // ============================================
      console.log('🎉 All checks passed! Unlocking drop:', drop.title)
      
      // Calculate distance if coords provided (for stats)
      const distance = coords ? calculateDistance(
        coords.lat, coords.lng,
        drop.coords.lat, drop.coords.lng
      ) : null
      
      // Update stats
      const isFirestoreDrop = !demoDropsStore.find(d => d.id === drop.id)
      if (isFirestoreDrop) {
        try {
          await updateDropStats(drop.id, { unlocks: drop.stats.unlocks + 1 })
        } catch (err) {
          console.error('Failed to update Firestore stats:', err)
        }
      } else {
        drop.stats.unlocks += 1
      }
      
      // Return success with file information
      const response = NextResponse.json({
        success: true,
        metadata: {
          title: drop.title,
          description: drop.description,
          fileNames: drop.files?.map((f: any) => f.name) || [],
          createdAt: drop.createdAt instanceof Date ? drop.createdAt.toISOString() : drop.createdAt.toISOString(),
        },
        downloadUrls: drop.files?.map((f: any) => f.downloadUrl) || [],
        distance: distance ? Math.round(distance) : undefined,
        dropType: drop.dropType,
        retrievalMode: drop.retrievalMode,
        huntCode: drop.huntCode,
        message: `Found "${drop.title}"! ${drop.files?.length || 0} file(s) available for download.`
      })
      return addCorsHeaders(response)
    }
    
    // No matching drops found
    console.log('❌ No matching drops found')
    
    const response = NextResponse.json({
      success: false,
      error: 'No Drop Found',
      message: coords 
        ? 'No treasure found at this location with that secret phrase. Check your location and secret, or try a different spot.'
        : 'No drop found with that secret phrase. Location may be required for physical drops.'
    })
    return addCorsHeaders(response)
    
  } catch (error) {
    console.error('Error in unearth:', error)
    const response = NextResponse.json(
      { success: false, error: 'Internal server error', message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}
