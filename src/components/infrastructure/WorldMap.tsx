"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { Map as LibreMap, Marker, NavigationControl, ScaleControl, setWorkerUrl } from "maplibre-gl";
import { mapStyle, parseCoordinates, type GeographicLocation } from "@/lib/infrastructure/geography.mjs";
import "maplibre-gl/dist/maplibre-gl.css";
import "./world-map.css";

export type WorldMapAPI = { zoom: (factor: number) => void; reset: () => void; view: (view: string) => void };

export default function WorldMap({ active, apiRef }: { active: boolean; apiRef: Ref<WorldMapAPI> }) {
  const host = useRef<HTMLDivElement>(null), map = useRef<LibreMap | null>(null), marker = useRef<Marker | null>(null);
  const request = useRef<AbortController | null>(null);
  const [generation, setGeneration] = useState(0), [ready, setReady] = useState(false), [error, setError] = useState("");
  const [query, setQuery] = useState(""), [searching, setSearching] = useState(false), [searchError, setSearchError] = useState("");
  const [results, setResults] = useState<GeographicLocation[]>([]), [location, setLocation] = useState<GeographicLocation | null>(null);

  useImperativeHandle(apiRef, () => ({
    zoom: factor => { if (map.current) map.current.easeTo({ zoom: map.current.getZoom() + Math.log2(factor) }); },
    reset: () => { map.current?.easeTo({ center: [0, 20], zoom: 1, pitch: 0, bearing: 0 }); },
    view: view => { map.current?.easeTo({ pitch: view === "Pitched" ? 60 : 0, bearing: 0 }); },
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
      instance.on("load", () => { instance!.setProjection({ type: "globe" }); setReady(true); setError(""); });
      instance.on("error", () => {
        setError("Map resources could not load. Check your connection or map style configuration, then retry.");
      });
      instance.on("webglcontextlost", () => { setReady(false); setError("Map graphics context lost. Retry to restore the globe."); });
      instance.on("click", event => {
        const point = event.lngLat.wrap();
        setLocation({ latitude: point.lat, longitude: point.lng, label: `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}` });
      });
      // Observable camera state also supports future geographic editing adapters.
      instance.on("moveend", () => {
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
        const response = await fetch(`/api/infrastructure/geocode?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Location search failed.");
        if (!controller.signal.aborted) { setResults(data.places); if (!data.places.length) setSearchError("No places found. Try a country or city name."); }
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
      {location && <div className="infrastructure-map-selection"><output aria-label="Selected geographic coordinates">{location.label} · {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</output><button onClick={() => { marker.current?.remove(); marker.current = null; setLocation(null); }}>Clear marker</button></div>}
      <small>Place search: <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noreferrer">MapTiler</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a></small>
      {error ? <p role="alert">{error} <button onClick={() => setGeneration(value => value + 1)}>Retry map</button></p> : !ready && <p role="status">Loading globe…</p>}
    </section>
  </div>;
}
