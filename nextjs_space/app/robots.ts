import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  const h = headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? ''
  const protocol = h.get('x-forwarded-proto') ?? 'https'
  const base = host ? `${protocol}://${host}` : process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/#features', '/#how-it-works', '/login'],
        disallow: ['/api/', '/dashboard', '/leads'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
