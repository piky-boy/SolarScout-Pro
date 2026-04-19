'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Wand2,
  Loader2,
  Mail,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  SendHorizonal,
  Sparkles,
} from 'lucide-react'
import {
  OUTREACH_TONES,
  SUPPORTED_LANGUAGES,
  type OutreachLanguage,
  type OutreachTone,
  defaultLanguageForCountry,
} from '@/lib/outreach'

export interface BulkOutreachLead {
  id: string
  businessName: string | null
  country: string | null
  contactEmail: string | null
}

export interface BulkOutreachDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leads: BulkOutreachLead[]
  /** called after a successful send (success count > 0) so parent can clear selection */
  onSent?: (leadIds: string[]) => void
}

type Phase = 'setup' | 'generating' | 'review' | 'sending' | 'done'

interface PerLead {
  lead: BulkOutreachLead
  include: boolean
  status: 'pending' | 'generating' | 'ready' | 'error' | 'skipped' | 'sending' | 'sent' | 'failed'
  error?: string
  subject: string
  body: string
  expanded: boolean
  sendResult?: { ok: boolean; error?: string }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function BulkOutreachDialog({
  open,
  onOpenChange,
  leads,
  onSent,
}: BulkOutreachDialogProps) {
  const [phase, setPhase] = useState<Phase>('setup')
  const [tone, setTone] = useState<OutreachTone>('professional')
  const [forceLanguage, setForceLanguage] = useState<'auto' | OutreachLanguage>('auto')
  const [senderName, setSenderName] = useState('')
  const [senderCompany, setSenderCompany] = useState('')
  const [senderReplyEmail, setSenderReplyEmail] = useState('')
  const [items, setItems] = useState<PerLead[]>([])
  const [progress, setProgress] = useState(0)

  // Hydrate sender prefs from localStorage after mount (hydration-safe)
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('solarscout:senderName')
      const savedCompany = localStorage.getItem('solarscout:senderCompany')
      const savedEmail = localStorage.getItem('solarscout:senderEmail')
      if (savedName) setSenderName(savedName)
      if (savedCompany) setSenderCompany(savedCompany)
      if (savedEmail) setSenderReplyEmail(savedEmail)
    } catch {}
  }, [])

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setPhase('setup')
      setItems([])
      setProgress(0)
    }
  }, [open])

  const withEmailCount = useMemo(
    () => leads.filter((l) => l.contactEmail && EMAIL_RE.test(l.contactEmail)).length,
    [leads]
  )
  const skippedCount = leads.length - withEmailCount

  const readyCount = items.filter((i) => i.status === 'ready' && i.include).length
  const errorCount = items.filter((i) => i.status === 'error').length
  const sentCount = items.filter((i) => i.status === 'sent').length
  const failedCount = items.filter((i) => i.status === 'failed').length

  function persistSenderPrefs() {
    try {
      if (senderName) localStorage.setItem('solarscout:senderName', senderName)
      if (senderCompany) localStorage.setItem('solarscout:senderCompany', senderCompany)
      if (senderReplyEmail) localStorage.setItem('solarscout:senderEmail', senderReplyEmail)
    } catch {}
  }

  async function startGeneration() {
    if (!senderName.trim() || !senderCompany.trim()) {
      toast.error('Please fill in your name and company first.')
      return
    }
    if (senderReplyEmail && !EMAIL_RE.test(senderReplyEmail)) {
      toast.error('Reply-to email looks invalid.')
      return
    }
    persistSenderPrefs()

    const initial: PerLead[] = leads.map((lead) => {
      const hasEmail = !!lead.contactEmail && EMAIL_RE.test(lead.contactEmail)
      return {
        lead,
        include: hasEmail,
        status: hasEmail ? 'pending' : 'skipped',
        subject: '',
        body: '',
        expanded: false,
      }
    })
    setItems(initial)
    setPhase('generating')
    setProgress(0)

    // Generate sequentially to be kind to the LLM API and get stable results
    let done = 0
    const total = initial.filter((i) => i.status === 'pending').length

    for (let idx = 0; idx < initial.length; idx++) {
      const it = initial[idx]
      if (it.status !== 'pending') continue

      // mark generating
      setItems((prev) => {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], status: 'generating' }
        return copy
      })

      const language: OutreachLanguage =
        forceLanguage === 'auto' ? defaultLanguageForCountry(it.lead.country) : forceLanguage

      try {
        const res = await fetch(`/api/leads/${it.lead.id}/outreach`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language, tone }),
          cache: 'no-store',
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)

        const email = json?.kit?.email
        if (!email?.subject || !email?.body) throw new Error('Missing email in AI response')

        setItems((prev) => {
          const copy = [...prev]
          copy[idx] = {
            ...copy[idx],
            status: 'ready',
            subject: email.subject,
            body: email.body,
          }
          return copy
        })
      } catch (err: any) {
        setItems((prev) => {
          const copy = [...prev]
          copy[idx] = {
            ...copy[idx],
            status: 'error',
            include: false,
            error: err?.message || 'Generation failed',
          }
          return copy
        })
      }

      done++
      setProgress(Math.round((done / Math.max(total, 1)) * 100))
    }

    setPhase('review')
  }

  async function startSending() {
    const toSend = items.filter((i) => i.status === 'ready' && i.include)
    if (toSend.length === 0) {
      toast.error('Nothing to send. Include at least one lead with a valid email.')
      return
    }

    setPhase('sending')
    // optimistic marking
    setItems((prev) =>
      prev.map((i) => (i.status === 'ready' && i.include ? { ...i, status: 'sending' } : i))
    )

    const body = {
      items: toSend.map((i) => ({
        leadId: i.lead.id,
        subject: i.subject,
        body: i.body,
      })),
      senderName,
      senderCompany,
      senderReplyEmail: senderReplyEmail || undefined,
    }

    try {
      const res = await fetch('/api/leads/outreach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)

      const results: Array<{ leadId: string; ok: boolean; error?: string }> = json?.results || []

      setItems((prev) =>
        prev.map((i) => {
          const r = results.find((rr) => rr.leadId === i.lead.id)
          if (!r) return i
          return {
            ...i,
            status: r.ok ? 'sent' : 'failed',
            sendResult: { ok: r.ok, error: r.error },
          }
        })
      )

      const okIds = results.filter((r) => r.ok).map((r) => r.leadId)
      if (okIds.length > 0) {
        toast.success(
          `Sent ${okIds.length} / ${toSend.length}${
            toSend.length - okIds.length > 0 ? ` (${toSend.length - okIds.length} failed)` : ''
          }`
        )
        onSent?.(okIds)
      } else {
        toast.error('All sends failed. See per-lead errors below.')
      }

      setPhase('done')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send emails')
      setItems((prev) =>
        prev.map((i) => (i.status === 'sending' ? { ...i, status: 'failed', sendResult: { ok: false, error: err?.message } } : i))
      )
      setPhase('done')
    }
  }

  function toggleItem(idx: number) {
    setItems((prev) => {
      const copy = [...prev]
      const it = copy[idx]
      if (it.status === 'skipped' || it.status === 'error') return copy
      copy[idx] = { ...it, include: !it.include }
      return copy
    })
  }

  function toggleExpand(idx: number) {
    setItems((prev) => {
      const copy = [...prev]
      copy[idx] = { ...copy[idx], expanded: !copy[idx].expanded }
      return copy
    })
  }

  function updateField(idx: number, field: 'subject' | 'body', value: string) {
    setItems((prev) => {
      const copy = [...prev]
      copy[idx] = { ...copy[idx], [field]: value }
      return copy
    })
  }

  function close() {
    if (phase === 'generating' || phase === 'sending') {
      if (!confirm('A job is in progress — close anyway?')) return
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : close())}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-violet-600" />
            Bulk outreach
            <Badge className="bg-violet-600 text-white hover:bg-violet-700">AI-personalized</Badge>
          </DialogTitle>
          <DialogDescription>
            Generate and send a personalized solar outreach email to each selected lead. Each
            email is written individually by the LLM based on that lead&apos;s rooftop and business
            signals.
          </DialogDescription>
        </DialogHeader>

        {/* SETUP PHASE */}
        {phase === 'setup' ? (
          <div className="space-y-5">
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-500/30 dark:bg-amber-500/10">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-amber-900 dark:text-amber-200">
                  <strong>Cold B2B outreach compliance:</strong> under GDPR you need a legitimate
                  interest and a clear opt-out. An unsubscribe line is added automatically to each
                  email.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="bo-name">Your name *</Label>
                <Input
                  id="bo-name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Ana Popescu"
                />
              </div>
              <div>
                <Label htmlFor="bo-company">Your company *</Label>
                <Input
                  id="bo-company"
                  value={senderCompany}
                  onChange={(e) => setSenderCompany(e.target.value)}
                  placeholder="SolarScout Pro"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="bo-reply">Reply-to email (optional)</Label>
                <Input
                  id="bo-reply"
                  type="email"
                  value={senderReplyEmail}
                  onChange={(e) => setSenderReplyEmail(e.target.value)}
                  placeholder="ana@yourcompany.com"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Recipients will see this in the signature. Emails are delivered from
                  <span className="font-mono"> noreply@</span>(your app domain) — replies land here
                  if you include it.
                </p>
              </div>
              <div>
                <Label htmlFor="bo-tone">Tone</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as OutreachTone)}>
                  <SelectTrigger id="bo-tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OUTREACH_TONES.map((t) => (
                      <SelectItem key={t.code} value={t.code}>
                        <span className="font-medium">{t.label}</span>
                        <span className="ml-2 text-muted-foreground">— {t.hint}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bo-lang">Language</Label>
                <Select
                  value={forceLanguage}
                  onValueChange={(v) => setForceLanguage(v as 'auto' | OutreachLanguage)}
                >
                  <SelectTrigger id="bo-lang">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">🌍 Auto (match lead country)</SelectItem>
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        {l.flag} {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline">{leads.length} selected</Badge>
                <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">
                  {withEmailCount} with email
                </Badge>
                {skippedCount > 0 ? (
                  <Badge variant="outline" className="border-amber-300 text-amber-700">
                    {skippedCount} skipped (no email)
                  </Badge>
                ) : null}
              </div>
              {withEmailCount === 0 ? (
                <p className="mt-2 text-amber-700 dark:text-amber-300">
                  None of the selected leads have a public email address. Run a fresh scout on Google to
                  pull contact emails, or filter to leads that have emails.
                </p>
              ) : (
                <p className="mt-2 text-muted-foreground">
                  We&apos;ll generate {withEmailCount} individual emails — this takes ~
                  {Math.ceil((withEmailCount * 6) / 60)} minute(s) (serial to stay kind to the
                  LLM).
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={startGeneration}
                disabled={withEmailCount === 0 || !senderName.trim() || !senderCompany.trim()}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate {withEmailCount} email{withEmailCount === 1 ? '' : 's'}
              </Button>
            </DialogFooter>
          </div>
        ) : null}

        {/* GENERATING PHASE */}
        {phase === 'generating' ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Generating personalized emails... {progress}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {items.filter((i) => i.status === 'ready').length} of{' '}
                  {items.filter((i) => i.status !== 'skipped').length} done
                </p>
              </div>
            </div>
            <Progress value={progress} />
            <div className="max-h-60 space-y-1 overflow-y-auto rounded-md border bg-muted/20 p-2 text-xs">
              {items.map((it) => (
                <div key={it.lead.id} className="flex items-center gap-2 py-0.5">
                  {it.status === 'generating' ? (
                    <Loader2 className="h-3 w-3 animate-spin text-violet-600" />
                  ) : it.status === 'ready' ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  ) : it.status === 'error' ? (
                    <XCircle className="h-3 w-3 text-red-600" />
                  ) : it.status === 'skipped' ? (
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                  ) : (
                    <span className="h-3 w-3 rounded-full bg-muted-foreground/20" />
                  )}
                  <span className="flex-1 truncate">{it.lead.businessName || it.lead.id}</span>
                  {it.status === 'error' ? (
                    <span className="truncate text-red-600">{it.error}</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* REVIEW PHASE */}
        {phase === 'review' || phase === 'sending' || phase === 'done' ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge className="bg-violet-600 text-white hover:bg-violet-700">
                {readyCount} ready to send
              </Badge>
              {errorCount > 0 ? (
                <Badge variant="outline" className="border-red-300 text-red-700">
                  {errorCount} failed to generate
                </Badge>
              ) : null}
              {skippedCount > 0 ? (
                <Badge variant="outline" className="border-amber-300 text-amber-700">
                  {skippedCount} skipped (no email)
                </Badge>
              ) : null}
              {sentCount > 0 ? (
                <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">
                  {sentCount} sent
                </Badge>
              ) : null}
              {failedCount > 0 ? (
                <Badge variant="outline" className="border-red-300 text-red-700">
                  {failedCount} failed to send
                </Badge>
              ) : null}
            </div>

            <div className="divide-y rounded-md border">
              {items.map((it, idx) => {
                const disabled =
                  it.status === 'skipped' ||
                  it.status === 'error' ||
                  it.status === 'sending' ||
                  it.status === 'sent' ||
                  it.status === 'failed'
                return (
                  <div key={it.lead.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={it.include}
                        disabled={disabled}
                        onCheckedChange={() => toggleItem(idx)}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">
                            {it.lead.businessName || '(unnamed lead)'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {it.lead.country}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {it.lead.contactEmail || '—'}
                          </span>
                          {it.status === 'skipped' ? (
                            <Badge variant="outline" className="border-amber-300 text-amber-700">
                              no email
                            </Badge>
                          ) : it.status === 'error' ? (
                            <Badge variant="outline" className="border-red-300 text-red-700">
                              gen failed
                            </Badge>
                          ) : it.status === 'ready' ? (
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">
                              ready
                            </Badge>
                          ) : it.status === 'sending' ? (
                            <Badge className="bg-violet-600 text-white hover:bg-violet-700">
                              sending...
                            </Badge>
                          ) : it.status === 'sent' ? (
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">
                              <CheckCircle2 className="mr-1 h-3 w-3" /> sent
                            </Badge>
                          ) : it.status === 'failed' ? (
                            <Badge variant="outline" className="border-red-300 text-red-700">
                              <XCircle className="mr-1 h-3 w-3" /> {it.sendResult?.error || 'failed'}
                            </Badge>
                          ) : null}
                        </div>
                        {it.status === 'ready' || it.status === 'sent' || it.status === 'failed' || it.status === 'sending' ? (
                          <>
                            <div className="mt-1 truncate text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">{it.subject}</span>
                            </div>
                            <button
                              onClick={() => toggleExpand(idx)}
                              className="mt-1 flex items-center gap-1 text-xs text-violet-600 hover:underline"
                            >
                              {it.expanded ? (
                                <>
                                  <ChevronUp className="h-3 w-3" /> Hide editor
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3" /> Show/edit email
                                </>
                              )}
                            </button>
                            {it.expanded ? (
                              <div className="mt-2 space-y-2">
                                <Input
                                  value={it.subject}
                                  onChange={(e) => updateField(idx, 'subject', e.target.value)}
                                  placeholder="Subject"
                                  disabled={phase !== 'review'}
                                />
                                <Textarea
                                  value={it.body}
                                  onChange={(e) => updateField(idx, 'body', e.target.value)}
                                  rows={8}
                                  className="font-mono text-xs"
                                  placeholder="Body"
                                  disabled={phase !== 'review'}
                                />
                              </div>
                            ) : null}
                          </>
                        ) : it.status === 'error' ? (
                          <p className="mt-1 text-xs text-red-700">{it.error}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <DialogFooter className="sticky bottom-0 -mx-6 -mb-6 border-t bg-background px-6 py-3">
              {phase === 'review' ? (
                <>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={startSending}
                    disabled={readyCount === 0}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    <SendHorizonal className="mr-2 h-4 w-4" />
                    Send {readyCount} email{readyCount === 1 ? '' : 's'}
                  </Button>
                </>
              ) : phase === 'sending' ? (
                <Button disabled className="bg-violet-600">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending {items.filter((i) => i.status === 'sending').length}...
                </Button>
              ) : (
                <Button onClick={() => onOpenChange(false)}>
                  <Mail className="mr-2 h-4 w-4" /> Close
                </Button>
              )}
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
