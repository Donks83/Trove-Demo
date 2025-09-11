#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { existsSync, copyFileSync } from 'fs'
import { join } from 'path'

const PROJECT_ROOT = process.cwd()

console.log('🚀 Setting up Trove development environment...\n')

// Check if .env.local exists
const envLocalPath = join(PROJECT_ROOT, '.env.local')
const envExamplePath = join(PROJECT_ROOT, '.env.local.example')

if (!existsSync(envLocalPath) && existsSync(envExamplePath)) {
  console.log('📄 Creating .env.local from example...')
  copyFileSync(envExamplePath, envLocalPath)
  console.log('✅ Created .env.local')
  console.log('⚠️  Please edit .env.local with your actual Firebase and Mapbox credentials\n')
} else if (existsSync(envLocalPath)) {
  console.log('✅ .env.local already exists\n')
} else {
  console.log('❌ No .env.local.example found\n')
}

// Install dependencies
console.log('📦 Installing dependencies...')
try {
  execSync('pnpm install', { stdio: 'inherit', cwd: PROJECT_ROOT })
  console.log('✅ Dependencies installed\n')
} catch (error) {
  console.log('❌ Failed to install dependencies. Trying with npm...')
  try {
    execSync('npm install', { stdio: 'inherit', cwd: PROJECT_ROOT })
    console.log('✅ Dependencies installed with npm\n')
  } catch (npmError) {
    console.log('❌ Failed to install dependencies with npm')
    console.log('Please install dependencies manually: pnpm install or npm install\n')
  }
}

// Install Firebase CLI if not present
console.log('🔥 Checking Firebase CLI...')
try {
  execSync('firebase --version', { stdio: 'pipe' })
  console.log('✅ Firebase CLI is installed\n')
} catch (error) {
  console.log('📦 Installing Firebase CLI globally...')
  try {
    execSync('npm install -g firebase-tools', { stdio: 'inherit' })
    console.log('✅ Firebase CLI installed\n')
  } catch (installError) {
    console.log('❌ Failed to install Firebase CLI globally')
    console.log('Please install manually: npm install -g firebase-tools\n')
  }
}

// Setup Husky hooks
console.log('🪝 Setting up Git hooks...')
try {
  execSync('pnpm prepare', { stdio: 'pipe', cwd: PROJECT_ROOT })
  console.log('✅ Git hooks configured\n')
} catch (error) {
  console.log('⚠️  Git hooks setup skipped (not in a git repository)\n')
}

// Build functions
console.log('⚙️  Building Firebase Functions...')
try {
  execSync('npm install', { stdio: 'inherit', cwd: join(PROJECT_ROOT, 'functions') })
  execSync('npm run build', { stdio: 'inherit', cwd: join(PROJECT_ROOT, 'functions') })
  console.log('✅ Firebase Functions built\n')
} catch (error) {
  console.log('❌ Failed to build Firebase Functions')
  console.log('You can build them later with: cd functions && npm install && npm run build\n')
}

console.log('🎉 Setup complete!\n')

console.log('📋 Next steps:')
console.log('1. Edit .env.local with your Firebase and Mapbox credentials')
console.log('2. Create a Firebase project and enable Auth, Firestore, Storage, and Functions')
console.log('3. Run `pnpm dev` to start the development server with emulators')
console.log('4. Run `pnpm seed` to populate with demo data')
console.log('')

console.log('🔗 Useful commands:')
console.log('  pnpm dev       - Start development server + emulators')
console.log('  pnpm build     - Build for production')
console.log('  pnpm test      - Run tests')
console.log('  pnpm lint      - Run linting')
console.log('  pnpm seed      - Populate database with demo data')
console.log('  pnpm emulators - Start Firebase emulators only')
console.log('')

console.log('📚 Documentation:')
console.log('  README.md - Complete setup and usage guide')
console.log('  Firebase Console - https://console.firebase.google.com')
console.log('  Mapbox Account - https://account.mapbox.com')
console.log('')

console.log('Happy coding! 🚀')
