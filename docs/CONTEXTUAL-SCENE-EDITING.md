# Contextual 3D editing

The existing Three.js/R3F scene, hierarchy, toolbar and editor remain in place.
Viewport raycasting selects the nearest logical mesh ID, including individual
template/imported components. The existing selection helper is blue #3B82F6.
Chat shows the selected hierarchy path without adding conversation messages.

## Execution

The shared Send/Enter flow first uses existing finite studio commands, then the
contextual planner for supported exact instructions, then the existing authenticated
Gemini/Groq function-calling route for other scene requests. Finite local commands
do not call a provider and are not described as generated AI output. You remains
research chat; switching back to Gemini/Groq enables scene editing again.

The selected snapshot includes stable IDs, parent path, local transforms,
dimensions, geometry counts, PBR scalars, texture-presence metadata and supported
operations. Embedded image data is not included in text-planning context.

Both server and client validate command schema, bounds, locked ancestry,
selection scope and complete resulting documents. Selected edits cannot target
unrelated IDs. A changed document invalidates the result. Reversible commands
commit in one history entry, preserving the current camera; completion waits for
the viewport to acknowledge the document. A failed render acknowledgment rolls
back that transaction and removes its redo entry. Existing recovery/autosave
and supported scene exports consume the resulting actual scene document.

All chat deletions require confirmation. Provider deletions remain unapplied,
expire after 30 seconds and are bound to the original scene fingerprint. Existing
finite confirmations also bind selection. Meshy/Tripo generated-model import
retains its existing preview/Apply workflow.

## Architectural operations

- A named parametric box roof can become a .25m flat slab with the same ID,
  transform and footprint; material edits set real PBR properties.
- A rectangular, named box wall supports 1–8 evenly spaced window openings if
  dimensions permit. The wall ID becomes a group at its original transform;
  real sill/lintel/piers and glass children leave actual openings. Both X- and
  Z-aligned walls retain their parent transformations. Repeating this on an
  already segmented host is rejected rather than overlapping new openings.
- Upright group height changes use measured world bounds and group Y scale,
  retaining descendant relationships. Rotated groups require explicit local
  axis transforms. A locked child prevents transforming its group.
- Existing primitive creation, duplication, transforms, embedded material upload,
  environment/shadow controls and export remain available. These operations do
  not create a general CAD boolean/topology engine. Imported arbitrary roofs,
  surveyed constraints, terrain and unsupported external texture generation are
  not silently approximated by these architectural operations.

## GPU feedback

Temporary non-pickable meshes borrow the affected scene geometries and copy world
transforms. A transparent blue checker/scan shader uses world-space .4m cells and
10–25% surface opacity. Feedback follows processing/updating/completed state,
fades after acknowledged completion and clears on failure/cancel/unmount.
Only shader materials are owned/disposed by the overlay. Geometry, original
materials, exported models and the rest of the viewport are unchanged.

The manual-approval footer is removed. Scene-mode selection is retained inside
the existing dock. The panel keeps its bottom aligned with inset sidebars.

## Verification boundaries

`tests/scene-editing.test.mjs` covers finite prompt targeting, roof/material edits,
window geometry/serialization, group scaling, rejection and atomic Undo/Redo.
`tests/scene-edit-overlay.test.mjs` checks target scope and resource ownership.
Existing scene API/selection/history tests cover validation, auth and isolation.

`node scripts/verify-scene-editing.mjs` uses actual local Chrome pointer input,
R3F rendering, production finite contextual commands, keyboard handling,
IndexedDB persistence and reload without HTTP interception. It does not certify
live Gemini/Groq planning, authenticated cloud storage, or arbitrary CAD edits.
Those require a real signed-in workspace and working provider/database services.
