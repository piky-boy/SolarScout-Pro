/**
 * Intent SEO — JSON-LD helpers and metadata builder
 *
 * Extends the patterns in lib/seo.ts for intent landing pages.
 */

import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME, OG_IMAGE } from '@/lib/seo'
import type { IntentLandingRecord, IntentFAQ } from '@/lib/intent-types'

// Locales the system supports for intent pages
export const INTENT_LOCALES = ['en', 'es', 'ro', 'sq'] as const

/** Build the canonical path for an intent page in a given locale */
export function intentPath(slug: string, locale: string): string {
  const prefix = locale === 'en' ? '' : `/${locale}`
  return `${prefix}/intent/${slug}`
}

/** Build the full URL for an intent page */
export function intentUrl(slug: string, locale: string): string {
  return `${SITE_URL}${intentPath(slug, locale)}`
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export function buildIntentMetadata(
  page: IntentLandingRecord,
  locale: string,
): Metadata {
  const canonical = intentUrl(page.slug, locale)

  // hreflang alternates — same slug across all locales
  const languages: Record<string, string> = {
    'x-default': intentUrl(page.slug, 'en'),
  }
  for (const loc of INTENT_LOCALES) {
    languages[loc] = intentUrl(page.slug, loc)
  }

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: canonical,
      siteName: SITE_NAME,
      images: [
        {
          url: page.heroImageUrl ?? OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${page.h1} — ${SITE_NAME}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.metaTitle,
      description: page.metaDescription,
      images: [page.heroImageUrl ?? OG_IMAGE],
    },
  }
}

// ─── JSON-LD: CollectionPage + ItemList ───────────────────────────────────────

export function intentCollectionPageJsonLd(page: IntentLandingRecord, locale: string) {
  const url = intentUrl(page.slug, locale)
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: page.title,
    description: page.metaDescription,
    url,
    inLanguage: locale,
    about: {
      '@type': 'Service',
      name: 'Solar Lead Generation',
      provider: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
      ...(page.city
        ? {
            areaServed: {
              '@type': 'City',
              name: page.city,
              containedInPlace: {
                '@type': 'Country',
                name: page.countryCode,
              },
            },
          }
        : {
            areaServed: {
              '@type': 'Country',
              name: page.countryCode,
            },
          }),
    },
    hasPart: page.segments.map((s) => ({
      '@type': 'Thing',
      name: s.label,
      description: s.hook || s.label,
    })),
  }
}

// ─── JSON-LD: FAQPage ─────────────────────────────────────────────────────────

export function intentFaqJsonLd(faqs: IntentFAQ[]) {
  if (!faqs.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// ─── JSON-LD: Article (for seoCopy) ──────────────────────────────────────────

export function intentArticleJsonLd(page: IntentLandingRecord, locale: string) {
  const url = intentUrl(page.slug, locale)
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.h1,
    description: page.metaDescription,
    url,
    inLanguage: locale,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    dateModified: page.updatedAt instanceof Date
      ? page.updatedAt.toISOString()
      : new Date().toISOString(),
  }
}

// ─── JSON-LD: BreadcrumbList ──────────────────────────────────────────────────

export function intentBreadcrumbJsonLd(page: IntentLandingRecord, locale: string) {
  const homeUrl = locale === 'en' ? SITE_URL : `${SITE_URL}/${locale}`
  const items = [
    { position: 1, name: 'Home', id: homeUrl },
    { position: 2, name: 'Solar Leads', id: `${SITE_URL}${intentPath('solar-leads-' + (page.countryCode?.toLowerCase() ?? 'europe'), locale)}` },
  ]

  if (!page.isHub && page.city) {
    items.push({
      position: 3,
      name: page.title,
      id: intentUrl(page.slug, locale),
    })
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      item: item.id,
    })),
  }
}
