import Link from 'next/link'
import {
  Building2,
  Warehouse,
  Factory,
  Store,
  Home,
  ShoppingCart,
  ShoppingBag,
  Truck,
  PackageOpen,
  Settings2,
  LayoutGrid,
  MapPin,
  Building,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { IntentSegment } from '@/lib/intent-types'

interface IntentSegmentsProps {
  segments: IntentSegment[]
  city?: string
}

const ICON_MAP: Record<string, React.ElementType> = {
  Building2,
  Warehouse,
  Factory,
  Store,
  Home,
  ShoppingCart,
  ShoppingBag,
  Truck,
  PackageOpen,
  Settings2,
  LayoutGrid,
  MapPin,
  Building,
}

function getIcon(name: string): React.ElementType {
  return ICON_MAP[name] ?? Building2
}

export function IntentSegments({ segments, city }: IntentSegmentsProps) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-10 text-center">
          <p className="font-display text-xs font-semibold uppercase tracking-widest text-amber-500">
            Building Types
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground">
            What you can find{city ? ` in ${city}` : ''}
          </h2>
          <p className="mt-3 text-muted-foreground">
            SolarScout Pro detects every commercial building category — from offices to warehouses.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {segments.map((seg) => {
            const Icon = getIcon(seg.icon)
            return (
              <Card
                key={seg.type}
                className="group border-border/60 transition-all hover:border-amber-500/40 hover:shadow-md"
              >
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-display font-semibold text-foreground">{seg.label}</span>
                  </div>

                  {seg.hook && (
                    <p className="text-sm leading-relaxed text-muted-foreground">{seg.hook}</p>
                  )}

                  {seg.stat && (
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                      {seg.stat}
                    </p>
                  )}

                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="mt-auto justify-start px-0 text-amber-600 hover:text-amber-700 dark:text-amber-400"
                  >
                    <Link href={seg.ctaHref}>
                      {seg.ctaLabel}
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
