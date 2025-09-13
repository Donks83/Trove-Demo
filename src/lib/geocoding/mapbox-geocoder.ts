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

export async function searchLocations(query: string, limit = 5): Promise<SearchResult[]> {
  if (!query.trim()) return []
  
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!token) {
    console.warn('Mapbox token not found')
    return []
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim())
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?` +
      `access_token=${token}&` +
      `limit=${limit}&` +
      `types=country,region,place,locality,neighborhood,address,poi`

    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`)
    }

    const data: MapboxGeocodeResponse = await response.json()
    
    return data.features.map(feature => ({
      id: feature.id,
      name: feature.place_name.split(',')[0], // First part is usually the main name
      description: feature.place_name,
      coordinates: {
        lat: feature.center[1],
        lng: feature.center[0]
      },
      type: feature.place_type[0] || 'location'
    }))
    
  } catch (error) {
    console.error('Geocoding error:', error)
    return []
  }
}