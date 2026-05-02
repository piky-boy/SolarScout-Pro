/**
 * GA4 / GTM event helpers.
 *
 * Works with both:
 *  - Direct GA4 (gtag.js loaded in layout.tsx via NEXT_PUBLIC_GA4_ID)
 *  - Google Tag Manager (events forwarded via dataLayer → GA4 tag)
 *
 * All events are safe to call from client components.
 * Conversion events are marked — register them in GA4 Admin > Events > Mark as conversion.
 */

// ─── Event catalogue ──────────────────────────────────────────────────────────

export type GA4EventName =
  // Navigation / engagement
  | 'page_view'
  | 'scroll_depth'
  | 'outbound_click'
  // Lead generation (CONVERSION)
  | 'generate_leads_click'
  | 'leads_generated'        // fires after successful scan with count
  // Lead management
  | 'lead_detail_view'
  | 'lead_filter_applied'
  // Outreach (CONVERSION)
  | 'outreach_generated'
  | 'outreach_copy'          // user copies email/call/whatsapp text
  // Export (CONVERSION)
  | 'csv_export'
  // Language
  | 'language_switch'
  // Proposals (CONVERSION)
  | 'proposal_generated'
  // Auth / onboarding
  | 'signup_started'
  | 'login_success'
  | 'waitlist_joined'

/**
 * Typed params for each event — keeps call sites clean and autocomplete-friendly.
 * All params are optional so the function stays ergonomic.
 */
export interface GA4EventParams {
  page_view:             { page_path?: string; locale?: string }
  scroll_depth:          { depth_pct?: number; page_path?: string }
  outbound_click:        { url?: string; text?: string }
  generate_leads_click:  { location?: string }
  leads_generated:       { location?: string; count?: number; locale?: string }
  lead_detail_view:      { lead_id?: string; city?: string; country?: string; locale?: string }
  lead_filter_applied:   { filter_type?: string; filter_value?: string }
  outreach_generated:    { lead_id?: string; locale?: string; tone?: string }
  outreach_copy:         { channel?: 'email' | 'call' | 'whatsapp'; lead_id?: string }
  csv_export:            { lead_count?: number }
  language_switch:       { from_locale?: string; to_locale?: string }
  proposal_generated:    { lead_id?: string; locale?: string }
  signup_started:        { method?: 'email' | 'google' }
  login_success:         { method?: 'email' | 'google' }
  waitlist_joined:       { country?: string }
}

// ─── Conversion event list (register these in GA4 Admin → Events → Mark as conversion) ──

export const CONVERSION_EVENTS: GA4EventName[] = [
  'generate_leads_click',
  'leads_generated',
  'outreach_generated',
  'csv_export',
  'proposal_generated',
  'waitlist_joined',
]

// ─── Window augmentation ──────────────────────────────────────────────────────

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer?: any[]
  }
}

// ─── Core helper ─────────────────────────────────────────────────────────────

/**
 * Fire a GA4 event.
 *
 * @example
 * trackEvent('generate_leads_click', { location: 'Bucharest' })
 * trackEvent('csv_export', { lead_count: 42 })
 */
export function trackEvent<E extends GA4EventName>(
  name: E,
  params?: GA4EventParams[E],
): void {
  if (typeof window === 'undefined') return

  // GTM dataLayer push (works even without direct GA4 script)
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event: name, ...params })

  // Direct gtag call (when GA4 gtag.js is loaded without GTM)
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  }
}
