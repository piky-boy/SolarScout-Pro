import { polygonAreaSqm, centroidOf, LngLat } from './geometry'

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
]

export interface OsmBuilding {
  osmId: string
  businessName: string | null
  businessType: string | null
  buildingType: string | null
  address: string | null
  city: string | null
  latitude: number
  longitude: number
  roofAreaSqm: number
  contactPhone: string | null
  contactEmail: string | null
  website: string | null
  rawTags: Record<string, string>
}

// Classify an OSM element into a high-level business type based on tags.
export function classifyBusinessType(tags: Record<string, string>): string {
  const building = (tags.building ?? '').toLowerCase()
  const industrial = (tags.industrial ?? '').toLowerCase()
  const shop = (tags.shop ?? '').toLowerCase()
  const landuse = (tags.landuse ?? '').toLowerCase()
  const amenity = (tags.amenity ?? '').toLowerCase()
  const office = (tags.office ?? '').toLowerCase()
  const man_made = (tags.man_made ?? '').toLowerCase()

  // Residential / urban
  if (building === 'apartments' || building === 'residential') return 'Residential Block'
  if (building === 'dormitory') return 'Residential Block'
  if (building === 'hotel') return 'Hospitality'

  // Commercial / industrial
  if (building === 'warehouse' || industrial === 'warehouse') return 'Warehouse'
  if (building === 'factory' || industrial === 'factory' || industrial === 'manufacturing') return 'Factory'
  if (building === 'industrial' || landuse === 'industrial') return 'Industrial'
  if (building === 'retail' || shop) return 'Retail'
  if (building === 'supermarket') return 'Supermarket'
  if (building === 'commercial') return 'Commercial'
  if (building === 'office' || office) return 'Office'
  if (building === 'hangar' || man_made === 'storage_tank') return 'Logistics'
  if (amenity === 'fuel') return 'Fuel Station'
  if (amenity === 'marketplace') return 'Marketplace'
  return 'Commercial'
}

function buildAddress(tags: Record<string, string>): string | null {
  const street = tags['addr:street']
  const housenumber = tags['addr:housenumber']
  const city = tags['addr:city']
  const postcode = tags['addr:postcode']
  const parts: string[] = []
  if (street && housenumber) parts.push(`${street} ${housenumber}`)
  else if (street) parts.push(street)
  if (postcode) parts.push(postcode)
  if (city) parts.push(city)
  if (parts.length === 0) return null
  return parts.join(', ')
}

function extractPolygonFromWay(way: any, nodesById: Map<number, { lat: number; lon: number }>): LngLat[] {
  const nodes = Array.isArray(way?.nodes) ? way.nodes : []
  const coords: LngLat[] = []
  for (const nid of nodes) {
    const n = nodesById.get(nid)
    if (n) coords.push({ lat: n.lat, lon: n.lon })
  }
  return coords
}

function extractPolygonFromGeometry(element: any): LngLat[] {
  if (Array.isArray(element?.geometry)) {
    return element.geometry
      .filter((g: any) => typeof g?.lat === 'number' && typeof g?.lon === 'number')
      .map((g: any) => ({ lat: g.lat, lon: g.lon }))
  }
  return []
}

// Build the Overpass QL query for commercial, industrial, AND residential buildings.
function buildQuery(bbox: [number, number, number, number], limit: number): string {
  // bbox order for Overpass: south, west, north, east
  const [minLon, minLat, maxLon, maxLat] = bbox
  const bboxStr = `${minLat},${minLon},${maxLat},${maxLon}`
  return `
[out:json][timeout:45];
(
  way["building"~"^(warehouse|factory|industrial|commercial|retail|supermarket|office|hangar|apartments|residential|dormitory|hotel)$"](${bboxStr});
  way["industrial"](${bboxStr});
  way["landuse"="industrial"]["building"](${bboxStr});
  way["building:levels"]["building"~"^(apartments|residential|yes)$"](${bboxStr});
);
out tags geom ${limit};
`.trim()
}

async function fetchOverpass(query: string): Promise<any> {
  let lastError: unknown = null
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'SolarScoutPro/1.0 (solar lead generation)',
        },
        body: `data=${encodeURIComponent(query)}`,
        cache: 'no-store',
      })
      if (!res.ok) {
        lastError = new Error(`Overpass HTTP ${res.status} at ${endpoint}`)
        continue
      }
      return await res.json()
    } catch (err) {
      lastError = err
      continue
    }
  }
  throw lastError ?? new Error('All Overpass endpoints failed')
}

export interface FindCommercialBuildingsOptions {
  bbox: [number, number, number, number] // [minLon, minLat, maxLon, maxLat]
  city?: string
  minRoofArea?: number // sqm
  limit?: number
}

export async function findCommercialBuildings(
  opts: FindCommercialBuildingsOptions,
): Promise<OsmBuilding[]> {
  const limit = Math.max(10, Math.min(opts.limit ?? 150, 500))
  const query = buildQuery(opts.bbox, limit)
  const data = await fetchOverpass(query)
  const elements: any[] = Array.isArray(data?.elements) ? data.elements : []

  // Build node map (only needed when geometry isn't inlined - "out tags geom" inlines it).
  const nodesById = new Map<number, { lat: number; lon: number }>()
  for (const el of elements) {
    if (el?.type === 'node' && typeof el.id === 'number') {
      nodesById.set(el.id, { lat: el.lat, lon: el.lon })
    }
  }

  const ways = elements.filter((el) => el?.type === 'way')
  const buildings: OsmBuilding[] = []

  // Different minimum area thresholds by building type
  const defaultMinArea = opts.minRoofArea ?? 150

  for (const way of ways) {
    const tags: Record<string, string> = (way?.tags ?? {}) as Record<string, string>
    if (!tags) continue

    const building = (tags.building ?? '').toLowerCase()

    // Skip tiny single-family houses, garages, sheds
    if (['house', 'detached', 'terrace', 'garage', 'garages', 'shed', 'cabin', 'hut'].includes(building)) {
      continue
    }

    // For "yes" tagged buildings, only include if they have building:levels (likely apartment blocks)
    if (building === 'yes' && !tags['building:levels']) {
      continue
    }

    let coords = extractPolygonFromGeometry(way)
    if (coords.length === 0) coords = extractPolygonFromWay(way, nodesById)
    if (coords.length < 3) continue

    const area = polygonAreaSqm(coords)
    if (!Number.isFinite(area)) continue

    // Apartment blocks / residential: allow smaller footprints (multi-storey = more BIPV area)
    const isResidential = ['apartments', 'residential', 'dormitory'].includes(building) || tags['building:levels']
    const minArea = isResidential ? Math.min(defaultMinArea, 100) : defaultMinArea
    if (area < minArea) continue

    const centroid = centroidOf(coords)
    if (!centroid) continue

    const name =
      tags.name ??
      tags['name:en'] ??
      tags.operator ??
      tags.brand ??
      null

    buildings.push({
      osmId: `way/${way.id}`,
      businessName: name ? String(name) : null,
      businessType: classifyBusinessType(tags),
      buildingType: building || null,
      address: buildAddress(tags) ?? null,
      city: tags['addr:city'] ?? opts.city ?? null,
      latitude: centroid.lat,
      longitude: centroid.lon,
      roofAreaSqm: Math.round(area),
      contactPhone: tags.phone ?? tags['contact:phone'] ?? null,
      contactEmail: tags.email ?? tags['contact:email'] ?? null,
      website: tags.website ?? tags['contact:website'] ?? null,
      rawTags: tags,
    })
  }

  // Sort by roof area descending (largest = best solar candidates)
  buildings.sort((a, b) => (b.roofAreaSqm ?? 0) - (a.roofAreaSqm ?? 0))

  // Cap results
  return buildings.slice(0, limit)
}
