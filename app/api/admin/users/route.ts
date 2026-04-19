import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** GET /api/admin/users — list all users (admin only) */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        approved: true,
        surveyCompleted: true,
        createdAt: true,
        surveyResponse: true,
        _count: { select: { leads: true } },
      },
    })

    return NextResponse.json(users)
  } catch (err: any) {
    console.error('[admin/users] list error:', err)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

/** PATCH /api/admin/users — approve/reject a user (admin only) */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const { userId, approved, role } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const data: any = {}
    if (typeof approved === 'boolean') data.approved = approved
    if (typeof role === 'string' && ['USER', 'ADMIN'].includes(role)) data.role = role

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, approved: true, role: true },
    })

    return NextResponse.json(updated)
  } catch (err: any) {
    console.error('[admin/users] update error:', err)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
