import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore'
import { ref, deleteObject, listAll } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { updateDropSchema } from '@/lib/validations'
import { verifyAuthToken } from '@/lib/auth-server'
import type { Drop } from '@/types'

interface RouteParams {
  params: {
    id: string
  }
}

// Get a specific drop
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    
    const dropDoc = await getDoc(doc(db, 'drops', id))
    if (!dropDoc.exists()) {
      return NextResponse.json({ error: 'Drop not found' }, { status: 404 })
    }
    
    const dropData = dropDoc.data() as Omit<Drop, 'id'>
    
    // Only return public information or owner information
    const user = await verifyAuthToken(request)
    const isOwner = user?.uid === dropData.ownerId
    
    if (dropData.scope === 'private' && !isOwner) {
      return NextResponse.json({ error: 'Drop not found' }, { status: 404 })
    }
    
    const publicDrop = {
      id: dropDoc.id,
      title: dropData.title,
      description: dropData.description,
      coords: dropData.coords,
      geofenceRadiusM: dropData.geofenceRadiusM,
      scope: dropData.scope,
      retrievalMode: dropData.retrievalMode,
      tier: dropData.tier,
      createdAt: dropData.createdAt.toDate().toISOString(),
      expiresAt: dropData.expiresAt?.toDate().toISOString(),
      stats: dropData.stats,
      // Only include sensitive info for owner
      ...(isOwner && {
        ownerId: dropData.ownerId,
        storagePath: dropData.storagePath,
      }),
    }
    
    // Increment view count for non-owners
    if (!isOwner) {
      await updateDoc(doc(db, 'drops', id), {
        'stats.views': (dropData.stats.views || 0) + 1,
      })
    }
    
    return NextResponse.json({ drop: publicDrop })
  } catch (error) {
    console.error('Error fetching drop:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update a drop (owner only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyAuthToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = params
    const body = await request.json()
    
    // Validate input
    const validation = updateDropSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }
    
    // Check if drop exists and user owns it
    const dropDoc = await getDoc(doc(db, 'drops', id))
    if (!dropDoc.exists()) {
      return NextResponse.json({ error: 'Drop not found' }, { status: 404 })
    }
    
    const dropData = dropDoc.data() as Omit<Drop, 'id'>
    if (dropData.ownerId !== user.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Prepare update data
    const updateData: any = {
      ...validation.data,
      updatedAt: Timestamp.now(),
    }
    
    // Convert expiresAt to Timestamp if provided
    if (updateData.expiresAt) {
      updateData.expiresAt = Timestamp.fromDate(new Date(updateData.expiresAt))
    }
    
    await updateDoc(doc(db, 'drops', id), updateData)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating drop:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete a drop (owner only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyAuthToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = params
    
    // Check if drop exists and user owns it
    const dropDoc = await getDoc(doc(db, 'drops', id))
    if (!dropDoc.exists()) {
      return NextResponse.json({ error: 'Drop not found' }, { status: 404 })
    }
    
    const dropData = dropDoc.data() as Omit<Drop, 'id'>
    if (dropData.ownerId !== user.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Delete files from storage
    try {
      const storageRef = ref(storage, dropData.storagePath)
      const filesList = await listAll(storageRef)
      
      await Promise.all(
        filesList.items.map(itemRef => deleteObject(itemRef))
      )
    } catch (storageError) {
      console.error('Error deleting files from storage:', storageError)
      // Continue with document deletion even if storage cleanup fails
    }
    
    // Delete the document
    await deleteDoc(doc(db, 'drops', id))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting drop:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
