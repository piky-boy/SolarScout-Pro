import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { runFactory } from '@/lib/intent-factory'
import type { FactoryOptions } from '@/lib/intent-types'

export const dynamic = 'force-dynamic'
// Factory runs can take a while — increase timeout for edge/serverless
export const maxDuration = 60

/**
 * POST /api/admin/intent-landings/factory
 *
 * Body:
 *   dryRun?      boolean  — preview without writing to DB (default false)
 *   countryCode? string   — filter by country, e.g. "RO"
 *   city?        string   — filter by city slug, e.g. "bucharest"
 *   includeTier2? boolean — include tier-2 cities (default false)
 *   skipHubs?    boolean  — skip national hub pages (default false)
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const options: FactoryOptions = {
      dryRun: body.dryRun === true,
      countryCode: typeof body.countryCode === 'string' ? body.countryCode : undefined,
      city: typeof body.city === 'string' ? body.city : undefined,
      includeTier2: body.includeTier2 === true,
      skipHubs: body.skipHubs === true,
    }

    const results = await runFactory(options)

    const summary = {
      total: results.length,
      created: results.filter((r) => r.action === 'created').length,
      skipped: results.filter((r) => r.action === 'skipped').length,
      errors: results.filter((r) => r.action === 'error').length,
      dryRun: options.dryRun,
      results,
    }

    return NextResponse.json(summary)
  } catch (err: any) {
    console.error('[admin/intent-landings/factory] error:', err)
    return NextResponse.json({ error: 'Factory run failed', detail: err.message }, { status: 500 })
  }
}
