import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** GET /api/admin/users — list all users with activity counts (admin only) */
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
        plan: true,
        surveyCompleted: true,
        createdAt: true,
        surveyResponse: true,
        _count: { select: { leads: true, searchHistory: true, activityLogs: true } },
      },
    })

    // Fetch per-user activity breakdowns in a single aggregation
    const activityBreakdown = await prisma.activityLog.groupBy({
      by: ['userId', 'action'],
      _count: { action: true },
    })

    // Build a map: userId → action → count
    const actMap = new Map<string, Record<string, number>>()
    for (const row of activityBreakdown) {
      if (!actMap.has(row.userId)) actMap.set(row.userId, {})
      actMap.get(row.userId)![row.action] = row._count.action
    }

    // Get last-active per user
    const lastActive = await prisma.activityLog.groupBy({
      by: ['userId'],
      _max: { createdAt: true },
    })
    const lastActiveMap = new Map(lastActive.map((r) => [r.userId, r._max.createdAt]))

    const enriched = users.map((u) => {
      const acts = actMap.get(u.id) ?? {}
      return {
        ...u,
        activity: {
          scansRun: acts['scan_run'] ?? 0,
          leadsViewed: acts['lead_viewed'] ?? 0,
          leadsSaved: acts['lead_saved'] ?? 0,
          statusChanges: acts['lead_status_changed'] ?? 0,
          exports: acts['lead_exported'] ?? 0,
          outreachGenerated: acts['outreach_generated'] ?? 0,
          proposalsGenerated: acts['proposal_generated'] ?? 0,
          lastActive: lastActiveMap.get(u.id) ?? null,
        },
      }
    })

    return NextResponse.json(enriched)
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

/** DELETE /api/admin/users — permanently delete a user (admin only) */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (target.role === 'ADMIN') {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id: userId } })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[admin/users] delete error:', err)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
