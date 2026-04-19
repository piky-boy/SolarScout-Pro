import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL
  const now = new Date()

  /* ------------------------------------------------------------------ */
  /*  Static public pages                                                */
  /* ------------------------------------------------------------------ */
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${base}/how-it-works`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${base}/login`,
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
      url: `${base}/#features`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${base}/#how-it-works`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${base}/#faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  return [...staticPages, ...sectionAnchors]
}
