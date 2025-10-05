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

    // Get all drops
    const dropsSnapshot = await db.collection('drops').orderBy('createdAt', 'desc').get()
    
    // Get owner email for each drop
    const drops = await Promise.all(
      dropsSnapshot.docs.map(async (doc) => {
        const dropData = doc.data()
        
        // Get owner email
        let ownerEmail = 'Unknown'
        try {
          const ownerDoc = await db.collection('users').doc(dropData.ownerId).get()
          if (ownerDoc.exists) {
            ownerEmail = ownerDoc.data()?.email || 'Unknown'
          }
        } catch (error) {
          console.error('Error fetching owner:', error)
        }

        return {
          id: doc.id,
          ...dropData,
          ownerEmail,
        }
      })
    )

    return NextResponse.json({ drops })
  } catch (error) {
    console.error('Error fetching drops:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drops' },
      { status: 500 }
    )
  }
}
