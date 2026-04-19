import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const lead = await prisma.lead.findFirst({ where: { id, userId } })
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ lead })
  } catch (err: any) {
    console.error('[lead GET] error:', err?.message ?? err)
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const existing = await prisma.lead.findFirst({ where: { id, userId } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const allowed = ['notes', 'status', 'contactPhone', 'contactEmail', 'businessName']
    const data: any = {}
    for (const key of allowed) {
      if (key in (body ?? {})) data[key] = body[key]
    }

    const updated = await prisma.lead.update({ where: { id }, data })
    return NextResponse.json({ lead: updated })
  } catch (err: any) {
    console.error('[lead PATCH] error:', err?.message ?? err)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const result = await prisma.lead.deleteMany({ where: { id, userId } })
    return NextResponse.json({ deleted: result.count })
  } catch (err: any) {
    console.error('[lead DELETE] error:', err?.message ?? err)
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}
