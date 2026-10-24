# Shared 3D studios — engineering status

## Provider integration update

Real Meshy/Tripo frontend/backend job adapters, authenticated persistence,
progress/resume and GLB preview/apply are now implemented. Gemini/Groq scene
mode executes validated transform/material/environment operations. See
`AI3D-SETUP.md` for key names, routes, limits and deployment checks. Live paid
provider/database verification is still pending; automated and browser tests
use mocked upstream HTTP with real geometry. Existing advanced CAD limitations
listed below still apply.

## UI correction after the initial increment

The user's clarified request restores `/interior` as the original 2D drafting
editor; use `/interior?workspace=3d` for the new furnished-room 3D engine.
Architecture and Infrastructure keep the engine, remove the full-width top
strip, and use 12px insets/corners. All former strip actions remain in the
sidebar project actions menu. No scene schema or persisted projects changed.

## Audit and delivered increment (2026-10-21)

Architecture's previous modeling viewport used a 2D canvas. Interior retained
working SVG drafting. Infrastructure already used Three.js. The new default
`/casynus`, `/interior`, and `/infrastructure` routes share a genuine R3F/Three.js
editor and one versioned, metric scene document. Existing editors remain at
`?workspace=classic`; architecture also preserves `mode=floor-plan`.

### Phase 1: real end-to-end scene editing

- Mesh picking, hierarchy selection, Shift/Ctrl multi-selection, translation,
  rotation, scale, real transform gizmos, snapping, duplicate, delete, group,
  ungroup, hide, lock, bounded undo/redo and meter measurements.
- Perspective/orthographic cameras, named axis views, frame/focus, orbit/pan/
  zoom, pointer-lock WASD walkthrough and camera recovery. Gizmo operations
  disable orbit to prevent interaction conflicts.
- Shared dark/light tokens, collapsible side panels, responsive viewport,
  file/edit/view/tools/camera/render/export menus and existing bottom AI chat.

### Phases 2–3: initial tools and studio workflows

- Editable dimensions, PBR presets, color/roughness/metalness/opacity/
  transmission, embedded texture slots and UV repeat, point/spot lights,
  sunlight azimuth/elevation/intensity, exposure and shadows.
- ACES/SRGB, generated studio environment reflections, soft raster shadows,
  and Performance/Balanced/Ultra raster quality settings. Ultra is not path
  tracing. No claim of global illumination or offline photorealism.
- Building template with level groups, slabs, segmented window openings,
  glazing and roof; furnished room with editable furniture parts; urban
  intersection with independently editable roads, markings, sidewalks,
  buildings and streetlights. Procedural asset library supports drag/drop.
- Geometry editing, extrude/inset/bevel and vertex/surface snapping are
  explicitly unavailable in the menus. Existing detailed site editor remains
  accessible for its road/site workflows.

### Phase 4: persistence and interoperability

- Validated version-1 JSON snapshots (8 MB, 1000 objects, 200k imported vertex
  budget); IndexedDB per-identity recovery, debounced autosave, reopen dialog,
  recovery before navigation, save-as-copy and cloud revision conflict UI.
- Authenticated `/api/studio-projects` scopes every read/write by workspace
  AND user, creates canonical CAD Project rows, and stores snapshots in the
  existing `BlenderProject.settings` JSON container with `kind=casynus-scene`.
  This does not execute Blender jobs. No schema migration is needed.
  Atomic revision comparison rejects concurrent/foreign-ID overwrites.
- Real GLB/glTF, OBJ, STL and project JSON exports, PNG/JPEG framebuffer
  screenshots; GLB/glTF/OBJ/STL imports. glTF resources must be embedded;
  animations, skinning and unsupported lights are rejected explicitly.
  GLB/glTF preserve compatible hierarchy/materials/textures; OBJ/STL do not
  preserve editor state. JSON is the full editor snapshot.

### Phase 5: validated AI scene proposals

- Gemini native function declarations and Groq native tool calls produce
  allowlisted template/create/move/material/delete/environment operations.
  Server and browser validate the whole transaction, reject invalid IDs,
  locked objects and unsupported operations, and never execute generated code.
- Reversible native commands now execute automatically as one undoable action
  after complete transaction and selection-scope validation. Delete commands
  require expiring, state-bound confirmation. Stale responses are rejected;
  Meshy/Tripo model import retains preview/Apply. See `CONTEXTUAL-SCENE-EDITING.md`.
- You remains research chat; it is not presented as a scene command provider.
  Existing provider text chat remains available with scene mode off.
- Protocol references: [Gemini function calling](https://ai.google.dev/gemini-api/docs/function-calling),
  [Groq local tool calling](https://console.groq.com/docs/tool-use/local-tool-calling).

## Verification and acceptance boundaries

- `npm test`: 55 passing tests, including group/ungroup world transforms and
  actual route handlers with mocked
  auth/storage/provider adapters, ownership isolation, stale revisions, storage
  failures, AI command validation and native provider payloads.
- Geometry tests create real Three meshes; export GLB, reopen it, compare
  bounds/hierarchy/light counts; OBJ/STL are reopened as editable mesh data.
- Chrome automation (`scripts/verify-scene-studios.mjs`) exercises actual
  WebGL, inspector move/rotate/scale, undo/redo, all seven exports and IndexedDB
  reload. PNG/JPEG checks currently verify downloaded files, not pixel quality.
- The browser run also passed document-preserving studio switches, three
  templates, viewport/inspector bounds and mobile horizontal overflow checks,
  with zero runtime exceptions. Typecheck/focused ESLint passed. Production
  build is blocked locally by Google Fonts certificate trust, after disk and
  Prisma DLL constraints; exact attempts are in `PROGRESS.md`.
- Acceptance 1/2/6/7/8/10/11/12 have automated coverage at the above scope.
  Camera/gizmo drag, lighting/material visual differences, all menus, both
  themes, mobile interactions and authenticated logout/login recovery require
  broader acceptance coverage before claiming the entire checklist passed.
- Cloud API behavior is tested with mocked Prisma/auth, not a live signed-in
  production database. Native scene tool payloads are mocked; production
  Gemini/Groq text chat probes belong to the earlier provider task and do not
  prove live scene generation.

## Remaining production work

1. Live authenticated save/reopen/logout/login and concurrent-tab recovery QA;
   native scene calls against the configured deployment models.
2. Mesh component editing, extrusion/inset/bevel/subdivision and real snapping
   to mesh vertices/surfaces; semantic architectural constraints and openings.
3. Terrain/curved-road/intersection editing in the shared document model;
   production furniture library and asset management.
4. Resizable panels, camera bookmarks, additional lights, HDRI uploads, AO,
   instancing/LOD/compression, hardware capability adaptation and performance
   profiling. Current bounded scenes and selectable quality are safeguards,
   not evidence of large-scene production performance.
5. Full visual and interaction acceptance tests, asset-texture roundtrips,
   advanced geometry fixtures and deployment verification.

This increment supplies a real modeling workflow. It does not complete every
advanced CAD/rendering feature in the master specification.
