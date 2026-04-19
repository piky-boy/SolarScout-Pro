/**
 * Economics helpers for outreach messaging.
 *
 * These are deterministic, code-side calculations so we don't rely on the LLM to
 * invent numbers. The LLM only writes the copy around the numbers we give it.
 *
 * Assumptions are intentionally conservative and commercial-oriented:
 *   - Self-consumption ratio: 0.70 (commercial rooftops usually run during daylight)
 *   - Installed cost: €900 / kWp (EU commercial average, turn-key)
 *   - Electricity prices: rough 2024-2025 commercial tariffs per target country
 */

export const ELECTRICITY_PRICE_EUR_PER_KWH: Record<string, number> = {
  ES: 0.22,
  PT: 0.2,
  RO: 0.18,
  AL: 0.16,
  GB: 0.28, // UK commercial non-domestic ~ £0.24/kWh
}

export const DEFAULT_ELECTRICITY_PRICE_EUR_PER_KWH = 0.2
export const COMMERCIAL_SELF_CONSUMPTION = 0.7
export const COST_EUR_PER_KWP = 900
export const DEFAULT_PANEL_KWP = 0.4 // 400 W per panel

export interface BusinessCase {
  systemKwp: number
  annualProductionKwh: number
  selfConsumedKwh: number
  annualSavingsEur: number
  systemCostEur: number
  paybackYears: number
  lifetimeSavingsEur: number
  electricityPrice: number
  lifetimeYears: number
  co2TonnesPerYear: number
}

export function computeBusinessCase(input: {
  country?: string | null
  panels?: number | null
  panelCapacityWatts?: number | null
  yearlyEnergyKwh?: number | null
  panelLifetimeYears?: number | null
  carbonOffsetKgYr?: number | null
  roofAreaSqm?: number | null
}): BusinessCase | null {
  const price =
    (input.country && ELECTRICITY_PRICE_EUR_PER_KWH[input.country]) ||
    DEFAULT_ELECTRICITY_PRICE_EUR_PER_KWH

  // Determine system size
  let systemKwp = 0
  if (input.panels && input.panelCapacityWatts) {
    systemKwp = (input.panels * input.panelCapacityWatts) / 1000
  } else if (input.panels) {
    systemKwp = input.panels * DEFAULT_PANEL_KWP
  } else if (input.roofAreaSqm) {
    // Rough estimate: 5 m² per 1 kWp for commercial rooftops
    systemKwp = input.roofAreaSqm / 5
  }
  if (systemKwp <= 0) return null

  // Annual production
  let annualProductionKwh = input.yearlyEnergyKwh ?? 0
  if (!annualProductionKwh) {
    // Fallback specific yield (kWh/kWp/year) — depends on latitude/irradiance
    //   Iberia (ES/PT):            ~1,400
    //   Romania/Albania:           ~1,150
    //   United Kingdom:            ~950 (lower irradiance, overcast climate)
    let specificYield = 1400
    if (input.country === 'RO' || input.country === 'AL') specificYield = 1150
    if (input.country === 'GB') specificYield = 950
    annualProductionKwh = systemKwp * specificYield
  }

  const selfConsumedKwh = annualProductionKwh * COMMERCIAL_SELF_CONSUMPTION
  const annualSavingsEur = selfConsumedKwh * price
  const systemCostEur = systemKwp * COST_EUR_PER_KWP
  const paybackYears = annualSavingsEur > 0 ? systemCostEur / annualSavingsEur : 0
  const lifetimeYears = input.panelLifetimeYears ?? 25
  const lifetimeSavingsEur = annualSavingsEur * lifetimeYears - systemCostEur
  const co2TonnesPerYear = (input.carbonOffsetKgYr ?? 0) / 1000

  return {
    systemKwp: roundTo(systemKwp, 1),
    annualProductionKwh: Math.round(annualProductionKwh),
    selfConsumedKwh: Math.round(selfConsumedKwh),
    annualSavingsEur: Math.round(annualSavingsEur),
    systemCostEur: Math.round(systemCostEur),
    paybackYears: roundTo(paybackYears, 1),
    lifetimeSavingsEur: Math.round(lifetimeSavingsEur),
    electricityPrice: price,
    lifetimeYears,
    co2TonnesPerYear: roundTo(co2TonnesPerYear, 1),
  }
}

function roundTo(n: number, decimals: number) {
  const p = Math.pow(10, decimals)
  return Math.round(n * p) / p
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'ro', label: 'Română', flag: '🇷🇴' },
  { code: 'sq', label: 'Shqip', flag: '🇦🇱' },
] as const

export type OutreachLanguage = (typeof SUPPORTED_LANGUAGES)[number]['code']

export const OUTREACH_TONES = [
  { code: 'professional', label: 'Professional', hint: 'Formal, data-first' },
  { code: 'friendly', label: 'Friendly', hint: 'Warm, conversational' },
  { code: 'direct', label: 'Direct', hint: 'Short, high-conviction' },
] as const

export type OutreachTone = (typeof OUTREACH_TONES)[number]['code']

export function defaultLanguageForCountry(country?: string | null): OutreachLanguage {
  switch (country) {
    case 'ES':
      return 'es'
    case 'PT':
      return 'pt'
    case 'RO':
      return 'ro'
    case 'AL':
      return 'sq'
    case 'GB':
      return 'en'
    default:
      return 'en'
  }
}
