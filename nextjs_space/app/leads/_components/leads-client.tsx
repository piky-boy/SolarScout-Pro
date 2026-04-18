'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  ExternalLink,
  Filter,
  Search,
  Sun,
  Trash2,
  X,
} from 'lucide-react'

interface LeadItem {
  id: string
  businessName: string | null
  businessType: string | null
  buildingType: string | null
  address: string | null
  city: string | null
  country: string | null
  latitude: number
  longitude: number
  roofAreaSqm: number | null
  contactPhone: string | null
  contactEmail: string | null
  website: string | null
  status: string
  createdAt: string
  solarApiStatus: string | null
  solarMaxPanelCount: number | null
  solarYearlyEnergyKwh: number | null
  solarDataFetchedAt: string | null
  dataSource: string | null
  googleRating: number | null
  googleRatingCount: number | null
}

interface FilterOption {
  value: string
  count: number
}

interface LeadsClientProps {
  initialLeads: LeadItem[]
  filterOptions: {
    countries: FilterOption[]
    cities: FilterOption[]
    businessTypes: FilterOption[]
  }
}

type SortKey =
  | 'businessName'
  | 'businessType'
  | 'city'
  | 'country'
  | 'roofAreaSqm'
  | 'createdAt'

export function LeadsClient({ initialLeads, filterOptions }: LeadsClientProps) {
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads)
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState<string>('all')
  const [city, setCity] = useState<string>('all')
  const [businessType, setBusinessType] = useState<string>('all')
  const [minArea, setMinArea] = useState<string>('')
  const [maxArea, setMaxArea] = useState<string>('')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const min = Number(minArea) || 0
    const max = Number(maxArea) || Number.POSITIVE_INFINITY
    const list = leads.filter((l) => {
      if (country !== 'all' && (l.country ?? '') !== country) return false
      if (city !== 'all' && (l.city ?? '') !== city) return false
      if (businessType !== 'all' && (l.businessType ?? '') !== businessType) return false
      const area = l.roofAreaSqm ?? 0
      if (area < min || area > max) return false
      if (q) {
        const hay = [l.businessName, l.address, l.city, l.country, l.businessType, l.buildingType]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    const sorted = [...list].sort((a, b) => {
      const av: any = (a as any)[sortKey] ?? ''
      const bv: any = (b as any)[sortKey] ?? ''
      let cmp = 0
      if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv
      else cmp = String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [leads, query, country, city, businessType, minArea, maxArea, sortKey, sortDir])

  const allSelected = filtered.length > 0 && filtered.every((l) => selected[l.id])
  const someSelected = filtered.some((l) => selected[l.id]) && !allSelected

  const toggleAll = () => {
    if (allSelected) {
      setSelected({})
    } else {
      const next: Record<string, boolean> = {}
      for (const l of filtered) next[l.id] = true
      setSelected(next)
    }
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const clearFilters = () => {
    setQuery('')
    setCountry('all')
    setCity('all')
    setBusinessType('all')
    setMinArea('')
    setMaxArea('')
  }

  const exportLeads = async (format: 'csv' | 'xlsx') => {
    const ids = Object.keys(selected).filter((k) => selected[k])
    setExporting(true)
    try {
      const res = await fetch('/api/leads/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          ids: ids.length > 0 ? ids : undefined,
          filters: ids.length === 0 ? {
            country: country !== 'all' ? country : undefined,
            city: city !== 'all' ? city : undefined,
            businessType: businessType !== 'all' ? businessType : undefined,
            minArea: Number(minArea) || undefined,
            maxArea: Number(maxArea) || undefined,
            q: query || undefined,
          } : undefined,
        }),
      })
      if (!res.ok) {
        toast.error('Export failed')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `solarscout-leads.${format}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success(`${format.toUpperCase()} downloaded (${ids.length > 0 ? ids.length : filtered.length} leads)`)
    } catch (err) {
      console.error(err)
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const deleteSelected = async () => {
    const ids = Object.keys(selected).filter((k) => selected[k])
    if (ids.length === 0) {
      toast.info('Select at least one lead to delete.')
      return
    }
    if (!confirm(`Delete ${ids.length} lead${ids.length > 1 ? 's' : ''}? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      if (!res.ok) {
        toast.error('Delete failed')
        return
      }
      setLeads((prev) => prev.filter((l) => !ids.includes(l.id)))
      setSelected({})
      toast.success(`Deleted ${ids.length} lead${ids.length > 1 ? 's' : ''}`)
    } catch (err) {
      console.error(err)
      toast.error('Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const selectedCount = Object.values(selected).filter(Boolean).length
  const hasActiveFilter =
    query || country !== 'all' || city !== 'all' || businessType !== 'all' || minArea || maxArea

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">My leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-mono font-semibold text-foreground">{filtered.length}</span>{' '}
            of {leads.length} leads shown
            {selectedCount > 0 ? (
              <> • <span className="text-amber-600">{selectedCount} selected</span></>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportLeads('csv')} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportLeads('xlsx')} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" /> Excel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={deleteSelected}
            disabled={deleting || selectedCount === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedCount})
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search business, address, city, type..."
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All countries</SelectItem>
                  {filterOptions.countries.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.value} ({c.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cities</SelectItem>
                  {filterOptions.cities.slice(0, 50).map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.value} ({c.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {filterOptions.businessTypes.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.value} ({c.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" /> Roof area (m²):
            </div>
            <Input
              value={minArea}
              onChange={(e) => setMinArea(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="min"
              className="w-24"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              value={maxArea}
              onChange={(e) => setMaxArea(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="max"
              className="w-24"
            />
            {hasActiveFilter ? (
              <Button size="sm" variant="ghost" onClick={clearFilters}>
                <X className="mr-1.5 h-3.5 w-3.5" /> Clear filters
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allSelected || (someSelected ? 'indeterminate' : false)}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <SortHeader label="Business" active={sortKey === 'businessName'} dir={sortDir} onClick={() => toggleSort('businessName')} />
                  <SortHeader label="Type" active={sortKey === 'businessType'} dir={sortDir} onClick={() => toggleSort('businessType')} />
                  <SortHeader label="City" active={sortKey === 'city'} dir={sortDir} onClick={() => toggleSort('city')} />
                  <SortHeader label="Country" active={sortKey === 'country'} dir={sortDir} onClick={() => toggleSort('country')} />
                  <SortHeader label="Roof (m²)" active={sortKey === 'roofAreaSqm'} dir={sortDir} onClick={() => toggleSort('roofAreaSqm')} align="right" />
                  <TableHead>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      <Sun className="h-3 w-3" />
                      Solar
                    </span>
                  </TableHead>
                  <SortHeader label="Added" active={sortKey === 'createdAt'} dir={sortDir} onClick={() => toggleSort('createdAt')} />
                  <TableHead className="w-16 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-20 text-center text-muted-foreground">
                      {leads.length === 0 ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="text-sm">No leads yet. Head to the dashboard to scout your first ones.</div>
                          <Link href="/dashboard">
                            <Button size="sm" className="bg-amber-500 text-white hover:bg-amber-600">Scout leads</Button>
                          </Link>
                        </div>
                      ) : (
                        'No leads match your current filters.'
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((lead) => {
                    const isSel = !!selected[lead.id]
                    return (
                      <TableRow key={lead.id} data-state={isSel ? 'selected' : undefined}>
                        <TableCell>
                          <Checkbox
                            checked={isSel}
                            onCheckedChange={(v) =>
                              setSelected((s) => ({ ...s, [lead.id]: !!v }))
                            }
                            aria-label="Select row"
                          />
                        </TableCell>
                        <TableCell className="max-w-[260px]">
                          <div className="flex items-center gap-2">
                            <div className="truncate font-medium">
                              {lead.businessName ?? <span className="text-muted-foreground">Unnamed building</span>}
                            </div>
                            <SourceDot dataSource={lead.dataSource} />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="truncate">
                              {lead.address ?? `${lead.latitude.toFixed(4)}, ${lead.longitude.toFixed(4)}`}
                            </span>
                            {lead.googleRating !== null && lead.googleRating !== undefined ? (
                              <span className="inline-flex flex-none items-center gap-0.5 text-[11px] text-amber-600 dark:text-amber-400">
                                ★ {lead.googleRating.toFixed(1)}
                                {lead.googleRatingCount ? (
                                  <span className="text-muted-foreground">({lead.googleRatingCount})</span>
                                ) : null}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="whitespace-nowrap">
                            {lead.businessType ?? 'Commercial'}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {lead.city ?? <span className="text-muted-foreground">–</span>}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {lead.country ?? <span className="text-muted-foreground">–</span>}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {(lead.roofAreaSqm ?? 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <SolarCell lead={lead} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/leads/${lead.id}`} aria-label="View lead">
                            <Button size="icon" variant="ghost">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SourceDot({ dataSource }: { dataSource: string | null }) {
  if (!dataSource || dataSource === 'OSM') {
    return (
      <span
        className="inline-flex h-4 flex-none items-center rounded-full border border-emerald-200 bg-emerald-50 px-1.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
        title="Sourced from OpenStreetMap"
      >
        OSM
      </span>
    )
  }
  if (dataSource === 'GOOGLE_PLACES') {
    return (
      <span
        className="inline-flex h-4 flex-none items-center rounded-full border border-blue-200 bg-blue-50 px-1.5 text-[9px] font-semibold uppercase tracking-wider text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
        title="Sourced from Google Places"
      >
        Google
      </span>
    )
  }
  if (dataSource === 'HYBRID') {
    return (
      <span
        className="inline-flex h-4 flex-none items-center rounded-full border border-violet-200 bg-violet-50 px-1.5 text-[9px] font-semibold uppercase tracking-wider text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300"
        title="Merged from OpenStreetMap + Google Places"
      >
        Hybrid
      </span>
    )
  }
  return null
}

function SolarCell({ lead }: { lead: LeadItem }) {
  const status = lead.solarApiStatus
  if (!status) {
    return (
      <Badge variant="outline" className="text-[11px] text-muted-foreground">
        Not analyzed
      </Badge>
    )
  }
  if (status === 'OK') {
    const kwh = lead.solarYearlyEnergyKwh
    const panels = lead.solarMaxPanelCount
    const label = kwh
      ? kwh >= 1000
        ? `${(kwh / 1000).toFixed(1)} MWh/yr`
        : `${Math.round(kwh).toLocaleString()} kWh/yr`
      : panels
        ? `${panels} panels`
        : 'Analyzed'
    return (
      <Badge className="whitespace-nowrap border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
        <Sun className="mr-1 h-3 w-3" />
        {label}
      </Badge>
    )
  }
  if (status === 'NOT_FOUND') {
    return (
      <Badge variant="outline" className="text-[11px] text-muted-foreground">
        Not indexed
      </Badge>
    )
  }
  if (status === 'NO_COVERAGE') {
    return (
      <Badge variant="outline" className="text-[11px] text-muted-foreground">
        No coverage
      </Badge>
    )
  }
  if (status === 'UNCONFIGURED') {
    return (
      <Badge variant="outline" className="text-[11px] text-muted-foreground">
        Key needed
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-[11px] text-muted-foreground">
      —
    </Badge>
  )
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
  align = 'left',
}: {
  label: string
  active: boolean
  dir: 'asc' | 'desc'
  onClick: () => void
  align?: 'left' | 'right'
}) {
  return (
    <TableHead className={align === 'right' ? 'text-right' : ''}>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest transition-colors ${
          active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {label}
        {active ? (
          dir === 'asc' ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </button>
    </TableHead>
  )
}
