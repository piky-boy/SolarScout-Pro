/**
 * Google Solar API client
 * Docs: https://developers.google.com/maps/documentation/solar/building-insights
 *
 * Coverage in our target markets (as of 2025):
 * - Spain:          MEDIUM quality ✅
 * - Portugal:       MEDIUM quality ✅
 * - United Kingdom: HIGH quality   ✅ (excellent building-level coverage)
 * - Romania:        not officially covered ❌ (may work with BASE / EXPANDED_COVERAGE)
 * - Albania:        not officially covered ❌ (may work with BASE / EXPANDED_COVERAGE)
 */

export type ImageryQuality = 'HIGH' | 'MEDIUM' | 'LOW' | 'BASE'

export interface SolarPanelConfig {
  panelsCount: number
  yearlyEnergyDcKwh: number
  roofSegmentSummaries?: any[]
}

export interface SolarPotential {
  maxArrayPanelsCount?: number
  maxArrayAreaMeters2?: number
  maxSunshineHoursPerYear?: number
  carbonOffsetFactorKgPerMwh?: number
  panelCapacityWatts?: number
  panelHeightMeters?: number
  panelWidthMeters?: number
  panelLifetimeYears?: number
  solarPanelConfigs?: SolarPanelConfig[]
  wholeRoofStats?: { areaMeters2?: number; sunshineQuantiles?: number[] }
  buildingStats?: { areaMeters2?: number; sunshineQuantiles?: number[] }
  roofSegmentStats?: any[]
}

export interface BuildingInsightsResponse {
  name?: string
  center?: { latitude: number; longitude: number }
  imageryDate?: { year: number; month: number; day: number }
  imageryProcessedDate?: { year: number; month: number; day: number }
  postalCode?: string
  administrativeArea?: string
  statisticalArea?: string
  regionCode?: string
  solarPotential?: SolarPotential
  boundingBox?: any
  imageryQuality?: ImageryQuality
}

export type SolarFetchStatus = 'OK' | 'NOT_FOUND' | 'NO_COVERAGE' | 'ERROR' | 'UNCONFIGURED'

export interface SolarFetchResult {
  status: SolarFetchStatus
  data: BuildingInsightsResponse | null
  errorMessage?: string
}

const SOLAR_API_URL = 'https://solar.googleapis.com/v1/buildingInsights:findClosest'

function isPlaceholder(key: string | undefined): boolean {
  if (!key) return true
  return key.includes('PLACEHOLDER') || key.trim().length === 0
}

export function isSolarApiConfigured(): boolean {
  return !isPlaceholder(process.env.GOOGLE_MAPS_API_KEY)
}

/**
 * Fetch rooftop solar insights for a lat/lng using Google Solar API.
 * Gracefully handles 404 (building not in dataset) and 403 (region not covered).
 */
export async function fetchBuildingInsights(
  latitude: number,
  longitude: number,
  opts: { requiredQuality?: ImageryQuality; enableExpandedCoverage?: boolean } = {}
): Promise<SolarFetchResult> {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (isPlaceholder(key)) {
    console.warn('[solar] GOOGLE_MAPS_API_KEY is not configured (placeholder).')
    return { status: 'UNCONFIGURED', data: null, errorMessage: 'Solar API key is not configured.' }
  }

  const params = new URLSearchParams({
    'location.latitude': String(latitude),
    'location.longitude': String(longitude),
    // Start with LOW so we accept any available quality from HIGH/MEDIUM/LOW.
    requiredQuality: opts.requiredQuality ?? 'LOW',
    key: key as string,
  })

  // EXPANDED_COVERAGE enables BASE quality in limited regions (experimental).
  if (opts.enableExpandedCoverage) {
    params.append('experiments', 'EXPANDED_COVERAGE')
  }

  const url = `${SOLAR_API_URL}?${params.toString()}`

  try {
    const res = await fetch(url, { method: 'GET' })

    if (res.ok) {
      const data = (await res.json()) as BuildingInsightsResponse
      return { status: 'OK', data }
    }

    // Parse error body for better diagnostics
    let errBody: any = null
    try {
      errBody = await res.json()
    } catch {
      // ignore
    }
    const message: string = errBody?.error?.message || `HTTP ${res.status}`
    const msgLower = message.toLowerCase()

    // 404: building not in dataset
    if (res.status === 404) {
      // Retry once with EXPANDED_COVERAGE experiment if not already enabled
      if (!opts.enableExpandedCoverage) {
        console.log(`[solar] 404 for ${latitude},${longitude} — retrying with EXPANDED_COVERAGE`)
        return await fetchBuildingInsights(latitude, longitude, {
          ...opts,
          enableExpandedCoverage: true,
        })
      }
      return {
        status: 'NOT_FOUND',
        data: null,
        errorMessage: 'This building is not in the Google Solar dataset.',
      }
    }

    // 403 with a coverage-related message
    if (
      res.status === 403 &&
      (msgLower.includes('not covered') ||
        msgLower.includes('unsupported location') ||
        msgLower.includes('not available in your region'))
    ) {
      return {
        status: 'NO_COVERAGE',
        data: null,
        errorMessage: 'Google Solar API does not yet cover this region.',
      }
    }

    // 400 with message indicating coverage
    if (res.status === 400 && msgLower.includes('location')) {
      return {
        status: 'NO_COVERAGE',
        data: null,
        errorMessage: message || 'Invalid / unsupported location for Solar API.',
      }
    }

    // Auth / key errors
    if (res.status === 401 || res.status === 403) {
      console.error('[solar] Auth/permission error', res.status, message)
      return {
        status: 'ERROR',
        data: null,
        errorMessage:
          'Solar API request denied. Check that Solar API is enabled and the API key is allowed for it.',
      }
    }

    console.error('[solar] API error', res.status, message)
    return { status: 'ERROR', data: null, errorMessage: message }
  } catch (err: any) {
    console.error('[solar] Network error', err?.message || err)
    return {
      status: 'ERROR',
      data: null,
      errorMessage: err?.message || 'Network error contacting Solar API.',
    }
  }
}

/**
 * Pick the largest viable panel configuration (most panels).
 * The API returns configs sorted by increasing panel count.
 */
export function pickBestPanelConfig(potential?: SolarPotential): SolarPanelConfig | undefined {
  const cfgs = potential?.solarPanelConfigs
  if (!cfgs || cfgs.length === 0) return undefined
  return cfgs[cfgs.length - 1]
}

/**
 * Compute yearly CO2 offset in kg from energy produced and carbon factor.
 */
export function computeCarbonOffsetKgPerYear(
  yearlyEnergyDcKwh: number | undefined,
  carbonOffsetFactorKgPerMwh: number | undefined
): number | undefined {
  if (!yearlyEnergyDcKwh || !carbonOffsetFactorKgPerMwh) return undefined
  const mwh = yearlyEnergyDcKwh / 1000
  return mwh * carbonOffsetFactorKgPerMwh
}

/**
 * Format imagery date to ISO string YYYY-MM-DD.
 */
export function formatImageryDate(
  d?: { year: number; month: number; day: number }
): string | undefined {
  if (!d) return undefined
  const mm = String(d.month).padStart(2, '0')
  const dd = String(d.day).padStart(2, '0')
  return `${d.year}-${mm}-${dd}`
}
