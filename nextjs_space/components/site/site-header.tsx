'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { SunMedium, LayoutDashboard, List, LogOut, LogIn } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function SiteHeader() {
  const { data: session, status } = useSession() ?? {}
  const pathname = usePathname() ?? '/'
  const router = useRouter()
  const isAuthed = status === 'authenticated'
  const user = session?.user

  const navLinks: { href: string; label: string; icon: any }[] = isAuthed
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/leads', label: 'Leads', icon: List },
      ]
    : [
        { href: '/#features', label: 'Features', icon: LayoutDashboard },
        { href: '/how-it-works', label: 'How it works', icon: List },
      ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={isAuthed ? '/dashboard' : '/'} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
            <SunMedium className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-base font-bold tracking-tight">
              Solar<span className="text-amber-500">Scout</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Pro</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full outline-none ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? 'User'} />
                    <AvatarFallback>
                      {(user?.name ?? user?.email ?? 'U').slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="truncate text-sm font-medium">{user?.name ?? 'Account'}</span>
                  <span className="truncate text-xs font-normal text-muted-foreground">{user?.email ?? ''}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/leads')}>
                  <List className="mr-2 h-4 w-4" /> My Leads
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              onClick={() => router.push('/login')}
              className="bg-amber-500 text-white hover:bg-amber-600"
            >
              <LogIn className="mr-1.5 h-4 w-4" /> Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
