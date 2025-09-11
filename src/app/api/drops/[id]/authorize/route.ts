import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore'
import { ref, getDownloadURL, listAll } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { unlockDropSchema } from '@/lib/validations'
import { isWithinGeofence } from '@/lib/geo'
import { verifyAuthToken } from '@/lib/auth-server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import type { Drop, UnlockDropResponse } from '@/types'

interface RouteParams {
  params: {
    id: string
  }
}

// Simple rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { attempts: number; windowStart: number }>()

function checkRateLimit(key: string, maxAttempts = 5, windowMs = 60000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(key)
  
  if (!record || now - record.windowStart >= windowMs) {
    rateLimitStore.set(key, { attempts: 1, windowStart: now })
    return true
  }
  
  if (record.attempts >= maxAttempts) {
    return false
  }
  
  record.attempts++
  return true
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: dropId } = params
    const body = await request.json()
    
    console.log('POST /api/drops/[id]/authorize called for drop:', dropId)
    console.log('Request body:', body)
    
    // Validate input
    const validation = unlockDropSchema.safeParse({ dropId, ...body })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }
    
    const { secret, userCoords } = validation.data
    
    // Rate limiting
    const user = await verifyAuthToken(request)
    const clientIP = getClientIP(request)
    const ipHash = crypto.createHash('sha256').update(clientIP).digest('hex')
    const rateLimitKey = user ? `user:${user.uid}` : `ip:${ipHash}`
    
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many unlock attempts. Please try again later.' },
        { status: 429 }
      )
    }
    
    // FOR DEVELOPMENT MODE: Handle mock drops
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: simulating drop unlock')
      
      // Customize mock response based on dropId
      let mockDrop
      if (dropId === 'test-drop-1') {
        mockDrop = {
          title: 'Test Drop - Try Me!',
          description: 'A test drop you can unlock. Secret: "test123"',
          secretHash: 'test123', // Simple comparison for demo
          coords: { lat: 51.5074, lng: -0.1278, geohash: 'gcpvj0' },
          geofenceRadiusM: 100,
          retrievalMode: 'remote' as RetrievalMode,
          expiresAt: null,
          tier: 'free' as UserTier,
          ownerId: user?.uid || 'mock-owner',
          createdAt: { toDate: () => new Date(), toMillis: () => Date.now() },
          stats: { views: 15, unlocks: 8 }
        }
      } else if (dropId === 'test-drop-2') {
        mockDrop = {
          title: '📍 Physical Drop Demo',
          description: 'Test physical-only drop (you must be within 50m). Secret: "location123"',
          secretHash: 'location123', // Simple comparison for demo
          coords: { lat: 51.5155, lng: -0.1425, geohash: 'gcpvn0' },
          geofenceRadiusM: 50,
          retrievalMode: 'physical' as RetrievalMode,
          expiresAt: null,
          tier: 'premium' as UserTier,
          ownerId: user?.uid || 'mock-owner',
          createdAt: { toDate: () => new Date(), toMillis: () => Date.now() },
          stats: { views: 23, unlocks: 3 }
        }
      } else {
        // Generic mock drop for user-created drops
        mockDrop = {
          title: 'Your Uploaded Drop',
          description: 'This is your simulated uploaded drop',
          secretHash: secret, // Accept any secret for user drops
          coords: { lat: 51.5074, lng: -0.1278, geohash: 'gcpvj0' },
          geofenceRadiusM: 100,
          retrievalMode: 'remote' as RetrievalMode,
          expiresAt: null,
          tier: 'free' as UserTier,
          ownerId: user?.uid || 'mock-owner',
          createdAt: { toDate: () => new Date(), toMillis: () => Date.now() },
          stats: { views: 1, unlocks: 0 }
        }
      }
      
      // Check secret for test drops
      if ((dropId === 'test-drop-1' && secret !== 'test123') || 
          (dropId === 'test-drop-2' && secret !== 'location123')) {
        console.log('Development mode: invalid secret provided. Expected:', mockDrop.secretHash, 'Got:', secret)
        return NextResponse.json({ error: 'Invalid secret phrase' }, { status: 403 })
      }
      
      // Generic secret check for other drops
      if (!secret || secret.length < 3) {
        console.log('Development mode: secret too short')
        return NextResponse.json({ error: 'Invalid secret phrase' }, { status: 403 })
      }
      
      // Mock geofence check
      let distance: number | undefined
      if (mockDrop.retrievalMode === 'physical' && userCoords) {
        // Calculate simple distance for demo
        const latDiff = (userCoords.lat - mockDrop.coords.lat) * 111320
        const lngDiff = (userCoords.lng - mockDrop.coords.lng) * 111320 * Math.cos(mockDrop.coords.lat * Math.PI / 180)
        distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff)
        
        if (distance > mockDrop.geofenceRadiusM) {
          console.log('Development mode: user too far away:', distance, 'required:', mockDrop.geofenceRadiusM)
          return NextResponse.json(
            {
              error: 'You are too far away',
              distance: Math.round(distance),
              required: mockDrop.geofenceRadiusM,
            },
            { status: 403 }
          )
        }
      }
      
      // Generate mock download URLs based on drop type
      let mockFiles
      if (dropId === 'test-drop-1') {
        mockFiles = [
          { name: 'welcome-guide.pdf', content: 'Welcome to Trove! This is a test PDF file.' },
          { name: 'sample-image.jpg', content: 'This would be a sample image file in a real scenario.' },
          { name: 'demo-data.json', content: JSON.stringify({ message: 'Hello from Trove!', unlocked: new Date().toISOString() }, null, 2) }
        ]
      } else if (dropId === 'test-drop-2') {
        mockFiles = [
          { name: 'location-secret.txt', content: 'Congratulations! You successfully unlocked a physical-only drop.' },
          { name: 'coordinates.kml', content: '<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n<Placemark><name>Treasure Location</name></Placemark>\n</kml>' }
        ]
      } else {
        mockFiles = [
          { name: 'your-file.txt', content: 'This is a simulated file from your upload.' },
          { name: 'another-file.pdf', content: 'This would be your actual PDF content.' }
        ]
      }
      
      const downloadUrls = mockFiles.map(file => 
        `data:text/plain;charset=utf-8,${encodeURIComponent(file.content)}`
      )
      
      const fileNames = mockFiles.map(f => f.name)
      
      console.log('Development mode: successful unlock simulation')
      
      const response: UnlockDropResponse = {
        success: true,
        downloadUrls,
        metadata: {
          title: mockDrop.title,
          description: mockDrop.description,
          fileNames,
          createdAt: mockDrop.createdAt.toDate().toISOString(),
        },
        distance,
      }
      
      return NextResponse.json(response)
    }
    
    // Get drop document
    const dropDoc = await getDoc(doc(db, 'drops', dropId))
    if (!dropDoc.exists()) {
      await logAccessAttempt(dropId, user?.uid, ipHash, 'failure', undefined, 'remote')
      return NextResponse.json({ error: 'Drop not found' }, { status: 404 })
    }
    
    const drop = dropDoc.data() as Omit<Drop, 'id'>
    
    // Check if drop has expired
    if (drop.expiresAt && drop.expiresAt.toMillis() < Date.now()) {
      await logAccessAttempt(dropId, user?.uid, ipHash, 'failure', undefined, drop.retrievalMode)
      return NextResponse.json({ error: 'Drop has expired' }, { status: 410 })
    }
    
    // Verify secret
    const secretMatch = await bcrypt.compare(secret, drop.secretHash)
    if (!secretMatch) {
      await logAccessAttempt(dropId, user?.uid, ipHash, 'failure', undefined, drop.retrievalMode)
      return NextResponse.json({ error: 'Invalid secret phrase' }, { status: 403 })
    }
    
    // Check geofence if required
    let distance: number | undefined
    if (drop.retrievalMode === 'physical' || userCoords) {
      if (!userCoords) {
        await logAccessAttempt(dropId, user?.uid, ipHash, 'failure', undefined, drop.retrievalMode)
        return NextResponse.json(
          { error: 'Location required for this drop' },
          { status: 400 }
        )
      }
      
      const geofenceCheck = isWithinGeofence(
        userCoords,
        drop.coords,
        drop.geofenceRadiusM
      )
      
      distance = geofenceCheck.distance
      
      if (!geofenceCheck.withinFence) {
        await logAccessAttempt(dropId, user?.uid, ipHash, 'failure', distance, drop.retrievalMode)
        return NextResponse.json(
          {
            error: 'You are too far away',
            distance: Math.round(distance),
            required: drop.geofenceRadiusM,
          },
          { status: 403 }
        )
      }
    }
    
    // Generate signed URLs for files
    try {
      const storageRef = ref(storage, drop.storagePath)
      const filesList = await listAll(storageRef)
      
      const downloadUrls = await Promise.all(
        filesList.items.map(async (itemRef) => {
          // Generate signed URL with 15-minute expiry
          const url = await getDownloadURL(itemRef)
          return url
        })
      )
      
      const fileNames = filesList.items.map(itemRef => {
        const fileName = itemRef.name.split('/').pop() || itemRef.name
        // Remove the prefix number if it exists (e.g., "1_document.pdf" -> "document.pdf")
        return fileName.replace(/^\d+_/, '')
      })
      
      // Update drop stats
      await updateDoc(doc(db, 'drops', dropId), {
        'stats.unlocks': (drop.stats?.unlocks || 0) + 1,
        'stats.lastAccessedAt': Timestamp.now(),
      })
      
      // Log successful access
      await logAccessAttempt(dropId, user?.uid, ipHash, 'success', distance, drop.retrievalMode)
      
      const response: UnlockDropResponse = {
        success: true,
        downloadUrls,
        metadata: {
          title: drop.title,
          description: drop.description,
          fileNames,
          createdAt: drop.createdAt.toDate().toISOString(),
        },
        distance,
      }
      
      return NextResponse.json(response)
    } catch (storageError) {
      console.error('Error generating download URLs:', storageError)
      await logAccessAttempt(dropId, user?.uid, ipHash, 'failure', distance, drop.retrievalMode)
      return NextResponse.json(
        { error: 'Failed to generate download links' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error authorizing drop:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to log access attempts
async function logAccessAttempt(
  dropId: string,
  userId: string | undefined,
  ipHash: string,
  result: 'success' | 'failure',
  distance?: number,
  mode: 'remote' | 'physical' = 'remote'
) {
  try {
    await addDoc(collection(db, 'dropAccessLogs'), {
      dropId,
      uid: userId || null,
      ipHash,
      result,
      distanceM: distance || null,
      mode,
      createdAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error logging access attempt:', error)
  }
}
