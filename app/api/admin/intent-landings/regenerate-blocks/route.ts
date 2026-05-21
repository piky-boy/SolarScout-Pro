import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateIntentContent, applyAgentOutput } from '@/lib/intent-agent'
import type { IntentLandingRecord } from '@/lib/intent-types'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * POST /api/admin/intent-landings/regenerate-blocks
 *
 * Body:
 *   ids?        string[]  — specific page IDs to regenerate
 *   intentType? string    — filter by intent type
 *   countryCode? string   — filter by country
 *   city?       string    — filter by city
 *   batchSize?  number    — max pages per run (default 5, max 10)
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const {
      ids,
      intentType,
      countryCode,
      city,
      batchSize = 5,
    } = body

    const limit = Math.min(Number(batchSize) || 5, 10)

    // Build filter
    const where: Record<string, unknown> = {}
    if (Array.isArray(ids) && ids.length > 0) {
      where.id = { in: ids }
    } else {
      if (intentType) where.intentType = intentType
      if (countryCode) where.countryCode = countryCode
      if (city) where.city = city
    }

    const pages = await prisma.intentLanding.findMany({
      where,
      take: limit,
      orderBy: { updatedAt: 'asc' }, // regenerate oldest first
    })

    if (pages.length === 0) {
      return NextResponse.json({ success: true, processed: 0, results: [] })
    }

    const results: Array<{ id: string; slug: string; success: boolean; error?: string }> = []

    for (const page of pages) {
      try {
        const output = await generateIntentContent(page as unknown as IntentLandingRecord)
        await applyAgentOutput(page.id, output)
        results.push({ id: page.id, slug: page.slug, success: true })
      } catch (err: any) {
        results.push({ id: page.id, slug: page.slug, success: false, error: err.message })
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      succeeded: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    })
  } catch (err: any) {
    console.error('[admin/intent-landings/regenerate-blocks] error:', err)
    return NextResponse.json({ error: 'Batch regeneration failed', detail: err.message }, { status: 500 })
  }
}
