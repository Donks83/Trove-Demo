import type { UserTier, TierLimits } from '@/types'

/**
 * Tier limits and permissions
 */
export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  free: {
    maxFileSizeMB: 10,
    defaultExpiryDays: 30,
    minRadiusM: 50,
    maxRadiusM: 500,
    canUsePrivateSpots: true,
    canUsePhysicalMode: false, // ❌ Cannot use physical mode
    maxDrops: 10
  },
  premium: {
    maxFileSizeMB: 100,
    defaultExpiryDays: 365,
    minRadiusM: 10,
    maxRadiusM: 1000,
    canUsePrivateSpots: true,
    canUsePhysicalMode: true, // ✅ Can use physical mode
    maxDrops: 100
  },
  business: {
    maxFileSizeMB: 500,
    defaultExpiryDays: -1, // Unlimited
    minRadiusM: 5,
    maxRadiusM: 5000,
    canUsePrivateSpots: true,
    canUsePhysicalMode: true, // ✅ Can use physical mode
    maxDrops: 1000
  }
}

/**
 * Tier display names for UI
 */
export const TIER_DISPLAY_NAMES: Record<UserTier, string> = {
  free: 'Free Explorer',
  premium: 'Premium',
  business: 'Business'
}

/**
 * Tier colors for UI
 */
export const TIER_COLORS: Record<UserTier, string> = {
  free: 'gray',
  premium: 'purple',
  business: 'blue'
}

/**
 * Get tier limits for a given user tier
 */
export function getTierLimits(tier: UserTier): TierLimits {
  return TIER_LIMITS[tier]
}

/**
 * Check if user can use physical retrieval mode
 */
export function canUsePhysicalMode(tier: UserTier): boolean {
  return TIER_LIMITS[tier].canUsePhysicalMode
}

/**
 * Validate radius against tier limits
 */
export function validateRadius(radius: number, tier: UserTier): {
  valid: boolean
  error?: string
  min: number
  max: number
} {
  const limits = getTierLimits(tier)
  
  if (radius < limits.minRadiusM) {
    return {
      valid: false,
      error: `Radius must be at least ${limits.minRadiusM}m for ${tier} tier`,
      min: limits.minRadiusM,
      max: limits.maxRadiusM
    }
  }
  
  if (radius > limits.maxRadiusM) {
    return {
      valid: false,
      error: `Radius cannot exceed ${limits.maxRadiusM}m for ${tier} tier`,
      min: limits.minRadiusM,
      max: limits.maxRadiusM
    }
  }
  
  return {
    valid: true,
    min: limits.minRadiusM,
    max: limits.maxRadiusM
  }
}

/**
 * Validate file size against tier limits
 */
export function validateFileSize(sizeInBytes: number, tier: UserTier): {
  valid: boolean
  error?: string
  maxMB: number
} {
  const limits = getTierLimits(tier)
  const sizeInMB = sizeInBytes / (1024 * 1024)
  const maxMB = limits.maxFileSizeMB
  
  if (sizeInMB > maxMB) {
    return {
      valid: false,
      error: `File size (${sizeInMB.toFixed(2)}MB) exceeds ${tier} tier limit of ${maxMB}MB`,
      maxMB
    }
  }
  
  return {
    valid: true,
    maxMB
  }
}

/**
 * Validate a complete drop configuration against tier limits
 */
export function validateDropForTier(
  tier: UserTier,
  fileSizeMB: number,
  radiusM: number,
  isPrivate: boolean,
  isPhysical: boolean
): {
  valid: boolean
  errors: string[]
} {
  const limits = getTierLimits(tier)
  const errors: string[] = []

  // Validate file size
  if (fileSizeMB > limits.maxFileSizeMB) {
    errors.push(`File size ${fileSizeMB.toFixed(2)}MB exceeds ${limits.maxFileSizeMB}MB limit for ${tier} tier`)
  }

  // Validate radius
  if (radiusM < limits.minRadiusM) {
    errors.push(`Radius ${radiusM}m is below minimum ${limits.minRadiusM}m for ${tier} tier`)
  }
  if (radiusM > limits.maxRadiusM) {
    errors.push(`Radius ${radiusM}m exceeds maximum ${limits.maxRadiusM}m for ${tier} tier`)
  }

  // Validate private spots permission
  if (isPrivate && !limits.canUsePrivateSpots) {
    errors.push(`Private drops require Premium+ tier`)
  }

  // Validate physical mode permission
  if (isPhysical && !limits.canUsePhysicalMode) {
    errors.push(`Physical unlock mode requires Premium+ tier`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Get tier display information
 */
export const TIER_INFO: Record<UserTier, {
  name: string
  color: string
  icon: string
  features: string[]
}> = {
  free: {
    name: 'Free Explorer',
    color: 'gray',
    icon: '🆓',
    features: [
      '10 drops max',
      '10MB file limit',
      '50-500m radius',
      'Remote unlock only',
      '30 day expiry'
    ]
  },
  premium: {
    name: 'Premium',
    color: 'purple',
    icon: '👑',
    features: [
      '100 drops max',
      '100MB file limit',
      '10-1000m radius',
      '✅ Physical unlock',
      '365 day expiry'
    ]
  },
  business: {
    name: 'Business',
    color: 'blue',
    icon: '🏢',
    features: [
      '1000 drops max',
      '500MB file limit',
      '5-5000m radius',
      '✅ Physical unlock',
      'Unlimited expiry'
    ]
  }
}

/**
 * Get upgrade benefits when going from one tier to another
 */
export function getUpgradeBenefits(fromTier: UserTier, toTier: UserTier): string[] {
  const from = TIER_LIMITS[fromTier]
  const to = TIER_LIMITS[toTier]
  
  const benefits: string[] = []
  
  if (to.maxDrops > from.maxDrops) {
    benefits.push(`${to.maxDrops} drops (was ${from.maxDrops})`)
  }
  
  if (to.maxFileSizeMB > from.maxFileSizeMB) {
    benefits.push(`${to.maxFileSizeMB}MB files (was ${from.maxFileSizeMB}MB)`)
  }
  
  if (to.minRadiusM < from.minRadiusM) {
    benefits.push(`Precision radius down to ${to.minRadiusM}m (was ${from.minRadiusM}m)`)
  }
  
  if (to.maxRadiusM > from.maxRadiusM) {
    benefits.push(`Max radius ${to.maxRadiusM}m (was ${from.maxRadiusM}m)`)
  }
  
  if (to.canUsePhysicalMode && !from.canUsePhysicalMode) {
    benefits.push(`✅ Physical unlock mode (GPS validated)`)
  }
  
  if (to.defaultExpiryDays > from.defaultExpiryDays || to.defaultExpiryDays === -1) {
    const days = to.defaultExpiryDays === -1 ? 'Unlimited' : `${to.defaultExpiryDays} days`
    benefits.push(`${days} expiry (was ${from.defaultExpiryDays} days)`)
  }
  
  return benefits
}
