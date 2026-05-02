import Stripe from 'stripe'

// ─── Stripe client (server-side only) ────────────────────────────────────────

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-04-22.dahlia' as any,
  typescript: true,
})

// ─── Plan definitions ─────────────────────────────────────────────────────────

export type PlanId = 'free' | 'pro' | 'agency'

export interface Plan {
  id: PlanId
  name: string
  tagline: string
  monthlyPrice: number       // EUR display price
  stripePriceId: string      // from env
  scansPerMonth: number      // -1 = unlimited
  leadsPerScan: number       // max leads returned per scan
  proposalsPerMonth: number  // -1 = unlimited
  csvExport: boolean
  aiOutreach: boolean
  teamSeats: number
  highlighted?: boolean
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Try it out',
    monthlyPrice: 0,
    stripePriceId: '',
    scansPerMonth: 3,
    leadsPerScan: 20,
    proposalsPerMonth: 3,
    csvExport: false,
    aiOutreach: false,
    teamSeats: 1,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'For solo prospectors',
    monthlyPrice: 49,
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? '',
    scansPerMonth: 50,
    leadsPerScan: 100,
    proposalsPerMonth: -1,
    csvExport: true,
    aiOutreach: true,
    teamSeats: 1,
    highlighted: true,
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    tagline: 'For sales teams',
    monthlyPrice: 149,
    stripePriceId: process.env.STRIPE_PRICE_AGENCY ?? '',
    scansPerMonth: -1,
    leadsPerScan: 250,
    proposalsPerMonth: -1,
    csvExport: true,
    aiOutreach: true,
    teamSeats: 5,
  },
}

export function getPlan(planId: string | null | undefined): Plan {
  return PLANS[(planId as PlanId) ?? 'free'] ?? PLANS.free
}

/** Check if a subscription is active (not expired). */
export function isSubscriptionActive(periodEnd: Date | null | undefined): boolean {
  if (!periodEnd) return false
  return periodEnd.getTime() > Date.now()
}

/** Determine the effective plan for a user — falls back to free if subscription lapsed. */
export function getEffectivePlan(user: {
  plan: string
  stripeCurrentPeriodEnd?: Date | null
}): Plan {
  if (user.plan === 'free') return PLANS.free
  if (isSubscriptionActive(user.stripeCurrentPeriodEnd)) {
    return getPlan(user.plan)
  }
  // Subscription lapsed — treat as free
  return PLANS.free
}
