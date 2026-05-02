import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/how-it-works',
          '/login',
          '/es',
          '/es/',
          '/es/how-it-works',
          '/sq',
          '/sq/',
          '/sq/how-it-works',
        ],
        disallow: ['/api/', '/dashboard', '/leads', '/admin', '/waitlist'],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/how-it-works',
          '/login',
          '/#features',
          '/#how-it-works',
          '/#faq',
          '/es',
          '/es/',
          '/es/how-it-works',
          '/sq',
          '/sq/',
          '/sq/how-it-works',
        ],
        disallow: ['/api/', '/dashboard', '/leads', '/admin', '/waitlist'],
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/how-it-works',
          '/login',
          '/es',
          '/es/how-it-works',
          '/sq',
          '/sq/how-it-works',
        ],
        disallow: ['/api/', '/dashboard', '/leads', '/admin', '/waitlist'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
