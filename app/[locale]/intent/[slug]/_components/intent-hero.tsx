'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { SunMedium, ArrowRight, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface IntentHeroProps {
  h1: string
  emotionalHook: string
  heroSubcopy: string
  city?: string
  countryCode?: string
  intentType: string
  locale: string
}

const COUNTRY_FLAGS: Record<string, string> = {
  RO: '🇷🇴',
  ES: '🇪🇸',
  PT: '🇵🇹',
  AL: '🇦🇱',
  GB: '🇬🇧',
}

function intentTypeLabel(intentType: string): string {
  return intentType
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function loginHref(locale: string): string {
  return locale === 'en' ? '/login' : `/${locale}/login`
}
function howItWorksHref(locale: string): string {
  return locale === 'en' ? '/how-it-works' : `/${locale}/how-it-works`
}

export function IntentHero({
  h1,
  emotionalHook,
  heroSubcopy,
  city,
  countryCode,
  intentType,
  locale,
}: IntentHeroProps) {
  const flag = countryCode ? COUNTRY_FLAGS[countryCode] : '🌍'
  const locationLabel = city ? `${flag} ${city}` : countryCode ? `${flag} ${countryCode}` : 'Europe'
  const displayHook = emotionalHook || h1

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-20 md:py-28">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-amber-400/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge
              variant="outline"
              className="mb-4 inline-flex items-center gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
            >
              <MapPin className="h-3 w-3" />
              {locationLabel} &middot; {intentTypeLabel(intentType)}
            </Badge>
          </motion.div>

          <motion.h1
            className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            {displayHook.split(' ').map((word, i) =>
              word.toLowerCase().includes('solar') ||
              word.toLowerCase().includes('lead') ||
              word.toLowerCase().includes('rooftop') ? (
                <span key={i} className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  {word}{' '}
                </span>
              ) : (
                <span key={i}>{word} </span>
              ),
            )}
          </motion.h1>

          {heroSubcopy && (
            <motion.p
              className="mt-5 text-lg leading-relaxed text-muted-foreground"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {heroSubcopy}
            </motion.p>
          )}

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Button asChild size="lg" className="bg-amber-500 text-white hover:bg-amber-600">
              <Link href={loginHref(locale)}>
                <SunMedium className="mr-2 h-4 w-4" />
                Start Free Trial
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={howItWorksHref(locale)}>
                See How It Works
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Satellite-powered detection
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Contact data included
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Google Solar API insights
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              CSV / Excel export
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
