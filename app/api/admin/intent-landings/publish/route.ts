import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/intent-landings/publish
 *
 * Activates the next N inactive intent landing pages in priority order:
 *   1. Hub pages (country-level, no city)
 *   2. Tier-1 geo pages (major cities)
 *   3. Tier-2 geo pages (secondary cities)
 *
 * Within each tier, pages are ordered alphabetically by slug so the
 * same ordering is used across repeated calls (idempotent batching).
 *
 * Body: { batchSize?: number }  — defaults to 100, max 500
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const batchSize = Math.min(Math.max(1, Number(body.batchSize) || 100), 500)

  // Fetch next inactive pages in priority order.
  // MongoDB doesn't support multi-field ordering across logical groups in a
  // single query, so we fetch more than needed and sort in JS.
  const candidates = await prisma.intentLanding.findMany({
    where: { isActive: false },
    select: { id: true, slug: true, isHub: true, tier: true, countryCode: true },
    // Over-fetch to ensure we always have batchSize after sorting
    take: batchSize * 10,
    orderBy: { slug: 'asc' },
  })

  // Priority: hubs (0) > tier-1 (1) > tier-2 (2), then slug alphabetically
  const priority = (p: { isHub: boolean; tier: number }) =>
    p.isHub ? 0 : p.tier === 1 ? 1 : 2

  candidates.sort((a, b) => {
    const pd = priority(a) - priority(b)
    return pd !== 0 ? pd : a.slug.localeCompare(b.slug)
  })

  const batch = candidates.slice(0, batchSize)

  if (batch.length === 0) {
    const total = await prisma.intentLanding.count()
    return NextResponse.json({
      activated: 0,
      remaining: 0,
      total,
      active: total,
      message: 'All pages are already published.',
    })
  }

  const ids = batch.map((p) => p.id)

  await prisma.intentLanding.updateMany({
    where: { id: { in: ids } },
    data: { isActive: true },
  })

  const [total, active] = await Promise.all([
    prisma.intentLanding.count(),
    prisma.intentLanding.count({ where: { isActive: true } }),
  ])

  return NextResponse.json({
    activated: batch.length,
    remaining: total - active,
    total,
    active,
    slugs: batch.map((p) => p.slug),
  })
}

/**
 * GET /api/admin/intent-landings/publish
 * Returns current publish progress without making any changes.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [total, active, hubs, hubsActive, tier1, tier1Active] = await Promise.all([
    prisma.intentLanding.count(),
    prisma.intentLanding.count({ where: { isActive: true } }),
    prisma.intentLanding.count({ where: { isHub: true } }),
    prisma.intentLanding.count({ where: { isHub: true, isActive: true } }),
    prisma.intentLanding.count({ where: { isHub: false, tier: 1 } }),
    prisma.intentLanding.count({ where: { isHub: false, tier: 1, isActive: true } }),
  ])

  const geo = total - hubs
  const geoActive = active - hubsActive
  const tier2 = geo - tier1
  const tier2Active = geoActive - tier1Active

  return NextResponse.json({
    total,
    active,
    remaining: total - active,
    percent: total > 0 ? Math.round((active / total) * 100) : 0,
    breakdown: {
      hubs:  { total: hubs,  active: hubsActive,  remaining: hubs  - hubsActive  },
      tier1: { total: tier1, active: tier1Active,  remaining: tier1 - tier1Active },
      tier2: { total: tier2, active: tier2Active,  remaining: tier2 - tier2Active },
    },
  })
}
