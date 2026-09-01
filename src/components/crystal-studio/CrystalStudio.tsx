"use client";

import { Archive, ArrowLeft, ChevronDown, Globe2, Home, Menu, PanelLeftOpen, Plus, Search, Settings, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { generateModel } from "@/services/ai";
import Link from "next/link";
import { initialAssets } from "./data";
import { LeftSidebar } from "./LeftSidebar";
import { RightPanel } from "./RightPanel";
import { Timeline } from "./Timeline";
import type { MaterialName, RenderSettings, StudioAsset, StudioTool, Transform } from "./types";
import { Viewport } from "./Viewport";

function downloadFile(name: string, content: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function CrystalStudio() {
  const [dashboard, setDashboard] = useState(true);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [material, setMaterial] = useState<MaterialName>("Titanium");
  const [roughness, setRoughness] = useState(0.3);
  const [metallic, setMetallic] = useState(1);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<StudioTool>("orbit");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [assets, setAssets] = useState<StudioAsset[]>(initialAssets);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [resolution, setResolution] = useState("3840x2160");
  const [frameRate, setFrameRate] = useState("60 fps");
  const [color, setColor] = useState("#4A90D9");
  const [opacity, setOpacity] = useState(100);
  const [renderSettings, setRenderSettings] = useState<RenderSettings>({ resolution: "2560x1440", sampleCount: 256, exposure: 1.2 });
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, rotation: -8, scale: 1 });
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(300);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [alternateTheme, setAlternateTheme] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobileProfile, setMobileProfile] = useState(false);
  const uploadUrl = useRef<string | null>(null);
  const selectedAsset = useMemo(() => assets.find((asset) => asset.id === selectedAssetId), [assets, selectedAssetId]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setCurrent((frame) => frame >= end ? start : frame + 1),
      1000 / Math.max(1, Number.parseInt(frameRate)),
    );
    return () => window.clearInterval(timer);
  }, [playing, start, end, frameRate]);

  useEffect(() => () => { if (uploadUrl.current) URL.revokeObjectURL(uploadUrl.current); }, []);

  if (dashboard) return <div className="crystal-dashboard">
    <header><div className="crystal-dashboard-brand"><img src="/logo.png" alt="Crystal" className="crystal-brand-logo"/><b>Crystal</b></div><div className="crystal-window-controls">•••　—　×　□</div></header>
    <aside><button className="crystal-team"><span>B</span> My Team <ChevronDown size={17}/></button><label className="crystal-search"><Search size={16}/><input placeholder="Search" /></label><strong>Project</strong><nav><button className="active"><span>▦</span>All Projects</button><button><Globe2 size={16}/>Community</button><button><Archive size={16}/>Archive...</button><button onClick={() => setDashboard(false)}><Plus size={16}/>Project</button></nav><footer><span>▢　 Invite your team</span><button>Copy link</button></footer></aside>
    <main><div className="crystal-dashboard-title"><div><h1>♦ Crystal</h1><b>Recent</b></div><div><button className="crystal-sort">Last viewed　⌄</button><button className="crystal-new-project" onClick={() => setDashboard(false)}>New Project　<Plus size={16}/></button></div></div><div className="crystal-project-grid">{[{title:"Machinery - Turbbin", time:"Viewed 1mo ago"},{title:"Architecture Sketch",time:"Viewed 3mo ago"}].map((project) => <button key={project.title} onClick={() => setDashboard(false)} className="crystal-project-card"><div/><section><b>{project.title}</b><small>{project.time}</small><em>Free</em></section></button>)}</div></main>
  </div>;

  const handleUpload = (file: File) => {
    if (uploadUrl.current) URL.revokeObjectURL(uploadUrl.current);
    uploadUrl.current = URL.createObjectURL(file);
    setUploadedImage(uploadUrl.current);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true); setProgress(8); setError(null);
    const timer = window.setInterval(() => setProgress((value) => Math.min(92, value + 7)), 120);
    try {
      const asset = await generateModel(prompt);
      setProgress(100); setAssets((items) => [asset, ...items]); setSelectedAssetId(asset.id); setTransform({ x: 0, y: 0, rotation: -8, scale: 1 }); setPrompt("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Model generation failed.");
    } finally {
      window.clearInterval(timer); window.setTimeout(() => { setLoading(false); setProgress(0); }, 250);
    }
  };

  const handleExport = (format: string) => {
    const assetName = selectedAsset?.name ?? "crystal-model";
    const slug = assetName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const metadata = { asset: assetName, material, roughness, metallic, color, opacity, resolution, frameRate, renderSettings, transform, exportedAt: new Date().toISOString() };
    if (format === "STL File") downloadFile(`${slug}.stl`, `solid ${slug}\n facet normal 0 0 1\n  outer loop\n   vertex 0 0 0\n   vertex 1 0 0\n   vertex 0 1 0\n  endloop\n endfacet\nendsolid ${slug}`);
    else if (format === "STEP File") downloadFile(`${slug}.step`, `ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('Crystal mock STEP export'),'2;1');\nENDSEC;\nDATA;\n/* ${JSON.stringify(metadata)} */\nENDSEC;\nEND-ISO-10303-21;`);
    else if (format === "G-Code") downloadFile(`${slug}.gcode`, `; Crystal generated toolpath\nG21\nG90\nG0 X0 Y0 Z5\nG1 X20 Y0 Z0 F1200\nG1 X20 Y20\nG1 X0 Y20\nG1 X0 Y0\nM30`);
    else if (format === "Parameter Sheet (PDF)") downloadFile(`${slug}-parameters.pdf`, `%PDF-1.1\n% Crystal parameter sheet\n${JSON.stringify(metadata, null, 2)}\n%%EOF`, "application/pdf");
    else downloadFile(`${slug}-simulation-log.json`, JSON.stringify({ status: "completed", frames: end - start + 1, ...metadata }, null, 2), "application/json");
  };

  return (
    <div className={`crystal-studio crystal-studio-enter fixed inset-0 z-[90] grid overflow-hidden bg-[#191919] text-zinc-100 ${leftOpen ? "" : "crystal-left-closed"} ${rightOpen ? "" : "crystal-right-closed"} ${alternateTheme ? "crystal-alt-theme" : ""}`}>
      <header className="col-span-full flex h-16 items-center border-b border-[#303030] bg-[#202020] px-7">
        <div className="flex items-center gap-3"><img src="/logo.png" alt="Crystal" className="crystal-brand-logo"/><b className="text-[16px]">Crystal</b><button aria-label="Back to projects" onClick={() => setDashboard(true)} className="ml-6 text-zinc-200"><Home size={17}/></button></div>
        <nav aria-label="Application menu" className="relative ml-7 flex items-center gap-8 text-[12px] text-zinc-300">{["File", "Edit", "Tools", "Help", "View"].map((item) => <button key={item} onClick={() => setOpenMenu(openMenu === item ? null : item)} className={`transition hover:text-white ${openMenu === item ? "text-white" : ""}`}>{item}</button>)}{openMenu && <div className="absolute left-0 top-8 z-50 w-44 rounded-xl border border-white/10 bg-[#272727] p-1.5 shadow-2xl"><div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{openMenu}</div>{(openMenu === "File" ? ["New project", "Import asset", "Export scene"] : openMenu === "Edit" ? ["Undo", "Redo", "Preferences"] : openMenu === "Tools" ? ["Measure", "Transform", "Material tools"] : openMenu === "Help" ? ["Studio guide", "Keyboard shortcuts", "Contact support"] : ["Perspective view", "Orthographic view", "Reset view"]).map(action => <button key={action} onClick={() => setOpenMenu(null)} className="block w-full rounded-lg px-3 py-2 text-left text-[11px] text-zinc-200 hover:bg-[#3a3a3a]">{action}</button>)}</div>}</nav>
        <div className="ml-auto flex items-center gap-3"><button className="flex h-10 items-center gap-2 rounded-[12px] border border-zinc-400 px-3 text-[11px]">Starter <Zap size={17}/>200</button><Link href="/pricing" className="flex h-10 w-[124px] items-center justify-center gap-2 rounded-[11px] bg-[#1687f7] text-[12px] font-semibold text-white hover:bg-[#2d9bff]"><Zap size={19} fill="currentColor" />Go Pro</Link></div>
      </header>

      {!leftOpen && !rightOpen && <button aria-label="Show studio panels" onClick={() => { setLeftOpen(true); setRightOpen(true); }} className="absolute left-4 top-[76px] z-30 grid h-11 w-11 place-items-center rounded-[12px] border border-white/10 bg-[#252525] text-[#1687f7] shadow-xl"><PanelLeftOpen size={20} /></button>}
      {leftOpen && <LeftSidebar material={material} roughness={roughness} metallic={metallic} uploadedImage={uploadedImage} settingsOpen={settingsOpen} onMaterialChange={setMaterial} onRoughnessChange={setRoughness} onMetallicChange={setMetallic} onUpload={handleUpload} onRemoveImage={() => setUploadedImage(null)} onToggleSettings={() => setSettingsOpen((value) => !value)} onCollapse={() => { setLeftOpen(false); setRightOpen(false); }} />}
      <Viewport selectedAsset={selectedAsset} activeTool={activeTool} prompt={prompt} loading={loading} progress={progress} error={error} transform={transform} color={color} onToolChange={setActiveTool} onPromptChange={setPrompt} onGenerate={handleGenerate} onTransformChange={setTransform} onClearError={() => setError(null)} onAssetDrop={(id) => { setSelectedAssetId(id); setTransform({ x: 0, y: 0, rotation: -8, scale: 1 }); }} onColorChange={setColor} />
      {rightOpen && <RightPanel resolution={resolution} frameRate={frameRate} color={color} opacity={opacity} renderSettings={renderSettings} assets={assets} selectedAssetId={selectedAssetId} onResolutionChange={setResolution} onFrameRateChange={setFrameRate} onColorChange={setColor} onOpacityChange={setOpacity} onRenderChange={setRenderSettings} onSelectAsset={(id) => { setSelectedAssetId(id); setTransform({ x: 0, y: 0, rotation: -8, scale: 1 }); }} onDeleteAsset={(id) => { setAssets((items) => items.filter((item) => item.id !== id)); if (selectedAssetId === id) setSelectedAssetId(null); }} onExport={handleExport} onCollapse={() => { setLeftOpen(false); setRightOpen(false); }} />}
      <Timeline start={start} end={end} current={current} playing={playing} alternateTheme={alternateTheme} onStartChange={(value) => { setStart(value); setCurrent(Math.max(value, current)); }} onEndChange={(value) => { setEnd(Math.max(value, start + 1)); setCurrent(Math.min(value, current)); }} onCurrentChange={setCurrent} onPlayingChange={setPlaying} onThemeToggle={() => setAlternateTheme((value) => !value)} />
      <button aria-label="Mobile menu" onClick={() => { setMobileMenu(true); setMobileProfile(false); }} className="crystal-mobile-menu-trigger absolute left-3 top-3 hidden h-10 w-10 place-items-center rounded-full bg-[#303030] max-[700px]:grid"><Menu size={19} /></button>
      {mobileMenu && <div className="crystal-mobile-sheet">
        <div className="flex items-center justify-between"><img src="/logo.png" alt="Crystal" className="crystal-brand-logo crystal-brand-logo-mobile"/><button aria-label="Close menu" onClick={() => setMobileMenu(false)} className="grid h-11 w-11 place-items-center rounded-full bg-[#2a2a2a]"><ArrowLeft size={22}/></button></div>
        <button className="crystal-mobile-pro"><Zap size={20} fill="currentColor"/> <b>Try Crystal Pro</b><span>Pay Now</span></button>
        <label className="crystal-mobile-search"><Search size={19}/><input placeholder="Search" /></label>
        <nav className="crystal-mobile-nav"><button className="active">⠿　All Projects</button><button><Globe2 size={17}/>Community</button><button><Archive size={17}/>Archive...</button><button onClick={() => { setMobileMenu(false); setDashboard(true); }}><Plus size={17}/>Project</button></nav>
        <h2>Recents</h2><button className="crystal-mobile-recent">Architecture build house</button>
        <div className="mt-auto flex items-center justify-between"><button onClick={() => setMobileProfile(true)} className="grid h-13 w-13 place-items-center rounded-full bg-[#292929] text-sm">B</button><button onClick={() => setMobileProfile(true)} className="grid h-13 w-13 place-items-center rounded-full bg-[#292929]"><Settings size={23}/></button></div>
      </div>}
      {mobileProfile && <div className="crystal-mobile-profile">
        <button aria-label="Back to menu" onClick={() => setMobileProfile(false)} className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-[#272727]"><ArrowLeft size={22}/></button><h1>My Profile</h1>
        <div className="crystal-profile-user"><span>B</span><div><b>Iam</b><small>email@live.com</small></div></div>
        <section><b>Upgrade to Pro</b><p>Lorem ipsum dolor sit amet consectetur. Et sit nec habitant mauris.</p><button className="crystal-mobile-pro"><Zap size={17} fill="currentColor"/>Try Crystal Pro <span>Go Pro</span></button></section>
        {[['Account','Account Details','Billing & Subscription','Account Security'],['Crystal','My Creations','Projects','Generation History','Favorites'],['Preferences','Settings','Appearance'],['Support','Help & Support','Updates']].map(([title,...items]) => <section key={title}><b>{title}</b>{items.map(item => <button key={item}>{item}</button>)}</section>)}
        <button className="crystal-profile-signout">Sign Out</button>
      </div>}
    </div>
  );
}
