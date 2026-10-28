"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { WorldMapAPI } from "@/components/infrastructure/WorldMap";
import { importGeographicFeature } from "@/lib/infrastructure/map-import.mjs";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Box, Building2, ChevronDown, Eye, EyeOff, Focus, FolderOpen, Globe2, Layers3, Lock, Maximize2, MoreHorizontal, MousePointer2, Move, PanelLeft, PanelRight, Rotate3D, Ruler, Save, Sparkles, TreePine, Unlock, X } from "lucide-react";
import { hexToHsv, hsvToHex } from "@/lib/sketch.mjs";
import { SceneViewport, type SceneTool, type ViewportAPI } from "./SceneViewport";
import { useSceneDocument } from "./useSceneDocument";
import { StudioHeader, StudioPanel } from "@/components/crystal-studio/kit";
import { StudioAIChat } from "@/components/crystal-studio/StudioAIChat";
import { useStudioConversation, useStudioDock } from "@/components/crystal-studio/StudioConversation";
import { applyCommands, createTemplate, makeDocument, makeObject, MATERIALS, validateDocument, type SceneCommand, type SceneDocument, type SceneObject, type Vec3 } from "@/lib/scene/document.mjs";
import { duplicateObjects, exportScene, importModel, regroupObjects } from "@/lib/scene/geometry.mjs";
import { requestStudioAnswer } from "@/lib/studio-ai.mjs";
import { listRecovery } from "@/lib/scene/recovery";
import { StudioViewportToolbar, downloadStudioCSV } from "@/components/crystal-studio/StudioViewportToolbar";
import { generate3DModel, generationLabel, readModelBytes, require3DSession, discover3DProviders, type Generation3DJob } from "@/lib/ai3d/client.mjs";
import {cacheGeneratedAsset,clearGeneratedAssets} from '@/lib/scene/generated-assets.mjs';
import { nextSelection } from "@/lib/scene/selection.mjs";
import {applyLibraryMaterial} from "@/lib/scene/material-library.mjs";
import {StudioSidebarFooter} from "@/components/crystal-studio/StudioSidebarFooter";
import { useStudioActionAdapter, verifyStudioState, navigateStudioRoute, nextStudioFrame } from "@/components/crystal-studio/StudioActions";
import { STUDIO_ROUTES, normalizeCommand } from "@/lib/studio-actions.mjs";
import {selectionContext,planContextEdit,validateEditScope,editTargets} from "@/lib/scene/editing.mjs";
import type { StudioToolbarAPI } from "@/components/crystal-studio/StudioViewportToolbar";
import "./scene-studio.css";

type Studio = "architecture" | "interior" | "infrastructure";
const WorldMap = dynamic(() => import("@/components/infrastructure/WorldMap"), { ssr: false });
const routes = { architecture: "/casynus", interior: "/interior", infrastructure: "/infrastructure" };
const names = { architecture: "Architecture", interior: "Sketch", infrastructure: "Infrastructure" };
const providers = [{ id: "gemini", label: "Gemini" }, { id: "groq", label: "Groq" }, { id: "you", label: "You" }];
const catalog = ["Box", "Sphere", "Cylinder", "Wall", "Floor slab", "Ceiling", "Roof", "Column", "Beam", "Door", "Window", "Sofa", "Coffee table", "Cabinet", "Stairs", "Road", "Sidewalk", "Bridge", "Streetlight", "Tree", "Point light", "Spot light"];
const fingerprint = (d: SceneDocument) => JSON.stringify([d.id, d.objects, d.environment]);
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob), link = document.createElement("a");
  link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const paletteSwatches = ["#141414", "#ffffff", "#ff6b6b", "#f59e0b", "#facc15", "#22c55e", "#06b6d4", "#4284ff", "#a855f7", "#ec4899"];
function SceneColorField({ label, value, opacity, onChange, onOpacity }: { label: string; value: string; opacity?: number; onChange: (color: string) => void; onOpacity?: (opacity: number) => void }) {
  const [open, setOpen] = useState(false), [collapsed, setCollapsed] = useState(false), [hex, setHex] = useState(value), [position, setPosition] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const [h, s, v] = hexToHsv(value);
  useEffect(() => setHex(value), [value]);
  const chooseHue = (event: ReactPointerEvent<HTMLDivElement>) => { const r = event.currentTarget.getBoundingClientRect(), angle = Math.atan2(event.clientY - r.top - r.height / 2, event.clientX - r.left - r.width / 2) * 180 / Math.PI + 90; onChange(hsvToHex(angle, s || 1, v || 1)); };
  const chooseSquare = (event: ReactPointerEvent<HTMLDivElement>) => { const r = event.currentTarget.getBoundingClientRect(); onChange(hsvToHex(h, Math.max(0, Math.min(1, (event.clientX - r.left) / r.width)), 1 - Math.max(0, Math.min(1, (event.clientY - r.top) / r.height)))); };
  return <div className="scene-color-field">
    <div className="scene-color">
      <span>{label}</span>
      <button type="button" className="scene-color-trigger" aria-label={`Toggle ${label} palette`} aria-expanded={open} onClick={() => setOpen(x => !x)}>
        <span className="sketch-color-preview" style={{ background: value }} />
        <span>{value}</span>
      </button>
      {(!open || collapsed) && <input aria-label={label} type="color" className="sr-only" value={value} onChange={e => onChange(e.target.value)} />}
    </div>
    {open && <section className="scene-color-panel" aria-label={`${label} palette`} style={{ transform: `translate(${position.x}px,${position.y}px)` }}>
      <header onPointerDown={e => { if ((e.target as HTMLElement).closest("button")) return; drag.current = { x: e.clientX, y: e.clientY, startX: position.x, startY: position.y }; e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={e => { if (drag.current) setPosition({ x: Math.max(-420, Math.min(200, drag.current.startX + e.clientX - drag.current.x)), y: Math.max(-60, Math.min(360, drag.current.startY + e.clientY - drag.current.y)) }); }} onPointerUp={() => { drag.current = null; }}>
        <strong>Color</strong>
        <button type="button" aria-label="Collapse color picker" onClick={() => setCollapsed(x => !x)}><ChevronDown size={16} /></button>
        <button type="button" aria-label="Close color picker" onClick={() => setOpen(false)}><X size={16} /></button>
      </header>
      {!collapsed && <>
        <div className="sketch-hue" role="slider" tabIndex={0} aria-label="Hue" aria-valuemin={0} aria-valuemax={360} aria-valuenow={Math.round(h)} onKeyDown={e => { if (["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp"].includes(e.key)) { e.preventDefault(); onChange(hsvToHex(h + (["ArrowLeft", "ArrowDown"].includes(e.key) ? -2 : 2), s, v)); } }} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); chooseHue(e); }} onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) chooseHue(e); }}>
          <span className="sketch-hue-thumb" style={{ transform: `rotate(${h}deg) translateY(-83px)` }} />
          <div className="sketch-saturation" style={{ backgroundColor: hsvToHex(h, 1, 1) }} onPointerDown={e => { e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); chooseSquare(e); }} onPointerMove={e => { e.stopPropagation(); if (e.currentTarget.hasPointerCapture(e.pointerId)) chooseSquare(e); }}>
            <span style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%` }} />
          </div>
        </div>
        <label>HEX<input aria-label="HEX color" value={hex} maxLength={7} onChange={e => { setHex(e.target.value); if (/^#[0-9a-f]{6}$/i.test(e.target.value)) onChange(e.target.value); }} onBlur={() => setHex(value)} /><span className="sketch-color-preview" style={{ background: value }} /></label>
        {onOpacity && <label>Opacity<output>{Math.round((opacity ?? 1) * 100)}%</output><input aria-label="Color opacity" type="range" min="0" max="100" value={Math.round((opacity ?? 1) * 100)} onChange={e => onOpacity(Number(e.target.value) / 100)} /></label>}
        <div className="sketch-swatches">{paletteSwatches.map(c => <button key={c} type="button" aria-label={`Choose ${c}`} title={c} style={{ background: c }} onClick={() => onChange(c)} />)}</div>
        <label>Custom color<input aria-label={label} type="color" value={value} onChange={e => onChange(e.target.value)} /></label>
      </>}
    </section>}
  </div>;
}
function Menu({ name, children }: { name: string; children: ReactNode }) { return <details className="scene-menu"><summary>{name}</summary><div onClick={e => { if ((e.target as HTMLElement).closest("button:not(:disabled)")) e.currentTarget.parentElement?.removeAttribute("open"); }}>{children}</div></details>; }
function NumberField({ label, value, onChange, min = -10000, max = 10000 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return <label className="scene-number"><span>{label}</span><input key={`${label}:${value}`} aria-label={label} type="number" defaultValue={Number(value.toFixed(4))} min={min} max={max} step="0.1" onBlur={e => { const v = Number(e.target.value); if (e.target.value && Number.isFinite(v) && v >= min && v <= max && v !== value) onChange(v); else e.target.value = String(Number(value.toFixed(4))); }} onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }} /></label>;
}
function asset(name: string): SceneObject[] {
  const definitions: Record<string, [SceneObject["kind"], Vec3, Vec3, string]> = {
    Box: ["box", [1, 1, 1], [0, .5, 0], "concrete"], Sphere: ["sphere", [1, 1, 1], [0, .5, 0], "metal"], Cylinder: ["cylinder", [1, 1, 1], [0, .5, 0], "concrete"],
    Wall: ["box", [4, 3.2, .2], [0, 1.6, 0], "concrete"], "Floor slab": ["box", [6, .2, 5], [0, 0, 0], "marble"], Roof: ["box", [6.5, .25, 5.5], [0, 3.3, 0], "metal"],
    Column: ["cylinder", [.35, 3.2, .35], [0, 1.6, 0], "concrete"], Beam: ["box", [5, .3, .25], [0, 3, 0], "metal"], Door: ["box", [1, 2.2, .06], [0, 1.1, 0], "wood"], Window: ["box", [2, 1.4, .05], [0, 1.5, 0], "glass"],
    Ceiling: ["box", [8, .2, 6], [0, 3.2, 0], "concrete"],
    Road: ["box", [8, .2, 16], [0, 0, 0], "concrete"], Sidewalk: ["box", [2, .3, 16], [0, .15, 0], "concrete"], Cabinet: ["box", [1.6, 1.3, .6], [0, .65, 0], "wood"],
    "Point light": ["pointLight", [1, 1, 1], [0, 3, 0], "ceramic"], "Spot light": ["spotLight", [1, 1, 1], [0, 3, 0], "ceramic"],
  };
  if (definitions[name]) { const [kind, dimensions, position, material] = definitions[name]; return [makeObject(kind, { name, dimensions, position, material: name === "Road" ? { ...MATERIALS.concrete, color: "#34383d" } : MATERIALS[material] })]; }
  const root = makeObject("group", { name, position: [0, 0, 0] }), result = [root];
  const part = (kind: SceneObject["kind"], position: Vec3, dimensions: Vec3, material: string, label = name) => result.push(makeObject(kind, { name: label, parentId: root.id, position, dimensions, material: MATERIALS[material] }));
  if (name === "Sofa" || name === "Coffee table") {
    const pieces = createTemplate("room").filter(o => name === "Sofa" ? o.name.startsWith("Sofa") : o.name.startsWith("Coffee") || o.name.startsWith("Table leg"));
    result.push(...pieces.map(o => ({ ...o, parentId: root.id })));
  } else if (name === "Stairs") {
    for (let i = 0; i < 12; i++) part("box", [0, (i + 1) * .09, i * .28], [1.1, (i + 1) * .18, .28], "concrete", `Step ${i + 1}`);
  } else if (name === "Tree") {
    part("cylinder", [0, 1, 0], [.3, 2, .3], "wood", "Trunk");
    part("sphere", [0, 3, 0], [2.5, 3, 2.5], "fabric", "Canopy"); result[2].material = { ...MATERIALS.fabric, color: "#4b754c" };
  } else if (name === "Bridge") {
    part("box", [0, 1.2, 0], [8, .3, 2], "concrete", "Bridge deck");
    for (const z of [-1, 1]) part("box", [0, 1.9, z], [8, .8, .08], "metal", "Guardrail");
    for (const x of [-3, 3]) part("box", [x, .5, 0], [.4, 1, 1.8], "concrete", "Pier");
  } else {
    part("cylinder", [0, 2, 0], [.14, 4, .14], "metal", "Light pole"); part("box", [0, 4, 0], [.5, .15, .5], "metal", "Luminaire");
    part("pointLight", [0, 3.8, 0], [1, 1, 1], "ceramic", "Warm light"); result.at(-1)!.material.color = "#ffd3a1";
  }
  return result;
}

export default function SceneWorkbench({ studio, projectId }: { studio: Studio; projectId?: string }) {
  const { data: session, status } = useSession();
  if (status === "loading") return <div className="scene-opening">Opening Casynus 3D…</div>;
  const identity = session?.user?.id ?? session?.user?.email ?? "guest";
  return <Editor key={`${identity}:${projectId ?? "active"}`} studio={studio} identity={identity} authenticated={status === "authenticated"} projectId={projectId} />;
}

function Editor({ studio, identity, authenticated, projectId }: { studio: Studio; identity: string; authenticated: boolean; projectId?: string }) {
  const router = useRouter();
  const store = useSceneDocument(studio, identity, authenticated, projectId), doc = store.document;
  const docRef = useRef(doc); docRef.current = doc;
  const viewport = useRef<ViewportAPI>(null), file = useRef<HTMLInputElement>(null), texture = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<string[]>([]), [tool, setTool] = useState<SceneTool>("select");
  const [hoveredId,setHoveredId]=useState<string|null>(null);
  const hierarchyRef=useRef<HTMLElement>(null);
  const [left, setLeft] = useState(true), [right, setRight] = useState(true), [snap, setSnap] = useState(true), [grid, setGrid] = useState(true);
  const [busy, setBusy] = useState(""), [error, setError] = useState<string | null>(null), [openProjects, setOpenProjects] = useState<Array<{ id: string; name: string; local?: boolean }> | null>(null);
  const [cameraView, setCameraView] = useState("Perspective");
  const [worldMap, setWorldMap] = useState(false), [mapOpened, setMapOpened] = useState(false), [mapView, setMapView] = useState("Globe");
  const worldMapAPI = useRef<WorldMapAPI>(null);
  const toolbarAPI=useRef<StudioToolbarAPI>(null);
  const [stories, setStories] = useState(2), [search, setSearch] = useState(""), [textureSlot, setTextureSlot] = useState("map");
  const [prompt, setPrompt] = useState(""), [model, setModel] = useState("gemini"), [sceneAI, setSceneAI] = useState(true);
  const [meshProviders, setMeshProviders] = useState<Array<{ id: string; label: string }>>([]);
  const [generationJobs, setGenerationJobs] = useState<Generation3DJob[] | null>(null);
  const [generationStatus,setGenerationStatus]=useState<string|null>(null);
  const [checkingGeneration,setCheckingGeneration]=useState(false);
  const providerCheck=useRef<AbortController|null>(null);
  const normalProvider=useRef('gemini');
  const resumeController = useRef<AbortController | null>(null);
  const meshProvider = model === "meshy" || model === "tripo" || model === 'hunyuan';
  useEffect(()=>()=>clearGeneratedAssets(),[]);
  useEffect(() => { const controller = new AbortController(); void discover3DProviders({signal:controller.signal}).then(providers=>{if(!controller.signal.aborted)setMeshProviders(providers);}).catch(() => {}); return () => { controller.abort();providerCheck.current?.abort(); resumeController.current?.abort(); }; }, []);
  const [pending, setPending] = useState<{ commands: SceneCommand[]; preview: SceneDocument; base: string; generatedJobId?:string; destructive?:boolean; expires?:number } | null>(null);
  const [editing,setEditing]=useState<{ids:string[];phase:'processing'|'updating'|'completed'}|null>(null);
  const [planning,setPlanning]=useState(false);
  const [autoRotate,setAutoRotate]=useState(false);
  useEffect(()=>{
    if(!autoRotate||!worldMap)return;
    const timer=window.setInterval(()=>{void worldMapAPI.current?.command({intent:'viewport.rotate',parameters:{degrees:1.2}},new AbortController().signal).catch(()=>{});},50);
    return()=>window.clearInterval(timer);
  },[autoRotate,worldMap]);
  const editTimer=useRef<ReturnType<typeof setTimeout>>();
  const editEpoch=useRef(0);
  const editBase=useRef('');
  useEffect(()=>()=>{editEpoch.current++;clearTimeout(editTimer.current);},[]);
  const [messages, setMessages] = useStudioConversation([]);
  const dock = useStudioDock();
  useEffect(() => { if (window.matchMedia("(max-width:760px)").matches) { setLeft(false); setRight(false); } }, []);
  const primary = doc.objects.find(o => o.id === selected[0]);
  const blocked = !store.ready || Boolean(pending) || planning;
  const context=selectionContext(pending?.generatedJobId?pending.preview:doc,selected);
  const changeChatModel=(value:string)=>{
    if(value!=='hunyuan'&&pending?.generatedJobId){setPending(null);setSelected(ids=>ids.filter(id=>doc.objects.some(o=>o.id===id)));}
    if(['gemini','groq','you'].includes(value))normalProvider.current=value;
    setModel(value);setSceneAI(value!=='you');
  };
  const activate3DGeneration=async()=>{
    if(model==='hunyuan'){changeChatModel(normalProvider.current);return;}
    providerCheck.current?.abort();const controller=new AbortController();providerCheck.current=controller;
    setCheckingGeneration(true);setError(null);
    try{
      const providers=await discover3DProviders({signal:controller.signal});
      if(controller.signal.aborted)return;
      setMeshProviders(providers);
      if(!providers.some(p=>p.id==='hunyuan'))throw new Error('Hunyuan3D is not configured on this server. Use the configured local studio, or connect an authenticated GPU worker and private storage to this deployment.');
      changeChatModel('hunyuan');dock.setOpen(true);
    }catch(error){if(!controller.signal.aborted)setError(error instanceof Error?error.message:'3D generation availability could not be checked. Please retry.');}
    finally{if(providerCheck.current===controller){providerCheck.current=null;setCheckingGeneration(false);}}
  };
  const executionChange=(active:boolean)=>{
    if(active){clearTimeout(editTimer.current);editBase.current=fingerprint(docRef.current);editEpoch.current++;setEditing({ids:editTargets(docRef.current,selected),phase:'processing'});}
    else if(editBase.current!==fingerprint(docRef.current)){
      setEditing(current=>current?{...current,phase:'completed'}:null);
      editTimer.current=setTimeout(()=>setEditing(null),450);
    }else setEditing(null);
  };
  const selectedRoots = selected.filter(id => { let parent = doc.objects.find(o => o.id === id)?.parentId; while (parent) { if (selected.includes(parent)) return false; parent = doc.objects.find(o => o.id === parent)?.parentId; } return true; });
  const safely = useCallback((operation: () => void,strict=false) => { try { setError(null); operation(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Operation failed.");if(strict)throw caught; } }, []);
  const change = (next: SceneDocument) => { if (blocked) throw new Error("Apply or dismiss the scene proposal before editing."); store.commit(next); };
  const locked = (object: SceneObject) => { let node: SceneObject | undefined = object; while (node) { if (node.locked) return true; node = docRef.current.objects.find(o => o.id === node?.parentId); } return false; };
  const patch = (id: string, values: Partial<SceneObject>, allowLocked = false) => safely(() => {
    const scene = docRef.current;
    const target = scene.objects.find(o => o.id === id); if (!target || (!allowLocked && locked(target))) throw new Error("Unlock the object and its parents first.");
    const ids = new Set(values.material && selected.includes(id) ? selected : [id]);
    if (values.material) for (let i = 0; i < 32; i++) scene.objects.forEach(o => { if (ids.has(o.parentId ?? "")) ids.add(o.id); });
    if (!allowLocked && scene.objects.some(o => ids.has(o.id) && locked(o))) throw new Error("Unlock the selected objects and their parents first.");
    change({ ...scene, objects: scene.objects.map(o => o.id === id ? { ...o, ...values } : values.material && ids.has(o.id) ? { ...o, material: values.material } : o) });
  });
  const select = (id: string | null, additive = false) => { if (pending||planning) return; setSelected(current => nextSelection(current,id,additive)); };
  const add = (name: string, point?: Vec3 | null,strict=false) => safely(() => {
    const objects = asset(name).map(o => !o.parentId && point ? { ...o, position: [o.position[0] + point[0], o.position[1], o.position[2] + point[2]] as Vec3 } : o);
    change({ ...doc, objects: [...doc.objects, ...objects] }); setSelected([objects[0].id]); setTool("translate");
  },strict);
  const template = (name: string,strict=false) => safely(() => { const objects = createTemplate(name, stories); change({ ...doc, objects: [...doc.objects, ...objects] }); setSelected([objects[0].id]); requestAnimationFrame(() => viewport.current?.fit()); },strict);
  const remove = (strict=false) => safely(() => { change(applyCommands(doc, selectedRoots.map(id => ({ type: "delete", id })))); setSelected([]); },strict);
  const duplicate = (strict=false) => safely(() => { if (selected.some(id => locked(doc.objects.find(o => o.id === id)!))) throw new Error("Unlock objects first."); const result = duplicateObjects(doc, selectedRoots); change(result.document); setSelected(result.ids); },strict);
  const group = (ungroup = false) => safely(() => { change(regroupObjects(doc, selectedRoots, ungroup)); setSelected([]); });
  const leave = async (href: string) => { try { await store.recover(); navigateStudioRoute(href,router.push); } catch { setError("Recovery failed. Save or download JSON before leaving."); } };
  const navigate = async (target: Studio) => { try { await store.recover(); navigateStudioRoute(`${routes[target]}?project=${doc.id}`,router.push); } catch { setError("Recovery failed. Save to cloud or download JSON before switching studios."); } };
  const exportFile = async (format: string,strict=false) => {
    setBusy(`Exporting ${format.toUpperCase()}…`); setError(null);
    try {
      const blob = format === "json" ? new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" }) : ["png", "jpeg"].includes(format) ? await viewport.current!.screenshot(format as "png" | "jpeg") : await exportScene(doc, format);
      download(blob, `${doc.name.replace(/[^a-z0-9_-]/gi, "_")}.${format}`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Export failed.");if(strict)throw caught; }
    finally { setBusy(""); }
  };
  const importFile = async (source: File) => {
    setBusy("Validating imported geometry…"); setError(null);
    try {
      if (source.size > 20_000_000) throw new Error("Import is limited to 20 MB.");
      if (source.name.toLowerCase().endsWith(".json")) {
        const imported = validateDocument(JSON.parse(await source.text())); await store.recover();
        store.replace({ ...imported, id: crypto.randomUUID() }); setSelected([]);
      } else {
        const objects = await importModel(await source.arrayBuffer(), source.name);
        if (docRef.current.id !== doc.id) throw new Error("Project changed during import. Import the file again in the current project.");
        change({ ...docRef.current, objects: [...docRef.current.objects, ...objects] }); setSelected([objects[0].id]);
      }
      requestAnimationFrame(() => viewport.current?.fit());
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Import failed."); }
    finally { setBusy(""); }
  };
  const listProjects = async () => {
    setBusy("Loading workspace projects…");
    let local: Array<{ id: string; name: string; local?: boolean }> = [];
    try { await store.recover(); local = await listRecovery(identity); if (!authenticated) { setOpenProjects(local); return; } const response = await fetch("/api/studio-projects", { cache: "no-store" }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Projects unavailable."); setOpenProjects([...data.projects, ...local.filter(p => !data.projects.some((cloud: { id: string }) => cloud.id === p.id))]); }
    catch (caught) { setOpenProjects(local); setError(caught instanceof Error ? caught.message : "Projects unavailable."); } finally { setBusy(""); }
  };
  const newProject = async () => {
    try { await store.recover(); store.replace(makeDocument(studio)); setSelected([]); setPending(null); }
    catch { setError("Recovery failed. Save or download this project before creating another."); }
  };
  const listGenerationJobs = async () => {
    try {
      const response = await fetch(`/api/ai3d/jobs?project=${encodeURIComponent(doc.id)}`, { cache: "no-store" });
      const data = await response.json(); if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : data.error?.message || "Sign in to view generation jobs.");
      setGenerationJobs(data.jobs);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Jobs unavailable."); }
  };
  const prepareGeneratedModel = async (request: { provider?: string; message?: string; image?:string; signal?: AbortSignal; resumeId?: string },insert=false) => {
    const base = fingerprint(doc), projectId = doc.id;
    if (pending&&!pending.generatedJobId) throw new Error("Apply or discard the current preview first.");
    setError(null);
    try {
      await require3DSession({signal:request.signal});
      if(request.resumeId){setGenerationStatus('Reading generation status');setBusy('Reading generation status…');}
      if(request.provider==='hunyuan')setGenerationStatus('Submitting generation');
      if(request.provider==='hunyuan')await store.saveVerified();
      const { job, buffer } = await generate3DModel({ provider: request.provider, prompt: request.message, image:request.image, projectId, studio, signal: request.signal, resumeId: request.resumeId, onProgress: job => { if(job.provider==='hunyuan'){setGenerationStatus(generationLabel(job));setBusy(`Hunyuan3D · ${generationLabel(job)}`);}else setBusy(job.status === "IMPORTING" ? "Importing generated GLB…" : `${job.provider} · ${Math.round(job.progress)}% · ${job.status.toLowerCase()}`); setGenerationJobs(current => current?.map(previous => previous.id === job.id ? job : previous) ?? null); } });
      if(job.provider==='hunyuan'){
        const asset=await cacheGeneratedAsset(buffer,job.id);request.signal?.throwIfAborted();
        if(docRef.current.id!==projectId)throw new Error('Project changed. Open this generation from its originating project.');
        const scene=docRef.current;
        const target=viewport.current?.camera().target??scene.camera.target;
        const object=makeObject('model',{name:`Hunyuan · ${job.prompt.slice(0,90)}`,asset:{jobId:job.id,provider:'hunyuan'},dimensions:asset.dimensions,position:[target[0],asset.dimensions[1]/2,target[2]]});
        const preview=validateDocument({...scene,objects:[...scene.objects,object]});
        if(insert){store.commit(preview);setPending(null);setTool('translate');}
        else setPending({commands:[],preview,base:fingerprint(scene),generatedJobId:job.id});
        setSelected([object.id]);setGenerationJobs(null);requestAnimationFrame(()=>viewport.current?.fit());
        return{message:insert?'Inserted the generated GLB. Move, rotate, scale, duplicate and Undo are available.':'Completed. Inspect the interactive GLB preview in the existing viewport, then choose Insert into Studio. Download GLB keeps the original file.',provider:job.provider,model:job.model,assetJobId:job.id};
      }
      const objects = await importModel(buffer, "AI_generated.glb");
      if (!objects.some(o => ["mesh", "box", "sphere", "cylinder"].includes(o.kind))) throw new Error("The generated GLB contains no editable mesh geometry.");
      request.signal?.throwIfAborted();
      if (fingerprint(docRef.current) !== base) throw new Error("Project changed during generation. Resume this result from AI generation jobs to preview it in the current scene.");
      if (objects[0]) objects[0].name = `AI · ${job.prompt.slice(0, 90)}`;
      const preview = validateDocument({ ...doc, objects: [...doc.objects, ...objects] });
      setPending({ commands: [{ type: "create", kind: "mesh", name: `${job.provider} generated GLB` }], preview, base });
      setGenerationJobs(null); requestAnimationFrame(() => viewport.current?.fit());
      return { message: "The 3D provider generated a real GLB model. Review the editable preview, then choose Apply or Discard. Applying is undoable; the source remains available in AI generation jobs.", provider: job.provider, model: job.model };
    } finally { setBusy("");setGenerationStatus(null); }
  };
  const resumeGeneration = async (id: string) => {
    resumeController.current?.abort(); const controller = new AbortController(); resumeController.current = controller;
    try { const result=await prepareGeneratedModel({ resumeId: id, signal: controller.signal });if(result.assetJobId)setMessages(current=>[...current,{id:crypto.randomUUID(),role:'assistant',text:result.message,meta:`${result.provider} · ${result.model}`,assetJobId:result.assetJobId}]); }
    catch (caught) { if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : "Generation could not be resumed."); }
    finally { if (resumeController.current === controller) resumeController.current = null; }
  };

  const requestSceneAnswer: typeof requestStudioAnswer = async request => {
    if (request.provider === "you") return await requestStudioAnswer(request);
    if (["meshy", "tripo", "hunyuan"].includes(request.provider)) return await prepareGeneratedModel(request);
    if(blocked)throw new Error('Finish the current operation first.');
    const source=docRef.current,targets=[...selected],base=fingerprint(source),epoch=editEpoch.current;
    let committed:string|null=null;
    setPlanning(true);setError(null);
    try{
      // Yield to the existing renderer before synchronous geometry work.
      await nextStudioFrame();request.signal?.throwIfAborted();
      if(targets.length!==1&&/\b(this|that|selected) (object|wall|roof|building|mesh)\b|\bit\b/i.test(request.message))throw new Error('Select one object or component to edit first.');
      let commands=planContextEdit(source,targets,request.message),provider='local',model='validated scene command';
      if(!commands){
        const response=await fetch('/api/ai-scene',{method:'POST',headers:{'Content-Type':'application/json'},signal:request.signal,body:JSON.stringify({provider:request.provider,prompt:request.message,document:source,selected:targets})});
        const data=await response.json();if(!response.ok)throw new Error((typeof data.error==='string'?data.error:data.error?.message)||'Scene editing failed.');commands=data.commands;provider=data.provider;model=data.model;
      }
      request.signal?.throwIfAborted();
      if(epoch!==editEpoch.current||fingerprint(docRef.current)!==base)throw new Error('The scene changed while planning. Retry with the current object.');
      const next=validateEditScope(source,targets,commands!);
      if(fingerprint(next)===base){setEditing(null);return{message:'The selected scene already matches this operation. No changes were needed.',provider,model};}
      if(commands!.some(c=>c.type==='delete')){
        setPending({commands:commands!,preview:next,base,destructive:true,expires:Date.now()+30_000});setEditing(null);
        return{message:'This operation deletes existing geometry. Confirm the deletion below within 30 seconds, or cancel. No changes have been applied.',provider,model};
      }
      const affected=Array.from(new Set([...targets,...commands!.flatMap(c=>c.id?[c.id]:[]),...next.objects.filter(o=>!source.objects.some(old=>old.id===o.id)).map(o=>o.id)]));
      setEditing({ids:affected,phase:'updating'});store.commit({...next,camera:viewport.current?.camera()??docRef.current.camera});
      committed=fingerprint(next);
      await verifyStudioState(()=>fingerprint(docRef.current)===fingerprint(next)&&viewport.current?.rendered()===fingerprint(next),request.signal??new AbortController().signal,5000);
      setEditing({ids:affected,phase:'completed'});
      editTimer.current=setTimeout(()=>setEditing(null),450);
      return{message:`Applied ${commands!.length} validated scene operation${commands!.length===1?'':'s'}${context.label?` to ${context.label}`:''}. Undo is available.`,provider,model};
    }catch(error){if(committed)store.rollback(committed);setEditing(null);throw error;}finally{setPlanning(false);}
  };
  const applyProposal = () => safely(() => {
    if (!pending || pending.base !== fingerprint(doc) || (pending.expires&&pending.expires<Date.now())) throw new Error("The scene changed or confirmation expired. Cancel and repeat the request.");
    store.commit({ ...pending.preview, name: doc.name, camera: doc.camera }); setPending(null); requestAnimationFrame(() => viewport.current?.fit());
    setSelected(ids=>ids.filter(id=>pending.preview.objects.some(o=>o.id===id)));
  });
  useStudioActionAdapter({name:`${identity}:${studio}:${doc.id}`,
    confirmation:action=>{
      if(action.intent==='project.new')return{key:fingerprint(doc),message:'Replace the current editor with a new project? The current project will first be retained in browser recovery.'};
      if(action.intent==='scene.delete'){
        const ids=new Set(action.parameters.scope==='all'?doc.objects.map(o=>o.id):selected);
        for(let i=0;i<32;i++)doc.objects.forEach(o=>{if(o.parentId&&ids.has(o.parentId))ids.add(o.id);});
        if(ids.size>0)return{key:JSON.stringify([fingerprint(doc),Array.from(ids)]),message:`Delete ${ids.size} project objects?`};
      }
      return null;
    },
    execute:async(action,signal)=>{
      if(!store.ready)throw new Error('The project is not ready. Resolve the opening error first.');
      signal.throwIfAborted();
      if(action.intent==='studio.navigate'){
        await store.recover();signal.throwIfAborted();const href=STUDIO_ROUTES[action.parameters.studio];
        const target=new URL(href,location.origin);navigateStudioRoute(href,router.push);
        await verifyStudioState(()=>location.pathname===target.pathname&&new URL(location.href).searchParams.get('mode')===target.searchParams.get('mode'),signal);
        return `${action.parameters.studio} studio opened. The prior scene is retained in browser recovery.`;
      }
      if(action.intent==='project.save')return await store.saveVerified();
      if(action.intent==='project.open'){await listProjects();return 'Project browser opened. Choose a project to continue.';}
      if(action.intent==='project.new'){await store.recover();signal.throwIfAborted();store.replace(makeDocument(studio));setSelected([]);setPending(null);await verifyStudioState(()=>docRef.current.id!==doc.id,signal);return 'New project opened; previous project retained in browser recovery.';}
      if(action.intent==='map.open'||action.intent==='map.close'){
        if(studio!=='infrastructure')throw new Error('World Map is available only in Infrastructure Studio. Open Infrastructure first.');
        setMapOpened(true);setWorldMap(action.intent==='map.open');
        if(action.intent==='map.open')await verifyStudioState(()=>Boolean(worldMapAPI.current?.ready()),signal,15000);else await verifyStudioState(()=>!globalThis.document.querySelector('.scene-workbench[data-world-map="true"]'),signal);
        return action.intent==='map.open'?'World Map activated.':'3D Studio activated; map and scene state retained.';
      }
      if(action.intent==='map.search'){if(!worldMap)throw new Error('Activate World Map before searching a location.');return await worldMapAPI.current!.command(action,signal);}
      if(action.intent.startsWith('viewport.')){
        if(worldMap)return await worldMapAPI.current!.command(action,signal);
        const camera=viewport.current;if(!camera)throw new Error('The 3D viewport is not available.');
        if(action.intent==='viewport.zoom')camera.zoom((action.parameters.direction==='in'?1.25:.8)**action.parameters.amount);
        else if(action.intent==='viewport.pan')camera.pan(action.parameters.direction);
        else if(action.intent==='viewport.rotate')camera.rotate(action.parameters.degrees);
        else if(action.intent==='viewport.focus'){if(action.parameters.scope==='selected'&&!selected.length)throw new Error('Select an object before focusing it.');if(action.parameters.scope==='selected')camera.focus();else camera.fit();}
        else if(action.intent==='viewport.reset')store.setCamera(makeDocument(studio).camera);
        else if(action.intent==='viewport.view'){const view=action.parameters.view==='3D'?'Perspective':action.parameters.view==='2D'?'Top':action.parameters.view;setCameraView(view);store.setCamera({...camera.camera(),projection:view==='Orthographic'?'orthographic':'perspective'});await new Promise<void>(resolve=>requestAnimationFrame(()=>{if(view!=='Orthographic')viewport.current?.preset(view);resolve();}));}
        await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));if(action.intent!=='viewport.reset'&&viewport.current)store.setCamera(viewport.current.camera());await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));return 'Viewport camera updated.';
      }
      if(action.intent==='panel.open'){
        if(action.parameters.panel==='sidebar')setLeft(true);else{setRight(true);if(action.parameters.panel==='lighting')requestAnimationFrame(()=>globalThis.document.querySelector('.scene-environment')?.scrollIntoView({block:'nearest'}));}
        await verifyStudioState(()=>Boolean(globalThis.document.querySelector(action.parameters.panel==='sidebar'?'.scene-library':'.scene-inspector')),signal);return `${action.parameters.panel} panel opened.`;
      }
      if(action.intent==='ui.library'){toolbarAPI.current?.openLibrary();await verifyStudioState(()=>Boolean(globalThis.document.querySelector('.casynus-material-library')),signal);return 'Material library opened.';}
      if(action.intent==='ui.fullscreen'){if(!globalThis.document.fullscreenEnabled)throw new Error('Fullscreen is unavailable in this browser.');await globalThis.document.documentElement.requestFullscreen();return 'Fullscreen activated.';}
      if(action.intent==='ui.grid'||action.intent==='ui.snap'){const value=action.parameters.mode==='toggle'?! (action.intent==='ui.grid'?grid:snap):action.parameters.mode==='on';if(action.intent==='ui.grid')setGrid(value);else setSnap(value);await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));return `${action.intent==='ui.grid'?'Grid':'Snapping'} ${value?'enabled':'disabled'}.`;}
      if(action.intent==='project.export'){
        if(action.parameters.format==='open'){toolbarAPI.current?.openExport();await verifyStudioState(()=>Boolean(globalThis.document.querySelector('dialog[aria-label="Export scene"][open]')),signal);return 'Export choices opened.';}
        if(action.parameters.format==='csv'){toolbarAPI.current?.csv();return 'CSV download requested.';}
        if(!['glb','gltf','obj','stl','json','png','jpeg'].includes(action.parameters.format))throw new Error('That export format is unavailable in this 3D studio.');
        await exportFile(action.parameters.format,true);return 'Export finished; the browser download was requested.';
      }
      if(worldMap)throw new Error('Base map features are read-only. Close World Map to edit project objects.');
      if(blocked)throw new Error('Apply or discard the pending scene proposal before changing the project.');
      if(action.intent==='toolbar.activate'){
        if(!['select','translate','rotate','scale','measure'].includes(action.parameters.tool))throw new Error('That drafting tool is only available in the 2D Floor Plan editor.');
        setTool(action.parameters.tool as SceneTool);await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));return `${action.parameters.tool} tool activated.`;
      }
      if(action.intent==='selection.clear'){setSelected([]);await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));return 'Selection cleared.';}
      if(action.intent==='selection.all'){setSelected(doc.objects.filter(o=>!o.parentId&&o.visible&&!locked(o)).map(o=>o.id));await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));return 'Visible unlocked root objects selected.';}
      if(action.intent==='selection.select'){
        const target=normalizeCommand(action.parameters.name),matches=doc.objects.filter(o=>o.visible&&!locked(o)&&(!target||normalizeCommand(o.name)===target||o.id===target));
        if(matches.length!==1)throw new Error(matches.length?'Which object? Specify its unique name from Scene hierarchy.':'No selectable object has that name. Use an exact hierarchy name.');
        setSelected([matches[0].id]);await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));return `${matches[0].name} selected.`;
      }
      const before=fingerprint(doc);
      if(action.intent==='scene.create'){if(['building','room','intersection'].includes(action.parameters.kind))template(action.parameters.kind,true);else add(action.parameters.kind,undefined,true);}
      else if(action.intent==='history.undo'){if(!store.history.past.length)throw new Error('There is nothing to undo.');store.undo();}
      else if(action.intent==='history.redo'){if(!store.history.future.length)throw new Error('There is nothing to redo.');store.redo();}
      else{
        const ids=action.intent==='scene.delete'&&action.parameters.scope==='all'?doc.objects.filter(o=>!o.parentId).map(o=>o.id):selectedRoots;
        if(!ids.length)throw new Error('Select the target object first.');
        if(ids.some(id=>locked(doc.objects.find(o=>o.id===id)!)))throw new Error('Unlock the target objects and parents first.');
        if(action.intent==='scene.delete'){if(action.parameters.scope==='selected')remove(true);else change(applyCommands(doc,ids.map(id=>({type:'delete',id}))));setSelected([]);}
        else if(action.intent==='scene.duplicate')duplicate(true);
        else if(action.intent==='scene.material')change(applyCommands(doc,ids.map(id=>({type:'material',id,material:action.parameters.material}))));
        else if(action.intent==='scene.transform'){
          const p=action.parameters,index={x:0,y:1,z:2}[p.axis];
          change(applyCommands(doc,ids.map(id=>{const object=doc.objects.find(o=>o.id===id)!,vector=[...object[p.property]] as Vec3;vector[index]=(p.relative?vector[index]:0)+p.value*(p.property==='rotation'?Math.PI/180:1);return{type:'transform',id,[p.property]:vector};})));
        }else throw new Error('This action is not enabled in the current studio.');
      }
      await verifyStudioState(()=>fingerprint(docRef.current)!==before,signal);
      return action.intent==='scene.create'?`${action.parameters.kind} added to the editable scene.`:'Scene change confirmed. Undo is available.';
    }
  });

  useEffect(() => {
    setSelected(current => current.filter(id => doc.objects.some(o => o.id === id)));
    setHoveredId(current=>doc.objects.some(o=>o.id===current)?current:null);
  }, [doc.objects]);
  useEffect(()=>{
    const id=hoveredId??selected.at(-1);if(!id)return;
    hierarchyRef.current?.querySelector<HTMLElement>(`[data-scene-object-id="${CSS.escape(id)}"]`)?.scrollIntoView({block:"nearest",inline:"nearest"});
  },[selected,hoveredId]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (worldMap) return;
      if ((event.target as HTMLElement)?.closest("input,textarea,select,[contenteditable=true]") || globalThis.document.pointerLockElement) return;
      if (event.key === "Escape") { setPending(null); setTool("select"); setSelected([]); return; }
      const mod = event.ctrlKey || event.metaKey;
      if (mod && event.key.toLowerCase() === "s") { event.preventDefault(); void store.save(); return; }
      if (blocked) return;
      if (mod && event.key.toLowerCase() === "z") { event.preventDefault(); if (event.shiftKey) store.redo(); else store.undo(); }
      else if (mod && event.key.toLowerCase() === "d") { event.preventDefault(); if (selected.length) duplicate(); }
      else if (event.key === "Delete" && selected.length) { event.preventDefault(); remove(); }
      else if (!mod) { const tools: Record<string, SceneTool> = { q: "select", w: "translate", e: "rotate", r: "scale" }; if (tools[event.key.toLowerCase()]) setTool(tools[event.key.toLowerCase()]); else if (event.key.toLowerCase() === "f") viewport.current?.focus(); }
    };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  });

  return <main data-world-map={worldMap || undefined} className={`crystal-studio scene-workbench ${left ? "" : "scene-left-closed"} ${right ? "" : "scene-right-closed"}`} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (worldMap) return; if (e.dataTransfer.files[0]) void importFile(e.dataTransfer.files[0]); else { const name = e.dataTransfer.getData("application/x-casynus-asset"); if (catalog.includes(name)) add(name, viewport.current?.point(e.clientX, e.clientY)); } }}>
    {store.ready && <SceneViewport ref={viewport} document={pending&&!pending.destructive?pending.preview:doc} previewJob={pending?.generatedJobId} editing={editing} selected={selected} tool={pending||planning ? "select" : tool} snap={snap} grid={grid} autoRotate={autoRotate && !worldMap && !blocked} onSelect={select} onHover={setHoveredId} onTransform={(id, values) => patch(id, values)} onCameraChange={store.setCamera} />}
    {studio === "infrastructure" && mapOpened && <WorldMap key={doc.id} apiRef={worldMapAPI} active={worldMap} onViewChange={setMapView} importDisabled={blocked} onImport={feature => safely(() => {
      const scene = docRef.current;
      const objects = importGeographicFeature(feature, scene.objects.find(object => object.geographic)?.geographic?.origin);
      change(validateDocument({ ...scene, objects: [...scene.objects, ...objects] })); setSelected(objects.map(object => object.id)); setWorldMap(false); setTool("translate");
      requestAnimationFrame(() => viewport.current?.fit());
    })} />}

    {left && <StudioPanel className="scene-sidebar scene-left"><StudioHeader title={names[studio]} onBack={() => void leave("/project")} onCollapse={() => setLeft(false)} />
      <nav className="scene-studio-nav" aria-label="Design studios">{(Object.keys(routes) as Studio[]).map(s => <button key={s} className={s === studio ? "is-active" : ""} onClick={() => void navigate(s)}>{s === "architecture" ? "Architecture" : s === "interior" ? "Sketch" : "Infra"}</button>)}</nav>
      <div className="scene-project-row"><input aria-label="Project name" key={doc.id + doc.name} defaultValue={doc.name} maxLength={120} onBlur={e => { if (e.target.value.trim() !== doc.name) safely(() => change({ ...doc, name: e.target.value.trim() })); }} /><button aria-label="Open projects" onClick={() => void listProjects()}><FolderOpen size={16} /></button>
        <details className="scene-project-actions"><summary aria-label="Project actions" title="Project actions"><MoreHorizontal size={18} /></summary><div className="scene-project-actions-content" onClick={e => { if ((e.target as HTMLElement).closest("button:not(:disabled)")) e.currentTarget.parentElement?.removeAttribute("open"); }}>
      <Menu name="File"><button onClick={() => void newProject()}>New project</button><button onClick={() => void listProjects()}>Open workspace project</button><button onClick={() => void listGenerationJobs()}>AI generation jobs</button><button onClick={() => void store.save()}>Save · Ctrl S</button><button onClick={() => { store.saveCopy(); setPending(null); }}>Save as copy</button><button onClick={() => file.current?.click()}>Import model / JSON</button><button onClick={() => void exportFile("json")}>Download project JSON</button></Menu>
      <Menu name="Edit"><button disabled={blocked || !store.history.past.length} onClick={store.undo}>Undo · Ctrl Z</button><button disabled={blocked || !store.history.future.length} onClick={store.redo}>Redo · Ctrl Shift Z</button><button disabled={blocked || !selected.length} onClick={()=>duplicate()}>Duplicate · Ctrl D</button><button disabled={blocked || !selected.length} onClick={()=>remove()}>Delete selected</button><button disabled={blocked || selected.length < 2} onClick={() => group()}>Group selection</button><button disabled={blocked || primary?.kind !== "group"} onClick={() => group(true)}>Ungroup</button><button disabled={blocked || selected.length < 2} onClick={() => safely(() => { if (doc.objects.some(o => selected.includes(o.id) && locked(o))) throw new Error("Unlock objects and their parents first."); change({ ...doc, objects: doc.objects.map(o => selected.includes(o.id) ? { ...o, position: [primary!.position[0], o.position[1], o.position[2]] } : o) }); })}>Align selected local X</button></Menu>
      <Menu name="View"><button onClick={() => viewport.current?.fit()}>Frame all</button><button onClick={() => viewport.current?.focus()}>Focus selected · F</button><button onClick={() => setGrid(v => !v)}>{grid ? "Hide" : "Show"} grid</button><button onClick={() => store.setCamera({ ...doc.camera, projection: doc.camera.projection === "perspective" ? "orthographic" : "perspective" })}>{doc.camera.projection === "perspective" ? "Orthographic" : "Perspective"} projection</button></Menu>
      <Menu name="Tools">{(["select", "translate", "rotate", "scale", "measure"] as SceneTool[]).map(t => <button key={t} disabled={blocked} onClick={() => setTool(t)}>{t}</button>)}<button onClick={() => setSnap(v => !v)}>{snap ? "Disable" : "Enable"} grid snapping</button>{["Vertex / edge / face editing", "Extrude / inset / bevel", "Vertex / surface snapping"].map(t => <button key={t} disabled title="Unavailable in this release">{t} · unavailable</button>)}</Menu>
      <Menu name="Camera">{["Perspective", "Front", "Back", "Left", "Right", "Top"].map(name => <button key={name} onClick={() => viewport.current?.preset(name)}>{name}</button>)}<button onClick={() => viewport.current?.zoom(1.25)}>Zoom in</button><button onClick={() => viewport.current?.zoom(.8)}>Zoom out</button><button onClick={() => store.setCamera(makeDocument(studio).camera)}>Reset camera</button><button onClick={() => safely(() => viewport.current?.walk())}>Walkthrough · WASD / Esc</button></Menu>
      <Menu name="Render">{["performance", "balanced", "ultra"].map(quality => <button key={quality} disabled={blocked} onClick={() => safely(() => change({ ...doc, environment: { ...doc.environment, quality: quality as SceneDocument["environment"]["quality"] } }))}>{quality === "ultra" ? "Ultra raster" : quality}</button>)}<button disabled title="Unavailable in this release">Path tracing / AO postprocessing · unavailable</button></Menu>
      <Menu name="Export">{["glb", "gltf", "obj", "stl", "png", "jpeg", "json"].map(format => <button key={format} disabled={Boolean(busy) || !store.ready} onClick={() => void exportFile(format)}>{format.toUpperCase()}</button>)}</Menu>

          <button aria-label="Save project" onClick={() => void store.save()}><Save size={16} />Save project</button><span className="scene-save-state" role="status">{store.status}</span>
        </div></details></div>
      <div className="scene-sidebar-content"><section className="scene-library"><h2>Object library <span>meters</span></h2><input aria-label="Search object library" placeholder="Search library…" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="scene-library-items">{catalog.filter(name => name.toLowerCase().includes(search.toLowerCase())).map(name => <button key={name} disabled={blocked} draggable={!blocked} onDragStart={e => e.dataTransfer.setData("application/x-casynus-asset", name)} onClick={() => add(name)}><Box size={13} />{name}</button>)}</div>
        <div className="scene-templates"><label>Building levels <input aria-label="Building levels" type="number" min={1} max={8} value={stories} onChange={e => setStories(Math.max(1, Math.min(8, Number(e.target.value) || 1)))} /></label>{[["building", "Add building"], ["room", "Add furnished room"], ["intersection", "Add intersection"]].map(([id, label]) => <button key={id} disabled={blocked} onClick={() => template(id)}>{label}</button>)}</div>
      </section>
      <section className="scene-hierarchy" ref={hierarchyRef}><h2><Layers3 size={14} />Scene hierarchy <span>{doc.objects.length}</span></h2>{doc.objects.map(o => {
        let depth = 0, parent = o.parentId; while (parent && depth < 32) { depth++; parent = doc.objects.find(n => n.id === parent)?.parentId ?? null; }
        const selectedIndex=selected.indexOf(o.id);
        return <div key={o.id} data-scene-object-id={o.id} data-selection={selectedIndex===0?"primary":selectedIndex>0?"secondary":undefined} data-hovered={hoveredId===o.id||undefined}
          onPointerEnter={()=>setHoveredId(o.id)} onPointerLeave={()=>setHoveredId(current=>current===o.id?null:current)}
          className={`scene-tree-row ${selectedIndex>=0 ? "is-selected" : ""}`}>
          <button className="scene-tree-name" aria-pressed={selectedIndex>=0} style={{ paddingLeft: 8 + depth * 10 }} onClick={e => select(o.id, e.shiftKey || e.ctrlKey || e.metaKey)} onDoubleClick={() => { setSelected([o.id]); requestAnimationFrame(() => viewport.current?.focus()); }} title={`${o.name} · Shift/Ctrl-click to multi-select`}>{o.kind === "group" ? <Layers3 size={12} /> : <Box size={12} />}<span>{o.name}</span></button>
          <button aria-label={`${o.visible ? "Hide" : "Show"} ${o.name}`} disabled={blocked} onClick={() => patch(o.id, { visible: !o.visible }, true)}>{o.visible ? <Eye size={12} /> : <EyeOff size={12} />}</button><button aria-label={`${o.locked ? "Unlock" : "Lock"} ${o.name}`} disabled={blocked} onClick={() => patch(o.id, { locked: !o.locked }, true)}>{o.locked ? <Lock size={12} /> : <Unlock size={12} />}</button>
        </div>;
      })}</section>
      {studio === "interior" && <Link className="scene-classic-link" href={`${routes[studio]}?workspace=classic`} onClick={e => { e.preventDefault(); void leave(`${routes[studio]}?workspace=classic`); }}>Open 2D drafting tools</Link>}
      </div>
      <StudioSidebarFooter onSettings={()=>{setRight(true);requestAnimationFrame(()=>globalThis.document.querySelector(".scene-environment")?.scrollIntoView({block:"nearest"}));}} onProfile={()=>void leave("/account")}/>
    </StudioPanel>}

    <section className="scene-view" aria-label={`${names[studio]} 3D viewport`}>
      {!store.ready && <div className="scene-opening">{store.failure ?? "Opening scene…"}<button onClick={() => { store.replace(makeDocument(studio)); }}>Create empty project</button></div>}
      {(!left || !right) && <div className="scene-panel-toggles">{!left && <button aria-label="Show scene sidebar" onClick={() => setLeft(true)}><PanelLeft size={18} /></button>}{!right && <button aria-label="Show inspector" onClick={() => setRight(true)}><PanelRight size={18} /></button>}</div>}
      <StudioViewportToolbar label="Scene transformation tools"
        apiRef={toolbarAPI}
        materialLibrary={{canApply:!blocked&&selected.length>0&&Boolean(primary&&!primary.kind.endsWith("Light")),activeMap:primary?.material.map,onApply:material=>safely(()=>change(applyLibraryMaterial(docRef.current,selectedRoots,material)))}}
        leading={[
          ...(studio === "infrastructure" ? [{ label: worldMap ? "3D Editor" : "World Map", icon: worldMap ? Box : Globe2, active: worldMap, onClick: () => { setMapOpened(true); setWorldMap(value => !value); } }] : []),
          { label: studio === "interior" ? "Add furnished room" : "Add building", icon: Building2, onClick: () => template(studio === "interior" ? "room" : "building"), disabled: blocked },
          { label: "Add Tree", icon: TreePine, onClick: () => add("Tree"), disabled: blocked },
          { label: 'AI 3D Generate', icon: Sparkles, active:model==='hunyuan', onClick:()=>void activate3DGeneration(), disabled:checkingGeneration||planning||Boolean(busy)||Boolean(pending&&!pending.generatedJobId) },
        ]}
        tools={([
          ["select", MousePointer2, "Select · Q"], ["translate", Move, "Move · W"], ["rotate", Rotate3D, "Rotate · E"], ["scale", Maximize2, "Scale · R"], ["measure", Ruler, "Measure distance"],
        ] as const).map(([id, icon, label]) => ({ label, icon, active: tool === id, disabled: blocked, onClick: () => setTool(id) }))}
        onFit={() => worldMap ? worldMapAPI.current?.reset() : viewport.current?.fit()} onReset={() => { if (worldMap) { worldMapAPI.current?.reset(); setMapView("Globe"); } else store.setCamera(makeDocument(studio).camera); }}
        cameraViews={worldMap ? ["Globe", "Pitched"] : ["Perspective", "Orthographic", "Front", "Back", "Left", "Right", "Top"]} cameraView={worldMap ? mapView : cameraView}
        onCamera={view => { if (worldMap) { setMapView(view); worldMapAPI.current?.view(view); return; } setCameraView(view); store.setCamera({ ...(viewport.current?.camera() ?? doc.camera), projection: view === "Orthographic" ? "orthographic" : "perspective" }); if (view !== "Orthographic") requestAnimationFrame(() => viewport.current?.preset(view)); }}
        onZoom={factor => worldMap ? worldMapAPI.current?.zoom(factor) : viewport.current?.zoom(factor)} exportFormats={worldMap ? ["glb", "gltf", "obj", "stl", "json"] : ["glb", "gltf", "obj", "stl", "png", "jpeg", "json"]} onExport={format => void exportFile(format)}
        onCSV={() => downloadStudioCSV(doc.name, doc.objects.map(o => ({ id: o.id, name: o.name, type: o.kind, parentId: o.parentId, position: o.position, rotation: o.rotation, scale: o.scale, dimensions: o.dimensions })))}
        settingsLabel={autoRotate ? "Stop slow object rotation" : "Slowly rotate object"} settingsActive={autoRotate} onSettings={() => setAutoRotate(v => !v)} busy={Boolean(busy) || !store.ready} />

      {(error || store.failure) && <div className="scene-alert" role="alert"><span>{error || store.failure}</span>{store.conflict && <><button onClick={() => { if (window.confirm("Open the cloud revision and replace this browser recovery? Save a recovered copy first to retain both versions.")) window.location.href = `${routes[studio]}?project=${doc.id}&cloud=1`; }}>Open cloud copy</button><button onClick={store.saveCopy}>Save recovered copy</button></>}<button aria-label="Dismiss scene error" onClick={() => { setError(null); if (!store.conflict) store.setFailure(null); }}><X size={15} /></button></div>}
      {busy && <div className="scene-busy" role="status">{busy}</div>}
      {pending && !pending.generatedJobId && <div className="scene-proposal" role="dialog" aria-label={pending.destructive?'Confirm destructive scene edit':'Review AI scene proposal'}><strong>{pending.destructive?'Confirm deletion · scene unchanged':'Preview · changes are not applied'}</strong><ol>{pending.commands.map((c, i) => <li key={i}>{c.type} {c.template || c.name || c.id || c.kind || "lighting"}</li>)}</ol><div><button onClick={applyProposal}>{pending.destructive?'Confirm deletion':'Apply scene proposal'}</button><button onClick={() => setPending(null)}>{pending.destructive?'Cancel deletion':'Discard proposal'}</button></div></div>}
      <StudioAIChat studio={studio === "architecture" ? "modeling" : studio === "interior" ? "floor-plan" : "infrastructure"} open={dock.open} onOpenChange={dock.setOpen} prompt={prompt} onPromptChange={setPrompt} onSubmit={() => {}} model={model} onModelChange={changeChatModel} models={[...providers, ...meshProviders.filter(p=>p.id!=='hunyuan'),{id:'hunyuan',label:'Hunyuan3D 2.1'}]} messages={messages} onMessagesChange={setMessages} onClearMessages={() => setMessages([])} onNewChat={() => { setMessages([]); setPrompt("");if(pending?.generatedJobId){setPending(null);setSelected([]);} }} requestAnswer={meshProvider || (sceneAI && model !== "you") ? requestSceneAnswer : undefined} selectedContext={context.label} onExecutionChange={model==='hunyuan'?undefined:executionChange} generationStatus={generationStatus}
        onInsertGeneratedModel={async id=>{if(pending?.generatedJobId===id){applyProposal();setTool('translate');return;}if(blocked)throw new Error('Finish the current scene operation first.');resumeController.current?.abort();const controller=new AbortController();resumeController.current=controller;try{await prepareGeneratedModel({resumeId:id,signal:controller.signal},true);}finally{if(resumeController.current===controller)resumeController.current=null;}}}
        onPreviewGeneratedModel={async id=>{if(pending?.generatedJobId===id){viewport.current?.focus();return;}await prepareGeneratedModel({resumeId:id});}}
        onDownloadGeneratedModel={async id=>{const buffer=await readModelBytes(await fetch(`/api/ai3d/jobs/${encodeURIComponent(id)}/asset`,{cache:'no-store'}));download(new Blob([buffer],{type:'model/gltf-binary'}),'Casynus_Hunyuan.glb');}}
        onHistoryRequest={redo=>{if(!blocked){if(redo)store.redo();else store.undo();}}}
        loading={Boolean(generationStatus)} onStop={()=>resumeController.current?.abort()}
        contextControls={<div className="scene-chat-mode"><label><input type="checkbox" checked={meshProvider||sceneAI} disabled={model==='you'||meshProvider||Boolean(pending)||planning} onChange={e=>setSceneAI(e.target.checked)}/>{model==='hunyuan'?'Image to 3D · shape only':meshProvider?'AI model generation · preview first':'AI scene editing'}</label>{model==='you'&&<small>You: research chat</small>}</div>}/>
      <div className="scene-navigation-hint">{worldMap ? "Drag to pan · right-drag to rotate/pitch · wheel or pinch to zoom · click to select location" : "RMB orbit · MMB pan · wheel zoom · Shift click multi-select"}</div>
    </section>

    {right && <StudioPanel className="scene-sidebar scene-inspector"><header><strong>Properties</strong><button aria-label="Collapse inspector" onClick={() => setRight(false)}><PanelRight size={17} /></button></header>
      <fieldset disabled={blocked || Boolean(primary && locked(primary))}>
        {primary ? <><h2>{selected.length > 1 ? `${selected.length} selected · primary object` : primary.name}</h2><label className="scene-text-field">Name<input aria-label="Object name" key={primary.id + primary.name} defaultValue={primary.name} maxLength={120} onBlur={e => { if (e.target.value.trim() && e.target.value !== primary.name) patch(primary.id, { name: e.target.value.trim() }); }} /></label>
          {(["position", "rotation", "scale", "dimensions"] as const).filter(property => property !== "dimensions" || (primary.kind !== "group" && !primary.kind.endsWith("Light"))).map(property => <section key={property}><h3>{property === "rotation" ? "Rotation · degrees" : property === "dimensions" ? "Dimensions · meters" : property}</h3><div className="scene-number-grid">{["X", "Y", "Z"].map((axis, index) => <NumberField key={axis} label={`${property} ${axis}`} value={primary[property][index] * (property === "rotation" ? 180 / Math.PI : 1)} min={property === "scale" || property === "dimensions" ? .001 : -10000} max={property === "scale" || property === "dimensions" ? 1000 : 10000} onChange={value => { const next = [...primary[property]] as Vec3; next[index] = value * (property === "rotation" ? Math.PI / 180 : 1); patch(primary.id, { [property]: next }); }} />)}</div></section>)}
          {!primary.kind.endsWith("Light") && <section><h3>Physical material</h3><select aria-label="Material preset" defaultValue="" key={primary.id} onChange={e => { if (MATERIALS[e.target.value]) patch(primary.id, { material: { ...MATERIALS[e.target.value] } }); }}><option value="">Choose preset</option>{Object.keys(MATERIALS).map(m => <option key={m}>{m}</option>)}</select><SceneColorField label="Base color" value={primary.material.color} opacity={primary.material.opacity} onChange={color => patch(primary.id, { material: { ...primary.material, color } })} onOpacity={opacity => patch(primary.id, { material: { ...primary.material, opacity } })} />{(["roughness", "metalness", "opacity", "transmission"] as const).map(key => <NumberField key={key} label={key} value={primary.material[key]} min={0} max={1} onChange={value => patch(primary.id, { material: { ...primary.material, [key]: value } })} />)}
            <select aria-label="Texture map slot" value={textureSlot} onChange={e => setTextureSlot(e.target.value)}>{["map", "normalMap", "roughnessMap", "metalnessMap", "aoMap"].map(slot => <option key={slot}>{slot}</option>)}</select><button onClick={() => texture.current?.click()}>Upload texture</button><NumberField label="UV repeat" min={.01} max={1000} value={primary.material.uvScale?.[0] ?? 1} onChange={value => patch(primary.id, { material: { ...primary.material, uvScale: [value, value] } })} /></section>}
          {primary.kind.endsWith("Light") && <SceneColorField label="Light color" value={primary.material.color} onChange={color => patch(primary.id, { material: { ...primary.material, color } })} />}
          {primary.kind.endsWith("Light") && <NumberField label="Light intensity · candela" value={primary.intensity ?? 50} min={0} max={10000} onChange={intensity => patch(primary.id, { intensity })} />}
        </> : <p className="scene-muted">Select an object in the viewport or hierarchy to edit it.</p>}
      </fieldset>
      <section className="scene-environment"><h2>Lighting & environment</h2><select aria-label="Rendering quality" value={doc.environment.quality} disabled={blocked} onChange={e => safely(() => change({ ...doc, environment: { ...doc.environment, quality: e.target.value as SceneDocument["environment"]["quality"] } }))}><option value="performance">Performance</option><option value="balanced">Balanced</option><option value="ultra">Ultra raster</option></select>{(["exposure", "sunIntensity", "sunAzimuth", "sunElevation"] as const).map(key => <NumberField key={key} label={key} value={doc.environment[key]} min={key === "exposure" ? .1 : key === "sunAzimuth" ? -360 : key === "sunElevation" ? -5 : 0} max={key === "exposure" ? 4 : key === "sunIntensity" ? 10 : key === "sunElevation" ? 90 : 360} onChange={value => safely(() => change({ ...doc, environment: { ...doc.environment, [key]: value } }))} />)}<label><input type="checkbox" checked={doc.environment.shadows} disabled={blocked} onChange={e => safely(() => change({ ...doc, environment: { ...doc.environment, shadows: e.target.checked } }))} />Sun shadows</label><p className="scene-muted">Studio image-based reflections · PBR · ACES tone mapping</p></section>
      <p className="scene-format-note">GLB/glTF preserve compatible materials and hierarchy. OBJ/STL export geometry; use project JSON for editor state.</p>
    </StudioPanel>}
    <input ref={file} type="file" className="scene-file-input" aria-label="Import scene file" accept=".glb,.gltf,.obj,.stl,.json" onChange={e => { if (e.target.files?.[0]) void importFile(e.target.files[0]); e.target.value = ""; }} />
    <input ref={texture} type="file" className="scene-file-input" aria-label="Upload material texture" accept="image/png,image/jpeg,image/webp" onChange={e => { const image = e.target.files?.[0]; e.target.value = ""; if (!image || !primary) return; if (image.size > 1_500_000) { setError("Textures are limited to 1.5 MB."); return; } const reader = new FileReader(); reader.onload = () => { if (docRef.current.id !== doc.id) return; const target = docRef.current.objects.find(o => o.id === primary.id); if (target) patch(target.id, { material: { ...target.material, [textureSlot]: String(reader.result) } }); }; reader.onerror = () => setError("Texture could not be read."); reader.readAsDataURL(image); }} />
    {generationJobs && <div className="scene-dialog-shade"><section className="scene-project-dialog" role="dialog" aria-modal="true" aria-label="AI generation jobs"><header><h2>AI generation jobs</h2><button aria-label="Close generation jobs" onClick={() => { resumeController.current?.abort(); setGenerationJobs(null); }}><X size={18} /></button></header>{generationJobs.length ? generationJobs.map(job => <div key={job.id} className="scene-generation-job"><strong>{job.provider} · {job.status} · {Math.round(job.progress)}%</strong><p>{job.prompt}</p>{job.error && <p role="alert">{job.error}</p>}<div><button disabled={Boolean(busy) || Boolean(pending) || ["FAILED", "CANCELED"].includes(job.status)} onClick={() => void resumeGeneration(job.id)}>Resume / preview</button>{job.modelURL && <a href={job.modelURL} target="_blank" rel="noopener noreferrer">Source GLB</a>}</div></div>) : <p>No 3D generations for this project. Choose a configured Meshy or Tripo provider in the assistant to generate a model.</p>}</section></div>}

    {openProjects && <div className="scene-dialog-shade"><section className="scene-project-dialog" role="dialog" aria-modal="true" aria-label="Open workspace project"><header><h2>Workspace projects</h2><button aria-label="Close project dialog" onClick={() => setOpenProjects(null)}><X size={18} /></button></header>{openProjects.length ? openProjects.map(project => <button key={project.id} onClick={() => { void store.recover().then(() => { setOpenProjects(null); router.push(`${routes[studio]}?project=${project.id}`); }).catch(() => setError("Recovery failed. Save or download before opening another project.")); }}>{project.name}</button>) : <p>No saved 3D projects in this workspace.</p>}</section></div>}
  </main>;
}
