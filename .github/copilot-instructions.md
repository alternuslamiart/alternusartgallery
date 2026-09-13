# Copilot instructions for Cedium Art Gallery / Alternus Platform

## Repository overview

This repository is a Next.js 14 App Router application with a React + TypeScript frontend and a Prisma/PostgreSQL backend. The main app lives under `src/` and covers both the public marketplace and the newer platform/workspace surfaces.

There is also a separate Python desktop utility under `altrenus-business-manager/`; it is not part of the Next.js app build or lint/test flow.

Key folders:
- `src/app`: routes, pages, and App Router handlers
- `src/components`: reusable UI components
- `src/lib`: auth, Prisma client, shared server utilities, and platform contracts
- `src/lib/platform`: workspace API helpers (`api.ts`, `validation.ts`, `storage.ts`, `stub-provider.ts`)
- `prisma/schema.prisma`: source of truth for DB schema
- `tests/`: application-level validation tests (Node built-in runner)
- `docs/`: backend/platform and Blender-specific docs

## Build, lint, typecheck, and tests

Run from the repository root:

```bash
npm install
npx prisma generate
npx prisma db push      # initialize or sync a local database
npm run dev
npm run build           # runs prisma generate && next build
npm run start
npm run lint
npm run typecheck
npm test
```

Single-test patterns:

```bash
node --test tests/platform-validation.test.mjs
node --test --test-name-pattern="sanitizeName" tests/platform-validation.test.mjs
```

Notes:
- `npm run build` runs Prisma generation before `next build`, but `next.config.mjs` ignores ESLint failures during build; keep `npm run lint` as a separate check.
- `npm run typecheck` runs `tsc --noEmit`.
- The app expects PostgreSQL settings like `DATABASE_URL` and `DIRECT_URL`. Use `.env.example` as a starting point and keep only the services needed for the feature you are working on.

## High-level architecture

The app has two related backend surfaces:
- Public marketplace: storefront, customer/account, artist, checkout/order, uploads, AI chat, admin, and legacy APIs
- Platform/workspace: projects, prototypes, assets, jobs, prompts, settings, help, notifications, assistant features

The shared backend contract is:
- App Router route handlers live under `src/app/api/**/route.ts`
- Server-side shared logic lives in `src/lib/`
- Workspace routes rely on helpers in `src/lib/platform/`
- UI components live in `src/components/`

Important repo conventions:
- `src/lib/prisma.ts` owns the singleton Prisma client; do not create a new `PrismaClient` in handlers.
- `src/lib/auth.ts` configures NextAuth and the app’s server-side auth helpers.
- `requirePlatformContext()` in `src/lib/platform/api.ts` is the entry point for workspace APIs; it creates the user’s personal workspace, membership, subscription state, settings, and defaults if missing.
- `apiError()`, `ok()`, `mapUnknownError()`, and `ValidationError` are the standard response/error shapes in platform routes.
- `parseListQuery()` and `sortToOrderBy()` are used for list endpoints instead of accepting arbitrary sort/query strings.

## Key conventions that matter in this repo

- Route handlers are explicit HTTP method exports (`GET`, `POST`, `PATCH`, `DELETE`) and often set `dynamic = "force-dynamic"` or `runtime = "nodejs"` when touching Prisma/filesystem/auth.
- Keep platform error payloads stable: `{ error: { code, message, details } }`.
- Scope workspace queries by `context.workspaceId` and verify ownership before delete/download/preview/update operations.
- Use `src/lib/platform/validation.ts` for request parsing and safety checks (`asString`, `asEnum`, `asJsonArray`, `asJsonObject`, `parseListQuery`, `sanitizeName`, `assertSafePath`).
- Preserve asset safety rules: reject traversal, unsafe extensions, unsupported MIME types, and oversized uploads. Do not write uploads into source directories.
- For AI/CAD/Blender/rendering/payment flows, prefer the local stub behavior documented in `docs/backend-platform.md`; do not describe real provider calls unless the route is intentionally integrated.
- Activity and notification records are part of meaningful workspace mutations; reuse `logActivity()` and `createNotification()` when appropriate.
- Keep database and secrets on the server; browser code should call API routes rather than importing server integration code.
- Prefer `@/*` imports from `src/*` and keep components/class names in the repo’s existing conventions.

## When a change touches the backend or schema

- Update `prisma/schema.prisma` before depending on new persisted fields or relations.
- Regenerate the Prisma client after schema changes.
- Update the matching docs in `docs/` or `README.md` when changing platform APIs, storage rules, stub-provider behavior, environment variables, or Blender integration.
- Keep `docs/backend-platform.md` aligned with implementation details and `docs/blender-addon.md` aligned with the relevant `/api/blender/*` contract.

## Relevant docs

- `README.md`: install/setup and environment-variable guidance
- `docs/backend-platform.md`: workspace API architecture and local stub-provider behavior
- `docs/blender-addon.md`: Blender API contract expectations
- `DATABASE_SCHEMA.md`: supplementary schema reference (can lag behind Prisma)

## MCP server guidance

This repository is a Next.js web app with Prisma/PostgreSQL and browser-driven flows. If additional MCP tooling is desired, the most relevant options are browser-testing support (for example Playwright) and a database helper for Prisma/Postgres introspection. Keep the setup focused on the web app rather than broad, unrelated toolchains.
