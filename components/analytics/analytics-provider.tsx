'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { trackEvent } from './ga4-events'

/**
 * Fires a GA4 `page_view` event on every client-side route change.
 * Mount this once inside <Providers> so it covers the whole app.
 */
export function AnalyticsProvider() {
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip the very first render — the page_view for SSR is handled by
    // the gtag 'config' call (or GTM) on initial page load.
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Derive locale from the pathname prefix
    const locale = pathname.startsWith('/es')
      ? 'es'
      : pathname.startsWith('/sq')
        ? 'sq'
        : 'en'

    trackEvent('page_view', {
      page_path: pathname,
      locale,
    })
  }, [pathname])

  // Renders nothing — purely a side-effect component
  return null
}
