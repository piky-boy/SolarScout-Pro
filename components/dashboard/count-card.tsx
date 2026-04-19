'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { LucideIcon } from 'lucide-react'

interface CountCardProps {
  icon: LucideIcon
  label: string
  value: number
  suffix?: string
  accent?: 'amber' | 'sky' | 'emerald' | 'rose'
}

const accentColors: Record<string, string> = {
  amber: 'bg-amber-500/10 text-amber-600',
  sky: 'bg-sky-500/10 text-sky-600',
  emerald: 'bg-emerald-500/10 text-emerald-600',
  rose: 'bg-rose-500/10 text-rose-600',
}

export function CountCard({ icon: Icon, label, value, suffix, accent = 'amber' }: CountCardProps) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start = 0
    const end = Math.max(0, Math.floor(value ?? 0))
    if (end === 0) {
      setDisplay(0)
      return
    }
    const duration = 700
    const startTs = performance.now()
    let raf = 0
    const step = (now: number) => {
      const p = Math.min(1, (now - startTs) / duration)
      const current = Math.floor(start + (end - start) * (1 - Math.pow(1 - p, 3)))
      setDisplay(current)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])

  return (
    <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex items-center gap-3 p-5">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${accentColors[accent] ?? accentColors.amber}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="font-display text-2xl font-bold tracking-tight">
            {display.toLocaleString()}
            {suffix ? <span className="ml-1 text-sm font-semibold text-muted-foreground">{suffix}</span> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
