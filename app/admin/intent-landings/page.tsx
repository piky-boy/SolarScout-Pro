import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SiteHeader } from '@/components/site/site-header'
import { IntentLandingsClient } from './_components/intent-landings-client'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin — Intent Landings',
  description: 'Manage programmatic SEO intent landing pages.',
}

export default async function AdminIntentLandingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (user?.role !== 'ADMIN') redirect('/dashboard')

  // Prefetch initial data for the list
  const [total, activeCount, hubCount] = await Promise.all([
    prisma.intentLanding.count(),
    prisma.intentLanding.count({ where: { isActive: true } }),
    prisma.intentLanding.count({ where: { isHub: true } }),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-[1400px] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Intent Landings</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {total} pages · {activeCount} active · {hubCount} hub pages
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/intent-landings/factory"
                className="inline-flex h-9 items-center gap-1.5 rounded-md border bg-background px-3 text-sm font-medium hover:bg-muted transition-colors"
              >
                Factory
              </Link>
              <Link
                href="/admin/intent-landings/publish"
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Publish batches
              </Link>
            </div>
          </div>
          <IntentLandingsClient />
        </div>
      </main>
    </div>
  )
}
