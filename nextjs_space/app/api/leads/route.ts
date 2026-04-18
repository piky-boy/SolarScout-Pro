import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country') ?? undefined
    const city = searchParams.get('city') ?? undefined
    const businessType = searchParams.get('businessType') ?? undefined
    const minArea = Number(searchParams.get('minArea') ?? '') || undefined
    const maxArea = Number(searchParams.get('maxArea') ?? '') || undefined
    const q = (searchParams.get('q') ?? '').trim() || undefined

    const where: any = { userId }
    if (country) where.country = country
    if (city) where.city = city
    if (businessType) where.businessType = businessType
    if (minArea !== undefined || maxArea !== undefined) {
      where.roofAreaSqm = {}
      if (minArea !== undefined) where.roofAreaSqm.gte = minArea
      if (maxArea !== undefined) where.roofAreaSqm.lte = maxArea
    }
    if (q) {
      where.OR = [
        { businessName: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
        { businessType: { contains: q, mode: 'insensitive' } },
      ]
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000,
    })

    return NextResponse.json({ leads })
  } catch (err: any) {
    console.error('[leads GET] error:', err?.message ?? err)
    return NextResponse.json({ error: 'Failed to fetch leads', leads: [] }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : []
    if (ids.length === 0) return NextResponse.json({ error: 'No ids provided' }, { status: 400 })

    const result = await prisma.lead.deleteMany({
      where: { userId, id: { in: ids } },
    })
    return NextResponse.json({ deleted: result.count })
  } catch (err: any) {
    console.error('[leads DELETE] error:', err?.message ?? err)
    return NextResponse.json({ error: 'Failed to delete leads' }, { status: 500 })
  }
}
