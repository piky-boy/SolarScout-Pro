import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SiteHeader } from '@/components/site/site-header'
import { PublishBatchClient } from '../_components/publish-batch-client'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin — Publish Intent Pages',
  description: 'Publish intent landing pages in controlled batches.',
}

export default async function AdminPublishPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (user?.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-[860px] space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Publish Intent Pages</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Activate pages in batches of 100 to avoid overwhelming search engine crawlers.
              Hub pages publish first, then tier-1 cities, then tier-2 cities.
            </p>
          </div>
          <PublishBatchClient />
        </div>
      </main>
    </div>
  )
}
