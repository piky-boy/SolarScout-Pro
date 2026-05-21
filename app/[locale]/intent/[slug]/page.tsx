import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { SiteHeaderMarketing } from '@/components/site/site-header-marketing'
import { SiteFooterMarketing, type HubLinkItem } from '@/components/site/site-footer-marketing'
import { IntentHero } from './_components/intent-hero'
import { IntentCityContext } from './_components/intent-city-context'
import { IntentSegments } from './_components/intent-segments'
import { IntentQABlock } from './_components/intent-qa-block'
import { IntentSocialProof } from './_components/intent-social-proof'
import { IntentFAQ } from './_components/intent-faq'
import { IntentRelatedClusters } from './_components/intent-related-clusters'
import {
  buildIntentMetadata,
  intentCollectionPageJsonLd,
  intentFaqJsonLd,
  intentArticleJsonLd,
  intentBreadcrumbJsonLd,
  intentPath,
} from '@/lib/intent-seo'
import type { IntentLandingRecord } from '@/lib/intent-types'

// ISR: re-render at most once every 24 hours
export const revalidate = 86400

// Allow on-demand revalidation for pages added after build
export const dynamicParams = true

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const pages = await prisma.intentLanding.findMany({
    where: { isActive: true },
    select: { slug: true, locale: true },
  }).catch(() => [])

  return pages.map((p) => ({
    slug: p.slug,
    locale: p.locale === 'en' ? 'en' : p.locale, // next-intl will strip 'en' prefix
  }))
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const page = await prisma.intentLanding.findUnique({ where: { slug } })
  if (!page || !page.isActive) return {}
  return buildIntentMetadata(page as unknown as IntentLandingRecord, locale)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function IntentLandingPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params

  const page = await prisma.intentLanding.findUnique({ where: { slug } })
  if (!page || !page.isActive) notFound()

  const record = page as unknown as IntentLandingRecord

  // Prefetch hub pages for footer "Solar Leads by Market" section
  const hubPages = await prisma.intentLanding.findMany({
    where: { isHub: true, isActive: true },
    select: { slug: true, title: true, locale: true },
    take: 6,
  }).catch(() => [])

  const hubLinks: HubLinkItem[] = hubPages.map((h) => ({
    slug: h.slug,
    title: h.title,
    href: intentPath(h.slug, h.locale),
  }))

  // JSON-LD scripts
  const collectionLd = intentCollectionPageJsonLd(record, locale)
  const faqLd = intentFaqJsonLd(record.faqs)
  const articleLd = intentArticleJsonLd(record, locale)
  const breadcrumbLd = intentBreadcrumbJsonLd(record, locale)

  return (
    <>
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <SiteHeaderMarketing />

      <main>
        {/* Hero */}
        <IntentHero
          h1={record.h1}
          emotionalHook={record.emotionalHook}
          heroSubcopy={record.heroSubcopy}
          city={record.city ?? undefined}
          countryCode={record.countryCode ?? undefined}
          intentType={record.intentType}
          locale={locale}
        />

        {/* City editorial context — tier-1 only */}
        {record.cityLocalCopy && (
          <IntentCityContext
            city={record.city ?? ''}
            copy={record.cityLocalCopy}
          />
        )}

        {/* Social proof stats */}
        {record.socialProofClusters.length > 0 && (
          <IntentSocialProof clusters={record.socialProofClusters} />
        )}

        {/* Building type segments */}
        {record.segments.length > 0 && (
          <IntentSegments
            segments={record.segments}
            city={record.city ?? undefined}
          />
        )}

        {/* SEO body copy (hidden visually but present for search engines) */}
        {record.seoCopy && (
          <section className="mx-auto max-w-[820px] px-6 py-12 text-muted-foreground">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {record.seoCopy.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>
        )}

        {/* AI Q&A — visible + crawlable */}
        {record.aiSearchQA.length > 0 && (
          <IntentQABlock qaList={record.aiSearchQA} />
        )}

        {/* FAQ */}
        {record.faqs.length > 0 && (
          <IntentFAQ faqs={record.faqs} />
        )}

        {/* Related intent clusters — internal linking */}
        {record.relatedClusters.length > 0 && (
          <IntentRelatedClusters clusters={record.relatedClusters} />
        )}
      </main>

      <SiteFooterMarketing locale={locale} hubLinks={hubLinks} />
    </>
  )
}
