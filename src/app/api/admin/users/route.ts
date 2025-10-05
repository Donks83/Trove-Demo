import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-middleware'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeFirebaseAdmin } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const adminCheck = await requireAdmin(request)
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      )
    }

    initializeFirebaseAdmin()
    const db = getFirestore()

    // Get all users
    const usersSnapshot = await db.collection('users').get()
    
    // Get drop counts for each user
    const users = await Promise.all(
      usersSnapshot.docs.map(async (doc) => {
        const userData = doc.data()
        
        // Count drops for this user
        const dropsSnapshot = await db
          .collection('drops')
          .where('ownerId', '==', doc.id)
          .count()
          .get()

        return {
          uid: doc.id,
          email: userData.email,
          displayName: userData.displayName,
          tier: userData.tier || 'free',
          isAdmin: userData.isAdmin || false,
          createdAt: userData.createdAt,
          dropCount: dropsSnapshot.data().count,
        }
      })
    )

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
