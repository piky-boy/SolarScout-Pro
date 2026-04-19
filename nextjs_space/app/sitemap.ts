import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default function sitemap(): MetadataRoute.Sitemap {
  const h = headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? ''
  const protocol = h.get('x-forwarded-proto') ?? 'https'
  const base = host ? `${protocol}://${host}` : process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const now = new Date()
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/how-it-works`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ]
}
