import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getPlatformStats, getRecentActivity } from '@/lib/activity'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id as string | undefined
  if (!session?.user || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  if (dbUser?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [platformStats, recentFeed] = await Promise.all([
    getPlatformStats(),
    getRecentActivity(60),
  ]).catch((err) => {
    console.error('[admin/activity] query error:', err?.message ?? err)
    throw err
  })

  return NextResponse.json({ platformStats, recentFeed })
  } catch (err: any) {
    console.error('[admin/activity] error:', err?.message ?? err)
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
