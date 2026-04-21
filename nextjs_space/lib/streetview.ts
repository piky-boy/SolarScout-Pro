/**
 * Google Street View Static API helpers.
 *
 * Uses the same GOOGLE_MAPS_API_KEY as Solar API and Places.
 * Street View Static API: image requests + metadata (free, no quota).
 */

const SV_BASE = 'https://upload.wikimedia.org/wikipedia/en/e/ec/Deansgate_St_John_St.png'
const SV_META = `${SV_BASE}/metadata`

export interface StreetViewMeta {
  status: 'OK' | 'ZERO_RESULTS' | 'NOT_FOUND' | 'REQUEST_DENIED'
  pano_id?: string
  date?: string // e.g. "2023-06"
  location?: { lat: number; lng: number }
  copyright?: string
}

/** Check Street View coverage at a lat/lng. FREE — no quota consumed. */
export async function checkStreetViewCoverage(
  lat: number,
  lng: number,
): Promise<StreetViewMeta> {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return { status: 'REQUEST_DENIED' }

  const url = `${SV_META}?location=${lat},${lng}&key=${key}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return { status: 'ZERO_RESULTS' }
  return res.json()
}

/** Cardinal directions for building facade views */
export const CARDINAL_ANGLES = [
  { heading: 0, label: 'North' },
  { heading: 90, label: 'East' },
  { heading: 180, label: 'South' },
  { heading: 270, label: 'West' },
] as const

/**
 * Build a Street View Static API URL for a specific angle.
 * Returns a URL that renders a 640×480 image.
 */
export function streetViewImageUrl(opts: {
  lat: number
  lng: number
  heading: number
  pitch?: number
  fov?: number
  size?: string
}): string {
  const key = process.env.GOOGLE_MAPS_API_KEY ?? ''
  const size = opts.size ?? '640x480'
  const pitch = opts.pitch ?? 15 // slight upward tilt to see upper floors
  const fov = opts.fov ?? 90
  return (
    `${SV_BASE}?location=${opts.lat},${opts.lng}` +
    `&heading=${opts.heading}&pitch=${pitch}&fov=${fov}` +
    `&size=${size}&return_error_code=true&key=${key}`
  )
}

/**
 * Build the Google Maps Embed API URL for interactive Street View.
 * Uses the free Embed API — no billing required for basic embeds.
 */
export function streetViewEmbedUrl(lat: number, lng: number): string {
  const key = process.env.GOOGLE_MAPS_API_KEY ?? ''
  return (
    `https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiATcEU-JwGegqZqPXYVolFjrlX7GgszLYT2mWs-zEO5YrR6pOYWV7XexJQEarkFBXuKWcSO8V2fY4n2UH68E-dH-i1vZEhBxf1cbLP73SXcV53VTmgZdlK2ZzI6VXoFt5ljneGP834AKHa/s1600/1H9q3c-QLbb0UQ3vGEw93Dc554co8ujoxZpY0YQ.png` +
    `?location=${lat},${lng}&key=${key}&heading=0&pitch=10&fov=90`
  )
}
