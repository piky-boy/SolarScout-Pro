import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-static'

const LOCALES = ['en', 'es', 'sq'] as const
type Locale = (typeof LOCALES)[number]

/** Build a URL for a given locale + path.
 *  English lives at the root, other locales get a prefix. */
function localUrl(locale: Locale, path: string): string {
  const prefix = locale === 'en' ? '' : `/${locale}`
  const suffix = path === '/' ? '' : path
  return `${SITE_URL}${prefix}${suffix}`
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  /* ------------------------------------------------------------------ */
  /*  Home page — all three locales                                       */
  /* ------------------------------------------------------------------ */
  const homePages: MetadataRoute.Sitemap = LOCALES.map((locale) => ({
    url: localUrl(locale, '/'),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: locale === 'en' ? 1.0 : 0.95,
  }))

  /* ------------------------------------------------------------------ */
  /*  How It Works — all three locales                                    */
  /* ------------------------------------------------------------------ */
  const howItWorksPages: MetadataRoute.Sitemap = LOCALES.map((locale) => ({
    url: localUrl(locale, '/how-it-works'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: locale === 'en' ? 0.9 : 0.85,
  }))

  /* ------------------------------------------------------------------ */
  /*  Other static pages (English only — no translated variants yet)     */
  /* ------------------------------------------------------------------ */
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/login`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  /* ------------------------------------------------------------------ */
  /*  Section anchors — help crawlers index deep-linked content          */
  /* ------------------------------------------------------------------ */
  const sectionAnchors: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/#features`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/#how-it-works`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/#faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  return [...homePages, ...howItWorksPages, ...staticPages, ...sectionAnchors]
}
