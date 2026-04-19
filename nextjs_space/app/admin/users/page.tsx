import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SiteHeader } from '@/components/site/site-header'
import { AdminUsersClient } from './_components/admin-users-client'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin — User Management',
  description: 'Review and approve user access to SolarScout Pro.',
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!session?.user || !userId) redirect('/login')

  // Admin-only gate
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  if (user?.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1">
        <AdminUsersClient />
      </main>
    </div>
  )
}
