"use client";

import { ArrowLeft, Box, ChevronDown, CircleHelp, Eye, Folder, Grid2X2, Lightbulb, Lock, Menu, PanelLeftClose, Plus, Search, Sparkles, Upload } from "lucide-react";
import { useState } from "react";
import type { MaterialName } from "./types";

type Props = {
  renderer: string; quality: string; material: MaterialName; prompt: string; loading: boolean;
  uploadedImage: string | null; onPromptChange: (value: string) => void; onGenerate: () => void;
  onUpload: (file: File) => void; onQualityChange: (value: string) => void;
  onMaterialChange: (value: MaterialName) => void; onRendererChange: (value: string) => void; onCollapse: () => void;
};

const materials: MaterialName[] = ["Titanium", "Aluminum", "Steel", "Carbon Fiber", "Plastic", "Glass", "Rubber"];

export function ModelingSidebar({ renderer, quality, material, prompt, loading, uploadedImage, onPromptChange, onGenerate, onUpload, onQualityChange, onMaterialChange, onRendererChange, onCollapse }: Props) {
  const [tab, setTab] = useState<"objects" | "assets">("objects");
  const [selected, setSelected] = useState("Scene 1");
  const [query, setQuery] = useState("");
  const objects = [["Shape 0", Box], ["Scene 1", Grid2X2], ["Particle Emitter", Sparkles], ["Small Particle Emitter", Sparkles], ["Directional Light", Lightbulb]] as const;
  return <aside className="crystal-modeling-sidebar crystal-reference-left" aria-label="Objects panel">
    <header className="crystal-reference-project-header"><button aria-label="Back"><ArrowLeft size={14}/></button><b>Untitled</b><button aria-label="Menu"><Menu size={15}/></button></header>
    <div className="crystal-reference-tabs"><button className={tab === "objects" ? "is-active" : ""} onClick={() => setTab("objects")}>Objects</button><button className={tab === "assets" ? "is-active" : ""} onClick={() => setTab("assets")}>Assets</button></div>
    <div className="crystal-scene-title"><span>Scene 1</span><div><button aria-label="List view"><Grid2X2 size={12}/></button><button aria-label="Add object" onClick={() => setSelected("Shape 0")}><Plus size={13}/></button></div></div>
    <label className="crystal-reference-search"><Search size={12}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search"/></label>
    {tab === "objects" ? <div className="crystal-reference-tree">{objects.filter(([name]) => name.toLowerCase().includes(query.toLowerCase())).map(([name, Icon], index) => <button key={name} onClick={() => setSelected(name)} className={`crystal-reference-tree-row ${selected === name ? "is-selected" : ""} ${index > 1 ? "is-child" : ""}`}><ChevronDown size={11} className={name === "Scene 1" ? "-rotate-90" : "opacity-0"}/><Icon size={13}/><span>{name}</span>{name === "Scene 1" && <i><Lock size={10}/><Eye size={11}/></i>}</button>)}</div> : <div className="crystal-reference-empty"><Folder size={17}/><span>Assets</span><small>Drop media here</small></div>}
    <section className="crystal-reference-generator"><div><Sparkles size={12}/><span>Quick generate</span></div><label><Upload size={13}/><span>{uploadedImage ? "Reference ready" : "Add reference"}</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = ""; }}/></label><textarea value={prompt} onChange={event => onPromptChange(event.target.value)} placeholder="Describe an object..."/><button disabled={!prompt.trim() || loading} onClick={onGenerate}><Sparkles size={13}/>{loading ? "Generating" : "Generate"}</button></section>
    <footer className="crystal-reference-footer"><button><Folder size={13}/>Library</button><button><Upload size={13}/>Import</button><button><CircleHelp size={13}/>Help &amp; Feedback</button><button aria-label="Collapse panel" onClick={onCollapse}><PanelLeftClose size={14}/></button></footer>
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
