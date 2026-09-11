"use client";

import { Box, ChevronDown, Folder, Layers3, Lightbulb, PanelLeftClose, Sparkles, Upload, User } from "lucide-react";
import type { MaterialName } from "./types";

type Props = {
  renderer: string; quality: string; material: MaterialName; prompt: string; loading: boolean;
  uploadedImage: string | null; onPromptChange: (value: string) => void; onGenerate: () => void;
  onUpload: (file: File) => void; onQualityChange: (value: string) => void;
  onMaterialChange: (value: MaterialName) => void; onRendererChange: (value: string) => void; onCollapse: () => void;
};

const materials: MaterialName[] = ["Titanium", "Aluminum", "Steel", "Carbon Fiber", "Plastic", "Glass", "Rubber"];

export function ModelingSidebar({ renderer, quality, material, prompt, loading, uploadedImage, onPromptChange, onGenerate, onUpload, onQualityChange, onMaterialChange, onRendererChange, onCollapse }: Props) {
  return <aside className="crystal-modeling-sidebar">
    <header><div><span>CRYSTAL · 3D STUDIO</span><h1>Modeling</h1></div><button aria-label="Collapse modeling sidebar" onClick={onCollapse}><PanelLeftClose size={16} /></button></header>
    <div className="crystal-modeling-tabs"><button className="is-active">Modeling</button><button>Shaders</button><button>Render</button></div>
    <section className="crystal-modeling-block"><label className="crystal-modeling-select"><Layers3 size={15} /><span>Renderer</span><select value={renderer} onChange={event => onRendererChange(event.target.value)}>{["Realtime", "Path-Traced", "Cycles-style"].map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={13} /></label></section>
    <section className="crystal-modeling-block"><h2>PAGE <button aria-label="Add page">+</button></h2><button className="crystal-modeling-row is-selected"><Folder size={14} />Scene</button></section>
    <section className="crystal-modeling-block"><h2>SCENE <ChevronDown size={13} /></h2><button className="crystal-modeling-row"><span className="crystal-scene-dot camera" />Main Camera</button><button className="crystal-modeling-row"><Lightbulb size={14} />Environment Light</button><button className="crystal-modeling-row"><Box size={14} />Objects <small>1</small></button><button className="crystal-modeling-row"><Layers3 size={14} />Groups <small>0</small></button></section>
    <section className="crystal-modeling-block crystal-generative-3d"><h2>GENERATIVE 3D <Sparkles size={13} /></h2><label className="crystal-reference-upload">{uploadedImage ? <img src={uploadedImage} alt="Uploaded reference" /> : <Upload size={17} />}<span>{uploadedImage ? "Reference uploaded" : "Drag or upload image reference"}<small>JPG, PNG, WEBP · up to 5MB</small></span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = ""; }} /></label><textarea value={prompt} onChange={event => onPromptChange(event.target.value)} placeholder="Describe the object you want to generate..." /><div className="crystal-generation-options"><label>AI Model<b>Precision Mode</b></label><label>Quantity<b>1</b></label></div><button className="crystal-generation-button" disabled={!prompt.trim() || loading} onClick={onGenerate}><Sparkles size={13} />{loading ? "Generating..." : "Generate 3D Model"}</button></section>
    <section className="crystal-modeling-block"><h2>PROPERTIES</h2><label className="crystal-modeling-select"><Box size={14} /><span>Material</span><select value={material} onChange={event => onMaterialChange(event.target.value as MaterialName)}>{materials.map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={13} /></label><label className="crystal-modeling-select"><span>Quality</span><select value={quality} onChange={event => onQualityChange(event.target.value)}>{["Draft", "Standard", "High", "Ultra"].map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={13} /></label></section>
    <footer><button className="crystal-modeling-user"><User size={14} />Workspace account</button></footer>
  </aside>;
}
