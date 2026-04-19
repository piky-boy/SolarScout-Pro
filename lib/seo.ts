import type { Metadata } from 'next'

/* ------------------------------------------------------------------ */
/*  Shared SEO constants                                               */
/* ------------------------------------------------------------------ */

export const SITE_NAME = 'SolarScout Pro'
export const SITE_TAGLINE = 'Automated Solar Lead Generation for Europe'
export const SITE_URL =
  process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

export const SITE_DESCRIPTION =
  'SolarScout Pro automatically detects commercial buildings and warehouses across Romania, Spain, Portugal, Albania and the United Kingdom — turning satellite data into ready-to-contact solar leads.'

export const OG_IMAGE = '/og-image.png'

/** Markets the app covers — used for structured data, meta tags, etc. */
export const MARKETS = [
  'Romania',
  'Spain',
  'Portugal',
  'Albania',
  'United Kingdom',
] as const

/** Canonical keywords shared across pages. Per-page can extend this. */
export const BASE_KEYWORDS = [
  'solar leads',
  'solar lead generation',
  'commercial solar',
  'warehouses solar',
  'solar prospecting',
  'solar sales tool',
  'rooftop solar detection',
  'satellite building detection',
  'B2B solar leads Europe',
  ...MARKETS.map((m) => `${m} solar`),
]

/* ------------------------------------------------------------------ */
/*  Google Search Console verification                                 */
/* ------------------------------------------------------------------ */
/** Set GOOGLE_SITE_VERIFICATION env var to the content value Google gives you */
export const GOOGLE_SITE_VERIFICATION =
  process.env.GOOGLE_SITE_VERIFICATION ?? ''

/* ------------------------------------------------------------------ */
/*  Helper: build full Metadata for a page                             */
/* ------------------------------------------------------------------ */

interface PageSEO {
  /** Page title (goes into the template) */
  title: string
  /** Meta description — aim for 150-160 chars */
  description: string
  /** Canonical path, e.g. '/how-it-works' */
  path: string
  /** Extra keywords to merge with base keywords */
  keywords?: string[]
  /** Custom OG image — defaults to shared one */
  ogImage?: string
  /** OG type override — defaults to 'website' */
  ogType?: 'website' | 'article'
  /** noindex this page */
  noIndex?: boolean
}

export function buildPageMetadata(seo: PageSEO): Metadata {
  const url = `${SITE_URL}${seo.path}`
  const image = seo.ogImage ?? OG_IMAGE

  return {
    title: seo.title,
    description: seo.description,
    keywords: [...BASE_KEYWORDS, ...(seo.keywords ?? [])],
    alternates: { canonical: url },
    openGraph: {
      title: `${seo.title} | ${SITE_NAME}`,
      description: seo.description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${seo.title} — ${SITE_NAME}`,
        },
      ],
      type: seo.ogType ?? 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${seo.title} | ${SITE_NAME}`,
      description: seo.description,
      images: [image],
    },
    ...(seo.noIndex ? { robots: { index: false, follow: false } } : {}),
  }
}

/* ------------------------------------------------------------------ */
/*  JSON-LD helpers                                                    */
/* ------------------------------------------------------------------ */

/** Organization schema — place once in root layout */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: SITE_DESCRIPTION,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: undefined, // Add when you have real ratings
  }
}

/** WebSite schema with SearchAction (AEO/GEO signal) */
export function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.svg`,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/leads?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/** FAQ structured data — great for AEO / featured snippets */
export function faqJsonLd(
  items: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: i.answer,
      },
    })),
  }
}

/** HowTo structured data for the how-it-works page */
export function howToJsonLd(
  steps: Array<{ name: string; text: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to generate solar leads with SolarScout Pro',
    description:
      'Step-by-step guide to automatically detect commercial rooftops and generate qualified solar leads using satellite data.',
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  }
}

/** BreadcrumbList structured data */
export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
