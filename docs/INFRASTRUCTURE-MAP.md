# Infrastructure World Map

`/infrastructure` adds World Map / 3D Editor to the existing toolbar. The
client-only `components/infrastructure/WorldMap.tsx` owns MapLibre GL JS 6.15.0,
its WebGL canvas, camera, search and selected-location marker. Both canvases
remain mounted when switching; the shared scene document, undo history,
selection, pending AI preview, editor camera and chat stay in the editor.
Map navigation does not commit scene edits. Map state is session-only and
resets on project/account changes; it is not included in cloud scene snapshots.

## Configuration

- Development uses the official `https://demotiles.maplibre.org/globe.json`.
- Production requires `NEXT_PUBLIC_INFRASTRUCTURE_MAP_STYLE`, an HTTPS style
  URL with licensed production tile/glyph/sprite sources. The demo host is
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
- Search submits explicitly through `/api/infrastructure/geocode`; no
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

## Future editing boundary

Keep geographic WGS84 degrees separate from the existing local-meter scene.
`GeographicLocation` is the selection boundary; future geographic features
should be typed GeoJSON sources/layers managed by an Infrastructure adapter,
with stable feature IDs for roads, bridges, buildings and terrain. Add a
project-owned georeference (WGS84 origin, elevation datum and local orientation)
before converting scene coordinates to geographic overlays. Use existing
workspace ownership and explicit document migrations when persisting that
reference. Do not repurpose scene x/y/z as longitude/latitude or claim terrain
editing from the globe background. No such editors or database changes are
included in this increment.

## Verification

`node --test tests/infrastructure-geography.test.mjs tests/infrastructure-geocode-route.test.mjs`
tests coordinate bounds, production style gating and the actual route with
isolated HTTP/configuration/limiter adapters. `scripts/verify-infrastructure-map.mjs`
runs installed Chrome against localhost (`STUDIO_QA_URL`, default port 3003).
It uses real MapLibre and external development tiles, with a mocked signed-out
session. It does not verify paid geocoding without a configured provider key.
Run the verifier with `--production` against a local production build without
a configured style to check the configuration gate, retained 3D editor and
Architecture/Interior 3D rendering. Development verification includes mocked
country/city results, coordinate markers and retained Undo/Redo. Live geocoding
still requires separately configured provider credentials.
