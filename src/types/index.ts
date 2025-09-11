import { Timestamp } from 'firebase/firestore'

export type UserTier = 'free' | 'premium' | 'business'

export type DropScope = 'public' | 'private'

export type RetrievalMode = 'remote' | 'physical'

export type AccessResult = 'success' | 'failure'

export interface Coordinates {
  lat: number
  lng: number
  geohash: string
}

export interface TierLimits {
  maxFileSizeMB: number
  defaultExpiryDays: number
  minRadiusM: number
  maxRadiusM: number
  canUsePrivateSpots: boolean
  canUsePhysicalMode: boolean
  maxDrops: number
}

export interface User {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  tier: UserTier
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface DropStats {
  views: number
  unlocks: number
  lastAccessedAt?: Timestamp
}

export interface Drop {
  id: string
  ownerId: string
  title: string
  description?: string
  secretHash: string
  coords: Coordinates
  geofenceRadiusM: number
  scope: DropScope
  expiresAt?: Timestamp
  storagePath: string
  retrievalMode: RetrievalMode
  tier: UserTier
  createdAt: Timestamp
  updatedAt: Timestamp
  stats: DropStats
}

export interface DropAccessLog {
  id: string
  dropId: string
  uid?: string
  ipHash: string
  result: AccessResult
  distanceM?: number
  mode: RetrievalMode
  createdAt: Timestamp
}

export interface CreateDropRequest {
  title: string
  description?: string
  secret: string
  coords: Omit<Coordinates, 'geohash'>
  geofenceRadiusM: number
  scope: DropScope
  expiresAt?: Date
  retrievalMode: RetrievalMode
  files: File[]
}

export interface UnlockDropRequest {
  dropId: string
  secret: string
  userCoords?: Coordinates
}

export interface UnlockDropResponse {
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

export type GeoBounds = {
  north: number
  south: number
  east: number
  west: number
}
