import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth-server'
import { demoDropsStore } from '@/lib/demo-storage'
import type { JoinHuntByCodeRequest, JoinHuntByCodeResponse } from '@/types'
import { isValidHuntCode } from '@/lib/hunt-permissions'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' } as JoinHuntByCodeResponse,
        { status: 401 }
      )
    }
    const body: JoinHuntByCodeRequest = await request.json()
    
    if (!body.huntCode || !isValidHuntCode(body.huntCode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid hunt code format' } as JoinHuntByCodeResponse,
        { status: 400 }
      )
    }

    // Find the drop with this hunt code in demo storage
    const huntDrop = demoDropsStore.find(drop => 
      drop.huntCode === body.huntCode && drop.dropType === 'hunt'
    )

    if (!huntDrop) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Hunt not found',
          message: 'No active hunt found with this code'
        } as JoinHuntByCodeResponse,
        { status: 404 }
      )
    }

    // Check if hunt has expired
    if (huntDrop.expiresAt && new Date(huntDrop.expiresAt) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hunt expired',
          message: 'This treasure hunt has expired'
        } as JoinHuntByCodeResponse,
        { status: 410 }
      )
    }

    // For demo purposes, simulate successful join
    // In production, this would update the user's joinedHunts array in the database
    console.log(`User ${user.uid} joining hunt with code: ${body.huntCode}`)

    // Simulate updating drop stats
    huntDrop.stats = {
      ...huntDrop.stats,
      views: (huntDrop.stats?.views || 0) + 1,
      lastAccessedAt: new Date()
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully joined the hunt!',
        drop: {
          id: huntDrop.id,
          title: huntDrop.title,
          description: huntDrop.description,
          difficulty: huntDrop.huntDifficulty || 'intermediate'
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
