#!/usr/bin/env tsx

import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc, collection, addDoc, Timestamp } from 'firebase/firestore'
import { getStorage, ref, uploadBytes } from 'firebase/storage'
import bcrypt from 'bcryptjs'
import { createCoordinates } from '../src/lib/geo'
import type { User, Drop } from '../src/types'

// Initialize Firebase (use emulator in development)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Demo users
const DEMO_USERS = [
  {
    email: 'alice@trove.demo',
    password: 'demo123456',
    displayName: 'Alice Explorer',
    tier: 'free' as const,
  },
  {
    email: 'bob@trove.demo',
    password: 'demo123456',
    displayName: 'Bob Premium',
    tier: 'premium' as const,
  },
  {
    email: 'charlie@trove.demo',
    password: 'demo123456',
    displayName: 'Charlie Business',
    tier: 'business' as const,
  },
]

// Demo drops data
const DEMO_DROPS = [
  {
    title: 'Welcome Package',
    description: 'Getting started guide and sample files for new Trove users',
    secret: 'welcome123',
    coords: { lat: 51.5074, lng: -0.1278 }, // London
    geofenceRadiusM: 100,
    scope: 'public' as const,
    retrievalMode: 'remote' as const,
    tier: 'free' as const,
    ownerEmail: 'alice@trove.demo',
    files: [
      { name: 'welcome.txt', content: 'Welcome to Trove! This is your first unlocked file.' },
      { name: 'guide.md', content: '# Trove Guide\\n\\nLearn how to create and share geo-anchored files.' },
    ],
  },
  {
    title: 'Secret Recipe Collection',
    description: 'Family recipes passed down through generations',
    secret: 'grandma\'s kitchen',
    coords: { lat: 40.7580, lng: -73.9855 }, // Times Square, NYC
    geofenceRadiusM: 25,
    scope: 'public' as const,
    retrievalMode: 'physical' as const,
    tier: 'premium' as const,
    ownerEmail: 'bob@trove.demo',
    files: [
      { name: 'chocolate_chip_cookies.txt', content: 'Grandma\'s famous chocolate chip cookie recipe...' },
      { name: 'apple_pie.txt', content: 'The secret to the perfect apple pie crust...' },
    ],
  },
  {
    title: 'Project Blueprint Archive',
    description: 'Confidential architectural plans for the new office complex',
    secret: 'blueprint2024',
    coords: { lat: 48.8566, lng: 2.3522 }, // Paris
    geofenceRadiusM: 10,
    scope: 'private' as const,
    retrievalMode: 'physical' as const,
    tier: 'business' as const,
    ownerEmail: 'charlie@trove.demo',
    files: [
      { name: 'floor_plans.pdf', content: 'Mock PDF content for floor plans...' },
      { name: 'specifications.doc', content: 'Technical specifications document...' },
      { name: 'timeline.xlsx', content: 'Project timeline spreadsheet...' },
    ],
  },
  {
    title: 'Time Capsule 2024',
    description: 'Messages and photos from friends and family',
    secret: 'memories forever',
    coords: { lat: 37.7749, lng: -122.4194 }, // San Francisco
    geofenceRadiusM: 50,
    scope: 'public' as const,
    retrievalMode: 'remote' as const,
    tier: 'free' as const,
    ownerEmail: 'alice@trove.demo',
    files: [
      { name: 'letter_to_future.txt', content: 'Dear future self, I hope you remember this moment...' },
      { name: 'photos_2024.txt', content: 'Mock photo collection metadata...' },
    ],
  },
  {
    title: 'Hiking Trail Cache',
    description: 'Emergency supplies and trail information for fellow hikers',
    secret: 'mountain peak',
    coords: { lat: 46.5197, lng: 7.4815 }, // Jungfraujoch, Switzerland
    geofenceRadiusM: 15,
    scope: 'public' as const,
    retrievalMode: 'physical' as const,
    tier: 'premium' as const,
    ownerEmail: 'bob@trove.demo',
    files: [
      { name: 'trail_map.pdf', content: 'Detailed trail map with GPS coordinates...' },
      { name: 'emergency_contacts.txt', content: 'Mountain rescue and emergency contact numbers...' },
      { name: 'weather_info.json', content: '{"warning": "Check weather conditions before hiking"}' },
    ],
  },
]

async function createDemoFile(content: string, filename: string): Promise<File> {
  const blob = new Blob([content], { type: 'text/plain' })
  return new File([blob], filename, { type: 'text/plain' })
}

async function createUser(userData: typeof DEMO_USERS[0]): Promise<string> {
  try {
    console.log(`Creating user: ${userData.email}`)
    
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    )
    
    const uid = userCredential.user.uid
    
    // Create user document
    const user: User = {
      uid,
      email: userData.email,
      displayName: userData.displayName,
      tier: userData.tier,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    
    await setDoc(doc(db, 'users', uid), user)
    
    console.log(`✅ Created user: ${userData.displayName} (${uid})`)
    return uid
    
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️  User ${userData.email} already exists, signing in...`)
      const userCredential = await signInWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      )
      return userCredential.user.uid
    }
    throw error
  }
}

async function createDrop(dropData: typeof DEMO_DROPS[0], ownerId: string): Promise<void> {
  console.log(`Creating drop: ${dropData.title}`)
  
  try {
    // Hash the secret
    const secretHash = await bcrypt.hash(dropData.secret, 12)
    
    // Create coordinates with geohash
    const coords = createCoordinates(dropData.coords.lat, dropData.coords.lng)
    
    // Upload files to storage
    const dropId = `seed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const storagePath = `drops/${ownerId}/${dropId}`
    
    for (let i = 0; i < dropData.files.length; i++) {
      const fileData = dropData.files[i]
      const fileName = `${i + 1}_${fileData.name}`
      const fileRef = ref(storage, `${storagePath}/${fileName}`)
      
      const file = await createDemoFile(fileData.content, fileData.name)
      await uploadBytes(fileRef, file)
    }
    
    // Create drop document
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (dropData.tier === 'free' ? 7 : dropData.tier === 'premium' ? 30 : 60))
    
    const drop: Omit<Drop, 'id'> = {
      ownerId,
      title: dropData.title,
      description: dropData.description,
      secretHash,
      coords,
      geofenceRadiusM: dropData.geofenceRadiusM,
      scope: dropData.scope,
      dropType: dropData.scope, // Use scope as dropType for seed data
      expiresAt: Timestamp.fromDate(expiresAt),
      storagePath,
      retrievalMode: dropData.retrievalMode,
      tier: dropData.tier,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      stats: {
        views: Math.floor(Math.random() * 50),
        unlocks: Math.floor(Math.random() * 20),
        lastAccessedAt: Timestamp.now(),
      },
    }
    
    await addDoc(collection(db, 'drops'), drop)
    
    console.log(`✅ Created drop: ${dropData.title}`)
    
  } catch (error) {
    console.error(`❌ Failed to create drop ${dropData.title}:`, error)
    throw error
  }
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')
  
  try {
    // Create demo users
    const userMap = new Map<string, string>()
    
    for (const userData of DEMO_USERS) {
      const uid = await createUser(userData)
      userMap.set(userData.email, uid)
    }
    
    console.log('')
    
    // Create demo drops
    for (const dropData of DEMO_DROPS) {
      const ownerId = userMap.get(dropData.ownerEmail)
      if (!ownerId) {
        console.error(`❌ Owner not found for drop: ${dropData.title}`)
        continue
      }
      
      await createDrop(dropData, ownerId)
    }
    
    console.log('')
    console.log('🎉 Database seeding completed!')
    console.log('')
    console.log('Demo users created:')
    DEMO_USERS.forEach(user => {
      console.log(`  📧 ${user.email} (password: ${user.password}) - ${user.tier} tier`)
    })
    
    console.log('')
    console.log('Demo drops created:')
    DEMO_DROPS.forEach(drop => {
      console.log(`  📍 ${drop.title} - Secret: "${drop.secret}"`)
      console.log(`     Location: ${drop.coords.lat}, ${drop.coords.lng}`)
      console.log(`     Mode: ${drop.retrievalMode}, Scope: ${drop.scope}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run the seed script
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding complete')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    })
}

export { seedDatabase }
