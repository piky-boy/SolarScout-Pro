import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

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
