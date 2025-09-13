import type { Drop, User, DropType, ProximityPermissionCheck } from '@/types'

/**
 * Core security function: Determines if a user should see proximity hints for a drop
 * Based on our 3-tier security model:
 * - Private drops: NO hints for anyone
 * - Public drops: NO hints for anyone  
 * - Hunt drops: Proximity hints ONLY for users who joined the hunt via code
 */
export function canShowProximityHints(drop: Drop, user: User | null): ProximityPermissionCheck {
  const result: ProximityPermissionCheck = {
    canShowHints: false,
    dropType: drop.dropType,
    userHasPermission: false,
    huntCode: drop.huntCode,
  }

  switch (drop.dropType) {
    case 'private':
    case 'public':
      // Private and public drops NEVER show proximity hints
      // This is the core security principle
      result.canShowHints = false
      result.userHasPermission = false
      break
      
    case 'hunt':
      // Hunt drops only show hints to users who joined via hunt code
      if (!user || !drop.huntCode) {
        result.canShowHints = false
        result.userHasPermission = false
      } else {
        const hasJoinedHunt = user.joinedHunts?.includes(drop.huntCode) || false
        result.canShowHints = hasJoinedHunt
        result.userHasPermission = hasJoinedHunt
      }
      break
      
    default:
      // Unknown drop type - secure by default (no hints)
      result.canShowHints = false
      result.userHasPermission = false
  }

  return result
}

/**
 * Check if a user can join a hunt by code
 */
export function canJoinHunt(huntCode: string, user: User | null): boolean {
  if (!user || !huntCode) return false
  
  // Check if already joined
  if (user.joinedHunts?.includes(huntCode)) {
    return false // Already joined
  }
  
  return true // Can join
}

/**
 * Get proximity hint strength based on hunt difficulty
 */
export function getHintStrength(difficulty?: string): {
  maxRadius: number
  hintDetail: 'strong' | 'moderate' | 'minimal' | 'none'
} {
  switch (difficulty) {
    case 'beginner':
      return { maxRadius: 100, hintDetail: 'strong' }
    case 'intermediate':
      return { maxRadius: 50, hintDetail: 'moderate' }
    case 'expert':
      return { maxRadius: 25, hintDetail: 'minimal' }
    case 'master':
      return { maxRadius: 10, hintDetail: 'none' }
    default:
      return { maxRadius: 50, hintDetail: 'moderate' }
  }
}

/**
 * Calculate if user should see distance-based hints
 */
export function shouldShowDistanceHints(
  drop: Drop, 
  user: User | null, 
  userDistance: number
): {
  showHint: boolean
  hintType: 'close' | 'medium' | 'far' | 'none'
  message?: string
} {
  const permission = canShowProximityHints(drop, user)
  
  if (!permission.canShowHints) {
    return { showHint: false, hintType: 'none' }
  }
  
  const { maxRadius, hintDetail } = getHintStrength(drop.huntDifficulty)
  
  // Only show hints if within the hunt's max radius
  if (userDistance > maxRadius) {
    return { showHint: false, hintType: 'none' }
  }
  
  // Determine hint strength based on distance and difficulty
  let hintType: 'close' | 'medium' | 'far' = 'far'
  let message = ''
  
  if (userDistance <= 10) {
    hintType = 'close'
    if (hintDetail === 'strong') message = '🔥 Very close! You\'re almost there!'
    else if (hintDetail === 'moderate') message = '🎯 Close'
    else message = '📍'
  } else if (userDistance <= 25) {
    hintType = 'medium'  
    if (hintDetail === 'strong') message = '🎯 Getting warmer!'
    else if (hintDetail === 'moderate') message = '🌡️ Warmer'
    else message = '↗️'
  } else {
    hintType = 'far'
    if (hintDetail === 'strong') message = '🧭 Keep searching in this area'
    else if (hintDetail === 'moderate') message = '🔍 Searching...'
    else message = '...'
  }
  
  return {
    showHint: true,
    hintType,
    message: hintDetail !== 'none' ? message : undefined
  }
}

/**
 * Validate hunt code format
 */
export function isValidHuntCode(code: string): boolean {
  // Hunt codes should follow format: HUNT-TIMESTAMP-RANDOM
  const huntCodePattern = /^HUNT-[A-Z0-9]{6,}-[A-Z0-9]{4}$/
  return huntCodePattern.test(code)
}
