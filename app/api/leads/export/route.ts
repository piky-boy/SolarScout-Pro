import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

const EXPORT_COLUMNS: { key: string; label: string }[] = [
  { key: 'businessName', label: 'Business Name' },
  { key: 'businessType', label: 'Business Type' },
  { key: 'buildingType', label: 'Building Type' },
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'country', label: 'Country' },
  { key: 'latitude', label: 'Latitude' },
  { key: 'longitude', label: 'Longitude' },
  { key: 'roofAreaSqm', label: 'Roof Area (m²)' },
  { key: 'contactPhone', label: 'Phone' },
  { key: 'contactEmail', label: 'Email' },
  { key: 'website', label: 'Website' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Date Added' },
]

function toCsvValue(v: any): string {
  if (v === null || v === undefined) return ''
  const s = typeof v === 'string' ? v : String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const format = (body?.format ?? 'csv').toString().toLowerCase()
    const ids: string[] | undefined = Array.isArray(body?.ids) && body.ids.length > 0 ? body.ids : undefined
    const filters = body?.filters ?? {}

    const where: any = { userId }
    if (ids) {
      where.id = { in: ids }
    } else {
      if (filters?.country) where.country = filters.country
      if (filters?.city) where.city = filters.city
      if (filters?.businessType) where.businessType = filters.businessType
      const minArea = Number(filters?.minArea ?? '') || undefined
      const maxArea = Number(filters?.maxArea ?? '') || undefined
      if (minArea !== undefined || maxArea !== undefined) {
        where.roofAreaSqm = {}
        if (minArea !== undefined) where.roofAreaSqm.gte = minArea
        if (maxArea !== undefined) where.roofAreaSqm.lte = maxArea
      }
      const q = (filters?.q ?? '').toString().trim()
      if (q) {
        where.OR = [
          { businessName: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
          { businessType: { contains: q, mode: 'insensitive' } },
        ]
      }
    }

    const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' } })

    if (format === 'xlsx') {
      const rows = leads.map((l: any) => {
        const row: Record<string, any> = {}
        for (const col of EXPORT_COLUMNS) {
          const v = l[col.key]
          row[col.label] = v instanceof Date ? v.toISOString() : v ?? ''
        }
        return row
      })
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(rows, { header: EXPORT_COLUMNS.map((c) => c.label) })
      XLSX.utils.book_append_sheet(wb, ws, 'Leads')
      const buf: Buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      return new NextResponse(buf, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="solarscout-leads-${Date.now()}.xlsx"`,
        },
      })
    }

    // Default: CSV
    const header = EXPORT_COLUMNS.map((c) => c.label).join(',')
    const lines = leads.map((l: any) =>
      EXPORT_COLUMNS.map((c) => {
        const v = l[c.key]
        if (v instanceof Date) return toCsvValue(v.toISOString())
        return toCsvValue(v)
      }).join(','),
    )
    const csv = [header, ...lines].join('\n')
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="solarscout-leads-${Date.now()}.csv"`,
      },
    })
  } catch (err: any) {
    console.error('[export] error:', err?.message ?? err)
    return NextResponse.json({ error: 'Failed to export leads' }, { status: 500 })
  }
}
