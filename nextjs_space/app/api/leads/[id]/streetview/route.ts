import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  checkStreetViewCoverage,
  streetViewImageUrl,
  streetViewEmbedUrl,
  CARDINAL_ANGLES,
} from '@/lib/streetview'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const lead = await prisma.lead.findFirst({
      where: { id: params.id, userId },
      select: { latitude: true, longitude: true },
    })
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Check coverage
    const meta = await checkStreetViewCoverage(lead.latitude, lead.longitude)
    if (meta.status !== 'OK') {
      return NextResponse.json({
        available: false,
        status: meta.status,
        images: [],
        embedUrl: null,
      })
    }

    // Build image URLs for 4 cardinal directions
    const images = CARDINAL_ANGLES.map((angle) => ({
      label: angle.label,
      heading: angle.heading,
      url: streetViewImageUrl({
        lat: lead.latitude,
        lng: lead.longitude,
        heading: angle.heading,
      }),
    }))

    return NextResponse.json({
      available: true,
      status: 'OK',
      panoId: meta.pano_id ?? null,
      date: meta.date ?? null,
      images,
      embedUrl: streetViewEmbedUrl(lead.latitude, lead.longitude),
    })
  } catch (err: any) {
    console.error('[streetview] error:', err?.message ?? err)
    return NextResponse.json({ error: 'Failed to fetch Street View data' }, { status: 500 })
  }
}
