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

// ─── Accuracy Enrichment ─────────────────────────────────────────────

export interface AccurateMeasurements {
  /** Actual roof area from Google wholeRoofStats (m²) */
  solarRoofAreaSqm: number | null
  /** Building footprint area from buildingStats (m²) */
  solarBuildingAreaSqm: number | null
  /** Estimated building height from tallest roof segment (m) */
  buildingHeightM: number | null
  /** Dominant roof pitch angle (degrees) — area-weighted average */
  roofPitchDeg: number | null
  /** Dominant roof azimuth (degrees, 0=N clockwise) — area-weighted average */
  roofAzimuthDeg: number | null
  /** Number of usable roof segments */
  roofSegmentCount: number | null
  /** Max panel count */
  maxPanelCount: number | null
  /** Max usable array area (m²) */
  maxArrayAreaSqm: number | null
  /** Max sunshine hours per year */
  maxSunshineHours: number | null
  /** Yearly energy from best config (kWh DC) */
  yearlyEnergyKwh: number | null
  /** Carbon offset (kg/yr) */
  carbonOffsetKgYr: number | null
  /** Panel capacity in watts */
  panelCapacityWatts: number | null
  /** Panel lifetime in years */
  panelLifetimeYears: number | null
  /** Imagery quality */
  imageryQuality: string | null
  /** Imagery date string */
  imageryDate: string | null
}

/**
 * Extract all accurate measurements from a Solar API response.
 * This is the single source of truth for translating raw API data into DB fields.
 */
export function extractAccurateMeasurements(
  data: BuildingInsightsResponse
): AccurateMeasurements {
  const potential = data.solarPotential
  const segments = potential?.roofSegmentStats as
    | Array<{
        pitchDegrees?: number
        azimuthDegrees?: number
        stats?: { areaMeters2?: number; sunshineQuantiles?: number[] }
        center?: { latitude: number; longitude: number }
        planeHeightAtCenterMeters?: number
      }>
    | undefined

  // --- Roof area (whole roof) ---
  const solarRoofAreaSqm = potential?.wholeRoofStats?.areaMeters2 ?? null

  // --- Building footprint ---
  const solarBuildingAreaSqm = potential?.buildingStats?.areaMeters2 ?? null

  // --- Building height: max planeHeightAtCenterMeters across segments ---
  let buildingHeightM: number | null = null
  if (segments && segments.length > 0) {
    const heights = segments
      .map((s) => s.planeHeightAtCenterMeters)
      .filter((h): h is number => typeof h === 'number' && h > 0)
    if (heights.length > 0) {
      buildingHeightM = Math.round(Math.max(...heights) * 10) / 10
    }
  }

  // --- Dominant pitch & azimuth: area-weighted average across segments ---
  let roofPitchDeg: number | null = null
  let roofAzimuthDeg: number | null = null
  let roofSegmentCount: number | null = null

  if (segments && segments.length > 0) {
    roofSegmentCount = segments.length
    let totalArea = 0
    let weightedPitch = 0
    // Azimuth needs circular averaging (vector sum)
    let azSinSum = 0
    let azCosSum = 0

    for (const seg of segments) {
      const area = seg.stats?.areaMeters2 ?? 0
      if (area <= 0) continue
      totalArea += area

      if (typeof seg.pitchDegrees === 'number') {
        weightedPitch += seg.pitchDegrees * area
      }
      if (typeof seg.azimuthDegrees === 'number') {
        const rad = (seg.azimuthDegrees * Math.PI) / 180
        azSinSum += Math.sin(rad) * area
        azCosSum += Math.cos(rad) * area
      }
    }

    if (totalArea > 0) {
      roofPitchDeg = Math.round((weightedPitch / totalArea) * 10) / 10

      // Circular mean for azimuth
      const meanAzRad = Math.atan2(azSinSum, azCosSum)
      roofAzimuthDeg =
        Math.round(((meanAzRad * 180) / Math.PI + 360) % 360 * 10) / 10
    }
  }

  // --- Standard solar metrics ---
  const best = pickBestPanelConfig(potential)
  const yearlyEnergyKwh = best?.yearlyEnergyDcKwh ?? null
  const carbonOffsetKgYr = computeCarbonOffsetKgPerYear(
    yearlyEnergyKwh ?? undefined,
    potential?.carbonOffsetFactorKgPerMwh
  ) ?? null

  return {
    solarRoofAreaSqm,
    solarBuildingAreaSqm,
    buildingHeightM,
    roofPitchDeg,
    roofAzimuthDeg,
    roofSegmentCount,
    maxPanelCount: potential?.maxArrayPanelsCount ?? null,
    maxArrayAreaSqm: potential?.maxArrayAreaMeters2 ?? null,
    maxSunshineHours: potential?.maxSunshineHoursPerYear ?? null,
    yearlyEnergyKwh,
    carbonOffsetKgYr,
    panelCapacityWatts: potential?.panelCapacityWatts ?? null,
    panelLifetimeYears: potential?.panelLifetimeYears ?? null,
    imageryQuality: data.imageryQuality ?? null,
    imageryDate: formatImageryDate(data.imageryDate) ?? null,
  }
}

/**
 * Build a Prisma update payload from AccurateMeasurements.
 */
export function solarMeasurementsToDbUpdate(m: AccurateMeasurements) {
  return {
    solarEnriched: true,
    solarImageryQuality: m.imageryQuality,
    solarImageryDate: m.imageryDate,
    solarMaxPanelCount: m.maxPanelCount,
    solarMaxArrayAreaSqm: m.maxArrayAreaSqm,
    solarMaxSunshineHours: m.maxSunshineHours,
    solarYearlyEnergyKwh: m.yearlyEnergyKwh,
    solarCarbonOffsetKgYr: m.carbonOffsetKgYr,
    solarPanelCapacityWatts: m.panelCapacityWatts,
    solarPanelLifetimeYears: m.panelLifetimeYears,
    solarRoofAreaSqm: m.solarRoofAreaSqm,
    solarBuildingAreaSqm: m.solarBuildingAreaSqm,
    buildingHeightM: m.buildingHeightM,
    roofPitchDeg: m.roofPitchDeg,
    roofAzimuthDeg: m.roofAzimuthDeg,
    roofSegmentCount: m.roofSegmentCount,
  }
}

/**
 * Use Solar API accurate roof area to override the OSM polygon estimate
 * when Google data is available. Returns the best available roof area.
 */
export function bestRoofArea(
  osmRoofAreaSqm: number | null,
  solarRoofAreaSqm: number | null
): { value: number | null; source: 'google_solar' | 'osm_polygon' | 'none' } {
  if (solarRoofAreaSqm && solarRoofAreaSqm > 0) {
    return { value: solarRoofAreaSqm, source: 'google_solar' }
  }
  if (osmRoofAreaSqm && osmRoofAreaSqm > 0) {
    return { value: osmRoofAreaSqm, source: 'osm_polygon' }
  }
  return { value: null, source: 'none' }
}

/**
 * Derive floor count from building height (Solar API) when available.
 * Average storey height ~3.0 m for residential, ~4.0 m for commercial.
 */
export function floorsFromBuildingHeight(
  heightM: number,
  isResidential: boolean = false
): number {
  const storeyHeight = isResidential ? 3.0 : 4.0
  return Math.max(1, Math.round(heightM / storeyHeight))
}
