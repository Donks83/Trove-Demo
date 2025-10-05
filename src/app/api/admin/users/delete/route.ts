import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-middleware'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { initializeFirebaseAdmin } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    // Check admin access
    const adminCheck = await requireAdmin(request)
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      )
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    initializeFirebaseAdmin()
    const db = getFirestore()
    const auth = getAuth()

    // Delete user's drops first
    const dropsSnapshot = await db.collection('drops').where('ownerId', '==', userId).get()
    const batch = db.batch()
    dropsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })
    await batch.commit()

    // Delete user document
    await db.collection('users').doc(userId).delete()

    // Delete Firebase Auth user
    try {
      await auth.deleteUser(userId)
    } catch (authError) {
      console.error('Error deleting auth user:', authError)
      // Continue even if auth deletion fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
