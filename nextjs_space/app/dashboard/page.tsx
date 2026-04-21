import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SiteHeader } from '@/components/site/site-header'
import { DashboardClient } from './_components/dashboard-client'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard',
  description: 'Scout commercial rooftops, residential blocks and BIPV balcony opportunities across Europe.',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id as string | undefined
  if (!session?.user || !userId) redirect('/login')

  // Gate: unapproved users go to waitlist
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { approved: true, surveyCompleted: true, role: true },
  })
  if (!dbUser?.approved && dbUser?.role !== 'ADMIN') redirect('/waitlist')

  // Prefetch lightweight stats for initial render
  const [totalLeads, recentSearches] = await Promise.all([
    prisma.lead.count({ where: { userId } }),
    prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1">
        <DashboardClient
          userName={session.user?.name ?? session.user?.email ?? 'there'}
          initialTotalLeads={totalLeads}
          initialRecentSearches={JSON.parse(JSON.stringify(recentSearches))}
        />
      </main>
    </div>
  )
}
