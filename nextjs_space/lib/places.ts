// Google Places API (New) client — hybrid lead discovery companion.
//
// Strategy:
//  - Places gives us real business identities: name, phone, website, hours,
//    category, POI class, ratings. Best in Eastern Europe where OSM is thin.
//  - OSM gives us building polygons → roof area (critical for solar).
//  - We match by spatial proximity (<40m) so the same rooftop shows up once.
//
// Endpoints used:
//  - POST https://places.googleapis.com/v1/places:searchNearby (new API)
//  - Field mask drives pricing; contact fields are $3/1k vs $32/1k nearby.

export interface PlacesSearchArgs {
  center: { lat: number; lon: number }
  radiusMeters: number
  includedTypes?: string[]
  maxResults?: number
}

export interface PlaceLead {
  googlePlaceId: string
  businessName: string | null
  businessType: string | null
  primaryType: string | null
  address: string | null
  city: string | null
  latitude: number
  longitude: number
  contactPhone: string | null
  website: string | null
  openingHours: any | null
  rating: number | null
  ratingCount: number | null
  businessStatus: string | null
  rawTypes: string[]
}

// Place types the Places API (New) accepts for building discovery.
// Reference: https://developers.google.com/maps/documentation/places/web-service/place-types
// Limited to 50 types per request; we curate the strongest commercial,
// industrial, and residential signals — buildings with solar/BIPV potential.
export const COMMERCIAL_PLACE_TYPES = [
  // Retail & shopping
  'supermarket',
  'shopping_mall',
  'home_goods_store',
  'hardware_store',
  'department_store',
  'electronics_store',
  'furniture_store',
  'book_store',
  'clothing_store',
  'convenience_store',
  // Food & hospitality
  'restaurant',
  'cafe',
  'bakery',
  'meal_takeaway',
  'bar',
  'hotel',
  'lodging',
  // Automotive & industrial
  'car_dealer',
  'car_repair',
  'car_wash',
  'gas_station',
  // Business services
  'gym',
  'storage',
  'warehouse_store',
  // Health
  'pharmacy',
  'hospital',
  'medical_lab',
  'doctor',
  // Education
  'school',
  'university',
  // Recreation
  'stadium',
  'movie_theater',
  // Residential & urban (for BIPV balcony scanning)
  'apartment_complex',
  'apartment_building',
  'condominium_complex',
]

const PLACES_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchNearby'

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.types',
  'places.primaryType',
  'places.primaryTypeDisplayName',
  'places.businessStatus',
  'places.rating',
  'places.userRatingCount',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.regularOpeningHours',
  'places.addressComponents',
].join(',')

export function isPlacesApiConfigured(): boolean {
  const key = process.env.GOOGLE_MAPS_API_KEY
  return typeof key === 'string' && key.length > 20 && !key.startsWith('YOUR_')
}

function classifyPlaceType(primary: string | null, types: string[]): string {
  const all = new Set([primary, ...types].filter(Boolean) as string[])
  // Residential / urban
  if (all.has('apartment_complex') || all.has('apartment_building') || all.has('condominium_complex')) return 'Residential Block'
  if (all.has('supermarket') || all.has('shopping_mall') || all.has('department_store')) return 'Supermarket'
  if (all.has('warehouse_store') || all.has('storage')) return 'Warehouse'
  if (all.has('car_dealer') || all.has('car_repair') || all.has('car_wash')) return 'Automotive'
  if (all.has('gas_station')) return 'Fuel Station'
  if (all.has('hotel') || all.has('lodging')) return 'Hospitality'
  if (all.has('restaurant') || all.has('cafe') || all.has('bakery') || all.has('bar') || all.has('meal_takeaway')) {
    return 'Food & Beverage'
  }
  if (all.has('gym') || all.has('stadium') || all.has('movie_theater')) return 'Leisure'
  if (all.has('hospital') || all.has('medical_lab') || all.has('pharmacy') || all.has('doctor')) return 'Healthcare'
  if (all.has('school') || all.has('university')) return 'Education'
  if (all.has('hardware_store') || all.has('home_goods_store') || all.has('electronics_store') || all.has('furniture_store') || all.has('book_store') || all.has('clothing_store') || all.has('convenience_store')) {
    return 'Retail'
  }
  return 'Commercial'
}

function pickCityFromComponents(components: any[] | undefined): string | null {
  if (!Array.isArray(components)) return null
  // Prefer locality, then postal_town, then administrative_area_level_2.
  const byType = (t: string) => components.find((c) => Array.isArray(c?.types) && c.types.includes(t))
  return (
    byType('locality')?.longText ??
    byType('postal_town')?.longText ??
    byType('administrative_area_level_2')?.longText ??
    null
  )
}

/**
 * Nearby search for commercial places. Returns at most 20 per call (Google cap).
 * Caller can issue multiple calls with different type subsets if needed.
 */
export async function searchNearbyPlaces(args: PlacesSearchArgs): Promise<PlaceLead[]> {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) throw new Error('GOOGLE_MAPS_API_KEY is not set')

  const body: any = {
    includedTypes: args.includedTypes ?? COMMERCIAL_PLACE_TYPES,
    maxResultCount: Math.min(args.maxResults ?? 20, 20),
    rankPreference: 'POPULARITY',
    locationRestriction: {
      circle: {
        center: { latitude: args.center.lat, longitude: args.center.lon },
        radius: Math.min(Math.max(args.radiusMeters, 100), 50_000),
      },
    },
  }

  const res = await fetch(PLACES_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    // Bubble up a clear message so the generate route can surface it.
    throw new Error(`Places API ${res.status}: ${txt.slice(0, 300)}`)
  }

  const json = await res.json().catch(() => ({} as any))
  const rawPlaces: any[] = Array.isArray(json?.places) ? json.places : []

  const mapped: Array<PlaceLead | null> = rawPlaces.map((p): PlaceLead | null => {
    const lat = p?.location?.latitude
    const lon = p?.location?.longitude
    if (typeof lat !== 'number' || typeof lon !== 'number') return null
    const id: string = typeof p?.id === 'string' ? p.id : ''
    if (!id) return null
    const types: string[] = Array.isArray(p?.types) ? p.types : []
    const primaryType: string | null = typeof p?.primaryType === 'string' ? p.primaryType : null
    const businessName: string | null =
      typeof p?.displayName?.text === 'string' && p.displayName.text.length > 0 ? p.displayName.text : null
    const address: string | null =
      typeof p?.formattedAddress === 'string' && p.formattedAddress.length > 0 ? p.formattedAddress : null
    const city = pickCityFromComponents(p?.addressComponents)
    const phone: string | null =
      (typeof p?.nationalPhoneNumber === 'string' && p.nationalPhoneNumber) ||
      (typeof p?.internationalPhoneNumber === 'string' && p.internationalPhoneNumber) ||
      null
    const website: string | null =
      typeof p?.websiteUri === 'string' && p.websiteUri.length > 0 ? p.websiteUri : null
    const hours = p?.regularOpeningHours ?? null
    const rating: number | null = typeof p?.rating === 'number' ? p.rating : null
    const ratingCount: number | null = typeof p?.userRatingCount === 'number' ? p.userRatingCount : null
    const businessStatus: string | null = typeof p?.businessStatus === 'string' ? p.businessStatus : null

    const primaryTypeDisplay: string | null =
      typeof p?.primaryTypeDisplayName?.text === 'string' ? p.primaryTypeDisplayName.text : primaryType

    return {
      googlePlaceId: id,
      businessName,
      businessType: classifyPlaceType(primaryType, types),
      primaryType: primaryTypeDisplay,
      address,
      city,
      latitude: lat,
      longitude: lon,
      contactPhone: phone,
      website,
      openingHours: hours,
      rating,
      ratingCount,
      businessStatus,
      rawTypes: types,
    }
  })

  const results: PlaceLead[] = mapped
    .filter((x): x is PlaceLead => x !== null)
    // Drop permanently-closed places — dead leads.
    .filter((p) => p.businessStatus !== 'CLOSED_PERMANENTLY')

  return results
}

/**
 * Issue up to N calls in parallel, one per type chunk. Places API (New) has a
 * hard limit of 20 results per call, so this unlocks more discovery per scan
 * by splitting the type taxonomy across parallel requests.
 */
export async function searchNearbyPlacesFanout(args: PlacesSearchArgs): Promise<PlaceLead[]> {
  if (!isPlacesApiConfigured()) return []

  // Partition the type catalog into chunks small enough to get 20 results per type family.
  const types = args.includedTypes ?? COMMERCIAL_PLACE_TYPES
  const chunks: string[][] = []
  const chunkSize = 8
  for (let i = 0; i < types.length; i += chunkSize) {
    chunks.push(types.slice(i, i + chunkSize))
  }

  const results = await Promise.allSettled(
    chunks.map((typeChunk) =>
      searchNearbyPlaces({
        center: args.center,
        radiusMeters: args.radiusMeters,
        includedTypes: typeChunk,
        maxResults: 20,
      }),
    ),
  )

  // Merge, dedupe by googlePlaceId.
  const byId = new Map<string, PlaceLead>()
  for (const r of results) {
    if (r.status === 'fulfilled') {
      for (const p of r.value) {
        if (!byId.has(p.googlePlaceId)) byId.set(p.googlePlaceId, p)
      }
    } else {
      console.warn('[places] fan-out chunk failed:', r.reason?.message ?? r.reason)
    }
  }

  return Array.from(byId.values())
}

/**
 * Quick haversine distance in meters — used for OSM ↔ Places matching.
 */
export function haversineMeters(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6_371_000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const sinLat = Math.sin(dLat / 2)
  const sinLon = Math.sin(dLon / 2)
  const x = sinLat * sinLat + sinLon * sinLon * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)))
}
