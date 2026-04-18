import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [total, areaAgg, byCountry, byType, recent] = await Promise.all([
      prisma.lead.count({ where: { userId } }),
      prisma.lead.aggregate({ where: { userId }, _avg: { roofAreaSqm: true }, _sum: { roofAreaSqm: true } }),
      prisma.lead.groupBy({ by: ['country'], where: { userId }, _count: { _all: true } }),
      prisma.lead.groupBy({ by: ['businessType'], where: { userId }, _count: { _all: true } }),
      prisma.searchHistory.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
    ])

    return NextResponse.json({
      total,
      avgRoofArea: Math.round(areaAgg._avg.roofAreaSqm ?? 0),
      totalRoofArea: Math.round(areaAgg._sum.roofAreaSqm ?? 0),
      byCountry: byCountry.map((b: any) => ({ country: b.country ?? 'Unknown', count: b._count._all })),
      byType: byType.map((b: any) => ({ type: b.businessType ?? 'Unknown', count: b._count._all })),
      recentSearches: recent,
    })
  } catch (err: any) {
    console.error('[stats] error:', err?.message ?? err)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
