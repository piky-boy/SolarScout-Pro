const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''

export interface GeocodeResult {
  placeName: string
  center: [number, number] // lon, lat
  bbox: [number, number, number, number] | null // minLon, minLat, maxLon, maxLat
  city: string | null
  countryCode: string | null
  countryName: string | null
}

// Forward geocode using Mapbox, restricted to our supported countries.
export async function mapboxGeocode(query: string, limit = 5): Promise<GeocodeResult[]> {
  if (!MAPBOX_TOKEN) throw new Error('Mapbox token is not configured')
  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`)
  url.searchParams.set('access_token', MAPBOX_TOKEN)
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('types', 'region,district,place,locality,neighborhood,postcode')
  url.searchParams.set('country', 'ro,es,pt,al')
  url.searchParams.set('autocomplete', 'true')

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) throw new Error(`Mapbox geocode failed: ${res.status}`)
  const data = await res.json()
  const features: any[] = Array.isArray(data?.features) ? data.features : []

  return features.map((f: any): GeocodeResult => {
    const context: any[] = Array.isArray(f?.context) ? f.context : []
    const countryCtx = context.find((c: any) => typeof c?.id === 'string' && c.id.startsWith('country'))
    const placeCtx = context.find((c: any) => typeof c?.id === 'string' && (c.id.startsWith('place') || c.id.startsWith('locality')))
    const isPlace = typeof f?.id === 'string' && (f.id.startsWith('place') || f.id.startsWith('locality'))
    return {
      placeName: f?.place_name ?? f?.text ?? query,
      center: Array.isArray(f?.center) ? [Number(f.center[0]), Number(f.center[1])] : [0, 0],
      bbox: Array.isArray(f?.bbox) && f.bbox.length === 4
        ? [Number(f.bbox[0]), Number(f.bbox[1]), Number(f.bbox[2]), Number(f.bbox[3])]
        : null,
      city: isPlace ? f?.text ?? null : placeCtx?.text ?? null,
      countryCode: (countryCtx?.short_code ?? '').toString().toUpperCase() || null,
      countryName: countryCtx?.text ?? null,
    }
  })
}

// Compute a bbox around a centerpoint when Mapbox doesn't return one (fallback).
export function bboxFromCenter(center: [number, number], radiusKm = 3): [number, number, number, number] {
  const [lon, lat] = center
  const latDelta = radiusKm / 111
  const lonDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180))
  return [lon - lonDelta, lat - latDelta, lon + lonDelta, lat + latDelta]
}

// If bbox is very large (whole region), clamp to avoid hammering Overpass.
export function clampBbox(
  bbox: [number, number, number, number],
  maxDegrees = 0.4,
): [number, number, number, number] {
  const [minLon, minLat, maxLon, maxLat] = bbox
  const centerLon = (minLon + maxLon) / 2
  const centerLat = (minLat + maxLat) / 2
  const lonSpan = Math.min(maxLon - minLon, maxDegrees)
  const latSpan = Math.min(maxLat - minLat, maxDegrees)
  return [
    centerLon - lonSpan / 2,
    centerLat - latSpan / 2,
    centerLon + lonSpan / 2,
    centerLat + latSpan / 2,
  ]
}
