import { getTranslations } from 'next-intl/server'
import { SiteHeaderMarketing } from '@/components/site/site-header-marketing'
import { SiteFooterMarketing } from '@/components/site/site-footer-marketing'
import { HowItWorksClient } from './_components/how-it-works-client'
import { buildPageMetadata, howToJsonLd, breadcrumbJsonLd, SITE_URL } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return buildPageMetadata({
    title: 'How It Works — Solar Lead Generation in 3 Steps',
    description:
      'See how SolarScout Pro automatically detects commercial rooftops, qualifies solar leads with real Google Solar API data, and generates branded PDF proposals in minutes.',
    path: locale === 'en' ? '/how-it-works' : `/${locale}/how-it-works`,
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
