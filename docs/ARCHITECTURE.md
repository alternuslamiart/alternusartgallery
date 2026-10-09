# Repository architecture

## Application

- The primary web application is Next.js 14 with the App Router, React 18,
  TypeScript, and Tailwind CSS.
- `src/app/**` contains pages and route handlers. API endpoints use explicit
  HTTP method exports in `route.ts`.
- `src/components/**` contains reusable UI and Crystal Studio surfaces.
- `/infrastructure` is the canonical infrastructure editor route;
  `/infrastructur` currently re-exports the same page for compatibility.
- The infrastructure viewport uses Three.js, React Three Fiber, and Drei.
  Procedural scene/object data is in
  `src/app/infrastructure/infrastructure-types.ts`, scene rendering and camera
  controls are in `infrastructure-scene.tsx`, and editor UI/state live in
  `page.tsx`. `infrastructure-storage.mjs` validates and stores browser-local
  snapshots; this is not authenticated cloud persistence.

## Server and data

- `prisma/schema.prisma` is the source of truth for PostgreSQL data models.
- `src/lib/prisma.ts` owns the shared Prisma client.
- `src/lib/auth.ts` configures NextAuth.
- `src/lib/platform/api.ts` provides authenticated workspace context and shared
  API response, activity, and notification helpers.
- `src/lib/platform/validation.ts` and `storage.ts` hold shared request/path
  validation and local asset storage behavior.
- Workspace API routes use the helpers in `src/lib/platform/` and must scope
  data to `context.workspaceId`.
- AI/CAD/Blender/rendering workflows documented in `docs/backend-platform.md`
  use local stubs unless a route is explicitly integrated with a real provider.

## Tests and commands

- `npm test` runs Node's test runner over `tests/*.test.mjs`.
- `npm run lint` runs Next.js ESLint.
- `npm run typecheck` runs `tsc --noEmit`.
- `npm run build` generates Prisma Client, then runs the Next.js production
  build. Prisma configuration requires `DATABASE_URL`; local builds may also
  be constrained by available memory.
- The separate `altrenus-business-manager/` Python utility is not part of the
  Next.js test/build flow.

## Current persistence boundary

The infrastructure demo scene is initialized in client code and autosaved to
the current browser's local storage. It is not synchronized between devices or
users, does not yet use workspace/project ownership, and does not require a
signed-in account. Server-side persistence should use the authenticated
workspace/project APIs and an explicitly designed database representation.
