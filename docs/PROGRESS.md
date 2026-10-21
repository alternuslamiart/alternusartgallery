# Verified progress

Last updated: 2026-10-21

## Real 3D provider frontend/backend integration

- Added server-only Meshy v2 (preview + PBR refinement) and Tripo v3
  text-to-model adapters, following their official current API documentation.
  Configured providers appear in the existing 3D assistant through
  `/api/ai3d/providers`; no API keys reach the browser. Setup and exact
  deployment steps are in `docs/AI3D-SETUP.md` and `.env.example`.
- Authenticated job creation, status polling, listing/resume and a bounded
  asset proxy use existing `AIProviderJob` storage. Every query scopes workspace
  AND user; project ownership is checked. Requests persist before provider
  submission; unique request IDs prevent duplicates. Atomic Meshy refinement
  claims prevent concurrent polls from submitting a second texture task.
  Ambiguous provider submissions are not automatically retried.
- Frontend downloads and validates GLB, imports real editable meshes/materials,
  previews without committing, and applies in one undoable operation. Generation
  jobs can resume after interruption without another paid submission. CDN
  downloads have a 20 MB bound; same-origin proxy has a 4 MB bound for Vercel.
  Added only official provider asset domains to the existing CSP allowlist.
- Gemini/Groq structured scene mode now starts enabled in 3D workspaces and
  supports validated transforms, group material propagation, PBR properties,
  template placement and sunlight/render settings. You remains research chat.
  The original Interior 2D sketcher remains unchanged; 3D uses
  `/interior?workspace=3d`.
- `npm test`: 67 passed; typecheck passed; focused lint has zero errors and
  one existing image warning. Tests exercise provider request contracts,
  persistence/idempotency, refinement races, project scope, aborts, invalid
  assets and real GLB import/apply/undo. Provider HTTP/database adapters are
  mocked in these tests; no live paid Meshy/Tripo call is claimed.
- Installed Chrome passed Architecture, Infrastructure and Interior 3D:
  Meshy selection, job progress, real GLB preview, Apply, Undo, job resume with
  no new POST, Discard and Gemini structured proposals. HTTP providers/jobs
  were intercepted; genuine GLB parsing/Three.js rendering were exercised.
  Zero runtime exceptions. Artifacts: `.tmp/ai3d-browser-1792615278282/`.
  Reproducible script: `scripts/verify-ai3d-studios.mjs`.
- Real local HTTP probes returned capabilities 200 and unauthenticated job
  creation 401. Live signed-in database generation/save/reopen and actual
  Meshy/Tripo model access remain deployment checks after keys/credits exist.
- Google Fonts still fails local certificate validation
  (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`); dev uses fallback fonts. Disk capacity
  also limited browser/build work; only generated QA profiles/cache were
  cleaned. Production build was not rerun with these known environment blockers.

## Full-window design canvas behind inset panels

- Moved the shared real 3D viewport out of the center controls section into
  an absolute, edge-to-edge layer. Sidebars retain 12px insets/corners above
  the scene; toolbar/chat stay in the center workspace. Transparent controls
  pass pointer input through to the canvas, including the padding gaps.
  Drag/drop handling moved to the workbench root to retain asset/file drops.
- Removed the Infrastructure sidebar's `Open detailed site editor` footer
  link as requested. Its existing classic route/source remain preserved.
- Chrome spacing checks passed Architecture, Interior and Infrastructure at
  1440/390px in both themes: full-window 3D canvas bounds, canvas hit-testing
  in padding, panel hit-testing above it, 12px panel geometry, and no runtime
  errors/overflow. Original Interior SVG drafting remains unchanged.
  Screenshots: `.tmp/studio-spacing-1792612260879/`.
- Typecheck and focused ESLint passed. The local production-build certificate
  blocker documented below remains; no production-build success is claimed.

## Shared Infrastructure-style viewport toolbar

- Reused the original Infrastructure toolbar's order, icons and styling in
  `StudioViewportToolbar`, shared by Architecture, Infrastructure and the
  original Interior drafting viewport. Creation/modeling actions vary by
  studio; Interior keeps wall/door/window/room/dimension/annotation/furniture
  tools, selection and deletion. No drafting engine was replaced.
- Added working camera view/zoom/reset/fit controls, a format-selection Export
  dialog, actual scene-data CSV downloads and studio-specific settings actions.
  Existing 3D undo/redo, duplicate, delete, snapping and focus remain available
  in the sidebar action menus and keyboard shortcuts. Export formats and
  scene storage are retained.
- Corrected a legacy CSS background specificity conflict so the center
  controls layer is truly transparent above the full-window canvas. Browser
  screenshots were inspected: real geometry is visible centrally and through
  padding, and the Infrastructure extra footer link is absent.
- `npm test`: 55 passed; TypeScript passed; focused lint has no errors and four
  pre-existing hook/image warnings in Viewport. Chrome theme/mobile/layout and
  Interior add/delete tests passed at 1440/390px in both themes. Artifacts:
  `.tmp/studio-spacing-1792612726710/`.
- The repeated export/navigation run hit local `ENOSPC` in Next/Chrome writes.
  Removed only generated QA profiles and webpack cache; production build is
  still subject to the existing trusted-certificate blocker. Retry results
  are recorded after the final run, not inferred from the earlier run.
- After freeing disk, the full 3D workflow passed: transforms, undo/redo,
  all seven exports plus toolbar CSV, refresh recovery, three studio switches
  preserving document data and template creation; zero runtime exceptions.
  Artifacts: `.tmp/scene-workflow-1792612990521/`.
- Final layout/dialog sweep also passed all 12 route/theme/width combinations:
  native Export dialog opens/closes, toolbars stay between desktop panels at
  46px height, correct per-studio tools, full-window canvas and transparent
  controls layer. No runtime exceptions. Final screenshots:
  `.tmp/studio-spacing-1792613117435/`.

## Studio spacing correction and original Interior drafting restoration

- Audited `8d22f00` against pre-3D UI commit `a531c16`; created local checkpoint
  branch `checkpoint/studio-ui-before-restore-8d22f00` and an ignored worktree
  patch before editing. Unrelated deleted images and untracked scripts remain
  untouched. The user's follow-up narrowed the UI request to padding and
  removal of the new top strip, plus the original Interior plan sketcher.
- Removed the full-width workbench menubar. Its real File/Edit/View/Tools/
  Camera/Render/Export/Save handlers remain in the project-row actions menu.
  Sidebars and viewport start at the top with 12px insets/gaps and 12px corners;
  panel restore controls remain available when collapsed. Changes are scoped
  to the scene workbench and the Interior drafting root.
- `/interior` again mounts the original `CrystalStudio` floor-plan editor:
  original SVG drafting, sidebars, toolbar and AI chat, with scoped 12px panel
  geometry. `/interior?workspace=3d` retains the full new 3D editor; its stored
  scenes are not migrated or deleted. The drafting 3D Studio control opens
  the real `/casynus` engine instead of the previous simulated viewport.
- Chrome's 3D workflow passed transformations, undo/redo, all seven exports,
  IndexedDB recovery, templates and document-preserving 3D route switching,
  with zero runtime exceptions. `npm test`: 55 passed; typecheck passed;
  focused lint has no errors and five existing image warnings in CrystalStudio.
- `scripts/verify-studio-spacing.mjs` passed all three routes at 1440/390px
  in both actual themes: no top strip or horizontal overflow, desktop panel
  bounds/corners exactly 12px, mobile 3D sidebar reopening at 12px, and original
  Interior room creation/deletion. No runtime exceptions. Screenshots are in
  ignored `.tmp/studio-spacing-1792611885922/`; 3D workflow artifacts are in
  `.tmp/scene-workflow-1792611695125/`.
- Production build retains the known local Google Fonts certificate blocker;
  this session's dev compilation again reported `UNABLE_TO_VERIFY_LEAF_SIGNATURE`
  and used fallback fonts. A production build is not claimed here.

## Shared real 3D modeling workflow

- Added the default R3F/Three.js workbench to Architecture, Interior and
  Infrastructure, preserving previous editors under `?workspace=classic`.
  Real meshes, transform gizmos, material/light inspectors, editable studio
  templates, hierarchy, undo/redo, import/export and IndexedDB recovery work
  through one validated scene document. See `docs/SCENE-STUDIOS.md` for scope.
- Added authenticated workspace/user-scoped cloud snapshots with atomic
  revisions and conflict handling; API tests use mocked Prisma/auth. Live
  signed-in cloud save/reopen/logout/login remains unverified.
- Gemini/Groq native tool proposals are independently validated on server and
  browser, previewed before Apply, and committed as one undoable action. Native
  request/response tests use mocked HTTP; You remains research text chat.
- Final `npm test`: 55 passed, including group/ungroup world-transform and
  ancestor-lock checks. TypeScript and focused ESLint passed. Real Chrome
  verified object transformations, undo/redo, all seven downloaded formats,
  refresh recovery, same-document studio switching, three generated templates,
  correct viewport/inspector bounds and no mobile horizontal overflow; zero
  JavaScript exceptions. `scripts/verify-scene-studios.mjs` reproduces this.
- Advanced mesh editing, semantic CAD constraints, terrain/curved road editing,
  path tracing/AO and full production acceptance remain unfinished; unavailable
  menu tools are explicitly marked. This is the first working end-to-end 3D
  increment, not completion of the entire master specification.
- Build attempts encountered Google Fonts certificate verification in a
  duplicate legacy font configuration (removed in favor of the root font),
  then disk ENOSPC. Removed only generated QA Chrome profiles, freeing 300 MB.
  `npm run build` then hit Prisma DLL `EPERM` during generation; an existing
  process holds the client DLL. The first separate `npx next build` exhausted
  Windows memory (`memory allocation of 49152 bytes failed`, exit 3221226505).
  After removing only `.next/cache/webpack` (about 900 MB), geometry tests
  passed. The final `npx next build` failed downloading root Roboto/Roboto Flex
  with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`. Production build is NOT verified;
  restore a trusted Node certificate chain and rerun on a host with free disk
  and an unlocked Prisma DLL. TLS verification was not disabled.

## Gemini, Groq and You chat connections

- Production probes on the canonical `https://www.alternusart.com` origin
  returned real `OK` answers from Gemini and Groq. A direct You Answer call
  using the local configured key returned HTTP 200 with an answer. You's
  unauthenticated production chat request correctly returned 401. The
  original apex-domain probe followed a www redirect with the wrong Origin
  and received CSRF 403; the canonical-origin probes passed without changing
  CSRF protections. No key values were logged or committed.
- Found that studio docks used local parsers/demo replies rather than the
  configured chat providers. Connected modeling, floor-plan and infrastructure
  docks to `/api/ai-chat`, with Gemini/Groq/You selections and Gemini initially
  selected. Mobile home now offers those same providers and sends its actual
  selection to the dock. Local layout/scene/site modes remain explicitly local.
  Text replies do not generate meshes, CAD files, images, or scene edits.
- Studio requests carry bounded history, display provider replies and errors,
  preserve prompts on failure, and cancel stale requests on account changes
  and unmount. You remains authenticated, but no longer requires a cloud
  conversation ID when used from a tab-local studio conversation.
- Decoupled provider success from workspace persistence: lookup/write errors
  now return the answer with `saved: false` and a visible storage warning.
  Foreign conversation IDs still return 404, with no provider call or write.
  Added `YDC_API_KEY` support, configured/default You detection, a 60-second
  route duration, 20-second Gemini/Groq request deadlines, and You diagnostics.
  Removed assistant text previews from server logs.
- `npm test` passed (40 tests), including the actual route with mocked
  auth/storage/HTTP adapters, provider request serialization, key aliasing,
  storage failures, ownership conflicts, and authenticated/stateless You.
  Focused ESLint passed with 15 existing image/hook warnings; typecheck and
  production build passed (87 static pages, existing auth/Browserslist warnings).
- Chrome verified all three provider selections and displayed replies across
  `/casynus`, `/interior` and `/infrastructure`, provider error/prompt recovery,
  mobile home Groq routing, and pending reply isolation after account changes.
  This browser run mocked provider HTTP responses and client sessions; the
  separate live probes above verified provider credentials. Artifacts remain
  ignored under `.tmp/provider-browser/`. Updated the existing studio smoke
  script to select the explicit local floor-plan mode for its layout test.
- Authenticated deployed You/database reload remains unverified. Vercel CLI
  `whoami` failed certificate validation (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`)
  while fetching OpenID configuration. No Vercel environment values were
  downloaded or changed; TLS verification stayed enabled.

## Studio sidebar header refinement

- Rebuilt the shared modeling/floor-plan sidebar header to match the supplied
  reference: 72px header, regular centered 14px title, 36px controls with
  20px icons, a rounded theme button, and no divider under the header.
  The default modeling title is now `Generative 3D`; selected asset names
  still replace it. Long titles retain ellipsis and their full title tooltip.
- Removed legacy reference classes from `StudioHeader` and explicitly scoped
  its geometry/typography in `kit.css` to override old sidebar rules.
- `npm test` passed (22 tests), focused ESLint on all three changed TSX files,
  `npm run typecheck`, `git diff --check`, and `npm run build` passed
  (87 static pages). Existing Browserslist/auth client-rendering warnings and
  unrelated full-project lint errors remain as previously documented.
- Chrome inspected `/casynus` and `/interior` at 1440/768px in both themes:
  14px regular title, 72px header, contained 36px controls, no horizontal
  overflow. The existing responsive layout hides these sidebars at 390px;
  the initial mobile assertion expected a visible header and was corrected
  to check that existing behavior. Screenshots: `.tmp/header-browser/`.
- Header theme toggling, collapse, and back-to-project navigation passed;
  the browser run reported no runtime exceptions.

## Homepage wave-card revision

- Moved the three capability headings above their images onto the card
  backgrounds, retained the original copy, and set descriptions to 24px.
  Added the supplied `wave0.jpg`, `wave1.webp`, and `wave2.jpg` in order.
  The desktop row now spans 1180px, aligned with the feature/CTA frame below.
- Explicit image-panel widths prevent aspect-ratio/min-height sizing from
  extending images outside mobile cards. Description and heading sizes
  override the existing global mobile 12px rule within these cards only.
- Initial typecheck raced Next dev's regeneration of `.next/types` and
  reported TS6053 missing generated route files; final checks follow below.
- Final `npm test` passed (22 tests), `npm run typecheck`, focused ESLint,
  `git diff --check`, and `npm run build` passed (87 static pages). Existing
  Browserslist/auth-route warnings remain; the full-project lint errors
  documented above are outside this change.
- Installed Chrome verified the final production build at 1440/768/390px
  in both themes: loaded wave images, headings above images, computed 24px
  descriptions, three visible cards, content contained by the card frames,
  no horizontal page overflow, and no runtime exceptions. Visually inspected
  desktop alignment and the corrected mobile screenshot. Artifacts remain
  ignored under `.tmp/wave-browser/`.

## Homepage capability frames

- Removed the five category chips below the homepage hero. Rebuilt Core focus,
  Design areas, and Design coverage as rounded frames with inset architecture,
  interior, and infrastructure images, overlay headings, and the original
  values and descriptions. All three cards now remain visible on mobile.
- Styles are scoped in `src/app/home-highlights.css`; light frames are pale
  gray and dark frames charcoal. Existing local images are reused.
- `npm test` passed (22 tests), `npm run typecheck`, focused ESLint on
  `src/app/page.tsx`, and `git diff --check` passed. Full `npm run lint`
  fails on existing unrelated unused-symbol/prefer-const errors.
- Installed Chrome checked 1440, 768, and 390 CSS pixels in both themes:
  three visible cards, loaded images, text inside frames, removed chips,
  no horizontal overflow, and no runtime exceptions. Screenshots are under
  ignored `.tmp/home-browser/`. Dev uses fallback fonts because Google Fonts
  downloads report `UNABLE_TO_VERIFY_LEAF_SIGNATURE`.
- After the final frame-color adjustment, visually inspected the desktop
  light screenshot; a repeat browser sweep stopped on its second navigation
  with `CDP timeout: Page.navigate`. The first full sweep passed; repeat the
  sweep against a fresh local server if further browser changes are made.
- `npm run build` passed (87 static pages). The first attempt failed with
  Prisma `EPERM` renaming `query_engine-windows.dll.node`; stopping the
  temporary port-3003 server released the lock and the retry passed. Existing
  auth/account client-rendering and Browserslist warnings remain.

## Soft login redesign

- Rebuilt `/login` around a light two-panel layout: centered sign-in form on a
  quiet neutral surface and a blue gradient studio overview with a code-native
  agent tile and capability cards. At 900px and below the overview yields to
  the full-width form. The saved dark preference and toggle still work.
- Preserved Google, GitHub, Discord, password plus email-code verification,
  age collection, reset-password and signup links. OAuth now carries the safe
  relative `callbackUrl`; request and sign-in network failures show inline
  errors. The global sign-in popup stays hidden on auth routes.
- Installed Chrome browser QA at 1440, 900, and 390 CSS pixels found no
  horizontal overflow or runtime exceptions. Mocked the login-code endpoint
  to verify API errors, code-step entry, the six-digit gate, back navigation,
  and theme persistence. No real account, email delivery, or OAuth round trip
  was attempted.
- `npm test` passed (22 tests), `npm run typecheck` passed, focused ESLint on
  both changed TSX files passed, `git diff --check` passed, and `npm run build`
  passed (87 static pages). The build retains the existing `useSearchParams()`
  client-rendering warnings for auth/account routes. Full-project `npm run
  lint` still fails on pre-existing errors in unrelated files.

## Resumed studio UI kit and browser-session conversation increment

- Recovered the interrupted work from the dirty tree after `fae23f2`, the
  handoff docs, and the three `.studio-*.cjs` migration scripts. The prior
  conversation was not available in this session. Already implemented:
  shared theme, You Answer integration, infrastructure local autosave, and
  existing studio routes. Partly implemented at resume: extracted theme
  styles, shared UI primitives, viewport palette, and session-backed AI dock.
- Finished that existing increment without rerunning the migration scripts.
  `tokens.css`, `studio.css`, and `kit.css` now provide the shared palette,
  layout, and controls. Fixed font-token scope, mobile creation-home themes,
  interior SVG canvas contrast, gizmo axis colors, active-button contrast,
  expanded-chat sizing, and overlapping mobile toolbars/panel toggles.
- Fixed a browser-discovered root hydration failure by keeping the global
  style and scripts inside `<head>`. Restored accessible new/clear conversation
  actions and the supplied dock status label.
- `StudioConversationProvider` retains messages and dock state across studio
  navigation and reload within a browser tab. Identity changes reset visible
  chat before rendering another account and reject updates from stale account
  callbacks without remounting the editor. Snapshots retain at most 200 recent
  messages within the reader's 1,000,000-character limit. This is browser
  session recovery, not authenticated workspace/cloud persistence.
- Verified `npm test` (22 passed), `npm run typecheck`, focused ESLint across
  changed implementation/tests (0 errors; 15 existing image/hook warnings),
  and PostCSS parsing of all four affected stylesheets. Full `npm run lint`
  still fails on existing unused-symbol/prefer-const errors in unrelated
  routes, legacy editor components, email, and PayPal modules.
- Headless installed Chrome verified `/casynus`, `/interior`, `/infrastructure`,
  and `/aichat` at 1440 and 390 CSS pixels in both themes with no horizontal
  page overflow or runtime exceptions. Verified mobile editor entry, mobile
  infrastructure Library/Inspector access, inspector collapse, toolbar arrow
  navigation, a local floor-plan prompt, chat expand/minimize/reopen, new chat,
  reload/theme recovery, and cross-studio navigation. Mock-session account
  switching/signout isolated chat without replacing the mounted editor. No
  real account or database round trip was used. Infrastructure WebGL rendered;
  exhaustive camera/transform/lighting/export checks remain separate.
- Repeat browser checks with `node scripts/verify-studios.mjs` against a local
  Next server on port 3002 (Node 22, installed Chrome; `CHROME_PATH` and
  `STUDIO_QA_URL` can override defaults). Screenshots/results are under ignored
  `.tmp/studio-browser/`. The CUA tool could not start due to
  `helper_sandbox_lock_failed` / `SetNamedSecurityInfoW ... failed: 5`.
  Installing isolated Playwright failed with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`;
  the saved harness instead uses installed Chrome through DevTools. Local dev
  font downloads hit the same certificate error and used Next's font fallback.
- Final `npm run build` passed: Prisma generated and all 87 static pages
  completed. The first final attempt stopped at Prisma with `EPERM` renaming
  `query_engine-windows.dll.node`; stopping the temporary QA server released
  the lock and the retry passed. Existing Browserslist and client-rendering
  warnings for `/login`, `/reset-password`, and `/account` remain. Builds skip
  lint by existing configuration; the separate lint results above still apply.
  Final `git diff --check` and browser-script syntax validation also passed.
- Existing deleted infrastructure images, migration scripts, and crash reports
  were preserved. Cloud studio chat/scene storage, configured image generation,
  and live You/database/deployment verification remain pending.

## Shared Crystal studio theme and AI dock increment

- Added one persisted light/dark setting for `/casynus`, `/interior`,
  `/infrastructure`, and `/aichat`, with a shared Sun/Moon toggle. Existing
  `/aichat` theme preferences are read when the new key is absent. An early
  layout script applies the saved theme before hydration.
- Centralized studio palette tokens and added dark surfaces for the shared
  sidebars, toolbar, inspector, menus, and AI dock. Architecture and
  Infrastructure viewport backgrounds, grids, and ground now adapt to the
  selected theme without replacing scene objects or remounting the canvas.
- Added a minimize control to the existing shared `StudioAIChat`. Its messages
  remain in parent state when the dock closes and reopens.
- Verified: `npm test` (17 passed), `npm run typecheck`, focused ESLint (0
  errors; 15 existing image/hook warnings), `npm run build`, and
  `git diff --check` passed. Browser verification is still open: the browser
  automation process exited unexpectedly on two attempts to open the local
  studio. The existing local server on port 3001 did not respond; a temporary
  server on port 3002 started successfully and was then stopped.
- This increment does not add authenticated studio chat persistence, new CAD
  engines, or image generation. The You.com documentation currently lists
  Search, Answer, Contents, Research, and Finance Research APIs, with no
  documented image-generation endpoint; the existing You Answer integration
  remains the supported capability.

## `/aichat` You.com Answer integration

- Added You to the existing model selector and routed its requests through the
  server-only You Answer API (`POST https://api.you.com/v1/answer`, `X-API-Key`).
  Responses retain native cited answer text and clickable source URLs. The API
  accepts a single query up to 400 characters, so recent conversation context
  is folded into a bounded follow-up query; this is not a multi-turn You API.
- Signed-in `/aichat` sessions now load from and save to the existing
  `AssistantConversation` and `AssistantMessage` tables, scoped by workspace
  and user. Existing browser-local sessions are imported on load. Gemini and
  Groq keep their previous provider behavior and also save responses in these
  tables when sent from the chat page.
- Added explicit missing-key, authentication, billing, rate-limit, invalid
  response, and timeout errors without exposing `YOU_API_KEY` to the browser.
- `npm test` passed (17 tests), `npm run typecheck` passed, focused ESLint passed
  with five existing image warnings, and `npm run build` completed. Live You
  request, database round trip, browser/mobile interaction, and Vercel
  deployment verification remain pending because no nonempty `YOU_API_KEY` or
  database test session was available in this checkout. Browser automation
  crashed twice while opening the local page, so visual interaction was not
  verified.

## Soft Dark AI Platform Website (`/studio-ai`) & Complete Soft Dark UI Kit (`/ui-kit`)

- Designed and implemented the **Soft Dark Generative AI Platform Website**
  (`src/app/studio-ai/page.tsx`, `src/app/studio-ai/showcase.tsx`) and a
  complete interactive **Soft Dark UI Kit** (`src/app/ui-kit/page.tsx`), backed
  by a scoped `.sui` Soft Dark design system (`src/components/soft-ui/soft-ui.css`,
  `src/components/soft-ui/primitives.tsx`, `src/components/soft-ui/showcase-art.tsx`,
  `src/components/soft-ui/site-chrome.tsx`):
  - **Soft Dark Aesthetic & Tokens:** Near-black and deep charcoal canvas
    hierarchy (`#0F0F0F`, `#161616`, `#1A1A1A`), generous `16px–32px` rounded
    geometry, hairline soft borders, gentle glassmorphism (`backdrop-filter: blur(22px)`),
    and calm studio accents (Soft Periwinkle `#A5B1FF`, Architectural Sage
    `#A9CDBD`, Warm Sand `#E2C9A6`, semantic Success `#6ED3A5`, Warning `#EEBD6B`,
    and Error `#F28C96`).
  - **Platform Landing Page (`/studio-ai`):** Hero section with 3-column
    Interactive Studio Preview Frame (left scene hierarchy, center 3D
    architectural wireframe + floor plan + infrastructure preview with floating
    AI prompt bar, and right parameter inspector), dedicated feature sections for
    **3D Architecture Studio**, **Interior & Floor Planning**, and
    **Infrastructure & Site Planning** with custom SVG concept illustrations,
    6 soft floating tool cards, filterable generated-project showcase (`All`,
    `Architecture`, `Interior`, `Infrastructure`), 3-step studio workflow, and
    footer.
  - **Interactive Soft Dark UI Kit (`/ui-kit`):** Live interactive showcase of
    all 7 component families:
    1. **Buttons** (`Primary`, `Secondary`, `Tertiary`, `Ghost`, `Destructive`,
       `sm`/`md`/`lg` sizes, loading spinner, disabled, and icon-only states)
    2. **Icons** (`1.6px` rounded line stroke, `sm`/`md`/`lg`/`xl` sizes, and
       `default`/`hover`/`active`/`disabled` tile states)
    3. **Cards & Frames** (`elevated`, `glass`, `interactive`, `subtle`, floating
       panels, and soft gradient dividers)
    4. **Form Elements** (text inputs with prefixes/suffixes, textareas, selects,
       checkboxes, radio groups, animated switches, and gentle focus/valid/error
       states)
    5. **Navigation** (glassmorphic top header, pill tabs, vertical studio
       sidebar nav, and pill breadcrumbs)
    6. **Feedback Components** (status alerts, floating toasts, hover tooltips,
       linear/circular progress indicators, loading spinners/dots, and a live
       interactive modal dialog)
    7. **Typography & Color System** (Display XL through Caption/Mono type scale
       plus interactive copy-to-clipboard color token swatches).
- Focused ESLint (`npx eslint src/components/soft-ui src/app/studio-ai src/app/ui-kit`),
  full-project typecheck (`NODE_OPTIONS="--max-old-space-size=4096" npm run typecheck`),
  and `npm test` passed. Browser rendering was not verified.

## Casynus Cyber-Shield Website Security System

- Built and integrated the multi-layered **Casynus Cyber-Shield** security engine
  (`src/lib/security/cyber-shield.mjs`, `src/lib/security/cyber-shield.d.ts`)
  across Edge Middleware (`src/middleware.ts`), platform API helpers
  (`src/lib/platform/api.ts`), AI Chat (`src/app/api/ai-chat/route.ts`), Admin
  Auth (`src/app/api/admin/auth/login/route.ts`), and Next.js config
  (`next.config.mjs`):
  - **Multi-Pass WAF Threat Inspector (`inspectRequestThreat`, `decodeInspectableText`):**
    Performs multi-pass URL decoding to defeat double/triple encoding evasion and
    blocks SQL Injection (`UNION SELECT`, `INFORMATION_SCHEMA`, blind `SLEEP` /
    `WAITFOR DELAY`), Cross-Site Scripting (`<script>`, `javascript:`, event
    handlers), Command Injection / RCE, SSRF (`169.254.169.254`,
    `metadata.google.internal`, `gopher://`, `file://`), XXE, Path Traversal,
    Null-Byte Injection, sensitive path probes (`/.env`, `/.git`, `/wp-admin`,
    `/phpmyadmin`, `/actuator`), and automated vulnerability scanners (`sqlmap`,
    `nuclei`, `nikto`, `nmap`, `masscan`, `gobuster`, `acunetix`, `nessus`).
  - **CSRF Same-Origin Mutation Guard (`verifySameOriginMutation`):** Protects
    state-changing API requests (`POST`, `PUT`, `PATCH`, `DELETE`) by verifying
    `Origin`, `Referer`, and `Sec-Fetch-Site` against the target `Host` while
    preserving webhook exemptions (`/api/stripe/webhook`, `/api/paypal/webhook`,
    `/api/auth/`).
  - **Cryptographic Edge Admin Session Verification (`verifyAdminSessionEdge`):**
    Replaced the format-only Edge middleware cookie check with Web Crypto API
    (`crypto.subtle`) constant-time HMAC-SHA256 verification for both `/admin/*`
    routes and `/api/admin/*` endpoints.
  - **Adaptive IP Reputation & Tiered Rate Limiting (`CyberDefenseTracker`):**
    Tracks security strikes per IP with automatic temporary ban escalation for
    repeat offenders, exponential backoff lockouts on failed admin logins, and
    tiered per-minute rate limits (`auth`, `ai`, `payment`, `support`, `api`).
  - **Recursive JSON Payload Sanitizer (`sanitizeAndInspectPayload`):** Enforces
    payload size/depth/key bounds and blocks `__proto__` / `constructor.prototype`
    pollution, NoSQL operator injection (`$ne`, `$where`, `$regex`), and null
    bytes in `readJsonBody`, `/api/ai-chat`, and `/api/admin/auth/login`.
  - **Security Posture Endpoint (`/api/security/status`):** Reports active
    defense layers and (when authenticated as admin) live WAF/rate-limit
    telemetry.
- Added 6 focused automated tests in `tests/cyber-shield.test.mjs`; `npm test`
  passed (14/14 tests), `npx eslint` passed (0 errors), and
  `NODE_OPTIONS="--max-old-space-size=4096" npm run typecheck` passed.

## Casynus Studio Ecosystem UI/UX redesign

- Added the dedicated `/interior` route (`src/app/interior/page.tsx`) for the 2D
  Floor Plan & Interior Studio while preserving `/casynus?mode=floor-plan`
  compatibility and updating `StudioModeNav` (`src/components/crystal-studio/ui.tsx`)
  and `UnifiedSidebar` (`src/components/unified-sidebar.tsx`) to link to
  `/interior`.
- Fundamentally transformed the visual design of `/casynus` (Architecture 3D
  Studio), `/interior` & `/casynus?mode=floor-plan` (Interior 2D Floor Plan
  Studio), and `/infrastructure` & `/infrastructur` (Infrastructure Studio)
  into a soft, clean, modern architectural daylight workspace (`src/app/globals.css`,
  `src/components/crystal-studio/Viewport.tsx`, `src/components/crystal-studio/RightPanel.tsx`,
  `src/components/crystal-studio/ui.tsx`, `src/app/infrastructure/page.tsx`,
  `src/app/infrastructure/infrastructure-scene.tsx`):
  - Replaced legacy `#0F0F0F !important` / `#111316 !important` dark-box
    overrides with a warm alabaster/stone workspace backdrop (`#EEECE6`) and
    floating frosted-porcelain sidebars (`rgba(255, 255, 255, 0.90)`, `22px`
    radius, `backdrop-filter: blur(24px)`, soft ambient elevation shadows, and
    crisp slate `#0F172A` typography).
  - Updated the 3D Architecture viewport (`CanvasScene` in `Viewport.tsx`) to a
    soft architectural studio daylight gradient (`#F6F5F1` → `#EFECE6` →
    `#E5E2DA`), translucent porcelain ground plane with slate grid lines, and
    ground contact shadow; updated the 3D Infrastructure Three.js scene
    (`infrastructure-scene.tsx`) so `"Day"` (`#eeece6`) and `"Studio"`
    (`#f5f4f0`) lighting presets render a clean architectural masterplan site
    model (`#e3e5dd`).
  - Styled the top-center floating pill toolbar (`.ref-top-toolbar`), bottom
    3D orientation gizmo + `Orthographic` / `Perspective` switcher
    (`.ref-viewport-gizmo-dock`), right inspector (`InspectorCollaboratorBar`,
    `BinaryToggle` `Yes`/`No` and `Show`/`Hide` pills), and bottom
    `StudioAIChat` composer (frosted porcelain card with subtle rainbow
    architectural border and Cobalt Blue `#2563EB` accents) to match the unified
    soft architectural aesthetic.
- Focused ESLint on all modified studio files passed (0 errors), full-project
  typecheck (`NODE_OPTIONS="--max-old-space-size=4096" npm run typecheck`)
  passed, and `npm test` passed (8 tests). Browser rendering was not verified.

## Homepage mobile category placement

- Centered the homepage category chips on mobile and allowed them to wrap into
  rows, keeping Architecture and Interior Design visually centered between the
  hero and the following section. Desktop category layout is unchanged.
- Browser rendering has not been verified.

## Mobile text sizing

- Standardized mobile interface text, including labels, buttons, menus, and
  content, at 12px; larger display typography remains intact and SVG icons are
  excluded.
- The rule is limited to viewports at or below 700px; desktop styles are
  unchanged.
- PostCSS parsing and a focused assertion of the 12px mobile text standard
  passed; `npm test` passed (8 tests). Browser rendering was not verified.

## Homepage mobile CTA

- On mobile only, reordered the homepage CTA buttons to show Download App
  before Launch Studio and enlarged them to rounded pill controls, matching the
  provided reference while keeping the label text at the 12px mobile standard.
- Kept the homepage's Platform, Design, Company, and Legal footer visible and
  scrollable on mobile; retained its responsive column layout and set the
  footer content to a precise 24px left/right inset.
- Changed the homepage design-category chips to a single horizontal,
  touch-scrollable row with stable chip widths and the existing mobile side
  gutter.
- PostCSS parsing and a focused assertion of the mobile CTA order, button
  dimensions, shape, and label size passed; `npm test` passed (8 tests), and
  `git diff --check` passed. Browser rendering was not verified.

## Homepage mobile navigation

- Reworked the mobile header into a left menu-grid control, centered Casynus
  wordmark, and right profile icon; desktop navigation remains unchanged.
- Removed the rounded panel frame behind the mobile wordmark and controls in
  both light and dark themes while preserving the individual navigation
  actions.
- Precisely centered the mobile Casynus wordmark and standardized the Menu and
  Profile controls to matching 48×48px frames with identical borders and
  corners.
- PostCSS parsing and responsive layout assertions passed; `npm run typecheck`,
  `npm test` (8 tests), and `git diff --check` passed. Focused ESLint passed
  with one existing `<img>` warning after disabling the known unused
  `scrolled` parameter error. Browser rendering was not verified.
- Follow-up CSS measurement assertion and `npm test` passed for the centered
  wordmark and matching Menu/Profile frames. A repeated `npm run typecheck`
  and focused ESLint invocation terminated because Node ran out of memory;
  neither check completed for this follow-up.

## Mobile studio creation screen

- Replaced the mobile studio activity list with a focused creation home,
  segmented studio modes, central welcome mark, Pro banner, prompt composer,
  and bottom shortcut navigation inspired by the supplied reference.
- Refined the mobile components to the reference dimensions: 362×197px
  composer, 49px Pro banner, 40px attachment/model/action controls, 292×58px
  primary bottom navigation, and 58px search control. The top tabs now match
  Interior, Modeling, and Images, with Nano Banana as the default model.
- Set the mobile screen's horizontal inset to 24px; the segmented header
  center column contracts on narrower phones to preserve both side controls.
- Refined the mobile bottom navigation to match the supplied reference: a
  separated five-action capsule, a distinct active Home circle, subdued
  inactive icons, and a standalone circular Search control.
- Replaced the mobile prompt submit button's voice-wave icon with an
  enter-style right arrow to match the supplied reference.
- Standardized the mobile bottom row to the 24px screen inset, kept the Search
  control in a distinct 58px circular frame, and made the five capsule actions
  shrink evenly on narrow screens without overflowing.
- Aligned the complete mobile studio layout to the supplied measurement scale:
  44px top safe spacing, 40px header controls, 8/12/16/24px spacing increments,
  a 208px composer, 48px bottom navigation controls, and 24px bottom safe
  spacing; the 12px mobile text standard and desktop layout are preserved.
- The `/project` entry now opens this creation home on mobile while retaining
  the project dashboard on desktop. Menu, profile, pricing, workspace
  switching, new-scene, prompt, attachment, and generation actions remain
  connected to existing controls.
- `npm run typecheck`, `npm test` (8 tests), PostCSS parsing, responsive-rule
  assertions, and `git diff --check` passed. Focused ESLint reports existing
  unused-state errors; with that rule disabled it reports five existing
  `<img>` warnings. Browser rendering was not verified.

## Main navigation profile hover

- The signed-in profile dropdown opens and closes when its trigger is clicked;
  hovering over the trigger does not open it. Menu items have rounded corners
  and a light gray hover highlight, including the Log out button.
- `npm run typecheck`, `npm test` (8 tests), and `git diff --check`: passed.
- ESLint reports one existing unused `scrolled` parameter error and an existing
  `<img>` warning in this component; rerunning with only the unused-variable
  rule disabled reported no errors. Browser interaction was not verified.

## Homepage feature headings

- Removed the legacy “Planarch 3” and “Infra” prefixes from the homepage
  feature headings and replaced them with descriptive titles.
- Updated the matching titles across English, German, French, Italian, Chinese,
  Japanese, and Arabic translations.
- `npm run typecheck`, `npm test` (8 tests), `npx eslint src/app/page.tsx`, and
  `git diff --check`: passed. Browser rendering was not verified.

## Casynus product rebrand

- Replaced the former product name across user-facing page copy,
  descriptions, navigation labels, email templates, generated billing pages,
  and SEO/social browser metadata with Casynus.
- Added `/casynus` as the primary modeling route, updated internal links, and
  kept `/crystal` as a query-preserving redirect for existing links.
- Retained lowercase implementation identifiers and browser storage keys to
  preserve CSS bindings, component imports, and saved user data.
- `npm run typecheck`: passed; `npm test`: passed (8 tests); focused lint for the
  new/legacy routes and app metadata passed. Linting all changed TypeScript files
  reported 38 existing lint errors and 26 warnings, mainly unused symbols plus
  image/hook warnings; those unrelated findings were not changed for this
  rebrand.

## Casynus modeling UI kit

- Refined the `/casynus` modeling workspace into a componentized dark UI kit
  with a scene/assets sidebar, live model properties, viewport toolbar, and
  output controls.
- Connected topology, texture, and advanced toggles to workspace state; added
  searchable asset selection, hierarchy lock/visibility states, render queue,
  and sign-out actions.
- Reworked the viewport toolbar to include play, fullscreen, transform,
  selection, pen/eraser, cube, lighting, export, and camera navigation controls.
  The right utility buttons now drive viewport lighting, world, camera, grid,
  and help controls.
- `npm test`: passed (8 tests); `npm run typecheck`: passed; PostCSS parsing and
  `git diff --check`: passed.
- Focused ESLint reported no errors; it retains six existing warnings in
  `Viewport.tsx` (hook dependencies and `<img>` usage). Browser rendering and
  responsive interaction were not verified.

## `/aichat` Casynus logo theme styling

- Removed the blue square background and shadow from the Casynus mark in both
  expanded and collapsed sidebar states.
- The mark is white in dark mode and medium gray in light mode.
- Browser rendering was not verified.

## `/aichat` response typography

- Assistant responses now render markdown-style headings, numbered and bulleted
  lines, bold emphasis, and inline code instead of showing those markers raw.
- Assistant body text and headings use the common 16px chat reading size in
  Roboto; body text is regular weight, headings and numbered markers are bold,
  and emphasized text is bold. Light mode has matching readable colors.
- `npm test`: passed (8 tests); `npm run typecheck`: passed.
- Focused ESLint completed with no errors and five existing image/alt-text
  warnings in the page. `git diff --check`: passed.
- Browser rendering was not verified.

## `/aichat` standard reading size

- Increased assistant response body and heading text from 12px to 16px, matching
  the common default reading size used in chat interfaces; body weight is 400
  and headings retain bold emphasis.
- Inline code scales to 14px to remain legible within the larger response text.
- Browser rendering was not verified.

## `/aichat` empty-chat welcome

- Removed the centered Casynus logo and replaced the two-line personalized
  greeting with “What's on your mind today?” at the existing heading size.
- Kept the welcome text gray in dark mode and a darker gray in light mode. The
  heading was subsequently brightened for readability in dark mode.
- Browser rendering was not verified.

## `/aichat` response emphasis and lists

- Removed underlines from emphasized response text while retaining bold weight.
- Rendered consecutive markdown bullet items as numbered lists, restarting at
  1 after paragraphs, headings, blank lines, or explicitly numbered items.
- Browser rendering was not verified.

## `/aichat` composer typography

- Set the composer text and placeholder to 14px regular Roboto and aligned its
  single-line content vertically in the existing input frame using matching
  line height and compact vertical padding.
- Browser rendering was not verified.

## `/aichat` live provider responses

- Replaced the hard-coded sample reply with a request to `/api/ai-chat`, passing
  the conversation history to the server-side configured provider.
- Added working Gemini/Groq model selection; each selection uses its provider
  key on the server, with the other configured provider as a failover.
- Removed local sample-response fallback so missing provider configuration is
  returned as an error instead of appearing to be a real answer.
- Provider/API failures and empty responses are surfaced to the user rather
  than replaced by a success-shaped sample answer.
- Gemini and Groq API keys are present in local `.env` configuration and
  `.env` is ignored by Git; key values were not inspected or recorded.
- Updated the deprecated Groq model default to `openai/gpt-oss-20b` and
  normalize the old `llama-3.1-8b-instant` setting to the working default.
- Live Groq API request succeeded and returned `OK`; selecting Gemini currently
  fails over to Groq because Gemini reports that its free tier is unavailable
  in this country and billing must be enabled for the Google AI project.
- `npm test`: passed (8 tests); `npm run typecheck`: passed.
- Focused ESLint completed with no errors and five existing image/alt-text
  warnings in the page. `git diff --check`: passed.

## Infrastructure Studio

- Commit `f882192` added an interactive procedural 3D site editor to the
  existing `/infrastructure` route and `/infrastructur` alias. Its scene
  includes editable roads, buildings, water, bridges, parking, trees, paths,
  and public-realm elements; it also includes camera, lighting, selection,
  transforms, hierarchy, export, and local demo planning controls.
- The first editor increment had no durable client-side scene recovery. The
  current working increment adds versioned browser-local autosave with input
  validation, corrupt-data detection, explicit storage errors, and reload
  recovery. Cloud/workspace persistence remains unimplemented.

## Worktree notes

The infrastructure implementation is being updated after `f882192`.
`public/Section/Infra.png` and `public/Section/infra.jpg` were already deleted
in the worktree and are unrelated; they have not been restored or included.

## Compact viewport layout

- Removed the full-width editor header and moved undo/redo into the compact
  tools panel and scene export actions into the floating camera toolbar.
- Made the 3D canvas occupy the full viewport, with rounded translucent
  floating sidebars that preserve access to the tool library and inspector.
- Reduced camera and transform controls to compact toolbar buttons and added
  mobile panel toggles.
- `npm test`: passed (8 tests).
- Focused ESLint and focused TypeScript validation of the infrastructure
  modules: passed.
- PostCSS parsed the complete stylesheet and `git diff --check` passed.
- Browser rendering remains unverified. Full-repository typecheck and
  production build have previously terminated from Node/V8 out-of-memory and
  remain environment-limited.

## Browser-local scene persistence increment

- `tests/infrastructure-storage.test.mjs` covers empty storage, round-trip save,
  corrupt/unsupported snapshots, invalid/duplicate objects, and browser storage
  access/quota failures.
- `npm test`: passed (8 tests).
- Focused ESLint on the changed infrastructure editor and test modules: passed.
- Focused TypeScript validation on the infrastructure page, scene, storage
  declarations, and route alias: passed.
- `npm run typecheck`: blocked by Node.js heap out-of-memory in this checkout;
  the focused TypeScript validation passed, but the full repository typecheck
  remains unverified.
- `npm run build` with temporary local `DATABASE_URL` and `DIRECT_URL` values:
  Prisma Client generation passed; Next.js production compilation terminated
  with a V8 zone out-of-memory error. No live database connection was used.
- `git diff --check`: passed.
- Browser/WebGL interaction and reload testing remain unverified because no
  browser automation run was available.
