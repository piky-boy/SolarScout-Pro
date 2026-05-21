'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, Pencil, Trash2, Zap, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { toast } from 'sonner'

interface PageRow {
  id: string
  slug: string
  locale: string
  intentType: string
  isHub: boolean
  city: string | null
  countryCode: string | null
  tier: number
  title: string
  isActive: boolean
  emotionalHook: string
  aiSearchQA: unknown[]
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  total: number
  page: number
  limit: number
  items: PageRow[]
}

const INTENT_TYPE_OPTIONS = [
  'solar-leads',
  'commercial-solar-leads',
  'warehouse-solar-leads',
  'industrial-solar-leads',
  'retail-solar-leads',
  'residential-solar-leads',
]

const COUNTRY_OPTIONS = ['RO', 'ES', 'PT', 'AL', 'GB']
const LOCALE_OPTIONS = ['en', 'es', 'ro', 'sq']

export function IntentLandingsClient() {
  const router = useRouter()
  const [items, setItems] = useState<PageRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  // Filters
  const [countryCode, setCountryCode] = useState('')
  const [intentType, setIntentType] = useState('')
  const [locale, setLocale] = useState('')
  const [isActive, setIsActive] = useState('')
  const [isHub, setIsHub] = useState('')
  const [page, setPage] = useState(1)

  const fetchPages = useCallback(async (overrides: Record<string, string | number> = {}) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      const cc = overrides.countryCode ?? countryCode
      const it = overrides.intentType ?? intentType
      const lc = overrides.locale ?? locale
      const ia = overrides.isActive ?? isActive
      const ih = overrides.isHub ?? isHub
      const pg = overrides.page ?? page

      if (cc) params.set('countryCode', String(cc))
      if (it) params.set('intentType', String(it))
      if (lc) params.set('locale', String(lc))
      if (ia) params.set('isActive', String(ia))
      if (ih) params.set('isHub', String(ih))
      params.set('page', String(pg))
      params.set('limit', '50')

      const res = await fetch(`/api/admin/intent-landings?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data: ApiResponse = await res.json()
      setItems(data.items)
      setTotal(data.total)
      setFetched(true)
    } catch {
      toast.error('Failed to load pages')
    } finally {
      setLoading(false)
    }
  }, [countryCode, intentType, locale, isActive, isHub, page])

  async function toggleActive(row: PageRow) {
    try {
      const res = await fetch(`/api/admin/intent-landings/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !row.isActive }),
      })
      if (!res.ok) throw new Error('Update failed')
      setItems((prev) => prev.map((p) => (p.id === row.id ? { ...p, isActive: !row.isActive } : p)))
      toast.success(row.isActive ? 'Page deactivated' : 'Page activated')
    } catch {
      toast.error('Update failed')
    }
  }

  async function handleGenerate(row: PageRow) {
    toast.loading('Generating AI content…', { id: `gen-${row.id}` })
    try {
      const res = await fetch('/api/admin/intent-landings/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id }),
      })
      if (!res.ok) throw new Error('Generation failed')
      toast.success('AI content generated', { id: `gen-${row.id}` })
      await fetchPages()
    } catch (err: any) {
      toast.error(err.message ?? 'Generation failed', { id: `gen-${row.id}` })
    }
  }

  async function handleDelete(row: PageRow) {
    if (!confirm(`Delete "${row.slug}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/admin/intent-landings/${row.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setItems((prev) => prev.filter((p) => p.id !== row.id))
      toast.success('Page deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={countryCode} onValueChange={(v) => setCountryCode(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {COUNTRY_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={intentType} onValueChange={(v) => setIntentType(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Intent type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {INTENT_TYPE_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={locale} onValueChange={(v) => setLocale(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Locale" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locales</SelectItem>
            {LOCALE_OPTIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={isActive} onValueChange={(v) => setIsActive(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={isHub} onValueChange={(v) => setIsHub(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All pages</SelectItem>
            <SelectItem value="true">Hubs only</SelectItem>
            <SelectItem value="false">Geo only</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => fetchPages()} disabled={loading}>
          {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
          {fetched ? 'Refresh' : 'Load Pages'}
        </Button>
      </div>

      {/* Results */}
      {fetched && (
        <div>
          <p className="mb-2 text-sm text-muted-foreground">{total} pages found</p>
          <div className="overflow-hidden rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Intent</TableHead>
                  <TableHead>Locale</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>AI</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate">
                      {row.slug}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.countryCode ?? '—'}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[140px] truncate">
                      {row.intentType}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.locale}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={row.tier === 1 ? 'text-amber-500 font-bold' : 'text-muted-foreground'}>
                        T{row.tier}
                      </span>
                    </TableCell>
                    <TableCell>
                      {(row.aiSearchQA as unknown[]).length > 0 ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground/40" />
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleActive(row)}
                        className={`text-xs font-medium ${row.isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}
                      >
                        {row.isActive ? '● Active' : '○ Inactive'}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => handleGenerate(row)}
                          title="Generate AI content"
                        >
                          <Zap className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => router.push(`/admin/intent-landings/${row.id}`)}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(row)}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          asChild
                          title="Preview page"
                        >
                          <a href={`/intent/${row.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {total > 50 && (
            <div className="mt-4 flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => {
                  const newPage = page - 1
                  setPage(newPage)
                  fetchPages({ page: newPage })
                }}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {Math.ceil(total / 50)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(total / 50)}
                onClick={() => {
                  const newPage = page + 1
                  setPage(newPage)
                  fetchPages({ page: newPage })
                }}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
