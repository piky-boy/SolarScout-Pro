import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { SiteHeaderMarketing } from '@/components/site/site-header-marketing'
import { SiteFooterMarketing } from '@/components/site/site-footer-marketing'
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
import { buildPageMetadata, faqJsonLd, SITE_NAME, SITE_URL } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'faq' })

  return buildPageMetadata({
    title: 'Automated Solar Lead Generation for Europe',
    description:
      'Find warehouses, factories and commercial rooftops across Romania, Spain, Portugal, Albania and the United Kingdom in minutes.',
    path: locale === 'en' ? '/' : `/${locale}`,
  })
}

const markets = [
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'AL', name: 'Albania', flag: '🇦🇱' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
]

const featureIcons = [Satellite, Building2, MapPin, BarChart3, Download, Sparkles]

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'features' })
  const tSteps = await getTranslations({ locale, namespace: 'steps' })
  const tCta = await getTranslations({ locale, namespace: 'cta' })
  const tFaq = await getTranslations({ locale, namespace: 'faq' })
  const tMarkets = await getTranslations({ locale, namespace: 'markets' })

  function localHref(path: string) {
    return locale === 'en' ? path : `/${locale}${path}`
  }

  const features = [
    { icon: Satellite, title: t('item1Title'), description: t('item1Desc') },
    { icon: Building2, title: t('item2Title'), description: t('item2Desc') },
    { icon: MapPin, title: t('item3Title'), description: t('item3Desc') },
    { icon: BarChart3, title: t('item4Title'), description: t('item4Desc') },
    { icon: Download, title: t('item5Title'), description: t('item5Desc') },
    { icon: Sparkles, title: t('item6Title'), description: t('item6Desc') },
  ]

  const steps = [
    { number: tSteps('step1Number'), title: tSteps('step1Title'), description: tSteps('step1Desc') },
    { number: tSteps('step2Number'), title: tSteps('step2Title'), description: tSteps('step2Desc') },
    { number: tSteps('step3Number'), title: tSteps('step3Title'), description: tSteps('step3Desc') },
  ]

  const faqItems = [
    { question: tFaq('q1'), answer: tFaq('a1') },
    { question: tFaq('q2'), answer: tFaq('a2') },
    { question: tFaq('q3'), answer: tFaq('a3') },
    { question: tFaq('q4'), answer: tFaq('a4') },
    { question: tFaq('q5'), answer: tFaq('a5') },
    { question: tFaq('q6'), answer: tFaq('a6') },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeaderMarketing />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqItems)) }}
      />

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
              {tMarkets('label')}
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
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-500">
              {t('eyebrow')}
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t('heading')}
            </h2>
            <p className="mt-4 text-muted-foreground">{t('sub')}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card
                key={f.title}
                variant="default"
                className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
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
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-500">
              {tSteps('eyebrow')}
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {tSteps('heading')}
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
            <Link href={localHref('/how-it-works')}>
              <Button variant="outline" size="lg" className="gap-2">
                {tSteps('seeFullWalkthrough')} <ArrowRight className="h-4 w-4" />
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
                {tCta('heading')}
              </h2>
              <p className="mt-4 text-white/90">{tCta('sub')}</p>
              <ul className="mx-auto mt-6 grid max-w-md gap-2 text-left text-sm text-white/95 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> {tCta('bullet1')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> {tCta('bullet2')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> {tCta('bullet3')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> {tCta('bullet4')}
                </li>
              </ul>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/login">
                  <Button size="lg" className="bg-white text-amber-600 shadow-lg hover:bg-white/95">
                    {tCta('button')} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border/40 py-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-500">
              {tFaq('eyebrow')}
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {tFaq('heading')}
            </h2>
          </div>
          <dl className="mx-auto max-w-3xl divide-y divide-border">
            {faqItems.map((item) => (
              <div key={item.question} className="py-6">
                <dt className="text-base font-semibold leading-7">{item.question}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <SiteFooterMarketing locale={locale} />
    </div>
  )
}
