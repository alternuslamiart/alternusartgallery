"use client";

import { ChevronDown, Link2, LoaderCircle, Send, X } from "lucide-react";
import { modelingTools } from "./data";
import { IconButton } from "./ui";
import type { StudioAsset, StudioTool, Transform } from "./types";
import { useRef } from "react";

type Props = {
  selectedAsset?: StudioAsset;
  activeTool: StudioTool;
  prompt: string;
  loading: boolean;
  progress: number;
  error: string | null;
  transform: Transform;
  onToolChange: (tool: StudioTool) => void;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  onTransformChange: (transform: Transform) => void;
  onClearError: () => void;
  onAssetDrop: (id: string) => void;
};

export function Viewport(props: Props) {
  const drag = useRef<{ x: number; y: number; transform: Transform } | null>(null);
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

  return (
    <section
      className="relative min-h-0 overflow-hidden bg-[#292929]"
      onPointerMove={moveDrag}
      onPointerUp={() => { drag.current = null; }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const assetId = event.dataTransfer.getData("text/asset-id");
        if (assetId) props.onAssetDrop(assetId);
      }}
    >
      <div className="crystal-grid absolute inset-0" />
      <div className="absolute left-0 right-0 top-1/2 h-px bg-[#d95757]/75" />
      <div className="absolute bottom-0 left-1/2 top-0 w-px bg-[#1687f7]/75" />

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
          className="crystal-object absolute left-1/2 top-[43%] h-[150px] w-[190px] cursor-grab active:cursor-grabbing"
          style={{ transform: `translate(calc(-50% + ${props.transform.x}px), calc(-50% + ${props.transform.y}px)) rotate(${props.transform.rotation}deg) scale(${props.transform.scale})` }}
        >
          <span className={`crystal-model-shape block h-full w-full bg-gradient-to-br ${props.selectedAsset.thumbnail}`} />
          <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/45 px-3 py-1 text-[11px] text-zinc-200">{props.selectedAsset.name}</span>
        </button>
      )}

      <div className="absolute bottom-[80px] left-1/2 w-[488px] max-w-[calc(100%-32px)] -translate-x-1/2 rounded-[14px] border border-[#252525] bg-[#202020] p-2 shadow-[0_10px_30px_rgba(0,0,0,.35)]">
        <textarea aria-label="AI model prompt" value={props.prompt} onChange={(event) => props.onPromptChange(event.target.value)} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") props.onGenerate(); }} placeholder="Create script or 3D Model" className="h-[55px] w-full resize-none bg-transparent px-2 py-2 text-[12px] text-zinc-100 outline-none placeholder:text-zinc-400" />
        {props.error && <div className="mb-2 flex items-center justify-between rounded-md bg-red-950/70 px-3 py-1.5 text-[11px] text-red-200"><span>{props.error}</span><button aria-label="Dismiss error" onClick={props.onClearError}><X size={14} /></button></div>}
        {props.loading && <div className="mb-2 h-1 overflow-hidden rounded-full bg-zinc-700"><div className="h-full bg-[#1687f7] transition-all" style={{ width: `${props.progress}%` }} /></div>}
        <div className="flex items-center gap-2">
          <IconButton icon={Link2} label="Attach reference" className="bg-[#303030]" />
          <button type="button" className="flex h-9 items-center gap-2 rounded-[9px] bg-[#303030] px-4 text-[12px] text-zinc-100">GPT-High <ChevronDown size={15} /></button>
          <button type="button" disabled={props.loading || !props.prompt.trim()} onClick={props.onGenerate} aria-label="Generate 3D model" className="ml-auto grid h-9 w-9 place-items-center rounded-[9px] bg-[#1687f7] text-white transition hover:bg-[#2d9bff] disabled:cursor-not-allowed disabled:opacity-50">{props.loading ? <LoaderCircle className="animate-spin" size={18} /> : <Send size={18} fill="currentColor" />}</button>
        </div>
      </div>

      <div className="absolute bottom-[18px] left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-[14px] border border-[#292929] bg-[#202020] p-1.5 shadow-lg">
        {modelingTools.map((tool) => <IconButton key={tool.id} icon={tool.icon} label={tool.label} active={props.activeTool === tool.id} onClick={() => props.onToolChange(tool.id)} />)}
      </div>
    </section>
  );
}
