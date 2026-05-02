import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing)

// ISO 3166-1 alpha-2 country codes → locale
const COUNTRY_LOCALE: Record<string, string> = {
  ES: 'es', // Spain
  AL: 'sq', // Albania
  XK: 'sq', // Kosovo
  MK: 'sq', // North Macedonia (large Albanian-speaking population)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // If the user has already chosen a locale manually (via the switcher),
  // the NEXT_LOCALE cookie is set — honour it and skip geo detection.
  const manualLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (manualLocale) {
    return intlMiddleware(request)
  }

  // Detect country: Vercel Edge Network sets request.geo,
  // Cloudflare sets the CF-IPCountry header as a fallback.
  const country = (
    request.geo?.country ??
    request.headers.get('cf-ipcountry') ??
    ''
  ).toUpperCase()

  const detectedLocale = COUNTRY_LOCALE[country] ?? 'en'

  // Only auto-redirect if:
  //   1. We detected a non-English locale, AND
  //   2. The visitor is currently on the English (prefix-less) path
  const onEnglishPath =
    !pathname.startsWith('/es') && !pathname.startsWith('/sq')

  if (detectedLocale !== 'en' && onEnglishPath) {
    const url = request.nextUrl.clone()
    url.pathname = `/${detectedLocale}${pathname === '/' ? '' : pathname}`
    const response = NextResponse.redirect(url)
    // Persist the detected locale so future requests don't redirect again.
    // 30-day expiry; user can override at any time via the language switcher.
    response.cookies.set('NEXT_LOCALE', detectedLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    })
    return response
  }

  return intlMiddleware(request)
}

export const config = {
  // Run on marketing pages only — skip API + app routes
  matcher: [
    '/',
    '/(es|sq)/:path*',
    '/how-it-works',
    '/how-it-works/:path*',
    '/((?!api|dashboard|leads|admin|login|waitlist|signup|_next|.*\\..*).*)',
  ],
}
