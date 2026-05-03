'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  BarChart3,
  Users,
  Search,
  Eye,
  BookmarkCheck,
  Download,
  Wand2,
  FileText,
  Activity,
  RefreshCw,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const ACTION_META: Record<string, { label: string; icon: any; color: string }> = {
  scan_run:           { label: 'Scan run',           icon: Search,       color: 'text-amber-500' },
  lead_viewed:        { label: 'Lead viewed',         icon: Eye,          color: 'text-sky-500' },
  lead_saved:         { label: 'Lead saved',          icon: BookmarkCheck,color: 'text-green-500' },
  lead_status_changed:{ label: 'Status changed',      icon: Activity,     color: 'text-purple-500' },
  lead_exported:      { label: 'Export downloaded',   icon: Download,     color: 'text-orange-500' },
  outreach_generated: { label: 'Outreach generated',  icon: Wand2,        color: 'text-violet-500' },
  proposal_generated: { label: 'Proposal generated',  icon: FileText,     color: 'text-rose-500' },
}

type PlatformStats = {
  totalUsers: number
  totalLeads: number
  totalScans: number
  totalExports: number
  totalOutreach: number
  totalProposals: number
  activeUsersToday: number
  activeUsers7d: number
  activeUsers30d: number
}

type FeedEntry = {
  id: string
  userId: string
  action: string
  leadId: string | null
  meta: any
  createdAt: string
  user: { id: string; name: string | null; email: string; image: string | null }
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'text-amber-500',
}: {
  icon: any
  label: string
  value: number | string
  sub?: string
  color?: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-muted ${color}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground/60">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function describeAction(entry: FeedEntry): string {
  const meta = entry.meta ?? {}
  switch (entry.action) {
    case 'scan_run':
      return meta.location
        ? `Scanned ${meta.location} — ${meta.count ?? '?'} leads`
        : `Ran a scan (${meta.count ?? '?'} leads)`
    case 'lead_viewed':
      return 'Opened a lead'
    case 'lead_saved':
      return 'Saved a lead'
    case 'lead_status_changed':
      return `Changed lead status → ${meta.status ?? '?'}`
    case 'lead_exported':
      return `Exported ${meta.exportCount ?? '?'} leads as ${(meta.format ?? 'csv').toUpperCase()}`
    case 'outreach_generated':
      return `Generated ${meta.tone ?? 'professional'} outreach in ${(meta.language ?? 'en').toUpperCase()}`
    case 'proposal_generated':
      return `Generated PDF proposal (${(meta.proposalLanguage ?? 'en').toUpperCase()})`
    default:
      return entry.action
  }
}

export function AdminActivityClient() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [feed, setFeed] = useState<FeedEntry[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/activity')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setStats(data.platformStats)
      setFeed(data.recentFeed)
    } catch {
      toast.error('Failed to load activity data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Activity</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform-wide usage metrics and real-time event feed
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Platform stats */}
      {loading && !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : stats ? (
        <>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Platform overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <StatCard icon={Users}      label="Total users"           value={stats.totalUsers}        color="text-sky-500" />
            <StatCard icon={BarChart3}  label="Total leads"           value={stats.totalLeads}        color="text-amber-500" />
            <StatCard icon={Search}     label="Total scans"           value={stats.totalScans}        color="text-violet-500" />
            <StatCard icon={Download}   label="Total exports"         value={stats.totalExports}      color="text-orange-500" />
            <StatCard icon={Wand2}      label="Outreach generated"    value={stats.totalOutreach}     color="text-purple-500" />
            <StatCard icon={FileText}   label="Proposals generated"   value={stats.totalProposals}    color="text-rose-500" />
            <StatCard icon={Activity}   label="Active today"          value={stats.activeUsersToday}  sub="unique users"  color="text-green-500" />
            <StatCard icon={Clock}      label="Active last 30 days"   value={stats.activeUsers30d}    sub={`${stats.activeUsers7d} in last 7 days`} color="text-teal-500" />
          </div>

          {/* Recent activity feed */}
          <h2 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Recent activity feed
          </h2>
          <Card>
            <CardContent className="p-0">
              {feed.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                  No activity recorded yet. Actions will appear here as users interact with the platform.
                </p>
              ) : (
                <ul className="divide-y">
                  {feed.map((entry) => {
                    const meta = ACTION_META[entry.action] ?? {
                      label: entry.action,
                      icon: Activity,
                      color: 'text-muted-foreground',
                    }
                    const Icon = meta.icon
                    return (
                      <li key={entry.id} className="flex items-start gap-4 px-5 py-3.5">
                        {/* Action icon */}
                        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted ${meta.color}`}>
                          <Icon className="h-4 w-4" />
                        </span>

                        {/* Description */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={entry.user.image ?? undefined} />
                              <AvatarFallback className="text-[9px]">
                                {(entry.user.name ?? entry.user.email).slice(0, 1).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-sm font-medium">
                              {entry.user.name ?? entry.user.email.split('@')[0]}
                            </span>
                            <Badge variant="secondary" className="shrink-0 text-[10px]">
                              {meta.label}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {describeAction(entry)}
                          </p>
                        </div>

                        {/* Time */}
                        <span className="shrink-0 text-xs text-muted-foreground/60">
                          {timeAgo(entry.createdAt)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
