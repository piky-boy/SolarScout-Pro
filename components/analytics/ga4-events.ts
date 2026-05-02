/**
 * GA4 / GTM event helpers.
 *
 * Works with both:
 *  - Direct GA4 (gtag.js loaded in layout.tsx via NEXT_PUBLIC_GA4_ID)
 *  - Google Tag Manager (events forwarded via dataLayer → GA4 tag)
 *
 * All events are safe to call from client components.
 */

export type GA4EventName =
  | 'page_view'
  | 'generate_leads_click'
  | 'language_switch'
  | 'lead_detail_view'
  | 'outreach_generated'
  | 'csv_export'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer?: any[]
  }
}

export function trackEvent(name: GA4EventName, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return

  // Push to GTM dataLayer (works even without direct GA4 script)
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event: name, ...params })

  // Also fire directly via gtag when available (direct GA4 setup)
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  }
}
