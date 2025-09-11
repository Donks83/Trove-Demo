import { describe, it, expect } from 'vitest'
import {
  getTierLimits,
  canCreateDrop,
  validateDropForTier,
  TIER_LIMITS,
} from '@/lib/tiers'

describe('tier utilities', () => {
  describe('getTierLimits', () => {
    it('should return correct limits for free tier', () => {
      const limits = getTierLimits('free')
      
      expect(limits.maxFileSizeMB).toBe(500)
      expect(limits.defaultExpiryDays).toBe(7)
      expect(limits.minRadiusM).toBe(50)
      expect(limits.maxRadiusM).toBe(100)
      expect(limits.canUsePrivateSpots).toBe(false)
      expect(limits.canUsePhysicalMode).toBe(false)
      expect(limits.maxDrops).toBe(10)
    })
    
    it('should return correct limits for premium tier', () => {
      const limits = getTierLimits('premium')
      
      expect(limits.maxFileSizeMB).toBe(5 * 1024)
      expect(limits.defaultExpiryDays).toBe(30)
      expect(limits.minRadiusM).toBe(1)
      expect(limits.maxRadiusM).toBe(1000)
      expect(limits.canUsePrivateSpots).toBe(true)
      expect(limits.canUsePhysicalMode).toBe(true)
      expect(limits.maxDrops).toBe(100)
    })
    
    it('should return correct limits for business tier', () => {
      const limits = getTierLimits('business')
      
      expect(limits.maxFileSizeMB).toBe(20 * 1024)
      expect(limits.defaultExpiryDays).toBe(60)
      expect(limits.minRadiusM).toBe(1)
      expect(limits.maxRadiusM).toBe(5000)
      expect(limits.canUsePrivateSpots).toBe(true)
      expect(limits.canUsePhysicalMode).toBe(true)
      expect(limits.maxDrops).toBe(1000)
    })
  })
  
  describe('canCreateDrop', () => {
    it('should allow creation when under limit', () => {
      expect(canCreateDrop('free', 5)).toBe(true)
      expect(canCreateDrop('premium', 50)).toBe(true)
      expect(canCreateDrop('business', 500)).toBe(true)
    })
    
    it('should prevent creation when at limit', () => {
      expect(canCreateDrop('free', 10)).toBe(false)
      expect(canCreateDrop('premium', 100)).toBe(false)
      expect(canCreateDrop('business', 1000)).toBe(false)
    })
    
    it('should prevent creation when over limit', () => {
      expect(canCreateDrop('free', 15)).toBe(false)
      expect(canCreateDrop('premium', 150)).toBe(false)
      expect(canCreateDrop('business', 1500)).toBe(false)
    })
  })
  
  describe('validateDropForTier', () => {
    it('should validate free tier correctly', () => {
      // Valid drop for free tier
      const validResult = validateDropForTier('free', 400, 75, false, false)
      expect(validResult.valid).toBe(true)
      expect(validResult.errors).toHaveLength(0)
      
      // Invalid file size
      const invalidSize = validateDropForTier('free', 600, 75, false, false)
      expect(invalidSize.valid).toBe(false)
      expect(invalidSize.errors).toContain('File size exceeds 500MB limit for free tier')
      
      // Invalid radius (too small)
      const invalidRadiusSmall = validateDropForTier('free', 400, 25, false, false)
      expect(invalidRadiusSmall.valid).toBe(false)
      expect(invalidRadiusSmall.errors).toContain('Radius must be between 50m and 100m for free tier')
      
      // Invalid radius (too large)
      const invalidRadiusLarge = validateDropForTier('free', 400, 150, false, false)
      expect(invalidRadiusLarge.valid).toBe(false)
      expect(invalidRadiusLarge.errors).toContain('Radius must be between 50m and 100m for free tier')
      
      // Invalid private spot
      const invalidPrivate = validateDropForTier('free', 400, 75, true, false)
      expect(invalidPrivate.valid).toBe(false)
      expect(invalidPrivate.errors).toContain('Private spots not available for free tier')
      
      // Invalid physical mode
      const invalidPhysical = validateDropForTier('free', 400, 75, false, true)
      expect(invalidPhysical.valid).toBe(false)
      expect(invalidPhysical.errors).toContain('Physical-only mode not available for free tier')
    })
    
    it('should validate premium tier correctly', () => {
      // Valid drop for premium tier
      const validResult = validateDropForTier('premium', 4000, 10, true, true)
      expect(validResult.valid).toBe(true)
      expect(validResult.errors).toHaveLength(0)
      
      // Invalid file size
      const invalidSize = validateDropForTier('premium', 6000, 10, true, true)
      expect(invalidSize.valid).toBe(false)
      expect(invalidSize.errors).toContain('File size exceeds 5120MB limit for premium tier')
    })
    
    it('should validate business tier correctly', () => {
      // Valid drop for business tier
      const validResult = validateDropForTier('business', 15000, 2000, true, true)
      expect(validResult.valid).toBe(true)
      expect(validResult.errors).toHaveLength(0)
      
      // Invalid file size
      const invalidSize = validateDropForTier('business', 25000, 2000, true, true)
      expect(invalidSize.valid).toBe(false)
      expect(invalidSize.errors).toContain('File size exceeds 20480MB limit for business tier')
    })
    
    it('should accumulate multiple errors', () => {
      const result = validateDropForTier('free', 600, 25, true, true)
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(4)
      expect(result.errors).toContain('File size exceeds 500MB limit for free tier')
      expect(result.errors).toContain('Radius must be between 50m and 100m for free tier')
      expect(result.errors).toContain('Private spots not available for free tier')
      expect(result.errors).toContain('Physical-only mode not available for free tier')
    })
  })
})
