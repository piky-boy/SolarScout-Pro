'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Building2,
  Users,
  Globe,
  Target,
  Megaphone,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  SunMedium,
  LogOut,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

interface Props {
  userName: string
  surveyCompleted: boolean
}

type SurveyData = {
  companyName: string
  companyRole: string
  teamSize: string
  marketsOfInterest: string[]
  monthlyLeadGoal: string
  howDidYouHear: string
}

const TEAM_SIZES = ['Just me', '2–5', '6–20', '21–50', '50+']
const MARKETS = [
  { code: 'ES', label: 'Spain', flag: '🇪🇸' },
  { code: 'PT', label: 'Portugal', flag: '🇵🇹' },
  { code: 'RO', label: 'Romania', flag: '🇷🇴' },
  { code: 'AL', label: 'Albania', flag: '🇦🇱' },
  { code: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
]
const LEAD_GOALS = ['< 50 / month', '50–200 / month', '200–500 / month', '500+ / month', 'Not sure yet']
const REFERRAL_SOURCES = ['Google search', 'LinkedIn', 'Industry event', 'Colleague / referral', 'Solar trade publication', 'Other']

export function WaitlistClient({ userName, surveyCompleted: initialSurveyDone }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(initialSurveyDone ? -1 : 0) // -1 = pending screen
  const [submitting, setSubmitting] = useState(false)
  const [surveyDone, setSurveyDone] = useState(initialSurveyDone)
  const [data, setData] = useState<SurveyData>({
    companyName: '',
    companyRole: '',
    teamSize: '',
    marketsOfInterest: [],
    monthlyLeadGoal: '',
    howDidYouHear: '',
  })

  const totalSteps = 6

  const canAdvance = () => {
    switch (step) {
      case 0: return data.companyName.trim().length > 0
      case 1: return data.companyRole.trim().length > 0
      case 2: return data.teamSize.length > 0
      case 3: return data.marketsOfInterest.length > 0
      case 4: return data.monthlyLeadGoal.length > 0
      case 5: return data.howDidYouHear.length > 0
      default: return false
    }
  }

  const toggleMarket = (code: string) => {
    setData(prev => ({
      ...prev,
      marketsOfInterest: prev.marketsOfInterest.includes(code)
        ? prev.marketsOfInterest.filter(m => m !== code)
        : [...prev.marketsOfInterest, code],
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          marketsOfInterest: data.marketsOfInterest.join(', '),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setSurveyDone(true)
      setStep(-1)
      toast.success('Survey submitted! We\'ll review your application shortly.')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const next = () => {
    if (step === totalSteps - 1) {
      handleSubmit()
    } else {
      setStep(s => s + 1)
    }
  }

  // Pending approval screen
  if (step === -1 || surveyDone) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/40 px-4">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <SunMedium className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Solar<span className="text-amber-500">Scout</span> Pro</span>
        </div>

        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">You&apos;re on the waitlist!</h1>
            <p className="text-muted-foreground">
              Thanks, {userName}. Your survey has been submitted and our team is reviewing your application.
              You&apos;ll get access as soon as we verify your profile.
            </p>
            <div className="flex w-full flex-col gap-2 rounded-lg border bg-muted/50 p-4 text-left text-sm">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" /> Account created
              </div>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" /> Survey completed
              </div>
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" /> Pending admin approval
              </div>
            </div>
            <Button
              variant="ghost"
              className="mt-2 text-muted-foreground"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Survey flow
  const questions = [
    {
      icon: Building2,
      title: 'What\'s your company name?',
      subtitle: 'Help us understand your organization.',
      content: (
        <div className="space-y-2">
          <Label htmlFor="companyName">Company name</Label>
          <Input
            id="companyName"
            placeholder="e.g. SunPower Installations Ltd."
            value={data.companyName}
            onChange={e => setData(d => ({ ...d, companyName: e.target.value }))}
            autoFocus
          />
        </div>
      ),
    },
    {
      icon: Users,
      title: 'What\'s your role?',
      subtitle: 'So we can tailor your experience.',
      content: (
        <div className="space-y-2">
          <Label htmlFor="companyRole">Your role / title</Label>
          <Input
            id="companyRole"
            placeholder="e.g. Sales Director, CEO, Business Development"
            value={data.companyRole}
            onChange={e => setData(d => ({ ...d, companyRole: e.target.value }))}
            autoFocus
          />
        </div>
      ),
    },
    {
      icon: Users,
      title: 'How large is your sales team?',
      subtitle: 'This helps us right-size your plan.',
      content: (
        <div className="flex flex-wrap gap-2">
          {TEAM_SIZES.map(s => (
            <button
              key={s}
              onClick={() => setData(d => ({ ...d, teamSize: s }))}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                data.teamSize === s
                  ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border-border bg-card hover:border-amber-500/50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: Globe,
      title: 'Which markets interest you?',
      subtitle: 'Select all that apply.',
      content: (
        <div className="flex flex-wrap gap-2">
          {MARKETS.map(m => (
            <button
              key={m.code}
              onClick={() => toggleMarket(m.code)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                data.marketsOfInterest.includes(m.code)
                  ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border-border bg-card hover:border-amber-500/50'
              }`}
            >
              <span>{m.flag}</span> {m.label}
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: Target,
      title: 'Monthly lead generation goal?',
      subtitle: 'How many commercial leads do you aim to generate?',
      content: (
        <div className="flex flex-wrap gap-2">
          {LEAD_GOALS.map(g => (
            <button
              key={g}
              onClick={() => setData(d => ({ ...d, monthlyLeadGoal: g }))}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                data.monthlyLeadGoal === g
                  ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border-border bg-card hover:border-amber-500/50'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: Megaphone,
      title: 'How did you hear about us?',
      subtitle: 'Help us understand what\'s working.',
      content: (
        <div className="flex flex-wrap gap-2">
          {REFERRAL_SOURCES.map(s => (
            <button
              key={s}
              onClick={() => setData(d => ({ ...d, howDidYouHear: s }))}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                data.howDidYouHear === s
                  ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border-border bg-card hover:border-amber-500/50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      ),
    },
  ]

  const q = questions[step]
  const Icon = q.icon

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/40 px-4">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
          <SunMedium className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold tracking-tight">Solar<span className="text-amber-500">Scout</span> Pro</span>
      </div>

      <Card className="w-full max-w-lg shadow-xl">
        <CardContent className="p-8">
          {/* Progress bar */}
          <div className="mb-8 flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-amber-500' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                  <Icon className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{q.title}</h2>
                  <p className="text-sm text-muted-foreground">{q.subtitle}</p>
                </div>
              </div>

              {q.content}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>

            <span className="text-xs text-muted-foreground">
              {step + 1} of {totalSteps}
            </span>

            <Button
              onClick={next}
              disabled={!canAdvance() || submitting}
              className="gap-1 bg-amber-500 text-white hover:bg-amber-600"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : step === totalSteps - 1 ? (
                'Submit'
              ) : (
                <>
                  Next <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="link"
        className="mt-4 text-sm text-muted-foreground"
        onClick={() => signOut({ callbackUrl: '/login' })}
      >
        Sign out
      </Button>
    </div>
  )
}
