'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Loader2,
  Search,
  Building2,
  MapPin,
  Satellite,
  Sparkles,
  ExternalLink,
  History,
  ArrowRight,
  Download,
  Ruler,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { SUPPORTED_COUNTRIES } from '@/lib/countries'
import { CountCard } from '@/components/dashboard/count-card'

const DashboardMap = dynamic(() => import('@/components/dashboard/dashboard-map').then((m) => m.DashboardMap), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[16/9] w-full items-center justify-center rounded-xl bg-muted">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
})

export interface LeadRow {
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
}

interface GeoSuggestion {
  placeName: string
  center: [number, number]
  city: string | null
  countryName: string | null
}

interface DashboardClientProps {
  userName: string
  initialTotalLeads: number
  initialRecentSearches: Array<{
    id: string
    locationSearched: string
    country: string | null
    leadsFound: number
    createdAt: string
  }>
}

export function DashboardClient({ userName, initialTotalLeads, initialRecentSearches }: DashboardClientProps) {
  const [location, setLocation] = useState('')
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [mapCenter, setMapCenter] = useState<[number, number]>([10, 45])
  const [mapZoom, setMapZoom] = useState(4)
  const [lastResult, setLastResult] = useState<{ place: string; found: number } | null>(null)
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null)
  const [totalLeads, setTotalLeads] = useState(initialTotalLeads)
  const [recent, setRecent] = useState(initialRecentSearches)

  // autocomplete: debounced fetch
  useEffect(() => {
    if (!location || location.trim().length < 2) {
      setSuggestions([])
      return
    }
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(location)}`, { signal: ctrl.signal })
        if (!res.ok) return
        const data = await res.json()
        setSuggestions(
          (data?.results ?? []).map((r: any) => ({
            placeName: r.placeName,
            center: r.center,
            city: r.city,
            countryName: r.countryName,
          })),
        )
      } catch {}
    }, 250)
    return () => {
      ctrl.abort()
      clearTimeout(t)
    }
  }, [location])

  const handleGenerate = async (locationQuery?: string) => {
    const q = (locationQuery ?? location).trim()
    if (!q) {
      toast.error('Enter a city or region first')
      return
    }
    setGenerating(true)
    setShowSuggestions(false)
    setLeads([])
    setSelectedLead(null)
    try {
      const res = await fetch('/api/leads/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: q, limit: 100 }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.error ?? 'Lead generation failed')
        return
      }
      const found = Array.isArray(data?.leads) ? data.leads : []
      setLeads(found)
      const loc = data?.location
      if (loc?.center) {
        setMapCenter([Number(loc.center[0]), Number(loc.center[1])])
        setMapZoom(12)
      }
      setLastResult({ place: loc?.placeName ?? q, found: data?.leadsSaved ?? found.length })
      setTotalLeads((t) => t + (data?.leadsSaved ?? 0))
      setRecent((r) => [
        {
          id: `tmp-${Date.now()}`,
          locationSearched: loc?.placeName ?? q,
          country: loc?.country ?? null,
          leadsFound: data?.leadsSaved ?? 0,
          createdAt: new Date().toISOString(),
        },
        ...r.slice(0, 4),
      ])
      if (found.length === 0) {
        toast.info('No buildings detected in that area. Try a larger city or different region.')
      } else {
        const sourceBits: string[] = []
        if (typeof data?.hybridCount === 'number' && data.hybridCount > 0) {
          sourceBits.push(`${data.hybridCount} merged OSM+Google`)
        }
        if (typeof data?.placesOnlyCount === 'number' && data.placesOnlyCount > 0) {
          sourceBits.push(`${data.placesOnlyCount} Google-only`)
        }
        if (typeof data?.bipvCount === 'number' && data.bipvCount > 0) {
          sourceBits.push(`${data.bipvCount} BIPV balcony`)
        }
        if (typeof data?.solarEnrichedCount === 'number' && data.solarEnrichedCount > 0) {
          sourceBits.push(`${data.solarEnrichedCount} Solar API verified`)
        }
        const suffix = sourceBits.length > 0 ? ` — ${sourceBits.join(', ')}` : ''
        toast.success(`Found ${found.length} buildings in ${loc?.placeName ?? q}${suffix}`)
      }
    } catch (err: any) {
      console.error(err)
      toast.error('Lead generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const averageArea = useMemo(() => {
    if (leads.length === 0) return 0
    const total = leads.reduce((s, l) => s + (l.roofAreaSqm ?? 0), 0)
    return Math.round(total / leads.length)
  }, [leads])

  const totalArea = useMemo(() => leads.reduce((s, l) => s + (l.roofAreaSqm ?? 0), 0), [leads])

  const downloadCsv = async () => {
    if (leads.length === 0) {
      toast.info('Generate leads first to export.')
      return
    }
    try {
      const res = await fetch('/api/leads/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'csv', ids: leads.map((l) => l.id) }),
      })
      if (!res.ok) {
        toast.error('Export failed')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `solarscout-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('CSV downloaded')
    } catch (err) {
      console.error(err)
      toast.error('Export failed')
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Greeting + quick stats */}
      <div className="mb-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-amber-600">
              Welcome, {userName.split('@')[0]}
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Scout your next solar lead
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Pick a city in Romania, Spain, Portugal, Albania or the United Kingdom and SolarScout will auto-detect
              commercial rooftops, residential blocks and urban buildings — including BIPV glass balcony potential for blocks of flats.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/leads">
              <Button variant="outline">
                View all leads <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CountCard icon={Building2} label="Total leads" value={totalLeads} accent="amber" />
        <CountCard icon={Satellite} label="In this scan" value={leads.length} accent="sky" />
        <CountCard icon={Ruler} label="Avg roof area" value={averageArea} suffix="m²" accent="emerald" />
        <CountCard icon={Sparkles} label="Total roof area" value={totalArea} suffix="m²" accent="rose" />
      </div>

      {/* Search */}
      <Card className="mt-8 overflow-visible">
        <CardContent className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleGenerate()
                  }
                }}
                placeholder="e.g. Bucharest, Madrid, Porto, Tirana..."
                className="h-12 pl-10 text-base"
                disabled={generating}
              />
              {showSuggestions && suggestions.length > 0 ? (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-md border bg-popover shadow-lg">
                  {suggestions.map((s) => (
                    <button
                      key={`${s.placeName}-${s.center[0]}-${s.center[1]}`}
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-accent"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setLocation(s.placeName)
                        setShowSuggestions(false)
                        handleGenerate(s.placeName)
                      }}
                    >
                      <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{s.placeName}</div>
                        {s.countryName ? (
                          <div className="text-xs text-muted-foreground">{s.countryName}</div>
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <Button
              onClick={() => handleGenerate()}
              disabled={generating}
              size="lg"
              className="bg-amber-500 text-white hover:bg-amber-600 sm:w-auto"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning...
                </>
              ) : (
                <>
                  <Satellite className="mr-2 h-4 w-4" /> Generate leads
                </>
              )}
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Try:</span>
            {SUPPORTED_COUNTRIES.map((c) => (
              <Badge
                key={c.code}
                variant="secondary"
                className="cursor-pointer transition-colors hover:bg-amber-100 hover:text-amber-900"
                onClick={() => {
                  setLocation(c.name)
                  handleGenerate(c.name)
                }}
              >
                {c.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map + results */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.7fr,1fr]">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <DashboardMap
              center={mapCenter}
              zoom={mapZoom}
              leads={leads}
              selectedId={selectedLead?.id ?? null}
              onSelect={(lead) => setSelectedLead(lead)}
            />
            <div className="flex items-center justify-between border-t px-5 py-3">
              <div className="text-sm text-muted-foreground">
                {lastResult
                  ? `${lastResult.found} leads from ${lastResult.place}`
                  : leads.length > 0
                  ? `${leads.length} leads shown`
                  : 'Search for a city to see leads on the map'}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={downloadCsv} disabled={leads.length === 0}>
                  <Download className="mr-2 h-4 w-4" /> CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {selectedLead ? (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="secondary">{selectedLead.businessType ?? 'Commercial'}</Badge>
                      <span className="font-mono text-xs text-muted-foreground">
                        {selectedLead.latitude.toFixed(4)}, {selectedLead.longitude.toFixed(4)}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-semibold">
                      {selectedLead.businessName ?? 'Unnamed commercial building'}
                    </h3>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {selectedLead.address ?? selectedLead.city ?? 'Address unavailable'}
                    </div>
                  </div>
                  <Link href={`/leads/${selectedLead.id}`} aria-label="View details">
                    <Button size="icon" variant="ghost">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md bg-muted/60 p-3">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Roof area</div>
                    <div className="font-display text-xl font-bold text-amber-600">
                      {(selectedLead.roofAreaSqm ?? 0).toLocaleString()} m²
                    </div>
                  </div>
                  <div className="rounded-md bg-muted/60 p-3">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Building</div>
                    <div className="truncate font-medium capitalize">
                      {selectedLead.buildingType ?? 'commercial'}
                    </div>
                  </div>
                </div>
                {(selectedLead.contactPhone || selectedLead.contactEmail || selectedLead.website) && (
                  <div className="mt-4 space-y-1.5 text-sm">
                    {selectedLead.contactPhone && (
                      <div>
                        <span className="text-muted-foreground">Phone: </span>
                        {selectedLead.contactPhone}
                      </div>
                    )}
                    {selectedLead.contactEmail && (
                      <div>
                        <span className="text-muted-foreground">Email: </span>
                        {selectedLead.contactEmail}
                      </div>
                    )}
                    {selectedLead.website && (
                      <div className="truncate">
                        <span className="text-muted-foreground">Website: </span>
                        <a
                          href={selectedLead.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-600 hover:underline"
                        >
                          {selectedLead.website}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Click any pin to see details</div>
                    <div className="text-sm text-muted-foreground">
                      Roof area, business type, contact info and more.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <History className="h-4 w-4 text-amber-500" /> Recent searches
                </div>
              </div>
              {recent.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No searches yet. Try scouting your first city above.
                </p>
              ) : (
                <ul className="space-y-2">
                  {recent.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between gap-3 rounded-md bg-muted/40 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{r.locationSearched}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.country ?? 'Unknown'} • {r.leadsFound} leads
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setLocation(r.locationSearched)
                          handleGenerate(r.locationSearched)
                        }}
                      >
                        Re-run
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lead list preview */}
      {leads.length > 0 ? (
        <Card className="mt-8">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Top rooftops in this scan</h2>
              <Link href="/leads">
                <Button size="sm" variant="outline">
                  Manage all leads <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {leads.slice(0, 6).map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setSelectedLead(l)}
                  className="flex items-start justify-between gap-3 rounded-lg bg-muted/40 p-4 text-left transition-colors hover:bg-muted"
                >
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {l.businessType ?? 'Commercial'}
                      </Badge>
                      {l.city ? <span className="text-xs text-muted-foreground">{l.city}</span> : null}
                    </div>
                    <div className="truncate font-medium">{l.businessName ?? 'Unnamed building'}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {l.address ?? `${l.latitude.toFixed(4)}, ${l.longitude.toFixed(4)}`}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="font-display text-lg font-bold text-amber-600">
                      {(l.roofAreaSqm ?? 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">m²</div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
