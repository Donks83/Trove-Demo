import { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import type { User } from '@/types'

// Initialize Firebase Admin
if (getApps().length === 0) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Initializing Firebase Admin for development/emulator mode')
    // For development with emulators, initialize with minimal config
    initializeApp({
      projectId: projectId || 'trove-9e659',
    })
    
    // Set emulator environment variables for admin SDK
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081'
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
    process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199'
    
  } else if (!privateKey || !clientEmail || !projectId) {
    console.warn('Firebase Admin credentials not found, using emulator mode')
    // In development with emulator, we can skip admin initialization
  } else {
    console.log('Initializing Firebase Admin for production')
    initializeApp({
      credential: cert({
        privateKey,
        clientEmail,
        projectId,
      }),
      projectId,
    })
  }
}

const adminAuth = getApps().length > 0 ? getAuth() : null
const adminDb = getApps().length > 0 ? getFirestore() : null

export async function verifyAuthToken(request: NextRequest): Promise<User | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }
    
    const token = authHeader.split('Bearer ')[1]
    if (!token) {
      return null
    }
    
    console.log('Verifying token:', token.substring(0, 20) + '...')
    
    // In development with emulator, we can bypass token verification
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: bypassing Firebase Admin auth')
      
      // Handle development fallback tokens
      if (token.startsWith('dev-token-')) {
        console.log('Processing development fallback token')
        const parts = token.split('-')
        const uid = parts.length > 2 ? parts[2] : 'dev-user'
        return {
          uid,
          email: 'dev@example.com',
          displayName: 'Development User',
          tier: 'free',
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
        }
      }
      
      // Extract user info from JWT token (basic implementation for emulator)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        console.log('Token payload:', payload)
        return {
          uid: payload.sub || payload.user_id || 'dev-user-' + Date.now(),
          email: payload.email || 'dev@example.com',
          displayName: payload.name || 'Development User',
          tier: 'free',
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
        }
      } catch (parseError) {
        console.error('Error parsing token in dev mode:', parseError)
        // Final fallback for development
        return {
          uid: 'dev-fallback-user',
          email: 'dev-fallback@example.com',
          displayName: 'Development Fallback User',
          tier: 'free',
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
        }
      }
    }
    
    if (!adminAuth || !adminDb) {
      throw new Error('Firebase Admin not initialized')
    }
    
    // Verify the token
    const decodedToken = await adminAuth.verifyIdToken(token)
    
    // Get user document from Firestore
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get()
    
    if (!userDoc.exists) {
      return null
    }
    
    const userData = userDoc.data() as User
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || userData.email,
      displayName: decodedToken.name || userData.displayName,
      photoURL: decodedToken.picture || userData.photoURL,
      tier: userData.tier,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    }
  } catch (error) {
    console.error('Error verifying auth token:', error)
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<User> {
  const user = await verifyAuthToken(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}
