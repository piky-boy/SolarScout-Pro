import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { WaitlistClient } from './_components/waitlist-client'
import { buildPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata = buildPageMetadata({
  title: 'Waitlist',
  description:
    'Complete your profile to get approved for SolarScout Pro and start generating commercial solar leads.',
  path: '/waitlist',
  noIndex: true,
})

export default async function WaitlistPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!session?.user || !userId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { approved: true, surveyCompleted: true, role: true, name: true, email: true },
  })

  // Already approved → send to dashboard
  if (user?.approved || user?.role === 'ADMIN') redirect('/dashboard')

  return (
    <WaitlistClient
      userName={user?.name ?? user?.email ?? 'there'}
      surveyCompleted={user?.surveyCompleted ?? false}
    />
  )
}
