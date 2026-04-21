/**
 * BIPV (Building-Integrated Photovoltaics) calculations for glass balconies.
 *
 * BIPV glass balcony railings are semi-transparent solar panels integrated
 * into the balcony balustrades of apartment blocks / blocks of flats.
 *
 * Typical specs:
 *   - Balcony railing: ~2.5 m wide × 1.1 m high = ~2.75 m² per balcony
 *   - Active PV area: ~70% of glass (frame, spacing) → ~1.9 m²
 *   - Efficiency: ~12-15% (semi-transparent) → ~150-180 Wp per balcony
 *   - Cost: ~€400-600 per balcony installed
 *   - Typical block of flats: 4-12 floors, 2-6 balconies per floor
 */

export const BIPV_BALCONY_WIDTH_M = 2.5
export const BIPV_BALCONY_HEIGHT_M = 1.1
export const BIPV_GLASS_AREA_PER_BALCONY_SQM = BIPV_BALCONY_WIDTH_M * BIPV_BALCONY_HEIGHT_M // ~2.75
export const BIPV_ACTIVE_RATIO = 0.70 // 70% of glass is active PV
export const BIPV_ACTIVE_AREA_PER_BALCONY = BIPV_GLASS_AREA_PER_BALCONY_SQM * BIPV_ACTIVE_RATIO // ~1.93
export const BIPV_EFFICIENCY = 0.14 // 14% module efficiency (semi-transparent)
export const BIPV_WP_PER_BALCONY = Math.round(BIPV_ACTIVE_AREA_PER_BALCONY * BIPV_EFFICIENCY * 1000) // ~270 Wp
export const BIPV_COST_PER_BALCONY_EUR = 500
export const BIPV_DEFAULT_BALCONIES_PER_FLOOR = 4
export const BIPV_SELF_CONSUMPTION = 0.85 // Higher than rooftop — directly feeds apartment

/** Estimate number of floors from OSM building:levels tag or roof area */
export function estimateFloors(tags: Record<string, string>, roofAreaSqm: number): number {
  const levels = tags['building:levels']
  if (levels) {
    const n = parseInt(levels, 10)
    if (n > 0 && n < 50) return n
  }
  // Heuristic: typical apartment block footprint is 300-800 m²
  // Larger footprint → likely fewer floors (spread out), smaller → taller
  if (roofAreaSqm < 200) return 4
  if (roofAreaSqm < 400) return 6
  if (roofAreaSqm < 600) return 8
  return 10
}

/** Estimate number of balconies from building perimeter or footprint */
export function estimateBalconies(
  floors: number,
  tags: Record<string, string>,
  roofAreaSqm: number,
): number {
  // Use OSM addr:flats or building:flats if available
  const flats = tags['building:flats'] || tags['addr:flats']
  if (flats) {
    const n = parseInt(flats, 10)
    if (n > 0) {
      // Assume ~80% of flats have balconies
      return Math.round(n * 0.8)
    }
  }
  // Heuristic: perimeter ≈ 4√(area) for roughly square buildings
  const perimeterM = 4 * Math.sqrt(roofAreaSqm)
  // Each balcony takes ~3m of facade, roughly 60% of perimeter has balconies
  const balconiesPerFloor = Math.max(2, Math.round((perimeterM * 0.6) / 3))
  return balconiesPerFloor * floors
}

/** Total BIPV glass area for a block of flats */
export function bipvTotalAreaSqm(balconies: number): number {
  return balconies * BIPV_GLASS_AREA_PER_BALCONY_SQM
}

/** System capacity in kWp */
export function bipvSystemKwp(balconies: number): number {
  return (balconies * BIPV_WP_PER_BALCONY) / 1000
}

/** Determine the solar type for a building */
export function classifySolarType(
  buildingType: string | null,
  businessType: string | null,
  roofAreaSqm: number | null,
): 'ROOFTOP' | 'BIPV_BALCONY' | 'HYBRID_ROOFTOP_BIPV' {
  const bt = (buildingType ?? '').toLowerCase()
  const biz = (businessType ?? '').toLowerCase()
  const isApartment =
    bt === 'apartments' ||
    bt === 'residential' ||
    biz === 'residential block' ||
    biz === 'apartment building' ||
    biz === 'block of flats'
  if (isApartment) {
    // Large roof = hybrid (rooftop + BIPV), small roof = BIPV only
    if (roofAreaSqm && roofAreaSqm >= 300) return 'HYBRID_ROOFTOP_BIPV'
    return 'BIPV_BALCONY'
  }
  return 'ROOFTOP'
}

export interface BipvBusinessCase {
  balconies: number
  floors: number
  bipvAreaSqm: number
  systemKwp: number
  annualProductionKwh: number
  selfConsumedKwh: number
  annualSavingsEur: number
  systemCostEur: number
  paybackYears: number
  lifetimeSavingsEur: number
  co2TonnesPerYear: number
}

export function computeBipvBusinessCase(input: {
  balconies: number
  country?: string | null
  electricityPrice?: number
  specificYield?: number // kWh/kWp/year
}): BipvBusinessCase | null {
  if (input.balconies <= 0) return null

  const ELECTRICITY_PRICES: Record<string, number> = {
    ES: 0.22, PT: 0.20, RO: 0.18, AL: 0.16, GB: 0.28,
  }
  const price = input.electricityPrice ?? ELECTRICITY_PRICES[input.country ?? ''] ?? 0.20

  // Country-specific residential yield
  const YIELDS: Record<string, number> = {
    ES: 1350, PT: 1350, RO: 1100, AL: 1100, GB: 900,
  }
  const yield_ = input.specificYield ?? YIELDS[input.country ?? ''] ?? 1200

  const kwp = bipvSystemKwp(input.balconies)
  const annualKwh = kwp * yield_
  const selfConsumed = annualKwh * BIPV_SELF_CONSUMPTION
  const savings = selfConsumed * price
  const cost = input.balconies * BIPV_COST_PER_BALCONY_EUR
  const payback = savings > 0 ? cost / savings : 0
  const lifetime = 30 // BIPV glass panels last 30+ years
  const co2 = (annualKwh * 0.4) / 1000 // ~0.4 kg CO₂/kWh displaced

  return {
    balconies: input.balconies,
    floors: 0, // caller sets this
    bipvAreaSqm: bipvTotalAreaSqm(input.balconies),
    systemKwp: Math.round(kwp * 10) / 10,
    annualProductionKwh: Math.round(annualKwh),
    selfConsumedKwh: Math.round(selfConsumed),
    annualSavingsEur: Math.round(savings),
    systemCostEur: Math.round(cost),
    paybackYears: Math.round(payback * 10) / 10,
    lifetimeSavingsEur: Math.round(savings * lifetime - cost),
    co2TonnesPerYear: Math.round(co2 * 10) / 10,
  }
}
