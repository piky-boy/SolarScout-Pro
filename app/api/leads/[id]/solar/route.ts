import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  fetchBuildingInsights,
  isSolarApiConfigured,
  pickBestPanelConfig,
  computeCarbonOffsetKgPerYear,
  formatImageryDate,
} from '@/lib/solar'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// 30 days cache before re-fetching solar data
const CACHE_FRESH_MS = 30 * 24 * 60 * 60 * 1000

function serializeLead(lead: any) {
  return {
    id: lead.id,
    solarDataFetchedAt: lead.solarDataFetchedAt ? lead.solarDataFetchedAt.toISOString() : null,
    solarApiStatus: lead.solarApiStatus ?? null,
    solarImageryQuality: lead.solarImageryQuality ?? null,
    solarImageryDate: lead.solarImageryDate ?? null,
    solarMaxPanelCount: lead.solarMaxPanelCount ?? null,
    solarMaxArrayAreaSqm: lead.solarMaxArrayAreaSqm ?? null,
    solarMaxSunshineHours: lead.solarMaxSunshineHours ?? null,
    solarYearlyEnergyKwh: lead.solarYearlyEnergyKwh ?? null,
    solarCarbonOffsetKgYr: lead.solarCarbonOffsetKgYr ?? null,
    solarPanelCapacityWatts: lead.solarPanelCapacityWatts ?? null,
    solarPanelLifetimeYears: lead.solarPanelLifetimeYears ?? null,
  }
}

/**
 * GET /api/leads/:id/solar
 *
 * Returns cached solar data if present.
 * If `?refresh=1` or no data exists, triggers a fresh fetch from Google Solar API.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined
    if (!session?.user || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lead = await prisma.lead.findFirst({
      where: { id, userId },
    })
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const refresh = searchParams.get('refresh') === '1'

    const hasFreshCache =
      !!lead.solarDataFetchedAt &&
      Date.now() - new Date(lead.solarDataFetchedAt).getTime() < CACHE_FRESH_MS

    if (!refresh && hasFreshCache) {
      return NextResponse.json({
        configured: isSolarApiConfigured(),
        cached: true,
        lead: serializeLead(lead),
      })
    }

    if (!isSolarApiConfigured()) {
      return NextResponse.json({
        configured: false,
        cached: false,
        lead: serializeLead(lead),
        message: 'Solar API is not configured yet.',
      })
    }

    // Call the Google Solar API
    const result = await fetchBuildingInsights(lead.latitude, lead.longitude)

    // Map result to DB fields
    let updateData: any = {
      solarDataFetchedAt: new Date(),
      solarApiStatus: result.status,
    }

    if (result.status === 'OK' && result.data) {
      const potential = result.data.solarPotential
      const best = pickBestPanelConfig(potential)
      const yearlyEnergyKwh = best?.yearlyEnergyDcKwh
      const carbonOffset = computeCarbonOffsetKgPerYear(
        yearlyEnergyKwh,
        potential?.carbonOffsetFactorKgPerMwh
      )

      updateData = {
        ...updateData,
        solarImageryQuality: result.data.imageryQuality ?? null,
        solarImageryDate: formatImageryDate(result.data.imageryDate) ?? null,
        solarMaxPanelCount: potential?.maxArrayPanelsCount ?? null,
        solarMaxArrayAreaSqm: potential?.maxArrayAreaMeters2 ?? null,
        solarMaxSunshineHours: potential?.maxSunshineHoursPerYear ?? null,
        solarYearlyEnergyKwh: yearlyEnergyKwh ?? null,
        solarCarbonOffsetKgYr: carbonOffset ?? null,
        solarPanelCapacityWatts: potential?.panelCapacityWatts ?? null,
        solarPanelLifetimeYears: potential?.panelLifetimeYears ?? null,
        solarRawJson: result.data as any,
      }
    } else {
      // Clear cached values on a non-OK status so UI doesn't show stale data
      updateData = {
        ...updateData,
        solarImageryQuality: null,
        solarImageryDate: null,
        solarMaxPanelCount: null,
        solarMaxArrayAreaSqm: null,
        solarMaxSunshineHours: null,
        solarYearlyEnergyKwh: null,
        solarCarbonOffsetKgYr: null,
        solarPanelCapacityWatts: null,
        solarPanelLifetimeYears: null,
        solarRawJson: null,
      }
    }

    const updated = await prisma.lead.update({
      where: { id: lead.id },
      data: updateData,
    })

    return NextResponse.json({
      configured: true,
      cached: false,
      lead: serializeLead(updated),
      errorMessage: result.errorMessage,
    })
  } catch (err: any) {
    console.error('[api/leads/:id/solar] error', err?.message || err)
    return NextResponse.json(
      { error: 'Failed to fetch solar data', details: err?.message || String(err) },
      { status: 500 }
    )
  }
}
