'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Mail, Lock, Loader2, User, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { SunMedium } from 'lucide-react'

export function LoginForm({ googleConfigured = false }: { googleConfigured?: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  const handleCredentials = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      if (mode === 'signup') {
        const res = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          toast.error(data?.error ?? 'Unable to create account')
          setLoading(false)
          return
        }
      }
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (result?.error) {
        toast.error('Invalid email or password')
        setLoading(false)
        return
      }
      toast.success(mode === 'signup' ? 'Account created!' : 'Welcome back!')
      router.replace('/dashboard')
    } catch (err: any) {
      console.error(err)
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    if (!googleConfigured) {
      toast.error('Google sign-in is not configured yet. Please use email / password or ask the administrator.')
      return
    }
    setGoogleLoading(true)
    signIn('google', { redirect: true, callbackUrl: '/dashboard' })
  }

  return (
    <Card className="mx-auto w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1">
        <Link href="/" className="mb-4 inline-flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
            <SunMedium className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Solar<span className="text-amber-500">Scout</span> Pro
          </span>
        </Link>
        <CardTitle className="font-display text-2xl">
          {mode === 'signin' ? 'Sign in' : 'Create your account'}
        </CardTitle>
        <CardDescription>
          {mode === 'signin'
            ? 'Sign in to generate and manage your solar leads.'
            : 'Start scouting commercial rooftops in seconds.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
        >
          {googleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          Continue with Google
        </Button>

        {!googleConfigured ? (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              Google SSO requires a Client ID &amp; Secret to be added by the administrator. You can still sign in
              with email and password below.
            </span>
          </div>
        ) : null}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or with email</span>
          </div>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'signin' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="mt-4">
            <form onSubmit={handleCredentials} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-amber-500 text-white hover:bg-amber-600" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign in
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup" className="mt-4">
            <form onSubmit={handleCredentials} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Cooper"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-amber-500 text-white hover:bg-amber-600" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to use this tool only on data you are authorised to process.
        </p>
      </CardContent>
    </Card>
  )
}
