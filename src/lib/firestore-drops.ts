import { getFirestore } from 'firebase-admin/firestore'
import { initAdmin } from './firebase-admin'

// Initialize Firebase Admin
initAdmin()

const db = getFirestore()
const DROPS_COLLECTION = 'drops'

export interface FirestoreDrop {
  id: string
  ownerId: string
  title: string
  description?: string
  secretHash: string
  coords: {
    lat: number
    lng: number
    geohash: string
  }
  geofenceRadiusM: number
  scope: 'public' | 'private'
  dropType: 'private' | 'public' | 'hunt'
  huntCode?: string
  huntDifficulty?: 'beginner' | 'intermediate' | 'expert' | 'master'
  huntId?: string
  expiresAt?: Date
  files?: Array<{
    id: string
    name: string
    size: number
    type: string
    uploadedAt: Date
    storagePath?: string // Optional: only present for Firebase Storage uploads
    downloadUrl: string
  }>
  retrievalMode: 'remote' | 'physical'
  tier: string
  createdAt: Date
  updatedAt: Date
  stats: {
    views: number
    unlocks: number
  }
}

/**
 * Create a new drop in Firestore
 */
export async function createDrop(drop: FirestoreDrop): Promise<void> {
  try {
    // Remove undefined values - Firestore doesn't accept them
    const cleanedDrop = Object.fromEntries(
      Object.entries(drop).filter(([_, value]) => value !== undefined)
    )
    
    await db.collection(DROPS_COLLECTION).doc(drop.id).set({
      ...cleanedDrop,
      createdAt: drop.createdAt,
      updatedAt: drop.updatedAt,
      expiresAt: drop.expiresAt || null,
    })
    console.log(`✅ Drop saved to Firestore: ${drop.id}`)
  } catch (error) {
    console.error(`❌ Error saving drop to Firestore:`, error)
    throw error
  }
}

/**
 * Get a drop by ID
 */
export async function getDrop(dropId: string): Promise<FirestoreDrop | null> {
  try {
    const doc = await db.collection(DROPS_COLLECTION).doc(dropId).get()
    
    if (!doc.exists) {
      return null
    }
    
    const data = doc.data()
    return {
      ...data,
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date(),
      expiresAt: data?.expiresAt?.toDate() || undefined,
    } as FirestoreDrop
  } catch (error) {
    console.error(`❌ Error fetching drop from Firestore:`, error)
    return null
  }
}

/**
 * Get all drops (with optional filters)
 */
export async function getDrops(filters?: {
  ownerId?: string
  scope?: 'public' | 'private'
  limit?: number
}): Promise<FirestoreDrop[]> {
  try {
    let query: any = db.collection(DROPS_COLLECTION)
    
    if (filters?.ownerId) {
      query = query.where('ownerId', '==', filters.ownerId)
    }
    
    if (filters?.scope) {
      query = query.where('scope', '==', filters.scope)
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    
    const snapshot = await query.get()
    
    return snapshot.docs.map((doc: any) => {
      const data = doc.data()
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate() || undefined,
      } as FirestoreDrop
    })
  } catch (error) {
    console.error(`❌ Error fetching drops from Firestore:`, error)
    return []
  }
}

/**
 * Update drop stats (views, unlocks)
 */
export async function updateDropStats(
  dropId: string,
  stats: { views?: number; unlocks?: number }
): Promise<void> {
  try {
    const updateData: any = { updatedAt: new Date() }
    
    if (stats.views !== undefined) {
      updateData['stats.views'] = stats.views
    }
    
    if (stats.unlocks !== undefined) {
      updateData['stats.unlocks'] = stats.unlocks
    }
    
    await db.collection(DROPS_COLLECTION).doc(dropId).update(updateData)
    console.log(`✅ Drop stats updated: ${dropId}`)
  } catch (error) {
    console.error(`❌ Error updating drop stats:`, error)
    throw error
  }
}

/**
 * Delete a drop
 */
export async function deleteDrop(dropId: string): Promise<void> {
  try {
    await db.collection(DROPS_COLLECTION).doc(dropId).delete()
    console.log(`✅ Drop deleted from Firestore: ${dropId}`)
  } catch (error) {
    console.error(`❌ Error deleting drop from Firestore:`, error)
    throw error
  }
}

/**
 * Get drops within a geographic area (simplified - would use geohash in production)
 */
export async function getDropsNearLocation(
  lat: number,
  lng: number,
  radiusKm: number = 10
): Promise<FirestoreDrop[]> {
  try {
    // For now, get all public drops and filter in memory
    // In production, use geohash queries for efficiency
    const allDrops = await getDrops({ scope: 'public' })
    
    return allDrops.filter(drop => {
      const distance = calculateDistance(
        lat,
        lng,
        drop.coords.lat,
        drop.coords.lng
      )
      return distance <= radiusKm * 1000 // Convert to meters
    })
  } catch (error) {
    console.error(`❌ Error fetching drops near location:`, error)
    return []
  }
}

/**
 * Calculate distance between two points (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}
