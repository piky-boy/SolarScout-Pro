import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

/**
 * Check if the current user is authenticated AND approved.
 * Returns { userId, user } on success, or a NextResponse error.
 */
export async function requireApprovedUser() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, approved: true },
  })

  if (!user) {
    return { error: NextResponse.json({ error: 'User not found' }, { status: 404 }) }
  }

  // Admins always pass; others need approval
  if (!user.approved && user.role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'Account pending approval' }, { status: 403 }) }
  }

  return { userId: user.id, user }
}
