# Stripe API Routes — Reference

---

## POST `/api/billing/checkout`

**File:** [`app/api/billing/checkout/route.ts`](../../app/api/billing/checkout/route.ts)

Creates a Stripe Checkout Session and returns a redirect URL.

### Auth
Requires an active NextAuth session. Returns `401` if unauthenticated.

### Request body
```json
{ "planId": "pro" }
```

| Field    | Type   | Values              |
|----------|--------|---------------------|
| `planId` | string | `"pro"` \| `"agency"` |

### Response — success `200`
```json
{ "url": "https://checkout.stripe.com/pay/cs_live_..." }
```
Redirect the browser to this URL.

### Response — errors

| Status | Body                               | Reason                        |
|--------|------------------------------------|-------------------------------|
| `401`  | `{ "error": "Unauthenticated" }`   | No session                    |
| `400`  | `{ "error": "Invalid plan" }`      | planId has no stripePriceId   |
| `404`  | `{ "error": "User not found" }`    | Session user not in DB        |

### Customer creation logic
- If the user already has a `stripeCustomerId` in the DB it is reused.
- Otherwise a new `Customer` is created with `email`, `name`, and `metadata.userId`.

### Checkout session options
```ts
{
  mode: 'subscription',
  payment_method_types: ['card'],
  allow_promotion_codes: true,
  billing_address_collection: 'auto',
  success_url: '/dashboard?upgrade=success',
  cancel_url:  '/pricing?upgrade=cancelled',
  subscription_data: {
    metadata: { userId, planId }
  }
}
```

---

## POST `/api/billing/portal`

**File:** [`app/api/billing/portal/route.ts`](../../app/api/billing/portal/route.ts)

Opens the Stripe Customer Portal for the authenticated user (manage card, cancel, change plan).

### Auth
Requires an active NextAuth session. Returns `401` if unauthenticated.

### Request body
None.

### Response — success `200`
```json
{ "url": "https://billing.stripe.com/session/..." }
```

### Response — errors

| Status | Body                                      | Reason                     |
|--------|-------------------------------------------|----------------------------|
| `401`  | `{ "error": "Unauthenticated" }`          | No session                 |
| `404`  | `{ "error": "No billing account found" }` | User has no stripeCustomerId |

### Return URL
After the user closes the portal they are redirected to `/dashboard`.

> **Prerequisite:** the Customer Portal must be configured in the Stripe Dashboard at  
> **stripe.com/settings/billing/portal** before this endpoint will work.

---

## Plan limits enforced in existing routes

### `POST /api/leads/generate`

**File:** [`app/api/leads/generate/route.ts`](../../app/api/leads/generate/route.ts)

Two checks run after auth and before the actual search:

#### Monthly scan limit

```ts
const scansThisMonth = await prisma.searchHistory.count({
  where: { userId, createdAt: { gte: startOfCalendarMonth } },
})
if (scansThisMonth >= activePlan.scansPerMonth) {
  return 402 scan_limit_reached
}
```

| Plan   | `scansPerMonth` |
|--------|-----------------|
| free   | 3               |
| pro    | 50              |
| agency | -1 (unlimited)  |

#### Leads-per-scan cap

The `limit` parameter from the client is clamped to `activePlan.leadsPerScan`:

```ts
const limit = planLeadCap === -1 ? requestedLimit : Math.min(requestedLimit, planLeadCap)
```

#### 402 response shape
```json
{
  "error": "scan_limit_reached",
  "message": "You have used all 3 scans for this month on the Free plan.",
  "plan": "free",
  "limit": 3
}
```

The dashboard catches `status === 402` and opens the `<UpgradeModal reason="scan_limit" />`.

---

### `POST /api/leads/export`

**File:** [`app/api/leads/export/route.ts`](../../app/api/leads/export/route.ts)

CSV/XLSX export is gated to Pro and Agency:

```ts
if (!activePlan.csvExport) {
  return 402 upgrade_required
}
```

#### 402 response shape
```json
{
  "error": "upgrade_required",
  "message": "CSV export requires a Pro or Agency plan."
}
```

The dashboard catches `status === 402` and opens the `<UpgradeModal reason="csv_export" />`.
