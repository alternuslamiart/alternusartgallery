# Alternusart functional audit — 2026-10-22

Result: **partial pass**, not a complete end-to-end certification.

| Check | Observed result |
| --- | --- |
| Local automated suite | 108 passed, 0 failed/skipped |
| TypeScript | Passed |
| Baseline build | Passed using Windows trusted CA bundle |
| Full lint | Failed: 57 pre-existing unused-variable errors |
| Production HTTP | 73 URLs: 68 HTTP 200, 4 expected private API 401, 1 HTTP 404 |
| Production Chrome | 11 routes opened; 10 without uncaught runtime errors, `/workspace/code` failed |
| Local DB read-only verifier | `DATABASE_URL: INVALID_URL; check password URL encoding` |

## Confirmed issues, in priority order

1. **3D providers unavailable:** production GET `/api/ai3d/providers` returns
   `{"providers":[]}`. Configure a provider and verify generation/import/recovery.
2. **Payments incomplete in source:** `src/lib/paypal.ts` returns mock order
   and capture identifiers; webhook verification simply returns `true`.
   Replace stubs and audit their callers before enabling paid entitlements.
   No payment or webhook request was made in this audit.
3. **Code workspace rendering:** production `/workspace/code` reproducibly
   raises React #418/#423 errors and shows broken `"color:#4284FF">` sample
   code fragments. Inspect syntax-highlighting markup and hydration.
4. **Help Center missing:** `/help-center` returns 404; its source calls
   `notFound()`. Implement or redirect it and check incoming links.
5. **Local DB verifier blocked:** URL parsing fails before connecting. This
   does not establish a production database outage. Signed-in usage, quotas,
   plan assignment and PostgreSQL concurrency still need live verification.
6. **Lint:** 57 existing errors across aicode, archplan, API seed, studio
   components, email and PayPal, among others. Build skips lint, so a passing
   build does not imply a passing lint check.

## Coverage and limitations

Real production Chrome (1440px, signed out, no mocked HTTP) loaded `/`,
`/pricing`, `/download`, `/login`, `/signup`, `/aichat`, `/account?section=usage`,
`/casynus`, `/interior`, `/infrastructure`, and `/workspace/code`.
No document-level horizontal overflow appeared. Architecture/Infrastructure
mounted canvases; Interior showed its drafting UI. Canvas presence does not
verify every editor action. Usage correctly requested sign-in.

Usage, subscription, studio-projects and chat-session GET APIs returned 401
without authentication. Auth session returned null; Google/GitHub/Discord/
credentials provider definitions were exposed. This does not verify OAuth
completion, email delivery or password reset. HTTP 200 means route availability,
not complete feature success.

Not exercised: real signed-in storage/isolation, paid AI calls, quota/refund
cycles, purchases, desktop installation, physical microphone, or exhaustive
production editor/import/export actions. No customer records or paid jobs
were created. The local tests use mocks where their existing suites specify.

## Evidence

Local ignored artifacts: `.tmp/audit-tests.log`, `.tmp/audit-typecheck.log`,
`.tmp/audit-lint.log`, `.tmp/audit-build.log`, `.tmp/site-http-audit.json`,
`.tmp/production-browser-audit.json`, `.tmp/production-code-audit.json`.
The final Homepage-marquee build initially failed with `ENOSPC`; only QA-created
temporary Chrome profiles were cleaned up before retrying.
The retry passed with the Windows trusted CA bundle; no TLS verification was
disabled. The new Homepage strip also passed dedicated animation, pause,
reduced-motion, icon and responsive checks, focused lint and TypeScript.
