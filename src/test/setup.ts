import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock environment variables
Object.defineProperty(process.env, 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', {
  value: 'test-project',
  writable: true,
})

Object.defineProperty(process.env, 'NEXT_PUBLIC_FIREBASE_API_KEY', {
  value: 'test-api-key',
  writable: true,
})

Object.defineProperty(process.env, 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', {
  value: 'test-project.firebaseapp.com',
  writable: true,
})

Object.defineProperty(process.env, 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', {
  value: 'test-project.appspot.com',
  writable: true,
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: (success: PositionCallback) => {
    const position: GeolocationPosition = {
      coords: {
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    }
    success(position)
  },
  watchPosition: () => 1,
  clearWatch: () => {},
}

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
})
