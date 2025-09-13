import { Timestamp } from 'firebase/firestore'

export type UserTier = 'free' | 'premium' | 'business'

export type DropScope = 'public' | 'private'

export type DropType = 'private' | 'public' | 'hunt'

export type RetrievalMode = 'remote' | 'physical'

export type AccessResult = 'success' | 'failure'

export type HuntStatus = 'draft' | 'active' | 'completed' | 'expired'

export type ParticipantStatus = 'invited' | 'joined' | 'completed'

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
  joinedHunts: string[] // Array of hunt codes the user has joined
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface TreasureHunt {
  id: string
  ownerId: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'expert' | 'master'
  status: HuntStatus
  maxParticipants?: number
  startDate?: Timestamp
  endDate?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
  stats: {
    totalParticipants: number
    completedParticipants: number
    totalDrops: number
  }
}

export interface HuntParticipant {
  id: string
  huntId: string
  userId: string
  email: string
  displayName: string
  status: ParticipantStatus
  joinedAt?: Timestamp
  completedAt?: Timestamp
  progress: {
    dropsFound: number
    totalDrops: number
    lastActivityAt?: Timestamp
  }
}

export interface HuntInvitation {
  id: string
  huntId: string
  huntTitle: string
  ownerName: string
  inviteeEmail: string
  invitedAt: Timestamp
  expiresAt: Timestamp
  status: 'pending' | 'accepted' | 'declined' | 'expired'
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
  dropType: DropType
  huntCode?: string // Hunt code for join-by-code system
  huntDifficulty?: 'beginner' | 'intermediate' | 'expert' | 'master'
  huntId?: string // Links to TreasureHunt if using complex hunt system
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
  dropType: DropType
  huntId?: string // Required if dropType === 'hunt'
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

// Hunt-specific request/response types
export interface JoinHuntByCodeRequest {
  huntCode: string
}

export interface JoinHuntByCodeResponse {
  success: boolean
  message: string
  drop?: {
    id: string
    title: string
    description?: string
    difficulty: string
  }
  error?: string
}

export interface ProximityPermissionCheck {
  canShowHints: boolean
  dropType: DropType
  userHasPermission: boolean
  huntCode?: string
}

export interface CreateHuntRequest {
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'expert' | 'master'
  maxParticipants?: number
  startDate?: Date
  endDate?: Date
  inviteEmails: string[]
}

export interface CreateHuntResponse {
  success: boolean
  huntId?: string
  invitationsSent?: number
  error?: string
}

export interface JoinHuntRequest {
  huntId: string
  invitationId?: string
}

export interface JoinHuntResponse {
  success: boolean
  participant?: HuntParticipant
  hunt?: TreasureHunt
  error?: string
}

export interface GetHuntResponse {
  hunt: TreasureHunt
  participants: HuntParticipant[]
  drops: Drop[]
  userRole: 'owner' | 'participant' | 'none'
}

export interface HuntProximityInfo {
  dropId: string
  distance: number
  withinRadius: boolean
  huntId: string
  canShowHints: boolean
}

// Extended UnlockDropResponse to include hunt info
export interface UnlockDropResponseWithHunt extends UnlockDropResponse {
  huntProgress?: {
    dropsFound: number
    totalDrops: number
    huntCompleted: boolean
  }
}
