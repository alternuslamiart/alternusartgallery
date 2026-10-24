# Next tasks (reviewed 2026-10-24)

## Next concrete task

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

- Local Supabase DATABASE_URL/DIRECT_URL still fail URL parsing. In-memory
  password encoding fixes syntax, but both direct hosts are unreachable from
  this process and DNS exposes only IPv6. Need exact project's Session pooler
  strings saved to this workspace's .env; do not send passwords in chat.
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
