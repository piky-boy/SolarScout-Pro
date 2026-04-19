import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** POST /api/waitlist — submit survey responses */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { companyName, companyRole, teamSize, marketsOfInterest, monthlyLeadGoal, howDidYouHear } = body

    // Upsert survey response
    await prisma.surveyResponse.upsert({
      where: { userId },
      update: { companyName, companyRole, teamSize, marketsOfInterest, monthlyLeadGoal, howDidYouHear },
      create: { userId, companyName, companyRole, teamSize, marketsOfInterest, monthlyLeadGoal, howDidYouHear },
    })

    // Mark survey as completed
    await prisma.user.update({
      where: { id: userId },
      data: { surveyCompleted: true },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[waitlist] survey submit error:', err)
    return NextResponse.json({ error: 'Failed to submit survey' }, { status: 500 })
  }
}

/** GET /api/waitlist — check current user's waitlist status */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { approved: true, surveyCompleted: true, role: true },
    })

    return NextResponse.json(user)
  } catch (err: any) {
    console.error('[waitlist] status check error:', err)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}
