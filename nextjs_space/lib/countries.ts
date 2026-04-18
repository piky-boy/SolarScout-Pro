// Supported European markets for SolarScout Pro
export const SUPPORTED_COUNTRIES = [
  { code: 'RO', name: 'Romania', center: [25.0094, 45.9432], zoom: 6 },
  { code: 'ES', name: 'Spain', center: [-3.7492, 40.4637], zoom: 6 },
  { code: 'PT', name: 'Portugal', center: [-8.2245, 39.3999], zoom: 6 },
  { code: 'AL', name: 'Albania', center: [20.1683, 41.1533], zoom: 7 },
] as const

export const COUNTRY_NAME_BY_CODE: Record<string, string> = SUPPORTED_COUNTRIES.reduce(
  (acc, c) => {
    acc[c.code] = c.name
    return acc
  },
  {} as Record<string, string>,
)

export function getCountryFromMapboxContext(context: any[] | undefined): {
  code: string | null
  name: string | null
} {
  if (!Array.isArray(context)) return { code: null, name: null }
  const country = context.find((c: any) => typeof c?.id === 'string' && c.id.startsWith('country'))
  if (!country) return { code: null, name: null }
  const code = (country.short_code ?? '').toString().toUpperCase() || null
  const name = country.text ?? null
  return { code, name }
}

export function getCityFromMapboxContext(context: any[] | undefined, fallback?: string): string | null {
  if (!Array.isArray(context)) return fallback ?? null
  const place = context.find((c: any) => typeof c?.id === 'string' && (c.id.startsWith('place') || c.id.startsWith('locality')))
  return place?.text ?? fallback ?? null
}
