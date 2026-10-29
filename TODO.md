# Next tasks (reviewed 2026-10-29)

- [x] Viewport Shading Styles in Casynus Studio (Normal Map, Albedo Map, MatCap, Solid Cavity):
  - Added real-time viewport shading style switcher in Casynus Studio (`/casynus`):
    1. PBR (Standard physical material with full lighting, roughness, metalness, and environment reflection).
    2. Normal Map: Visualizes tangent and camera-space surface normal vectors using RGB color channels (red = X+, green = Y+, blue = Z+).
    3. Albedo Map (Base Color): Shows pure diffuse color stripped of directional lighting and shadows.
    4. MatCap (Material Capture): High-contrast spherical clay/wax material capture preview ideal for sculpting and surface curvature inspection.
    5. Solid Cavity: Neutral matte clay plaster with crevice and ambient edge occlusion accentuation.
  - Controls accessible in two locations:
    - Top Viewport Toolbar (`StudioViewportToolbar.tsx`): Dedicated shading style dropdown selector right next to camera views.
    - Inspector Properties Panel (`SceneWorkbench.tsx`): Quick-toggle buttons directly under "Physical material" heading (`[PBR | Normal | Albedo | MatCap | Solid Cavity]`).
  - Implemented in `src/lib/scene/shading-modes.ts` with non-destructive material caching (`userData.__origMaterial`), instant GPU swapping, and viewport invalidation.

- [x] Complete 3D AI Texturing Guide & Shader Pipeline Specification:
  - Added comprehensive technical director specification in `docs/AI-3D-TEXTURING-GUIDE.md` covering 4 production texture styles:
    1. Tangent Space Normal Map: Vector channels (R/G/B), OpenGL vs. DirectX inversion (+Y), normalization math, height-to-normal diffusion, and AI prompt sets.
    2. Albedo / Base Color Map: De-lighting strategies, sRGB 30-240 dielectric ranges, metallic reflectance values, and shadowless diffusion prompts.
    3. MatCap (Material Capture): Camera-space normal UV mapping formulas ($U = 0.5 \cdot N_x + 0.5$), 2D sphere generation prompts, and Blender shader tree.
    4. Solid with Cavity (Clay / Crevice Render): Ambient occlusion + pointiness/curvature mixing, matte clay PBR parameters, and edge accentuation.
- [x] Blender 3D Object Import into Casynus Studio:
  - Added dedicated Blender 3D object import support across standard formats (`.glb`, `.gltf`, `.fbx`, `.obj`, `.stl`).
  - Added Three.js `FBXLoader` support in `src/lib/scene/geometry.mjs` for Blender-exported FBX files with meshes, materials, and hierarchy.
  - Added explicit `.blend` format handling with an explanatory error and guidance modal advising export to glTF 2.0 (`.glb`) or `.fbx`.
  - Automatic model placement on ground plane (`Y >= 0`) at cursor drop location or camera target point, with auto-selection and translation gizmo (`W`).
  - Added "Blender 3D Object" card in Left Sidebar under "Object library" with direct "Import Blender" and "Guide" actions.
  - Added "Import Blender Object" button in `StudioViewportToolbar` and File Menu item with guide modal.
  - Interactive "Blender Import Guide" modal explaining 1-click export steps from Blender (`File -> Export -> glTF 2.0 / FBX / OBJ`).
  - Added unit test in `tests/scene-geometry.test.mjs` verifying `.blend` rejection and guidance. All 203 tests pass.

- [x] Sketch Studio 2D architectural drafting enhancements and tool clean-up:
  - Add Arch / Curved Wall (`arch-wall`) tool with dedicated icon (`Spline`, shortcut `A`):
    - 180° outward semicircle (protruding balcony / bow bay connecting with apartment).
    - 180° inward semicircle (curved cutout / alcove into room / apartment).
    - Full circle wall (`mur rrethor`).
    - Real-time drag preview with span length, chord line, and Space shortcut to flip inward/outward.
    - SVG, PDF, and PNG export support with exact circular arc geometry.
  - Interactive room creation by dragging mouse:
    - Real-time room drag preview with width, height, dynamic dimensions, and calculated m² area badge.
    - On mouse release, creates room entity and 4 enclosing bounding walls that integrate seamlessly with apartment layout.
  - Wall editing with mouse drag:
    - Interactive endpoint handles (`start` and `end`) on selected walls and arc-walls to stretch, lengthen, shorten, and angle with grid/ortho snapping.
    - Midpoint/apex handle to toggle arc curvature between 180° inward and outward.
    - Wall line drag translates entire wall.
  - Removed `Play` (slow rotate triangle) and `+` (Plus / material library) buttons strictly in Sketch Studio (`hidePlus` & `hidePlay` in `StudioViewportToolbar`), preserving them in Architecture and Infrastructure.

- [x] Implement Desktop-only 712x140px Studio AI Chat generation loader frame:
  - Appears in center of screen upon Enter/Send in Studio AI chat prompt.
  - Size 712x140px, frame color #161616, 24px semibold headline ("Generate house modeling 3D..."), 12px medium subtitle.
  - 657x12px loading frame with #4C4C4C track and #0C8CE9 to #074F83 gradient fill.
  - Dynamic 20-second slow fill with countdown timer ("End: 00 min 20sec") and automatic dismissal once complete.
  - Strictly scoped to Desktop only (hidden on mobile <= 700px).
- [x] Implement pixel-perfect mobile Account page from {87F9376B-EFED-4BF4-A703-5E680F412341}.png:
  - Strict desktop isolation: no desktop frames/buttons (Launch Studio, administration sidebar, tables) on mobile.
  - Exact 48×48px circular frames: avatar, help, bell notification with red dot, AM badge, cashback badge.
  - Light and dark mode support with exact palette from {8B7B8C3A-7147-4A06-8D53-7A4B961399CE}.png (Dark: Background #121212, Frame #161616, Hover #2B2B2B).
  - Currency balance cards (120px height) for US Dollar (259.12), British Pound (2,012.60), and + New Account.
  - Big VISA card (304x208px) with gold chip, card number 2345, John Doe, 02/30, and 40px carousel pill indicator.
  - Transactions list with Amazon (-$12.12) and Cashback (+21.00).
  - Sticky bottom navbar with Dashboard, Investing, Explore, Hub tabs.
- [x] Strictly isolate mobile (< 430px) and desktop (> 430px) frames:
  - Route /casynus, /infrastructure, /architecture, and /sketch on mobile to mobile CrystalStudio (preventing desktop SceneWorkbench / 404s).
  - Guard desktop studio elements in CrystalStudio.tsx (!mobileViewport) so zero desktop frames render on mobile.
  - Implement mobile UI on /aichat from {CD7C1D34-2BAC-49C7-A72D-BED9DA9D91C8}.png with Arch.. header, Casynus hero, 362x197px composer, 333x49px Try Casynus Pro bar, Nano Banana dropdown, 40x40px attach/send with 325px gap, and 292x58px bottom navbar.
  - Separate desktop and mobile layouts in /aichat with explicit hidden min-[431px]:flex and flex min-[431px]:hidden.
- [x] Implement iPhone 17 mobile-first responsive UI (max-width: 430px) strictly isolated from desktop:
  - Scoped via @media (max-width: 430px) so desktop styles remain completely unaffected.
  - Dark theme (#0a0a0a near black background).
  - Exact sizes: AI Chat composer 362x197px, Try Crystal Pro button 333x49px, Pay Now button 75x36px, circular 40x40px attach and blue send buttons with exact 325px distance between them, 171x40px Nano Banana AI model switcher, 292x58px bottom navbar with 48x48px icon buttons and 58x58px search button.
  - Top tab bar with icons + text (Animate, Modeling, Images) flanked by grid and glasses buttons.
  - Central AI logo + "What’s on your mind today?".
  - 3D house / farm isometric preview cards.
  - Floating action toolbar in Viewport with record, cube, sparkle, folder, camera, sun, and help.
  - Texture modeling panel with 6 spherical material previews.
- [x] Apply #161616 project page background, #2B2B2B top header and hover color, full-frame image coverage on project cards, and #2B2B2B profile frame background in UnifiedSidebar.
- [x] Refine /project dashboard: clean UnifiedSidebar to show only active Casynus studio items, align search bar to standard aichat size, integrate unified StudioProfileMenu with user session, rename Launch Studio to New Project (opening /casynus), apply dark grey background, make header straight without rounded corners, and set wave0/wave1/wave2 card backgrounds.
- [x] Delete legacy pages /aicode and /archplan; clean up all references across navigation, AI chat search destinations, unified workflow links, and studio project cards.
- [x] Redesign studio toolbar icons to be clearly identifiable for their operations
  (Move: 4-way `Move` cross arrows replacing `Route`, Scale: diagonal `Maximize2`
  replacing `Focus`, Wall: `BrickWall`, Window: `AppWindow`, Room: `LayoutGrid`,
  Dimension: `RulerDimensionLine`, Text: `Type`), render clicked/active icons as
  fill-bold (`fill: currentColor` on closed silhouettes, `stroke-width: 2.35px`
  and subtle depth shadow), and render unclicked icons thinner (`stroke-width: 1.65px`)
  with crisp geometric definition (`color: #cbd5e1` / `var(--studio-text-secondary)`)
  across Architecture, Infrastructure, and Sketch Studio.
- [x] Rename Interior to Sketch across studio navigation, headers and AI chat;
  implement the dedicated sidebar-free Pencil Studio (`SketchWorkspace.tsx`,
  `src/lib/sketch.mjs`, `sketch-export.ts`, `useSketchProject.ts`,
  `/api/sketch-projects`) with `#404040` workspace, `New Canvas` setup dialog,
  top-left Profile & Settings buttons, top 54×54px/40×40px horizontal toolbar,
  right-side expandable panels, bottom-centered AI Chat, CAD+sketch persistence,
  PNG/SVG/PDF/JSON exports, unified 54×54px/40×40px `StudioViewportToolbar` across
  Architecture/Infrastructure/Sketch CAD, toggleable slow object rotation on the
  toolbar triangle (`Play`) button across all studios, unified floating Profile menu (`StudioProfileMenu` across studios, homepage `CoreforgeNav`, `/account` and `/aichat`) + Casynus AI
  Studio Settings frame (`StudioSidebarFooter.tsx`), and PgBouncer pooler/transaction fix
  for `/api/studio-projects`. Verified with unit tests and live Chrome QA.
- [ ] Verify deployed `/interior` Sketch Studio cloud save/reopen and exports in
  production after pushing to `main`.

- [x] Persist `/aichat` sidebar pin/unread/project actions, surface rename/delete
  failures and share actual conversation content. Verify real local signed-in
  chat persistence and logout/login with Groq/You and Gemini-to-Groq failover.
- [ ] Deploy the chat sidebar and existing usage reservation fixes, then verify
  authenticated production `/aichat` and browser interactions. The additive
  `prisma/ai-chat-sidebar.sql` is already applied to the configured database.
  Native Gemini still requires Google AI Studio billing; real Groq and You pass.

- [x] Repair AI usage reservation P2002/P2028 failures and verify live database
  concurrency, refunds, plan limits and workspace isolation with temporary data.
- [ ] Deploy the usage transaction fix and verify a signed-in studio chat request
  on the deployment; local source/live-database verification alone does not
  update the deployed application.

- [ ] Enable billing on the Gemini Google AI Studio project: the existing key
  returns country/free-tier FAILED_PRECONDITION. Groq and You direct live calls
  pass. Confirm all three readiness flags after deployment and perform signed-in
  `/aichat` conversation/save/reload acceptance; keys are sensitive Production
  variables and must never be committed.

- [x] Remove the unnecessary SQ/EN/DE dropdown from the studio AI chat composer.

- [ ] Capture the affected account's actual failing context/Prisma code if the
  alert recurs. Paced post-deployment production acceptance now passes all three
  studios, two-account isolation and logout/login; prior auth 429/connection
  timeout blockers did not recur. The original customer request is unobserved.

## Next concrete task

- [x] Repair generic cloud-loading fallback, first-upload 404 handling and
  recovery upload gating; preserve dirty recovery when choosing the cloud copy.
- [ ] Match the affected project's URL/GET response to production telemetry if
  the issue recurs. Current production QA and database checks pass; no failing
  customer request was captured. Do not infer database failure from fallback UI.

- [ ] Reproduce the affected user's request if a failure remains and inspect its
  actual HTTP response plus sanitized storage telemetry. Two-account ownership
  and production logout/login are now verified. Three-studio browser recovery
  passes injected HTTP outages/conflicts; affected-account recovery during a
  real outage and live GPU insertion remain unverified.

- [x] Correct production DATABASE_URL/DIRECT_URL to verified poolers for the same
  database/credentials and preserve actual workspace save errors in generation.
- [x] Verify real authenticated production save/read, concurrent revision
  conflict, sign-out denial and login/reopen after activating corrected settings.
- [ ] Configure the separate secured remote GPU worker and private asset storage
  before production Hunyuan image generation; both remain unprovisioned.

- [x] Correct premature Hunyuan unavailable alerts and add session preflight plus
  an actionable Sign in link before guest generation. Local provider/worker are
  available; the public deployment still needs its own remote GPU/storage setup.

- [ ] Complete live authenticated Hunyuan acceptance; both local database URLs
  passed read-only connection checks on 2026-10-25. Upload a reference
  through existing 3D studio chat, generate, insert, save, logout/login and reopen.
  Real worker CUDA output and native GLB import are verified independently.
  Production requires a secured remote GPU worker, private object storage/signed
  downloads and applicable Tencent license authorization; do not enable local
  filesystem/localhost architecture on Vercel. See `docs/HUNYUAN3D-LOCAL.md`.

- [ ] Verify live signed-in Gemini/Groq contextual editing and cloud save/reopen;
  local finite editing is independent of provider availability. Expand semantic
  mesh/CAD constraints beyond parametric roof slabs and rectangular window hosts.
  See `docs/CONTEXTUAL-SCENE-EDITING.md`.

- [x] Align `/reset-password` with Login/Signup using the shared AuthShell.
- [ ] Verify real reset email delivery and a valid expiring reset link in the
  deployed environment; local UI verification uses intercepted API responses.

- [x] Rerun the full studio-command browser verifier after building with
  `NEXT_PUBLIC_INFRASTRUCTURE_MAP_STYLE=https://tiles.openfreemap.org/styles/liberty`.
  Full run passed, including homepage client navigation with real synthetic
  microphone capture, map controls and 2D checks. Reload existing deployed tabs
  after the document-policy update; physical-device production checks remain.

- [x] Share the compact Voice Speech modal and real bilingual studio command
  registry between microphone, Voice and typed chat without replacing studio UI.
- [ ] Complete physical-device voice-command and authenticated production-save
  verification. Keep unsupported 2D mesh/height/lighting and read-only map actions
  explicit; see `docs/STUDIO-ACTIONS.md` for actual capabilities and dependencies.

- [x] Fix studio microphone policy/refused speech-service classification and
  implement real capture/meter, transcription fallback and spoken conversation.
- [ ] Verify physical microphones, English/Albanian recognition and audible TTS
  in deployed HTTPS target browsers. Verify one signed-in Groq transcription
  with a reachable limiter database and provider quota. See `docs/VOICE-COMMANDS.md`.

- [x] Make the Infrastructure World Map toggle a compact icon button so it no
  longer overflows the viewport toolbar (verified at 1440px).
- [x] Integrate Infrastructure's MapLibre 6.15.0 globe, correct its separate
  ESM worker/worker CSP, preserve mounted editor/history and verify interaction.
- [x] Default to OpenFreeMap production vector tiles and connect feature
  selection/highlight, fullscreen, fit, perspective buildings and import of
  source-height buildings/flat land into the existing editable scene/history.
- [ ] Verify deployed MapTiler address/city search with valid server credentials.
  Remove any placeholder map-style override to use the OpenFreeMap default.
  Add complete-feature retrieval across tile boundaries before surveyed/CAD
  claims; road drawing, geometry snapping and terrain mesh import remain future
  work. See `docs/INFRASTRUCTURE-MAP.md`. User authorized main/production push.

- [x] Fix shared studio surface picking and X/Y/Z gizmo drag selection;
  verify axis constraints, single-step Undo/Redo and light/dark multi-selection.
- [ ] Extend transform browser coverage to rotated parent groups, rotate/scale
  handles and touch/pointer cancellation; current drag coverage is mouse X/Y/Z.

- [x] Refine Homepage tools to one transparent, continuously scrolling row,
  removing the pause icon and two-row fallback as requested.

- [x] Audit public production routes and add the requested Homepage tools
  marquee with continuous movement, pause and reduced-motion support.
- [ ] Resolve findings in `docs/SITE-AUDIT-2026-10-22.md`: configure/verify 3D
  and payments, fix code-workspace hydration, implement Help Center, clear
  lint and verify signed-in storage/Usage/quotas with a reachable database.

- [x] Align Homepage/nav to 1280px, retain sticky glass navigation and apply
  8px button/24px image corners; verify responsive geometry and actual scroll.

- [x] Redesign only the Homepage with isolated editorial layouts, preserved
  content/order/typography/blue and the existing glass navbar; verify six
  viewport widths in both themes and existing video/navigation interactions.

- [x] Restore original Usage triplet/chart and Limits row-card designs while
  keeping real plan quotas; add stable loading placeholders and timeout/Retry.

- [x] Restore the existing `/aichat` 8px frame visibility in light/dark by
  removing only background overrides; verify desktop/mobile in Chrome.

- [x] Replace profile Usage demos with real persisted workspace AI credits and
  Basic/Pro/Teams/Studio limits at 1x/4x/10x/20x; enforce before provider calls.
- [x] Route Prisma schema operations through DIRECT_URL; verify production
  build with Windows trusted CA certificates and local Usage browser behavior.
- [ ] Apply additive plan enum SQL, deploy, and verify authenticated usage,
  429/refunds, cross-workspace access, UTC renewal and paid plan assignment on
  staging/production. See `docs/AI-USAGE.md`. Automatic payment verification
  remains unconfigured; process crashes/refund-write failures require operator
  reconciliation. Live PostgreSQL concurrency remains pending; desktop browser
  QA passed with mocked HTTP. Opt-in verifier:
  `node scripts/verify-ai-usage-database.mjs --apply-plan-enum --write-test-data`.
  Local .env URLs still need password URL encoding and reachable Supabase
  Session pooler endpoints; current direct hosts only resolve to IPv6.

- [x] Add Interior door handedness/swing, real object drag, reliable wall
  creation over existing geometry, precision controls and document undo/redo.
- [ ] Add explicit wall-host relationships and opening overlap validation before
  claiming constrained wall edits that automatically reposition attached openings.

- [x] Fit and center Interior plan exports on the sheet with small white
  margins, preserving proportions across SVG/PDF/raster output.
- [ ] For dimensioned print workflows, add an explicit fixed-scale export
  option alongside the requested fit-to-page default.

- [x] Open a real texture/material asset library from toolbar +, with upload
  and undoable multi-selection application; pin Settings/Profile sidebar footer.

- [x] Show every 3D selection with blue-primary/green-additional outlines and
  synchronize hover/selection identification with Scene hierarchy, including
  Interior's original SVG plan hierarchy.

- [x] Add opt-in Hey Casynus voice commands and Ctrl + Q to the shared studio
  AI dock, preserving provider submission and scene preview approval.
- [ ] Verify physical microphone permission, wake accuracy and SQ/EN/DE
  recognition in deployed target browsers; current voice tests inject results.

- [x] Match Interior's right inspector to the other studios, keeping actual
  plan editing and exports; verify dimensions stay within the sidebar.

- [x] Apply the horizontal 1181px reference design to Login and Signup;
  verify responsive themes and mocked form flows without changing auth APIs.

- [x] Align toolbar/AI dock to the 12px sidebar edges; simplify Interior's
  sidebar to header/navigation/project and real plan hierarchy, preserving
  architectural drafting. Remove Architecture's previous-tools footer.

- [ ] After configuring Meshy/Tripo keys, credits and deployed workspace DB,
  verify one authenticated real generation per provider, refresh/resume,
  texture import, Apply/Undo and cloud save/reopen. Follow `docs/AI3D-SETUP.md`.
  Current automated/browser verification uses mocked provider/job adapters
  with genuine GLB data. Recheck CDN CORS and Vercel proxy size limits live.

- [x] Show the 3D scene through the sidebar padding and remove Infrastructure's
  additional detailed-editor footer link without changing stored scenes.
- [x] Match the Infrastructure toolbar across studios with the appropriate
  modeling or architectural drafting tools and functional camera/export controls.

- [x] Apply the clarified studio spacing request and restore `/interior` to
  the original 2D drafting workspace. Keep 3D at `/interior?workspace=3d` and
  preserve workbench actions in the sidebar project menu.

- [ ] Verify `/api/studio-projects` with a real signed-in staging account:
  save, reload, logout/login, two-tab conflict and foreign workspace access.
  Verify native Gemini/Groq scene proposals on the deployed models. Current
  route tests mock auth/database/providers; see `docs/SCENE-STUDIOS.md`.
- [ ] Extend the shared scene editor with true mesh component operations,
  architectural constraints and terrain/road editing; complete remaining
  acceptance checks and performance profiling listed in that status document.

- [ ] Verify the redesigned `/login` against real configured OAuth providers,
  email-code delivery, age collection, and an authenticated callback in a
  staging environment; local browser QA used a mocked code endpoint.

- [x] Finish the interrupted shared studio UI kit and browser-session dock
  recovery. Verify both themes at 1440/390px, mobile editor entry and panel
  controls, inspector collapse, keyboard toolbar navigation, chat recovery,
  and mock-account isolation. See `docs/PROGRESS.md` for exact coverage.
- [ ] Design and implement authenticated conversation persistence for the
  shared studio AI dock, reusing `AssistantConversation` and
  `AssistantMessage` with explicit studio context and workspace ownership.
  Start by specifying conversation scope across studios and guest import;
  the completed per-identity sessionStorage recovery is not cloud storage.
- [ ] Extend browser coverage to inspector edits, secondary menus/dialogs,
  camera/transform/lighting/export interactions, and autosave reload. Inspect
  the infrastructure edge-line artifacts and initial floor-plan framing seen
  in the screenshots before marking full viewport visual QA complete.
- [ ] Select and configure an image-capable provider before exposing image
  generation controls. You.com Answer is documented for cited answers only.

- [x] Connect studio/mobile Gemini, Groq and You selections to the server,
  separate answer generation from storage failures, and verify provider UI
  routing plus account-change cancellation with mocked HTTP responses.
- [ ] Verify a signed-in You answer and cloud conversation reload after the
  new deployment in Vercel. Live Gemini/Groq calls on the production chat API
  and a direct You call with the local configured key passed; the signed-in
  deployed session/database path still needs an authenticated production run.

- [ ] Verify the Soft Dark Generative AI Platform (`/studio-ai`) and Interactive
  Soft Dark UI Kit (`/ui-kit`) in a browser at desktop and mobile viewports,
  including the showcase filter tabs, interactive form controls, tooltips, toast
  triggers, and modal dialog.
- [ ] Verify the Soft Frosted Porcelain Casynus Studio Ecosystem UI (`/casynus`,
  `/interior`, `/casynus?mode=floor-plan`, and `/infrastructure`) in a browser
  at desktop and mobile widths, including the daylight 3D/2D viewports,
  floating frosted-porcelain sidebars, top pill toolbar, `BinaryToggle` pills,
  and bottom `StudioAIChat` composer.
- [x] Remove homepage category chips and redesign the three capability cards
  as inset image frames; verify desktop/tablet/mobile in both themes.
- [x] Move capability headings onto the card backgrounds, use the supplied
  wave images, enlarge descriptions to 24px, and align desktop frame edges.
- [x] Refine the studio sidebar header to the supplied Generative 3D design
  with readable centered text and evenly sized back/theme/collapse controls.
- [ ] Design authenticated infrastructure-scene persistence within an
  existing workspace/project API. Inspect Prisma project/asset models and
  ownership checks first; decide whether the scene belongs in a project
  snapshot or dedicated schema before implementation. Add a migration and
  authenticated API tests only after that decision.
- [ ] Optionally bridge `CyberDefenseTracker` strike/lockout state in Node API
  routes with Prisma `RateLimitBucket` (`src/lib/persistent-rate-limit.ts`) for
  multi-instance serverless persistence alongside Edge middleware protection.

## Blockers

- Local Supabase DATABASE_URL/DIRECT_URL now pass read-only SELECT 1 through
  configured transaction/session poolers (2026-10-25). A stale inherited shell
  DATABASE_URL override remains; start QA with the intended file environment.
  Live authenticated generation/save/reopen is still an outstanding check.
- The production build now passes when NODE_EXTRA_CA_CERTS points at Windows
  trusted Root/CA certificates exported under .tmp. The default Node trust
  configuration is unchanged; prior Google Fonts certificate errors can recur
  in processes that do not load this trusted CA bundle. TLS was not disabled.

- Built-in browser automation is blocked by the Windows sandbox startup error
  `helper_sandbox_lock_failed` (`SetNamedSecurityInfoW ... failed: 5`). The
  installed-Chrome fallback `scripts/verify-studios.mjs` works and completed
  theme/responsive/core-interaction verification. Node HTTPS downloads to npm
  and Google Fonts failed certificate verification; fix the environment's
  trusted certificate chain before installing browser tooling or validating
  downloaded Roboto fonts. Do not disable TLS verification.

- The previous Gemini billing/location blocker did not reproduce on
  2026-10-21: the deployed Gemini endpoint returned a real successful answer.
  Vercel CLI access in this session is blocked by
  `UNABLE_TO_VERIFY_LEAF_SIGNATURE` fetching its OpenID configuration;
  deployment settings and authenticated production chat were not inspected.
- Full-project lint has existing errors outside the recovered increment;
  focused lint passes. Final full typecheck and production build passed;
  stop local Next servers before regenerating Prisma on Windows
  to avoid an `EPERM` rename error on `query_engine-windows.dll.node`.
- Workspace persistence needs an explicit project association and database
  representation; browser-local autosave is not a substitute.
