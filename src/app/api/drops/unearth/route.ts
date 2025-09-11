import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth-server'
import { createHash } from 'crypto'
import { demoDropsStore } from '@/lib/demo-storage'

// Helper function to calculate distance between two coordinates (Haversine formula)
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

  return R * c // Distance in meters
}

// Helper function to hash secret phrases consistently
function hashSecret(secret: string): string {
  return createHash('sha256').update(secret.trim().toLowerCase()).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/drops/unearth called')
    
    // Verify authentication
    const user = await verifyAuthToken(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { coords, secret } = body

    // Validate input
    if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
      return NextResponse.json(
        { error: 'Valid coordinates required' },
        { status: 400 }
      )
    }

    if (!secret || typeof secret !== 'string' || secret.trim().length === 0) {
      return NextResponse.json(
        { error: 'Secret phrase required' },
        { status: 400 }
      )
    }

    console.log('Searching for drops near:', coords)
    
    // Hash the provided secret for comparison
    const providedSecretHash = hashSecret(secret)
    
    // Find drops within radius that match the secret
    const foundDrop = demoDropsStore.find(drop => {
      // Calculate distance between unearth location and drop location
      const distance = calculateDistance(
        coords.lat, 
        coords.lng, 
        drop.coords.lat, 
        drop.coords.lng
      )
      
      console.log(`Drop ${drop.id}: distance=${distance}m, radius=${drop.geofenceRadiusM}m, secretMatch=${drop.secretHash === providedSecretHash}`)
      
      // Check if within radius and secret matches
      const withinRadius = distance <= drop.geofenceRadiusM
      const secretMatches = drop.secretHash === providedSecretHash
      
      return withinRadius && secretMatches
    })

    if (!foundDrop) {
      console.log('No matching drop found')
      return NextResponse.json(
        { 
          success: false,
          error: 'No files found at this location with that secret phrase. Try getting closer or check your secret phrase.' 
        },
        { status: 404 }
      )
    }

    console.log('Found matching drop:', foundDrop.id)

    // For physical drops, we might want to add additional GPS verification here
    if (foundDrop.retrievalMode === 'physical') {
      console.log('Physical drop - additional verification could be added here')
      // In production, you might want to verify the user's actual GPS location
      // rather than just the pin placement
    }

    // Increment unlock stats (in production this would update the database)
    foundDrop.stats.unlocks += 1

    // Calculate the distance for response
    const distance = calculateDistance(
      coords.lat, 
      coords.lng, 
      foundDrop.coords.lat, 
      foundDrop.coords.lng
    )

    // Return success with file information in UnlockDropResponse format
    return NextResponse.json({
      success: true,
      downloadUrls: foundDrop.files.map((file: any) => file.downloadUrl),
      metadata: {
        title: foundDrop.title,
        description: foundDrop.description,
        fileNames: foundDrop.files.map((file: any) => file.name),
        createdAt: foundDrop.createdAt.toISOString()
      },
      distance,
      message: `🎉 Files unearthed! Found ${foundDrop.files.length} file(s) in "${foundDrop.title}"`
    })

  } catch (error) {
    console.error('Error in unearth API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
