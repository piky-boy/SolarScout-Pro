import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { LoginForm } from './_components/login-form'
import { SunMedium } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Sign in',
  description: 'Sign in to SolarScout Pro to generate and manage your solar leads.',
}

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session?.user) redirect('/dashboard')

  const googleConfigured =
    !!process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER' &&
    !!process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_SECRET !== 'YOUR_GOOGLE_CLIENT_SECRET_PLACEHOLDER'

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-amber-50 dark:to-amber-950/20">
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 items-center justify-center px-6 py-12">
        <div className="grid w-full gap-12 lg:grid-cols-[1fr,1.1fr] lg:items-center">
          <div className="hidden lg:block">
            <Link href="/" className="mb-10 inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
                <SunMedium className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-lg font-bold tracking-tight">
                  Solar<span className="text-amber-500">Scout</span> Pro
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Lead generation for solar
                </span>
              </div>
            </Link>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">
              Welcome back to <span className="text-amber-500">SolarScout</span>
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              Sign in to continue scouting commercial rooftops, residential blocks and BIPV balcony opportunities across Romania, Spain, Portugal, Albania and the United Kingdom.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {[
                'Satellite-powered building detection',
                'Automatic residential filtering',
                'CSV & Excel export built-in',
                'Unlimited searches on all supported markets',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <LoginForm googleConfigured={googleConfigured} />
        </div>
      </div>
    </div>
  )
}
