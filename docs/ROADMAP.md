# Alternus AI / Casynus Roadmap

This roadmap tracks repository work from the current implementation, not
aspirational provider integrations. Priorities may change when code or user
requirements provide new evidence.

## P1 — Persistence and workflow reliability

- [x] Add exact selected-component chat context, validated reversible scene
  execution, real wall openings/roof edits and target-only GPU editing feedback.
- [ ] Verify native scene planning and authenticated save/reopen with a live
  signed-in workspace; extend constrained architectural/mesh topology editing.

- [x] Permit same-origin microphone on entry documents as well as studios so
  client navigation from homepage/login does not retain a blocking voice policy.

- [x] Connect the shared 271×138 Voice Speech modal and validated bilingual
  command registry to actual 3D/2D editing, MapLibre navigation, history, panels,
  exports, route navigation and confirmed persistence; protect destructive edits.
- [ ] Verify acoustic English/Albanian commands, installed TTS voices and signed-in
  cloud save with real production providers; broaden finite intent synonyms and
  compound-command clarification using the existing validated AI proposal flow.

- [x] Integrate MapLibre 6.15.0 World Map into Infrastructure with retained
  3D editor state, geographic selection, markers and a server geocoding adapter.
- [x] Add key-free OpenFreeMap production tiles, rendered-feature selection,
  fit/fullscreen and source-height building/flat-land import with geographic
  provenance, existing transforms, history and persistence.
- [ ] Verify deployed address/city search with valid MapTiler credentials;
  add complete-feature retrieval, geographic road drawing and terrain data.

- [x] Separate shared 3D object picking from gizmo dragging and verify X/Y/Z
  axis movement with single-step Undo/Redo across all three scene studios.

- [x] Complete Interior pointer drag, handed door symbols, precision inputs,
  repeated wall drawing and undoable drafting edits within the original UI.

- [x] Center and fit Interior plan exports to the sheet with uniform scaling
  and small margins, sharing framing across vector and raster formats.

- [x] Add the shared horizontal texture library and static sidebar footer,
  reusing real 3D material editing and preserving Interior drafting.

- [x] Complete visible multi-selection feedback and canvas/hierarchy hover
  identification, retaining original Interior sketching interactions.

- [x] Match Interior's right inspector presentation to the 3D workspaces
  while preserving architectural plan property controls and exports.

- [x] Align studio overlays with inset panels and give Interior the shared
  sidebar presentation with only project navigation and its real plan tree.

- [x] Connect real 3D provider jobs, progress/recovery, GLB import/preview/undo
  and server-only key discovery. Meshy/Tripo adapters and deployment setup
  are implemented; live paid-provider/database verification remains pending.

- [x] Extend the real design canvas behind inset sidebars and padding while
  keeping editor controls above it; remove the extra Infrastructure editor link.
- [x] Share the original Infrastructure toolbar appearance across studios,
  retaining studio-specific tools and actual camera/export actions.

- [x] Remove the new workbench top strip, add 12px panel spacing/corners, and
  restore Interior's original architectural plan sketcher while keeping 3D.

- [x] Deliver a shared real 3D modeling workflow across all three studios:
  editable templates, genuine transforms, PBR, import/export, recovery,
  scoped snapshot API and validated AI preview. See `SCENE-STUDIOS.md`.
- [ ] Verify live authenticated cloud scene save/reopen and native AI tools;
  complete CAD mesh editing, semantic constraints and rendering optimization.

- [x] Persist the Infrastructure Studio scene across browser reloads using
  versioned, validated browser-local autosave.
- [x] Implement authenticated snapshots for the new shared Infrastructure
  workbench. Legacy site-editor persistence remains browser-local; live cloud
  deployment verification is pending.
- [ ] Verify the Infrastructure Studio in a browser, including WebGL
  availability, responsive side panels, camera interaction, selection,
  transforms, lighting, and local autosave recovery.
- [ ] Expand automated coverage beyond the current platform validation and
  infrastructure-storage unit tests; prefer behavior tests for shared APIs and
  editor state.

## P2 — Existing platform integration

- [x] Match password reset request/token/success screens to the shared Login and
  Signup frame, themes and responsive styling while retaining the existing APIs.

- [x] Implement durable AI usage, profile percentages/history and plan quotas:
  Basic 200, Pro 800, Teams 2,000, Studio 4,000 monthly application credits.
- [x] Verify the Usage UI against a local production build with mocked HTTP;
  use DIRECT_URL for Prisma schema operations and add an opt-in DB verifier.
- [ ] Apply plan enum SQL and verify deployed authenticated usage and real paid
  plan assignment; local Supabase URLs/IPv6 reachability currently block this.
  Connect verified payments separately. See `AI-USAGE.md`.

- [x] Add browser voice dictation, opt-in Hey Casynus wake and Ctrl + Q to
  studio AI docks. Physical microphone/browser-service verification is pending.
- [x] Repair studio microphone Permissions Policy and error classification; add
  explicit capture/meter, bounded authenticated transcription fallback and opt-in
  voice conversation using existing text providers plus browser speech playback.
- [ ] Verify physical-device speech accuracy, installed Albanian/English voices
  and deployed HTTPS behavior; server fallback needs Groq credits and a reachable
  persistent limiter database.

- [x] Match Login and Signup to the horizontal reference with a shared
  1181px maximum frame, responsive stacking and preserved auth handlers.

- [x] Connect the three studio AI docks and mobile composer to Gemini, Groq,
  and authenticated You Answer requests; surface storage failures separately
  from generated answers and retain explicit local editor modes.

- [x] Redesign `/login` with a responsive soft UI while retaining the existing
  OAuth, email-code, and age-collection flows; verify local browser behavior.

- [x] Share a persisted light/dark preference and theme toggle across the
  three studios and `/aichat`; adapt viewport environment colors.
- [x] Complete the interrupted shared UI kit and tab-local conversation
  recovery; verify desktop/mobile themes and core dock interactions in Chrome.
- [ ] Complete visual QA and remove remaining hardcoded light/dark surfaces
  in secondary dialogs and less-used controls beyond the verified baseline.
- [ ] Connect the shared studio AI dock to authenticated conversation storage
  with studio context and validated scene-action tools.

- [x] Rebrand user-facing product content, browser metadata, and email
  templates to Casynus while preserving the legacy route.
- [x] Bring the `/casynus` modeling workspace into the dark Casynus UI kit with
  componentized scene, properties, viewport toolbar, and output controls.
- [ ] Wire existing workspace screens to the authenticated platform APIs where
  the UI still relies on local-only state.
- [ ] Keep API routes, request validation, and `docs/backend-platform.md`
  consistent as workspace features are connected.
- [ ] Add durable, workspace-scoped infrastructure scene storage only after
  selecting and documenting its project/data model and migration strategy.

## Deferred provider integrations

`/aichat` is integrated with server-side Gemini, Groq, and You Answer API
routes when credentials are configured. You provides a single cited answer per
query with bounded prior context. AI capabilities exposed through workspace
stub endpoints, along with CAD, Blender generation, rendering, and payment,
remain deferred until their own providers are configured, secured, and
covered by integration tests. Do not present stub output as a live provider
result.
