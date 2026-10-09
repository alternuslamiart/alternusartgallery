# Alternus AI / Crystal Roadmap

This roadmap tracks repository work from the current implementation, not
aspirational provider integrations. Priorities may change when code or user
requirements provide new evidence.

## P1 — Persistence and workflow reliability

- [x] Persist the Infrastructure Studio scene across browser reloads using
  versioned, validated browser-local autosave.
- [ ] Add authenticated workspace/project persistence for Infrastructure Studio
  after the project association and database representation are designed.
- [ ] Verify the Infrastructure Studio in a browser, including WebGL
  availability, responsive side panels, camera interaction, selection,
  transforms, lighting, and local autosave recovery.
- [ ] Expand automated coverage beyond the current platform validation and
  infrastructure-storage unit tests; prefer behavior tests for shared APIs and
  editor state.

## P2 — Existing platform integration

- [ ] Wire existing workspace screens to the authenticated platform APIs where
  the UI still relies on local-only state.
- [ ] Keep API routes, request validation, and `docs/backend-platform.md`
  consistent as workspace features are connected.
- [ ] Add durable, workspace-scoped infrastructure scene storage only after
  selecting and documenting its project/data model and migration strategy.

## Deferred provider integrations

AI, CAD, Blender generation, rendering, and payment capabilities that are
documented as local stubs remain deferred until a real provider is configured,
secured, and covered by integration tests. Do not present stub output as a live
provider result.
