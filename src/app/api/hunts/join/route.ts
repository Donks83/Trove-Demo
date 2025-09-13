import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase'
import { verifyAuthToken } from '@/lib/auth-server'
import type { JoinHuntByCodeRequest, JoinHuntByCodeResponse } from '@/types'
import { isValidHuntCode } from '@/lib/hunt-permissions'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuthToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' } as JoinHuntByCodeResponse,
        { status: 401 }
      )
    }

    const user = authResult.user
    const body: JoinHuntByCodeRequest = await request.json()
    
    if (!body.huntCode || !isValidHuntCode(body.huntCode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid hunt code format' } as JoinHuntByCodeResponse,
        { status: 400 }
      )
    }

    // Find the drop with this hunt code
    const dropsRef = adminDb.collection('drops')
    const huntQuery = await dropsRef
      .where('huntCode', '==', body.huntCode)
      .where('dropType', '==', 'hunt')
      .limit(1)
      .get()

    if (huntQuery.empty) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Hunt not found',
          message: 'No active hunt found with this code'
        } as JoinHuntByCodeResponse,
        { status: 404 }
      )
    }

    const huntDrop = huntQuery.docs[0]
    const huntData = huntDrop.data()

    // Check if hunt has expired
    if (huntData.expiresAt && huntData.expiresAt.toDate() < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hunt expired',
          message: 'This treasure hunt has expired'
        } as JoinHuntByCodeResponse,
        { status: 410 }
      )
    }

    // Get user document
    const userRef = adminDb.collection('users').doc(user.uid)
    const userDoc = await userRef.get()
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'User not found' } as JoinHuntByCodeResponse,
        { status: 404 }
      )
    }

    const userData = userDoc.data()
    const currentJoinedHunts = userData?.joinedHunts || []

    // Check if already joined this hunt
    if (currentJoinedHunts.includes(body.huntCode)) {
      return NextResponse.json(
        {
          success: true,
          message: 'Already joined this hunt!',
          drop: {
            id: huntDrop.id,
            title: huntData.title,
            description: huntData.description,
            difficulty: huntData.huntDifficulty || 'intermediate'
          }
        } as JoinHuntByCodeResponse,
        { status: 200 }
      )
    }

    // Add hunt code to user's joined hunts
    await userRef.update({
      joinedHunts: [...currentJoinedHunts, body.huntCode],
      updatedAt: new Date()
    })

    // Increment drop stats (optional)
    await huntDrop.ref.update({
      'stats.views': (huntData.stats?.views || 0) + 1,
      'stats.lastAccessedAt': new Date()
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully joined the hunt!',
        drop: {
          id: huntDrop.id,
          title: huntData.title,
          description: huntData.description,
          difficulty: huntData.huntDifficulty || 'intermediate'
        }
      } as JoinHuntByCodeResponse,
      { status: 200 }
    )

  } catch (error) {
    console.error('Error joining hunt:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Failed to join hunt. Please try again.'
      } as JoinHuntByCodeResponse,
      { status: 500 }
    )
  }
}
