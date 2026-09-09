"use client";

import { Box, Download, FileBox, FileText, Grid2X2, Image, PanelRightClose, Plus, Trash2 } from "lucide-react";
import type { FloorPlanObject, RenderSettings, StudioAsset } from "./types";
import { SectionTitle, SelectField } from "./ui";
import { useState } from "react";

type Props = {
  resolution: string;
  frameRate: string;
  color: string;
  opacity: number;
  renderSettings: RenderSettings;
  assets: StudioAsset[];
  selectedAssetId: string | null;
  exporting: string | null;
  onResolutionChange: (value: string) => void;
  onFrameRateChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onOpacityChange: (value: number) => void;
  onRenderChange: (value: RenderSettings) => void;
  onSelectAsset: (id: string) => void;
  onDeleteAsset: (id: string) => void;
  onExport: (format: string) => void;
  onCollapse: () => void;
  floorPlanMode?: boolean;
  selectedFloorPlanObject?: FloorPlanObject;
  onUpdateFloorPlanObject?: (object: FloorPlanObject) => void;
  onDeleteFloorPlanObject?: (id: string) => void;
};

const exportOptions = [
  { label: "glTF 2.0", icon: FileBox }, { label: "JPEG & PNG", icon: Image }, { label: "STEP AP214", icon: FileBox }, { label: "OBJ Mesh", icon: FileBox }, { label: "Spec Sheet (PDF)", icon: FileText }, { label: "Render Log", icon: FileText },
];

export function RightPanel(props: Props) {
  const [swatches,setSwatches]=useState(["#4A90D9","#E8793E","#84CC6A"]);
  const [swatchGrid,setSwatchGrid]=useState(true);
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [frameRateOpen, setFrameRateOpen] = useState(false);
  const canvasOptions = ["1920x1080", "2560x1440", "3840x2160", "7680x4320"];
  const frameRateOptions = ["24 fps", "30 fps", "60 fps", "120 fps"];
  const selected = props.selectedFloorPlanObject;
  const updateSelected = (patch: Partial<FloorPlanObject>) => {
    if (selected && props.onUpdateFloorPlanObject) props.onUpdateFloorPlanObject({ ...selected, ...patch } as FloorPlanObject);
  };
  return (
    <aside className="crystal-right-panel min-h-0 overflow-y-auto border-l border-[#303030] bg-[#0F0F0F] px-5 pb-5 pt-4 scrollbar-hide">
      {props.floorPlanMode && <div className="mb-7">
        <SectionTitle action={selected ? <button aria-label="Delete selected floor-plan object" onClick={() => props.onDeleteFloorPlanObject?.(selected.id)} className="text-zinc-400 hover:text-red-300"><Trash2 size={15}/></button> : undefined}>Floor plan properties</SectionTitle>
        {selected ? <div className="space-y-2 text-[11px]">
          <div className="rounded-[12px] bg-[#292929] px-3 py-2 text-zinc-300"><span className="text-zinc-500">Type</span><strong className="ml-2 capitalize text-white">{selected.type}</strong></div>
          {selected.type === "wall" && <><label className="flex h-8 items-center rounded-full bg-[#2b2b2b] px-3"><span className="flex-1">Thickness</span><input type="number" min=".05" step=".01" value={selected.thickness} onChange={e => updateSelected({ thickness: Math.max(.05, Number(e.target.value)) })} className="w-20 rounded bg-[#3b3b3b] px-2 py-1 text-right outline-none" /><span className="ml-1">m</span></label><div className="grid grid-cols-2 gap-2">{(["start","end"] as const).map(point => <div key={point} className="rounded-[10px] bg-[#292929] p-2"><span className="block mb-1 capitalize text-zinc-500">{point}</span><div className="flex gap-1"><input aria-label={`${point} X`} type="number" step=".1" value={selected[point].x} onChange={e => updateSelected({ [point]: { ...selected[point], x: Number(e.target.value) } })} className="w-full rounded bg-[#3b3b3b] px-1 py-1 text-center outline-none" /><input aria-label={`${point} Y`} type="number" step=".1" value={selected[point].y} onChange={e => updateSelected({ [point]: { ...selected[point], y: Number(e.target.value) } })} className="w-full rounded bg-[#3b3b3b] px-1 py-1 text-center outline-none" /></div></div>)}</div></>}
          {selected.type === "room" && <><label className="flex h-8 items-center rounded-full bg-[#2b2b2b] px-3"><span className="flex-1">Label</span><input value={selected.label} onChange={e => updateSelected({ label: e.target.value })} className="w-28 rounded bg-[#3b3b3b] px-2 py-1 text-right outline-none" /></label><div className="grid grid-cols-2 gap-2">{(["width","height"] as const).map(key => <label key={key} className="flex h-8 items-center rounded-[10px] bg-[#292929] px-2"><span className="flex-1 capitalize">{key}</span><input type="number" min=".2" step=".1" value={selected[key]} onChange={e => updateSelected({ [key]: Math.max(.2, Number(e.target.value)) })} className="w-14 rounded bg-[#3b3b3b] px-1 py-1 text-right outline-none" /></label>)}</div></>}
          {selected.type === "text" && <label className="flex h-8 items-center rounded-full bg-[#2b2b2b] px-3"><span className="flex-1">Text</span><input value={selected.text} onChange={e => updateSelected({ text: e.target.value })} className="w-28 rounded bg-[#3b3b3b] px-2 py-1 text-right outline-none" /></label>}
          {(selected.type === "door" || selected.type === "window" || selected.type === "furniture") && <div className="grid grid-cols-2 gap-2">{(["width","height"] as const).map(key => <label key={key} className="flex h-8 items-center rounded-[10px] bg-[#292929] px-2"><span className="flex-1 capitalize">{key}</span><input type="number" min=".05" step=".1" value={selected[key]} onChange={e => updateSelected({ [key]: Math.max(.05, Number(e.target.value)) })} className="w-14 rounded bg-[#3b3b3b] px-1 py-1 text-right outline-none" /></label>)}</div>}
          {selected.type === "dimension" && <div className="rounded-[10px] bg-[#292929] px-2 py-2 text-zinc-400">Length: <b className="text-white">{Math.hypot(selected.end.x - selected.start.x, selected.end.y - selected.start.y).toFixed(2)} m</b></div>}
        </div> : <p className="rounded-[12px] bg-[#292929] px-3 py-4 text-[11px] text-zinc-500">Select a wall, room, opening, dimension, or note to edit it.</p>}
      </div>}
      <SectionTitle action={<button aria-label="Collapse right panel" onClick={props.onCollapse} className="grid h-8 w-8 place-items-center rounded-[8px] text-zinc-400 transition hover:bg-[#292929] hover:text-white"><PanelRightClose size={16}/></button>}>Output</SectionTitle>
      <div className="space-y-2">
        <div className="relative">
          <button type="button" aria-expanded={canvasOpen} onClick={() => setCanvasOpen((value) => !value)} className="flex h-8 w-full items-center rounded-full bg-[#2b2b2b] px-4 text-left text-[12px] text-zinc-100 transition hover:bg-[#343434]">
            <span className="flex-1">Canvas</span>
            <span className="mr-3">{props.resolution}</span>
            <span className={`text-zinc-400 transition-transform ${canvasOpen ? "rotate-180" : ""}`}>⌄</span>
          </button>
          {canvasOpen && (
            <div className="absolute inset-x-0 top-[36px] z-20 rounded-[14px] bg-[#292929] p-1 shadow-[0_14px_35px_rgba(0,0,0,.35)]">
              {canvasOptions.map((option) => (
                <button key={option} type="button" onClick={() => { props.onResolutionChange(option); setCanvasOpen(false); }} className={`flex h-8 w-full items-center justify-center rounded-[8px] text-[12px] transition ${props.resolution === option ? "bg-[#3a3a3a] text-white" : "text-zinc-100 hover:bg-[#343434]"}`}>
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <button type="button" aria-expanded={frameRateOpen} onClick={() => setFrameRateOpen((value) => !value)} className="flex h-8 w-full items-center rounded-full bg-[#2b2b2b] px-4 text-left text-[12px] text-zinc-100 transition hover:bg-[#343434]">
            <span className="flex-1">Frame rate</span>
            <span className="mr-3">{props.frameRate}</span>
            <span className={`text-zinc-400 transition-transform ${frameRateOpen ? "rotate-180" : ""}`}>⌄</span>
          </button>
          {frameRateOpen && (
            <div className="absolute inset-x-0 top-[36px] z-20 rounded-[14px] bg-[#292929] p-1 shadow-[0_14px_35px_rgba(0,0,0,.35)]">
              {frameRateOptions.map((option) => (
                <button key={option} type="button" onClick={() => { props.onFrameRateChange(option); setFrameRateOpen(false); }} className={`flex h-8 w-full items-center justify-center rounded-[8px] text-[12px] transition ${props.frameRate === option ? "bg-[#3a3a3a] text-white" : "text-zinc-100 hover:bg-[#343434]"}`}>
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-7">
        <SectionTitle action={<div className="flex gap-2 text-zinc-300"><button title="Toggle swatch layout" onClick={()=>setSwatchGrid(v=>!v)}><Grid2X2 size={17}/></button><label title="Add swatch" className="cursor-pointer"><Plus size={17}/><input type="color" className="sr-only" onChange={e=>{setSwatches(x=>[...x,e.target.value]);props.onColorChange(e.target.value)}}/></label></div>}>Color Swatches</SectionTitle>
        <div className={`mb-2 ${swatchGrid?"flex":"grid grid-cols-1"} gap-1`}>{swatches.map(x=><button aria-label={`Apply swatch ${x}`} key={x} onClick={()=>props.onColorChange(x)} className="h-5 min-w-5 rounded-md border border-white/10" style={{backgroundColor:x}}/>)}</div>
        <div className="flex gap-2">
          <label className="relative flex h-8 flex-1 items-center gap-2 rounded-full bg-[#2b2b2b] px-2 text-[12px] text-zinc-100"><input aria-label="Model color" type="color" value={props.color} onChange={(event) => props.onColorChange(event.target.value)} className="h-5 w-5 cursor-pointer rounded-full border-0 bg-transparent p-0" /><span>{props.color.toUpperCase()}</span></label>
          <label className="flex h-8 w-[132px] items-center rounded-full bg-[#2b2b2b] px-3 text-[12px] text-zinc-100"><input aria-label="Color opacity" type="range" min="0" max="100" value={props.opacity} onChange={(event) => props.onOpacityChange(Number(event.target.value))} className="mr-2 w-14 accent-[#1687f7]" /><input aria-label="Opacity value" type="number" min="0" max="100" value={props.opacity} onChange={e=>props.onOpacityChange(Math.max(0,Math.min(100,Number(e.target.value))))} className="w-9 bg-transparent text-right outline-none"/>%</label>
        </div>
      </div>

      <div className="mt-8">
        <SectionTitle>Render Engine</SectionTitle>
        <div className="space-y-2 text-[12px]">
          <label className="flex h-8 items-center rounded-full bg-[#2b2b2b] px-4 text-zinc-100"><span className="flex-1">Resolution</span><input aria-label="Render resolution" value={props.renderSettings.resolution} onChange={(event) => props.onRenderChange({ ...props.renderSettings, resolution: event.target.value })} className="w-[124px] rounded-full bg-[#3b3b3b] px-3 py-1 text-right outline-none" /></label>
          <label className="flex h-8 items-center rounded-full bg-[#2b2b2b] px-4 text-zinc-100"><span className="flex-1">Sample Count</span><input aria-label="Sample count" type="number" min="1" max="4096" value={props.renderSettings.sampleCount} onChange={(event) => props.onRenderChange({ ...props.renderSettings, sampleCount: Number(event.target.value) })} className="w-[124px] rounded-full bg-[#3b3b3b] px-3 py-1 text-right outline-none" /></label>
          <label className="flex h-8 items-center rounded-full bg-[#2b2b2b] px-4 text-zinc-100"><span className="flex-1">Exposure</span><input aria-label="Exposure" type="number" step="0.5" value={props.renderSettings.exposure} onChange={(event) => props.onRenderChange({ ...props.renderSettings, exposure: Number(event.target.value) })} className="w-[124px] rounded-full bg-[#3b3b3b] px-3 py-1 text-right outline-none" /><span className="ml-1">EV</span></label>
        </div>
      </div>

      <div className="mt-6">
        <SectionTitle>Export Options</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {exportOptions.map(({ label, icon: Icon }, index) => <button disabled={props.exporting!==null} key={label} onClick={() => props.onExport(label)} className={`flex h-8 items-center gap-2 rounded-full bg-[#2b2b2b] px-4 text-[11px] text-zinc-200 hover:bg-[#343434] disabled:opacity-50 ${index > 3 ? "col-span-2" : ""}`}><Icon size={16} />{props.exporting===label?"Preparing...":label}</button>)}
        </div>
      </div>

      <div className="mt-4">
        <SectionTitle><span className="flex items-center gap-2"><Box size={21} /> Asset Library</span></SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {props.assets.slice(0, 6).map((asset) => (
            <article key={asset.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/asset-id", asset.id)} onClick={() => props.onSelectAsset(asset.id)} className={`group relative h-[122px] cursor-pointer overflow-hidden rounded-[10px] border bg-[#292929] transition ${props.selectedAssetId === asset.id ? "border-[#1687f7]" : "border-transparent hover:border-[#444]"}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${asset.thumbnail} opacity-70`} />
              <div className="crystal-mini-model absolute left-1/2 top-[43%] h-12 w-16 -translate-x-1/2 -translate-y-1/2 bg-zinc-200/70 shadow-xl" />
              <div className="absolute inset-x-0 bottom-0 flex items-center bg-black/55 px-2 py-1.5 text-[10px] text-white"><span className="truncate">{asset.name}</span><button aria-label={`Download ${asset.name}`} onClick={(event) => { event.stopPropagation(); props.onExport("STL File"); }} className="ml-auto opacity-0 group-hover:opacity-100"><Download size={13} /></button><button aria-label={`Delete ${asset.name}`} onClick={(event) => { event.stopPropagation(); props.onDeleteAsset(asset.id); }} className="ml-2 opacity-0 group-hover:opacity-100"><Trash2 size={13} /></button></div>
            </article>
          ))}
        </div>
      </div>
      <div className="mt-5"><SectionTitle>Environment</SectionTitle><button className="flex h-12 w-full items-center justify-between rounded-[12px] bg-[#292929] px-4 text-[11px]"><span>HDRI</span><span className="rounded-lg bg-[#3b3b3b] px-4 py-2">Studio Soft</span></button></div>
    </aside>
  );
}
