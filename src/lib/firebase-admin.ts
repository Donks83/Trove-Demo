import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app'

// Singleton pattern - only initialize once
let isInitialized = false

export function initAdmin() {
  if (isInitialized || getApps().length > 0) {
    return getApps()[0]
  }

  try {
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    
    if (!storageBucket) {
      throw new Error('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable is not set')
    }

    // For production: Use service account JSON
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ) as ServiceAccount

      const app = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: storageBucket,
      })

      isInitialized = true
      console.log('✅ Firebase Admin initialized with service account')
      console.log('📦 Storage bucket:', storageBucket)
      return app
    }

    // For development: Use application default credentials or emulator
    const app = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: storageBucket,
    })

    isInitialized = true
    console.log('✅ Firebase Admin initialized with default credentials')
    console.log('📦 Storage bucket:', storageBucket)
    return app
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error)
    throw error
  }
}
