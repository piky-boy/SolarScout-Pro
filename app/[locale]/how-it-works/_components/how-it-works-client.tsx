'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  Search,
  Satellite,
  BarChart3,
  FileText,
  Globe,
  Zap,
  TrendingUp,
  Clock,
  Shield,
  Users,
  ArrowRight,
  CheckCircle2,
  SunMedium,
  Play,
  Download,
  Mail,
  Phone,
  Languages,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

/* ---------- animation helpers ---------- */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}

const fadeIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay, ease: 'easeOut' },
  }),
}

function Section({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.section>
  )
}

const capabilityIcons = [Satellite, BarChart3, FileText, Mail, Phone, Download, Users, Zap]
const capabilityKeys = [
  'Satellite imagery',
  'Solar analytics',
  'PDF proposals',
  'AI outreach copy',
  'Call scripts',
  'CSV / Excel export',
  'Lead management',
  'Instant business case',
]

const benefitIcons = [Clock, Target, TrendingUp, Globe, Shield, Languages]

export function HowItWorksClient({ locale }: { locale: string }) {
  const t = useTranslations('howItWorks')

  function localHref(path: string) {
    return locale === 'en' ? path : `/${locale}${path}`
  }

  const workflow = [
    {
      step: '01',
      tag: t('step01Tag'),
      title: t('step01Title'),
      description: t('step01Desc'),
      bullets: [t('step01b1'), t('step01b2'), t('step01b3')],
      image: '/how-it-works/search-discover.png',
      icon: Search,
      accent: 'from-amber-500/20 to-orange-500/20',
    },
    {
      step: '02',
      tag: t('step02Tag'),
      title: t('step02Title'),
      description: t('step02Desc'),
      bullets: [t('step02b1'), t('step02b2'), t('step02b3')],
      image: '/how-it-works/analyze-qualify.png',
      icon: BarChart3,
      accent: 'from-emerald-500/20 to-teal-500/20',
    },
    {
      step: '03',
      tag: t('step03Tag'),
      title: t('step03Title'),
      description: t('step03Desc'),
      bullets: [t('step03b1'), t('step03b2'), t('step03b3')],
      image: '/how-it-works/propose-close.png',
      icon: FileText,
      accent: 'from-blue-500/20 to-indigo-500/20',
    },
  ]

  const benefits = [
    { icon: Clock, title: t('b1Title'), description: t('b1Desc') },
    { icon: Target, title: t('b2Title'), description: t('b2Desc') },
    { icon: TrendingUp, title: t('b3Title'), description: t('b3Desc') },
    { icon: Globe, title: t('b4Title'), description: t('b4Desc') },
    { icon: Shield, title: t('b5Title'), description: t('b5Desc') },
    { icon: Languages, title: t('b6Title'), description: t('b6Desc') },
  ]

  const stats = [
    { value: t('stat1Value'), label: t('stat1Label') },
    { value: t('stat2Value'), label: t('stat2Label') },
    { value: t('stat3Value'), label: t('stat3Label') },
    { value: t('stat4Value'), label: t('stat4Label') },
  ]

  const videos = [
    {
      lang: t('videoEsLang'),
      flag: '🇪🇸',
      file: '/videos/solarscout-es.mp4',
      desc: t('videoEsDesc'),
    },
    {
      lang: t('videoSqLang'),
      flag: '🇦🇱',
      file: '/videos/solarscout-sq.mp4',
      desc: t('videoSqDesc'),
    },
  ]

  return (
    <main className="flex-1">
      {/* ==================== HERO ==================== */}
      <Section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 pt-20 pb-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(43_95%_55%/0.15),transparent_60%)]" />
        <div className="mx-auto max-w-[1100px] px-6 text-center">
          <motion.div variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <SunMedium className="h-3.5 w-3.5" />
              {t('badge')}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={0.1}
            className="mx-auto mt-6 max-w-[800px] font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
          >
            {t('heading').includes('Close solar deals') ? (
              <>
                {t('heading').split('Close solar deals')[0]}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Close solar deals.
                </span>
              </>
            ) : (
              t('heading')
            )}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={0.2}
            className="mx-auto mt-6 max-w-[620px] text-lg text-muted-foreground"
          >
            {t('sub')}
          </motion.p>

          <motion.div variants={fadeUp} custom={0.35} className="mt-10">
            <div className="relative mx-auto max-w-[900px] overflow-hidden rounded-2xl border border-border/60 shadow-2xl">
              <div className="aspect-video relative bg-muted">
                <Image
                  src="/how-it-works/hero.png"
                  alt={t('heroImageAlt')}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white/90">{t('heroCaption')}</p>
                  <span className="rounded-full bg-amber-500/90 px-3 py-1 text-xs font-bold text-white">
                    {t('heroBadge')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ==================== STATS BAR ==================== */}
      <Section className="border-y border-border/40 bg-muted/40 py-10">
        <div className="mx-auto flex max-w-[900px] flex-wrap items-center justify-center gap-8 px-6 sm:gap-16">
          {stats.map((s, i) => (
            <motion.div key={s.label} variants={fadeUp} custom={i * 0.08} className="text-center">
              <div className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ==================== WORKFLOW STEPS ==================== */}
      <div className="py-24">
        <div className="mx-auto max-w-[1100px] px-6">
          <Section className="text-center">
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              {t('stepsHeading')}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={0.1}
              className="mx-auto mt-4 max-w-[540px] text-muted-foreground"
            >
              {t('stepsSub')}
            </motion.p>
          </Section>

          <div className="mt-20 space-y-32">
            {workflow.map((w, idx) => {
              const Icon = w.icon
              const isEven = idx % 2 === 1
              return (
                <Section key={w.step}>
                  <div
                    className={`flex flex-col items-center gap-12 lg:flex-row lg:gap-16 ${
                      isEven ? 'lg:flex-row-reverse' : ''
                    }`}
                  >
                    {/* text */}
                    <motion.div variants={fadeUp} custom={0.1} className="flex-1 space-y-5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${w.accent}`}
                        >
                          <Icon className="h-5 w-5 text-foreground" />
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          {t('stepLabel')} {w.step} — {w.tag}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                        {w.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{w.description}</p>
                      <ul className="space-y-2 pt-2">
                        {w.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>

                    {/* image */}
                    <motion.div
                      variants={fadeIn}
                      custom={0.25}
                      className="relative flex-1 overflow-hidden rounded-2xl border border-border/50 shadow-xl"
                    >
                      <div className="aspect-video relative bg-muted">
                        <Image src={w.image} alt={w.tag} fill className="object-cover" />
                      </div>
                    </motion.div>
                  </div>
                </Section>
              )
            })}
          </div>
        </div>
      </div>

      {/* ==================== MULTI-MARKET ==================== */}
      <Section className="border-t border-border/40 bg-muted/30 py-24">
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="flex flex-col items-center gap-14 lg:flex-row lg:gap-16">
            <motion.div
              variants={fadeIn}
              custom={0.1}
              className="relative flex-1 overflow-hidden rounded-2xl border border-border/50 shadow-xl"
            >
              <div className="aspect-video relative bg-muted">
                <Image
                  src="/how-it-works/multi-market.png"
                  alt="SolarScout Pro covers 5 European markets"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
            <motion.div variants={fadeUp} custom={0.15} className="flex-1 space-y-5">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {t('multiMarketTag')}
              </span>
              <h3 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                {t('multiMarketTitle')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{t('multiMarketSub')}</p>
              <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
                {[
                  { flag: '🇪🇸', name: 'Spain' },
                  { flag: '🇵🇹', name: 'Portugal' },
                  { flag: '🇷🇴', name: 'Romania' },
                  { flag: '🇦🇱', name: 'Albania' },
                  { flag: '🇬🇧', name: 'United Kingdom' },
                ].map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center gap-2 rounded-lg border border-border/50 bg-card px-3 py-2 text-sm font-medium shadow-sm"
                  >
                    <span className="text-lg">{m.flag}</span>
                    {m.name}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ==================== BENEFITS GRID ==================== */}
      <Section className="py-24">
        <div className="mx-auto max-w-[1100px] px-6">
          <motion.div variants={fadeUp} className="text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t('benefitsHeading')}
            </h2>
            <p className="mx-auto mt-4 max-w-[520px] text-muted-foreground">{t('benefitsSub')}</p>
          </motion.div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, i) => {
              const Icon = b.icon
              return (
                <motion.div
                  key={b.title}
                  variants={fadeUp}
                  custom={i * 0.07}
                  className="group rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
                    <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h4 className="font-display text-lg font-bold">{b.title}</h4>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* ==================== CAPABILITIES ==================== */}
      <Section className="border-t border-border/40 bg-muted/30 py-20">
        <div className="mx-auto max-w-[900px] px-6 text-center">
          <motion.h3
            variants={fadeUp}
            className="font-display text-xl font-bold tracking-tight sm:text-2xl"
          >
            {t('capsHeading')}
          </motion.h3>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {capabilityIcons.map((Icon, i) => (
              <motion.div
                key={capabilityKeys[i]}
                variants={fadeIn}
                custom={i * 0.05}
                className="flex items-center gap-2 rounded-full border border-border/50 bg-card px-4 py-2 text-sm font-medium shadow-sm"
              >
                <Icon className="h-4 w-4 text-amber-500" />
                {capabilityKeys[i]}
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ==================== VIDEO PRESENTATIONS ==================== */}
      <Section id="videos">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center"
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-500"
          >
            <Play className="h-4 w-4" /> {t('videoHeading')}
          </motion.div>
          <motion.p variants={fadeUp} custom={0.2} className="mx-auto mt-4 max-w-xl text-muted-foreground">
            {t('videoSub')}
          </motion.p>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {videos.map((v, i) => (
            <motion.div
              key={v.lang}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i * 0.15}
              className="group overflow-hidden rounded-2xl border bg-card shadow-lg"
            >
              <div className="relative aspect-video bg-zinc-900">
                <video className="h-full w-full object-cover" controls preload="metadata" poster="">
                  <source src={v.file} type="video/mp4" />
                </video>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{v.flag}</span>
                  <h3 className="text-lg font-semibold">{v.lang}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
                <a
                  href={v.file}
                  download
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-600"
                >
                  <Download className="h-4 w-4" />
                  {t('downloadMp4')}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ==================== CTA ==================== */}
      <Section className="py-28">
        <div className="mx-auto max-w-[700px] px-6 text-center">
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Zap className="h-3.5 w-3.5" />
              {t('ctaBadge')}
            </span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={0.1}
            className="mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            {t('ctaHeading')}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={0.2}
            className="mx-auto mt-5 max-w-[480px] text-muted-foreground"
          >
            {t('ctaSub')}
          </motion.p>
          <motion.div
            variants={fadeUp}
            custom={0.3}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/login">
              <Button size="lg" className="gap-2 bg-amber-500 text-white hover:bg-amber-600">
                {t('ctaButton')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={localHref('/')}>
              <Button variant="outline" size="lg">
                {t('ctaBack')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </Section>
    </main>
  )
}
