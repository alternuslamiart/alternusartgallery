# Verified progress

Last updated: 2026-10-21

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
