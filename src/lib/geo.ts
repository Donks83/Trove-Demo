import ngeohash from 'ngeohash'
import type { Coordinates, GeoBounds } from '@/types'

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point  
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Generate geohash for coordinates
 */
export function generateGeohash(lat: number, lng: number, precision = 9): string {
  return ngeohash.encode(lat, lng, precision)
}

/**
 * Create coordinates object with geohash
 */
export function createCoordinates(lat: number, lng: number): Coordinates {
  return {
    lat,
    lng,
    geohash: generateGeohash(lat, lng),
  }
}

/**
 * Get geohash neighbors for proximity searches
 */
export function getGeohashNeighbors(geohash: string): string[] {
  const neighbors = ngeohash.neighbors(geohash)
  return [geohash, ...Object.values(neighbors)]
}

/**
 * Generate geohash prefix ranges for bounding box queries
 */
export function getGeohashRanges(bounds: GeoBounds, precision = 6): string[] {
  const ranges: string[] = []
  
  // Generate geohashes for bounding box corners and center
  const sw = generateGeohash(bounds.south, bounds.west, precision)
  const ne = generateGeohash(bounds.north, bounds.east, precision)
  const nw = generateGeohash(bounds.north, bounds.west, precision)
  const se = generateGeohash(bounds.south, bounds.east, precision)
  const center = generateGeohash(
    (bounds.north + bounds.south) / 2,
    (bounds.east + bounds.west) / 2,
    precision
  )
  
  // Get unique prefixes
  const prefixes = new Set([sw, ne, nw, se, center].map(h => h.slice(0, precision - 1)))
  
  return Array.from(prefixes)
}

/**
 * Check if coordinates are within geofence
 */
export function isWithinGeofence(
  userCoords: { lat: number; lng: number },
  dropCoords: { lat: number; lng: number },
  radiusM: number
): { withinFence: boolean; distance: number } {
  const distance = calculateDistance(
    userCoords.lat,
    userCoords.lng,
    dropCoords.lat,
    dropCoords.lng
  )
  
  return {
    withinFence: distance <= radiusM,
    distance,
  }
}

/**
 * Get compass direction to target
 */
export function getCompassDirection(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): string {
  const dLng = ((toLng - fromLng) * Math.PI) / 180
  const fromLatRad = (fromLat * Math.PI) / 180
  const toLatRad = (toLat * Math.PI) / 180
  
  const y = Math.sin(dLng) * Math.cos(toLatRad)
  const x = Math.cos(fromLatRad) * Math.sin(toLatRad) - 
            Math.sin(fromLatRad) * Math.cos(toLatRad) * Math.cos(dLng)
            
  const bearing = (Math.atan2(y, x) * 180) / Math.PI
  const normalizedBearing = (bearing + 360) % 360
  
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(normalizedBearing / 45) % 8
  
  return directions[index]
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  } else {
    return `${(meters / 1000).toFixed(1)}km`
  }
}
