# Repository architecture

## Application

- The default `/casynus`, `/infrastructure` and `/interior?workspace=3d` use
  `components/scene-studio/SceneWorkbench.tsx` and the real R3F viewport.
  `lib/scene/document.mjs` validates versioned metric documents and allowlisted
  AI operations; `geometry.mjs` owns real meshes, import/export and disposal.
  `useSceneDocument.ts` coordinates undo, IndexedDB recovery and cloud autosave.
  `/api/studio-projects` uses authenticated workspace/user scope and atomic
  revisions; snapshots reuse `BlenderProject.settings` with a `casynus-scene`
  discriminator plus a canonical CAD Project. No Blender job is invoked.
  `/api/ai-scene` proposes native Gemini/Groq function calls; browser Apply is
  required. See `SCENE-STUDIOS.md` for actual capabilities and limitations.
  Previous editors remain available under `?workspace=classic`.
- `/interior` defaults to the original SVG drafting workspace again.
  Its `insetPanels` prop scopes the requested 12px panel geometry; the 3D mode
  remains separately addressable and uses the same snapshot/recovery system.
  Workbench application actions are inside the project-row menu, with no
  full-width top bar. The engine, APIs and scene schema are unchanged.
- `InteriorSceneSidebar` presents the shared studio header/navigation/project
  proportions over the original 2D editor, followed only by its actual plan
  objects. Selection and file actions call the existing editor handlers;
  the classic route retains its previous sidebar. Toolbars and AI docks align
  with the same 12px panel edges using studio-scoped positioning rules.
- The shared 3D canvas is an edge-to-edge background layer under the inset
  sidebars. The center section positions only toolbar/chat/feedback overlays;
  empty space passes pointer events through. Root drop handling retains import
  and object-library drag/drop across the expanded canvas.
- `crystal-studio/StudioViewportToolbar.tsx` shares the recovered Infrastructure
  toolbar presentation. Studio adapters supply actual tool/camera/export
  actions; the Interior SVG sketcher keeps its original geometry handlers.
  Toolbar export choices use a native dialog; CSV serializes real scene data.

- The primary web application is Next.js 14 with the App Router, React 18,
  TypeScript, and Tailwind CSS.
- `src/app/**` contains pages and route handlers. API endpoints use explicit
  HTTP method exports in `route.ts`.
- `src/components/**` contains reusable UI and Casynus Studio surfaces.
- `/login` and `/signup` share `src/components/auth-shell.tsx`, a horizontal
  frame capped at 1181px with CSS artwork and a responsive account form.
  Styles in `src/app/login/login.css` are scoped to `.auth-reference`.
  Login keeps NextAuth/OAuth, email-code and age-collection handlers; Signup
  keeps its registration endpoint and login redirect. The global sign-in
  popup is suppressed on auth routes. Server authentication is unchanged.
- `/infrastructure` is the canonical infrastructure editor route;
  `/infrastructur` currently re-exports the same page for compatibility.
- `/casynus?workspace=classic` renders the previous modeling workspace from
  `src/components/crystal-studio/CrystalStudio.tsx`; the legacy `/crystal`
  route redirects to `/casynus` while preserving query parameters. Its modeling
  sidebar, viewport, and output panel are separate components; the viewport
  owns canvas interaction and toolbar controls, while shared modeling
  properties live in the workspace state.
- `src/lib/crystal-theme.ts` owns the shared browser-persisted light/dark
  preference for the three studios and `/aichat`. The root layout applies the
  stored preference before hydration; `CrystalThemeToggle` is the shared
  control. Studio palette tokens live in `src/components/crystal-studio/tokens.css`,
  layout in `studio.css`, and shared component styling in `kit.css`, loaded
  after legacy `globals.css`. `kit.tsx` supplies buttons, panels, headers,
  keyboard-aware toolbars, inspector sections, and number/segmented controls.
  `viewport-theme.ts` reads the CSS palette for canvas/WebGL presentation;
  the floor-plan SVG uses theme variables. Theme changes do not change scene data.
- `StudioAIChat` is reused by the modeling, floor-plan, and infrastructure
  editors. Editors own prompts and scene actions; the root
  `StudioConversationProvider` shares messages and open/expanded state across
  editor navigation. Validated snapshots are recovered from per-identity
  `sessionStorage` through `conversation-storage.mjs`, capped at 200 messages
  and 1,000,000 characters. Account changes clear the visible conversation
  without remounting scenes. This is tab-local recovery, not a workspace
  authorization boundary or synchronization with `/aichat` session tables.
- The shared dock now sends Gemini/Groq/You text requests through
  `/api/ai-chat` using the client-only `src/lib/studio-ai.mjs` request helper.
  Gemini is the initial selection. Existing scene commands, floor-plan layout,
  and site-review demos are explicit local modes; provider text replies do
  not generate geometry or modify the scene. The mobile home composer routes
  its selected provider to the mounted dock. Pending replies are cancelled
  when account identity changes or the dock unmounts.
- The infrastructure viewport uses Three.js, React Three Fiber, and Drei.
  Procedural scene/object data is in
  `src/app/infrastructure/infrastructure-types.ts`, scene rendering and camera
  controls are in `infrastructure-scene.tsx`, and editor UI/state live in
  `page.tsx`. `infrastructure-storage.mjs` validates and stores browser-local
  snapshots; this is not authenticated cloud persistence.
- `/studio-ai` (`src/app/studio-ai/page.tsx`) provides the Soft Dark Generative
  AI Platform overview for Architecture, Interior Design, and Infrastructure
  Planning, and `/ui-kit` (`src/app/ui-kit/page.tsx`) exposes the complete
  interactive Soft Dark UI Kit (`#0F0F0F` / `#161616` / `#1A1A1A`) built on the
  scoped `.sui` design system in `src/components/soft-ui/`.

## Server and data

- `lib/ai3d/providers.mjs` contains real Meshy v2 and Tripo v3 adapters;
  credentials/model settings are server environment variables. `/api/ai3d`
  provider/job/asset routes and `lib/ai3d/jobs.ts` reuse `AIProviderJob` with
  `MODEL_GENERATION` plus the `casynus-ai3d` discriminator. Jobs are user AND
  workspace scoped, persisted before submission and resumed by ID. Meshy
  preview-to-refine uses an atomic JSON-phase claim to avoid duplicate charges.
  `lib/ai3d/client.mjs` polls bounded requests and validates downloaded GLB;
  the scene editor imports into the same manual scene model and previews before
  one undoable Apply. `AI3D-SETUP.md` records activation and actual limits.

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
- `/aichat` lets the user select Gemini or Groq and submits conversations to
  `/api/ai-chat`; provider credentials are read only on the server, and the
  other configured provider is tried if the selected one fails. You is a
  separate cited Answer API provider in `src/lib/you-answer.mjs`; it uses
  `YOU_API_KEY` and does not fall back to a different provider. Signed-in chat
  sessions are stored in `AssistantConversation` and `AssistantMessage`, loaded
  through `/api/ai-chat/sessions`, and scoped to the authenticated user and
  workspace. Browser-local sessions are imported when the page loads.
- `/api/ai-chat` also supports authenticated You requests without a cloud
  conversation ID for the session-backed studio dock. `YOU_API_KEY` and the
  official `YDC_API_KEY` alias are supported; You Answer selects its own model.
  Gemini/Groq requests have 20-second provider deadlines and the route declares
  a 60-second Vercel duration. Storage lookup/write failures return an answer
  with `saved: false` and a visible warning; ownership conflicts still return
  404. No conversation is read or written after an ownership lookup fails.
- `src/lib/security/cyber-shield.mjs` and `src/middleware.ts` implement the
  application's Web Application Firewall (WAF), CSRF same-origin mutation guard,
  adaptive IP reputation and brute-force lockout tracker, Web Crypto HMAC-SHA256
  edge admin session verification, and recursive JSON payload sanitization.
  `/api/security/status` reports active protection layers and admin telemetry.

## Tests and commands

- `npm test` runs Node's test runner over `tests/*.test.mjs`.
- `npm run lint` runs Next.js ESLint.
- `npm run typecheck` runs `tsc --noEmit`.
- `npm run build` generates Prisma Client, then runs the Next.js production
  build. Prisma configuration requires `DATABASE_URL`; local builds may also
  be constrained by available memory.
- `node scripts/verify-studios.mjs` is an opt-in local browser smoke test using
  installed Chrome and Node 22 WebSocket/CDP. Start Next on port 3002 first;
  `STUDIO_QA_URL` permits only localhost/127.0.0.1 and `CHROME_PATH` overrides
  the Windows Chrome default. It uses an isolated profile, captures theme
  screenshots, tests dock/keyboard/mobile behavior, and mocks client sessions
  for account-switch isolation. Artifacts stay under ignored `.tmp/`.
- The separate `altrenus-business-manager/` Python utility is not part of the
  Next.js test/build flow.

## Current persistence boundary

The infrastructure demo scene is initialized in client code and autosaved to
the current browser's local storage. It is not synchronized between devices or
users, does not yet use workspace/project ownership, and does not require a
signed-in account. Server-side persistence should use the authenticated
workspace/project APIs and an explicitly designed database representation.
