import { NextRequest, NextResponse } from 'next/server'
import { demoDropsStore } from '@/lib/demo-storage'
import { createHash } from 'crypto'
import { getDrop, updateDropStats, getDropsNearLocation } from '@/lib/firestore-drops'

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

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/drops/unearth called')
    
    const { coords, secret } = await request.json()
    console.log('Unearth request:', { coords, secret: secret ? '***' : 'none' })
    
    if (!coords || !secret) {
      const response = NextResponse.json(
        { success: false, error: 'Missing coordinates or secret phrase' },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }
    
    const { lat, lng } = coords
    const secretToCheck = secret.trim().toLowerCase()
    
    // Hash the provided secret to compare with stored hashes
    const secretHash = createHash('sha256').update(secretToCheck).digest('hex')
    
    console.log('Looking for drops near:', { lat, lng })
    console.log('Demo drops available:', demoDropsStore.length)
    
    // Check Firestore drops first
    const firestoreDrops = await getDropsNearLocation(lat, lng, 10) // Search within 10km
    console.log(`Found ${firestoreDrops.length} Firestore drops nearby`)
    
    // Combine Firestore drops with demo drops
    const allDrops = [...firestoreDrops, ...demoDropsStore]
    
    // Find drops within geofence
    for (const drop of allDrops) {
      console.log(`Checking drop: ${drop.title} at ${drop.coords.lat}, ${drop.coords.lng}`)
      
      // Calculate distance
      const distance = calculateDistance(
        lat, lng,
        drop.coords.lat, drop.coords.lng
      )
      
      console.log(`Distance to "${drop.title}": ${distance}m (geofence: ${drop.geofenceRadiusM}m)`)
      
      // Check if within geofence
      if (distance <= drop.geofenceRadiusM) {
        console.log('Within geofence! Checking secret...')
        
        // Check secret hash
        if (drop.secretHash === secretHash) {
          console.log('🎉 Secret matches! Unlocking drop:', drop.title)
          
          // Update stats in Firestore if it's a Firestore drop
          const isFirestoreDrop = firestoreDrops.some(fd => fd.id === drop.id)
          if (isFirestoreDrop) {
            try {
              await updateDropStats(drop.id, { unlocks: drop.stats.unlocks + 1 })
            } catch (err) {
              console.error('Failed to update Firestore stats:', err)
            }
          } else {
            // Update in-memory stats for demo drops
            drop.stats.unlocks += 1
          }
          
          // Return success with file information
          const response = NextResponse.json({
            success: true,
            metadata: {
              title: drop.title,
              description: drop.description,
              fileNames: drop.files?.map((f: any) => f.name) || [],
              createdAt: drop.createdAt.toISOString(),
            },
            downloadUrls: drop.files?.map((f: any) => f.downloadUrl) || [],
            distance,
            dropType: drop.dropType,
            huntCode: drop.huntCode,
            message: `Found "${drop.title}"! ${drop.files?.length || 0} file(s) available for download.`
          })
          return addCorsHeaders(response)
        } else {
          console.log('❌ Secret phrase incorrect')
        }
      } else {
        console.log(`Outside geofence (need to be within ${drop.geofenceRadiusM}m)`)
      }
    }
    
    console.log('No matching drops found')
    const response = NextResponse.json({
      success: false,
      error: 'No treasure found at this location with that secret phrase'
    })
    return addCorsHeaders(response)
    
  } catch (error) {
    console.error('Error in unearth:', error)
    const response = NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
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
