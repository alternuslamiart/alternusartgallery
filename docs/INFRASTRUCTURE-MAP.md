# Infrastructure World Map

`/infrastructure` adds World Map / 3D Editor to the existing toolbar. The
client-only `components/infrastructure/WorldMap.tsx` owns MapLibre GL JS 6.15.0,
its WebGL canvas, camera, search and selected-location marker. Both canvases
remain mounted when switching; the shared scene document, undo history,
selection, pending AI preview, editor camera and chat stay in the editor.
Map navigation does not commit scene edits. Map camera/marker state is session-only
and resets on project/account changes. Imported scene objects retain geographic
provenance in scene snapshots.

## Configuration

- Development and production default to OpenFreeMap Liberty:
  `https://tiles.openfreemap.org/styles/liberty`. This public vector source
  permits commercial use without registration or API keys. MapLibre displays
  its OpenFreeMap/OpenMapTiles/OpenStreetMap attribution. The service has no
  SLA; custom or self-hosted sources remain configurable.
- `NEXT_PUBLIC_INFRASTRUCTURE_MAP_STYLE` optionally overrides the default with
  an HTTPS style URL with licensed tile/glyph/sprite sources. The demo host is
  explicitly rejected outside development. The style URL is public; use only
  public, origin-restricted tile tokens in it. Projection is set to globe on load.
- Set `INFRASTRUCTURE_MAP_ORIGINS` to comma-separated HTTPS origins for any
  additional tile/glyph/sprite hosts used by your production style. The style
  origin is added automatically. `next.config.mjs` permits these connections
  and workers only on `/infrastructure`, its `/infrastructur` alias, and the
  emitted MapLibre worker asset (workers have their own response CSP);
  other routes retain their original Content Security Policy. Restart/rebuild
  after changing map environment settings.
- Set `MAPTILER_API_KEY` in `.env.local` or server environment for country/city
  search. This private key is never returned to the browser. Configure its
  provider quota and server access restrictions before production use.
- Search includes cities, countries and addresses and submits explicitly through `/api/infrastructure/geocode`; no
  autocomplete requests. Requests have bounded input, 5 results, a 10-second
  provider deadline, safe errors and 20 requests/minute per IP per process.
  Use a shared gateway limiter/provider quota for multi-instance deployments.
- Coordinates use **latitude, longitude** in the UI, e.g. `52.52, 13.405`.
  MapLibre receives `[longitude, latitude]`. Coordinate search and map-click
  selection need no geocoding credentials. Search attribution remains visible.

MapTiler reference: https://docs.maptiler.com/cloud/api/geocoding/
MapLibre reference: https://maplibre.org/maplibre-gl-js/docs/

## Interaction and lifecycle

MapLibre 6.15.0 ships a separate ESM worker: `new URL` emits that file as a
versioned Next asset and `setWorkerUrl` registers its URL before map creation.
Both the document and worker response need map-source CSP permissions; allowing
only the page leaves worker tile fetches blocked. No worker CDN is used.
Next 14's asset optimizer reparses standalone ESM assets as classic scripts.
A narrowly matched webpack hook marks this already-minified vendor worker as
minimized, preserving its module exports and license; other assets are unchanged.

Drag to pan, wheel/pinch to zoom, right-drag to rotate/pitch. MapLibre navigation
controls and the existing toolbar zoom/reset/camera controls operate on the globe
while it is active. Pitched selects 60 degrees; Globe restores north-up, zero
pitch. Click or search selects a blue marker; Clear marker removes it.
ResizeObserver handles canvas changes; returning to the map explicitly resizes
it. Cleanup removes map, marker, observer and pending search. Retry recreates
the map after resource/WebGL errors without discarding the selected location.
The 3D scene's keyboard shortcuts and canvas drops are suppressed in map mode.
Sidebar scene actions remain available and still edit the same scene document.
Toolbar exports in map mode export scene geometry/data, not map imagery.

## Geographic selection and editable scene copies

Click queries rendered polygon, line and point features, highlights the GeoJSON
copy, and displays bounded provider properties and coordinates in the existing
search surface. Clear marker clears the feature too. Fit selection frames its
bounds. Fullscreen uses MapLibre's native control; 2D/3D and north/level buttons
operate on the same map camera as the existing toolbar.

Existing extrusion layers are supported. Building fill layers receive matching
extrusion layers using provider `height`/`render_height` and minimum-height
properties, preserving each source layer's filter. No default building height
is fabricated. Styles without building layers show a limitation in 3D mode.
Terrain is available only if the configured style includes compatible terrain;
this integration does not fetch or invent an elevation model.

Import to 3D Studio converts one selected Polygon/MultiPolygon to editable
meshes and returns to the retained editor. Building volumes require valid
source height in meters; land polygons import as flat footprints at zero local
elevation. Courtyard holes are retained. Lines/points are selectable but import
reports why they cannot define valid surfaces. Rendered vector features may be
tile-clipped/simplified: these are source-derived copies, not surveyed CAD.

Each imported object retains validated `geographic: { origin, feature }` in
scene JSON, recovery and workspace snapshots. The first import defines WGS84
origin; later imports reuse it. Conversion uses WGS84 ellipsoid geodetic-to-ECEF
coordinates projected onto a local tangent plane, east = +X, up = +Y, north = -Z, limited to
2 km from origin and ±85° latitude. It is not a surveyed CRS or elevation datum.
All mesh vertices are already metric; dimensions remain [1,1,1]. Source GeoJSON
records provenance and stays unchanged when users transform the project copy.
Mesh export is local-meter geometry; scene JSON retains the geographic record.

Import validates the complete resulting document before committing once to
existing history. Transform, rotation, scale, grid snapping, Undo/Redo and save
reuse existing studio tools. Base maps remain read-only. Geographic road drawing,
lane/sidewalk design, geometry snapping, merged full-feature retrieval across
tile boundaries and terrain mesh import still require dedicated data/editors.
No database schema changes or new persistence endpoint were introduced.

## Verification

`node --test tests/infrastructure-geography.test.mjs tests/infrastructure-geocode-route.test.mjs`
tests coordinate bounds, production style gating and the actual route with
isolated HTTP/configuration/limiter adapters. `scripts/verify-infrastructure-map.mjs`
runs installed Chrome against localhost (`STUDIO_QA_URL`, default port 3003).
It uses real MapLibre and external development tiles, with a mocked signed-out
session. It does not verify paid geocoding without a configured provider key.
The verifier uses real external tiles for navigation, then intercepts the style
with a deterministic GeoJSON building to test actual rendering, selection,
graphics recovery, import and atomic Undo/Redo. Mocked country/city search does
not verify live geocoding. `--expect-missing-style` retains the legacy invalid
configuration check; ordinary production builds now have a usable default.
Run `tests/infrastructure-map-import.test.mjs` for meter axes, provenance,
save/restore validation, shared origin, history and unavailable-data rejection.
