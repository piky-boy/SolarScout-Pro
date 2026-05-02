'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Zap, Building2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { PLANS, type Plan } from '@/lib/stripe'

const PLAN_ICONS = {
  free: Zap,
  pro: Sparkles,
  agency: Building2,
}

const FEATURE_ROWS: { label: string; free: string | boolean; pro: string | boolean; agency: string | boolean }[] = [
  { label: 'Scans per month', free: '3', pro: '50', agency: 'Unlimited' },
  { label: 'Leads per scan', free: '20', pro: '100', agency: '250' },
  { label: 'AI proposals (PDF)', free: '3 / month', pro: 'Unlimited', agency: 'Unlimited' },
  { label: 'AI outreach copy', free: false, pro: true, agency: true },
  { label: 'CSV / Excel export', free: false, pro: true, agency: true },
  { label: 'WhatsApp & email scripts', free: false, pro: true, agency: true },
  { label: 'Team seats', free: '1', pro: '1', agency: '5' },
  { label: 'Priority support', free: false, pro: false, agency: true },
  { label: 'Custom branding', free: false, pro: false, agency: true },
]

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="mx-auto h-4 w-4 text-green-500" />
  if (value === false) return <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
  return <span className="text-sm font-medium">{value}</span>
}

export function PricingClient() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleUpgrade(plan: Plan) {
    if (plan.id === 'free') {
      router.push('/login')
      return
    }

    setLoading(plan.id)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (res.status === 401) {
        router.push('/login?next=/pricing')
      } else {
        console.error('Checkout error:', data)
      }
    } catch (e) {
      console.error('Checkout error:', e)
    } finally {
      setLoading(null)
    }
  }

  const plans = Object.values(PLANS)

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 pb-16 pt-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(43_95%_55%/0.12),transparent_60%)]" />
        <div className="mx-auto max-w-[700px] px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Zap className="h-3.5 w-3.5" />
            Simple pricing
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Start free.{' '}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Scale when ready.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-[480px] text-muted-foreground">
            No long-term contracts. No setup fees. Cancel any time. All plans include satellite imagery
            and AI-powered solar analysis.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="mx-auto max-w-[1100px] px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const Icon = PLAN_ICONS[plan.id]
            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative flex flex-col transition-shadow',
                  plan.highlighted
                    ? 'border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : '',
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <Badge className="bg-amber-500 text-white shadow-sm">Most popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-4 pt-8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                      <Icon className="h-5 w-5 text-amber-500" />
                    </span>
                    <div>
                      <CardTitle className="font-display text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.tagline}</CardDescription>
                    </div>
                  </div>
                  <div className="mt-5">
                    {plan.monthlyPrice === 0 ? (
                      <span className="font-display text-4xl font-extrabold">Free</span>
                    ) : (
                      <>
                        <span className="font-display text-4xl font-extrabold">
                          €{plan.monthlyPrice}
                        </span>
                        <span className="ml-1 text-sm text-muted-foreground">/ month</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-6">
                  <Button
                    size="lg"
                    className={cn(
                      'w-full',
                      plan.highlighted
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : '',
                    )}
                    variant={plan.highlighted ? 'default' : 'outline'}
                    disabled={loading !== null}
                    onClick={() => handleUpgrade(plan)}
                  >
                    {loading === plan.id
                      ? 'Redirecting…'
                      : plan.monthlyPrice === 0
                      ? 'Get started free'
                      : `Upgrade to ${plan.name}`}
                  </Button>

                  {/* Feature list */}
                  <ul className="space-y-3">
                    {[
                      `${plan.scansPerMonth === -1 ? 'Unlimited' : plan.scansPerMonth} scans / month`,
                      `${plan.leadsPerScan} leads per scan`,
                      `${plan.proposalsPerMonth === -1 ? 'Unlimited' : plan.proposalsPerMonth} proposals / month`,
                      ...(plan.aiOutreach ? ['AI outreach copy'] : []),
                      ...(plan.csvExport ? ['CSV / Excel export'] : []),
                      `${plan.teamSeats} team seat${plan.teamSeats > 1 ? 's' : ''}`,
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <Check className="h-4 w-4 shrink-0 text-green-500" />
                        {f}
                      </li>
                    ))}
                    {!plan.aiOutreach && (
                      <li className="flex items-center gap-2.5 text-sm text-muted-foreground/60">
                        <X className="h-4 w-4 shrink-0" />
                        AI outreach copy
                      </li>
                    )}
                    {!plan.csvExport && (
                      <li className="flex items-center gap-2.5 text-sm text-muted-foreground/60">
                        <X className="h-4 w-4 shrink-0" />
                        CSV / Excel export
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Comparison table */}
        <div className="mt-20">
          <h2 className="mb-8 text-center font-display text-2xl font-bold">Full feature comparison</h2>
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-semibold">Feature</th>
                  {plans.map((p) => (
                    <th key={p.id} className="px-4 py-3 text-center font-semibold">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_ROWS.map((row, i) => (
                  <tr
                    key={row.label}
                    className={cn('border-b last:border-0', i % 2 === 0 ? '' : 'bg-muted/20')}
                  >
                    <td className="px-4 py-3 font-medium text-muted-foreground">{row.label}</td>
                    <td className="px-4 py-3 text-center">
                      <FeatureValue value={row.free} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <FeatureValue value={row.pro} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <FeatureValue value={row.agency} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-20 max-w-[640px] space-y-6">
          <h2 className="text-center font-display text-2xl font-bold">Frequently asked questions</h2>
          {[
            {
              q: 'Can I cancel at any time?',
              a: 'Yes. Cancel with one click from the billing portal — no forms, no emails. Your access continues until the end of the billing period.',
            },
            {
              q: 'What payment methods are accepted?',
              a: 'All major credit and debit cards (Visa, Mastercard, Amex) via Stripe. 100 % secure — we never see your card details.',
            },
            {
              q: 'What happens when I hit my scan limit?',
              a: 'You will see a friendly prompt with an upgrade link. Your existing leads remain fully accessible.',
            },
            {
              q: 'Do you offer annual billing?',
              a: 'Coming soon — with a 2-month discount. Sign up for the waitlist and we will notify you.',
            },
            {
              q: 'Do you offer refunds?',
              a: 'We offer a 7-day money-back guarantee on first purchase. Contact support within 7 days of your first charge.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-xl border p-5">
              <p className="font-semibold">{q}</p>
              <p className="mt-2 text-sm text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
