"use client";

import { Check, ChevronDown, Link2, LoaderCircle, Paperclip, Send, X } from "lucide-react";
import { modelingTools } from "./data";
import { IconButton } from "./ui";
import type { StudioAsset, StudioTool, Transform } from "./types";
import { useRef, useState } from "react";

type Props = {
  selectedAsset?: StudioAsset;
  activeTool: StudioTool;
  prompt: string;
  loading: boolean;
  progress: number;
  error: string | null;
  transform: Transform;
  color: string;
  onToolChange: (tool: StudioTool) => void;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  onTransformChange: (transform: Transform) => void;
  onClearError: () => void;
  onAssetDrop: (id: string) => void;
  onColorChange: (value: string) => void;
};

export function Viewport(props: Props) {
  const drag = useRef<{ x: number; y: number; transform: Transform } | null>(null);
  const attachmentInput = useRef<HTMLInputElement | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("GPT-High");
  const [objectSelected, setObjectSelected] = useState(true);
  const [shape, setShape] = useState<"organic" | "cube" | "sphere">("organic");
  const [viewportMode, setViewportMode] = useState<"solid" | "wireframe" | "xray">("solid");
  const [openPanel, setOpenPanel] = useState<"brush" | "tools" | null>(null);
  const [notice, setNotice] = useState("Orbit: drag the model to inspect it");
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1, pitch: 0 });
  const cameraDrag = useRef<{ x: number; y: number; camera: typeof camera } | null>(null);
  const beginDrag = (event: React.PointerEvent) => {
    drag.current = { x: event.clientX, y: event.clientY, transform: props.transform };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event: React.PointerEvent) => {
    if (!drag.current) return;
    const deltaX = event.clientX - drag.current.x;
    const deltaY = event.clientY - drag.current.y;
    if (props.activeTool === "move") props.onTransformChange({ ...props.transform, x: drag.current.transform.x + deltaX, y: drag.current.transform.y + deltaY });
    if (props.activeTool === "rotate" || props.activeTool === "orbit") props.onTransformChange({ ...props.transform, rotation: drag.current.transform.rotation + deltaX * 0.5 });
    if (props.activeTool === "scale") props.onTransformChange({ ...props.transform, scale: Math.min(1.8, Math.max(0.45, drag.current.transform.scale + deltaX / 180)) });
  };

  const selectTool = (tool: StudioTool) => {
    props.onToolChange(tool);
    setOpenPanel(null);
    if (tool === "focus") {
      props.onTransformChange({ x: 0, y: 0, rotation: -8, scale: 1 });
      setNotice("Camera focused on the selected model");
    } else if (tool === "select") {
      setObjectSelected(true);
      setNotice("Selection mode: click the model to toggle selection");
    } else if (tool === "brush") {
      setOpenPanel("brush");
      setNotice("Material brush palette opened");
    } else if (tool === "tools") {
      setOpenPanel("tools");
      setNotice("Precision transform controls opened");
    } else if (tool === "model") {
      const nextShape = shape === "organic" ? "cube" : shape === "cube" ? "sphere" : "organic";
      setShape(nextShape);
      setNotice(`Model primitive: ${nextShape}`);
    } else if (tool === "viewport") {
      const nextMode = viewportMode === "solid" ? "wireframe" : viewportMode === "wireframe" ? "xray" : "solid";
      setViewportMode(nextMode);
      setNotice(`Viewport mode: ${nextMode}`);
    } else {
      setNotice(`${tool.charAt(0).toUpperCase() + tool.slice(1)} tool active`);
    }
  };

  return (
    <section
      className="relative min-h-0 overflow-hidden bg-[#292929]"
      onPointerDown={(event) => { if (event.button === 1 || event.button === 2) { event.preventDefault(); cameraDrag.current = { x: event.clientX, y: event.clientY, camera }; event.currentTarget.setPointerCapture(event.pointerId); } }}
      onPointerMove={(event) => { moveDrag(event); if (cameraDrag.current) { const dx = event.clientX - cameraDrag.current.x; const dy = event.clientY - cameraDrag.current.y; setCamera({ ...cameraDrag.current.camera, x: cameraDrag.current.camera.x + dx, y: cameraDrag.current.camera.y + dy, pitch: Math.max(-28, Math.min(28, cameraDrag.current.camera.pitch + dy * .08)) }); } }}
      onPointerUp={() => { drag.current = null; cameraDrag.current = null; }}
      onContextMenu={(event) => event.preventDefault()}
      onWheel={(event) => { event.preventDefault(); setCamera((value) => ({ ...value, zoom: Math.max(.45, Math.min(2.5, value.zoom - event.deltaY * .001)) })); }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const assetId = event.dataTransfer.getData("text/asset-id");
        if (assetId) props.onAssetDrop(assetId);
      }}
    >
      <div className="crystal-grid absolute inset-[-35%] origin-center transition-transform duration-75" style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom}) rotateX(${camera.pitch}deg)` }} />
      <div className="absolute left-0 right-0 top-1/2 h-px bg-[#d95757]/75" style={{ transform: `translateY(${camera.y}px)` }} />
      <div className="absolute bottom-0 left-1/2 top-0 w-px bg-[#1687f7]/75" style={{ transform: `translateX(${camera.x}px)` }} />

      <div className="absolute right-8 top-16 h-20 w-20" aria-label="XYZ orientation gizmo">
        <span className="absolute left-[36px] top-[29px] h-3 w-3 rounded-full bg-[#1687f7]" />
        <span className="absolute left-[39px] top-0 h-6 w-2 rounded-full bg-[#ff6b61]" />
        <span className="absolute left-[39px] top-[45px] h-6 w-2 rounded-full bg-[#ff6b61]" />
        <span className="absolute left-2 top-[31px] h-2 w-6 rounded-full bg-[#83f462]" />
        <span className="absolute right-0 top-[31px] h-2 w-6 rounded-full bg-[#83f462]" />
      </div>

      {props.selectedAsset && (
        <button
          type="button"
          aria-label={`Manipulate ${props.selectedAsset.name}`}
          onPointerDown={beginDrag}
          onClick={() => { if (props.activeTool === "select") setObjectSelected((value) => !value); }}
          className={`crystal-object absolute left-1/2 top-[43%] h-[150px] w-[190px] cursor-grab active:cursor-grabbing ${objectSelected ? "crystal-object-selected" : ""}`}
          style={{ transform: `translate(calc(-50% + ${props.transform.x}px), calc(-50% + ${props.transform.y}px)) rotate(${props.transform.rotation}deg) scale(${props.transform.scale})` }}
        >
          <span className={`crystal-model-shape crystal-shape-${shape} crystal-view-${viewportMode} block h-full w-full`} style={{ backgroundColor: props.color }} />
          <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/45 px-3 py-1 text-[11px] text-zinc-200">{props.selectedAsset.name}</span>
        </button>
      )}

      <div className="absolute bottom-[80px] left-1/2 w-[488px] max-w-[calc(100%_-_32px)] -translate-x-1/2 rounded-[14px] border border-[#252525] bg-[#202020] px-2 pb-2 pt-1 shadow-[0_10px_30px_rgba(0,0,0,.35)]">
        <textarea aria-label="AI model prompt" value={props.prompt} onChange={(event) => props.onPromptChange(event.target.value)} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") props.onGenerate(); }} placeholder="Create script or 3D Model" className="h-[68px] w-full resize-none bg-transparent px-2 py-3 text-[12px] text-zinc-100 outline-none placeholder:text-zinc-400" />
        {props.error && <div className="mb-2 flex items-center justify-between rounded-md bg-red-950/70 px-3 py-1.5 text-[11px] text-red-200"><span>{props.error}</span><button aria-label="Dismiss error" onClick={props.onClearError}><X size={14} /></button></div>}
        {props.loading && <div className="mb-2 h-1 overflow-hidden rounded-full bg-zinc-700"><div className="h-full bg-[#1687f7] transition-all" style={{ width: `${props.progress}%` }} /></div>}
        <div className="flex h-10 items-center gap-2">
          <input ref={attachmentInput} aria-label="Attach prompt reference" type="file" accept="image/*,.obj,.stl,.step,.glb,.gltf" className="sr-only" onChange={(event) => setAttachmentName(event.target.files?.[0]?.name ?? null)} />
          <IconButton icon={attachmentName ? Paperclip : Link2} label={attachmentName ? `Attached: ${attachmentName}` : "Attach reference"} onClick={() => attachmentInput.current?.click()} className="bg-[#303030]" />
          <label className="relative flex h-9 items-center rounded-[9px] bg-[#303030] text-[12px] text-zinc-100">
            <select aria-label="AI model" value={selectedModel} onChange={(event) => { setSelectedModel(event.target.value); setNotice(`${event.target.value} selected`); }} className="h-full appearance-none bg-transparent pl-4 pr-9 outline-none"><option className="bg-[#303030]">GPT-High</option><option className="bg-[#303030]">GPT-Fast</option><option className="bg-[#303030]">CAD-Specialist</option></select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 text-zinc-300" />
          </label>
          {attachmentName && <button type="button" aria-label="Remove attachment" onClick={() => { setAttachmentName(null); if (attachmentInput.current) attachmentInput.current.value = ""; }} className="max-w-32 truncate rounded-full bg-[#303030] px-3 py-1.5 text-[10px] text-zinc-300">{attachmentName}</button>}
          <button type="button" disabled={props.loading || !props.prompt.trim()} onClick={props.onGenerate} aria-label="Generate 3D model" className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-[#1687f7] text-white transition hover:bg-[#2d9bff] disabled:cursor-not-allowed disabled:opacity-50">{props.loading ? <LoaderCircle className="animate-spin" size={18} /> : <Send size={18} fill="currentColor" />}</button>
        </div>
      </div>

      {openPanel === "brush" && <div className="absolute bottom-[204px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-[#333] bg-[#202020] p-2 shadow-xl">{["#b47272", "#1687f7", "#d5d5d5", "#e7a83e", "#54b88b"].map((swatch) => <button key={swatch} aria-label={`Apply ${swatch}`} onClick={() => { props.onColorChange(swatch); setNotice(`Material color changed to ${swatch}`); }} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10" style={{ backgroundColor: swatch }}>{props.color === swatch && <Check size={15} />}</button>)}</div>}
      {openPanel === "tools" && <div className="absolute bottom-[204px] left-1/2 z-20 grid w-[360px] -translate-x-1/2 grid-cols-4 gap-2 rounded-xl border border-[#333] bg-[#202020] p-2 shadow-xl">{(["x", "y", "rotation", "scale"] as const).map((field) => <label key={field} className="rounded-lg bg-[#303030] px-2 py-1 text-[9px] uppercase text-zinc-400">{field}<input aria-label={field} type="number" step={field === "scale" ? .1 : 1} value={props.transform[field]} onChange={(event) => props.onTransformChange({ ...props.transform, [field]: Number(event.target.value) })} className="mt-0.5 w-full bg-transparent text-[12px] normal-case text-white outline-none" /></label>)}</div>}

      <div className="absolute bottom-[18px] left-1/2 flex h-[56px] w-[488px] max-w-[calc(100%_-_32px)] -translate-x-1/2 items-center justify-between rounded-[14px] border border-[#292929] bg-[#202020] px-2 shadow-[0_8px_24px_rgba(0,0,0,.3)]">
        {modelingTools.map((tool) => <IconButton key={tool.id} icon={tool.icon} label={tool.label} active={props.activeTool === tool.id} onClick={() => selectTool(tool.id)} />)}
      </div>
      <div aria-live="polite" className="sr-only">{notice}</div>
    </section>
  );
}
