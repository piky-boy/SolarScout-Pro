import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { mapboxGeocode, bboxFromCenter, clampBbox } from '@/lib/mapbox'
import { findCommercialBuildings, type OsmBuilding } from '@/lib/overpass'
import { searchNearbyPlacesFanout, isPlacesApiConfigured, haversineMeters, type PlaceLead } from '@/lib/places'
import { getEffectivePlan } from '@/lib/stripe'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Spatial match radius: if an OSM building and a Google Place are within
// this distance, we treat them as the same rooftop and merge their data.
const MATCH_RADIUS_M = 40

// Countries where OSM is rich enough to be our primary source; Places is
// then used only to enrich with contact data.
const OSM_PRIMARY_COUNTRIES = new Set(['ES', 'PT', 'GB'])

interface MergedLead {
  // Identity
  osmId: string | null
  googlePlaceId: string | null
  dataSource: 'OSM' | 'GOOGLE_PLACES' | 'HYBRID'
  // Geo
  latitude: number
  longitude: number
  // Business identity (Places wins when available)
  businessName: string | null
  businessType: string | null
  buildingType: string | null
  address: string | null
  city: string | null
  // Roof footprint (OSM only)
  roofAreaSqm: number | null
  // Contact (Places wins)
  contactPhone: string | null
  contactEmail: string | null
  website: string | null
  // Extras
  openingHours: any | null
  googleRating: number | null
  googleRatingCount: number | null
}

function mergeOsmWithPlace(osm: OsmBuilding, place: PlaceLead | null): MergedLead {
  const hybrid = place !== null
  return {
    osmId: osm.osmId,
    googlePlaceId: place?.googlePlaceId ?? null,
    dataSource: hybrid ? 'HYBRID' : 'OSM',
    latitude: osm.latitude,
    longitude: osm.longitude,
    businessName: place?.businessName ?? osm.businessName,
    businessType: place?.businessType ?? osm.businessType,
    buildingType: osm.buildingType,
    address: place?.address ?? osm.address,
    city: place?.city ?? osm.city,
    roofAreaSqm: osm.roofAreaSqm,
    contactPhone: place?.contactPhone ?? osm.contactPhone,
    contactEmail: osm.contactEmail,
    website: place?.website ?? osm.website,
    openingHours: place?.openingHours ?? null,
    googleRating: place?.rating ?? null,
    googleRatingCount: place?.ratingCount ?? null,
  }
}

function placeOnlyLead(place: PlaceLead): MergedLead {
  return {
    osmId: null,
    googlePlaceId: place.googlePlaceId,
    dataSource: 'GOOGLE_PLACES',
    latitude: place.latitude,
    longitude: place.longitude,
    businessName: place.businessName,
    businessType: place.businessType,
    buildingType: null,
    address: place.address,
    city: place.city,
    roofAreaSqm: null,
    contactPhone: place.contactPhone,
    contactEmail: null,
    website: place.website,
    openingHours: place.openingHours,
    googleRating: place.rating,
    googleRatingCount: place.ratingCount,
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // ── Plan limits ─────────────────────────────────────────────────────────
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, stripeCurrentPeriodEnd: true },
    })
    const activePlan = getEffectivePlan(dbUser ?? { plan: 'free' })

    if (activePlan.scansPerMonth !== -1) {
      // Count scans this calendar month
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      const scansThisMonth = await prisma.searchHistory.count({
        where: { userId, createdAt: { gte: monthStart } },
      })
      if (scansThisMonth >= activePlan.scansPerMonth) {
        return NextResponse.json(
          {
            error: 'scan_limit_reached',
            message: `You have used all ${activePlan.scansPerMonth} scans for this month on the ${activePlan.name} plan.`,
            plan: activePlan.id,
            limit: activePlan.scansPerMonth,
          },
          { status: 402 },
        )
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    const body = await request.json().catch(() => ({}))
    const location = (body?.location ?? '').toString().trim()
    // Cap leads per scan to plan limit
    const planLeadCap = activePlan.leadsPerScan
    const requestedLimit = Math.max(10, Math.min(Number(body?.limit ?? 75), 250))
    const limit = planLeadCap === -1 ? requestedLimit : Math.min(requestedLimit, planLeadCap)
    if (!location) return NextResponse.json({ error: 'Location is required' }, { status: 400 })

    // Step 1: geocode location
    const geoResults = await mapboxGeocode(location, 1)
    const geo = geoResults?.[0]
    if (!geo) {
      return NextResponse.json(
        { error: 'No matching location found in supported countries (RO, ES, PT, AL, GB).' },
        { status: 404 },
      )
    }

    // Step 2: compute bbox + center
    let bbox: [number, number, number, number] = geo.bbox ?? bboxFromCenter(geo.center, 3)
    bbox = clampBbox(bbox, 0.3)
    // geo.center is [lon, lat] per Mapbox convention.
    const centerLon = geo.center[0]
    const centerLat = geo.center[1]
    const countryCode = geo.countryCode?.toUpperCase() ?? ''
    const osmPrimary = OSM_PRIMARY_COUNTRIES.has(countryCode)
    const placesEnabled = isPlacesApiConfigured()

    // Approx radius (meters) from clamped bbox — for Places circle search.
    // Half the diagonal of the bbox in meters, capped to avoid huge searches.
    const latSpan = Math.abs(bbox[3] - bbox[1])
    const lonSpan = Math.abs(bbox[2] - bbox[0]) * Math.cos((centerLat * Math.PI) / 180)
    const diagDeg = Math.sqrt(latSpan * latSpan + lonSpan * lonSpan)
    const radiusMeters = Math.min(Math.max((diagDeg * 111_000) / 2, 500), 25_000)

    // Step 3: fetch OSM + Places in parallel
    const [osmResult, placesResult] = await Promise.allSettled([
      findCommercialBuildings({
        bbox,
        city: geo.city ?? undefined,
        limit,
        minRoofArea: 200,
      }),
      placesEnabled
        ? searchNearbyPlacesFanout({
            center: { lat: centerLat, lon: centerLon },
            radiusMeters,
            maxResults: 20,
          })
        : Promise.resolve([] as PlaceLead[]),
    ])

    const osmBuildings: OsmBuilding[] = osmResult.status === 'fulfilled' ? osmResult.value : []
    const places: PlaceLead[] = placesResult.status === 'fulfilled' ? placesResult.value : []

    if (osmResult.status === 'rejected') {
      console.warn('[generate] OSM query failed:', (osmResult.reason as any)?.message ?? osmResult.reason)
    }
    if (placesResult.status === 'rejected') {
      console.warn('[generate] Places query failed:', (placesResult.reason as any)?.message ?? placesResult.reason)
    }

    // Step 4: dedupe + merge
    const matchedPlaceIds = new Set<string>()
    const merged: MergedLead[] = []

    for (const b of osmBuildings) {
      let bestMatch: PlaceLead | null = null
      let bestDist = Infinity
      for (const p of places) {
        if (matchedPlaceIds.has(p.googlePlaceId)) continue
        const d = haversineMeters({ lat: b.latitude, lon: b.longitude }, { lat: p.latitude, lon: p.longitude })
        if (d < bestDist && d <= MATCH_RADIUS_M) {
          bestDist = d
          bestMatch = p
        }
      }
      if (bestMatch) matchedPlaceIds.add(bestMatch.googlePlaceId)
      merged.push(mergeOsmWithPlace(b, bestMatch))
    }

    // Add Places-only leads (buildings that OSM missed).
    // Only do this for OSM-thin markets (RO, AL) or when OSM produced nothing at all.
    if (!osmPrimary || osmBuildings.length === 0) {
      for (const p of places) {
        if (matchedPlaceIds.has(p.googlePlaceId)) continue
        merged.push(placeOnlyLead(p))
      }
    }

    // Cap total leads saved to configured limit.
    const toSave = merged.slice(0, limit)

    // Step 5: persist leads. OSM-carrying leads use the existing upsert key.
    // Places-only leads use findFirst + create/update since there's no unique constraint.
    let saved = 0
    const savedLeads: any[] = []
    const countryName = geo.countryName
    const fallbackCity = geo.city ?? null

    for (const m of toSave) {
      try {
        const baseData = {
          businessName: m.businessName,
          businessType: m.businessType,
          buildingType: m.buildingType,
          address: m.address,
          city: m.city ?? fallbackCity,
          country: countryName,
          latitude: m.latitude,
          longitude: m.longitude,
          roofAreaSqm: m.roofAreaSqm,
          contactPhone: m.contactPhone,
          contactEmail: m.contactEmail,
          website: m.website,
          googlePlaceId: m.googlePlaceId,
          dataSource: m.dataSource,
          openingHours: m.openingHours,
          googleRating: m.googleRating,
          googleRatingCount: m.googleRatingCount,
        }

        let lead: any
        if (m.osmId) {
          // OSM-anchored: use unique upsert.
          lead = await prisma.lead.upsert({
            where: { userId_osmId: { userId, osmId: m.osmId } },
            update: {
              // Intentionally don't overwrite lat/lng on update to keep map pins stable.
              businessName: baseData.businessName,
              businessType: baseData.businessType,
              buildingType: baseData.buildingType,
              address: baseData.address,
              city: baseData.city,
              country: baseData.country,
              roofAreaSqm: baseData.roofAreaSqm,
              contactPhone: baseData.contactPhone,
              contactEmail: baseData.contactEmail,
              website: baseData.website,
              googlePlaceId: baseData.googlePlaceId,
              dataSource: baseData.dataSource,
              openingHours: baseData.openingHours,
              googleRating: baseData.googleRating,
              googleRatingCount: baseData.googleRatingCount,
            },
            create: {
              userId,
              osmId: m.osmId,
              ...baseData,
            },
          })
        } else if (m.googlePlaceId) {
          // Places-only: manual dedupe by (userId, googlePlaceId).
          const existing = await prisma.lead.findFirst({
            where: { userId, googlePlaceId: m.googlePlaceId },
            select: { id: true },
          })
          if (existing) {
            lead = await prisma.lead.update({
              where: { id: existing.id },
              data: {
                businessName: baseData.businessName,
                businessType: baseData.businessType,
                buildingType: baseData.buildingType,
                address: baseData.address,
                city: baseData.city,
                country: baseData.country,
                roofAreaSqm: baseData.roofAreaSqm,
                contactPhone: baseData.contactPhone,
                contactEmail: baseData.contactEmail,
                website: baseData.website,
                dataSource: baseData.dataSource,
                openingHours: baseData.openingHours,
                googleRating: baseData.googleRating,
                googleRatingCount: baseData.googleRatingCount,
              },
            })
          } else {
            lead = await prisma.lead.create({
              data: { userId, ...baseData },
            })
          }
        } else {
          continue
        }
        savedLeads.push(lead)
        saved++
      } catch (e) {
        console.error('[generate] lead upsert failed:', e)
      }
    }

    // Step 6: record search history
    try {
      await prisma.searchHistory.create({
        data: {
          userId,
          locationSearched: geo.placeName,
          country: geo.countryName,
          leadsFound: saved,
        },
      })
    } catch (e) {
      console.error('[generate] search history failed:', e)
    }

    return NextResponse.json({
      location: {
        placeName: geo.placeName,
        center: geo.center,
        bbox,
        city: geo.city,
        country: geo.countryName,
        countryCode: geo.countryCode,
      },
      buildingsFound: merged.length,
      leadsSaved: saved,
      osmCount: osmBuildings.length,
      placesCount: places.length,
      hybridCount: merged.filter((m) => m.dataSource === 'HYBRID').length,
      placesOnlyCount: merged.filter((m) => m.dataSource === 'GOOGLE_PLACES').length,
      placesEnabled,
      leads: savedLeads,
    })
  } catch (err: any) {
    console.error('[generate] error:', err?.message ?? err)
    return NextResponse.json({ error: err?.message ?? 'Failed to generate leads' }, { status: 500 })
  }
}
