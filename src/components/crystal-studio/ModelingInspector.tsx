"use client";

import { Bell, Box, ChevronDown, Download, Image, Lightbulb, PanelRightClose, Share2, Sparkles, Trash2 } from "lucide-react";
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
  return <aside className="crystal-modeling-inspector">
    <header><div className="crystal-inspector-brand"><span><Sparkles size={16} /></span></div><div className="crystal-inspector-actions"><button aria-label="Share"><Share2 size={15} /></button><button aria-label="Notifications"><Bell size={15} /></button><button aria-label="Collapse inspector" onClick={onCollapse}><PanelRightClose size={16} /></button></div></header>
    <div className="crystal-inspector-tabs"><button className="is-active">Design</button><button>Animation</button></div>
    <Section title="TRANSFORM"><div className="crystal-transform-label">Position</div><Property label="X" value="0" /><Property label="Y" value="0.2" /><Property label="Z" value="-0.1" /><div className="crystal-transform-label">Rotation</div><Property label="X" value="0" /><Property label="Y" value="0" /><Property label="Z" value="0" /><div className="crystal-transform-label">Scale</div><Property label="X" value="1" /><Property label="Y" value="1" /><Property label="Z" value="1" /></Section>
    <Section title="MATERIAL"><label className="crystal-inspector-property"><span>Color</span><input aria-label="Model color" type="color" value={color} onChange={event => onColorChange(event.target.value)} /><b>100%</b></label><label className="crystal-inspector-property"><span>AI Model</span><b>None <ChevronDown size={12} /></b></label><label className="crystal-inspector-property"><span>Opacity</span><input aria-label="Model opacity" type="range" min="0" max="100" value={opacity} onChange={event => onOpacityChange(Number(event.target.value))} /></label><button className="crystal-inspector-ai"><Sparkles size={13} />AI Material</button></Section>
    <Section title="DIMENSION"><div className="crystal-inspector-grid"><Property label="Polygons" value="4.2k" /><Property label="Vertices" value="12.8k" /><Property label="Width" value="1.0 m" /><Property label="Height" value="1.0 m" /></div></Section>
    <Section title="CAMERA"><div className="crystal-camera-preview"><span /></div><Property label="View" value="Orthographic" /></Section>
    <Section title="ENVIRONMENT"><Property label="Lighting" value="Studio Soft" /><Property label="HDRI" value="Default" /><button className="crystal-inspector-row"><Lightbulb size={13} />Adjust lighting</button></Section>
    <Section title="ASSET LIBRARY"><div className="crystal-inspector-assets">{assets.slice(0, 4).map(asset => <button key={asset.id} onClick={() => onSelectAsset(asset.id)} className={selectedAssetId === asset.id ? "is-selected" : ""}><span className={`crystal-asset-preview ${asset.thumbnail}`} /><small>{asset.name}</small><Trash2 size={11} onClick={event => { event.stopPropagation(); onDeleteAsset(asset.id); }} /></button>)}</div><button className="crystal-inspector-export" onClick={() => onExport("JPEG & PNG")} disabled={!!exporting}><span>+</span>{exporting ? "Preparing..." : "Render Scene"}</button></Section>
  </aside>;
}
