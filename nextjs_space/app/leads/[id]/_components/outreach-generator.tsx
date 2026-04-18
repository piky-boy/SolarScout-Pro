'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sparkles,
  Loader2,
  Mail,
  Phone,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Clock,
  TrendingUp,
  Wand2,
} from 'lucide-react'
import {
  OUTREACH_TONES,
  SUPPORTED_LANGUAGES,
  type OutreachLanguage,
  type OutreachTone,
  type BusinessCase,
  defaultLanguageForCountry,
} from '@/lib/outreach'

export interface OutreachGeneratorProps {
  leadId: string
  country: string | null
  contactEmail: string | null
  contactPhone: string | null
  businessName: string | null
}

type OutreachKit = {
  email: { subject: string; body: string }
  call: {
    opener: string
    keyPoints: string[]
    objectionResponse: string
    closing: string
  }
  whatsapp: string
}

type ApiResponse = {
  language: OutreachLanguage
  tone: OutreachTone
  businessCase: BusinessCase | null
  hasRealSolarData: boolean
  kit: OutreachKit
}

export function OutreachGenerator({
  leadId,
  country,
  contactEmail,
  contactPhone,
  businessName,
}: OutreachGeneratorProps) {
  const [language, setLanguage] = useState<OutreachLanguage>(defaultLanguageForCountry(country))
  const [tone, setTone] = useState<OutreachTone>('professional')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ApiResponse | null>(null)

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch(`/api/leads/${leadId}/outreach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, tone }),
        cache: 'no-store',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`)
      setData(json)
      toast.success('Outreach kit ready', {
        description: 'Email, call script and WhatsApp message generated.',
      })
    } catch (e: any) {
      toast.error(e?.message || 'Failed to generate outreach')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-amber-500/10 px-6 py-5">
        <div className="flex flex-wrap items-center gap-3">
          <Wand2 className="h-5 w-5 text-violet-600" />
          <h3 className="font-display text-lg font-semibold">Outreach kit</h3>
          <Badge className="bg-violet-600 text-white hover:bg-violet-700">AI-generated</Badge>
          {data?.hasRealSolarData ? (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              Solar API • real data
            </Badge>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          One click to turn this rooftop into a personalized email, call script and WhatsApp
          message — grounded in real Google Solar numbers and the local electricity tariff.
        </p>
      </div>

      <CardContent className="space-y-5 p-6">
        {/* Controls */}
        <div className="grid gap-3 sm:grid-cols-[1fr,1fr,auto] sm:items-end">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Language
            </Label>
            <Select value={language} onValueChange={(v) => setLanguage(v as OutreachLanguage)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    <span className="inline-flex items-center gap-2">
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Tone
            </Label>
            <Select value={tone} onValueChange={(v) => setTone(v as OutreachTone)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OUTREACH_TONES.map((t) => (
                  <SelectItem key={t.code} value={t.code}>
                    <span className="inline-flex items-center gap-2">
                      <span className="font-medium">{t.label}</span>
                      <span className="text-xs text-muted-foreground">— {t.hint}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => void generate()} disabled={loading} className="sm:justify-self-end">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {data ? 'Regenerate' : 'Generate outreach'}
          </Button>
        </div>

        {/* Business case banner */}
        {data?.businessCase ? <BusinessCaseBanner bc={data.businessCase} /> : null}

        {/* Tabs */}
        {data ? (
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email" className="gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="call" className="gap-2">
                <Phone className="h-4 w-4" />
                Call script
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="mt-4">
              <EmailPane
                kit={data.kit}
                contactEmail={contactEmail}
                businessName={businessName}
              />
            </TabsContent>
            <TabsContent value="call" className="mt-4">
              <CallPane kit={data.kit} contactPhone={contactPhone} />
            </TabsContent>
            <TabsContent value="whatsapp" className="mt-4">
              <WhatsAppPane kit={data.kit} contactPhone={contactPhone} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            Pick a language + tone, then press{' '}
            <span className="font-medium text-foreground">Generate outreach</span>. We combine
            this lead’s Solar API data with local electricity prices to craft a ready-to-send
            email, call script and WhatsApp message.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function BusinessCaseBanner({ bc }: { bc: BusinessCase }) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-4">
      <BcStat
        icon={Zap}
        label="System size"
        value={`${bc.systemKwp.toFixed(1)} kWp`}
        sub={`${bc.annualProductionKwh.toLocaleString()} kWh / yr`}
      />
      <BcStat
        icon={TrendingUp}
        label="Annual savings"
        value={`€${bc.annualSavingsEur.toLocaleString()}`}
        sub={`@ €${bc.electricityPrice.toFixed(2)} / kWh`}
        accent
      />
      <BcStat
        icon={Clock}
        label="Payback"
        value={`${bc.paybackYears.toFixed(1)} yrs`}
        sub={`€${bc.systemCostEur.toLocaleString()} system`}
      />
      <BcStat
        icon={TrendingUp}
        label={`${bc.lifetimeYears}-year ROI`}
        value={`€${bc.lifetimeSavingsEur.toLocaleString()}`}
        sub={bc.co2TonnesPerYear > 0 ? `${bc.co2TonnesPerYear.toFixed(1)} t CO₂ / yr` : undefined}
        accent
      />
    </div>
  )
}

function BcStat({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: any
  label: string
  value: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div
        className={`mt-1 truncate font-display text-xl font-bold ${
          accent ? 'text-amber-600 dark:text-amber-400' : ''
        }`}
      >
        {value}
      </div>
      {sub ? <div className="truncate text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  )
}

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          toast.success('Copied to clipboard')
          setTimeout(() => setCopied(false), 1800)
        } catch {
          toast.error('Could not access clipboard')
        }
      }}
    >
      {copied ? <Check className="mr-2 h-3.5 w-3.5" /> : <Copy className="mr-2 h-3.5 w-3.5" />}
      {label}
    </Button>
  )
}

function EmailPane({
  kit,
  contactEmail,
  businessName,
}: {
  kit: OutreachKit
  contactEmail: string | null
  businessName: string | null
}) {
  const [subject, setSubject] = useState(kit.email.subject)
  const [bodyText, setBodyText] = useState(kit.email.body)

  // Reset when kit changes (e.g., after regenerate)
  useEffect(() => {
    setSubject(kit.email.subject)
    setBodyText(kit.email.body)
  }, [kit.email.subject, kit.email.body])

  const mailtoHref = useMemo(() => {
    const to = contactEmail ?? ''
    const params = new URLSearchParams({
      subject,
      body: bodyText,
    })
    return `mailto:${encodeURIComponent(to)}?${params.toString()}`
  }, [contactEmail, subject, bodyText])

  const fullText = `Subject: ${subject}\n\n${bodyText}`

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Subject
        </Label>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Body
        </Label>
        <Textarea
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          rows={14}
          className="font-sans text-sm leading-relaxed"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <CopyButton text={subject} label="Copy subject" />
        <CopyButton text={bodyText} label="Copy body" />
        <CopyButton text={fullText} label="Copy all" />
        <a href={mailtoHref}>
          <Button size="sm" className="bg-violet-600 text-white hover:bg-violet-700">
            <Mail className="mr-2 h-3.5 w-3.5" />
            {contactEmail ? `Email ${businessName ?? 'lead'}` : 'Open in mail client'}
            <ExternalLink className="ml-1.5 h-3 w-3" />
          </Button>
        </a>
      </div>
      {!contactEmail ? (
        <p className="text-xs text-muted-foreground">
          No email on file for this lead. The button above will open your mail client with the
          message pre-filled so you can paste a verified address.
        </p>
      ) : null}
    </div>
  )
}

function CallPane({
  kit,
  contactPhone,
}: {
  kit: OutreachKit
  contactPhone: string | null
}) {
  const fullScript = useMemo(() => {
    const bullets = kit.call.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')
    return [
      kit.call.opener,
      '',
      'Key points:',
      bullets,
      '',
      `If objection: ${kit.call.objectionResponse}`,
      '',
      kit.call.closing,
    ].join('\n')
  }, [kit.call])

  return (
    <div className="space-y-5">
      <ScriptBlock title="Opener" text={kit.call.opener} />
      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Key points
        </div>
        <ul className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
          {kit.call.keyPoints.map((p, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <ScriptBlock title="If they push back" text={kit.call.objectionResponse} muted />
      <ScriptBlock title="Closing" text={kit.call.closing} />

      <div className="flex flex-wrap items-center gap-2">
        <CopyButton text={fullScript} label="Copy full script" />
        {contactPhone ? (
          <a href={`tel:${contactPhone.replace(/\s+/g, '')}`}>
            <Button size="sm" className="bg-violet-600 text-white hover:bg-violet-700">
              <Phone className="mr-2 h-3.5 w-3.5" />
              Call {contactPhone}
            </Button>
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">
            No phone on file for this lead.
          </span>
        )}
      </div>
    </div>
  )
}

function ScriptBlock({
  title,
  text,
  muted,
}: {
  title: string
  text: string
  muted?: boolean
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <div
        className={`rounded-lg border p-4 text-sm leading-relaxed ${
          muted ? 'border-dashed bg-muted/20 text-muted-foreground' : 'bg-muted/30'
        }`}
      >
        {text}
      </div>
    </div>
  )
}

function WhatsAppPane({
  kit,
  contactPhone,
}: {
  kit: OutreachKit
  contactPhone: string | null
}) {
  const [message, setMessage] = useState(kit.whatsapp)

  useEffect(() => {
    setMessage(kit.whatsapp)
  }, [kit.whatsapp])

  const waHref = useMemo(() => {
    const digits = (contactPhone ?? '').replace(/[^0-9]/g, '')
    const base = digits ? `https://wa.me/${digits}` : 'https://wa.me/'
    return `${base}?text=${encodeURIComponent(message)}`
  }, [contactPhone, message])

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Message ({message.length} chars)
        </Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={7}
          className="text-sm leading-relaxed"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <CopyButton text={message} label="Copy message" />
        <a href={waHref} target="_blank" rel="noreferrer">
          <Button size="sm" className="bg-[#25D366] text-white hover:bg-[#1faa55]">
            <MessageCircle className="mr-2 h-3.5 w-3.5" />
            {contactPhone ? `WhatsApp ${contactPhone}` : 'Open WhatsApp'}
            <ExternalLink className="ml-1.5 h-3 w-3" />
          </Button>
        </a>
      </div>
      {!contactPhone ? (
        <p className="text-xs text-muted-foreground">
          No phone on file. WhatsApp will open the web app so you can paste a number manually.
        </p>
      ) : null}
    </div>
  )
}
