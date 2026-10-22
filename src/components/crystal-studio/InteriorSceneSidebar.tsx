"use client";

import { Box, FolderOpen, Layers3, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { StudioHeader, StudioPanel } from "./kit";
import type { FloorPlanObject } from "./types";

type Props = {
  objects: FloorPlanObject[];
  selectedId: string | null;
  hoveredId?: string | null;
  onHover?: (id:string|null)=>void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onSelect: (id: string | null) => void;
  onOpen: () => void;
  onExport: (format: string) => void;
  onBack: () => void;
  onCollapse: () => void;
};

function objectLabel(object: FloorPlanObject, index: number) {
  if ("label" in object && object.label) return object.label;
  if (object.type === "text") return object.text || "Text";
  return `${object.type.charAt(0).toUpperCase()}${object.type.slice(1)} ${index + 1}`;
}

export function InteriorSceneSidebar(p: Props) {
  const hierarchyRef=useRef<HTMLElement>(null);
  useEffect(()=>{
    const id=p.hoveredId??p.selectedId;if(!id)return;
    hierarchyRef.current?.querySelector<HTMLElement>(`[data-floor-plan-object-id="${CSS.escape(id)}"]`)?.scrollIntoView({block:"nearest",inline:"nearest"});
  },[p.selectedId,p.hoveredId]);
  return <StudioPanel className="crystal-left-panel interior-scene-sidebar">
    <StudioHeader title="Interior" onBack={p.onBack} onCollapse={p.onCollapse} />
    <nav className="interior-scene-nav" aria-label="Studios">
      <Link href="/casynus">Architecture</Link>
      <Link href="/interior" aria-current="page">Interior</Link>
      <Link href="/infrastructure">Infra</Link>
    </nav>
    <div className="interior-project-row">
      <input aria-label="Project name" value={p.projectName} onChange={e => p.onProjectNameChange(e.target.value)} />
      <button type="button" aria-label="Open project" title="Open project" onClick={p.onOpen}><FolderOpen size={17} /></button>
      <details className="interior-project-actions">
        <summary aria-label="Project actions" title="Project actions"><MoreHorizontal size={18} /></summary>
        <div onClick={e => { if ((e.target as HTMLElement).closest("button")) e.currentTarget.parentElement?.removeAttribute("open"); }}>
          <button type="button" onClick={p.onOpen}>Open project</button>
          <button type="button" onClick={() => p.onExport("JSON Scene")}>Save project JSON</button>
          <button type="button" onClick={() => p.onExport("SVG")}>Export SVG</button>
          <button type="button" onClick={() => p.onExport("PDF")}>Export PDF</button>
        </div>
      </details>
    </div>
    <section className="interior-scene-hierarchy" ref={hierarchyRef} aria-label="Floor plan hierarchy">
      <h2><Layers3 size={14} />Scene hierarchy <span>{p.objects.length}</span></h2>
      <button type="button" className="interior-scene-root" onClick={() => p.onSelect(null)}><Layers3 size={12} /><span>{p.projectName || "Untitled project"}</span></button>
      {p.objects.map((object, index) => <button type="button" key={object.id}
        data-floor-plan-object-id={object.id} data-hovered={p.hoveredId===object.id||undefined}
        onPointerEnter={()=>p.onHover?.(object.id)} onPointerLeave={()=>p.onHover?.(null)}
        className={`interior-scene-object ${object.id === p.selectedId ? "is-selected" : ""}`}
        aria-pressed={object.id === p.selectedId} onClick={() => p.onSelect(object.id)}>
        <Box size={12} /><span>{objectLabel(object, index)}</span>
      </button>)}
    </section>
  </StudioPanel>;
}
