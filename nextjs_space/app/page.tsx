import Link from 'next/link'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Satellite,
  Building2,
  Download,
  MapPin,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { LandingHero } from './_components/landing-hero'

export const metadata = {
  title: 'Automated Solar Lead Generation for Europe',
  description:
    'Find commercial rooftops, residential blocks and urban buildings across Romania, Spain, Portugal, Albania and the United Kingdom in minutes — including BIPV glass balcony potential. Export qualified solar leads to CSV or Excel.',
}

const features = [
  {
    icon: Satellite,
    title: 'Satellite-powered detection',
    description:
      'Scan any city or region and instantly surface commercial rooftops, residential blocks and urban buildings using live OpenStreetMap + Mapbox satellite data — with BIPV balcony analysis for blocks of flats.',
  },
  {
    icon: Building2,
    title: 'Smart building classification',
    description:
      'Automatically classifies commercial rooftops, residential blocks and blocks of flats — including BIPV glass balcony potential for urban buildings.',
  },
  {
    icon: MapPin,
    title: 'Full business data',
    description:
      'Business name, category, address, coordinates, roof area, phone, email, website — everything you need to start outreach.',
  },
  {
    icon: BarChart3,
    title: 'Lead management dashboard',
    description:
      'Filter by country, city, business type and roof area. Search, sort and slice your pipeline any way you want.',
  },
  {
    icon: Download,
    title: 'CSV & Excel export',
    description:
      'Export filtered or selected leads to CSV or .xlsx in one click. Drop them straight into your CRM or outreach tool.',
  },
  {
    icon: Sparkles,
    title: 'Built for Europe',
    description:
      'Purpose-built for the solar boom in Romania, Spain, Portugal, Albania and the United Kingdom — with localised results and geography.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Enter a city or region',
    description: 'Type any location in Romania, Spain, Portugal, Albania or the United Kingdom. Autocomplete suggests the best match.',
  },
  {
    number: '02',
    title: 'Auto-detect commercial roofs',
    description:
      'SolarScout scans the area and surfaces warehouses, factories, retail parks, residential blocks and blocks of flats with BIPV potential.',
  },
  {
    number: '03',
    title: 'Review, filter, export',
    description: 'Sort by roof area, contact details or business type. Export the winners to CSV or Excel.',
  },
]

const markets = [
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'AL', name: 'Albania', flag: '🇦🇱' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(43_95%_55%/0.18),transparent_60%)]" />
        <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-20 lg:pt-28">
          <LandingHero />
        </div>
      </section>

      {/* Markets */}
      <section className="border-y border-border/40 bg-muted/30 py-8">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Covering high-growth European solar markets
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {markets.map((m) => (
                <div
                  key={m.code}
                  className="flex items-center gap-2 rounded-full bg-background px-4 py-1.5 text-sm font-medium shadow-sm"
                >
                  <span className="text-lg leading-none">{m.flag}</span>
                  {m.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-500">Features</p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to <span className="text-amber-500">scout</span> solar leads
            </h2>
            <p className="mt-4 text-muted-foreground">
              No spreadsheets. No cold databases. Just a city name and a few seconds.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} variant="default" className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border/40 bg-muted/30 py-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-500">How it works</p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              From city name to qualified leads in <span className="text-amber-500">under a minute</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <Card key={s.number} className="relative overflow-hidden">
                <CardContent className="p-8">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 font-mono text-lg font-bold text-white shadow-md">
                    {s.number}
                  </div>
                  <h3 className="mb-2 font-display text-xl font-semibold">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/how-it-works">
              <Button variant="outline" size="lg" className="gap-2">
                See the full walkthrough <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-10 shadow-xl sm:p-16">
            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to scout your next 100 solar leads?
              </h2>
              <p className="mt-4 text-white/90">
                Sign in and generate your first list of solar leads — commercial rooftops and BIPV balconies — in minutes.
              </p>
              <ul className="mx-auto mt-6 grid max-w-md gap-2 text-left text-sm text-white/95 sm:grid-cols-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 flex-shrink-0" /> No setup required</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 flex-shrink-0" /> Unlimited exports</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 flex-shrink-0" /> Live satellite data</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 flex-shrink-0" /> 4 European markets</li>
              </ul>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/login">
                  <Button size="lg" className="bg-white text-amber-600 shadow-lg hover:bg-white/95">
                    Get started now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
