import { z } from 'zod'

// Coordinates schema
export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

// Create drop schema  
export const createDropSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  secret: z.string().min(3, 'Secret phrase must be at least 3 characters').max(100, 'Secret phrase too long'),
  coords: coordinatesSchema,
  geofenceRadiusM: z.number().min(1).max(10000),
  scope: z.enum(['public', 'private']),
  expiresAt: z.date().optional(),
  retrievalMode: z.enum(['remote', 'physical']),
})

// Unlock drop schema
export const unlockDropSchema = z.object({
  dropId: z.string().min(1),
  secret: z.string().min(1),
  userCoords: coordinatesSchema.optional(),
})

// User profile schema
export const userProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(50, 'Display name too long'),
  photoURL: z.string().url().optional(),
})

// Auth schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1, 'Display name is required').max(50, 'Display name too long'),
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// File upload validation
export const fileUploadSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, 'At least one file is required'),
  maxSizeMB: z.number().positive(),
})

// Map bounds schema for public drops query
export const mapBoundsSchema = z.object({
  north: z.number().min(-90).max(90),
  south: z.number().min(-90).max(90), 
  east: z.number().min(-180).max(180),
  west: z.number().min(-180).max(180),
})

// Drop update schema (for editing)
export const updateDropSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
  expiresAt: z.date().optional(),
  scope: z.enum(['public', 'private']).optional(),
})

export type CreateDropInput = z.infer<typeof createDropSchema>
export type UnlockDropInput = z.infer<typeof unlockDropSchema>
export type UserProfileInput = z.infer<typeof userProfileSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>
export type MapBoundsInput = z.infer<typeof mapBoundsSchema>
export type UpdateDropInput = z.infer<typeof updateDropSchema>
