'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { trackEvent } from '@/components/analytics/ga4-events'

const LANG_META: Record<string, { label: string; flag: string }> = {
  en: { label: 'EN', flag: '🇬🇧' },
  es: { label: 'ES', flag: '🇪🇸' },
  ro: { label: 'RO', flag: '🇷🇴' },
  sq: { label: 'SQ', flag: '🇦🇱' },
}

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  function switchLocale(next: string) {
    if (next === locale) return
    trackEvent('language_switch', { from_locale: locale, to_locale: next })
    router.push(pathname, { locale: next })
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background p-0.5">
      {routing.locales.map((loc) => {
        const meta = LANG_META[loc]
        const active = loc === locale
        return (
          <button
            key={loc}
            onClick={() => switchLocale(loc)}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              active
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            aria-label={`Switch language to ${loc}`}
            aria-current={active ? 'true' : undefined}
          >
            <span className="text-sm leading-none">{meta.flag}</span>
            <span className="hidden sm:inline">{meta.label}</span>
          </button>
        )
      })}
    </div>
  )
}
