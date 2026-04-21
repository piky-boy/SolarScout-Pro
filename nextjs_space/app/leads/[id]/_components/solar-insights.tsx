'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Sun,
  Zap,
  Leaf,
  RefreshCw,
  CloudSunRain,
  PanelsTopLeft,
  AlertTriangle,
  Info,
  CalendarClock,
  Loader2,
} from 'lucide-react'

type SolarLead = {
  id: string
  solarDataFetchedAt: string | null
  solarApiStatus: string | null
  solarImageryQuality: string | null
  solarImageryDate: string | null
  solarMaxPanelCount: number | null
  solarMaxArrayAreaSqm: number | null
  solarMaxSunshineHours: number | null
  solarYearlyEnergyKwh: number | null
  solarCarbonOffsetKgYr: number | null
  solarPanelCapacityWatts: number | null
  solarPanelLifetimeYears: number | null
  // Accuracy fields
  solarEnriched: boolean
  solarRoofAreaSqm: number | null
  solarBuildingAreaSqm: number | null
  buildingHeightM: number | null
  roofPitchDeg: number | null
  roofAzimuthDeg: number | null
  roofSegmentCount: number | null
  roofAreaSqm: number | null // original OSM estimate
}

type ApiResponse = {
  configured: boolean
  cached: boolean
  lead: SolarLead
  errorMessage?: string
  message?: string
}

export function SolarInsights({ leadId }: { leadId: string }) {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [data, setData] = useState<ApiResponse | null>(null)

  async function load(refresh = false) {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch(`/api/leads/${leadId}/solar${refresh ? '?refresh=1' : ''}`, {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const json = (await res.json()) as ApiResponse
      setData(json)
      if (refresh && json.lead.solarApiStatus === 'OK') {
        toast.success('Solar insights refreshed')
      } else if (refresh && json.lead.solarApiStatus === 'NOT_FOUND') {
        toast.info('This building is not in the Google Solar dataset.')
      } else if (refresh && json.lead.solarApiStatus === 'NO_COVERAGE') {
        toast.info('Solar API has no coverage for this location yet.')
      } else if (refresh && json.lead.solarApiStatus === 'ERROR') {
        toast.error(json.errorMessage || 'Solar API returned an error')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load solar insights')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void load(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-6 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          <span>Loading solar insights…</span>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  // Not configured yet (placeholder key)
  if (!data.configured) {
    return (
      <Card className="border-amber-200 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/20">
        <CardContent className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <Sun className="h-5 w-5 text-amber-600" />
            <h3 className="font-display text-lg font-semibold">Google Solar API</h3>
            <Badge variant="outline" className="ml-auto">Not configured</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Solar insights become available once the owner enables the Google Solar API in
            Google Cloud Console and provides a key. This unlocks real rooftop energy
            potential, optimal panel count, yearly production and CO₂ offset estimates.
          </p>
        </CardContent>
      </Card>
    )
  }

  const lead = data.lead
  const status = lead.solarApiStatus

  // Error / No coverage / Not found states
  if (status === 'NOT_FOUND' || status === 'NO_COVERAGE' || status === 'ERROR') {
    const isHardBlock = status === 'NOT_FOUND' || status === 'NO_COVERAGE'
    return (
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <Sun className="h-5 w-5 text-amber-600" />
            <h3 className="font-display text-lg font-semibold">Solar insights</h3>
            <Badge variant="outline" className="ml-auto">
              {status === 'NOT_FOUND' && 'Building not indexed'}
              {status === 'NO_COVERAGE' && 'No regional coverage'}
              {status === 'ERROR' && 'Temporary error'}
            </Badge>
          </div>
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            {status === 'ERROR' ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
            ) : (
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
            )}
            <div className="space-y-2">
              {status === 'NOT_FOUND' && (
                <p>
                  Google Solar API does not have a detailed rooftop record for this specific
                  building yet. You can still use the OpenStreetMap roof area estimate on the
                  right as a solid starting point for solar sizing.
                </p>
              )}
              {status === 'NO_COVERAGE' && (
                <p>
                  Google Solar API coverage is currently strong in Spain and Portugal, but not
                  yet available in this location. We’ll automatically pick up the data once
                  Google expands coverage here.
                </p>
              )}
              {status === 'ERROR' && (
                <p>
                  Could not reach Google Solar API right now. Please try again — if the
                  problem persists, check that the Solar API is enabled and the API key has
                  permission to call it.
                </p>
              )}
              {lead.solarDataFetchedAt ? (
                <div className="flex items-center gap-1.5 text-xs">
                  <CalendarClock className="h-3 w-3" />
                  Last checked {new Date(lead.solarDataFetchedAt).toLocaleString()}
                </div>
              ) : null}
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={() => void load(true)}
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              {refreshing ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
              )}
              {isHardBlock ? 'Re-check coverage' : 'Try again'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No data yet (never fetched)
  if (!status) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <Sun className="h-5 w-5 text-amber-600" />
            <h3 className="font-display text-lg font-semibold">Solar insights</h3>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Generate a detailed rooftop solar analysis powered by Google Solar API — optimal
            panel count, yearly production, sunshine hours and CO₂ offset.
          </p>
          <Button onClick={() => void load(true)} disabled={refreshing}>
            {refreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sun className="mr-2 h-4 w-4" />
            )}
            Analyze rooftop
          </Button>
        </CardContent>
      </Card>
    )
  }

  // OK — show rich data
  const kwh = lead.solarYearlyEnergyKwh ?? 0
  const mwh = kwh / 1000
  const panels = lead.solarMaxPanelCount ?? 0
  const panelKw = lead.solarPanelCapacityWatts ? (panels * lead.solarPanelCapacityWatts) / 1000 : 0
  const co2Tonnes = (lead.solarCarbonOffsetKgYr ?? 0) / 1000
  const sunHours = lead.solarMaxSunshineHours ?? 0
  const arrayArea = lead.solarMaxArrayAreaSqm ?? 0

  // Accuracy comparisons
  const googleRoof = lead.solarRoofAreaSqm
  const osmRoof = lead.roofAreaSqm
  const hasAccurateRoof = googleRoof != null && googleRoof > 0

  // Azimuth direction label
  function azimuthLabel(deg: number | null): string {
    if (deg == null) return '–'
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const idx = Math.round(deg / 45) % 8
    return `${dirs[idx]} (${deg}°)`
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 px-6 py-5">
        <div className="flex flex-wrap items-center gap-3">
          <Sun className="h-5 w-5 text-amber-600" />
          <h3 className="font-display text-lg font-semibold">Rooftop solar potential</h3>
          <Badge className="bg-amber-500 text-white hover:bg-amber-600">
            Google Solar API
          </Badge>
          {lead.solarEnriched && (
            <Badge className="bg-green-600 text-white hover:bg-green-700">
              ✓ Google-verified
            </Badge>
          )}
          {lead.solarImageryQuality ? (
            <Badge variant="outline" className="uppercase">
              {lead.solarImageryQuality} imagery
            </Badge>
          ) : null}
          <div className="ml-auto">
            <Button
              onClick={() => void load(true)}
              disabled={refreshing}
              variant="ghost"
              size="sm"
            >
              {refreshing ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <HeroStat
            icon={PanelsTopLeft}
            label="Max panels"
            value={panels.toLocaleString()}
            sub={panelKw > 0 ? `${panelKw.toFixed(1)} kWp system` : undefined}
          />
          <HeroStat
            icon={Zap}
            label="Yearly production"
            value={kwh >= 1000 ? `${mwh.toFixed(1)} MWh` : `${Math.round(kwh).toLocaleString()} kWh`}
            sub={kwh > 0 ? `≈ ${Math.round(kwh / 12).toLocaleString()} kWh / month` : undefined}
          />
          <HeroStat
            icon={CloudSunRain}
            label="Peak sunshine"
            value={`${Math.round(sunHours).toLocaleString()} h / yr`}
            sub={sunHours > 0 ? `${(sunHours / 365).toFixed(1)} h avg / day` : undefined}
          />
          <HeroStat
            icon={Leaf}
            label="CO₂ offset"
            value={`${co2Tonnes.toFixed(1)} t / yr`}
            sub={co2Tonnes > 0 ? `≈ ${Math.round(co2Tonnes * 25).toLocaleString()} trees planted` : undefined}
          />
        </div>

        {/* Accurate roof measurements section */}
        {hasAccurateRoof && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50/50 p-4 dark:border-green-900/40 dark:bg-green-950/20">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-green-700 dark:text-green-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Google-verified measurements
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <MiniRow
                label="Actual roof area"
                value={`${Math.round(googleRoof!).toLocaleString()} m²`}
                highlight
              />
              {osmRoof != null && osmRoof > 0 && Math.abs(googleRoof! - osmRoof) > 10 && (
                <MiniRow
                  label="OSM estimate was"
                  value={`${Math.round(osmRoof).toLocaleString()} m² (${googleRoof! > osmRoof ? '+' : ''}${Math.round(((googleRoof! - osmRoof) / osmRoof) * 100)}%)`}
                />
              )}
              {lead.solarBuildingAreaSqm != null && lead.solarBuildingAreaSqm > 0 && (
                <MiniRow label="Building footprint" value={`${Math.round(lead.solarBuildingAreaSqm).toLocaleString()} m²`} />
              )}
              {lead.buildingHeightM != null && lead.buildingHeightM > 0 && (
                <MiniRow label="Building height" value={`${lead.buildingHeightM} m`} />
              )}
              {lead.roofPitchDeg != null && (
                <MiniRow label="Roof pitch" value={`${lead.roofPitchDeg}°`} />
              )}
              {lead.roofAzimuthDeg != null && (
                <MiniRow label="Roof orientation" value={azimuthLabel(lead.roofAzimuthDeg)} />
              )}
              {lead.roofSegmentCount != null && lead.roofSegmentCount > 0 && (
                <MiniRow label="Roof segments" value={`${lead.roofSegmentCount}`} />
              )}
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-3 border-t pt-6 text-sm sm:grid-cols-3">
          <MiniRow label="Max usable array area" value={`${Math.round(arrayArea).toLocaleString()} m²`} />
          <MiniRow
            label="Panel capacity"
            value={lead.solarPanelCapacityWatts ? `${lead.solarPanelCapacityWatts} W per panel` : '–'}
          />
          <MiniRow
            label="Panel lifetime"
            value={lead.solarPanelLifetimeYears ? `${lead.solarPanelLifetimeYears} years` : '–'}
          />
          <MiniRow label="Imagery date" value={lead.solarImageryDate ?? '–'} />
          <MiniRow
            label="Fetched"
            value={
              lead.solarDataFetchedAt ? new Date(lead.solarDataFetchedAt).toLocaleString() : '–'
            }
          />
          <MiniRow
            label="Lifetime production"
            value={
              kwh && lead.solarPanelLifetimeYears
                ? `${((kwh * lead.solarPanelLifetimeYears) / 1000).toFixed(0)} MWh`
                : '–'
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}

function HeroStat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: any
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-muted/40 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-amber-600" />
        {label}
      </div>
      <div className="font-display text-2xl font-bold text-amber-700 dark:text-amber-400">
        {value}
      </div>
      {sub ? <div className="text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  )
}

function MiniRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? 'font-semibold text-green-700 dark:text-green-400' : 'font-medium'}>{value}</span>
    </div>
  )
}
