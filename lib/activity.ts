import { prisma } from '@/lib/db'

export type ActivityAction =
  | 'scan_run'
  | 'lead_viewed'
  | 'lead_saved'
  | 'lead_status_changed'
  | 'lead_exported'
  | 'outreach_generated'
  | 'proposal_generated'

interface ActivityMeta {
  // scan_run
  location?: string
  count?: number
  country?: string
  // lead_exported
  format?: string
  exportCount?: number
  // lead_status_changed / lead_saved
  status?: string
  // outreach_generated
  tone?: string
  language?: string
  // proposal_generated
  proposalLanguage?: string
  // generic
  [key: string]: unknown
}

/**
 * Fire-and-forget activity logger.
 * Never throws — failures are swallowed so they can never break the main request.
 */
export function logActivity(
  userId: string,
  action: ActivityAction,
  meta?: ActivityMeta,
  leadId?: string,
): void {
  prisma.activityLog
    .create({
      data: {
        userId,
        action,
        leadId: leadId ?? null,
        meta: meta ? (meta as object) : null,
      },
    })
    .catch((err) => {
      console.error(`[activity] failed to log ${action}:`, err?.message ?? err)
    })
}

// ─── Aggregation helpers (used by admin stats API) ───────────────────────────

export async function getUserActivityCounts(userId: string) {
  const [scansRun, leadsViewed, leadsSaved, exportsRun, outreachGenerated, proposalsGenerated] =
    await Promise.all([
      prisma.activityLog.count({ where: { userId, action: 'scan_run' } }),
      prisma.activityLog.count({ where: { userId, action: 'lead_viewed' } }),
      prisma.activityLog.count({ where: { userId, action: 'lead_saved' } }),
      prisma.activityLog.count({ where: { userId, action: 'lead_exported' } }),
      prisma.activityLog.count({ where: { userId, action: 'outreach_generated' } }),
      prisma.activityLog.count({ where: { userId, action: 'proposal_generated' } }),
    ])

  return { scansRun, leadsViewed, leadsSaved, exportsRun, outreachGenerated, proposalsGenerated }
}

export async function getRecentActivity(limit = 50) {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  })
}

export async function getUserRecentActivity(userId: string, limit = 30) {
  return prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getPlatformStats() {
  const [
    totalUsers,
    totalLeads,
    totalScans,
    totalExports,
    totalOutreach,
    totalProposals,
    activeUsersToday,
    activeUsers7d,
    activeUsers30d,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.lead.count(),
    prisma.activityLog.count({ where: { action: 'scan_run' } }),
    prisma.activityLog.count({ where: { action: 'lead_exported' } }),
    prisma.activityLog.count({ where: { action: 'outreach_generated' } }),
    prisma.activityLog.count({ where: { action: 'proposal_generated' } }),
    prisma.activityLog.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: startOf('day') } },
    }).then((r) => r.length),
    prisma.activityLog.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: startOf('week') } },
    }).then((r) => r.length),
    prisma.activityLog.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: startOf('month') } },
    }).then((r) => r.length),
  ])

  return {
    totalUsers,
    totalLeads,
    totalScans,
    totalExports,
    totalOutreach,
    totalProposals,
    activeUsersToday,
    activeUsers7d,
    activeUsers30d,
  }
}

function startOf(unit: 'day' | 'week' | 'month'): Date {
  const d = new Date()
  if (unit === 'day') {
    d.setHours(0, 0, 0, 0)
  } else if (unit === 'week') {
    d.setDate(d.getDate() - 7)
    d.setHours(0, 0, 0, 0)
  } else {
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
  }
  return d
}
