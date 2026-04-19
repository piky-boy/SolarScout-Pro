import { Metadata } from 'next'
import { HowItWorksClient } from './_components/how-it-works-client'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import {
  buildPageMetadata,
  howToJsonLd,
  breadcrumbJsonLd,
  SITE_URL,
} from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'How It Works — Solar Lead Generation in 3 Steps',
  description:
    'See how SolarScout Pro automatically detects commercial rooftops, qualifies solar leads with real Google Solar API data, and generates branded PDF proposals in minutes. Three steps from search to signed deal.',
  path: '/how-it-works',
  keywords: [
    'solar lead generation steps',
    'how to find solar leads',
    'Google Solar API',
    'solar proposal generator',
    'commercial rooftop detection how it works',
    'satellite solar analysis',
    'solar PDF proposal',
  ],
  ogImage: '/how-it-works/hero.png',
})

const HOW_TO_STEPS = [
  {
    name: 'Search & Discover — Point at any city',
    text: 'Type a city or region in any of the five European markets. SolarScout instantly queries OpenStreetMap and Google Places to surface every warehouse, factory, retail park and commercial building with a rooftop worth installing on.',
  },
  {
    name: 'Analyze & Qualify — Google Solar API does the engineering',
    text: 'For every lead, real satellite data is pulled from Google\'s Solar API: maximum panel count, annual energy yield in kWh, CO₂ offset, roof imagery quality and date. The instant business case engine shows payback period and 25-year ROI.',
  },
  {
    name: 'Propose & Close — Branded PDF proposals in 10 seconds',
    text: 'Generate a 2-page branded proposal with real satellite before/after imagery, pixel-accurate panel overlays, and a complete financial breakdown. Available in 5 languages — Spanish, Portuguese, Romanian, Albanian and English.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToJsonLd(HOW_TO_STEPS)),
        }}
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
      <SiteHeader />
      <HowItWorksClient />
      <SiteFooter />
    </div>
  )
}
