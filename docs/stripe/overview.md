# Stripe Billing — Overview

## Architecture

```
User clicks "Upgrade"
       │
       ▼
POST /api/billing/checkout        ← creates Stripe Checkout Session
       │
       ▼
Stripe-hosted payment page
       │
       ▼ (payment succeeds)
POST /api/billing/webhook         ← Stripe sends checkout.session.completed
       │
       ▼
prisma.user.update(plan, stripeSubscriptionId, …)
       │
       ▼
User redirected to /dashboard?upgrade=success
```

---

## Directory structure

```
lib/
  stripe.ts                         ← Stripe client + PLANS config + helpers

app/api/billing/
  checkout/route.ts                 ← POST — create Stripe Checkout session
  portal/route.ts                   ← POST — open Stripe Customer Portal
  webhook/route.ts                  ← POST — receive and process Stripe events

app/pricing/
  page.tsx                          ← /pricing SEO wrapper
  _components/pricing-client.tsx    ← Pricing cards + comparison table + FAQ

components/billing/
  upgrade-modal.tsx                 ← Modal shown when a plan limit is hit

prisma/schema.prisma                ← User model — billing fields added
```

---

## Plans

| Plan   | Price   | Scans/mo | Leads/scan | Proposals | CSV | AI Outreach | Seats |
|--------|---------|----------|------------|-----------|-----|-------------|-------|
| Free   | €0      | 3        | 20         | 3         | ✗   | ✗           | 1     |
| Pro    | €49/mo  | 50       | 100        | Unlimited | ✓   | ✓           | 1     |
| Agency | €149/mo | Unlimited| 250        | Unlimited | ✓   | ✓           | 5     |

Plans are defined in [`lib/stripe.ts`](../../lib/stripe.ts) as the `PLANS` constant.

---

## Environment variables

| Variable                           | Required | Description                              |
|------------------------------------|----------|------------------------------------------|
| `STRIPE_SECRET_KEY`                | Yes      | `sk_live_…` from Stripe dashboard        |
| `STRIPE_WEBHOOK_SECRET`            | Yes      | `whsec_…` from Stripe webhook endpoint   |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes    | `pk_live_…` (used client-side if needed) |
| `STRIPE_PRICE_PRO`                 | Yes      | `price_…` for the Pro monthly price      |
| `STRIPE_PRICE_AGENCY`              | Yes      | `price_…` for the Agency monthly price   |

All values are set in `.env` locally and must be pushed to Vercel:

```bash
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_PRICE_PRO production
vercel env add STRIPE_PRICE_AGENCY production
```

---

## Prisma User fields added

```prisma
stripeCustomerId       String?   @unique   // cus_xxx
stripePriceId          String?             // price_xxx (current price)
stripeSubscriptionId   String?             // sub_xxx
stripeCurrentPeriodEnd DateTime?           // UTC — when current billing period ends
plan                   String  @default("free")  // free | pro | agency
```

---

## Stripe Dashboard setup checklist

- [ ] Create **Pro** product → recurring monthly price of €49 → copy `price_xxx` → set `STRIPE_PRICE_PRO`
- [ ] Create **Agency** product → recurring monthly price of €149 → copy `price_xxx` → set `STRIPE_PRICE_AGENCY`
- [ ] Webhook endpoint: `https://www.solarscout-pro.com/api/billing/webhook`
  - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [ ] Customer Portal: enable at **stripe.com/settings/billing/portal** — allow cancellation and plan changes
- [ ] (Optional) Add promotion codes in Stripe Products tab
