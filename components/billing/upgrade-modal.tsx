'use client'

import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  reason?: 'scan_limit' | 'csv_export' | 'ai_outreach' | 'generic'
  currentPlan?: string
}

const REASON_COPY: Record<NonNullable<UpgradeModalProps['reason']>, { title: string; description: string }> = {
  scan_limit: {
    title: "You've used all your scans",
    description:
      "You've reached your monthly scan limit. Upgrade to Pro for 50 scans/month or Agency for unlimited scans.",
  },
  csv_export: {
    title: 'CSV export requires Pro',
    description:
      'Export your leads to CSV / Excel to work them in your CRM. Available on Pro and Agency plans.',
  },
  ai_outreach: {
    title: 'AI outreach requires Pro',
    description:
      'Unlock AI-generated email and WhatsApp outreach copy personalised to each lead. Available on Pro and Agency plans.',
  },
  generic: {
    title: 'Upgrade to unlock more',
    description:
      'This feature is available on paid plans. Upgrade now to unlock the full power of SolarScout Pro.',
  },
}

export function UpgradeModal({ open, onClose, reason = 'generic', currentPlan }: UpgradeModalProps) {
  const router = useRouter()

  function handleUpgrade() {
    onClose()
    router.push('/pricing')
  }

  const copy = REASON_COPY[reason]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
            <Zap className="h-6 w-6 text-amber-500" />
          </div>
          <DialogTitle className="text-xl">{copy.title}</DialogTitle>
          <DialogDescription className="mt-1">{copy.description}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-3">
          <Button
            className="w-full bg-amber-500 text-white hover:bg-amber-600"
            onClick={handleUpgrade}
          >
            View plans &amp; pricing
          </Button>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
