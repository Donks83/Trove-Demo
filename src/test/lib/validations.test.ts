import { describe, it, expect } from 'vitest'
import {
  createDropSchema,
  unlockDropSchema,
  userProfileSchema,
  signUpSchema,
  signInSchema,
  mapBoundsSchema,
} from '@/lib/validations'

describe('validation schemas', () => {
  describe('createDropSchema', () => {
    const validDropData = {
      title: 'Test Drop',
      description: 'A test drop',
      secret: 'secret123',
      coords: { lat: 51.5074, lng: -0.1278 },
      geofenceRadiusM: 100,
      scope: 'public' as const,
      retrievalMode: 'remote' as const,
    }
    
    it('should validate correct drop data', () => {
      const result = createDropSchema.safeParse(validDropData)
      expect(result.success).toBe(true)
    })
    
    it('should require title', () => {
      const result = createDropSchema.safeParse({
        ...validDropData,
        title: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Title is required')
      }
    })
    
    it('should enforce title length limit', () => {
      const result = createDropSchema.safeParse({
        ...validDropData,
        title: 'a'.repeat(101),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Title too long')
      }
    })
    
    it('should require secret phrase', () => {
      const result = createDropSchema.safeParse({
        ...validDropData,
        secret: 'ab',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Secret phrase must be at least 3 characters')
      }
    })
    
    it('should validate coordinates', () => {
      const result = createDropSchema.safeParse({
        ...validDropData,
        coords: { lat: 91, lng: -0.1278 }, // Invalid latitude
      })
      expect(result.success).toBe(false)
    })
    
    it('should validate scope enum', () => {
      const result = createDropSchema.safeParse({
        ...validDropData,
        scope: 'invalid',
      })
      expect(result.success).toBe(false)
    })
    
    it('should validate retrievalMode enum', () => {
      const result = createDropSchema.safeParse({
        ...validDropData,
        retrievalMode: 'invalid',
      })
      expect(result.success).toBe(false)
    })
    
    it('should allow optional description', () => {
      const result = createDropSchema.safeParse({
        ...validDropData,
        description: undefined,
      })
      expect(result.success).toBe(true)
    })
    
    it('should allow optional expiresAt', () => {
      const result = createDropSchema.safeParse({
        ...validDropData,
        expiresAt: new Date(),
      })
      expect(result.success).toBe(true)
    })
  })
  
  describe('unlockDropSchema', () => {
    const validUnlockData = {
      dropId: 'drop123',
      secret: 'secret123',
      userCoords: { lat: 51.5074, lng: -0.1278 },
    }
    
    it('should validate correct unlock data', () => {
      const result = unlockDropSchema.safeParse(validUnlockData)
      expect(result.success).toBe(true)
    })
    
    it('should require dropId', () => {
      const result = unlockDropSchema.safeParse({
        ...validUnlockData,
        dropId: '',
      })
      expect(result.success).toBe(false)
    })
    
    it('should require secret', () => {
      const result = unlockDropSchema.safeParse({
        ...validUnlockData,
        secret: '',
      })
      expect(result.success).toBe(false)
    })
    
    it('should allow optional userCoords', () => {
      const result = unlockDropSchema.safeParse({
        dropId: 'drop123',
        secret: 'secret123',
      })
      expect(result.success).toBe(true)
    })
  })
  
  describe('userProfileSchema', () => {
    it('should validate correct profile data', () => {
      const result = userProfileSchema.safeParse({
        displayName: 'John Doe',
        photoURL: 'https://example.com/photo.jpg',
      })
      expect(result.success).toBe(true)
    })
    
    it('should require displayName', () => {
      const result = userProfileSchema.safeParse({
        displayName: '',
      })
      expect(result.success).toBe(false)
    })
    
    it('should validate photoURL format', () => {
      const result = userProfileSchema.safeParse({
        displayName: 'John Doe',
        photoURL: 'invalid-url',
      })
      expect(result.success).toBe(false)
    })
  })
  
  describe('signUpSchema', () => {
    const validSignUpData = {
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test User',
    }
    
    it('should validate correct sign up data', () => {
      const result = signUpSchema.safeParse(validSignUpData)
      expect(result.success).toBe(true)
    })
    
    it('should validate email format', () => {
      const result = signUpSchema.safeParse({
        ...validSignUpData,
        email: 'invalid-email',
      })
      expect(result.success).toBe(false)
    })
    
    it('should enforce password length', () => {
      const result = signUpSchema.safeParse({
        ...validSignUpData,
        password: '1234567', // 7 characters
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Password must be at least 8 characters')
      }
    })
  })
  
  describe('signInSchema', () => {
    it('should validate correct sign in data', () => {
      const result = signInSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result.success).toBe(true)
    })
    
    it('should validate email format', () => {
      const result = signInSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      })
      expect(result.success).toBe(false)
    })
    
    it('should require password', () => {
      const result = signInSchema.safeParse({
        email: 'test@example.com',
        password: '',
      })
      expect(result.success).toBe(false)
    })
  })
  
  describe('mapBoundsSchema', () => {
    it('should validate correct bounds data', () => {
      const result = mapBoundsSchema.safeParse({
        north: 52.0,
        south: 51.0,
        east: 1.0,
        west: -1.0,
      })
      expect(result.success).toBe(true)
    })
    
    it('should validate latitude bounds', () => {
      const result = mapBoundsSchema.safeParse({
        north: 91, // Invalid
        south: 51.0,
        east: 1.0,
        west: -1.0,
      })
      expect(result.success).toBe(false)
    })
    
    it('should validate longitude bounds', () => {
      const result = mapBoundsSchema.safeParse({
        north: 52.0,
        south: 51.0,
        east: 181, // Invalid
        west: -1.0,
      })
      expect(result.success).toBe(false)
    })
  })
})
