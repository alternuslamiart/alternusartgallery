"use client";

import { ArrowLeft, Box, ChevronDown, Eye, EyeOff, Folder, Grid2X2, Lightbulb, Lock, Menu, PanelLeftClose, Plus, Search, Sparkles, Unlock, Upload, Zap } from "lucide-react";
import { useState } from "react";
import type { MaterialName, StudioAsset } from "./types";

type Props = {
  quality: string; topology: string; texture: string; material: MaterialName; prompt: string; loading: boolean;
  separateParts: boolean; imageEnhancement: boolean; codeExecution: boolean;
  renderLoading: boolean; estimatedMinutes: number; estimatedCost: number;
  assets: StudioAsset[]; selectedAssetId: string | null;
  uploadedImage: string | null; onPromptChange: (value: string) => void; onGenerate: () => void;
  onUpload: (file: File) => void; onQualityChange: (value: string) => void;
  onTopologyChange: (value: string) => void; onTextureChange: (value: string) => void;
  onSeparatePartsChange: (value: boolean) => void; onImageEnhancementChange: (value: boolean) => void; onCodeExecutionChange: (value: boolean) => void;
  onMaterialChange: (value: MaterialName) => void; onCollapse: () => void;
  onAddObject: () => void; onRender: () => void; onSignOut: () => void; onBack: () => void;
  onSelectAsset: (id: string) => void;
};

const materials: MaterialName[] = ["Titanium", "Aluminum", "Steel", "Carbon Fiber", "Plastic", "Glass", "Rubber"];

export function ModelingSidebar({ quality, topology, texture, material, prompt, loading, separateParts, imageEnhancement, codeExecution, renderLoading, estimatedMinutes, estimatedCost, assets, selectedAssetId, uploadedImage, onPromptChange, onGenerate, onUpload, onQualityChange, onTopologyChange, onTextureChange, onSeparatePartsChange, onImageEnhancementChange, onCodeExecutionChange, onMaterialChange, onCollapse, onAddObject, onRender, onSignOut, onBack, onSelectAsset }: Props) {
  const [tab, setTab] = useState<"objects" | "assets">("objects");
  const [selected, setSelected] = useState("Scene 1");
  const [query, setQuery] = useState("");
  const [locked, setLocked] = useState<Record<string, boolean>>({ "Scene 1": true });
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const objects = [["Shape 0", Box], ["Scene 1", Grid2X2], ["Particle Emitter", Sparkles], ["Small Particle Emitter", Sparkles], ["Directional Light", Lightbulb]] as const;
  const filteredAssets = assets.filter(asset => asset.name.toLowerCase().includes(query.toLowerCase()));
  const toggles = [
    { label: "Separate Parts", value: separateParts, onChange: onSeparatePartsChange },
    { label: "Image Enhancement", value: imageEnhancement, onChange: onImageEnhancementChange },
    { label: "Code execution", value: codeExecution, onChange: onCodeExecutionChange },
  ];
  return <aside className="crystal-modeling-sidebar crystal-reference-left" aria-label="Objects panel">
    <header className="crystal-reference-project-header"><button type="button" aria-label="Back to projects" onClick={onBack}><ArrowLeft size={14}/></button><b>Crystal</b><button type="button" aria-label="Collapse panels" onClick={onCollapse}><Menu size={15}/></button></header>
    <div className="crystal-reference-tabs"><button className={tab === "objects" ? "is-active" : ""} onClick={() => setTab("objects")}>Objects</button><button className={tab === "assets" ? "is-active" : ""} onClick={() => setTab("assets")}>Assets</button></div>
    <div className="crystal-scene-title"><span>Scene 1</span><div><button type="button" aria-label="List view"><Grid2X2 size={12}/></button><button type="button" aria-label="Add object" onClick={onAddObject}><Plus size={13}/></button></div></div>
    <label className="crystal-reference-search"><Search size={12}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search"/></label>
    {tab === "objects" ? <div className="crystal-reference-tree">{objects.filter(([name]) => name.toLowerCase().includes(query.toLowerCase())).map(([name, Icon], index) => <div key={name} className={`crystal-reference-tree-row ${selected === name ? "is-selected" : ""} ${index > 1 ? "is-child" : ""}`}><button type="button" className="crystal-reference-tree-select" onClick={() => setSelected(name)} aria-pressed={selected === name}><ChevronDown size={11} className={name === "Scene 1" ? "-rotate-90" : "opacity-0"}/><Icon size={13}/><span>{name}</span></button><i><button type="button" aria-label={`${locked[name] ? "Unlock" : "Lock"} ${name}`} aria-pressed={!!locked[name]} onClick={() => setLocked(value => ({ ...value, [name]: !value[name] }))}>{locked[name] ? <Lock size={10}/> : <Unlock size={10}/>}</button><button type="button" aria-label={`${hidden[name] ? "Show" : "Hide"} ${name}`} aria-pressed={!hidden[name]} onClick={() => setHidden(value => ({ ...value, [name]: !value[name] }))}>{hidden[name] ? <EyeOff size={11}/> : <Eye size={11}/>}</button></i></div>)}</div> : <div className="crystal-reference-tree crystal-reference-asset-list">{filteredAssets.map(asset => <button type="button" key={asset.id} onClick={() => onSelectAsset(asset.id)} className={`crystal-reference-tree-row ${selectedAssetId === asset.id ? "is-selected" : ""}`}><span className={`crystal-asset-dot bg-gradient-to-br ${asset.thumbnail}`} /><span>{asset.name}</span></button>)}{filteredAssets.length === 0 && <div className="crystal-reference-empty"><Folder size={17}/><span>No matching assets</span><small>Try another search</small></div>}</div>}
    <section className="crystal-modeling-properties"><h2>Properties</h2><label>Model Quality <select value={quality} onChange={event => onQualityChange(event.target.value)}><option>Draft</option><option>Standard</option><option>High</option><option>Ultra</option></select></label><label>Material <select value={material} onChange={event => onMaterialChange(event.target.value as MaterialName)}>{materials.map(item => <option key={item}>{item}</option>)}</select></label><h3>Topology</h3><div>{["Auto", "Low Poly", "Topology"].map(item => <button type="button" key={item} aria-pressed={topology === item} className={topology === item ? "is-selected" : ""} onClick={() => onTopologyChange(item)}>{item}</button>)}</div><h3>Texture</h3><div>{["None", "Standard", "PBR"].map(item => <button type="button" key={item} aria-pressed={texture === item} className={texture === item ? "is-selected" : ""} onClick={() => onTextureChange(item)}>{item}</button>)}</div><h3>Advanced</h3>{toggles.map(({ label, value, onChange }) => <button type="button" key={label} aria-pressed={value} onClick={() => onChange(!value)} className={`crystal-property-toggle ${value ? "is-on" : ""}`}>{label}<i /></button>)}</section>
    <section className="crystal-reference-generator"><div><Sparkles size={12}/><span>Quick generate</span></div><label><Upload size={13}/><span>{uploadedImage ? "Reference ready" : "Add reference"}</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = ""; }}/></label><textarea value={prompt} onChange={event => onPromptChange(event.target.value)} placeholder="Describe an object..."/><button disabled={!prompt.trim() || loading} onClick={onGenerate}><Sparkles size={13}/>{loading ? "Generating" : "Generate"}</button></section>
    <footer className="crystal-reference-footer crystal-modeling-footer"><a href="/pricing" className="crystal-modeling-pro-notice">Pro workspace: unlimited renders,<br/>industrial-grade mesh export</a><div className="crystal-modeling-render-card"><div><strong>{estimatedMinutes} min</strong><strong><Zap size={12}/> {estimatedCost}</strong></div><button type="button" onClick={onRender} disabled={renderLoading}>{renderLoading ? "Rendering..." : "Render Queue"}<span>{renderLoading ? "…" : "50"}</span></button></div><div className="crystal-modeling-account"><span>B</span><button type="button" onClick={onSignOut}>↪ <small>Sign Out</small></button></div><button type="button" aria-label="Collapse panel" onClick={onCollapse} className="crystal-modeling-collapse"><PanelLeftClose size={14}/></button></footer>
  </aside>;
  /* legacy layout
    <header><div className="crystal-modeling-identity"><span className="crystal-modeling-mark"><Sparkles size={15} /></span><div><b>Crystal</b><small>3D Studio&nbsp; • &nbsp;Modeling</small></div></div><button aria-label="Collapse modeling sidebar" onClick={onCollapse}><PanelLeftClose size={16} /></button></header>
    <div className="crystal-modeling-tabs"><button className="is-active">Modeling</button><button>Shaders</button><button>Render</button></div>
    <section className="crystal-modeling-block"><h2><span><Folder size={13} /> PAGE</span><button aria-label="Add page">+</button></h2><button className="crystal-modeling-row is-selected"><span className="crystal-scene-dot" />Modeling</button></section>
    <section className="crystal-modeling-block"><h2>SCENE <ChevronDown size={13} /></h2><button className="crystal-modeling-row"><span className="crystal-scene-dot camera" />Main Camera</button><button className="crystal-modeling-row"><Lightbulb size={14} />Environment Light</button><button className="crystal-modeling-row"><Box size={14} />Objects <small>1</small></button><button className="crystal-modeling-row"><Layers3 size={14} />Groups <small>0</small></button></section>
    <section className="crystal-modeling-block crystal-generative-3d"><h2><span><Sparkles size={13} /> GENERATIVE 3D</span><ChevronDown size={13} /></h2><label className="crystal-reference-upload">{uploadedImage ? <img src={uploadedImage} alt="Uploaded reference" /> : <Upload size={17} />}<span>{uploadedImage ? "Reference uploaded" : "Drag or upload image reference"}<small>JPG, PNG, WEBP (size 5Mb)</small></span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = ""; }} /></label><textarea value={prompt} onChange={event => onPromptChange(event.target.value)} placeholder="Describe the object you want to generate. You can use your native language..." /><div className="crystal-generation-options"><label>AI Model<b>{renderer}</b></label><label>Quantity<b>1</b></label></div><label className="crystal-generation-toggle">A/T Pose <CircleHelp size={11} /><i /></label><label className="crystal-generation-toggle">HD Texture <i /></label><button className="crystal-generation-button" disabled={!prompt.trim() || loading} onClick={onGenerate}><Sparkles size={13} />{loading ? "Generating..." : "Generate 3D Model"}<strong>20</strong></button><small className="crystal-generation-estimate">Estimated time remaining: 1 min</small></section>
    <footer><label className="crystal-modeling-search"><Search size={16} /><input placeholder="Search..." /><kbd>⌘F</kbd></label><button className="crystal-modeling-user">Workspace account</button></footer>
  </aside>;
  */
}
