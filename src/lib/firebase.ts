import { initializeApp, getApps } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)

// Connect to emulators in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Only run emulator connection in browser and development
  const emulatorHost = 'localhost'
  
  console.log('Connecting to Firebase emulators...')
  
  try {
    connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true })
    console.log('✅ Connected to Auth emulator')
  } catch (error) {
    console.log('Auth emulator already connected or failed:', error.message)
  }
  
  try {
    connectFirestoreEmulator(db, emulatorHost, 8081)
    console.log('✅ Connected to Firestore emulator')
  } catch (error) {
    console.log('Firestore emulator already connected or failed:', error.message)
  }
  
  try {
    connectStorageEmulator(storage, emulatorHost, 9199)
    console.log('✅ Connected to Storage emulator')
  } catch (error) {
    console.log('Storage emulator already connected or failed:', error.message)
  }
  
  try {
    connectFunctionsEmulator(functions, emulatorHost, 5001)
    console.log('✅ Connected to Functions emulator')
  } catch (error) {
    console.log('Functions emulator already connected or failed:', error.message)
  }
}

export { app }
