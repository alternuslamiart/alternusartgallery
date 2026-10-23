# Studio commands and Voice Speech

Both existing microphone and radio/Voice icons open the same `VoiceSpeechModal`.
Opening it does not acquire audio: Start is the capture gesture. The modal is
271×138 px, #222, with 254×32 px Start/Stop and 24×24 px close buttons, #3e3e3e
button surfaces and #579bff waveform/text. Inactive bars are static; listening
heights come from the existing real microphone analyser. Close/Esc cancels capture,
uploads, playback and pending voice requests. Stop finalizes transcription.

The microphone entry keeps normal dictation editable. Recognized local commands
execute as standalone turns and preserve unrelated typed draft text. Voice entry
submits one finalized utterance and reads its real reply with available browser
TTS. Each subsequent capture requires Start. Completed/error feedback stays in
the compact modal; the full result or clarification is also retained in chat.

## Command boundary

`lib/studio-actions.mjs` contains the finite action schema and anchored English/
Albanian parser. It validates exact parameter names, bounded text/numbers, units,
axes, studio names and action IDs. The typed declaration shares the discriminated
action union with adapters. No transcript or provider can evaluate JavaScript.

`StudioActionsProvider` lives alongside the existing shared conversation store.
The mounted scene or floor-plan viewport registers one adapter with current state;
stale adapters/confirmations are removed on identity, project or studio changes.
Entering or leaving Infrastructure loads a new document after recovery, because
the browser retains the original document's CSP across Next.js client navigation.
This preserves map-only tile permissions without broadening every studio's policy.
Both typed submissions and recognized voice commands use the same registry.
Complex requests continue through the existing configured text/native scene AI
adapter; generated scene proposals retain their existing Apply/Discard approval.
This does not create an unrestricted autonomous agent or a new AI provider.

Bulk deletion and new-project replacement require a separate Confirm within 30
seconds. Confirmation is bound to the original scene/selection fingerprint, and
is invalidated by another command or a context/state change. Missing or ambiguous
targets produce clarification rather than choosing an arbitrary object. Existing
locked-object, pending-proposal, geometry/document limits and authentication apply.

## Supported actions

| Context | Actual actions |
| --- | --- |
| Shared navigation | Architecture `/casynus`, Interior `/interior`, Infrastructure `/infrastructure`, Floor Plan `/casynus?mode=floor-plan`; source recovery must complete before leaving |
| 3D toolbar | Select, Move, Rotate, Scale, Measure, existing building/room/tree creation, library, fit/focus/reset, zoom, camera presets, lighting/properties, enabled export choices and CSV |
| 3D scene | Existing asset catalog/template creation, unique-name selection, select all/clear, duplicate/delete, metric translation, axis rotation in degrees, height and existing material presets; changes use existing validation/history |
| 3D persistence | Browser IndexedDB recovery for guests or existing authenticated workspace saves; success is verified against the saved snapshot hash, not just a resolved UI callback |
| World Map | Open/close, zoom, pan cardinal directions, bearing rotation, 2D/3D pitch, reset, focus selected geographic feature, existing geocoding search with result ambiguity preserved |
| 2D toolbar | Existing select/move and wall/door/window/room/dimension/measure/text/furniture/delete tools, room creation, zoom/pan/top view/fit/reset, grid/geometry snapping, properties/sidebar, library browsing and actual drawing exports |
| 2D scene | New walls/rooms; door/window creation requires a selected host wall; unique element selection, duplicate/delete, planar translation and supported rotations, existing undo/redo |
| 2D persistence | Validated identity-scoped browser recovery, read-back confirmation, restore without cross-identity undo history, and recovery before command navigation; it is not authenticated cloud scene storage |

Examples: `Open Infrastructure Studio`, `Hape studion e Infrastrukturës`,
`Aktivizo hartën botërore`, `Zmadho pamjen`, `Add a cube`, `Shto një ndërtesë`,
`Move selected object 200 cm left`, `Rotate selected object 90 degrees`,
`Increase the height to 3 meters`, `Change the material to wood`, `Save project`.
The 3D convention is local meters, X right, Y up, Z backward. Imported geographic
objects retain their existing WGS84 provenance. The 2D adapter converts vertical
movement to its existing down-positive drawing Y coordinate.

Adapters call the existing viewport, MapLibre, creation/template, document/history,
floor-plan geometry, toolbar and persistence handlers. Scene results wait for the
actual updated document; map camera results wait for movement completion. Export
results say that a browser download was requested, not that a file was written to
a user-chosen path. Unavailable actions return errors and never fake success.

## Limits and external dependencies

- A 2D drawing cannot create/edit 3D cubes, building heights, PBR meshes or 3D
  lighting. Switch to the real 3D workspace for those capabilities. Drafting tools
  requiring placement still use the existing pointer/drawing workflow.
- Base-map features remain read-only. Import/editing restrictions in
  `INFRASTRUCTURE-MAP.md` still apply. Search needs the existing server MapTiler
  key; multiple results are presented for user selection, not guessed coordinates.
- Cloud save needs a signed-in workspace and reachable database. Native speech,
  supported languages, installed TTS voices and the Groq recording fallback retain
  the dependencies and privacy behavior in `VOICE-COMMANDS.md`.
- Legacy illustrative modeling routes do not gain fictitious CAD/Blender control.
  Unknown compound instructions use the existing AI proposal flow where available;
  they are not silently executed as arbitrary application code.

## Verification

`tests/studio-actions.test.mjs`, `studio-voice.test.mjs`, `floor-plan-recovery.test.mjs`
and the existing scene/floor-plan tests cover parsing, units, strict schemas, draft
preservation, finish/cancel semantics and recovery validation.

`node scripts/verify-studio-actions.mjs` targets localhost only and exercises real
React actions, scene geometry/history, IndexedDB/localStorage, MapLibre tiles and
camera movement, modal geometry and real Chrome synthetic-device audio capture.
Recognition results, speech playback, geocoding and provider HTTP are fixtures;
passing this test is not a physical-microphone or paid-provider certification.
