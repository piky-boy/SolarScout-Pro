import { Metadata } from 'next'
import { PricingClient } from './_components/pricing-client'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: 'Pricing — SolarScout Pro',
    description:
      'Simple, transparent pricing. Start free, upgrade when you are ready. No contracts, cancel anytime.',
    path: '/pricing',
  }),
}

export default function PricingPage() {
  return <PricingClient />
}
