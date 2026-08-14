"use client";

import { Box, Download, FileBox, FileText, Grid2X2, Play, Plus, Trash2 } from "lucide-react";
import type { RenderSettings, StudioAsset } from "./types";
import { SectionTitle, SelectField } from "./ui";

type Props = {
  resolution: string;
  frameRate: string;
  color: string;
  opacity: number;
  renderSettings: RenderSettings;
  assets: StudioAsset[];
  selectedAssetId: string | null;
  onResolutionChange: (value: string) => void;
  onFrameRateChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onOpacityChange: (value: number) => void;
  onRenderChange: (value: RenderSettings) => void;
  onSelectAsset: (id: string) => void;
  onDeleteAsset: (id: string) => void;
  onExport: (format: string) => void;
  onCollapse: () => void;
};

const exportOptions = [
  { label: "G-Code", icon: FileText }, { label: "STEP File", icon: FileBox }, { label: "STL File", icon: FileBox }, { label: "Parameter Sheet (PDF)", icon: FileText }, { label: "Simulation Log", icon: FileText },
];

export function RightPanel(props: Props) {
  return (
    <aside className="crystal-right-panel min-h-0 overflow-y-auto border-l border-[#303030] bg-[#202020] px-5 pb-5 pt-4 scrollbar-hide">
      <SectionTitle action={<button aria-label="Collapse right panel" onClick={props.onCollapse} className="grid h-9 w-9 place-items-center rounded-[9px] bg-[#1687f7] text-white"><Play size={17} fill="currentColor" /></button>}>Format</SectionTitle>
      <div className="space-y-2">
        <SelectField label="Resolution" value={props.resolution} onChange={(event) => props.onResolutionChange(event.target.value)}><option>1920x1080</option><option>2560x1440</option><option>3840x2160</option></SelectField>
        <SelectField label="Format rate" value={props.frameRate} onChange={(event) => props.onFrameRateChange(event.target.value)}><option>24 fps</option><option>30 fps</option><option>60 fps</option></SelectField>
      </div>

      <div className="mt-7">
        <SectionTitle action={<div className="flex gap-3 text-zinc-300"><Grid2X2 size={17} /><Plus size={17} /></div>}>Color Palette</SectionTitle>
        <div className="flex gap-2">
          <label className="relative flex h-8 flex-1 items-center gap-2 rounded-full bg-[#2b2b2b] px-2 text-[12px] text-zinc-100"><input aria-label="Model color" type="color" value={props.color} onChange={(event) => props.onColorChange(event.target.value)} className="h-5 w-5 cursor-pointer rounded-full border-0 bg-transparent p-0" /><span>{props.color.toUpperCase()}</span></label>
          <label className="flex h-8 w-[132px] items-center rounded-full bg-[#2b2b2b] px-4 text-[12px] text-zinc-100"><input aria-label="Color opacity" type="range" min="0" max="100" value={props.opacity} onChange={(event) => props.onOpacityChange(Number(event.target.value))} className="mr-2 w-14 accent-[#1687f7]" /><span>{props.opacity}%</span></label>
        </div>
      </div>

      <div className="mt-8">
        <SectionTitle>Render Settings</SectionTitle>
        <div className="space-y-2 text-[12px]">
          <label className="flex h-8 items-center rounded-full bg-[#2b2b2b] px-4 text-zinc-100"><span className="flex-1">Resolution</span><input aria-label="Render resolution" value={props.renderSettings.resolution} onChange={(event) => props.onRenderChange({ ...props.renderSettings, resolution: event.target.value })} className="w-[124px] rounded-full bg-[#3b3b3b] px-3 py-1 text-right outline-none" /></label>
          <label className="flex h-8 items-center rounded-full bg-[#2b2b2b] px-4 text-zinc-100"><span className="flex-1">Sample Count</span><input aria-label="Sample count" type="number" min="1" max="4096" value={props.renderSettings.sampleCount} onChange={(event) => props.onRenderChange({ ...props.renderSettings, sampleCount: Number(event.target.value) })} className="w-[124px] rounded-full bg-[#3b3b3b] px-3 py-1 text-right outline-none" /></label>
          <label className="flex h-8 items-center rounded-full bg-[#2b2b2b] px-4 text-zinc-100"><span className="flex-1">Exposure</span><input aria-label="Exposure" type="number" step="0.5" value={props.renderSettings.exposure} onChange={(event) => props.onRenderChange({ ...props.renderSettings, exposure: Number(event.target.value) })} className="w-[124px] rounded-full bg-[#3b3b3b] px-3 py-1 text-right outline-none" /><span className="ml-1">EV</span></label>
        </div>
      </div>

      <div className="mt-6">
        <SectionTitle>Export Options</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {exportOptions.map(({ label, icon: Icon }, index) => <button key={label} onClick={() => props.onExport(label)} className={`flex h-8 items-center gap-2 rounded-full bg-[#2b2b2b] px-4 text-[12px] text-zinc-200 hover:bg-[#343434] ${index === 0 || index > 2 ? "col-span-2" : ""}`}><Icon size={16} />{label}</button>)}
        </div>
      </div>

      <div className="mt-4">
        <SectionTitle><span className="flex items-center gap-2"><Box size={21} /> Assets</span></SectionTitle>
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
    </aside>
  );
}
