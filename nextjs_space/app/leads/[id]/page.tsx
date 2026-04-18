import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SiteHeader } from '@/components/site/site-header'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Building2,
  Clock,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Star,
  CalendarDays,
  ExternalLink,
} from 'lucide-react'
import { LeadDetailMap } from './_components/lead-detail-map'
import { LeadNotesForm } from './_components/lead-notes-form'
import { SolarInsights } from './_components/solar-insights'
import { OutreachGenerator } from './_components/outreach-generator'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined
    if (!userId) return { title: 'Lead' }
    const lead = await prisma.lead.findFirst({ where: { id: params.id, userId } })
    if (!lead) return { title: 'Lead not found' }
    return {
      title: lead.businessName ?? 'Unnamed building',
      description: `${lead.businessType ?? 'Commercial'} • ${lead.city ?? lead.country ?? 'Europe'}`,
    }
  } catch {
    return { title: 'Lead' }
  }
}

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id as string | undefined
  if (!session?.user || !userId) redirect('/login')

  const lead = await prisma.lead.findFirst({ where: { id: params.id, userId } })
  if (!lead) notFound()

  const displayName = lead.businessName ?? 'Unnamed commercial building'
  const addr = lead.address ?? `${lead.latitude.toFixed(5)}, ${lead.longitude.toFixed(5)}`

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/leads">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" /> All leads
              </Button>
            </Link>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {lead.businessType ?? 'Commercial'}
            </Badge>
            {lead.buildingType ? (
              <Badge variant="outline" className="capitalize">
                {lead.buildingType}
              </Badge>
            ) : null}
            <Badge variant="outline">{lead.country ?? 'Europe'}</Badge>
            <SourceBadge dataSource={lead.dataSource} />
            {typeof lead.googleRating === 'number' ? (
              <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                <Star className="h-3 w-3 fill-current" />
                {lead.googleRating.toFixed(1)}
                {lead.googleRatingCount ? (
                  <span className="font-normal text-muted-foreground">({lead.googleRatingCount.toLocaleString()})</span>
                ) : null}
              </Badge>
            ) : null}
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{displayName}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" /> {addr}
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr,1fr]">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <LeadDetailMap
                  center={[lead.longitude, lead.latitude]}
                  name={displayName}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-5 p-6">
                <Stat icon={Ruler} label="Estimated roof area" value={`${(lead.roofAreaSqm ?? 0).toLocaleString()} m²`} accent />
                <Stat icon={Building2} label="Building type" value={lead.buildingType ?? '–'} />
                <Stat icon={MapPin} label="Location" value={`${lead.latitude.toFixed(5)}, ${lead.longitude.toFixed(5)}`} mono />
                <Stat icon={Phone} label="Phone" value={lead.contactPhone ?? 'Not available'} />
                <Stat icon={Mail} label="Email" value={lead.contactEmail ?? 'Not available'} />
                <Stat
                  icon={Globe2}
                  label="Website"
                  value={
                    lead.website ? (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-amber-600 hover:underline"
                      >
                        {lead.website} <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      'Not available'
                    )
                  }
                />
                <OpeningHoursRow hours={lead.openingHours as any} />
                <Stat icon={CalendarDays} label="Added" value={new Date(lead.createdAt).toLocaleString()} />
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <SolarInsights leadId={lead.id} />
          </div>

          <div className="mt-6">
            <OutreachGenerator
              leadId={lead.id}
              country={lead.country}
              contactEmail={lead.contactEmail}
              contactPhone={lead.contactPhone}
              businessName={lead.businessName}
            />
          </div>

          <div className="mt-6">
            <LeadNotesForm
              id={lead.id}
              initialNotes={lead.notes ?? ''}
              initialStatus={lead.status ?? 'NEW'}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  mono,
  accent,
}: {
  icon: any
  label: string
  value: React.ReactNode
  mono?: boolean
  accent?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</div>
        <div
          className={`mt-0.5 break-words ${accent ? 'font-display text-xl font-bold text-amber-600' : 'text-sm'} ${
            mono ? 'font-mono' : ''
          }`}
        >
          {value}
        </div>
      </div>
    </div>
  )
}

function SourceBadge({ dataSource }: { dataSource: string | null | undefined }) {
  if (!dataSource || dataSource === 'OSM') {
    return (
      <Badge
        variant="outline"
        className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
      >
        OpenStreetMap
      </Badge>
    )
  }
  if (dataSource === 'GOOGLE_PLACES') {
    return (
      <Badge
        variant="outline"
        className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
      >
        Google Places
      </Badge>
    )
  }
  if (dataSource === 'HYBRID') {
    return (
      <Badge
        variant="outline"
        className="border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300"
      >
        OSM + Google
      </Badge>
    )
  }
  return null
}

function OpeningHoursRow({ hours }: { hours: any }) {
  const descriptions: string[] | null = Array.isArray(hours?.weekdayDescriptions) ? hours.weekdayDescriptions : null
  if (!descriptions || descriptions.length === 0) return null
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600">
        <Clock className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Opening hours</div>
        <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
          {descriptions.map((line, i) => (
            <li key={i} className="tabular-nums">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
