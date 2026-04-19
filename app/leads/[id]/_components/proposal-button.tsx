'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FileText, Loader2, Download } from 'lucide-react'
import { toast } from 'sonner'
import {
  SUPPORTED_LANGUAGES,
  defaultLanguageForCountry,
  type OutreachLanguage,
} from '@/lib/outreach'

export interface ProposalButtonProps {
  leadId: string
  businessName: string | null
  country?: string | null
  defaultSenderName?: string | null
  defaultSenderEmail?: string | null
}

export function ProposalButton({
  leadId,
  businessName,
  country,
  defaultSenderName,
  defaultSenderEmail,
}: ProposalButtonProps) {
  const [open, setOpen] = useState(false)
  const [senderName, setSenderName] = useState(defaultSenderName || '')
  const [senderCompany, setSenderCompany] = useState('')
  const [senderEmail, setSenderEmail] = useState(defaultSenderEmail || '')
  const [senderPhone, setSenderPhone] = useState('')
  // Default to the country's native language; the user can override via the dropdown.
  const [language, setLanguage] = useState<OutreachLanguage>(
    defaultLanguageForCountry(country || null),
  )
  const [busy, setBusy] = useState(false)

  // Hydrate preferences from localStorage only on the client, after mount.
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('solarscout:senderName')
      const savedCompany = localStorage.getItem('solarscout:senderCompany')
      const savedEmail = localStorage.getItem('solarscout:senderEmail')
      const savedPhone = localStorage.getItem('solarscout:senderPhone')
      if (savedName && !senderName) setSenderName(savedName)
      if (savedCompany) setSenderCompany(savedCompany)
      if (savedEmail && !senderEmail) setSenderEmail(savedEmail)
      if (savedPhone) setSenderPhone(savedPhone)
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function download() {
    if (!senderName.trim() || !senderCompany.trim()) {
      toast.error('Please fill your name and company')
      return
    }
    setBusy(true)
    try {
      // Persist for next time
      try {
        localStorage.setItem('solarscout:senderName', senderName)
        localStorage.setItem('solarscout:senderCompany', senderCompany)
        localStorage.setItem('solarscout:senderEmail', senderEmail)
        localStorage.setItem('solarscout:senderPhone', senderPhone)
      } catch {}

      toast.info('Building your proposal PDF...', {
        description: 'This takes ~10 seconds on average.',
      })
      const res = await fetch(`/api/leads/${leadId}/proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName,
          senderCompany,
          senderEmail,
          senderPhone,
          language,
        }),
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `Failed: ${res.status}`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const safeName = (businessName || 'proposal')
        .replace(/[^a-z0-9]+/gi, '-')
        .toLowerCase()
        .slice(0, 60)
      a.download = `SolarScout-proposal-${safeName}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Proposal downloaded')
      setOpen(false)
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || 'Could not generate proposal')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Download proposal PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Branded proposal — 2 pages</DialogTitle>
          <DialogDescription>
            A ready-to-send PDF with your branding, the rooftop satellite view and the full
            business case. The proposal language defaults to the lead’s country — change it here
            if needed. Your details are saved locally for next time.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Proposal language</Label>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Your name *</Label>
              <Input
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Maria Garcia"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Company *</Label>
              <Input
                value={senderCompany}
                onChange={(e) => setSenderCompany(e.target.value)}
                placeholder="SolarPower Iberia"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="+34 600 000 000"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => void download()} disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
