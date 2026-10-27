# Repository architecture

- Sketch Studio (`/interior`) renames the user-facing Interior label to Sketch
  while keeping `/interior`, `/interior?workspace=3d`, CAD floor-plan objects,
  Scene hierarchy and the Properties inspector intact when Pencil mode is
  inactive. Clicking the top-toolbar Pencil button enters a dedicated,
  sidebar-free Pencil Studio (`SketchWorkspace.tsx`, `src/lib/sketch.mjs`) with a
  `#404040` workspace, an initial `New Canvas` dialog (`sheet.created`,
  `sheet.background`, A4/A3/Square presets, Portrait/Landscape orientation), a
  horizontal top toolbar of 54×54px (40×40px inner surface) tool frames, a
  right-side dock for expandable Brush/Opacity/Color/Layers panels, top-left Profile & Settings buttons (`.sketch-top-left-bar`), bottom-centered `StudioAIChat` matching Architecture and Infrastructure,
  bottom-left AI Chat toggle (`.pencil-studio-ai`) connected to `StudioAIChat`,
  chronological SVG mask erasing, scanline flood fill and bottom-right canvas
  navigation. `useSketchProject.ts` and `/api/sketch-projects` persist versioned
  CAD+sketch documents in `BlenderProject.settings` (`kind: "casynus-sketch"`)
  with revision checks, JSONB key-order-independent reconciliation
  (`sketch-project.mjs`) and per-user `localStorage` recovery. `sketch-export.ts`
  exports combined CAD and visible sketch layers to PNG, SVG, PDF and editable
  JSON Scene. `SceneWorkbench.tsx` and `scene-studio.css` also reuse the HSV color wheel, saturation/value square, HEX input, opacity slider, swatches and custom color input (`SceneColorField`, opening as a floating panel to the left of the right sidebar when clicked) for `Base color` and `Light color` in Architecture (`/casynus`) and Infrastructure (`/infrastructure`). `StudioViewportToolbar.tsx` and `viewport-toolbar.css` render a unified `54px`-tall top toolbar across Architecture, Infrastructure and Sketch 2D CAD with `54×54px` outer tool frames and `40×40px` hover/active inner surfaces. `src/lib/prisma.ts`, `src/lib/platform/api.ts` and `src/app/api/studio-projects/route.ts` normalize pooled `DATABASE_URL` credentials/connection limits, cache verified workspace lookups, run default workspace upserts sequentially without blocking existing workspace reads, and enforce 15s remote transaction budgets.

- `/aichat` stores pinned/unread/project association on AssistantConversation;
  apply `prisma/ai-chat-sidebar.sql` before deploying the regenerated Prisma
  client. Conversation mutations and reads enforce user plus workspace ownership,
  and project assignment validates an active project in the same workspace.
  Delete archives existing conversations. Sharing uses an explicit native share
  sheet or copies transcript/citations; no unauthenticated public read is added.
  Pending chat responses are cancelled across conversation/account changes;
  local recovery only writes after the matching identity has finished loading.

- AI usage monthly counters use a nonempty idempotent upsert update to permit
  PostgreSQL native conflict handling on concurrent first requests. Reservation
  and refund transactions use bounded 15-second acquisition/execution budgets
  for remote database poolers; quota checks still fail closed on storage failure.

- AI chat provider keys are server-only sensitive Production environment
  variables. Gemini billing/country restrictions surface as
  `GEMINI_BILLING_REQUIRED` (503) after existing Gemini/Groq failover is exhausted;
  a configured key alone does not establish provider availability.

## Application

- Cloud scene GET responses are validated for matching project ID, positive
  integer revision and full versioned scene data; corrupt records return 422
  INVALID_PROJECT_DATA, independently of database/auth failures. Existing
  recovery cannot upload until a cloud GET verifies its base revision; conflicts
  retain both versions and explicit cloud selection archives dirty local data.
  Revision-zero local projects can first-upload after authenticated 404. The
  existing workspace/user-scoped database model and UI remain unchanged.

- Save reconciliation compares JSON object content independently of database
  key ordering while preserving array order and exact revisions. Scene hook
  callbacks are identity/studio scoped; pagehide, visibility hiding and effect
  cleanup also preserve the rendered document in IndexedDB before navigation.
  No UI, Prisma schema or credential exposure changes are involved.

- Active 3D project tab pointers include identity and studio. IndexedDB recovery
  records optionally carry studio metadata for latest-valid recovery lookup when
  no tab pointer exists; legacy records remain accessible by ID/Open. Cloud GET
  uses bounded deadlines, transient retry and caller cancellation. No schema or
  visual layout changes accompany this recovery update.

- Authenticated scene writes resolve the owner's workspace through
  `requirePlatformContext`. First workspace creation/defaults use a serializable
  transaction; warm-instance default initialization is coalesced. Browser scene
  recovery remains keyed to user/project. Cloud saves reconcile uncertain PUT
  results by reading the exact document/revision before retry, and leave
  conflicting recovery data intact. No new database or schema was added.

- `StudioActionsProvider` adds a finite typed command registry beside the shared
  conversation store. SceneWorkbench and FloorPlanViewport register context-owned
  adapters that reuse real editor handlers. English/Albanian text and voice use
  the same schema/parser, state acknowledgments and fingerprint-bound destructive
  confirmations. Native AI scene edits execute as validated undoable transactions;
  deletion requires confirmation and generated GLB imports retain preview/Apply.
- Both voice icons now open the same compact client `VoiceSpeechModal`; Start
  acquires audio, analyser levels drive listening bars, and Close cancels resources.
  Scoped validated floor-plan recovery preserves drawings on command navigation;
  3D saves verify actual workspace/recovery hashes. See `STUDIO-ACTIONS.md`.

- Infrastructure alone adds a lazy, client-only `WorldMap` surface alongside
  the mounted `SceneViewport`. Switching modes preserves the scene document,
  selection, camera, undo/redo, pending previews and chat. Map camera/marker
  state is separate, session-only and keyed by project; no schema changes.
- MapLibre GL JS is pinned at 6.15.0. Its separate ESM worker is emitted with
  `new URL(..., import.meta.url)` and registered through `setWorkerUrl`.
  Infrastructure routes and the emitted worker asset receive scoped map CSP;
  other studios retain their existing policy. The official globe demo is
  development-only; production uses OpenFreeMap or a licensed custom HTTPS style.
- `/api/infrastructure/geocode` proxies explicit MapTiler searches with a
  server-only key, bounded queries/results, deadline and in-process rate limit.
  UI coordinate parsing uses latitude/longitude; MapLibre uses longitude/latitude.
  OpenFreeMap Liberty is the key-free production/development default, allowed
  only in the scoped map CSP. Custom HTTPS styles remain configurable.
- `infrastructure/map-features.mjs` bounds and validates picked GeoJSON and
  WGS84 provenance. `map-import.mjs` triangulates land footprints or extrudes
  buildings with source heights into local-meter meshes, preserving holes.
  Optional validated object `geographic` metadata survives existing scene JSON,
  history, recovery and workspace snapshots; imports share the first object's
  origin and are limited to 2 km. See `INFRASTRUCTURE-MAP.md` for projection,
  datum and clipped tile limitations. Base-map features remain read-only.

- Interior `FloorPlanViewport` delegates SVG picking/drawing to one canvas
  handler; captured drag previews are committed once on release. Geometry helpers
  project openings to walls, preserve metric translations and produce shared
  rotated door/window segments for export. `CrystalStudio` owns a pure bounded
  plan-history reducer for both canvas and inspector edits. Input drafts commit
  on Enter/blur; object schema remains compatible with existing JSON projects.
  Openings do not yet have persistent wall-host constraints.

- `crystal-studio/floor-plan-export.ts` shares a content-bound fit, page
  orientation and centered offsets across SVG, PDF and 300dpi raster exports.
  The 10mm minimum margin includes geometric wall/opening extents; output is
  labeled Fit to page. Editor scale/settings and JSON coordinates stay intact.

- `StudioViewportToolbar` owns the plus-toggle library and session-only uploaded
  palette; `StudioMaterialLibrary` shows procedural canvas-generated PNG assets,
  filters and bounded image upload. `lib/scene/material-library.mjs` validates
  one immutable material edit across selected mesh/group descendants. Embedded
  maps reuse the existing document and export pipeline. The 2D SVG editor offers
  browsing plus a 3D workspace link rather than simulated PBR material editing.
  `StudioSidebarFooter` remains outside scrolling content with actual settings
  and account actions; no new navigation routes are introduced.

- `lib/scene/selection.mjs` preserves ordered multi-selection and creates
  disposable, non-pickable 3D outline helpers outside the export root: blue for
  the primary selection and green for additional objects. SceneWorkbench links
  viewport hover/picking to hierarchy row state and scrolling. Interior's SVG
  sketcher delegates object hover to its matching hierarchy without changing
  its document schema or single-selection property editor.

- The default `/casynus`, `/infrastructure` and `/interior?workspace=3d` use
  `components/scene-studio/SceneWorkbench.tsx` and the real R3F viewport.
  `lib/scene/document.mjs` validates versioned metric documents and allowlisted
  AI operations; `geometry.mjs` owns real meshes, import/export and disposal.
  `scene/editing.mjs` provides selected-object context, finite contextual plans
  and selection-scoped validation. `edit-overlay.mjs` owns transient GPU feedback
  outside the editable/exported root. See `CONTEXTUAL-SCENE-EDITING.md`.
  `useSceneDocument.ts` coordinates undo, IndexedDB recovery and cloud autosave.
  `scene/workspace-save.mjs` validates exact project/revision acknowledgments;
  queued failures retain their server message/status for verified-save callers.
  `/api/studio-projects` uses authenticated workspace/user scope and atomic
  revisions; snapshots reuse `BlenderProject.settings` with a `casynus-scene`
  discriminator plus a canonical CAD Project. No Blender job is invoked.
  `/api/ai-scene` proposes native Gemini/Groq function calls; reversible operations
  auto-commit after validation, while deletes require state-bound confirmation.
  Generated-provider GLB imports retain preview/Apply. See `SCENE-STUDIOS.md`.
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
- The restored Interior `RightPanel` uses `scenePresentation` to match the
  3D inspector header and scoped input/section styles. Its original floor-plan
  handlers and export pipeline remain in place; classic routes retain their UI.
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
- `/login`, `/signup` and both `/reset-password` modes share `src/components/auth-shell.tsx`, a horizontal
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
- `lib/studio-voice.mjs` isolates browser speech sessions from AI execution;
  `useStudioVoice` connects the shared studio dock to Ctrl + Q and opt-in wake
  listening. Only transcripts enter the composer; explicit spoken Send uses
  the existing submit adapter and scene validation/approval. Sessions stop on
  account changes, unmount and document hiding. `studio-microphone.mjs` owns one
  explicit audio stream, analyser level meter, bounded recorder and track/context
  cleanup. All app document policies permit same-origin microphone so Next client
  navigation from homepage/login retains a usable microphone policy; capture
  still requires explicit Start and browser consent. Browser
  speech-service refusal is distinct from device permission denial.
- `/api/studio-voice/transcribe` provides authenticated, rate-limited Groq Whisper
  fallback with bounded multipart uploads, a server-only existing Groq key and no
  audio storage. The Voice icon uses a separate opt-in conversation session with
  the selected text AI provider and browser TTS; capture pauses during processing
  and playback. Ordinary dictation remains editable. See `VOICE-COMMANDS.md`.
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

- Hunyuan3D extends the existing `ai3d` provider/job routes and shared 3D chat.
  `ai-services/hunyuan_shape_service.py` is a loopback-only, shape-only single-GPU
  queue using the verified cached pipeline, without paint/Blender imports.
  Next validates images, authenticates and checks saved-project ownership;
  completed GLBs are copied into private local asset storage or configured
  private Supabase Storage before success. Ownership-authorized asset requests
  redirect cloud downloads to 120-second signed URLs; both upload and signing
  verify the bucket is private. Remote production requires storage credentials.
  Studio CSP permits only the configured HTTPS storage origin for these assets.
  New scene `model` references retain job IDs, dimensions and transforms rather
  than expanding GLB geometry into PostgreSQL. A bounded per-editor native GLB
  cache feeds existing rendering/picking/history/export and clears on unmount.
  Worker stages and actual diffusion callbacks drive progress. The toolbar
  awaits fresh provider discovery on activation. Session preflight before
  generation/resume and a guest Sign in action precede workspace/GPU requests.
  Existing server authentication remains authoritative. GLB previews
  remain outside persisted scenes until explicit insertion. Local database
  connectivity and real authenticated production snapshot save/reopen passed on
  2026-10-25; live Hunyuan GPU-generation acceptance is pending.
  Production still needs remote GPU/storage provisioning and license review;
  see `HUNYUAN3D-LOCAL.md`. No schema migration or UI stylesheet changes.

- `platform/ai-usage.mjs` meters authenticated chat/native scene/3D requests
  using transactional monthly and daily feature counters in existing
  RateLimitBucket rows, namespaced `ai-usage:v1:<workspaceId>:`. Conditional
  increment reserves credits before external requests, rejecting over-limit
  races; failed chat/scene requests refund. SubscriptionState is authoritative:
  Basic 200, Pro 800, Team 2,000, Studio 4,000 per UTC calendar month; missing,
  inactive and legacy FREE/TRIAL map to Basic. Submitted 3D uses 20 credits
  including refinement; other metered requests use 1. Manual edits cost 0.
  `/api/usage` and shared `AccountUsage` replace account demos with persisted
  percentages/history, identity-safe refresh and quota warnings. New BASIC/
  STUDIO enum values require additive SQL before activation. Billing remains
  unconfigured; no client-selected upgrades. Retain usage rows for chart history
  and reconcile reservations left by crashes/failed refunds. See `AI-USAGE.md`.

- `AccountUsage` keeps the original account triplet/hover-chart presentation
  and a separate Limits row variant over the same authenticated data. Client
  `account-usage-request.mjs` aborts stale fetches and enforces a 15-second
  deadline; loading/error cards use unknown-value placeholders rather than
  fabricated consumption. No database/provider policy changes are involved.

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
- `prisma.config.ts` keeps DATABASE_URL for runtime and supplies DIRECT_URL
  for Prisma CLI schema operations, falling back to DATABASE_URL when absent.
  IPv4-only local networks need the exact Supabase Session pooler endpoint for
  schema access. `scripts/verify-ai-usage-database.mjs` provides read-only checks
  and explicit opt-in additive SQL/temporary-data usage regressions.
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

## Shared 3D picking and transform interaction

- `scene/picking.mjs` raycasts document surfaces, filters hidden/locked ancestors
  and adds a small pixel tolerance for thin geometry after exact-hit testing.
- `SceneViewport` records pointer-down coordinates but selects only on click
  after release. A transform gesture suppresses selection, captures the pointer
  and disables orbit until release. Changed transforms commit once to history.
- `scripts/verify-scene-transform.mjs` uses local Chrome/CDP to drag each axis
  in Architecture, Infrastructure and Interior 3D and verify Undo/Redo. It accepts
  the same localhost-only `STUDIO_QA_URL` as the selection regression script.

## Current persistence boundary

The infrastructure demo scene is initialized in client code and autosaved to
the current browser's local storage. It is not synchronized between devices or
users, does not yet use workspace/project ownership, and does not require a
signed-in account. Server-side persistence should use the authenticated
workspace/project APIs and an explicitly designed database representation.
