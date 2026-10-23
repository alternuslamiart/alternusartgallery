"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { Map as LibreMap, Marker, NavigationControl, ScaleControl, FullscreenControl, setWorkerUrl, type GeoJSONSource } from "maplibre-gl";
import type { Feature, Geometry } from "geojson";
import { geographicFeature, featureBounds } from "@/lib/infrastructure/map-features.mjs";
import type { StudioAction } from "@/lib/studio-actions.mjs";
import { mapStyle, parseCoordinates, type GeographicLocation } from "@/lib/infrastructure/geography.mjs";
import "maplibre-gl/dist/maplibre-gl.css";
import "./world-map.css";

export type WorldMapAPI = { zoom: (factor: number) => void; reset: () => void; view: (view: string) => void;ready:()=>boolean;command:(action:StudioAction,signal:AbortSignal)=>Promise<string> };
async function searchMapPlaces(query:string,signal:AbortSignal):Promise<GeographicLocation[]>{
  const coordinates=parseCoordinates(query);if(coordinates)return[coordinates];
  if(query.trim().length<2)throw new Error('Enter a city, country, address, or latitude, longitude.');
  const response=await fetch(`/api/infrastructure/geocode?q=${encodeURIComponent(query.trim())}`,{signal:AbortSignal.any([signal,AbortSignal.timeout(12000)])});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'Location search failed.');return data.places;
}

export default function WorldMap({ active, apiRef, onImport, importDisabled, onViewChange }: { active: boolean; apiRef: Ref<WorldMapAPI>; onImport: (feature: Feature<Geometry>) => void; importDisabled: boolean; onViewChange: (view: string) => void }) {
  const host = useRef<HTMLDivElement>(null), map = useRef<LibreMap | null>(null), marker = useRef<Marker | null>(null);
  const request = useRef<AbortController | null>(null);
  const [generation, setGeneration] = useState(0), [ready, setReady] = useState(false), [error, setError] = useState("");
  const [query, setQuery] = useState(""), [searching, setSearching] = useState(false), [searchError, setSearchError] = useState("");
  const [results, setResults] = useState<GeographicLocation[]>([]), [location, setLocation] = useState<GeographicLocation | null>(null);
  const [feature, setFeature] = useState<Feature<Geometry> | null>(null), [pitched, setPitched] = useState(false), [buildingLayers, setBuildingLayers] = useState(false);
  const selectedFeature = useRef<Feature<Geometry> | null>(null);
  const readyRef=useRef(ready);readyRef.current=ready;
  const viewChanged = useRef(onViewChange); viewChanged.current = onViewChange;
  const fitSelection = () => {
    const current = selectedFeature.current;
    if (!current) return;
    const [west, south, east, north] = featureBounds(current);
    map.current?.fitBounds([[west, south], [east, north]], { padding: 100, maxZoom: 18 });
  };

  useImperativeHandle(apiRef, () => ({
    ready:()=>readyRef.current,
    command:async(action,signal)=>{
      const current=map.current;if(!current||!readyRef.current)throw new Error('The map is not ready. Check its loading error and retry.');
      signal.throwIfAborted();
      const move=async(options:Parameters<LibreMap['easeTo']>[0])=>{
        await new Promise<void>((resolve,reject)=>{
          const cleanup=()=>{clearTimeout(timer);current.off('moveend',done);signal.removeEventListener('abort',cancel);};
          const done=()=>{cleanup();resolve();},cancel=()=>{cleanup();current.stop();reject(new Error('Map navigation canceled.'));};
          const timer=setTimeout(()=>{cleanup();reject(new Error('Map camera did not confirm movement.'));},2500);
          current.once('moveend',done);signal.addEventListener('abort',cancel,{once:true});current.easeTo({...options,duration:350});
        });
      };
      if(action.intent==='map.search'){
        const places=await searchMapPlaces(action.parameters.query,signal);signal.throwIfAborted();
        setQuery(action.parameters.query);setSearchError('');setResults(places);
        if(!places.length)throw new Error('No matching locations were found. Try a more specific city or address.');
        if(places.length>1)return `Found ${places.length} places. Choose the intended location in the existing map search results.`;
        const place=places[0];selectedFeature.current=null;setFeature(null);(current.getSource('casynus-selection') as GeoJSONSource).setData({type:'FeatureCollection',features:[]});setLocation(place);setResults([]);await move({center:[place.longitude,place.latitude],zoom:place.zoom??11});return `Map centered on ${place.label}.`;
      }
      if(action.intent==='viewport.zoom')await move({zoom:current.getZoom()+(action.parameters.direction==='in'?1:-1)*Math.log2(1.25)*action.parameters.amount});
      else if(action.intent==='viewport.reset')await move({center:[0,20],zoom:1,bearing:0,pitch:0});
      else if(action.intent==='viewport.view'){
        if(!['2D','3D','Perspective','Top'].includes(action.parameters.view))throw new Error('The map supports 2D or 3D perspective, not that studio camera preset.');
        await move({pitch:['3D','Perspective'].includes(action.parameters.view)?60:0});
      }else if(action.intent==='viewport.rotate')await move({bearing:current.getBearing()+action.parameters.degrees});
      else if(action.intent==='viewport.pan'){
        const d=action.parameters.direction,center=current.getCenter(),step=360/2**(current.getZoom()+2);
        await move({center:[center.lng+(['east','right'].includes(d)?step:['west','left'].includes(d)?-step:0),Math.max(-80,Math.min(80,center.lat+(['north','up'].includes(d)?step:['south','down'].includes(d)?-step:0)))]});
      }else if(action.intent==='viewport.focus'){
        if(action.parameters.scope==='all'){await move({center:[0,20],zoom:1});return 'World map fitted.';}
        if(!selectedFeature.current)throw new Error('Select a geographic feature before focusing it.');
        const [w,s,e,n]=featureBounds(selectedFeature.current),camera=current.cameraForBounds([[w,s],[e,n]],{padding:100,maxZoom:18});
        if(!camera)throw new Error('The selected geographic bounds cannot be fitted.');await move(camera);
      }else throw new Error('This command is unavailable in World Map. Switch to 3D Studio to edit project objects.');
      return 'Map camera updated.';
    },
    zoom: factor => { if (map.current) map.current.easeTo({ zoom: map.current.getZoom() + Math.log2(factor) }); },
    reset: () => { map.current?.easeTo({ center: [0, 20], zoom: 1, pitch: 0, bearing: 0 }); setPitched(false); },
    view: view => { const pitch = view === "Pitched"; setPitched(pitch); map.current?.easeTo({ pitch: pitch ? 60 : 0, bearing: 0 }); },
  }), []);

  useEffect(() => {
    if (!host.current) return;
    let instance: LibreMap | undefined, observer: ResizeObserver | undefined;
    setReady(false); setError("");
    try {
      // v6 ships a separate ESM worker. Emit it as a same-origin Next asset;
      // the package's relative default URL is not valid after bundling.
      setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);
      instance = new LibreMap({ container: host.current, style: mapStyle(process.env.NODE_ENV, process.env.NEXT_PUBLIC_INFRASTRUCTURE_MAP_STYLE), center: [0, 20], zoom: 1, maxPitch: 80, attributionControl: { compact: true } });
      map.current = instance;
      instance.addControl(new NavigationControl({ visualizePitch: true }), "top-right");
      instance.addControl(new ScaleControl({ unit: "metric" }), "bottom-left");
      instance.addControl(new FullscreenControl({ container: host.current.parentElement! }), "top-right");
      instance.on("load", () => {
        const current = instance!;
        current.setProjection({ type: "globe" });
        const layers = current.getStyle().layers ?? [];
        let buildings = layers.some(layer => layer.type === "fill-extrusion");
        // Reuse only actual building polygon layers and measured provider heights.
        for (const layer of layers) {
          if (layer.type !== "fill" || !/building/i.test(`${layer.id} ${layer["source-layer"] ?? ""}`)) continue;
          current.addLayer({ id: `casynus-3d-${layer.id}`, type: "fill-extrusion", source: layer.source, ...(layer["source-layer"] ? { "source-layer": layer["source-layer"] } : {}), minzoom: Math.max(14, layer.minzoom ?? 0),
            ...(layer.filter ? { filter: layer.filter } : {}),
            paint: { "fill-extrusion-color": "#b4babf", "fill-extrusion-height": ["to-number", ["coalesce", ["get", "height"], ["get", "render_height"]], 0], "fill-extrusion-base": ["to-number", ["coalesce", ["get", "min_height"], ["get", "render_min_height"]], 0], "fill-extrusion-opacity": .85 } });
          buildings = true;
        }
        setBuildingLayers(buildings);
        current.addSource("casynus-selection", { type: "geojson", data: { type: "FeatureCollection", features: selectedFeature.current ? [selectedFeature.current] : [] } });
        current.addLayer({ id: "casynus-selection-fill", type: "fill", source: "casynus-selection", filter: ["==", ["geometry-type"], "Polygon"], paint: { "fill-color": "#4284ff", "fill-opacity": .3 } });
        current.addLayer({ id: "casynus-selection-line", type: "line", source: "casynus-selection", paint: { "line-color": "#4284ff", "line-width": 3 } });
        current.addLayer({ id: "casynus-selection-point", type: "circle", source: "casynus-selection", filter: ["==", ["geometry-type"], "Point"], paint: { "circle-color": "#4284ff", "circle-radius": 7 } });
        setReady(true); setError("");
      });
      instance.on("error", () => {
        setError("Map resources could not load. Check your connection or map style configuration, then retry.");
      });
      instance.on("webglcontextlost", () => { setReady(false); setError("Map graphics context lost. Retry to restore the globe."); });
      instance.on("click", event => {
        const point = event.lngLat.wrap();
        setLocation({ latitude: point.lat, longitude: point.lng, label: `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}` });
        const rendered = instance!.queryRenderedFeatures(event.point).find(item => !item.layer.id.startsWith("casynus-selection") && ["Polygon", "MultiPolygon", "LineString", "MultiLineString", "Point"].includes(item.geometry.type));
        let picked: Feature<Geometry> | null = null;
        try { if (rendered) picked = geographicFeature({ type: "Feature", geometry: rendered.geometry, properties: { ...rendered.properties, source_layer: rendered.sourceLayer ?? rendered.layer.id, ...( /building/i.test(`${rendered.layer.id} ${rendered.sourceLayer ?? ""}`) ? { building: "yes" } : {}) } }); } catch { /* Unsupported or oversized source geometry remains read-only. */ }
        selectedFeature.current = picked; setFeature(picked);
        (instance!.getSource("casynus-selection") as GeoJSONSource | undefined)?.setData({ type: "FeatureCollection", features: picked ? [picked] : [] });
      });
      // Observable camera state also supports future geographic editing adapters.
      instance.on("moveend", () => {
        const perspective = Boolean(instance && instance.getPitch() > 0);
        setPitched(perspective); viewChanged.current(perspective ? "Pitched" : "Globe");
        if (host.current && instance) host.current.dataset.camera = JSON.stringify({ center: instance.getCenter().toArray(), zoom: instance.getZoom(), pitch: instance.getPitch(), bearing: instance.getBearing() });
      });
      observer = new ResizeObserver(() => instance?.resize()); observer.observe(host.current);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Map could not initialize."); }
    return () => { observer?.disconnect(); marker.current?.remove(); marker.current = null; instance?.remove(); map.current = null; };
  }, [generation]);

  useEffect(() => {
    if (!ready || !map.current || !location) return;
    if (!marker.current) {
      const element = document.createElement("div"); element.className = "infrastructure-map-marker";
      element.setAttribute("role", "img");
      marker.current = new Marker({ element }).setLngLat([location.longitude, location.latitude]).addTo(map.current);
    }
    marker.current.setLngLat([location.longitude, location.latitude]);
    marker.current.getElement().setAttribute("aria-label", `Selected location: ${location.label}`);
  }, [location, ready]);

  useEffect(() => {
    if (!active) { map.current?.stop(); request.current?.abort(); setSearching(false); return; }
    const frame = requestAnimationFrame(() => map.current?.resize());
    return () => cancelAnimationFrame(frame);
  }, [active]);
  useEffect(() => () => request.current?.abort(), []);

  const select = (place: GeographicLocation) => {
    selectedFeature.current = null; setFeature(null);
    (map.current?.getSource("casynus-selection") as GeoJSONSource | undefined)?.setData({ type: "FeatureCollection", features: [] });
    setLocation(place); setResults([]);
    map.current?.flyTo({ center: [place.longitude, place.latitude], zoom: place.zoom ?? 11, essential: false });
  };
  const search = async () => {
    request.current?.abort(); setSearchError(""); setResults([]);
    const controller = new AbortController(); request.current = controller;
    try {
      const coordinates = parseCoordinates(query);
      if (coordinates) { select(coordinates); return; }
      if (query.trim().length < 2) throw new Error("Enter a country, city, or latitude, longitude.");
      setSearching(true);
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const places=await searchMapPlaces(query.trim(),controller.signal);
        if (!controller.signal.aborted) { setResults(places); if (!places.length) setSearchError("No places found. Try a country or city name."); }
      } finally { clearTimeout(timeout); }
    } catch (caught) {
      if (request.current === controller) setSearchError(controller.signal.aborted ? "Search canceled or timed out. Try again." : caught instanceof Error ? caught.message : "Location search failed.");
    } finally { if (request.current === controller) setSearching(false); }
  };

  return <div className="infrastructure-world-map" hidden={!active} aria-label="World Map" data-ready={ready}>
    <div ref={host} className="infrastructure-map-canvas" />
    <section className="infrastructure-map-search" aria-label="Geographic location search">
      <form onSubmit={event => { event.preventDefault(); void search(); }}>
        <input aria-label="Country, city or coordinates" placeholder="Country, city or latitude, longitude" maxLength={160} value={query} onChange={event => { request.current?.abort(); request.current = null; setSearching(false); setQuery(event.target.value); setResults([]); setSearchError(""); }} />
        <button type="submit" disabled={!ready || searching}>{searching ? "Searching…" : "Search"}</button>
      </form>
      {results.length > 0 && <ul aria-label="Location results">{results.map((place, index) => <li key={index}><button onClick={() => select(place)}>{place.label}</button></li>)}</ul>}
      {searchError && <p role="alert">{searchError}</p>}
      <div className="infrastructure-map-actions">
        <button disabled={!ready} aria-pressed={!pitched} onClick={() => { setPitched(false); map.current?.easeTo({ pitch: 0 }); }}>2D</button>
        <button disabled={!ready} aria-pressed={pitched} onClick={() => { setPitched(true); map.current?.easeTo({ pitch: 60 }); }}>3D</button>
        <button disabled={!ready} onClick={() => map.current?.resetNorthPitch()}>North / level</button>
        <button disabled={!feature || !ready} onClick={fitSelection}>Fit selection</button>
      </div>
      {pitched && !buildingLayers && <p>This style has no building layers. Perspective is available; buildings and terrain require configured geographic data.</p>}
      {location && <div className="infrastructure-map-selection"><output aria-label="Selected geographic coordinates">{location.label} · {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</output><button onClick={() => { marker.current?.remove(); marker.current = null; setLocation(null); selectedFeature.current = null; setFeature(null); (map.current?.getSource("casynus-selection") as GeoJSONSource | undefined)?.setData({ type: "FeatureCollection", features: [] }); }}>Clear marker</button></div>}
      {feature && <details className="infrastructure-map-feature" open><summary>{String(feature.properties?.name ?? feature.properties?.class ?? feature.properties?.source_layer ?? "Map feature")} · {feature.geometry.type}</summary><dl>{Object.entries(feature.properties ?? {}).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>)}</dl><p>Read-only base map. Visible tile geometry may be clipped or simplified. Import creates a project copy, not a surveyed model.</p><button disabled={importDisabled} onClick={() => onImport(feature)}>Import to 3D Studio</button></details>}
      <small>Place search: <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noreferrer">MapTiler</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a></small>
      {error ? <p role="alert">{error} <button onClick={() => setGeneration(value => value + 1)}>Retry map</button></p> : !ready && <p role="status">Loading globe…</p>}
    </section>
  </div>;
}
