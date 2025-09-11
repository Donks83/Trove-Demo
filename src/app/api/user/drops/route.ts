import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/user/drops called')
    
    // Verify authentication
    const user = await verifyAuthToken(request)
    if (!user) {
      console.log('No valid auth token found')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    console.log('Authenticated user for drops fetch:', user.uid)
    
    // For now, return mock drops for this user
    // In production, this would query Firestore for drops where ownerId === user.uid
    const mockUserDrops = [
      {
        id: `user-drop-1-${user.uid}`,
        title: 'My First Drop',
        description: 'A test drop I created',
        coords: { lat: 51.5074, lng: -0.1278, geohash: 'gcpvj0' },
        geofenceRadiusM: 100,
        scope: 'public',
        retrievalMode: 'remote',
        tier: user.tier,
        ownerId: user.uid,
        createdAt: { toDate: () => new Date() },
        stats: { views: 5, unlocks: 2 },
        files: [
          { name: 'test-file.txt', size: 1024, type: 'text/plain' }
        ]
      },
      {
        id: `user-drop-2-${user.uid}`,
        title: 'Photo Archive',
        description: 'Family photos from vacation',
        coords: { lat: 51.5155, lng: -0.1425, geohash: 'gcpvn0' },
        geofenceRadiusM: 50,
        scope: 'private',
        retrievalMode: 'physical',
        tier: user.tier,
        ownerId: user.uid,
        createdAt: { toDate: () => new Date(Date.now() - 86400000) }, // 1 day ago
        expiresAt: { toDate: () => new Date(Date.now() + 30 * 86400000) }, // 30 days from now
        stats: { views: 12, unlocks: 8 },
        files: [
          { name: 'vacation-1.jpg', size: 2048576, type: 'image/jpeg' },
          { name: 'vacation-2.jpg', size: 1856432, type: 'image/jpeg' }
        ]
      }
    ]
    
    console.log('Returning mock user drops:', mockUserDrops.length, 'drops')
    
    return NextResponse.json({
      success: true,
      drops: mockUserDrops
    })
    
  } catch (error) {
    console.error('Error fetching user drops:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user drops', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
