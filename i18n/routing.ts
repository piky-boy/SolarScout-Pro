import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'es', 'ro', 'sq'],
  defaultLocale: 'en',
  // English has no prefix (/), Spanish is /es/, Romanian is /ro/, Albanian is /sq/
  localePrefix: 'as-needed',
})

export type Locale = (typeof routing.locales)[number]
