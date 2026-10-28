"use client";

import { useEffect, useId, useImperativeHandle, useRef, useState, type Ref } from "react";
import { Focus, Home, Play, Plus, X, ZoomIn, ZoomOut, type LucideIcon } from "lucide-react";
import { StudioToolbar } from "./kit";
import {StudioMaterialLibrary,type MaterialLibraryOptions} from "./StudioMaterialLibrary";
import type {MaterialAsset} from "./material-textures";
import "./viewport-toolbar.css";

export type ViewportAction = { label: string; icon: LucideIcon; onClick: () => void; active?: boolean; disabled?: boolean; showLabel?: boolean;frame?:boolean };
type Props = {
  hidePlus?: boolean;
  hidePlay?: boolean;
  apiRef?:Ref<StudioToolbarAPI>;
  label: string; leading: ViewportAction[]; tools: ViewportAction[];
  onFit: () => void; onReset: () => void; cameraViews: string[]; cameraView: string; onCamera: (view: string) => void;
  onZoom: (factor: number) => void; exportFormats: string[]; onExport: (format: string) => void;
  onCSV: () => void; settingsLabel: string; onSettings: () => void; settingsActive?: boolean; busy?: boolean;
  materialLibrary?:MaterialLibraryOptions;
};
export type StudioToolbarAPI={openExport:()=>void;openLibrary:()=>void;csv:()=>void;settings:()=>void};

export function downloadStudioCSV(name: string, rows: Record<string, unknown>[]) {
  const fields = Array.from(new Set(rows.flatMap(row => Object.keys(row))));
  const cell = (value: unknown) => {
    let text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
    if (typeof value === "string" && /^[\s]*[=+@-]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  const csv = [fields.map(cell).join(","), ...rows.map(row => fields.map(field => cell(row[field])).join(","))].join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = `${name.replace(/[^a-z0-9_-]/gi, "_")}.csv`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function StudioViewportToolbar(p: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const toolbarId=useId();const [libraryOpen,setLibraryOpen]=useState(false),[libraryWidth,setLibraryWidth]=useState(0);
  const [uploadedAssets,setUploadedAssets]=useState<MaterialAsset[]>([]);
  useImperativeHandle(p.apiRef,()=>({openExport:()=>{if(p.busy)throw new Error('The toolbar is busy.');dialog.current?.showModal();},openLibrary:()=>setLibraryOpen(true),csv:()=>{if(p.busy)throw new Error('The toolbar is busy.');p.onCSV();},settings:p.onSettings}));
  useEffect(()=>{
    if(!libraryOpen)return;const toolbar=document.getElementById(toolbarId);if(!toolbar)return;
    const resize=()=>setLibraryWidth(toolbar.getBoundingClientRect().width);resize();const observer=new ResizeObserver(resize);observer.observe(toolbar);return()=>observer.disconnect();
  },[libraryOpen,toolbarId]);
  const action = (a: ViewportAction) => <button key={a.label} type="button" aria-label={a.label} title={a.label} disabled={a.disabled} aria-pressed={a.active} onClick={a.onClick} className={`${a.frame?'sketch-entry ':''}${a.showLabel ? "ref-toolbar-export-btn" : "ref-toolbar-icon-btn"} ${a.active ? "is-active" : ""}`}><span><a.icon size={18} strokeWidth={a.active ? 2.35 : 1.65} />{a.showLabel && a.label}</span></button>;
  return <>
    <StudioToolbar id={toolbarId} className="ref-top-toolbar casynus-viewport-toolbar" aria-label={p.label}>
      {!p.hidePlus && <button type="button" className={`ref-toolbar-icon-btn ${libraryOpen?"is-active":""}`} aria-label="Texture material library" title="Texture material library" aria-expanded={libraryOpen} onClick={()=>setLibraryOpen(value=>!value)}><span><Plus size={18} strokeWidth={libraryOpen ? 2.35 : 1.65} /></span></button>}
      {p.leading.map(action)}<span className="ref-toolbar-divider" />{p.tools.map(action)}
      {action({ label: "Fit entire scene", icon: Focus, onClick: p.onFit })}
      {action({ label: "Reset camera", icon: Home, onClick: p.onReset })}
      <span className="ref-toolbar-divider" />
      <select aria-label="Camera view" value={p.cameraView} onChange={e => p.onCamera(e.target.value)} className="ref-toolbar-zoom-pill">{p.cameraViews.map(view => <option key={view}>{view}</option>)}</select>
      {action({ label: "Zoom in (+)", icon: ZoomIn, onClick: () => p.onZoom(1.25) })}
      {action({ label: "Zoom out (−)", icon: ZoomOut, onClick: () => p.onZoom(.8) })}
      <button type="button" className="ref-toolbar-export-btn" aria-label="Export viewport" disabled={p.busy} onClick={() => dialog.current?.showModal()}><span>Export</span></button>
      <button type="button" className="ref-toolbar-icon-btn" aria-label="Export scene as CSV" onClick={p.onCSV} disabled={p.busy}><span>CSV</span></button>
      {!p.hidePlay && action({ label: p.settingsLabel, icon: Play, active: p.settingsActive, onClick: p.onSettings })}
    </StudioToolbar>
    {libraryOpen&&<StudioMaterialLibrary options={p.materialLibrary} uploadedAssets={uploadedAssets} onUploadAsset={asset=>setUploadedAssets(current=>[...current,asset])} onClose={()=>setLibraryOpen(false)} width={libraryWidth}/>}
    <dialog ref={dialog} className="casynus-toolbar-export" aria-label="Export scene"><header><strong>Export</strong><button aria-label="Close export" onClick={() => dialog.current?.close()}><X size={16} /></button></header>{p.exportFormats.map(format => <button key={format} onClick={() => { dialog.current?.close(); p.onExport(format); }}>{format.toUpperCase()}</button>)}</dialog>
  </>;
}
