# Stripe Billing — Documentation

This directory contains complete documentation for the SolarScout Pro Stripe billing integration.

---

## Files

| File | Description |
|------|-------------|
| [overview.md](./stripe/overview.md) | Architecture diagram, plan table, env vars, Prisma schema, setup checklist |
| [api-routes.md](./stripe/api-routes.md) | `/api/billing/checkout`, `/api/billing/portal`, plan-limit enforcement in generate + export |
| [webhook.md](./stripe/webhook.md) | Webhook security, all handled events, retry behaviour, request/response details |
| [events.md](./stripe/events.md) | Full event catalogue with field references, status mapping, and flow diagrams |
| [local-dev.md](./stripe/local-dev.md) | Step-by-step local testing guide, Stripe CLI, test cards, go-live checklist |

---

## Quick reference

### Webhook endpoint
```
POST https://www.solarscout-pro.com/api/billing/webhook
```

### Subscribed events
```
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
invoice.payment_failed
```

### Plans
```
free    →  €0     | 3 scans/mo  | 20 leads/scan
pro     →  €49    | 50 scans/mo | 100 leads/scan  | CSV + AI outreach
agency  →  €149   | unlimited   | 250 leads/scan  | CSV + AI outreach + 5 seats
```

### Key files
```
lib/stripe.ts                          ← Stripe client + PLANS
app/api/billing/checkout/route.ts      ← Create Checkout Session
app/api/billing/portal/route.ts        ← Open Customer Portal
app/api/billing/webhook/route.ts       ← Handle Stripe events
app/pricing/page.tsx                   ← /pricing page
components/billing/upgrade-modal.tsx   ← Upgrade prompt modal
```
