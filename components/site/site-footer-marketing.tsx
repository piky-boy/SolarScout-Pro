'use client'

import Link from 'next/link'
import { SunMedium } from 'lucide-react'
import { useTranslations } from 'next-intl'

export interface HubLinkItem {
  slug: string
  title: string
  href: string
}

// Client sub-component so it can read translations from NextIntlClientProvider
function FooterNav({ locale }: { locale: string }) {
  const t = useTranslations('footer')
  function localHref(path: string) {
    return locale === 'en' ? path : `/${locale}${path}`
  }
  return (
    <nav className="flex items-center gap-6">
      <Link href={localHref('/')} className="transition-colors hover:text-foreground">
        {t('home')}
      </Link>
      <Link href="/dashboard" className="transition-colors hover:text-foreground">
        {t('dashboard')}
      </Link>
      <Link href="/leads" className="transition-colors hover:text-foreground">
        {t('leads')}
      </Link>
    </nav>
  )
}

// Can be used both inside [locale] (server) and from root pages (with locale prop)
export function SiteFooterMarketing({
  locale = 'en',
  hubLinks,
}: {
  locale?: string
  hubLinks?: HubLinkItem[]
}) {
  return (
    <footer className="mt-auto border-t border-border/40 bg-muted/30">
      {/* Solar Leads by Market — shown when hub links are provided */}
      {hubLinks && hubLinks.length > 0 && (
        <div className="border-b border-border/40 py-6">
          <div className="mx-auto max-w-[1200px] px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">
              Solar Leads by Market
            </p>
            <div className="flex flex-wrap gap-3">
              {hubLinks.map((link) => (
                <Link
                  key={link.slug}
                  href={link.href}
                  className="rounded-md border border-border/50 bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-amber-500/40 hover:text-foreground"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-orange-500">
            <SunMedium className="h-4 w-4 text-white" />
          </div>
          <span className="font-display font-semibold text-foreground">
            Solar<span className="text-amber-500">Scout</span> Pro
          </span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
        <FooterNav locale={locale} />
      </div>
    </footer>
  )
}
