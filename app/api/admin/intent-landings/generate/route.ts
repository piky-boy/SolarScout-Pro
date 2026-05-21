import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateIntentContent, applyAgentOutput } from '@/lib/intent-agent'
import type { IntentLandingRecord } from '@/lib/intent-types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/admin/intent-landings/generate
 *
 * Body: { id: string }
 *
 * Fetches the page, sends it to the AI agent, and saves the output.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const { id } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const page = await prisma.intentLanding.findUnique({ where: { id } })
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    const output = await generateIntentContent(page as unknown as IntentLandingRecord)
    await applyAgentOutput(id, output)

    return NextResponse.json({ success: true, id, fields: Object.keys(output) })
  } catch (err: any) {
    console.error('[admin/intent-landings/generate] error:', err)
    return NextResponse.json({ error: 'AI generation failed', detail: err.message }, { status: 500 })
  }
}
