# Real AI usage and plan limits

Implemented locally on 2026-10-22; not yet deployed or verified against a live
authenticated database/provider session.

## Policy

The existing Basic allowance of 200 is the monthly credit baseline. Pro has
800 (4x), Team/Teams 2,000 (10x), and Studio 4,000 (20x). These are application
credits, not provider tokens, elapsed editor time, or money. Each successful
Gemini/Groq/You chat response costs 1 credit. A valid native scene proposal
costs 1 credit. A submitted Meshy/Tripo generation costs 20 credits, including
Meshy preview/refinement. Polling, downloads, Apply/Undo, voice dictation and
manual editing cost no additional credits. Stub APIs are not provider usage.

Allowances reset at 00:00 UTC on the first day of the calendar month,
independently of monthly/yearly subscription billing. Plan changes use the same
month's consumption; changing plans does not reset usage. Downgrading below
consumption blocks further requests; the displayed actual percentage may exceed
100%, while the visual bar stops at 100%.

## Storage and enforcement

`src/lib/platform/ai-usage.mjs` reuses existing Prisma `RateLimitBucket` rows,
under the `ai-usage:v1:<workspaceId>:` namespace. Monthly and daily/feature
counters persist in PostgreSQL. A transaction upserts the monthly row, claims
credits with a conditional atomic increment, and increments the daily counter.
This avoids read-then-write quota races across server instances. No new usage
table is required. The month is part of the key, so a new month starts at zero;
older daily rows remain available for the 90-day chart. Any future rate-limit
cleanup must preserve these usage rows for at least 90 days; `resetAt` on these
rows indicates the allowance boundary, not a safe deletion date.

`SubscriptionState.plan` is authoritative. ACTIVE/TRIALING subscriptions use
their plan; missing/inactive subscriptions and legacy TRIAL/FREE map to Basic.
The request cannot select a plan, cost, customer or workspace. All provider
requests require a signed-in user and the existing authenticated workspace
context, including chat requests without a cloud conversation ID. Unavailable
quota storage returns 503 before a provider call; exhaustion returns 429 with
the renewal date and Retry-After. Cloud conversation save failures still return
the generated answer when quota was successfully reserved first.

Failed chat/scene requests refund their reservation in `finally`. Creating a
3D job that fails before submission refunds its reservation. Once a job record
is persisted and submission attempted, its credits remain consumed even on
provider rejection, ambiguous network failures or later generation failure;
paid provider work may already have started. Existing job request IDs prevent
duplicate provider submission and double charging on retry; refinement/polling
does not reserve again. A process termination or failed database refund can
leave reserved credits consumed; refund failures are logged for operator
reconciliation. This implementation has counters rather than a per-request
billing ledger or automatic crash reconciliation.

## Account and API

`GET /api/usage?days=7|15|30|90` returns the authenticated workspace's plan,
monthly used/limit/remaining/percent, UTC renewal date and daily history with
private/no-store cache headers. `/account` Usage, Limits and Subscriptions use
the same real data. The UI refreshes on window focus, every 30 seconds, and on
Refresh; it cancels stale requests and hides another identity's result. Empty
history shows zero, never generated demo values. Warnings appear at 80% and
100%. Pricing displays each plan's monthly allowance.

## Activation

1. Apply `docs/sql/20261022-ai-usage-plans.sql` to the deployment PostgreSQL
   database before activating Basic/Studio subscriptions. This is an additive
   enum update preserving TRIAL/FREE/PRO/TEAM. The repository has no existing
   Prisma migration history, so the SQL is supplied explicitly; do not use
   `migrate reset`. Review the target database before running it.
2. Generate Prisma Client and deploy the application through the normal flow.
   Prisma CLI now reads `DIRECT_URL` for schema operations and keeps
   `DATABASE_URL` for application traffic; when DIRECT_URL is absent it falls
   back to DATABASE_URL. On IPv4-only networks use the exact Supabase Session
   pooler URL from the project Connect panel (port 5432) for schema operations.
   Do not invent the pooler region/host. URL-encode special password characters.
3. Set verified subscriptions through a trusted operator/payment integration:
   `SubscriptionState.plan` = BASIC/PRO/TEAM/STUDIO and status ACTIVE. Keep
   `Workspace.plan` aligned. The public upgrade-intent API does not change a
   plan. Automatic billing/payment verification is still unconfigured; choosing
   a pricing card does not grant additional credits.
4. Verify a signed-in request and refresh, cross-workspace isolation, a rejected
   request at the cap, a refund, plan changes without resetting consumed credits,
   and UTC rollover on staging. No historical usage is backfilled: tracking
   starts when this application is deployed.

## Verification

- `npm test`: 105 passed, including Prisma direct/runtime connection routing,
  reservation arithmetic, weighted 3D,
  concurrent claims using a serialized fake transaction, workspace isolation,
  refunds, UTC rollover/history, auth/quota gating in the actual provider
  routes, and usage API scope/cache/range validation. Database/auth/provider
  adapters are mocked; live PostgreSQL concurrency has not been exercised.
- `npm run typecheck`: passed, including after Prisma Client regeneration.
- Focused `next lint` for changed application files: passed with one existing
  `@next/next/no-img-element` warning in account page line 98.
  Follow-up Prisma config and verification scripts lint passed without warnings.
- `git diff --check`: passed.
- `npm run build`: passed on follow-up with NODE_EXTRA_CA_CERTS pointing at
  `.tmp/windows-trusted-cas.pem`, exported from Windows CurrentUser/LocalMachine
  Root and CA stores. The earlier Google Fonts certificate failure was resolved
  for that process without disabling TLS verification. No global trust settings
  or product fonts were changed. Existing client-rendering warnings remain for
  account/login/reset-password. The generated CA file stays ignored under .tmp.
- `node scripts/verify-account-usage.mjs`: passed against the local production
  build at port 3003, using installed headless Chrome and mocked auth/usage HTTP.
  Checked Basic/Pro/Teams/Studio percentages for equal consumption, 7/15/30/90
  days, 80% warning, 100% cap, empty history, failed fetch clearing stale data,
  Retry recovery and signed-out visibility. No runtime exceptions. The light
  desktop screenshot was visually inspected; artifacts are in
  `.tmp/account-usage-1792672172903/`. This does not verify a real user session
  or provider/database interaction. The test's local server was stopped.
- `node scripts/verify-ai-usage-database.mjs`: blocked before querying by
  DATABASE_URL INVALID_URL. Both local .env values still require password URL
  encoding. Testing encoding in memory (without saving .env) produced valid
  PostgreSQL URLs, but Prisma could not reach either database host. DNS returned
  no IPv4 address (ENODATA) and one IPv6 address for each direct Supabase host.
  Obtain the project's exact IPv4-compatible Session pooler connection string.
  Credentials, hostnames and customer records were not logged or changed.
- Live database/provider behavior, SQL application and production deployment
  remain unverified. No database mutations or paid provider calls were made.

## Repeating live database verification

The opt-in verifier defaults to read-only and uses Prisma to inspect connectivity,
required usage tables and enum values without exposing connection credentials:

```powershell
node scripts/verify-ai-usage-database.mjs
```

Once both local URLs reach the intended database, this command applies only the
additive plan enum SQL and verifies usage with fresh temporary workspace UUIDs:

```powershell
node scripts/verify-ai-usage-database.mjs --apply-plan-enum --write-test-data
```

The write check creates no user account, changes no existing customer plan and
calls no provider. It tests all four allowances, concurrent Basic exhaustion,
percentages/history, workspace isolation, upgrade continuity, refund and UTC
rollover, then removes only its generated workspace/subscription/counter rows
in `finally`. Review the target connection before opting into writes. Do not
report the live checks as passed until this command succeeds.
