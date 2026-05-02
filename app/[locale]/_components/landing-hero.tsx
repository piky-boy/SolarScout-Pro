'use client'

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Satellite, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

function buildPreviewUrl(token?: string) {
  const base = ['https:', '', 'api.mapbox.com', 'styles', 'v1', 'mapbox', 'satellite-streets-v12', 'static'].join('/')
  return `${base}/-3.7492,40.4637,10,0/800x600?access_token=${token ?? ''}`
}

export function LandingHero() {
  const { status } = useSession() ?? {}
  const locale = useLocale()
  const t = useTranslations('hero')
  const isAuthed = status === 'authenticated'

  const ctaHref = isAuthed ? '/dashboard' : '/login'

  function localHref(path: string) {
    return locale === 'en' ? path : `/${locale}${path}`
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr,1fr] lg:items-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-300">
          <Sparkles className="h-3.5 w-3.5" />
          {t('badge')}
        </div>
        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          {locale === 'en' ? (
            <>
              {t('heading').split('qualified solar leads')[0]}
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                qualified solar leads
              </span>
              {t('heading').split('qualified solar leads')[1]}
            </>
          ) : (
            t('heading')
          )}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t('sub')}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href={ctaHref}>
            <Button size="lg" className="bg-amber-500 text-white shadow-lg hover:bg-amber-600">
              {isAuthed ? t('ctaDashboard') : t('cta')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href={localHref('/#how-it-works')}>
            <Button size="lg" variant="outline">
              {t('seeHow')}
            </Button>
          </Link>
        </div>
        <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Satellite className="h-4 w-4 text-amber-500" />
            {t('mapboxLabel')}
          </div>
          <div className="hidden h-4 w-px bg-border sm:block" />
          <div>{t('osmLabel')}</div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="relative"
      >
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl">
          <div
            className="aspect-[4/3] bg-cover bg-center"
            style={{
              backgroundImage: `url("${buildPreviewUrl(process.env.NEXT_PUBLIC_MAPBOX_TOKEN)}")`,
            }}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
              {t('livePreview')}
            </div>
            <div className="mt-1 text-lg font-semibold">{t('previewCity')}</div>
            <div className="text-sm text-white/80">{t('previewStats')}</div>
          </div>
        </div>
        <div className="absolute -right-4 -top-4 hidden rounded-xl bg-background p-4 shadow-xl sm:block">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{t('statLabel')}</div>
          <div className="font-display text-2xl font-bold text-amber-500">{t('statValue')}</div>
          <div className="text-xs text-muted-foreground">{t('statSub')}</div>
        </div>
      </motion.div>
    </div>
  )
}
