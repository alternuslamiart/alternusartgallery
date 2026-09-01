"use client";

import { Box, ChevronDown, Layers3, LogOut, PanelLeftClose, Zap } from "lucide-react";
import { useState } from "react";
import { materials } from "./data";
import type { MaterialName } from "./types";

type Props = { material: MaterialName; roughness: number; metallic: number; uploadedImage: string | null; settingsOpen: boolean; onMaterialChange: (value: MaterialName) => void; onRoughnessChange: (value: number) => void; onMetallicChange: (value: number) => void; onUpload: (file: File) => void; onRemoveImage: () => void; onToggleSettings: () => void; onCollapse: () => void };

function Toggle({ label, initial = false }: { label: string; initial?: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  return <button type="button" onClick={() => setEnabled(!enabled)} aria-pressed={enabled} className="flex h-9 w-full items-center justify-between px-3 text-[11px] text-zinc-100"><span>{label}</span><span className={`relative h-6 w-12 rounded-full transition ${enabled ? "bg-[#1687f7]" : "bg-[#454545]"}`}><i className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${enabled ? "left-7" : "left-1"}`} /></span></button>;
}

export function LeftSidebar(props: Props) {
  return <aside className="crystal-left-panel flex min-h-0 flex-col overflow-y-auto border-r border-[#3a3a3a] bg-[#202020] px-2 pb-3 pt-3 scrollbar-hide">
    <div className="flex items-center justify-between px-3 pb-3"><h1 className="text-[16px] font-semibold text-zinc-300">Scene Builder</h1><button aria-label="Collapse left panel" onClick={props.onCollapse} className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#1687f7] text-white"><PanelLeftClose size={18}/></button></div>
    <div className="flex h-12 items-center gap-3 rounded-[14px] bg-[#2c2c2c] px-2"><span className="grid h-9 w-9 place-items-center rounded-[9px] bg-[#1687f7]"><Layers3 size={20}/></span><b className="flex-1 text-[12px]">Renderer</b><ChevronDown size={16} className="text-zinc-400"/></div>

    <h2 className="px-2 pb-3 pt-6 text-[14px] font-semibold text-zinc-400">Properties</h2>
    <button className="mx-1 flex h-12 items-center justify-between rounded-[14px] bg-[#292929] px-5 text-[12px] font-semibold">Model Quality <ChevronDown size={15} className="text-zinc-400"/></button>

    <h2 className="px-2 pb-3 pt-5 text-[14px] font-semibold text-zinc-300">Material</h2>
    <label className="mx-1 flex h-12 items-center gap-3 rounded-[14px] bg-[#292929] px-2"><span className="grid h-9 w-9 place-items-center rounded-[9px] bg-[#1687f7]"><Box size={20}/></span><select aria-label="Material" value={props.material} onChange={(e)=>props.onMaterialChange(e.target.value as MaterialName)} className="h-full flex-1 appearance-none bg-transparent text-[12px] font-semibold outline-none">{materials.map(item=><option className="bg-[#292929]" key={item}>{item}</option>)}</select><ChevronDown size={15} className="mr-2 text-zinc-400"/></label>
    <label className="mx-1 mt-3 flex h-8 items-center rounded-[12px] bg-[#292929] px-3 text-[11px]"><b className="flex-1">Roughness</b><input aria-label="Roughness" type="range" min="0" max="1" step=".05" value={props.roughness} onChange={e=>props.onRoughnessChange(Number(e.target.value))} className="mr-2 w-20 accent-[#1687f7]"/><output className="w-16 rounded-lg bg-[#414141] py-1 text-center">{props.roughness.toFixed(2)}</output></label>
    <label className="mx-1 mt-2 flex h-8 items-center rounded-[12px] bg-[#292929] px-3 text-[11px]"><b className="flex-1">Metallic</b><input aria-label="Metallic" type="range" min="0" max="1" step=".05" value={props.metallic} onChange={e=>props.onMetallicChange(Number(e.target.value))} className="mr-2 w-20 accent-[#1687f7]"/><output className="w-16 rounded-lg bg-[#414141] py-1 text-center">{props.metallic.toFixed(2)}</output></label>

    <h3 className="px-3 pb-2 pt-5 text-[11px] font-semibold">Topology</h3><div className="mx-1 grid grid-cols-3 gap-1 rounded-[12px] bg-[#292929] p-1">{["Auto","Low Poly","Topology"].map(x=><button key={x} className="h-7 rounded-lg bg-[#414141] text-[9px] text-zinc-200">{x}</button>)}</div>
    <h3 className="px-3 pb-2 pt-4 text-[11px] font-semibold">Texture</h3><div className="mx-1 grid grid-cols-3 gap-1 rounded-[12px] bg-[#292929] p-1">{["None","Standard","PBR"].map(x=><button key={x} className="h-7 rounded-lg bg-[#414141] text-[9px] text-zinc-200">{x}</button>)}</div>
    <h2 className="px-4 pb-2 pt-5 text-[14px] font-semibold text-zinc-400">Advanced</h2><div className="mx-1 rounded-[14px] bg-[#292929] py-1"><Toggle label="Separate Parts"/><Toggle label="Image Enhancement"/><Toggle label="Code Execution" initial/></div>

    <div className="mt-3 px-2 text-[10px] leading-4 text-zinc-400">Pro workspace: unlimited renders,<br/>industrial-grade mesh export</div>
    <div className="mx-1 mt-3 rounded-[14px] bg-[#292929] p-2"><div className="mb-2 flex justify-center gap-4 text-[12px] font-semibold"><span>1 min</span><span className="flex items-center gap-1"><Zap size={17} fill="white"/>50</span></div><button className="flex h-9 w-full items-center justify-between rounded-[11px] bg-gradient-to-r from-[#1698f7] to-[#0754ff] px-12 text-[12px] font-semibold">Render Queue <span>50</span></button></div>
    <div className="mt-auto flex h-12 items-center rounded-[12px] bg-[#292929] px-2"><span className="grid h-8 w-8 place-items-center rounded-[8px] bg-[#1687f7] text-xs font-semibold">B</span><button className="ml-auto flex items-center gap-2 px-3 text-[11px] text-zinc-300"><LogOut size={19}/>Sign Out</button></div>
  </aside>;
}
