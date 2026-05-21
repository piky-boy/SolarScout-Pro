/**
 * Intent SEO — Factory Engine
 *
 * Idempotent generator that cross-combines INTENT_TEMPLATES × INTENT_CITIES
 * to produce IntentLanding records in MongoDB via Prisma.
 *
 * Run:
 *   npx tsx scripts/run-intent-factory.ts --dry-run
 *   npx tsx scripts/run-intent-factory.ts --country RO
 */

import { prisma } from '@/lib/db'
import {
  INTENT_TEMPLATES,
  INTENT_CITIES,
  COUNTRY_CONFIG,
  ALL_CITIES,
} from '@/lib/intent-templates'
import type {
  IntentTemplate,
  IntentCity,
  IntentSegment,
  FactoryOptions,
  FactoryResult,
  IntentLeadFilter,
} from '@/lib/intent-types'

// ─── Slug helpers ─────────────────────────────────────────────────────────────

export function generateGeoSlug(intentType: string, citySlug: string): string {
  return `${intentType}-${citySlug}`
}

export function generateHubSlug(intentType: string, countrySlug: string): string {
  return `${intentType}-${countrySlug}`
}

// ─── Template variable resolver ───────────────────────────────────────────────

function resolve(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '')
}

// ─── Seed segments builder ────────────────────────────────────────────────────

function buildSeedSegments(
  template: IntentTemplate,
  vars: Record<string, string>,
): IntentSegment[] {
  return template.seedSegments.map((s) => ({
    ...s,
    hook: '',   // filled in by AI agent
    stat: '',   // filled in by AI agent
    ctaLabel: resolve(s.ctaLabel, vars),
  }))
}

// ─── Single page data builder ─────────────────────────────────────────────────

export function buildGeoPageData(
  template: IntentTemplate,
  city: IntentCity,
) {
  const vars: Record<string, string> = {
    city: city.label,
    cityGenitive: city.genitive ?? city.label,
    country: city.countryLabel,
    countryCode: city.countryCode,
  }

  const slug = generateGeoSlug(template.intentType, city.slug)

  const leadFilter: IntentLeadFilter = {
    city: city.label,
    countryCode: city.countryCode,
    ...(template.leadFilter.businessTypes
      ? { businessTypes: template.leadFilter.businessTypes }
      : {}),
  }

  return {
    slug,
    locale: COUNTRY_CONFIG[city.countryCode]?.locale ?? 'en',
    intentType: template.intentType,
    isHub: false,
    city: city.label,
    countryCode: city.countryCode,
    tier: city.tier,
    title: resolve(template.titleTemplate, vars),
    h1: resolve(template.h1Template, vars),
    metaTitle: resolve(template.metaTitleTemplate, vars),
    metaDescription: resolve(template.metaDescriptionTemplate, vars),
    intro: resolve(template.introTemplate, vars),
    seoCopy: '',
    keywords: [
      ...template.keywords,
      city.label.toLowerCase(),
      city.countryLabel.toLowerCase(),
    ],
    emotionalHook: resolve(template.hooks[0] ?? '', vars),
    heroSubcopy: '',
    segments: buildSeedSegments(template, vars) as any[],
    socialProofClusters: [] as any[],
    faqs: template.faqs.map((faq) => ({
      question: resolve(faq.question, vars),
      answer: resolve(faq.answer, vars),
    })) as any[],
    aiSearchQA: [] as any[],
    relatedClusters: [] as any[],
    leadFilter: leadFilter as any,
    cityLocalCopy: city.tier === 1 ? (city.context ?? null) : null,
    isActive: false,
  }
}

export function buildHubPageData(
  template: IntentTemplate,
  countryCode: string,
) {
  const country = COUNTRY_CONFIG[countryCode]
  if (!country) throw new Error(`Unknown country code: ${countryCode}`)

  const vars: Record<string, string> = {
    city: country.label,
    cityGenitive: country.label,
    country: country.label,
    countryAdj: country.adjective,
    countryCode,
  }

  const slug = generateHubSlug(template.intentType, country.slug)

  const titleTemplate = template.titleTemplate
    .replace('in {city}', `in ${country.label}`)
    .replace('in {country}', `in ${country.label}`)
  const h1Template = template.h1Template
    .replace('in {city}', `in ${country.label}`)
    .replace('in {country}', `in ${country.label}`)
  const metaTitleTemplate = template.metaTitleTemplate
    .replace('in {city}', `in ${country.label}`)
    .replace('in {country}', `in ${country.label}`)
  const metaDescTemplate = template.metaDescriptionTemplate
    .replace('{city}', country.label)
    .replace('{country}', country.label)

  const leadFilter: IntentLeadFilter = {
    countryCode,
    ...(template.leadFilter.businessTypes
      ? { businessTypes: template.leadFilter.businessTypes }
      : {}),
  }

  return {
    slug,
    locale: country.locale,
    intentType: template.intentType,
    isHub: true,
    city: null,
    countryCode,
    tier: 1,
    title: resolve(titleTemplate, vars),
    h1: resolve(h1Template, vars),
    metaTitle: resolve(metaTitleTemplate, vars),
    metaDescription: resolve(metaDescTemplate, vars),
    intro: resolve(template.introTemplate, vars),
    seoCopy: '',
    keywords: [
      ...template.keywords,
      country.label.toLowerCase(),
      country.adjective.toLowerCase(),
    ],
    emotionalHook: resolve(template.hooks[1] ?? template.hooks[0] ?? '', vars),
    heroSubcopy: '',
    segments: buildSeedSegments(template, vars) as any[],
    socialProofClusters: [] as any[],
    faqs: template.faqs.map((faq) => ({
      question: resolve(faq.question, vars),
      answer: resolve(faq.answer, vars),
    })) as any[],
    aiSearchQA: [] as any[],
    relatedClusters: [] as any[],
    leadFilter: leadFilter as any,
    cityLocalCopy: null,
    isActive: false,
  }
}

// ─── Idempotent upsert ────────────────────────────────────────────────────────

/**
 * Upsert a single page.
 *
 * CREATE  — writes all fields.
 * UPDATE  — only updates non-AI, non-manual fields (SEO copy, title templates).
 *           Preserves: aiSearchQA, cityLocalCopy, abVariants, seoCopy (if non-empty).
 */
async function upsertPage(data: ReturnType<typeof buildGeoPageData> | ReturnType<typeof buildHubPageData>): Promise<FactoryResult> {
  const { slug } = data
  try {
    const existing = await prisma.intentLanding.findUnique({
      where: { slug },
      select: {
        id: true,
        aiSearchQA: true,
        cityLocalCopy: true,
        abVariants: true,
        seoCopy: true,
      },
    })

    if (!existing) {
      await prisma.intentLanding.create({ data: data as any })
      return { slug, action: 'created' }
    }

    // Preserve manually curated / AI-generated fields
    await prisma.intentLanding.update({
      where: { slug },
      data: {
        title: data.title,
        h1: data.h1,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        intro: data.intro,
        keywords: data.keywords,
        emotionalHook: data.emotionalHook,
        faqs: data.faqs as any,
        leadFilter: data.leadFilter as any,
        segments: data.segments as any,
        // preserve seoCopy if already written
        ...(existing.seoCopy ? {} : { seoCopy: data.seoCopy }),
        // preserve cityLocalCopy only if it was hand-edited (non-null and longer than template)
        ...(existing.cityLocalCopy ? {} : { cityLocalCopy: data.cityLocalCopy }),
      },
    })
    return { slug, action: 'skipped', reason: 'already exists — template fields refreshed' }
  } catch (err: any) {
    return { slug, action: 'error', reason: err.message }
  }
}

// ─── Main factory runner ──────────────────────────────────────────────────────

export async function runFactory(options: FactoryOptions = {}): Promise<FactoryResult[]> {
  const {
    dryRun = false,
    countryCode,
    city,
    includeTier2 = false,
    skipHubs = false,
  } = options

  const results: FactoryResult[] = []

  // Filter cities
  const cities = ALL_CITIES.filter((c) => {
    if (countryCode && c.countryCode !== countryCode) return false
    if (city && c.slug !== city) return false
    if (!includeTier2 && c.tier === 2) return false
    return true
  })

  // Countries in scope for hub pages
  const countryCodes = countryCode
    ? [countryCode]
    : [...new Set(cities.map((c) => c.countryCode))]

  const templates = Object.values(INTENT_TEMPLATES)

  // ── Build all work items ─────────────────────────────────────────────────
  type WorkItem = ReturnType<typeof buildGeoPageData> | ReturnType<typeof buildHubPageData>
  const workItems: WorkItem[] = []

  for (const template of templates) {
    for (const c of cities) {
      workItems.push(buildGeoPageData(template, c))
    }
  }

  if (!skipHubs) {
    for (const template of templates) {
      for (const cc of countryCodes) {
        if (!COUNTRY_CONFIG[cc]) continue
        workItems.push(buildHubPageData(template, cc))
      }
    }
  }

  if (dryRun) {
    return workItems.map((item) => ({ slug: item.slug, action: 'created', reason: 'dry-run' }))
  }

  // ── Concurrency-limited upserts (10 at a time) ───────────────────────────
  const CONCURRENCY = 10
  for (let i = 0; i < workItems.length; i += CONCURRENCY) {
    const batch = workItems.slice(i, i + CONCURRENCY)
    const batchResults = await Promise.all(batch.map((item) => upsertPage(item)))
    results.push(...batchResults)
  }

  return results
}
