import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'
import { prisma } from '@/lib/db'
import { intentUrl } from '@/lib/intent-seo'

export const dynamic = 'force-dynamic'

const LOCALES = ['en', 'es', 'ro', 'sq'] as const
type Locale = (typeof LOCALES)[number]

/** Build a URL for a given locale + path.
 *  English lives at the root, other locales get a prefix. */
function localUrl(locale: Locale, path: string): string {
  const prefix = locale === 'en' ? '' : `/${locale}`
  const suffix = path === '/' ? '' : path
  return `${SITE_URL}${prefix}${suffix}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  /* ------------------------------------------------------------------ */
  /*  Home page — all four locales                                        */
  /* ------------------------------------------------------------------ */
  const homePages: MetadataRoute.Sitemap = LOCALES.map((locale) => ({
    url: localUrl(locale, '/'),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: locale === 'en' ? 1.0 : 0.95,
  }))

  /* ------------------------------------------------------------------ */
  /*  How It Works — all four locales                                     */
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

  /* ------------------------------------------------------------------ */
  /*  Intent SEO landing pages                                            */
  /* ------------------------------------------------------------------ */
  let intentPages: MetadataRoute.Sitemap = []
  try {
    const activePages = await prisma.intentLanding.findMany({
      where: { isActive: true },
      select: { slug: true, locale: true, tier: true, isHub: true, updatedAt: true },
    })

    intentPages = activePages.map((page) => ({
      url: intentUrl(page.slug, page.locale),
      lastModified: page.updatedAt,
      changeFrequency: page.isHub ? 'weekly' : ('monthly' as const),
      // Hub pages = 0.9, tier-1 geo = 0.8, tier-2 geo = 0.6
      priority: page.isHub ? 0.9 : page.tier === 1 ? 0.8 : 0.6,
    }))
  } catch {
    // DB unavailable at build time — skip intent pages
    intentPages = []
  }

  return [...homePages, ...howItWorksPages, ...staticPages, ...sectionAnchors, ...intentPages]
}
