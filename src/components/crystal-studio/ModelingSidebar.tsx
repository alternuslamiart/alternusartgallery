"use client";

import { Box, ChevronDown, CircleHelp, Folder, Layers3, Lightbulb, PanelLeftClose, Search, Sparkles, Upload } from "lucide-react";
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
    <header><div className="crystal-modeling-identity"><span className="crystal-modeling-mark"><Sparkles size={15} /></span><div><b>Crystal</b><small>3D Studio&nbsp; • &nbsp;Modeling</small></div></div><button aria-label="Collapse modeling sidebar" onClick={onCollapse}><PanelLeftClose size={16} /></button></header>
    <div className="crystal-modeling-tabs"><button className="is-active">Modeling</button><button>Shaders</button><button>Render</button></div>
    <section className="crystal-modeling-block"><h2><span><Folder size={13} /> PAGE</span><button aria-label="Add page">+</button></h2><button className="crystal-modeling-row is-selected"><span className="crystal-scene-dot" />Modeling</button></section>
    <section className="crystal-modeling-block"><h2>SCENE <ChevronDown size={13} /></h2><button className="crystal-modeling-row"><span className="crystal-scene-dot camera" />Main Camera</button><button className="crystal-modeling-row"><Lightbulb size={14} />Environment Light</button><button className="crystal-modeling-row"><Box size={14} />Objects <small>1</small></button><button className="crystal-modeling-row"><Layers3 size={14} />Groups <small>0</small></button></section>
    <section className="crystal-modeling-block crystal-generative-3d"><h2><span><Sparkles size={13} /> GENERATIVE 3D</span><ChevronDown size={13} /></h2><label className="crystal-reference-upload">{uploadedImage ? <img src={uploadedImage} alt="Uploaded reference" /> : <Upload size={17} />}<span>{uploadedImage ? "Reference uploaded" : "Drag or upload image reference"}<small>JPG, PNG, WEBP (size 5Mb)</small></span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = ""; }} /></label><textarea value={prompt} onChange={event => onPromptChange(event.target.value)} placeholder="Describe the object you want to generate. You can use your native language..." /><div className="crystal-generation-options"><label>AI Model<b>{renderer}</b></label><label>Quantity<b>1</b></label></div><label className="crystal-generation-toggle">A/T Pose <CircleHelp size={11} /><i /></label><label className="crystal-generation-toggle">HD Texture <i /></label><button className="crystal-generation-button" disabled={!prompt.trim() || loading} onClick={onGenerate}><Sparkles size={13} />{loading ? "Generating..." : "Generate 3D Model"}<strong>20</strong></button><small className="crystal-generation-estimate">Estimated time remaining: 1 min</small></section>
    <footer><label className="crystal-modeling-search"><Search size={16} /><input placeholder="Search..." /><kbd>⌘F</kbd></label><button className="crystal-modeling-user">Workspace account</button></footer>
  </aside>;
}
