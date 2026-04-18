import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SiteHeader } from '@/components/site/site-header'
import { prisma } from '@/lib/db'
import { LeadsClient } from './_components/leads-client'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'My leads',
  description: 'Filter, search, export and manage all your generated solar leads.',
}

export default async function LeadsPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id as string | undefined
  if (!session?.user || !userId) redirect('/login')

  const [leads, countryGroups, cityGroups, typeGroups] = await Promise.all([
    prisma.lead.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 1000,
      // Omit heavy `solarRawJson` but include summary solar + source fields
      select: {
        id: true,
        businessName: true,
        businessType: true,
        buildingType: true,
        address: true,
        city: true,
        country: true,
        latitude: true,
        longitude: true,
        roofAreaSqm: true,
        contactPhone: true,
        contactEmail: true,
        website: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        solarDataFetchedAt: true,
        solarApiStatus: true,
        solarMaxPanelCount: true,
        solarYearlyEnergyKwh: true,
        dataSource: true,
        googleRating: true,
        googleRatingCount: true,
      },
    }),
    prisma.lead.groupBy({
      by: ['country'],
      where: { userId, NOT: { country: null } },
      _count: { _all: true },
    }),
    prisma.lead.groupBy({
      by: ['city'],
      where: { userId, NOT: { city: null } },
      _count: { _all: true },
    }),
    prisma.lead.groupBy({
      by: ['businessType'],
      where: { userId, NOT: { businessType: null } },
      _count: { _all: true },
    }),
  ])

  const serialize = (arr: any[]) =>
    arr.map((l: any) => ({
      ...l,
      createdAt: l.createdAt?.toISOString?.() ?? String(l.createdAt),
      updatedAt: l.updatedAt?.toISOString?.() ?? String(l.updatedAt),
      solarDataFetchedAt: l.solarDataFetchedAt
        ? (l.solarDataFetchedAt.toISOString?.() ?? String(l.solarDataFetchedAt))
        : null,
    }))

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1">
        <LeadsClient
          initialLeads={serialize(leads)}
          filterOptions={{
            countries: countryGroups.map((c: any) => ({ value: c.country as string, count: c._count._all })),
            cities: cityGroups.map((c: any) => ({ value: c.city as string, count: c._count._all })),
            businessTypes: typeGroups.map((c: any) => ({ value: c.businessType as string, count: c._count._all })),
          }}
        />
      </main>
    </div>
  )
}
