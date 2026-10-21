# Alternus AI / Casynus Roadmap

This roadmap tracks repository work from the current implementation, not
aspirational provider integrations. Priorities may change when code or user
requirements provide new evidence.

## P1 — Persistence and workflow reliability

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
