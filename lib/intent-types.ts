/**
 * Shared TypeScript types for the Intent SEO system.
 * These mirror the IntentLanding Prisma model's JSON sub-fields.
 */

// ─── Core sub-types (stored as Json[] in Prisma) ────────────────────────────

export interface IntentSegment {
  /** Machine key, e.g. "commercial" */
  type: string
  /** Display label, e.g. "Commercial Offices" */
  label: string
  /** Short persuasion hook for this building type */
  hook: string
  /** Key stat shown on the card */
  stat: string
  /** CTA label */
  ctaLabel: string
  /** CTA href (relative) */
  ctaHref: string
  /** Lucide icon name */
  icon: string
}

export interface IntentFAQ {
  question: string
  answer: string
}

export interface AISearchQA {
  /** Question optimised for AI Overviews / ChatGPT / Perplexity */
  question: string
  /** Structured, citation-ready answer (2–4 sentences) */
  answer: string
}

export interface RelatedCluster {
  /** Display title of the related page */
  title: string
  /** Absolute path, e.g. "/intent/commercial-solar-leads-bucharest" */
  href: string
  /** Short teaser sentence */
  teaser: string
}

export interface SocialProofCluster {
  /** Stat value, e.g. "2,400+" */
  value: string
  /** Label below the stat */
  label: string
  /** Optional sub-text */
  sub?: string
}

export interface ABVariants {
  /** Alternate emotional hook to A/B test */
  hookAlt?: string
  /** Alternate hero subcopy */
  subcopyAlt?: string
  /** Which variant is currently live: "a" | "b" */
  active?: 'a' | 'b'
  impressions?: { a: number; b: number }
  conversions?: { a: number; b: number }
}

// ─── Lead filter descriptor ──────────────────────────────────────────────────

export interface IntentLeadFilter {
  city?: string
  countryCode?: string
  /** Building / business type keys, e.g. ["commercial", "warehouse"] */
  businessTypes?: string[]
}

// ─── Full record shape (mirrors Prisma IntentLanding) ───────────────────────

export interface IntentLandingRecord {
  id: string
  slug: string
  locale: string
  intentType: string
  isHub: boolean
  city?: string | null
  countryCode?: string | null
  tier: number
  title: string
  h1: string
  metaTitle: string
  metaDescription: string
  intro: string
  seoCopy: string
  heroImageUrl?: string | null
  keywords: string[]
  emotionalHook: string
  heroSubcopy: string
  segments: IntentSegment[]
  socialProofClusters: SocialProofCluster[]
  faqs: IntentFAQ[]
  aiSearchQA: AISearchQA[]
  relatedClusters: RelatedCluster[]
  leadFilter?: IntentLeadFilter | null
  cityLocalCopy?: string | null
  abVariants?: ABVariants | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ─── Template shape (used by intent-templates.ts) ────────────────────────────

export interface IntentTemplate {
  intentType: string
  /** Handlebars-style: {city}, {cityGenitive}, {country}, {countryAdj} */
  titleTemplate: string
  h1Template: string
  metaTitleTemplate: string
  metaDescriptionTemplate: string
  introTemplate: string
  /** Template hooks — resolved at factory time */
  hooks: string[]
  faqs: IntentFAQ[]
  /** Partial lead filter — city/countryCode filled in at factory time */
  leadFilter: Partial<IntentLeadFilter>
  keywords: string[]
  /** Segments seeded by the factory (AI agent will enrich them later) */
  seedSegments: Omit<IntentSegment, 'hook' | 'stat'>[]
}

export interface IntentCity {
  slug: string           // url-safe slug, e.g. "cluj-napoca"
  label: string          // display name, e.g. "Cluj-Napoca"
  countryCode: string    // ISO-3166 alpha-2
  countryLabel: string   // e.g. "Romania"
  tier: 1 | 2
  /** Genitive form (used in Romanian/Spanish grammar) */
  genitive?: string      // e.g. "Clujului" or "de Cluj"
  /** Short editorial context injected into tier-1 pages */
  context?: string
}

// ─── Factory options ──────────────────────────────────────────────────────────

export interface FactoryOptions {
  dryRun?: boolean
  /** Filter by country code, e.g. "RO" */
  countryCode?: string
  /** Filter by city slug, e.g. "bucharest" */
  city?: string
  /** Whether to generate tier-2 city pages */
  includeTier2?: boolean
  /** Locale for seeded content (does NOT translate — use AI agent for that) */
  locale?: string
  /** Skip hub (national) pages */
  skipHubs?: boolean
}

export interface FactoryResult {
  slug: string
  action: 'created' | 'skipped' | 'error'
  reason?: string
}
