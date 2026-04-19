import { Metadata } from 'next'
import { HowItWorksClient } from './_components/how-it-works-client'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'

export const metadata: Metadata = {
  title: 'How It Works — SolarScout Pro',
  description:
    'See how SolarScout Pro automatically detects commercial rooftops, qualifies solar leads with real satellite data, and generates branded proposals in minutes.',
  openGraph: {
    title: 'How SolarScout Pro Works',
    description:
      'Auto-detect commercial rooftops → Qualify with Google Solar API → Generate branded proposals. All in one platform.',
    images: ['/how-it-works/hero.png'],
  },
}

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <HowItWorksClient />
      <SiteFooter />
    </div>
  )
}
