import type { UserTier, TierLimits } from '@/types'

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  free: {
    maxFileSizeMB: 500,
    defaultExpiryDays: 7,
    minRadiusM: 50,
    maxRadiusM: 100,
    canUsePrivateSpots: false,
    canUsePhysicalMode: false,
    maxDrops: 10,
  },
  premium: {
    maxFileSizeMB: 5 * 1024, // 5GB
    defaultExpiryDays: 30,
    minRadiusM: 1,
    maxRadiusM: 1000,
    canUsePrivateSpots: true,
    canUsePhysicalMode: true,
    maxDrops: 100,
  },
  business: {
    maxFileSizeMB: 20 * 1024, // 20GB  
    defaultExpiryDays: 60,
    minRadiusM: 1,
    maxRadiusM: 5000,
    canUsePrivateSpots: true,
    canUsePhysicalMode: true,
    maxDrops: 1000,
  },
}

export function getTierLimits(tier: UserTier): TierLimits {
  return TIER_LIMITS[tier]
}

export function canCreateDrop(tier: UserTier, currentDropCount: number): boolean {
  const limits = getTierLimits(tier)
  return currentDropCount < limits.maxDrops
}

export function validateDropForTier(
  tier: UserTier,
  fileSizeMB: number,
  radiusM: number,
  isPrivateSpot: boolean,
  isPhysicalMode: boolean
): { valid: boolean; errors: string[] } {
  const limits = getTierLimits(tier)
  const errors: string[] = []

  if (fileSizeMB > limits.maxFileSizeMB) {
    errors.push(`File size exceeds ${limits.maxFileSizeMB}MB limit for ${tier} tier`)
  }

  if (radiusM < limits.minRadiusM || radiusM > limits.maxRadiusM) {
    errors.push(`Radius must be between ${limits.minRadiusM}m and ${limits.maxRadiusM}m for ${tier} tier`)
  }

  if (isPrivateSpot && !limits.canUsePrivateSpots) {
    errors.push(`Private spots not available for ${tier} tier`)
  }

  if (isPhysicalMode && !limits.canUsePhysicalMode) {
    errors.push(`Physical-only mode not available for ${tier} tier`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export const TIER_DISPLAY_NAMES: Record<UserTier, string> = {
  free: 'Free Explorer',
  premium: 'Premium',
  business: 'Business',
}

export const TIER_COLORS: Record<UserTier, string> = {
  free: 'bg-gray-500',
  premium: 'bg-purple-500', 
  business: 'bg-blue-500',
}
