import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** GET /api/admin/intent-landings/[id] */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const page = await prisma.intentLanding.findUnique({ where: { id } })
    if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(page)
  } catch (err: any) {
    console.error('[admin/intent-landings/[id]] GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 })
  }
}

/** PATCH /api/admin/intent-landings/[id] — update editable fields */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))

    // Whitelist of fields that can be updated via this endpoint
    const allowed = [
      'isActive',
      'title',
      'h1',
      'metaTitle',
      'metaDescription',
      'intro',
      'seoCopy',
      'emotionalHook',
      'heroSubcopy',
      'cityLocalCopy',
      'heroImageUrl',
      'keywords',
      'faqs',
      'segments',
      'socialProofClusters',
      'relatedClusters',
      'aiSearchQA',
      'abVariants',
      'leadFilter',
      'tier',
    ] as const

    const data: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) data[key] = body[key]
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const updated = await prisma.intentLanding.update({
      where: { id },
      data,
    })

    return NextResponse.json(updated)
  } catch (err: any) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    console.error('[admin/intent-landings/[id]] PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 })
  }
}

/** DELETE /api/admin/intent-landings/[id] */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.intentLanding.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    console.error('[admin/intent-landings/[id]] DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 })
  }
}
