import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app'

// Singleton pattern - only initialize once
let isInitialized = false

export function initAdmin() {
  if (isInitialized || getApps().length > 0) {
    return getApps()[0]
  }

  try {
    // For production: Use service account JSON
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ) as ServiceAccount

      const app = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      })

      isInitialized = true
      console.log('✅ Firebase Admin initialized with service account')
      return app
    }

    // For development: Use application default credentials or emulator
    const app = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })

    isInitialized = true
    console.log('✅ Firebase Admin initialized with default credentials')
    return app
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error)
    throw error
  }
}
