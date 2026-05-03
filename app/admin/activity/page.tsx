import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SiteHeader } from '@/components/site/site-header'
import { AdminActivityClient } from './_components/admin-activity-client'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin — Activity',
  description: 'Platform-wide user activity and engagement metrics.',
}

export default async function AdminActivityPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id as string | undefined
  if (!session?.user || !userId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  if (user?.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1">
        <AdminActivityClient />
      </main>
    </div>
  )
}
