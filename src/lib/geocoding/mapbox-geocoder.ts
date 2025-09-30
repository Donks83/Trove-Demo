interface GeocodeResult {
  id: string
  place_name: string
  center: [number, number] // [lng, lat]
  place_type: string[]
  relevance: number
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
}

/**
 * Search for locations using Mapbox Geocoding API
 * Configured for UK with support for postcodes, addresses, and named places
 */
export async function searchLocations(query: string, limit = 5): Promise<SearchResult[]> {
  if (!query.trim()) return []
  
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!token) {
    console.warn('Mapbox token not found')
    return []
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim())
    
    // Build URL with comprehensive parameters for UK searches
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?` +
      `access_token=${token}&` +
      `limit=${limit}&` +
      // Include ALL location types including postcodes and POIs
      `types=country,region,postcode,district,place,locality,neighborhood,address,poi&` +
      // Bias results to UK (GB = Great Britain)
      `country=GB&` +
      // Enable autocomplete for better search-as-you-type
      `autocomplete=true&` +
      // Use English language
      `language=en`

    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`)
    }

    const data: MapboxGeocodeResponse = await response.json()
    
    if (!data.features || data.features.length === 0) {
      console.log('No results found for query:', query)
      return []
    }
    
    return data.features.map(feature => {
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
        relevance: feature.relevance
      }
    })
    
  } catch (error) {
    console.error('Geocoding error:', error)
    return []
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
