import { NextRequest, NextResponse } from 'next/server'
import { getDrop, updateDropStats } from '@/lib/firestore-drops'
import { demoDropsStore } from '@/lib/demo-storage'
import { verifyAuthToken } from '@/lib/auth-server'
import { createHash } from 'crypto'

interface RouteContext {
  params: {
    dropId: string
  }
}

// Add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}

// Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3
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

// Unlock a specific drop by ID (used after disambiguation)
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { dropId } = params
    const { secret, coords } = await request.json()

    console.log(`🔓 Unlocking specific drop: ${dropId}`)

    // Verify user
    const user = await verifyAuthToken(request)

    if (!secret) {
      const response = NextResponse.json(
        { success: false, error: 'Secret phrase is required' },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    // Hash the secret
    const secretHash = createHash('sha256').update(secret.trim().toLowerCase()).digest('hex')

    // Get the drop from Firestore or demo storage
    let drop = await getDrop(dropId)
    if (!drop) {
      drop = demoDropsStore.find(d => d.id === dropId)
    }

    if (!drop) {
      const response = NextResponse.json(
        { success: false, error: 'Drop not found' },
        { status: 404 }
      )
      return addCorsHeaders(response)
    }

    // Verify secret matches
    if (drop.secretHash !== secretHash) {
      const response = NextResponse.json(
        { success: false, error: 'Invalid secret phrase' },
        { status: 403 }
      )
      return addCorsHeaders(response)
    }

    // Privacy check
    if (drop.scope === 'private') {
      if (!user || user.uid !== drop.ownerId) {
        const response = NextResponse.json(
          { success: false, error: 'Access denied - private drop' },
          { status: 403 }
        )
        return addCorsHeaders(response)
      }
    }

    // Location check
    if (coords && drop.coords) {
      const distance = calculateDistance(
        coords.lat, coords.lng,
        drop.coords.lat, drop.coords.lng
      )

      if (distance > drop.geofenceRadiusM) {
        const response = NextResponse.json({
          success: false,
          error: 'Too far away',
          message: `You need to be within ${drop.geofenceRadiusM}m of the drop location.`,
          distance: Math.round(distance),
          required: drop.geofenceRadiusM
        }, { status: 403 })
        return addCorsHeaders(response)
      }
    }

    // Update stats
    const isFirestoreDrop = !demoDropsStore.find(d => d.id === dropId)
    if (isFirestoreDrop) {
      try {
        await updateDropStats(dropId, { unlocks: drop.stats.unlocks + 1 })
      } catch (err) {
        console.error('Failed to update stats:', err)
      }
    } else {
      drop.stats.unlocks += 1
    }

    // Calculate distance for response
    const distance = coords ? calculateDistance(
      coords.lat, coords.lng,
      drop.coords.lat, drop.coords.lng
    ) : null

    // Return success
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

  } catch (error) {
    console.error('Error unlocking drop:', error)
    const response = NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}
