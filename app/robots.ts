import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? ''
  const protocol = h.get('x-forwarded-proto') ?? 'https'
  const base = host ? `${protocol}://${host}` : process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/how-it-works', '/login'],
        disallow: ['/api/', '/dashboard', '/leads', '/admin', '/waitlist'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/how-it-works', '/login', '/#features', '/#how-it-works', '/#faq'],
        disallow: ['/api/', '/dashboard', '/leads', '/admin', '/waitlist'],
      },
      {
        userAgent: 'Bingbot',
        allow: ['/', '/how-it-works', '/login'],
        disallow: ['/api/', '/dashboard', '/leads', '/admin', '/waitlist'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
