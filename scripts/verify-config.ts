#!/usr/bin/env tsx

import dotenv from 'dotenv'
import { join } from 'path'

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') })

console.log('🔍 Verifying Trove Configuration...\n')

// Check environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_MAPBOX_TOKEN',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
]

let allValid = true

console.log('📊 Environment Variables:')
requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    // Mask sensitive tokens for security
    const maskedValue = varName.includes('TOKEN') || varName.includes('KEY') 
      ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}`
      : value
    console.log(`✅ ${varName}: ${maskedValue}`)
  } else {
    console.log(`❌ ${varName}: MISSING`)
    allValid = false
  }
})

// Check optional variables
const optionalVars = ['NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID']
optionalVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${value} (optional)`)
  } else {
    console.log(`⚠️  ${varName}: Not set (optional)`)
  }
})

console.log('\n🔥 Firebase Configuration:')
console.log(`Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`)
console.log(`Auth Domain: ${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}`)
console.log(`Storage Bucket: ${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}`)

console.log('\n🗺️ Mapbox Configuration:')
const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
if (mapboxToken) {
  if (mapboxToken.startsWith('pk.')) {
    console.log('✅ Mapbox token format is correct (starts with pk.)')
  } else {
    console.log('❌ Mapbox token should start with "pk."')
    allValid = false
  }
} else {
  console.log('❌ Mapbox token is missing')
  allValid = false
}

console.log('\n📋 Next Steps:')
if (allValid) {
  console.log('✅ Configuration looks good!')
  console.log('')
  console.log('Ready to start development:')
  console.log('1. Make sure you have enabled Firebase services:')
  console.log('   - Authentication (Email/Password)')
  console.log('   - Firestore Database')
  console.log('   - Cloud Storage')
  console.log('   - Cloud Functions')
  console.log('')
  console.log('2. Run the development server:')
  console.log('   pnpm dev')
  console.log('')
  console.log('3. Seed demo data:')
  console.log('   pnpm seed')
} else {
  console.log('❌ Configuration has issues. Please check the missing variables above.')
}

console.log('\n🔗 Useful Links:')
console.log(`Firebase Console: https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`)
console.log('Mapbox Account: https://account.mapbox.com/')
