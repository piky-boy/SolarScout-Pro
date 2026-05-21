import type { SocialProofCluster } from '@/lib/intent-types'

interface IntentSocialProofProps {
  clusters: SocialProofCluster[]
}

export function IntentSocialProof({ clusters }: IntentSocialProofProps) {
  if (!clusters.length) return null

  return (
    <section className="border-y border-border/40 bg-gradient-to-r from-amber-500/5 via-transparent to-orange-500/5 py-10">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {clusters.map((cluster, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <span className="font-display text-3xl font-bold text-foreground md:text-4xl">
                {cluster.value}
              </span>
              <span className="mt-1 text-sm font-medium text-muted-foreground">
                {cluster.label}
              </span>
              {cluster.sub && (
                <span className="mt-0.5 text-xs text-muted-foreground/70">{cluster.sub}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
