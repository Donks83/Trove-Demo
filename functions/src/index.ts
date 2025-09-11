import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https'
import { onDocumentDeleted } from 'firebase-functions/v2/firestore'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import * as bcrypt from 'bcryptjs'
import { calculateDistance } from './utils/geo'

// Initialize Firebase Admin
initializeApp()
const db = getFirestore()
const storage = getStorage()

interface AuthorizeDropRequest {
  dropId: string
  secret: string
  userCoords?: {
    lat: number
    lng: number
  }
}

interface AuthorizeDropResponse {
  success: boolean
  downloadUrls?: string[]
  metadata?: {
    title: string
    description?: string
    fileNames: string[]
    createdAt: string
  }
  error?: string
  distance?: number
}

export const authorizeDrop = onCall<AuthorizeDropRequest>(
  { 
    cors: true,
    region: 'us-central1',
    maxInstances: 10,
  },
  async (request): Promise<AuthorizeDropResponse> => {
    const { data, auth } = request
    const { dropId, secret, userCoords } = data

    if (!dropId || !secret) {
      throw new HttpsError('invalid-argument', 'Missing required fields')
    }

    try {
      // Rate limiting check
      const userId = auth?.uid
      const ipHash = request.rawRequest.ip ? 
        require('crypto').createHash('sha256').update(request.rawRequest.ip).digest('hex') : 
        'unknown'
      
      const rateLimitKey = userId ? `user:${userId}` : `ip:${ipHash}`
      const rateLimitRef = db.collection('rateLimits').doc(rateLimitKey)
      const rateLimitDoc = await rateLimitRef.get()
      
      const now = Date.now()
      const windowMs = 60 * 1000 // 1 minute
      const maxAttempts = 5
      
      if (rateLimitDoc.exists) {
        const data = rateLimitDoc.data()!
        const attempts = data.attempts || 0
        const windowStart = data.windowStart?.toMillis() || 0
        
        if (now - windowStart < windowMs && attempts >= maxAttempts) {
          throw new HttpsError('resource-exhausted', 'Too many unlock attempts. Please try again later.')
        }
        
        if (now - windowStart >= windowMs) {
          // Reset window
          await rateLimitRef.set({
            attempts: 1,
            windowStart: Timestamp.fromMillis(now),
          })
        } else {
          // Increment attempts
          await rateLimitRef.update({
            attempts: attempts + 1,
          })
        }
      } else {
        // First attempt
        await rateLimitRef.set({
          attempts: 1,
          windowStart: Timestamp.fromMillis(now),
        })
      }

      // Get drop document
      const dropRef = db.collection('drops').doc(dropId)
      const dropDoc = await dropRef.get()

      if (!dropDoc.exists) {
        await logAccessAttempt(dropId, userId, ipHash, 'failure', undefined, 'remote')
        throw new HttpsError('not-found', 'Drop not found')
      }

      const drop = dropDoc.data()!

      // Check if drop has expired
      if (drop.expiresAt && drop.expiresAt.toMillis() < now) {
        await logAccessAttempt(dropId, userId, ipHash, 'failure', undefined, 'remote')
        throw new HttpsError('failed-precondition', 'Drop has expired')
      }

      // Verify secret
      const secretMatch = await bcrypt.compare(secret, drop.secretHash)
      if (!secretMatch) {
        await logAccessAttempt(dropId, userId, ipHash, 'failure', undefined, 'remote')
        throw new HttpsError('permission-denied', 'Invalid secret phrase')
      }

      // Check geofence if required
      let distance: number | undefined
      if (drop.retrievalMode === 'physical' || userCoords) {
        if (!userCoords) {
          await logAccessAttempt(dropId, userId, ipHash, 'failure', undefined, drop.retrievalMode)
          throw new HttpsError('failed-precondition', 'Location required for this drop')
        }

        distance = calculateDistance(
          userCoords.lat,
          userCoords.lng,
          drop.coords.lat,
          drop.coords.lng
        )

        if (distance > drop.geofenceRadiusM) {
          await logAccessAttempt(dropId, userId, ipHash, 'failure', distance, drop.retrievalMode)
          throw new HttpsError('failed-precondition', `You're too far away. Distance: ${Math.round(distance)}m, Required: ${drop.geofenceRadiusM}m`)
        }
      }

      // Generate signed URLs for files
      const bucket = storage.bucket()
      const [files] = await bucket.getFiles({
        prefix: drop.storagePath,
      })

      const downloadUrls: string[] = []
      const fileNames: string[] = []

      for (const file of files) {
        const [signedUrl] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        })
        downloadUrls.push(signedUrl)
        
        // Extract filename from path
        const fileName = file.name.split('/').pop() || file.name
        fileNames.push(fileName)
      }

      // Update drop stats
      await dropRef.update({
        'stats.unlocks': (drop.stats?.unlocks || 0) + 1,
        'stats.lastAccessedAt': Timestamp.fromMillis(now),
      })

      // Log successful access
      await logAccessAttempt(dropId, userId, ipHash, 'success', distance, drop.retrievalMode)

      return {
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
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error
      }
      console.error('Error authorizing drop:', error)
      throw new HttpsError('internal', 'Internal server error')
    }
  }
)

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
    await db.collection('dropAccessLogs').add({
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

// Clean up storage when drop is deleted
export const onDropDelete = onDocumentDeleted(
  'drops/{dropId}',
  async (event) => {
    const deletedDrop = event.data?.data()
    if (!deletedDrop?.storagePath) return

    try {
      const bucket = storage.bucket()
      const [files] = await bucket.getFiles({
        prefix: deletedDrop.storagePath,
      })

      // Delete all files in the drop's storage path
      await Promise.all(files.map(file => file.delete()))
      
      console.log(`Cleaned up ${files.length} files for deleted drop ${event.params.dropId}`)
    } catch (error) {
      console.error('Error cleaning up storage:', error)
    }
  }
)

// Health check endpoint
export const healthCheck = onRequest(
  { cors: true },
  (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    })
  }
)
