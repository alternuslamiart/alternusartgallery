"use client";

import { Bell, Box, ChevronDown, Grid2X2, Image, Lightbulb, MessageSquare, PanelRightClose, Plus, Settings2, Share2, SlidersHorizontal, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import type { RenderSettings, StudioAsset } from "./types";

type Props = {
  color: string; opacity: number; roughness: number; metallic: number; renderSettings: RenderSettings;
  assets: StudioAsset[]; selectedAssetId: string | null; exporting: string | null;
  onColorChange: (value: string) => void; onOpacityChange: (value: number) => void;
  onRenderChange: (value: RenderSettings) => void; onSelectAsset: (id: string) => void;
  onDeleteAsset: (id: string) => void; onExport: (format: string) => void; onCollapse: () => void;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="crystal-inspector-block"><h2>{title}<ChevronDown size={13} /></h2><div>{children}</div></section>;
}
function Property({ label, value }: { label: string; value: string }) {
  return <label className="crystal-inspector-property"><span>{label}</span><b>{value}</b></label>;
}

export function ModelingInspector({ color, opacity, roughness, metallic, renderSettings, assets, selectedAssetId, exporting, onColorChange, onOpacityChange, onRenderChange, onSelectAsset, onDeleteAsset, onExport, onCollapse }: Props) {
  const [effects,setEffects]=useState(false); const [fog,setFog]=useState(false); const [shadows,setShadows]=useState(false); const [snap,setSnap]=useState("Off");
  const RefToggle=({value,onClick}:{value:boolean;onClick:()=>void})=><button className={`crystal-reference-toggle ${value?"is-on":""}`} onClick={onClick}><i/></button>;
  const RefSelect=({children}:{children:React.ReactNode})=><button className="crystal-reference-select">{children}<ChevronDown size={11}/></button>;
  return <aside className="crystal-modeling-inspector crystal-reference-inspector"><header className="crystal-reference-inspector-header"><span><Sparkles size={14}/></span><div><button>Share</button><button aria-label="Collapse inspector" onClick={onCollapse}><PanelRightClose size={14}/></button></div></header><section className="crystal-reference-section"><b>Viewport</b><RefSelect>Personal Camera</RefSelect></section><section className="crystal-reference-section"><b>Frame</b><label>Size <RefSelect>Responsive</RefSelect></label><label>Auto Zoom <span className="crystal-reference-binary"><button>No</button><button className="is-active">Yes</button></span></label><label>Screen UI <RefSelect>None</RefSelect></label></section><section className="crystal-reference-section"><b>Scene</b><label>BG Color <input type="color" value={color} onChange={e=>onColorChange(e.target.value)}/></label><label>Play Camera <RefSelect>Personal...</RefSelect></label></section><section className="crystal-reference-collapsible"><button><Lightbulb size={13}/>Light<ChevronDown size={12}/></button></section><section className="crystal-reference-collapsible"><button><Grid2X2 size={13}/>Simulation<ChevronDown size={12}/></button></section><section className="crystal-reference-switch-row"><span>Effects</span><RefToggle value={effects} onClick={()=>setEffects(v=>!v)}/></section><section className="crystal-reference-switch-row"><span>Fog</span><RefToggle value={fog} onClick={()=>setFog(v=>!v)}/></section><section className="crystal-reference-switch-row"><span>Ambient Shadows</span><RefToggle value={shadows} onClick={()=>setShadows(v=>!v)}/></section><section className="crystal-reference-section"><b>Global Settings</b><label>Grid Plane <RefSelect>Floor (XZ)</RefSelect></label><label>Snapping <span className="crystal-reference-snap">{["Object","Grid","Off"].map(x=><button key={x} onClick={()=>setSnap(x)} className={snap===x?"is-active":""}>{x}</button>)}</span></label></section><section className="crystal-reference-assets crystal-reference-assets-heading"><b>Variables</b><Grid2X2 size={12}/></section><section className="crystal-reference-assets"><b>Material Assets</b><Plus size={12}/></section><section className="crystal-reference-assets"><b>Color Assets</b><Plus size={12}/></section><section className="crystal-reference-assets"><b>Image Assets</b><Plus size={12}/></section><button className="crystal-reference-ai-chat" onClick={() => window.dispatchEvent(new CustomEvent("crystal:toggle-ai-chat"))}><MessageSquare size={13}/>AI Chat</button></aside>;
  /* legacy layout
    <header><div className="crystal-inspector-brand"><span><Sparkles size={16} /></span></div><div className="crystal-inspector-actions"><button aria-label="Share"><Share2 size={15} /></button><button aria-label="Notifications"><Bell size={15} /></button><button aria-label="Collapse inspector" onClick={onCollapse}><PanelRightClose size={16} /></button></div></header>
    <div className="crystal-inspector-tabs"><button className="is-active">Design</button><button>Animation</button></div>
    <Section title="TRANSFORM"><div className="crystal-transform-label">Position</div><Property label="X" value="0" /><Property label="Y" value="0.2" /><Property label="Z" value="-0.1" /><div className="crystal-transform-label">Rotation</div><Property label="X" value="0" /><Property label="Y" value="0" /><Property label="Z" value="0" /><div className="crystal-transform-label">Scale</div><Property label="X" value="1" /><Property label="Y" value="1" /><Property label="Z" value="1" /></Section>
    <Section title="MATERIAL"><label className="crystal-inspector-property"><span>Color</span><input aria-label="Model color" type="color" value={color} onChange={event => onColorChange(event.target.value)} /><b>100%</b></label><label className="crystal-inspector-property"><span>AI Model</span><b>None <ChevronDown size={12} /></b></label><label className="crystal-inspector-property"><span>Opacity</span><input aria-label="Model opacity" type="range" min="0" max="100" value={opacity} onChange={event => onOpacityChange(Number(event.target.value))} /></label><button className="crystal-inspector-ai"><Sparkles size={13} />AI Material</button></Section>
    <Section title="DIMENSION"><div className="crystal-inspector-grid"><Property label="Polygons" value="4.2k" /><Property label="Vertices" value="12.8k" /><Property label="Width" value="1.0 m" /><Property label="Height" value="1.0 m" /></div></Section>
    <Section title="CAMERA"><div className="crystal-camera-preview"><span /></div><Property label="View" value="Orthographic" /></Section>
    <Section title="ENVIRONMENT"><Property label="Lighting" value="Studio Soft" /><Property label="HDRI" value="Default" /><button className="crystal-inspector-row"><Lightbulb size={13} />Adjust lighting</button></Section>
    <Section title="ASSET LIBRARY"><div className="crystal-inspector-assets">{assets.slice(0, 4).map(asset => <button key={asset.id} onClick={() => onSelectAsset(asset.id)} className={selectedAssetId === asset.id ? "is-selected" : ""}><span className={`crystal-asset-preview ${asset.thumbnail}`} /><small>{asset.name}</small><Trash2 size={11} onClick={event => { event.stopPropagation(); onDeleteAsset(asset.id); }} /></button>)}</div><button className="crystal-inspector-export" onClick={() => onExport("JPEG & PNG")} disabled={!!exporting}><span>+</span>{exporting ? "Preparing..." : "Render Scene"}</button></Section>
  </aside>;
  */
}
