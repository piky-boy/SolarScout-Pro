import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? ''
  const protocol = h.get('x-forwarded-proto') ?? 'https'
  const base = host ? `${protocol}://${host}` : process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
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
