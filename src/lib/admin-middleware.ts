import { NextRequest } from 'next/server'
import { verifyAuthToken } from '@/lib/auth-server'
import { getFirestore } from 'firebase-admin/firestore'
import { initAdmin } from '@/lib/firebase-admin'

export async function requireAdmin(request: NextRequest) {
  // Verify auth token
  const user = await verifyAuthToken(request)
  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }

  // Check admin status
  try {
    initAdmin()
    const db = getFirestore()
    const userDoc = await db.collection('users').doc(user.uid).get()
    
    if (!userDoc.exists) {
      return { error: 'User not found', status: 404 }
    }

    const userData = userDoc.data()
    if (!userData?.isAdmin) {
      return { error: 'Admin access required', status: 403 }
    }

    return { user: { ...user, isAdmin: true }, status: 200 }
  } catch (error) {
    console.error('Admin check error:', error)
    return { error: 'Internal server error', status: 500 }
  }
}
