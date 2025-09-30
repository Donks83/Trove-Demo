import { searchCustomPOIs, type CustomPOI } from './custom-pois'

interface GeocodeResult {
  id: string
  place_name: string
  center: [number, number] // [lng, lat]
  place_type: string[]
  relevance: number
  properties?: {
    category?: string
  }
}

interface MapboxGeocodeResponse {
  features: GeocodeResult[]
}

export interface SearchResult {
  id: string
  name: string
  description: string
  coordinates: { lat: number; lng: number }
  type: string
  relevance?: number
  source?: 'custom' | 'mapbox' // Track where result came from
}

/**
 * Convert custom POI to SearchResult
 */
function customPOIToSearchResult(poi: CustomPOI): SearchResult {
  const categoryMap: Record<string, string> = {
    landmark: 'Landmark',
    university: 'University',
    monument: 'Monument',
    building: 'Building',
    attraction: 'Attraction'
  }
  
  return {
    id: `custom-${poi.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: poi.name,
    description: poi.description,
    coordinates: {
      lat: poi.lat,
      lng: poi.lng
    },
    type: categoryMap[poi.category] || 'Place',
    relevance: 1.0,
    source: 'custom'
  }
}

/**
 * Search for locations using hybrid approach:
 * 1. Check custom POI database first (instant, high quality)
 * 2. Fall back to Mapbox Geocoding API
 * 
 * Configured for UK with support for postcodes, addresses, and named places
 */
export async function searchLocations(query: string, limit = 10): Promise<SearchResult[]> {
  if (!query.trim()) return []
  
  // STEP 1: Check custom POI database first
  const customResults = searchCustomPOIs(query)
  const customSearchResults = customResults.slice(0, 3).map(customPOIToSearchResult)
  
  if (customSearchResults.length > 0) {
    console.log(`Found ${customSearchResults.length} results in custom POI database`)
  }
  
  // STEP 2: Query Mapbox for additional results
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!token) {
    console.warn('Mapbox token not found')
    return customSearchResults // Return only custom results if no Mapbox token
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim())
    
    // Calculate how many Mapbox results we need (to reach total limit)
    const mapboxLimit = Math.max(1, limit - customSearchResults.length)
    
    // Build URL with comprehensive parameters for UK searches
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?` +
      `access_token=${token}&` +
      `limit=${mapboxLimit}&` +
      // Include ALL location types including postcodes and POIs
      `types=country,region,postcode,district,place,locality,neighborhood,address,poi&` +
      // Bias results to UK (GB = Great Britain)
      `country=GB&` +
      // Add proximity to center of UK (improves POI results)
      `proximity=-3.5,54.5&` +
      // Enable autocomplete for better search-as-you-type
      `autocomplete=true&` +
      // Enable fuzzy matching for better landmark/POI matching
      `fuzzyMatch=true&` +
      // Use English language
      `language=en`

    console.log('Searching Mapbox for:', query)
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`)
    }

    const data: MapboxGeocodeResponse = await response.json()
    
    const mapboxResults = (data.features || []).map(feature => {
      // Extract the main name (first part before comma)
      const mainName = feature.place_name.split(',')[0].trim()
      
      // Determine readable type
      const placeType = feature.place_type[0]
      let readableType = placeType
      
      switch (placeType) {
        case 'postcode':
          readableType = 'Postcode'
          break
        case 'address':
          readableType = 'Address'
          break
        case 'poi':
          readableType = 'Place'
          break
        case 'place':
          readableType = 'City/Town'
          break
        case 'locality':
          readableType = 'Locality'
          break
        case 'neighborhood':
          readableType = 'Neighborhood'
          break
        case 'district':
          readableType = 'District'
          break
        case 'region':
          readableType = 'Region'
          break
      }
      
      return {
        id: feature.id,
        name: mainName,
        description: feature.place_name,
        coordinates: {
          lat: feature.center[1],
          lng: feature.center[0]
        },
        type: readableType,
        relevance: feature.relevance,
        source: 'mapbox' as const
      }
    })
    
    // Combine custom results (prioritized) with Mapbox results
    const combinedResults = [...customSearchResults, ...mapboxResults]
    
    console.log(`Total results: ${combinedResults.length} (${customSearchResults.length} custom + ${mapboxResults.length} mapbox)`)
    
    // Return up to the limit
    return combinedResults.slice(0, limit)
    
  } catch (error) {
    console.error('Geocoding error:', error)
    // Return custom results even if Mapbox fails
    return customSearchResults
  }
}

/**
 * Reverse geocode: Get place name from coordinates
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!token) {
    console.warn('Mapbox token not found')
    return null
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` +
      `access_token=${token}&` +
      `types=postcode,address,poi,place&` +
      `limit=1`

    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.status}`)
    }

    const data: MapboxGeocodeResponse = await response.json()
    
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name
    }
    
    return null
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}
