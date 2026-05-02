import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'es', 'sq'],
  defaultLocale: 'en',
  // English has no prefix (/), Spanish is /es/, Albanian is /sq/
  localePrefix: 'as-needed',
})

export type Locale = (typeof routing.locales)[number]
