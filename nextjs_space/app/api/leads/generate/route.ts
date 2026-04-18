import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { mapboxGeocode, bboxFromCenter, clampBbox } from '@/lib/mapbox'
import { findCommercialBuildings } from '@/lib/overpass'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const location = (body?.location ?? '').toString().trim()
    const limit = Math.max(10, Math.min(Number(body?.limit ?? 75), 250))
    if (!location) return NextResponse.json({ error: 'Location is required' }, { status: 400 })

    // Step 1: geocode location
    const geoResults = await mapboxGeocode(location, 1)
    const geo = geoResults?.[0]
    if (!geo) {
      return NextResponse.json(
        { error: 'No matching location found in supported countries (RO, ES, PT, AL).' },
        { status: 404 },
      )
    }

    // Step 2: compute bbox
    let bbox: [number, number, number, number] = geo.bbox ?? bboxFromCenter(geo.center, 3)
    bbox = clampBbox(bbox, 0.3)

    // Step 3: query commercial buildings
    const buildings = await findCommercialBuildings({
      bbox,
      city: geo.city ?? undefined,
      limit,
      minRoofArea: 200,
    })

    // Step 4: persist new leads (skip duplicates per user)
    let saved = 0
    const savedLeads: any[] = []
    for (const b of buildings) {
      try {
        const lead = await prisma.lead.upsert({
          where: { userId_osmId: { userId, osmId: b.osmId } },
          update: {
            roofAreaSqm: b.roofAreaSqm,
            businessName: b.businessName,
            businessType: b.businessType,
            buildingType: b.buildingType,
            address: b.address,
            city: b.city ?? geo.city ?? null,
            country: geo.countryName,
            contactPhone: b.contactPhone,
            contactEmail: b.contactEmail,
            website: b.website,
          },
          create: {
            userId,
            osmId: b.osmId,
            businessName: b.businessName,
            businessType: b.businessType,
            buildingType: b.buildingType,
            address: b.address,
            city: b.city ?? geo.city ?? null,
            country: geo.countryName,
            latitude: b.latitude,
            longitude: b.longitude,
            roofAreaSqm: b.roofAreaSqm,
            contactPhone: b.contactPhone,
            contactEmail: b.contactEmail,
            website: b.website,
          },
        })
        savedLeads.push(lead)
        saved++
      } catch (e) {
        console.error('[generate] lead upsert failed:', e)
      }
    }

    // Step 5: record search history
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
      buildingsFound: buildings.length,
      leadsSaved: saved,
      leads: savedLeads,
    })
  } catch (err: any) {
    console.error('[generate] error:', err?.message ?? err)
    return NextResponse.json({ error: err?.message ?? 'Failed to generate leads' }, { status: 500 })
  }
}
