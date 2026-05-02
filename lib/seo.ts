import type { Metadata } from 'next'

/* ------------------------------------------------------------------ */
/*  Shared SEO constants                                               */
/* ------------------------------------------------------------------ */

export const SITE_NAME = 'SolarScout Pro'
export const SITE_TAGLINE = 'Automated Solar Lead Generation for Europe'
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? 'https://www.solarscout-pro.com'

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

/** Per-locale keyword extensions */
export const LOCALE_KEYWORDS: Record<string, string[]> = {
  en: ['solar leads UK', 'solar leads Romania', 'solar leads Portugal'],
  es: [
    'leads solares España',
    'generación de leads solares',
    'detección de tejados comerciales',
    'prospectos energía solar',
    'leads fotovoltaicos',
    'herramienta captación solar',
    'leads solares Europa',
  ],
  sq: [
    'drejtme diellore Shqipëri',
    'gjenerimi i drejtmeve diellore',
    'zbulimi i çative komerciale',
    'drejtme fotovoltaike',
    'mjet prospektimi diellor',
    'drejtme diellore Europë',
  ],
}

/** OG locale mapping */
export const LOCALE_OG: Record<string, string> = {
  en: 'en_US',
  es: 'es_ES',
  sq: 'sq_AL',
}

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
  /** OG locale override (e.g. 'es_ES') */
  ogLocale?: string
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
      locale: seo.ogLocale ?? 'en_US',
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
/*  Helper: build localized metadata with hreflang alternates          */
/* ------------------------------------------------------------------ */

interface LocalizedPageSEO {
  /** Translations keyed by locale */
  translations: Record<string, { title: string; description: string }>
  /** Base path without locale prefix, e.g. '/' or '/how-it-works' */
  basePath: string
  /** Current locale */
  locale: string
  /** Extra keywords to merge (locale-aware, merged on top of LOCALE_KEYWORDS) */
  extraKeywords?: string[]
  /** Custom OG image */
  ogImage?: string
}

export function buildLocalizedMetadata(seo: LocalizedPageSEO): Metadata {
  const { locale, basePath, translations } = seo
  const t = translations[locale] ?? translations['en']
  const ogLocale = LOCALE_OG[locale] ?? 'en_US'
  const image = seo.ogImage ?? OG_IMAGE

  // Canonical URL for this locale
  const canonicalPath = locale === 'en' ? basePath : `/${locale}${basePath === '/' ? '' : basePath}`
  const canonicalUrl = `${SITE_URL}${canonicalPath}`

  // hreflang alternates — en at root, others prefixed
  const hreflangPath = (loc: string) =>
    loc === 'en' ? basePath : `/${loc}${basePath === '/' ? '' : basePath}`

  const languages: Record<string, string> = {
    'x-default': `${SITE_URL}${hreflangPath('en')}`,
    en: `${SITE_URL}${hreflangPath('en')}`,
    es: `${SITE_URL}${hreflangPath('es')}`,
    sq: `${SITE_URL}${hreflangPath('sq')}`,
  }

  const keywords = [
    ...BASE_KEYWORDS,
    ...(LOCALE_KEYWORDS[locale] ?? []),
    ...(seo.extraKeywords ?? []),
  ]

  return {
    title: t.title,
    description: t.description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: `${t.title} | ${SITE_NAME}`,
      description: t.description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: `${t.title} — ${SITE_NAME}` }],
      type: 'website',
      locale: ogLocale,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t.title} | ${SITE_NAME}`,
      description: t.description,
      images: [image],
    },
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
    inLanguage: ['en', 'es', 'sq'],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    sameAs: [
      'https://www.linkedin.com/company/solarscout-pro',
      'https://twitter.com/solarscoutpro',
    ],
    knowsAbout: [
      'Solar Energy',
      'Lead Generation',
      'Commercial Rooftop Solar',
      'Photovoltaic Systems',
      'Satellite Building Detection',
      'Google Solar API',
      'OpenStreetMap',
    ],
    aggregateRating: undefined, // Add when you have real ratings
  }
}

/**
 * Service schema — strong GEO (Generative Engine Optimisation) signal.
 * Tells AI crawlers (ChatGPT, Perplexity, Gemini) what this service does
 * and where it operates.
 */
export function serviceJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${SITE_NAME} — Solar Lead Generation`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    serviceType: 'Solar Lead Generation Software',
    category: 'B2B SaaS',
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: [
      { '@type': 'Country', name: 'Romania', sameAs: 'https://www.wikidata.org/wiki/Q218' },
      { '@type': 'Country', name: 'Spain',   sameAs: 'https://www.wikidata.org/wiki/Q29' },
      { '@type': 'Country', name: 'Portugal', sameAs: 'https://www.wikidata.org/wiki/Q45' },
      { '@type': 'Country', name: 'Albania',  sameAs: 'https://www.wikidata.org/wiki/Q222' },
      { '@type': 'Country', name: 'United Kingdom', sameAs: 'https://www.wikidata.org/wiki/Q145' },
    ],
    audience: {
      '@type': 'BusinessAudience',
      audienceType: 'Solar energy companies, photovoltaic installers, B2B sales teams',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'SolarScout Pro Plans',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Automated Commercial Rooftop Detection',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Google Solar API Integration & Financial Analysis',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'AI Outreach Kit — Email, Call Script & WhatsApp',
          },
        },
      ],
    },
  }
}

/**
 * Speakable schema — AEO (Answer Engine Optimisation).
 * Marks the key answer-worthy sections for voice search and AI assistants.
 */
export function speakableJsonLd(pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: pageUrl,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2', '.speakable'],
    },
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
