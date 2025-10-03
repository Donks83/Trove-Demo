import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth-server'
import { getDrops } from '@/lib/firestore-drops'

// Force this route to be dynamic (not statically rendered)
export const dynamic = 'force-dynamic'

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
    
    // Query Firestore for drops owned by this user
    const userDrops = await getDrops({ ownerId: user.uid })
    
    console.log(`✅ Found ${userDrops.length} drops for user ${user.uid}`)
    
    // Convert Firestore Timestamps to serializable format
    const serializedDrops = userDrops.map(drop => ({
      ...drop,
      createdAt: drop.createdAt.toISOString(),
      updatedAt: drop.updatedAt.toISOString(),
      expiresAt: drop.expiresAt?.toISOString() || null,
    }))
    
    return NextResponse.json({
      success: true,
      drops: serializedDrops
    })
    
  } catch (error) {
    console.error('Error fetching user drops:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user drops', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
