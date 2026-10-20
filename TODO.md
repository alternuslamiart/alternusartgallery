# Next tasks (reviewed 2026-10-20)

## Next concrete task

- [ ] Verify light and dark themes in `/casynus`, `/interior`,
  `/infrastructure`, and `/aichat` at desktop and mobile widths. Check menus,
  inspector inputs, chat collapse/reopen, and viewport contrast; fix any
  remaining hardcoded surfaces found in the browser.
- [ ] Design and implement authenticated conversation persistence for the
  shared studio AI dock, reusing `AssistantConversation` and
  `AssistantMessage` with explicit studio context and workspace ownership.
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
- [ ] Verify homepage category-chip centering and wrapping at narrow and wide
  mobile viewport widths in a browser.
- [ ] Design authenticated infrastructure-scene persistence within an
  existing workspace/project API. Inspect Prisma project/asset models and
  ownership checks first; decide whether the scene belongs in a project
  snapshot or dedicated schema before implementation. Add a migration and
  authenticated API tests only after that decision.
- [ ] Optionally bridge `CyberDefenseTracker` strike/lockout state in Node API
  routes with Prisma `RateLimitBucket` (`src/lib/persistent-rate-limit.ts`) for
  multi-instance serverless persistence alongside Edge middleware protection.

## Blockers

- Browser automation crashed twice while opening the local studio on port
  3002, so visual theme and responsive behavior remain unverified.

- Gemini direct responses require billing to be enabled on the Google AI
  project: the configured key's API reports that the free tier is unavailable
  in this country. Groq is working and serves as the automatic fallback.
- The production build exceeds the available Node heap during compilation in
  this environment. The latest full-project typecheck passes; retry the
  production build on a larger-memory runner.
- Browser automation/WebGL verification is not configured in the current test
  tooling. Use a browser-capable environment before claiming camera or
  responsive interaction verification.
- Workspace persistence needs an explicit project association and database
  representation; browser-local autosave is not a substitute.
