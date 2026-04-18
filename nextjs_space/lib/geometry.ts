// Geometry helpers for estimating roof area from a building polygon.
// OSM building polygons are returned as arrays of [lon, lat] coordinates.

export type LngLat = { lat: number; lon: number }

// Project lat/lon to local planar (meters) using equirectangular approximation
// anchored at the polygon's mean latitude. Accurate enough for small building
// footprints (< 1 km).
export function polygonAreaSqm(coords: LngLat[]): number {
  if (!Array.isArray(coords) || coords.length < 3) return 0
  const meanLat = coords.reduce((s, c) => s + (c?.lat ?? 0), 0) / coords.length
  const latRad = (meanLat * Math.PI) / 180
  const metersPerDegLat = 111_132
  const metersPerDegLon = 111_320 * Math.cos(latRad)

  const pts = coords.map((c) => ({
    x: (c?.lon ?? 0) * metersPerDegLon,
    y: (c?.lat ?? 0) * metersPerDegLat,
  }))

  // Shoelace formula
  let sum = 0
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    sum += a.x * b.y - b.x * a.y
  }
  return Math.abs(sum) / 2
}

export function centroidOf(coords: LngLat[]): LngLat | null {
  if (!Array.isArray(coords) || coords.length === 0) return null
  let sumLat = 0
  let sumLon = 0
  for (const c of coords) {
    sumLat += c?.lat ?? 0
    sumLon += c?.lon ?? 0
  }
  return { lat: sumLat / coords.length, lon: sumLon / coords.length }
}

// Convert a bounding box to a radius in meters for a circular search.
export function bboxRadiusMeters(bbox: [number, number, number, number]): number {
  const [minLon, minLat, maxLon, maxLat] = bbox
  const meanLat = (minLat + maxLat) / 2
  const latMeters = (maxLat - minLat) * 111_132
  const lonMeters = (maxLon - minLon) * 111_320 * Math.cos((meanLat * Math.PI) / 180)
  return Math.max(latMeters, lonMeters) / 2
}
