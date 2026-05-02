# Stripe — Local Development Guide

---

## Prerequisites

- Node 20+, `npm` installed
- Stripe CLI: `brew install stripe/stripe-cli/stripe`
- `.env` file in project root with Stripe keys

---

## 1. Get test API keys

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) and switch to **Test mode** (toggle in the top-right).
2. **Developers → API keys** → copy the `pk_test_…` and `sk_test_…` keys.
3. Set them in `.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 2. Create test products and prices

In **Test mode → Products → Add product**:

| Product | Price    | Billing    | Env var to set        |
|---------|----------|------------|-----------------------|
| Pro     | €49.00   | Monthly    | `STRIPE_PRICE_PRO`    |
| Agency  | €149.00  | Monthly    | `STRIPE_PRICE_AGENCY` |

Copy each `price_test_xxx` ID into `.env`.

---

## 3. Forward webhooks locally

```bash
# Authenticate once
stripe login

# Start the dev server (separate terminal)
npm run dev

# Forward Stripe events to localhost
stripe listen --forward-to localhost:3001/api/billing/webhook
```

The CLI will print:
```
> Ready! Your webhook signing secret is whsec_test_...
```

Copy that value to `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

Restart the dev server so it picks up the new secret.

---

## 4. Trigger test events

```bash
# Simulate a successful checkout
stripe trigger checkout.session.completed

# Simulate subscription renewal / upgrade
stripe trigger customer.subscription.updated

# Simulate cancellation
stripe trigger customer.subscription.deleted

# Simulate a failed invoice payment
stripe trigger invoice.payment_failed
```

Watch the terminal running `stripe listen` — it shows the event payload and the response your webhook returned.

---

## 5. Test the checkout flow end-to-end

1. Start `npm run dev` and log in at `localhost:3001`.
2. Go to `/pricing` and click **Upgrade to Pro**.
3. You will be redirected to the Stripe-hosted checkout page.
4. Use test card `4242 4242 4242 4242`, any future expiry, any CVC.
5. Complete payment → you land on `/dashboard?upgrade=success`.
6. The webhook fires → check your DB: `User.plan` should be `"pro"`.

### Useful test cards

| Card number          | Behaviour                          |
|----------------------|------------------------------------|
| `4242 4242 4242 4242`| Succeeds immediately               |
| `4000 0000 0000 0002`| Always declines                    |
| `4000 0025 0000 3155`| Requires 3D Secure authentication  |
| `4000 0000 0000 9995`| Insufficient funds                 |

Full list: [stripe.com/docs/testing](https://stripe.com/docs/testing)

---

## 6. Test the Customer Portal

1. After subscribing (step 5), click your avatar → **Manage billing**.
2. The portal opens at `billing.stripe.com/…`.
3. You can cancel, update the card, or change plan.

> If you see "No configuration found", configure the portal at  
> **Stripe Dashboard → Settings → Billing → Customer portal**.

---

## 7. Reset a test user's plan

Connect to MongoDB and run:

```js
db.User.updateOne(
  { email: "you@example.com" },
  {
    $set: {
      plan: "free",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
    }
  }
)
```

Or use Prisma Studio:

```bash
npx prisma studio
```

---

## 8. Going live

1. Switch to **Live mode** in Stripe Dashboard.
2. Replace test keys in Vercel env vars with live keys (`sk_live_…`, `pk_live_…`).
3. Create live products with the same prices → set `STRIPE_PRICE_PRO` / `STRIPE_PRICE_AGENCY`.
4. Add the production webhook endpoint:
   - URL: `https://www.solarscout-pro.com/api/billing/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copy the `whsec_live_…` signing secret → set `STRIPE_WEBHOOK_SECRET` in Vercel.
5. Deploy and test with a real card.
