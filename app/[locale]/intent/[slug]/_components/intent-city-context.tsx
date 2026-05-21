import { MapPin } from 'lucide-react'

interface IntentCityContextProps {
  city: string
  copy: string
}

export function IntentCityContext({ city, copy }: IntentCityContextProps) {
  return (
    <section className="border-y border-border/40 bg-muted/40 py-8">
      <div className="mx-auto max-w-[820px] px-6">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
            <MapPin className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              About {city}
            </h2>
            <p className="mt-1 leading-relaxed text-muted-foreground">{copy}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
