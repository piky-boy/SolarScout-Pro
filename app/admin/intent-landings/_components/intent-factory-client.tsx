'use client'

import { useState } from 'react'
import { Play, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface FactoryResult {
  total: number
  created: number
  skipped: number
  errors: number
  dryRun: boolean
  results: Array<{ slug: string; action: 'created' | 'skipped' | 'error'; reason?: string }>
}

const COUNTRY_OPTIONS = [
  { value: 'all', label: 'All countries' },
  { value: 'RO', label: 'Romania' },
  { value: 'ES', label: 'Spain' },
  { value: 'PT', label: 'Portugal' },
  { value: 'AL', label: 'Albania' },
  { value: 'GB', label: 'United Kingdom' },
]

export function IntentFactoryClient() {
  const [dryRun, setDryRun] = useState(true)
  const [includeTier2, setIncludeTier2] = useState(false)
  const [skipHubs, setSkipHubs] = useState(false)
  const [countryCode, setCountryCode] = useState('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<FactoryResult | null>(null)

  async function handleRun() {
    setRunning(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/intent-landings/factory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dryRun,
          includeTier2,
          skipHubs,
          countryCode: countryCode === 'all' || !countryCode ? undefined : countryCode,
        }),
      })
      const data: FactoryResult = await res.json()
      if (!res.ok) {
        toast.error((data as any).error ?? 'Factory run failed')
        return
      }
      setResult(data)
      toast.success(
        dryRun
          ? `Dry run complete — ${data.total} pages would be processed`
          : `Factory complete — ${data.created} created, ${data.skipped} skipped, ${data.errors} errors`,
      )
    } catch {
      toast.error('Factory request failed')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Factory Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Dry run</Label>
              <p className="text-xs text-muted-foreground">Preview what would be created without writing to DB</p>
            </div>
            <Switch checked={dryRun} onCheckedChange={setDryRun} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Include tier-2 cities</Label>
              <p className="text-xs text-muted-foreground">Generate pages for smaller secondary cities</p>
            </div>
            <Switch checked={includeTier2} onCheckedChange={setIncludeTier2} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Skip hub pages</Label>
              <p className="text-xs text-muted-foreground">Only generate geo (city-level) pages</p>
            </div>
            <Switch checked={skipHubs} onCheckedChange={setSkipHubs} />
          </div>

          <div>
            <Label className="mb-1.5 block font-medium">Country filter</Label>
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!dryRun && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Live run will write to the database. Existing pages will have template fields refreshed.
                AI content and manual edits are preserved.
              </span>
            </div>
          )}

          <Button
            onClick={handleRun}
            disabled={running}
            className="w-full"
            variant={dryRun ? 'outline' : 'default'}
          >
            <Play className="mr-2 h-4 w-4" />
            {running ? 'Running…' : dryRun ? 'Dry Run' : 'Run Factory'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Results
              {result.dryRun && <Badge variant="secondary">Dry run</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-display text-2xl font-bold text-emerald-500">{result.created}</p>
                <p className="text-xs text-muted-foreground">{result.dryRun ? 'would create' : 'created'}</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-muted-foreground">{result.skipped}</p>
                <p className="text-xs text-muted-foreground">skipped</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-destructive">{result.errors}</p>
                <p className="text-xs text-muted-foreground">errors</p>
              </div>
            </div>

            {result.errors > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                {result.results
                  .filter((r) => r.action === 'error')
                  .map((r) => (
                    <div key={r.slug} className="flex items-start gap-2 text-xs text-destructive">
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        <span className="font-mono">{r.slug}</span>: {r.reason}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            <div className="max-h-64 overflow-y-auto rounded-lg border border-border/40 bg-muted/20 p-3">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">All results</p>
              {result.results.map((r) => (
                <div key={r.slug} className="flex items-center gap-2 py-0.5 text-xs">
                  {r.action === 'created' ? (
                    <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                  ) : r.action === 'error' ? (
                    <XCircle className="h-3 w-3 text-destructive shrink-0" />
                  ) : (
                    <span className="h-3 w-3 shrink-0 rounded-full bg-muted-foreground/30" />
                  )}
                  <span className="font-mono text-muted-foreground">{r.slug}</span>
                  {r.reason && <span className="text-muted-foreground/60">— {r.reason}</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
