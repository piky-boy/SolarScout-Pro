'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Progress {
  total: number
  active: number
  remaining: number
  percent: number
  breakdown: {
    hubs:  { total: number; active: number; remaining: number }
    tier1: { total: number; active: number; remaining: number }
    tier2: { total: number; active: number; remaining: number }
  }
}

interface PublishResult {
  activated: number
  remaining: number
  total: number
  active: number
  slugs?: string[]
  message?: string
}

export function PublishBatchClient() {
  const [progress, setProgress] = useState<Progress | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PublishResult | null>(null)
  const [batchSize, setBatchSize] = useState('100')
  const [error, setError] = useState<string | null>(null)
  const [log, setLog] = useState<string[]>([])

  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/intent-landings/publish')
      if (res.ok) {
        const data = await res.json()
        setProgress(data)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  async function handlePublish() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/admin/intent-landings/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize: Number(batchSize) }),
      })

      const data: PublishResult = await res.json()

      if (!res.ok) {
        setError((data as any).error ?? 'Unknown error')
        return
      }

      setResult(data)
      if (data.slugs && data.slugs.length > 0) {
        const ts = new Date().toLocaleTimeString()
        setLog((prev) => [
          `[${ts}] Published ${data.activated} pages (${data.active}/${data.total} total, ${data.remaining} remaining)`,
          ...prev.slice(0, 19), // keep last 20 entries
        ])
      } else if (data.message) {
        setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${data.message}`, ...prev.slice(0, 19)])
      }
      await fetchProgress()
    } catch (e: any) {
      setError(e.message ?? 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const pct = progress?.percent ?? 0
  const isDone = progress !== null && progress.remaining === 0

  return (
    <div className="space-y-6">
      {/* ── Progress overview ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Publication Progress</CardTitle>
          <CardDescription>
            Pages are published in priority order: hub pages first, then tier-1 cities, then tier-2
            cities. Each batch activates pages in the sitemap and makes them indexable by search
            engines.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Overall progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {progress?.active ?? '—'} / {progress?.total ?? '—'} pages published
              </span>
              <span className="text-muted-foreground">{pct}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Breakdown table */}
          {progress && (
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { label: 'Hub Pages',     key: 'hubs',  color: 'bg-blue-500'   },
                  { label: 'Tier-1 Cities', key: 'tier1', color: 'bg-emerald-500' },
                  { label: 'Tier-2 Cities', key: 'tier2', color: 'bg-amber-500'   },
                ] as const
              ).map(({ label, key, color }) => {
                const s = progress.breakdown[key]
                const pct2 = s.total > 0 ? Math.round((s.active / s.total) * 100) : 0
                return (
                  <div key={key} className="rounded-lg border bg-card p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${color}`} />
                      <span className="text-xs font-medium text-muted-foreground">{label}</span>
                    </div>
                    <p className="text-lg font-bold tabular-nums">
                      {s.active}
                      <span className="text-sm font-normal text-muted-foreground">/{s.total}</span>
                    </p>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct2}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">{s.remaining} remaining</p>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Publish controls ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Publish Next Batch</CardTitle>
          <CardDescription>
            Activate the next N pages. They will immediately appear in the sitemap and be
            accessible at their URLs. Recommended: 100 per day.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDone ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
              <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              All {progress?.total} pages are published and live.
            </div>
          ) : (
            <div className="flex items-end gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Batch size</label>
                <Select value={batchSize} onValueChange={setBatchSize}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50 pages</SelectItem>
                    <SelectItem value="100">100 pages</SelectItem>
                    <SelectItem value="200">200 pages</SelectItem>
                    <SelectItem value="500">500 pages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handlePublish} disabled={loading} className="mb-0.5">
                {loading ? (
                  <>
                    <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Publishing…
                  </>
                ) : (
                  `Publish next ${batchSize}`
                )}
              </Button>
            </div>
          )}

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {result && !error && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
              ✓ Published <strong>{result.activated}</strong> pages —{' '}
              <strong>{result.remaining}</strong> remaining
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Activity log ── */}
      {log.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Session log</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {log.map((entry, i) => (
                <li key={i} className="font-mono text-xs text-muted-foreground">
                  {entry}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ── SEO tip ── */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardContent className="pt-4">
          <p className="text-xs text-amber-800 dark:text-amber-300">
            <strong>Tip:</strong> After publishing a batch, submit{' '}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">/sitemap.xml</code> to
            Google Search Console so the new URLs are discovered quickly. Spacing batches 1–3 days
            apart gives Googlebot time to crawl and index each wave before the next.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
