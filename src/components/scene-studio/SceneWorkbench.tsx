"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Box, Building2, Eye, EyeOff, Focus, FolderOpen, Layers3, Lock, MoreHorizontal, MousePointer2, PanelLeft, PanelRight, Plus, Rotate3D, Route, Ruler, Save, TreePine, Unlock, X } from "lucide-react";
import { SceneViewport, type SceneTool, type ViewportAPI } from "./SceneViewport";
import { useSceneDocument } from "./useSceneDocument";
import { StudioHeader, StudioPanel } from "@/components/crystal-studio/kit";
import { StudioAIChat } from "@/components/crystal-studio/StudioAIChat";
import { useStudioConversation, useStudioDock } from "@/components/crystal-studio/StudioConversation";
import { applyCommands, createTemplate, makeDocument, makeObject, MATERIALS, validateDocument, type SceneCommand, type SceneDocument, type SceneObject, type Vec3 } from "@/lib/scene/document.mjs";
import { duplicateObjects, exportScene, importModel, regroupObjects } from "@/lib/scene/geometry.mjs";
import type { requestStudioAnswer } from "@/lib/studio-ai.mjs";
import { listRecovery } from "@/lib/scene/recovery";
import { StudioViewportToolbar, downloadStudioCSV } from "@/components/crystal-studio/StudioViewportToolbar";
import "./scene-studio.css";

type Studio = "architecture" | "interior" | "infrastructure";
const routes = { architecture: "/casynus", interior: "/interior", infrastructure: "/infrastructure" };
const names = { architecture: "Architecture", interior: "Interior Design", infrastructure: "Infrastructure" };
const providers = [{ id: "gemini", label: "Gemini" }, { id: "groq", label: "Groq" }, { id: "you", label: "You" }];
const catalog = ["Box", "Sphere", "Cylinder", "Wall", "Floor slab", "Ceiling", "Roof", "Column", "Beam", "Door", "Window", "Sofa", "Coffee table", "Cabinet", "Stairs", "Road", "Sidewalk", "Bridge", "Streetlight", "Tree", "Point light", "Spot light"];
const fingerprint = (d: SceneDocument) => JSON.stringify([d.objects, d.environment]);
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob), link = document.createElement("a");
  link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
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
  const [left, setLeft] = useState(true), [right, setRight] = useState(true), [snap, setSnap] = useState(true), [grid, setGrid] = useState(true);
  const [busy, setBusy] = useState(""), [error, setError] = useState<string | null>(null), [openProjects, setOpenProjects] = useState<Array<{ id: string; name: string; local?: boolean }> | null>(null);
  const [cameraView, setCameraView] = useState("Perspective");
  const [stories, setStories] = useState(2), [search, setSearch] = useState(""), [textureSlot, setTextureSlot] = useState("map");
  const [prompt, setPrompt] = useState(""), [model, setModel] = useState("gemini"), [sceneAI, setSceneAI] = useState(false);
  const [pending, setPending] = useState<{ commands: SceneCommand[]; preview: SceneDocument; base: string } | null>(null);
  const [messages, setMessages] = useStudioConversation([]);
  const dock = useStudioDock();
  useEffect(() => { if (window.matchMedia("(max-width:760px)").matches) { setLeft(false); setRight(false); } }, []);
  const primary = doc.objects.find(o => o.id === selected[0]);
  const blocked = !store.ready || Boolean(pending);
  const selectedRoots = selected.filter(id => { let parent = doc.objects.find(o => o.id === id)?.parentId; while (parent) { if (selected.includes(parent)) return false; parent = doc.objects.find(o => o.id === parent)?.parentId; } return true; });
  const safely = useCallback((operation: () => void) => { try { setError(null); operation(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Operation failed."); } }, []);
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
  const select = (id: string | null, additive = false) => { if (pending) return; setSelected(current => id ? additive ? current.includes(id) ? current.filter(i => i !== id) : [...current, id] : [id] : []); };
  const add = (name: string, point?: Vec3 | null) => safely(() => {
    const objects = asset(name).map(o => !o.parentId && point ? { ...o, position: [o.position[0] + point[0], o.position[1], o.position[2] + point[2]] as Vec3 } : o);
    change({ ...doc, objects: [...doc.objects, ...objects] }); setSelected([objects[0].id]); setTool("translate");
  });
  const template = (name: string) => safely(() => { const objects = createTemplate(name, stories); change({ ...doc, objects: [...doc.objects, ...objects] }); setSelected([objects[0].id]); requestAnimationFrame(() => viewport.current?.fit()); });
  const remove = () => safely(() => { change(applyCommands(doc, selectedRoots.map(id => ({ type: "delete", id })))); setSelected([]); });
  const duplicate = () => safely(() => { if (selected.some(id => locked(doc.objects.find(o => o.id === id)!))) throw new Error("Unlock objects first."); const result = duplicateObjects(doc, selectedRoots); change(result.document); setSelected(result.ids); });
  const group = (ungroup = false) => safely(() => { change(regroupObjects(doc, selectedRoots, ungroup)); setSelected([]); });
  const leave = async (href: string) => { try { await store.recover(); router.push(href); } catch { setError("Recovery failed. Save or download JSON before leaving."); } };
  const navigate = async (target: Studio) => { try { await store.recover(); router.push(`${routes[target]}?project=${doc.id}`); } catch { setError("Recovery failed. Save to cloud or download JSON before switching studios."); } };
  const exportFile = async (format: string) => {
    setBusy(`Exporting ${format.toUpperCase()}…`); setError(null);
    try {
      const blob = format === "json" ? new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" }) : ["png", "jpeg"].includes(format) ? await viewport.current!.screenshot(format as "png" | "jpeg") : await exportScene(doc, format);
      download(blob, `${doc.name.replace(/[^a-z0-9_-]/gi, "_")}.${format}`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Export failed."); }
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
  const requestSceneAnswer: typeof requestStudioAnswer = async request => {
    const base = fingerprint(doc);
    const response = await fetch("/api/ai-scene", { method: "POST", headers: { "Content-Type": "application/json" }, signal: request.signal, body: JSON.stringify({ provider: request.provider, prompt: request.message, document: doc, selected }) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || "Scene proposal failed.");
    if (fingerprint(docRef.current) !== base) throw new Error("The scene changed while AI was planning. Request an updated proposal.");
    const preview = applyCommands(doc, data.commands); setPending({ commands: data.commands, preview, base });
    return { message: `Proposed ${data.commands.length} validated scene operations. Review the viewport preview and choose Apply or Discard. Nothing has been saved or applied yet.`, provider: data.provider, model: data.model };
  };
  const applyProposal = () => safely(() => {
    if (!pending || pending.base !== fingerprint(doc)) throw new Error("The scene changed after this proposal. Discard it and request an updated proposal.");
    store.commit({ ...pending.preview, name: doc.name, camera: doc.camera }); setPending(null); requestAnimationFrame(() => viewport.current?.fit());
  });

  useEffect(() => {
    setSelected(current => current.filter(id => doc.objects.some(o => o.id === id)));
  }, [doc.objects]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
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

  return <main className={`crystal-studio scene-workbench ${left ? "" : "scene-left-closed"} ${right ? "" : "scene-right-closed"}`} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) void importFile(e.dataTransfer.files[0]); else { const name = e.dataTransfer.getData("application/x-casynus-asset"); if (catalog.includes(name)) add(name, viewport.current?.point(e.clientX, e.clientY)); } }}>
    {store.ready && <SceneViewport ref={viewport} document={pending?.preview ?? doc} selected={selected} tool={pending ? "select" : tool} snap={snap} grid={grid} onSelect={select} onTransform={(id, values) => patch(id, values)} onCameraChange={store.setCamera} />}

    {left && <StudioPanel className="scene-sidebar scene-left"><StudioHeader title={names[studio]} onBack={() => void leave("/project")} onCollapse={() => setLeft(false)} />
      <nav className="scene-studio-nav" aria-label="Design studios">{(Object.keys(routes) as Studio[]).map(s => <button key={s} className={s === studio ? "is-active" : ""} onClick={() => void navigate(s)}>{s === "architecture" ? "Architecture" : s === "interior" ? "Interior" : "Infra"}</button>)}</nav>
      <div className="scene-project-row"><input aria-label="Project name" key={doc.id + doc.name} defaultValue={doc.name} maxLength={120} onBlur={e => { if (e.target.value.trim() !== doc.name) safely(() => change({ ...doc, name: e.target.value.trim() })); }} /><button aria-label="Open projects" onClick={() => void listProjects()}><FolderOpen size={16} /></button>
        <details className="scene-project-actions"><summary aria-label="Project actions" title="Project actions"><MoreHorizontal size={18} /></summary><div className="scene-project-actions-content" onClick={e => { if ((e.target as HTMLElement).closest("button:not(:disabled)")) e.currentTarget.parentElement?.removeAttribute("open"); }}>
      <Menu name="File"><button onClick={() => void newProject()}>New project</button><button onClick={() => void listProjects()}>Open workspace project</button><button onClick={() => void store.save()}>Save · Ctrl S</button><button onClick={() => { store.saveCopy(); setPending(null); }}>Save as copy</button><button onClick={() => file.current?.click()}>Import model / JSON</button><button onClick={() => void exportFile("json")}>Download project JSON</button></Menu>
      <Menu name="Edit"><button disabled={blocked || !store.history.past.length} onClick={store.undo}>Undo · Ctrl Z</button><button disabled={blocked || !store.history.future.length} onClick={store.redo}>Redo · Ctrl Shift Z</button><button disabled={blocked || !selected.length} onClick={duplicate}>Duplicate · Ctrl D</button><button disabled={blocked || !selected.length} onClick={remove}>Delete selected</button><button disabled={blocked || selected.length < 2} onClick={() => group()}>Group selection</button><button disabled={blocked || primary?.kind !== "group"} onClick={() => group(true)}>Ungroup</button><button disabled={blocked || selected.length < 2} onClick={() => safely(() => { if (doc.objects.some(o => selected.includes(o.id) && locked(o))) throw new Error("Unlock objects and their parents first."); change({ ...doc, objects: doc.objects.map(o => selected.includes(o.id) ? { ...o, position: [primary!.position[0], o.position[1], o.position[2]] } : o) }); })}>Align selected local X</button></Menu>
      <Menu name="View"><button onClick={() => viewport.current?.fit()}>Frame all</button><button onClick={() => viewport.current?.focus()}>Focus selected · F</button><button onClick={() => setGrid(v => !v)}>{grid ? "Hide" : "Show"} grid</button><button onClick={() => store.setCamera({ ...doc.camera, projection: doc.camera.projection === "perspective" ? "orthographic" : "perspective" })}>{doc.camera.projection === "perspective" ? "Orthographic" : "Perspective"} projection</button></Menu>
      <Menu name="Tools">{(["select", "translate", "rotate", "scale", "measure"] as SceneTool[]).map(t => <button key={t} disabled={blocked} onClick={() => setTool(t)}>{t}</button>)}<button onClick={() => setSnap(v => !v)}>{snap ? "Disable" : "Enable"} grid snapping</button>{["Vertex / edge / face editing", "Extrude / inset / bevel", "Vertex / surface snapping"].map(t => <button key={t} disabled title="Unavailable in this release">{t} · unavailable</button>)}</Menu>
      <Menu name="Camera">{["Perspective", "Front", "Back", "Left", "Right", "Top"].map(name => <button key={name} onClick={() => viewport.current?.preset(name)}>{name}</button>)}<button onClick={() => viewport.current?.zoom(1.25)}>Zoom in</button><button onClick={() => viewport.current?.zoom(.8)}>Zoom out</button><button onClick={() => store.setCamera(makeDocument(studio).camera)}>Reset camera</button><button onClick={() => safely(() => viewport.current?.walk())}>Walkthrough · WASD / Esc</button></Menu>
      <Menu name="Render">{["performance", "balanced", "ultra"].map(quality => <button key={quality} disabled={blocked} onClick={() => safely(() => change({ ...doc, environment: { ...doc.environment, quality: quality as SceneDocument["environment"]["quality"] } }))}>{quality === "ultra" ? "Ultra raster" : quality}</button>)}<button disabled title="Unavailable in this release">Path tracing / AO postprocessing · unavailable</button></Menu>
      <Menu name="Export">{["glb", "gltf", "obj", "stl", "png", "jpeg", "json"].map(format => <button key={format} disabled={Boolean(busy) || !store.ready} onClick={() => void exportFile(format)}>{format.toUpperCase()}</button>)}</Menu>

          <button aria-label="Save project" onClick={() => void store.save()}><Save size={16} />Save project</button><span className="scene-save-state" role="status">{store.status}</span>
        </div></details></div>
      <section className="scene-library"><h2>Object library <span>meters</span></h2><input aria-label="Search object library" placeholder="Search library…" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="scene-library-items">{catalog.filter(name => name.toLowerCase().includes(search.toLowerCase())).map(name => <button key={name} disabled={blocked} draggable={!blocked} onDragStart={e => e.dataTransfer.setData("application/x-casynus-asset", name)} onClick={() => add(name)}><Box size={13} />{name}</button>)}</div>
        <div className="scene-templates"><label>Building levels <input aria-label="Building levels" type="number" min={1} max={8} value={stories} onChange={e => setStories(Math.max(1, Math.min(8, Number(e.target.value) || 1)))} /></label>{[["building", "Add building"], ["room", "Add furnished room"], ["intersection", "Add intersection"]].map(([id, label]) => <button key={id} disabled={blocked} onClick={() => template(id)}>{label}</button>)}</div>
      </section>
      <section className="scene-hierarchy"><h2><Layers3 size={14} />Scene hierarchy <span>{doc.objects.length}</span></h2>{doc.objects.map(o => {
        let depth = 0, parent = o.parentId; while (parent && depth < 32) { depth++; parent = doc.objects.find(n => n.id === parent)?.parentId ?? null; }
        return <div key={o.id} className={`scene-tree-row ${selected.includes(o.id) ? "is-selected" : ""}`}>
          <button className="scene-tree-name" style={{ paddingLeft: 8 + depth * 10 }} onClick={e => select(o.id, e.shiftKey || e.ctrlKey || e.metaKey)} onDoubleClick={() => { setSelected([o.id]); requestAnimationFrame(() => viewport.current?.focus()); }} title={o.name}>{o.kind === "group" ? <Layers3 size={12} /> : <Box size={12} />}<span>{o.name}</span></button>
          <button aria-label={`${o.visible ? "Hide" : "Show"} ${o.name}`} disabled={blocked} onClick={() => patch(o.id, { visible: !o.visible }, true)}>{o.visible ? <Eye size={12} /> : <EyeOff size={12} />}</button><button aria-label={`${o.locked ? "Unlock" : "Lock"} ${o.name}`} disabled={blocked} onClick={() => patch(o.id, { locked: !o.locked }, true)}>{o.locked ? <Lock size={12} /> : <Unlock size={12} />}</button>
        </div>;
      })}</section>
      {studio !== "infrastructure" && <Link className="scene-classic-link" href={`${routes[studio]}?workspace=classic`} onClick={e => { e.preventDefault(); void leave(`${routes[studio]}?workspace=classic`); }}>{studio === "interior" ? "Open 2D drafting tools" : "Open previous modeling tools"}</Link>}
    </StudioPanel>}

    <section className="scene-view" aria-label={`${names[studio]} 3D viewport`}>
      {!store.ready && <div className="scene-opening">{store.failure ?? "Opening scene…"}<button onClick={() => { store.replace(makeDocument(studio)); }}>Create empty project</button></div>}
      {(!left || !right) && <div className="scene-panel-toggles">{!left && <button aria-label="Show scene sidebar" onClick={() => setLeft(true)}><PanelLeft size={18} /></button>}{!right && <button aria-label="Show inspector" onClick={() => setRight(true)}><PanelRight size={18} /></button>}</div>}
      <StudioViewportToolbar label="Scene transformation tools"
        leading={[
          { label: studio === "infrastructure" ? "Add Road segment" : studio === "interior" ? "Add furniture" : "Add geometry", icon: Plus, onClick: () => add(studio === "infrastructure" ? "Road" : studio === "interior" ? "Sofa" : "Box"), disabled: blocked },
          { label: studio === "interior" ? "Add furnished room" : "Add building", icon: Building2, onClick: () => template(studio === "interior" ? "room" : "building"), disabled: blocked },
          { label: "Add Tree", icon: TreePine, onClick: () => add("Tree"), disabled: blocked },
        ]}
        tools={([
          ["select", MousePointer2, "Select · Q"], ["translate", Route, "Move · W"], ["rotate", Rotate3D, "Rotate · E"], ["scale", Focus, "Scale · R"], ["measure", Ruler, "Measure distance"],
        ] as const).map(([id, icon, label]) => ({ label, icon, active: tool === id, disabled: blocked, onClick: () => setTool(id) }))}
        onFit={() => viewport.current?.fit()} onReset={() => store.setCamera(makeDocument(studio).camera)}
        cameraViews={["Perspective", "Orthographic", "Front", "Back", "Left", "Right", "Top"]} cameraView={cameraView}
        onCamera={view => { setCameraView(view); store.setCamera({ ...(viewport.current?.camera() ?? doc.camera), projection: view === "Orthographic" ? "orthographic" : "perspective" }); if (view !== "Orthographic") requestAnimationFrame(() => viewport.current?.preset(view)); }}
        onZoom={factor => viewport.current?.zoom(factor)} exportFormats={["glb", "gltf", "obj", "stl", "png", "jpeg", "json"]} onExport={format => void exportFile(format)}
        onCSV={() => downloadStudioCSV(doc.name, doc.objects.map(o => ({ id: o.id, name: o.name, type: o.kind, parentId: o.parentId, position: o.position, rotation: o.rotation, scale: o.scale, dimensions: o.dimensions })))}
        settingsLabel="Lighting & sun settings" onSettings={() => { setRight(true); requestAnimationFrame(() => globalThis.document.querySelector(".scene-environment")?.scrollIntoView({ block: "nearest" })); }} busy={Boolean(busy) || !store.ready} />

      {(error || store.failure) && <div className="scene-alert" role="alert"><span>{error || store.failure}</span>{store.conflict && <><button onClick={() => { if (window.confirm("Open the cloud revision and replace this browser recovery? Save a recovered copy first to retain both versions.")) window.location.href = `${routes[studio]}?project=${doc.id}&cloud=1`; }}>Open cloud copy</button><button onClick={store.saveCopy}>Save recovered copy</button></>}<button aria-label="Dismiss scene error" onClick={() => { setError(null); if (!store.conflict) store.setFailure(null); }}><X size={15} /></button></div>}
      {busy && <div className="scene-busy" role="status">{busy}</div>}
      {pending && <div className="scene-proposal" role="dialog" aria-label="Review AI scene proposal"><strong>Preview · changes are not applied</strong><ol>{pending.commands.map((c, i) => <li key={i}>{c.type} {c.template || c.name || c.id || c.kind || "lighting"}</li>)}</ol><div><button onClick={applyProposal}>Apply scene proposal</button><button onClick={() => setPending(null)}>Discard proposal</button></div></div>}
      <div className="scene-chat-mode"><label><input type="checkbox" checked={sceneAI} disabled={model === "you" || Boolean(pending)} onChange={e => setSceneAI(e.target.checked)} />AI scene commands · preview first</label>{model === "you" && <small>You: research chat</small>}</div>
      <StudioAIChat studio={studio === "architecture" ? "modeling" : studio === "interior" ? "floor-plan" : "infrastructure"} open={dock.open} onOpenChange={dock.setOpen} prompt={prompt} onPromptChange={setPrompt} onSubmit={() => {}} model={model} onModelChange={value => { setModel(value); if (value === "you") setSceneAI(false); }} models={providers} messages={messages} onMessagesChange={setMessages} onClearMessages={() => setMessages([])} onNewChat={() => { setMessages([]); setPrompt(""); }} requestAnswer={sceneAI ? requestSceneAnswer : undefined} statusLabel={sceneAI ? "Validated scene proposals · manual approval required" : `${doc.objects.length} objects · meters`} />
      <div className="scene-navigation-hint">RMB orbit · MMB pan · wheel zoom · Shift click multi-select</div>
    </section>

    {right && <StudioPanel className="scene-sidebar scene-inspector"><header><strong>Properties</strong><button aria-label="Collapse inspector" onClick={() => setRight(false)}><PanelRight size={17} /></button></header>
      <fieldset disabled={blocked || Boolean(primary && locked(primary))}>
        {primary ? <><h2>{selected.length > 1 ? `${selected.length} selected · primary object` : primary.name}</h2><label className="scene-text-field">Name<input aria-label="Object name" key={primary.id + primary.name} defaultValue={primary.name} maxLength={120} onBlur={e => { if (e.target.value.trim() && e.target.value !== primary.name) patch(primary.id, { name: e.target.value.trim() }); }} /></label>
          {(["position", "rotation", "scale", "dimensions"] as const).filter(property => property !== "dimensions" || (primary.kind !== "group" && !primary.kind.endsWith("Light"))).map(property => <section key={property}><h3>{property === "rotation" ? "Rotation · degrees" : property === "dimensions" ? "Dimensions · meters" : property}</h3><div className="scene-number-grid">{["X", "Y", "Z"].map((axis, index) => <NumberField key={axis} label={`${property} ${axis}`} value={primary[property][index] * (property === "rotation" ? 180 / Math.PI : 1)} min={property === "scale" || property === "dimensions" ? .001 : -10000} max={property === "scale" || property === "dimensions" ? 1000 : 10000} onChange={value => { const next = [...primary[property]] as Vec3; next[index] = value * (property === "rotation" ? Math.PI / 180 : 1); patch(primary.id, { [property]: next }); }} />)}</div></section>)}
          {!primary.kind.endsWith("Light") && <section><h3>Physical material</h3><select aria-label="Material preset" defaultValue="" key={primary.id} onChange={e => { if (MATERIALS[e.target.value]) patch(primary.id, { material: { ...MATERIALS[e.target.value] } }); }}><option value="">Choose preset</option>{Object.keys(MATERIALS).map(m => <option key={m}>{m}</option>)}</select><label className="scene-color">Base color <input type="color" aria-label="Base color" value={primary.material.color} onChange={e => patch(primary.id, { material: { ...primary.material, color: e.target.value } })} /></label>{(["roughness", "metalness", "opacity", "transmission"] as const).map(key => <NumberField key={key} label={key} value={primary.material[key]} min={0} max={1} onChange={value => patch(primary.id, { material: { ...primary.material, [key]: value } })} />)}
            <select aria-label="Texture map slot" value={textureSlot} onChange={e => setTextureSlot(e.target.value)}>{["map", "normalMap", "roughnessMap", "metalnessMap", "aoMap"].map(slot => <option key={slot}>{slot}</option>)}</select><button onClick={() => texture.current?.click()}>Upload texture</button><NumberField label="UV repeat" min={.01} max={1000} value={primary.material.uvScale?.[0] ?? 1} onChange={value => patch(primary.id, { material: { ...primary.material, uvScale: [value, value] } })} /></section>}
          {primary.kind.endsWith("Light") && <label className="scene-color">Light color <input type="color" aria-label="Light color" value={primary.material.color} onChange={e => patch(primary.id, { material: { ...primary.material, color: e.target.value } })} /></label>}
          {primary.kind.endsWith("Light") && <NumberField label="Light intensity · candela" value={primary.intensity ?? 50} min={0} max={10000} onChange={intensity => patch(primary.id, { intensity })} />}
        </> : <p className="scene-muted">Select an object in the viewport or hierarchy to edit it.</p>}
      </fieldset>
      <section className="scene-environment"><h2>Lighting & environment</h2><select aria-label="Rendering quality" value={doc.environment.quality} disabled={blocked} onChange={e => safely(() => change({ ...doc, environment: { ...doc.environment, quality: e.target.value as SceneDocument["environment"]["quality"] } }))}><option value="performance">Performance</option><option value="balanced">Balanced</option><option value="ultra">Ultra raster</option></select>{(["exposure", "sunIntensity", "sunAzimuth", "sunElevation"] as const).map(key => <NumberField key={key} label={key} value={doc.environment[key]} min={key === "exposure" ? .1 : key === "sunAzimuth" ? -360 : key === "sunElevation" ? -5 : 0} max={key === "exposure" ? 4 : key === "sunIntensity" ? 10 : key === "sunElevation" ? 90 : 360} onChange={value => safely(() => change({ ...doc, environment: { ...doc.environment, [key]: value } }))} />)}<label><input type="checkbox" checked={doc.environment.shadows} disabled={blocked} onChange={e => safely(() => change({ ...doc, environment: { ...doc.environment, shadows: e.target.checked } }))} />Sun shadows</label><p className="scene-muted">Studio image-based reflections · PBR · ACES tone mapping</p></section>
      <p className="scene-format-note">GLB/glTF preserve compatible materials and hierarchy. OBJ/STL export geometry; use project JSON for editor state.</p>
    </StudioPanel>}
    <input ref={file} type="file" className="scene-file-input" aria-label="Import scene file" accept=".glb,.gltf,.obj,.stl,.json" onChange={e => { if (e.target.files?.[0]) void importFile(e.target.files[0]); e.target.value = ""; }} />
    <input ref={texture} type="file" className="scene-file-input" aria-label="Upload material texture" accept="image/png,image/jpeg,image/webp" onChange={e => { const image = e.target.files?.[0]; e.target.value = ""; if (!image || !primary) return; if (image.size > 1_500_000) { setError("Textures are limited to 1.5 MB."); return; } const reader = new FileReader(); reader.onload = () => { if (docRef.current.id !== doc.id) return; const target = docRef.current.objects.find(o => o.id === primary.id); if (target) patch(target.id, { material: { ...target.material, [textureSlot]: String(reader.result) } }); }; reader.onerror = () => setError("Texture could not be read."); reader.readAsDataURL(image); }} />
    {openProjects && <div className="scene-dialog-shade"><section className="scene-project-dialog" role="dialog" aria-modal="true" aria-label="Open workspace project"><header><h2>Workspace projects</h2><button aria-label="Close project dialog" onClick={() => setOpenProjects(null)}><X size={18} /></button></header>{openProjects.length ? openProjects.map(project => <button key={project.id} onClick={() => { void store.recover().then(() => { setOpenProjects(null); router.push(`${routes[studio]}?project=${project.id}`); }).catch(() => setError("Recovery failed. Save or download before opening another project.")); }}>{project.name}</button>) : <p>No saved 3D projects in this workspace.</p>}</section></div>}
  </main>;
}
