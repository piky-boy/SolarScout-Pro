import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SiteHeader } from '@/components/site/site-header'
import { IntentEditClient } from '../_components/intent-edit-client'

export const dynamic = 'force-dynamic'

export default async function AdminIntentEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (user?.role !== 'ADMIN') redirect('/dashboard')

  const { id } = await params
  const page = await prisma.intentLanding.findUnique({ where: { id } })
  if (!page) notFound()

  // Serialize dates for client hydration
  const serialized = {
    ...page,
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString(),
    segments: page.segments as any[],
    socialProofClusters: page.socialProofClusters as any[],
    faqs: page.faqs as any[],
    aiSearchQA: page.aiSearchQA as any[],
    relatedClusters: page.relatedClusters as any[],
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-[860px] space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Edit Landing Page</h1>
            <p className="mt-1 text-sm text-muted-foreground font-mono">{page.slug}</p>
          </div>
          <IntentEditClient page={serialized as any} />
        </div>
      </main>
    </div>
  )
}
