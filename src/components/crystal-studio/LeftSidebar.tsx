"use client";

import { Box, ChevronDown, ChevronUp, ImagePlus, Layers3, LogOut, PanelLeftClose, Plus, Trash2 } from "lucide-react";
import { materials } from "./data";
import type { MaterialName } from "./types";

type Props = {
  material: MaterialName;
  roughness: number;
  metallic: number;
  uploadedImage: string | null;
  settingsOpen: boolean;
  onMaterialChange: (value: MaterialName) => void;
  onRoughnessChange: (value: number) => void;
  onMetallicChange: (value: number) => void;
  onUpload: (file: File) => void;
  onRemoveImage: () => void;
  onToggleSettings: () => void;
  onCollapse: () => void;
};

export function LeftSidebar(props: Props) {
  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file?.type.startsWith("image/")) props.onUpload(file);
  };

  return (
    <aside className="crystal-left-panel flex min-h-0 flex-col border-r border-[#303030] bg-[#202020] px-2 pb-3 pt-2">
      <div className="flex items-center justify-between px-2 py-2">
        <h1 className="text-[16px] font-semibold text-zinc-300">Create Modeling</h1>
        <button aria-label="Collapse left panel" onClick={props.onCollapse} className="grid h-9 w-9 place-items-center rounded-[9px] bg-[#1687f7] text-white"><PanelLeftClose size={18} /></button>
      </div>

      <div className="mt-2 flex h-14 items-center gap-4 rounded-[9px] bg-[#292929] px-3 text-zinc-100">
        <span className="grid h-10 w-10 place-items-center rounded-[7px] bg-[#1687f7]"><Layers3 size={22} /></span>
        <span className="flex-1 text-[16px] font-semibold">Shading</span><ChevronDown size={18} className="text-zinc-400" />
      </div>
      <p className="px-2 py-4 text-[12px] leading-[17px] text-zinc-300">Generate 3D model, select<br />shading or solid</p>

      <label
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => { event.preventDefault(); handleFiles(event.dataTransfer.files); }}
        className="relative mx-2 flex h-[194px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[12px] bg-[#292929] text-zinc-400 hover:bg-[#2d2d2d]"
      >
        <input aria-label="Upload image" type="file" accept="image/*" className="sr-only" onChange={(event) => handleFiles(event.target.files)} />
        {props.uploadedImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={props.uploadedImage} alt="Uploaded model reference" className="h-full w-full object-cover" />
            <button type="button" aria-label="Remove uploaded image" onClick={(event) => { event.preventDefault(); props.onRemoveImage(); }} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-black/70 text-white"><Trash2 size={16} /></button>
          </>
        ) : (
          <><Plus size={44} strokeWidth={1.5} /><span className="mt-3 text-[16px] font-semibold">Upload image</span><span className="mt-1 text-[11px]">Click or drop a reference</span></>
        )}
      </label>

      <h2 className="px-2 pb-3 pt-5 text-[16px] font-semibold text-zinc-300">Settings</h2>
      <button type="button" onClick={props.onToggleSettings} className="mx-2 flex h-14 items-center justify-between rounded-[9px] bg-[#292929] px-5 text-[16px] font-semibold text-zinc-100">
        General Settings {props.settingsOpen ? <ChevronUp size={18} className="text-zinc-400" /> : <ChevronDown size={18} className="text-zinc-400" />}
      </button>
      {props.settingsOpen && <div className="mx-2 mt-2 rounded-[9px] border border-[#303030] bg-[#252525] p-3 text-[11px] leading-5 text-zinc-400"><ImagePlus size={15} className="mb-1" />Reference images guide AI topology and surface details.</div>}

      <h2 className="px-2 pb-3 pt-4 text-[16px] font-semibold text-zinc-300">Material</h2>
      <label className="mx-2 flex h-14 items-center gap-4 rounded-[9px] bg-[#292929] px-2 text-zinc-100">
        <span className="grid h-10 w-10 place-items-center rounded-[7px] bg-[#1687f7]"><Box size={21} /></span>
        <select aria-label="Material" value={props.material} onChange={(event) => props.onMaterialChange(event.target.value as MaterialName)} className="h-full flex-1 appearance-none bg-transparent text-[16px] font-medium outline-none">{materials.map((item) => <option className="bg-[#292929]" key={item}>{item}</option>)}</select>
        <ChevronDown size={18} className="mr-2 text-zinc-400" />
      </label>

      <label className="mx-2 mt-5 flex h-9 items-center rounded-[8px] bg-[#292929] px-4 text-[12px] text-zinc-100"><span className="flex-1">Roughness</span><input aria-label="Roughness" type="range" min="0" max="1" step="0.05" value={props.roughness} onChange={(event) => props.onRoughnessChange(Number(event.target.value))} className="mr-3 w-20 accent-[#1687f7]" /><output className="w-11 rounded bg-[#414141] py-1 text-center">{props.roughness.toFixed(2)}</output></label>
      <label className="mx-2 mt-3 flex h-9 items-center rounded-[8px] bg-[#292929] px-4 text-[12px] text-zinc-100"><span className="flex-1">Metallic</span><input aria-label="Metallic" type="range" min="0" max="1" step="0.1" value={props.metallic} onChange={(event) => props.onMetallicChange(Number(event.target.value))} className="mr-3 w-20 accent-[#1687f7]" /><output className="w-11 rounded bg-[#414141] py-1 text-center">{props.metallic.toFixed(1)}</output></label>

      <div className="mt-auto flex h-14 items-center rounded-[9px] bg-[#292929] px-2">
        <span className="grid h-10 w-10 place-items-center rounded-[7px] bg-[#1687f7] text-sm font-semibold text-white">B</span>
        <button aria-label="Log out" className="ml-auto flex items-center gap-2 px-3 text-[12px] text-zinc-300"><LogOut size={20} />Log Out</button>
      </div>
    </aside>
  );
}
