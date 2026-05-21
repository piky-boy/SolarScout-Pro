import Link from 'next/link'
import { ArrowRight, Network } from 'lucide-react'
import type { RelatedCluster } from '@/lib/intent-types'

interface IntentRelatedClustersProps {
  clusters: RelatedCluster[]
}

export function IntentRelatedClusters({ clusters }: IntentRelatedClustersProps) {
  if (!clusters.length) return null

  return (
    <section className="border-t border-border/40 bg-muted/20 py-12">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <Network className="h-4 w-4 text-muted-foreground" />
          </div>
          <h2 className="font-display text-lg font-bold text-foreground">
            Explore Related Markets
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {clusters.map((cluster, i) => (
            <Link
              key={i}
              href={cluster.href}
              className="group flex items-start gap-3 rounded-lg border border-border/50 bg-background p-4 transition-all hover:border-amber-500/40 hover:shadow-sm"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  {cluster.title}
                </span>
                {cluster.teaser && (
                  <span className="text-xs text-muted-foreground">{cluster.teaser}</span>
                )}
              </div>
              <ArrowRight className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-500" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
