# Next tasks (reviewed 2026-10-21)

## Next concrete task

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

- [ ] Configure `YOU_API_KEY` in local `.env.local` and Vercel environment
  settings, then verify a live cited You answer, follow-up, database reload
  after logout/login, and selector interaction at desktop and mobile widths.

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
- [ ] Design authenticated infrastructure-scene persistence within an
  existing workspace/project API. Inspect Prisma project/asset models and
  ownership checks first; decide whether the scene belongs in a project
  snapshot or dedicated schema before implementation. Add a migration and
  authenticated API tests only after that decision.
- [ ] Optionally bridge `CyberDefenseTracker` strike/lockout state in Node API
  routes with Prisma `RateLimitBucket` (`src/lib/persistent-rate-limit.ts`) for
  multi-instance serverless persistence alongside Edge middleware protection.

## Blockers

- Built-in browser automation is blocked by the Windows sandbox startup error
  `helper_sandbox_lock_failed` (`SetNamedSecurityInfoW ... failed: 5`). The
  installed-Chrome fallback `scripts/verify-studios.mjs` works and completed
  theme/responsive/core-interaction verification. Node HTTPS downloads to npm
  and Google Fonts failed certificate verification; fix the environment's
  trusted certificate chain before installing browser tooling or validating
  downloaded Roboto fonts. Do not disable TLS verification.

- Gemini direct responses require billing to be enabled on the Google AI
  project: the configured key's API reports that the free tier is unavailable
  in this country. Groq is working and serves as the automatic fallback.
- Full-project lint has existing errors outside the recovered increment;
  focused lint passes. Final full typecheck and production build passed;
  stop local Next servers before regenerating Prisma on Windows
  to avoid an `EPERM` rename error on `query_engine-windows.dll.node`.
- Workspace persistence needs an explicit project association and database
  representation; browser-local autosave is not a substitute.
