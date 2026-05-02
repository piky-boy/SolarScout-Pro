# Stripe Events — Full Catalogue

> Events subscribed at: `https://www.solarscout-pro.com/api/billing/webhook`

---

## Subscribed events

### `checkout.session.completed`

| Field             | Value                                                    |
|-------------------|----------------------------------------------------------|
| **When fired**    | Stripe Checkout session payment succeeds                 |
| **Object type**   | `Stripe.Checkout.Session`                                |
| **Handled**       | Yes                                                      |
| **Side-effects**  | Updates `User.plan`, `stripeSubscriptionId`, `stripeCurrentPeriodEnd` |

**Key fields read:**
```
session.mode                 → must equal "subscription"
session.subscription         → used to fetch full Subscription object
session.customer             → stored as stripeCustomerId
subscription.metadata.userId → locates the User record
subscription.metadata.planId → "pro" or "agency"
subscription.current_period_end → stored as stripeCurrentPeriodEnd
subscription.items.data[0].price.id → stored as stripePriceId
```

---

### `customer.subscription.updated`

| Field             | Value                                                    |
|-------------------|----------------------------------------------------------|
| **When fired**    | Any change to a subscription (renewal, upgrade, cancel, pause) |
| **Object type**   | `Stripe.Subscription`                                    |
| **Handled**       | Yes                                                      |
| **Side-effects**  | Updates `User.plan`, `stripePriceId`, `stripeCurrentPeriodEnd`; reverts to `free` if not active/trialing |

**Subscription status values:**

| `status`      | Stored `plan`  | Notes                                              |
|---------------|----------------|----------------------------------------------------|
| `active`      | from metadata  | Normal paid state                                  |
| `trialing`    | from metadata  | Trial period (if configured)                       |
| `past_due`    | `free`         | Payment failed, Stripe still retrying              |
| `unpaid`      | `free`         | Stripe gave up retrying                            |
| `canceled`    | `free`         | Subscription ended                                 |
| `paused`      | `free`         | Paused by merchant (rare)                          |
| `incomplete`  | `free`         | Initial payment pending                            |

---

### `customer.subscription.deleted`

| Field             | Value                                                    |
|-------------------|----------------------------------------------------------|
| **When fired**    | Subscription reaches end of period after cancellation, or is deleted immediately |
| **Object type**   | `Stripe.Subscription`                                    |
| **Handled**       | Yes                                                      |
| **Side-effects**  | Nulls `stripeSubscriptionId`, `stripePriceId`, `stripeCurrentPeriodEnd`; sets `plan = "free"` |

---

### `invoice.payment_failed`

| Field             | Value                                                    |
|-------------------|----------------------------------------------------------|
| **When fired**    | A recurring invoice charge fails                         |
| **Object type**   | `Stripe.Invoice`                                         |
| **Handled**       | Partial (logs warning)                                   |
| **Side-effects**  | `console.warn` only — no DB change                       |

**Recommended enhancement:** send a transactional email with a link to update the payment method:
```ts
// Suggested implementation inside the invoice.payment_failed case:
const user = await prisma.user.findFirst({
  where: { stripeCustomerId: customerId },
  select: { email: true, name: true },
})
if (user?.email) {
  await sendPaymentFailedEmail(user.email, user.name)
}
```

---

## Unsubscribed events (acknowledged but ignored)

All other Stripe event types reach the `default:` branch and return `{ received: true }` immediately. Stripe requires this `200` response to stop retrying.

Common events that arrive but are not acted on:

| Event                        | Why not handled                                   |
|------------------------------|---------------------------------------------------|
| `payment_intent.succeeded`   | Covered by `checkout.session.completed`           |
| `invoice.paid`               | Covered by `customer.subscription.updated`        |
| `customer.created`           | Customer is created in `/api/billing/checkout`    |
| `charge.succeeded`           | Not needed — subscription state is the source of truth |
| `payment_method.attached`    | No action required                                |

---

## Event flow diagrams

### New subscription

```
Browser                     API                       Stripe                  Webhook
  │                          │                           │                       │
  ├─ POST /api/billing/checkout ──────────────────────►  │                       │
  │                          │◄── CheckoutSession.url ── │                       │
  │◄── { url } ──────────────│                           │                       │
  │                          │                           │                       │
  ├─ redirect to checkout.stripe.com ──────────────────► │                       │
  │                                                      │                       │
  │  (user enters card)                                  │                       │
  │                                                      │                       │
  │◄── redirect /dashboard?upgrade=success ────────────  │                       │
  │                                                      │                       │
  │                                                      ├─ checkout.session.completed ──► POST /webhook
  │                                                      │                       │  update User.plan
```

### Cancellation

```
Browser                     API                       Stripe                  Webhook
  │                          │                           │                       │
  ├─ POST /api/billing/portal ──────────────────────────►│                       │
  │                          │◄── Portal session URL ─── │                       │
  │◄── { url } ──────────────│                           │                       │
  │                          │                           │                       │
  ├─ redirect to billing.stripe.com ──────────────────── │                       │
  │                                                      │                       │
  │  (user cancels)                                      │                       │
  │◄── redirect /dashboard ─────────────────────────────  │                       │
  │                                                      │                       │
  │     (at period end)      ├─ customer.subscription.deleted ──────────────────► POST /webhook
  │                          │                           │  User.plan = "free"
```

### Failed payment

```
Stripe scheduler                                        Webhook
     │                                                    │
     ├─ charge attempt fails ──── invoice.payment_failed ►│
     │                                                    │  console.warn
     │                                                    │  (TODO: send email)
     │
     ├─ (after smart retries) ─── customer.subscription.updated (status: past_due / unpaid)
     │                                                    │  User.plan = "free"
```
