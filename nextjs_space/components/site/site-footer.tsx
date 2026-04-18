import Link from 'next/link'
import { SunMedium } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-muted/30">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-orange-500">
            <SunMedium className="h-4 w-4 text-white" />
          </div>
          <span className="font-display font-semibold text-foreground">
            Solar<span className="text-amber-500">Scout</span> Pro
          </span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/dashboard" className="transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/leads" className="transition-colors hover:text-foreground">
            Leads
          </Link>
        </nav>
      </div>
    </footer>
  )
}
