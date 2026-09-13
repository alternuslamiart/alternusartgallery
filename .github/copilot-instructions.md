# Copilot instructions for Alternus Art Gallery / Crystal Studio

## Project shape

This repository contains two applications:

- The primary application is a Next.js 14 App Router site in `src/`, using React 18, TypeScript, Tailwind CSS, NextAuth, Prisma, and PostgreSQL.
- `altrenus-business-manager/` is a separate Python desktop utility. Its dependencies are listed in `altrenus-business-manager/requirements.txt`; it is not part of the Next.js build.

The web app has two broad product areas. The public/customer and admin pages live under `src/app/**/page.tsx`, while the platform workspace (projects, assets, jobs, prompts, settings, help, and assistant features) is exposed through `src/app/api/**/route.ts` and consumed by workspace screens. Shared server integrations and policies belong in `src/lib/`; reusable UI belongs in `src/components/`. `prisma/schema.prisma` is the database source of truth; `DATABASE_SCHEMA.md` is supplementary documentation and can lag behind the Prisma schema.

## Commands

Run these from the repository root:

```bash
npm install
npx prisma generate
npx prisma db push             # initialize/synchronize a local database
npm run dev
npm run build                  # prisma generate, then next build
npm run start                  # serve a production build
npm run lint
npm run typecheck
npm test
```

The app needs a PostgreSQL `DATABASE_URL` and `DIRECT_URL` for Prisma operations. Copy `.env.example` to `.env` and configure the services used by the feature being exercised. Do not commit `.env` or credentials.

The test script is Node's built-in test runner over `tests/*.test.mjs`. Run the existing test file directly when iterating on validation behavior:

```bash
node --test tests/platform-validation.test.mjs
```

To run one named test from that file:

```bash
node --test --test-name-pattern="sanitizeName" tests/platform-validation.test.mjs
```

For the separate Python utility on Windows, run `altrenus-business-manager\run.bat`, or from that directory install `requirements.txt` and run `python src\main.py`.

## Web architecture and request flow

- Next.js App Router is the routing boundary. Pages/layouts are server components unless they need browser state, event handlers, or client-only APIs; those files begin with `"use client"`.
- Use the `@/*` TypeScript alias for imports from `src/*` (for example, `@/lib/prisma` and `@/components/ui/button`).
- `src/lib/prisma.ts` owns the singleton Prisma client and enables query/warn/error logging in development. Reuse it; do not instantiate another `PrismaClient` in a route or component.
- `src/lib/auth.ts` configures NextAuth with Google, GitHub, Discord, and credentials providers, using JWT sessions. Server code should use the exported `auth()` helper. Credential users are looked up case-insensitively and passwords are checked with `bcryptjs`.
- Admin authentication is separate from normal user authentication. Admin login uses the HMAC `admin-session` cookie, `src/lib/admin-auth.ts` verifies it in API routes, and `src/middleware.ts` applies admin-route/IP checks and rate limiting. Admin API handlers must call `verifyAdminRequest()` (or retain the established role check where that route is using NextAuth).
- Workspace/platform APIs should begin with `requirePlatformContext()` from `src/lib/platform/api.ts`. It authenticates the NextAuth session and creates/repairs the user's personal workspace defaults when needed. Use `isApiResponse()` before continuing when the helper returns an error response.
- Platform API responses use `ok()` for successful JSON and `apiError()` with the established `ApiErrorCode` values for failures. Use `mapUnknownError()` for unexpected server errors so they are logged without exposing internals.
- Parse request data through the shared helpers in `src/lib/platform/validation.ts`: `asString`, `asEnum`, `asJsonArray`, `asJsonObject`, `parseListQuery`, and `ValidationError`. Route handlers should catch validation errors and return a structured `VALIDATION_ERROR`.
- Scope every workspace query by `context.workspaceId` (and user/member identity where appropriate). Resource lookups should verify ownership before update/delete/download/preview operations.
- Local asset storage is handled by `src/lib/platform/storage.ts`. Preserve filename sanitization, safe-path checks, extension/MIME allowlisting, upload-size limits, and the `ASSET_STORAGE_PROVIDER`, `ASSET_UPLOAD_DIR`, and `MAX_ASSET_UPLOAD_MB` environment settings. Do not write uploaded files into source directories.
- AI, CAD, Blender, rendering, and payment platform routes currently use explicit local stub behavior documented in `docs/backend-platform.md`; do not describe or implement a provider call as if it were real unless the route is intentionally being integrated.

## Conventions to preserve

- Route handlers are explicit HTTP-method exports (`GET`, `POST`, `PATCH`, `DELETE`) and commonly set `dynamic = "force-dynamic"` and/or `runtime = "nodejs"` when Prisma, filesystem, or other Node APIs are involved.
- Keep API error shapes stable: platform errors are `{ error: { code, message, details } }`; avoid returning ad-hoc success-shaped fallbacks for failures.
- Use Prisma enums/types from `@prisma/client` and update `prisma/schema.prisma` before relying on a new persisted field or relation. Regenerate the client after schema changes.
- Platform list endpoints use the shared query parsing and bounded `limit`; use `sortToOrderBy()` rather than accepting arbitrary Prisma order fields from query strings.
- Activity and user-facing notification records are part of platform mutations. Reuse `logActivity()` and `createNotification()` when a mutation represents a meaningful workspace event.
- Client pages use the shared Radix/shadcn-style primitives in `src/components/ui/`, the `cn()` helper from `src/lib/utils`, and Tailwind classes. Theme colors and typography are defined through CSS variables in `src/app/globals.css` and the extensions in `tailwind.config.ts`; prefer those tokens over introducing one-off color systems.
- For UI changes, use only the Tailwind classes necessary for the requested behavior and visual design. Preserve the requested layout, spacing, responsive behavior, typography, and component structure exactly; do not add speculative styling, decorative elements, or alternate layouts.
- Keep browser-only state and effects in client components, and keep database/auth/secrets/filesystem work on the server. Never expose secret environment variables through `NEXT_PUBLIC_*`.
- Use the existing route and component naming conventions: kebab-case route directories/files, PascalCase React component exports, and `route.ts` for API handlers.
- `next.config.mjs` intentionally sets `eslint.ignoreDuringBuilds`; lint remains a separate `npm run lint` check. A successful production build does not replace running lint and typecheck.

## Documentation boundaries

When changing platform APIs, storage, stub-provider behavior, environment variables, or the Blender integration, update the matching documentation in `docs/` or `README.md` as part of the same change. Keep `docs/backend-platform.md` aligned with actual API behavior and keep `docs/blender-addon.md` aligned with the `/api/blender/chat` response contract.
