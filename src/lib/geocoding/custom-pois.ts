/**
 * Custom UK Points of Interest Database
 * Fills gaps in Mapbox's POI coverage for well-known UK landmarks and institutions
 */

export interface CustomPOI {
  name: string
  aliases: string[] // Alternative names people might search for
  lat: number
  lng: number
  postcode: string
  city: string
  description: string
  category: 'landmark' | 'university' | 'monument' | 'building' | 'attraction'
}

export const UK_CUSTOM_POIS: CustomPOI[] = [
  // Universities
  {
    name: "Teesside University",
    aliases: ["teesside uni", "teesside", "tu middlesbrough", "tees uni"],
    lat: 54.5742,
    lng: -1.2349,
    postcode: "TS1 3BX",
    city: "Middlesbrough",
    description: "Teesside University, Borough Road, Middlesbrough",
    category: "university"
  },
  {
    name: "Durham University",
    aliases: ["durham uni", "durham"],
    lat: 54.7753,
    lng: -1.5849,
    postcode: "DH1 3LE",
    city: "Durham",
    description: "Durham University, Durham",
    category: "university"
  },
  {
    name: "Newcastle University",
    aliases: ["newcastle uni", "ncl uni"],
    lat: 54.9783,
    lng: -1.6178,
    postcode: "NE1 7RU",
    city: "Newcastle upon Tyne",
    description: "Newcastle University, Newcastle upon Tyne",
    category: "university"
  },
  {
    name: "University of Oxford",
    aliases: ["oxford uni", "oxford university", "oxford"],
    lat: 51.7548,
    lng: -1.2544,
    postcode: "OX1 2JD",
    city: "Oxford",
    description: "University of Oxford, Oxford",
    category: "university"
  },
  {
    name: "University of Cambridge",
    aliases: ["cambridge uni", "cambridge university", "cambridge"],
    lat: 52.2043,
    lng: 0.1218,
    postcode: "CB2 1TN",
    city: "Cambridge",
    description: "University of Cambridge, Cambridge",
    category: "university"
  },
  
  // London Landmarks
  {
    name: "Big Ben",
    aliases: ["elizabeth tower", "big ben clock", "parliament clock", "westminster clock"],
    lat: 51.5007,
    lng: -0.1246,
    postcode: "SW1A 0AA",
    city: "London",
    description: "Big Ben (Elizabeth Tower), Westminster, London",
    category: "landmark"
  },
  {
    name: "Buckingham Palace",
    aliases: ["buckingham", "the palace", "royal palace"],
    lat: 51.5014,
    lng: -0.1419,
    postcode: "SW1A 1AA",
    city: "London",
    description: "Buckingham Palace, London",
    category: "landmark"
  },
  {
    name: "Tower of London",
    aliases: ["tower london", "the tower", "london tower"],
    lat: 51.5081,
    lng: -0.0759,
    postcode: "EC3N 4AB",
    city: "London",
    description: "Tower of London, London",
    category: "landmark"
  },
  {
    name: "Tower Bridge",
    aliases: ["london bridge tower", "tower bridge london"],
    lat: 51.5055,
    lng: -0.0754,
    postcode: "SE1 2UP",
    city: "London",
    description: "Tower Bridge, London",
    category: "landmark"
  },
  {
    name: "London Eye",
    aliases: ["the eye", "millennium wheel"],
    lat: 51.5033,
    lng: -0.1196,
    postcode: "SE1 7PB",
    city: "London",
    description: "London Eye, South Bank, London",
    category: "attraction"
  },
  {
    name: "The Shard",
    aliases: ["shard london", "shard tower"],
    lat: 51.5045,
    lng: -0.0865,
    postcode: "SE1 9SG",
    city: "London",
    description: "The Shard, London Bridge, London",
    category: "building"
  },
  
  // North East Landmarks
  {
    name: "Angel of the North",
    aliases: ["angel north", "gateshead angel", "the angel"],
    lat: 54.9144,
    lng: -1.5859,
    postcode: "NE9 7TY",
    city: "Gateshead",
    description: "Angel of the North, Gateshead",
    category: "monument"
  },
  {
    name: "Durham Cathedral",
    aliases: ["durham cathedral church"],
    lat: 54.7732,
    lng: -1.5755,
    postcode: "DH1 3EH",
    city: "Durham",
    description: "Durham Cathedral, Durham",
    category: "landmark"
  },
  {
    name: "Hadrian's Wall",
    aliases: ["hadrians wall", "roman wall"],
    lat: 55.0244,
    lng: -2.2911,
    postcode: "NE47 7AN",
    city: "Northumberland",
    description: "Hadrian's Wall, Northumberland",
    category: "monument"
  },
  
  // Other Major UK Landmarks
  {
    name: "Edinburgh Castle",
    aliases: ["edinburgh castle scotland", "castle edinburgh"],
    lat: 55.9486,
    lng: -3.2008,
    postcode: "EH1 2NG",
    city: "Edinburgh",
    description: "Edinburgh Castle, Edinburgh",
    category: "landmark"
  },
  {
    name: "Stonehenge",
    aliases: ["stone henge", "stonehenge monument"],
    lat: 51.1789,
    lng: -1.8262,
    postcode: "SP4 7DE",
    city: "Salisbury",
    description: "Stonehenge, near Salisbury",
    category: "monument"
  },
  {
    name: "Blackpool Tower",
    aliases: ["blackpool tower uk"],
    lat: 53.8159,
    lng: -3.0555,
    postcode: "FY1 4BJ",
    city: "Blackpool",
    description: "Blackpool Tower, Blackpool",
    category: "landmark"
  }
]

/**
 * Search custom POI database
 * @param query Search query
 * @returns Matching POIs sorted by relevance
 */
export function searchCustomPOIs(query: string): CustomPOI[] {
  const normalizedQuery = query.toLowerCase().trim()
  
  if (!normalizedQuery) return []
  
  const matches: Array<{ poi: CustomPOI; score: number }> = []
  
  for (const poi of UK_CUSTOM_POIS) {
    let score = 0
    
    // Check main name (highest priority)
    if (poi.name.toLowerCase() === normalizedQuery) {
      score = 100 // Exact match
    } else if (poi.name.toLowerCase().includes(normalizedQuery)) {
      score = 80 // Contains query
    } else if (normalizedQuery.includes(poi.name.toLowerCase())) {
      score = 70 // Query contains name
    }
    
    // Check aliases
    for (const alias of poi.aliases) {
      if (alias === normalizedQuery) {
        score = Math.max(score, 90) // Exact alias match
      } else if (alias.includes(normalizedQuery)) {
        score = Math.max(score, 60) // Alias contains query
      } else if (normalizedQuery.includes(alias)) {
        score = Math.max(score, 50) // Query contains alias
      }
    }
    
    // Check city
    if (normalizedQuery.includes(poi.city.toLowerCase())) {
      score += 10 // Bonus for city match
    }
    
    // Check postcode
    if (normalizedQuery.includes(poi.postcode.toLowerCase().replace(/\s/g, ''))) {
      score += 20 // Bonus for postcode match
    }
    
    if (score > 0) {
      matches.push({ poi, score })
    }
  }
  
  // Sort by score descending
  matches.sort((a, b) => b.score - a.score)
  
  // Return top matches
  return matches.map(m => m.poi)
}
