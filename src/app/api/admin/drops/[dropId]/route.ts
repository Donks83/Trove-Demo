import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-middleware'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { initAdmin } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { dropId: string } }
) {
  try {
    // Check admin access
    const adminCheck = await requireAdmin(request)
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      )
    }

    const { dropId } = params

    if (!dropId) {
      return NextResponse.json(
        { error: 'Missing dropId' },
        { status: 400 }
      )
    }

    initAdmin()
    const db = getFirestore()
    const storage = getStorage()

    // Get drop data to find files
    const dropDoc = await db.collection('drops').doc(dropId).get()
    
    if (!dropDoc.exists) {
      return NextResponse.json(
        { error: 'Drop not found' },
        { status: 404 }
      )
    }

    const dropData = dropDoc.data()

    // Delete files from storage
    if (dropData?.files && dropData.files.length > 0) {
      const bucket = storage.bucket()
      
      for (const file of dropData.files) {
        if (file.storagePath) {
          try {
            await bucket.file(file.storagePath).delete()
          } catch (error) {
            console.error(`Error deleting file ${file.storagePath}:`, error)
            // Continue deleting other files even if one fails
          }
        }
      }
    }

    // Delete drop document
    await db.collection('drops').doc(dropId).delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting drop:', error)
    return NextResponse.json(
      { error: 'Failed to delete drop' },
      { status: 500 }
    )
  }
}
