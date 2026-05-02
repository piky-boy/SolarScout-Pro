import { getTranslations } from 'next-intl/server'
import { SiteHeaderMarketing } from '@/components/site/site-header-marketing'
import { SiteFooterMarketing } from '@/components/site/site-footer-marketing'
import { HowItWorksClient } from './_components/how-it-works-client'
import { buildLocalizedMetadata, howToJsonLd, breadcrumbJsonLd, SITE_URL } from '@/lib/seo'

const HOW_IT_WORKS_TRANSLATIONS = {
  en: {
    title: 'How It Works — Solar Lead Generation in 3 Steps',
    description:
      'See how SolarScout Pro automatically detects commercial rooftops, qualifies solar leads with real Google Solar API data, and generates branded PDF proposals in minutes.',
  },
  es: {
    title: 'Cómo Funciona — Generación de Leads Solares en 3 Pasos',
    description:
      'Descubre cómo SolarScout Pro detecta automáticamente tejados comerciales, cualifica leads solares con datos reales de Google Solar API y genera propuestas PDF en minutos.',
  },
  sq: {
    title: 'Si Funksionon — Gjenerimi i Drejtmeve Diellore në 3 Hapa',
    description:
      'Zbulo si SolarScout Pro zbulon automatikisht çatitë komerciale, kualifikon drejtmet diellore me të dhëna reale nga Google Solar API dhe gjeneron propozime PDF të markës në minuta.',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return buildLocalizedMetadata({
    translations: HOW_IT_WORKS_TRANSLATIONS,
    basePath: '/how-it-works',
    locale,
    ogImage: '/how-it-works/hero.png',
  })
}

const HOW_TO_STEPS = [
  {
    name: 'Search & Discover — Point at any city',
    text: 'Type a city or region in any of the five European markets.',
  },
  {
    name: 'Analyze & Qualify — Google Solar API does the engineering',
    text: 'Real satellite data: maximum panel count, annual energy yield, CO₂ offset.',
  },
  {
    name: 'Propose & Close — Branded PDF proposals in 10 seconds',
    text: 'Generate a 2-page branded proposal with satellite imagery and financial breakdown.',
  },
]

export default async function HowItWorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd(HOW_TO_STEPS)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', url: SITE_URL },
              { name: 'How It Works', url: `${SITE_URL}/how-it-works` },
            ])
          ),
        }}
      />
      <SiteHeaderMarketing />
      <HowItWorksClient locale={locale} />
      <SiteFooterMarketing locale={locale} />
    </div>
  )
}
