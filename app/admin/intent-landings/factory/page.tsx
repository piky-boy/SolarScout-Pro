import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SiteHeader } from '@/components/site/site-header'
import { IntentFactoryClient } from '../_components/intent-factory-client'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin — Intent Factory',
  description: 'Run the programmatic SEO page factory.',
}

export default async function AdminIntentFactoryPage() {
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Intent Factory</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Cross-combines intent templates × cities to generate IntentLanding records.
                Always run dry-run first.
              </p>
            </div>
            <Link
              href="/admin/intent-landings/publish"
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Publish batches →
            </Link>
          </div>
          <IntentFactoryClient />
        </div>
      </main>
    </div>
  )
}
