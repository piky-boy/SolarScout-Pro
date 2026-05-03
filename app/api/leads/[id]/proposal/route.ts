import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logActivity } from '@/lib/activity'
import { computeBusinessCase, defaultLanguageForCountry } from '@/lib/outreach'
import { renderProposalHtml } from '@/lib/proposal-html'
import {
  extractPanelLayoutFromRawJson,
  renderPanelArraySvgByProjection,
} from '@/lib/proposal-panels'
import {
  fetchSolarImagery,
  cropSolarImageryToBuildingBBox,
  drawPinOnPng,
} from '@/lib/solar-imagery'
import {
  formatProposalDate,
  type ProposalLanguage,
} from '@/lib/proposal-i18n'

const SUPPORTED_PROPOSAL_LANGUAGES: readonly ProposalLanguage[] = ['en', 'es', 'pt', 'ro', 'sq'] as const

function isSupportedLanguage(v: unknown): v is ProposalLanguage {
  return typeof v === 'string' && (SUPPORTED_PROPOSAL_LANGUAGES as readonly string[]).includes(v)
}

export const dynamic = 'force-dynamic'
export const maxDuration = 120

const CREATE_PDF_URL = 'https://apps.abacus.ai/api/createConvertHtmlToPdfRequest'
const STATUS_PDF_URL = 'https://apps.abacus.ai/api/getConvertHtmlToPdfStatus'

// Native image size used for the Mapbox static image. The @2x suffix in the
// URL makes the image 2× this internally for retina sharpness but coordinates
// are computed against this logical size.
const MAP_W = 900
const MAP_H = 600

/**
 * Build a Mapbox Static Images API URL.
 * Using pure `satellite-v9` style (no streets overlay) to keep the image clean.
 *
 * `pinLat/pinLng` (optional) place a red pin at a specific coordinate — useful
 * to keep the original lead pin visible on the "Before" image while the map is
 * centred on the Solar-API-derived building centre for accurate panel overlay.
 */
function buildMapboxStaticUrl(
  centerLat: number,
  centerLng: number,
  zoom: number,
  pin?: { lat: number; lng: number } | null
): string | null {
  const token = process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!token) return null
  const scheme = 'ht' + 'tps:' + '//'
  const host = 'api' + '.' + 'mapbox' + '.com'
  const style = 'satellite-v9'
  const overlay = pin ? 'pin-s+ef4444(' + pin.lng + ',' + pin.lat + ')/' : ''
  const path =
    '/styles/v1/mapbox/' +
    style +
    '/static/' +
    overlay +
    centerLng +
    ',' +
    centerLat +
    ',' +
    zoom +
    ',0/' +
    MAP_W +
    'x' +
    MAP_H +
    '@2x'
  return scheme + host + path + '?access_token=' + encodeURIComponent(token)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined
    if (!session?.user || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!process.env.ABACUSAI_API_KEY) {
      return NextResponse.json({ error: 'PDF service not configured' }, { status: 503 })
    }

    const lead = await prisma.lead.findFirst({
      where: { id, userId },
      include: { user: { select: { name: true, email: true } } },
    })
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = (await req.json().catch(() => ({}))) as {
      senderName?: string
      senderCompany?: string
      senderEmail?: string
      senderPhone?: string
      language?: string
    }

    const senderName = (body.senderName || lead.user?.name || 'Your name').toString().slice(0, 120)
    const senderCompany = (body.senderCompany || 'SolarScout Pro').toString().slice(0, 120)
    const senderEmail = (body.senderEmail || lead.user?.email || '').toString().slice(0, 120) || null
    const senderPhone = (body.senderPhone || '').toString().slice(0, 60) || null

    // Resolve the output language. Priority:
    //   1. Explicit user selection (from the Generate Proposal dialog)
    //   2. The country's native language (defaultLanguageForCountry)
    //   3. English
    const language: ProposalLanguage = isSupportedLanguage(body.language)
      ? body.language
      : (defaultLanguageForCountry(lead.country) as ProposalLanguage)

    const businessCase = computeBusinessCase({
      country: lead.country,
      panels: lead.solarMaxPanelCount,
      panelCapacityWatts: lead.solarPanelCapacityWatts,
      yearlyEnergyKwh: lead.solarYearlyEnergyKwh,
      panelLifetimeYears: lead.solarPanelLifetimeYears,
      carbonOffsetKgYr: lead.solarCarbonOffsetKgYr,
      roofAreaSqm: lead.roofAreaSqm,
    })

    // Extract the real panel layout from the cached Google Solar API response.
    // When available, we use the Solar API's building centre + an auto-fit zoom
    // to frame the building tightly, and the panel positions are rendered as
    // pixel-accurate SVG rectangles exactly where each panel sits on the roof.
    // When absent, we fall back to the lead's lat/lng at a default zoom and a
    // generic scaled panel grid.
    const panelLayout = extractPanelLayoutFromRawJson(
      lead.solarRawJson,
      lead.latitude,
      lead.longitude,
      MAP_W,
      MAP_H
    )

    const mapCenterLat = panelLayout?.centerLat ?? lead.latitude
    const mapCenterLng = panelLayout?.centerLng ?? lead.longitude
    const mapZoom = panelLayout?.zoom ?? 19

    // PREFERRED PATH — Google Solar API RGB imagery.
    //
    // Google's Solar API returns panel lat/lngs referenced to Google's own aerial
    // photography. Mapbox satellite imagery is a different source (different date
    // and different image-registration), which caused the panels to land slightly
    // off the actual roof. By fetching Solar API's own RGB GeoTIFF (same source
    // as the panel coordinates), the overlay lands pixel-perfectly on the roof.
    //
    // If anything fails (no API key, no coverage, decoding error) we fall back
    // to the Mapbox flow at the bottom of this block.
    let beforeUrl: string | null = null
    let afterUrl: string | null = null
    let panelSvgOverride: string | null = null
    let imageAspectRatio: number | null = null
    let panelCountOverride: number | null = null

    if (panelLayout && panelLayout.panels.length > 0) {
      try {
        const bbox = panelLayout.bbox!
        // Approximate radius to retrieve. Pad by 25m around the panel bbox so the
        // Solar API returns enough tile area to comfortably frame the building.
        const centerLat = (bbox.north + bbox.south) / 2
        const mPerDegLat = 111_132.954
        const mPerDegLng = 111_132.954 * Math.cos((centerLat * Math.PI) / 180)
        const heightMeters = Math.abs(bbox.north - bbox.south) * mPerDegLat
        const widthMeters = Math.abs(bbox.east - bbox.west) * mPerDegLng
        const radius = Math.max(widthMeters, heightMeters) / 2 + 25

        const imagery = await fetchSolarImagery(
          panelLayout.centerLat,
          panelLayout.centerLng,
          Math.min(175, Math.max(30, radius))
        )

        if (imagery) {
          // Crop to the building bbox at the display's aspect ratio so the SVG
          // overlays the image 1:1 without any object-fit cropping.
          const DISPLAY_ASPECT = 332.5 / 155
          const cropped = await cropSolarImageryToBuildingBBox(
            imagery,
            bbox,
            DISPLAY_ASPECT,
            12
          )

          if (cropped) {
            // BEFORE image: draw a red pin at the lead's original coordinate so
            // the user can visually verify we're looking at the right building.
            const pinPx = cropped.latLngToPixel(lead.latitude, lead.longitude)
            let beforeBuf = cropped.pngBuffer
            if (
              pinPx.x >= 0 &&
              pinPx.x <= cropped.width &&
              pinPx.y >= 0 &&
              pinPx.y <= cropped.height
            ) {
              beforeBuf = await drawPinOnPng(cropped.pngBuffer, pinPx.x, pinPx.y, { radius: 9 })
            }
            beforeUrl = 'data:image/png;base64,' + beforeBuf.toString('base64')

            // AFTER image: clean crop (no pin) — panel SVG overlays it.
            afterUrl = 'data:image/png;base64,' + cropped.pngBuffer.toString('base64')

            // Real panel SVG using Solar API's UTM projection.
            panelSvgOverride = renderPanelArraySvgByProjection({
              panels: panelLayout.panels,
              segments: panelLayout.segments,
              panelWidthMeters: panelLayout.panelWidthMeters,
              panelHeightMeters: panelLayout.panelHeightMeters,
              metersPerPixel: imagery.metersPerPixel,
              imgWidth: cropped.width,
              imgHeight: cropped.height,
              latLngToPixel: cropped.latLngToPixel,
            })
            imageAspectRatio = cropped.width / cropped.height
            panelCountOverride = panelLayout.panels.length
          }
        }
      } catch (err: any) {
        console.error('[proposal] solar-imagery failed, falling back to Mapbox', err?.message || err)
      }
    }

    // Mapbox fallback (used when Solar imagery fetch/crop fails or panel data is absent).
    if (!beforeUrl) {
      beforeUrl = buildMapboxStaticUrl(mapCenterLat, mapCenterLng, mapZoom, {
        lat: lead.latitude,
        lng: lead.longitude,
      })
    }
    if (!afterUrl) {
      afterUrl = buildMapboxStaticUrl(mapCenterLat, mapCenterLng, mapZoom, null)
    }

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
      satelliteImageUrl: beforeUrl,
      satelliteImageUrlClean: afterUrl,
      // Pass the Mapbox-derived layout only when the Solar-imagery path didn't
      // produce its own SVG override, so we never double-render.
      panelLayout: panelSvgOverride ? null : panelLayout,
      panelSvgOverride,
      panelCountOverride,
      imageAspectRatio,
      language,
      generatedAt: formatProposalDate(new Date(), language),
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
          logActivity(userId, 'proposal_generated', { proposalLanguage: language }, id)
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
