import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** GET /api/admin/intent-landings — list pages with filters */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get('countryCode') ?? undefined
    const intentType = searchParams.get('intentType') ?? undefined
    const locale = searchParams.get('locale') ?? undefined
    const isActive = searchParams.get('isActive')
    const isHub = searchParams.get('isHub')
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)

    const where: Record<string, unknown> = {}
    if (countryCode) where.countryCode = countryCode
    if (intentType) where.intentType = intentType
    if (locale) where.locale = locale
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true'
    if (isHub !== null && isHub !== undefined) where.isHub = isHub === 'true'

    const [total, items] = await Promise.all([
      prisma.intentLanding.count({ where }),
      prisma.intentLanding.findMany({
        where,
        orderBy: [{ tier: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          slug: true,
          locale: true,
          intentType: true,
          isHub: true,
          city: true,
          countryCode: true,
          tier: true,
          title: true,
          isActive: true,
          emotionalHook: true,
          aiSearchQA: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ])

    return NextResponse.json({ total, page, limit, items })
  } catch (err: any) {
    console.error('[admin/intent-landings] GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch intent landings' }, { status: 500 })
  }
}

/** POST /api/admin/intent-landings — create a single page */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const {
      slug,
      locale = 'en',
      intentType,
      isHub = false,
      city,
      countryCode,
      tier = 1,
      title,
      h1,
      metaTitle,
      metaDescription,
      intro = '',
      keywords = [],
    } = body

    if (!slug || !intentType || !title || !h1 || !metaTitle || !metaDescription) {
      return NextResponse.json(
        { error: 'slug, intentType, title, h1, metaTitle and metaDescription are required' },
        { status: 400 },
      )
    }

    const created = await prisma.intentLanding.create({
      data: {
        slug,
        locale,
        intentType,
        isHub,
        city,
        countryCode,
        tier,
        title,
        h1,
        metaTitle,
        metaDescription,
        intro,
        keywords,
        emotionalHook: '',
        heroSubcopy: '',
        seoCopy: '',
        segments: [],
        socialProofClusters: [],
        faqs: [],
        aiSearchQA: [],
        relatedClusters: [],
        isActive: false,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    console.error('[admin/intent-landings] POST error:', err)
    return NextResponse.json({ error: 'Failed to create intent landing' }, { status: 500 })
  }
}
