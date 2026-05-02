# Stripe Webhook — Reference

**Endpoint:** `POST /api/billing/webhook`  
**File:** [`app/api/billing/webhook/route.ts`](../../app/api/billing/webhook/route.ts)

---

## Security

Every incoming request is verified using Stripe's HMAC-SHA256 signature before any business logic runs.

```ts
event = stripe.webhooks.constructEvent(
  body,            // raw text — NOT parsed JSON
  signature,       // from stripe-signature header
  process.env.STRIPE_WEBHOOK_SECRET,
)
```

If the signature is missing or invalid the handler returns `400` immediately.

> **Important:** the route reads the raw request body via `req.text()`.  
> Next.js App Router does not parse it automatically, so no special `bodyParser: false` config is needed beyond the route using `req.text()`.

---

## Handled events

### `checkout.session.completed`

Fired when a Stripe Checkout session finishes successfully.

**Trigger:** user completes payment on the Stripe-hosted checkout page.

**Action:**
1. Confirms `session.mode === 'subscription'` (ignores one-time payments).
2. Retrieves the full `Subscription` object to get `current_period_end` and metadata.
3. Writes to the database:

```ts
prisma.user.update({
  where: { id: userId },         // from subscription.metadata.userId
  data: {
    stripeCustomerId,
    stripeSubscriptionId,
    stripePriceId,
    stripeCurrentPeriodEnd,
    plan,                        // from subscription.metadata.planId
  },
})
```

**Metadata stored at checkout creation** (in `subscription_data.metadata`):
```json
{ "userId": "mongo-object-id", "planId": "pro" }
```

---

### `customer.subscription.updated`

Fired on any subscription change: plan upgrade/downgrade, renewal, pause, or cancellation scheduled.

**Action:**
1. Reads `userId` from `subscription.metadata`.
2. Checks `subscription.status`: only `active` or `trialing` keep a paid plan — any other status (e.g. `past_due`, `canceled`) resets to `free`.
3. Updates `plan`, `stripePriceId`, `stripeCurrentPeriodEnd`.

**Status → plan mapping:**

| Stripe status   | Stored plan |
|-----------------|-------------|
| `active`        | as metadata |
| `trialing`      | as metadata |
| `past_due`      | `free`      |
| `unpaid`        | `free`      |
| `canceled`      | `free`      |
| `paused`        | `free`      |

---

### `customer.subscription.deleted`

Fired when a subscription is fully cancelled (at end of period or immediately).

**Action:** nulls out `stripeSubscriptionId`, `stripePriceId`, `stripeCurrentPeriodEnd`, sets `plan = 'free'`.

---

### `invoice.payment_failed`

Fired when a recurring charge fails (expired card, insufficient funds, etc.).

**Current action:** logs a warning to the console.  
**Recommended next step:** send a transactional email via your email provider with a payment-update link.

---

## Unhandled events

All other event types return `{ received: true }` with `200` — Stripe requires a 2xx acknowledgement to stop retrying.

---

## Retry behaviour

Stripe retries failed webhook deliveries with exponential back-off:

| Attempt | Delay   |
|---------|---------|
| 1       | 5 min   |
| 2       | 30 min  |
| 3       | 2 hr    |
| 4       | 5 hr    |
| 5       | 10 hr   |

The handler is idempotent — re-processing the same `checkout.session.completed` event will simply overwrite the same fields with the same values.

---

## Local testing with Stripe CLI

```bash
# Install Stripe CLI (macOS)
brew install stripe/stripe-cli/stripe

# Authenticate
stripe login

# Forward events to your local dev server
stripe listen --forward-to localhost:3001/api/billing/webhook

# In a separate terminal — trigger a test event
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_failed
```

The CLI prints a `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`) — put it in `.env` for local testing.

---

## Viewing webhook logs

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click your endpoint → **Webhook attempts**
3. Each attempt shows the full payload, response body, and HTTP status code
