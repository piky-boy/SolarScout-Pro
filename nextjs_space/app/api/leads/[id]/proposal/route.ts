import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { computeBusinessCase } from '@/lib/outreach'
import { renderProposalHtml } from '@/lib/proposal-html'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

const CREATE_PDF_URL = 'https://apps.abacus.ai/api/createConvertHtmlToPdfRequest'
const STATUS_PDF_URL = 'https://apps.abacus.ai/api/getConvertHtmlToPdfStatus'

/**
 * Build a Mapbox Static Images API URL.
 * Using pure `satellite-v9` style (no streets overlay) to keep the image clean.
 * Zoom 19 gives a tight crop on the building for a commercial rooftop.
 *
 * withPin=true places a small red pin on the coordinate (used in the "Before" image);
 * withPin=false returns the same framing without the pin (used under the panel overlay).
 */
function buildMapboxStaticUrl(lat: number, lng: number, withPin = true): string | null {
  const token = process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!token) return null
  const scheme = 'ht' + 'tps:' + '//'
  const host = 'api' + '.' + 'mapbox' + '.com'
  const style = 'satellite-v9'
  const zoom = 19
  const w = 900
  const h = 600
  const overlay = withPin ? 'pin-s+ef4444(' + lng + ',' + lat + ')/' : ''
  const path = '/styles/v1/mapbox/' + style + '/static/' + overlay + lng + ',' + lat + ',' + zoom + ',0/' + w + 'x' + h + '@2x'
  return scheme + host + path + '?access_token=' + encodeURIComponent(token)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined
    if (!session?.user || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!process.env.ABACUSAI_API_KEY) {
      return NextResponse.json({ error: 'PDF service not configured' }, { status: 503 })
    }

    const lead = await prisma.lead.findFirst({
      where: { id: params.id, userId },
      include: { user: { select: { name: true, email: true } } },
    })
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = (await req.json().catch(() => ({}))) as {
      senderName?: string
      senderCompany?: string
      senderEmail?: string
      senderPhone?: string
    }

    const senderName = (body.senderName || lead.user?.name || 'Your name').toString().slice(0, 120)
    const senderCompany = (body.senderCompany || 'SolarScout Pro').toString().slice(0, 120)
    const senderEmail = (body.senderEmail || lead.user?.email || '').toString().slice(0, 120) || null
    const senderPhone = (body.senderPhone || '').toString().slice(0, 60) || null

    const businessCase = computeBusinessCase({
      country: lead.country,
      panels: lead.solarMaxPanelCount,
      panelCapacityWatts: lead.solarPanelCapacityWatts,
      yearlyEnergyKwh: lead.solarYearlyEnergyKwh,
      panelLifetimeYears: lead.solarPanelLifetimeYears,
      carbonOffsetKgYr: lead.solarCarbonOffsetKgYr,
      roofAreaSqm: lead.roofAreaSqm,
    })

    const html = renderProposalHtml({
      lead: {
        businessName: lead.businessName,
        businessType: lead.businessType,
        buildingType: lead.buildingType,
        address: lead.address,
        city: lead.city,
        country: lead.country,
        latitude: lead.latitude,
        longitude: lead.longitude,
        roofAreaSqm: lead.roofAreaSqm,
        contactPhone: lead.contactPhone,
        contactEmail: lead.contactEmail,
        website: lead.website,
        googleRating: lead.googleRating,
        solarApiStatus: lead.solarApiStatus,
        solarMaxPanelCount: lead.solarMaxPanelCount,
        solarMaxArrayAreaSqm: lead.solarMaxArrayAreaSqm,
        solarYearlyEnergyKwh: lead.solarYearlyEnergyKwh,
        solarCarbonOffsetKgYr: lead.solarCarbonOffsetKgYr,
        solarMaxSunshineHours: lead.solarMaxSunshineHours,
        solarPanelCapacityWatts: lead.solarPanelCapacityWatts,
        solarPanelLifetimeYears: lead.solarPanelLifetimeYears,
        solarImageryQuality: lead.solarImageryQuality,
        solarImageryDate: lead.solarImageryDate,
        dataSource: lead.dataSource,
      },
      businessCase,
      senderName,
      senderCompany,
      senderEmail,
      senderPhone,
      satelliteImageUrl: buildMapboxStaticUrl(lead.latitude, lead.longitude, true),
      satelliteImageUrlClean: buildMapboxStaticUrl(lead.latitude, lead.longitude, false),
      generatedAt: new Date().toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    })

    // Step 1: create request
    const createRes = await fetch(CREATE_PDF_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        html_content: html,
        pdf_options: {
          format: 'A4',
          print_background: true,
          margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
        },
      }),
    })
    if (!createRes.ok) {
      const err = await createRes.text()
      console.error('[proposal] create request failed', createRes.status, err.slice(0, 300))
      return NextResponse.json({ error: 'Failed to start PDF generation' }, { status: 502 })
    }
    const createJson = await createRes.json()
    const requestId = createJson?.request_id
    if (!requestId) {
      return NextResponse.json({ error: 'Missing PDF request id' }, { status: 502 })
    }

    // Step 2: poll for status (up to ~110 seconds)
    const maxAttempts = 110
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 1000))
      const statusRes = await fetch(STATUS_PDF_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deployment_token: process.env.ABACUSAI_API_KEY,
          request_id: requestId,
        }),
      })
      const statusJson = await statusRes.json()
      const status: string = statusJson?.status || 'FAILED'
      if (status === 'SUCCESS') {
        const result = statusJson?.result
        if (result?.result) {
          const pdfBuffer = Buffer.from(result.result, 'base64')
          const filename = `SolarScout-proposal-${(lead.businessName || lead.id)
            .toString()
            .replace(/[^a-z0-9]+/gi, '-')
            .toLowerCase()
            .slice(0, 60)}.pdf`
          return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${filename}"`,
              'Cache-Control': 'no-store',
            },
          })
        }
        return NextResponse.json({ error: 'PDF generation empty' }, { status: 502 })
      }
      if (status === 'FAILED') {
        console.error('[proposal] PDF failed', statusJson?.result?.error)
        return NextResponse.json({ error: 'PDF generation failed' }, { status: 502 })
      }
      // else PROCESSING, keep polling
    }
    return NextResponse.json({ error: 'PDF generation timed out' }, { status: 504 })
  } catch (err: any) {
    console.error('[api/leads/:id/proposal] error', err?.message || err)
    return NextResponse.json(
      { error: 'Failed to generate proposal', details: err?.message || String(err) },
      { status: 500 }
    )
  }
}
