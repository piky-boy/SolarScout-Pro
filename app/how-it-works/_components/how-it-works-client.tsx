'use client'

import { useRef } from 'react'
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

/* ---------- data ---------- */

const workflow = [
  {
    step: '01',
    tag: 'Search & Discover',
    title: 'Point at any city — we do the rest',
    description:
      'Type a city or region in any of our five European markets. SolarScout instantly queries OpenStreetMap and Google Places to surface every warehouse, factory, retail park and commercial building with a rooftop worth installing on.',
    bullets: [
      'Auto-complete for 5 countries',
      'Filters out residential buildings',
      'Returns dozens of leads per search',
    ],
    image: '/how-it-works/search-discover.png',
    icon: Search,
    accent: 'from-amber-500/20 to-orange-500/20',
  },
  {
    step: '02',
    tag: 'Analyze & Qualify',
    title: 'Google Solar API does the engineering',
    description:
      'For every lead, we pull real satellite data from Google’s Solar API: maximum panel count, annual energy yield in kWh, CO₂ offset, roof imagery quality and date. Paired with our instant business case engine, you see the payback period and 25-year ROI before you ever pick up the phone.',
    bullets: [
      'Real panel count & kWh estimates',
      'Instant payback & ROI calculation',
      'Business contact data included',
    ],
    image: '/how-it-works/analyze-qualify.png',
    icon: BarChart3,
    accent: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    step: '03',
    tag: 'Propose & Close',
    title: 'Branded PDF proposals in 10 seconds',
    description:
      'Generate a 2-page branded proposal with real satellite before/after imagery, pixel-accurate panel overlays, and a complete financial breakdown. Available in 5 languages — Spanish, Portuguese, Romanian, Albanian and English — auto-matched to the lead’s country.',
    bullets: [
      'Satellite before & after views',
      'AI-generated outreach copy',
      'Multi-language proposals',
    ],
    image: '/how-it-works/propose-close.png',
    icon: FileText,
    accent: 'from-blue-500/20 to-indigo-500/20',
  },
]

const benefits = [
  {
    icon: Clock,
    title: 'Hours → minutes',
    description: 'What used to take a full day of manual research now happens in under 60 seconds per lead.',
  },
  {
    icon: Target,
    title: 'Pre-qualified leads',
    description: 'Every lead includes roof area, solar potential and an instant business case — no guessing.',
  },
  {
    icon: TrendingUp,
    title: 'Close faster',
    description: 'Send a professional, data-backed proposal before your competitor even finds the building.',
  },
  {
    icon: Globe,
    title: '5 European markets',
    description: 'Romania, Spain, Portugal, Albania and the UK — with localised data and multi-language output.',
  },
  {
    icon: Shield,
    title: 'Trusted data sources',
    description: 'OpenStreetMap, Google Places and Google Solar API — no scraped or stale data.',
  },
  {
    icon: Languages,
    title: 'Speak their language',
    description: 'Proposals and outreach auto-translate to Spanish, Portuguese, Romanian, Albanian or English.',
  },
]

const stats = [
  { value: '5', label: 'European markets' },
  { value: '<60s', label: 'Per lead generation' },
  { value: '5', label: 'Proposal languages' },
  { value: '25yr', label: 'ROI modelling' },
]

const capabilities = [
  { icon: Satellite, label: 'Satellite imagery' },
  { icon: BarChart3, label: 'Solar analytics' },
  { icon: FileText, label: 'PDF proposals' },
  { icon: Mail, label: 'AI outreach copy' },
  { icon: Phone, label: 'Call scripts' },
  { icon: Download, label: 'CSV / Excel export' },
  { icon: Users, label: 'Lead management' },
  { icon: Zap, label: 'Instant business case' },
]

/* ---------- component ---------- */

export function HowItWorksClient() {
  return (
    <main className="flex-1">
      {/* ==================== HERO ==================== */}
      <Section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 pt-20 pb-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(43_95%_55%/0.15),transparent_60%)]" />
        <div className="mx-auto max-w-[1100px] px-6 text-center">
          <motion.div variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <SunMedium className="h-3.5 w-3.5" />
              How It Works
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={0.1}
            className="mx-auto mt-6 max-w-[800px] font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Find commercial rooftops.{' '}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Close solar deals.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={0.2}
            className="mx-auto mt-6 max-w-[620px] text-lg text-muted-foreground"
          >
            SolarScout Pro automates the hardest part of commercial solar sales — finding
            and qualifying leads. From satellite detection to branded proposal, in minutes.
          </motion.p>

          <motion.div variants={fadeUp} custom={0.35} className="mt-10">
            <div className="relative mx-auto max-w-[900px] overflow-hidden rounded-2xl border border-border/60 shadow-2xl">
              <div className="aspect-video relative bg-muted">
                <Image
                  src="/how-it-works/hero.png"
                  alt="Aerial view of commercial building with solar panels installed"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white/90">
                    Commercial rooftop — Google Solar API verified
                  </p>
                  <span className="rounded-full bg-amber-500/90 px-3 py-1 text-xs font-bold text-white">
                    50+ panels detected
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
            <motion.div
              key={s.label}
              variants={fadeUp}
              custom={i * 0.08}
              className="text-center"
            >
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
              Three steps from search to signed deal
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={0.1}
              className="mx-auto mt-4 max-w-[540px] text-muted-foreground"
            >
              Every feature is designed to get you from “I need leads” to “here’s your proposal”
              as fast as possible.
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
                          Step {w.step} — {w.tag}
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
                        <Image
                          src={w.image}
                          alt={w.tag}
                          fill
                          className="object-cover"
                        />
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
            <motion.div variants={fadeIn} custom={0.1} className="relative flex-1 overflow-hidden rounded-2xl border border-border/50 shadow-xl">
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
                Multi-market coverage
              </span>
              <h3 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                One platform. Five booming solar markets.
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We built SolarScout specifically for the European commercial solar wave. Our data
                sources, financial models and language support are tailored to each country.
              </p>
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
              Why solar teams switch to SolarScout
            </h2>
            <p className="mx-auto mt-4 max-w-[520px] text-muted-foreground">
              Every feature is built to save you time, reduce manual research and help you send
              better proposals faster.
            </p>
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
            Everything you need in one platform
          </motion.h3>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {capabilities.map((c, i) => {
              const Icon = c.icon
              return (
                <motion.div
                  key={c.label}
                  variants={fadeIn}
                  custom={i * 0.05}
                  className="flex items-center gap-2 rounded-full border border-border/50 bg-card px-4 py-2 text-sm font-medium shadow-sm"
                >
                  <Icon className="h-4 w-4 text-amber-500" />
                  {c.label}
                </motion.div>
              )
            })}
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
          <motion.div variants={fadeUp} custom={0} className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-500">
            <Play className="h-4 w-4" /> Video Presentations
          </motion.div>
          <motion.h2 variants={fadeUp} custom={0.1} className="text-3xl font-bold tracking-tight sm:text-4xl">
            Watch How It Works
          </motion.h2>
          <motion.p variants={fadeUp} custom={0.2} className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Download our presentation videos to share with your team or customers via WhatsApp, email, or social media.
          </motion.p>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {[
            { lang: 'Español', flag: '🇪🇸', file: '/videos/solarscout-es.mp4', desc: 'Presentación completa en español — generación automática de leads solares comerciales.' },
            { lang: 'Shqip', flag: '🇦🇱', file: '/videos/solarscout-sq.mp4', desc: 'Prezantimi i plotë në shqip — gjenerimi automatik i kontakteve për energjinë diellore.' },
          ].map((v, i) => (
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
                <video
                  className="h-full w-full object-cover"
                  controls
                  preload="metadata"
                  poster=""
                >
                  <source src={v.file} type="video/mp4" />
                </video>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{v.flag}</span>
                  <h3 className="text-lg font-semibold">{v.lang}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
                <a href={v.file} download className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-600">
                  <Download className="h-4 w-4" />
                  Download MP4
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
              Ready to start?
            </span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={0.1}
            className="mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            Stop Googling rooftops.{' '}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Start closing.
            </span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={0.2}
            className="mx-auto mt-5 max-w-[480px] text-muted-foreground"
          >
            Create your free account and run your first search in under two minutes. No credit card
            required.
          </motion.p>
          <motion.div
            variants={fadeUp}
            custom={0.3}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/login">
              <Button size="lg" className="gap-2 bg-amber-500 text-white hover:bg-amber-600">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg">
                Back to homepage
              </Button>
            </Link>
          </motion.div>
        </div>
      </Section>
    </main>
  )
}
