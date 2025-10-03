import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth-server'
import { getDrop, deleteDrop, updateDrop, updateDropStats } from '@/lib/firestore-drops'
import { deleteDropFiles } from '@/lib/firebase-storage'
import { createHash } from 'crypto'

// Force this route to be dynamic (not statically rendered)
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: {
    dropId: string
  }
}

// Add CORS headers for mobile app
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

// Handle preflight requests
export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}

// Get a specific drop
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { dropId } = params
    
    const drop = await getDrop(dropId)
    if (!drop) {
      const response = NextResponse.json({ error: 'Drop not found' }, { status: 404 })
      return addCorsHeaders(response)
    }
    
    // Only return public information or owner information
    const user = await verifyAuthToken(request)
    const isOwner = user?.uid === drop.ownerId
    
    if (drop.scope === 'private' && !isOwner) {
      const response = NextResponse.json({ error: 'Drop not found' }, { status: 404 })
      return addCorsHeaders(response)
    }
    
    const publicDrop = {
      id: drop.id,
      title: drop.title,
      description: drop.description,
      coords: drop.coords,
      geofenceRadiusM: drop.geofenceRadiusM,
      scope: drop.scope,
      dropType: drop.dropType,
      retrievalMode: drop.retrievalMode,
      tier: drop.tier,
      createdAt: drop.createdAt.toISOString(),
      expiresAt: drop.expiresAt?.toISOString(),
      stats: drop.stats,
      files: drop.files,
      // Only include sensitive info for owner
      ...(isOwner && {
        ownerId: drop.ownerId,
        huntCode: drop.huntCode,
      }),
    }
    
    // Increment view count for non-owners
    if (!isOwner) {
      await updateDropStats(dropId, { views: (drop.stats.views || 0) + 1 })
    }
    
    const response = NextResponse.json({ drop: publicDrop })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Error fetching drop:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

// Delete a drop (owner only)
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    console.log('DELETE /api/drops/[dropId] called for:', params.dropId)
    
    const user = await verifyAuthToken(request)
    if (!user) {
      console.log('No valid auth token')
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return addCorsHeaders(response)
    }
    
    const { dropId } = params
    
    // Check if drop exists and user owns it
    const drop = await getDrop(dropId)
    if (!drop) {
      console.log('Drop not found:', dropId)
      const response = NextResponse.json({ error: 'Drop not found' }, { status: 404 })
      return addCorsHeaders(response)
    }
    
    if (drop.ownerId !== user.uid) {
      console.log('User does not own this drop:', user.uid, 'vs', drop.ownerId)
      const response = NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      return addCorsHeaders(response)
    }
    
    // Delete files from storage
    try {
      console.log('Deleting files for drop:', dropId)
      await deleteDropFiles(dropId)
    } catch (storageError) {
      console.error('Error deleting files from storage:', storageError)
      // Continue with document deletion even if storage cleanup fails
    }
    
    // Delete the document from Firestore
    await deleteDrop(dropId)
    
    console.log('✅ Drop deleted successfully:', dropId)
    const response = NextResponse.json({ success: true })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Error deleting drop:', error)
    const response = NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

// Update a drop (owner only)
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    console.log('PATCH /api/drops/[dropId] called for:', params.dropId)
    
    const user = await verifyAuthToken(request)
    if (!user) {
      console.log('No valid auth token')
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return addCorsHeaders(response)
    }
    
    const { dropId } = params
    const body = await request.json()
    
    console.log('Update request body:', body)
    
    // Check if drop exists and user owns it
    const drop = await getDrop(dropId)
    if (!drop) {
      console.log('Drop not found:', dropId)
      const response = NextResponse.json({ error: 'Drop not found' }, { status: 404 })
      return addCorsHeaders(response)
    }
    
    if (drop.ownerId !== user.uid) {
      console.log('User does not own this drop:', user.uid, 'vs', drop.ownerId)
      const response = NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      return addCorsHeaders(response)
    }
    
    // Prepare update data
    const updateData: {
      title?: string
      description?: string
      secretHash?: string
    } = {}
    
    if (body.title !== undefined) {
      updateData.title = body.title.trim()
    }
    
    if (body.description !== undefined) {
      updateData.description = body.description.trim()
    }
    
    // If updating secret, hash it
    if (body.secret !== undefined && body.secret.trim() !== '') {
      const secretHash = createHash('sha256').update(body.secret.trim().toLowerCase()).digest('hex')
      updateData.secretHash = secretHash
      console.log('✅ Secret phrase will be updated')
    }
    
    // Update the drop in Firestore
    await updateDrop(dropId, updateData)
    
    console.log('✅ Drop updated successfully:', dropId)
    const response = NextResponse.json({ 
      success: true,
      message: 'Drop updated successfully'
    })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Error updating drop:', error)
    const response = NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}
