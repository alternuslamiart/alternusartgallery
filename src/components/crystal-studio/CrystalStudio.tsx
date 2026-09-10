"use client";

import { Archive, ArrowLeft, ChevronDown, Glasses, Globe2, Grid2X2, Home, Menu, PanelLeftOpen, Plus, Search, Settings, Share2, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { generateModel } from "@/services/ai";
import Link from "next/link";
import { initialAssets } from "./data";
import { LeftSidebar } from "./LeftSidebar";
import { RightPanel } from "./RightPanel";
import type { FloorPlanObject, MaterialName, RenderSettings, StudioAsset, StudioMode, StudioTool, Transform } from "./types";
import type { FloorPlanSettings } from "./types";
import { DEFAULT_FLOOR_PLAN_SETTINGS } from "./floor-plan-geometry";
import { floorPlanPaper, floorPlanSvg, svgToPdf } from "./floor-plan-export";
import { Viewport } from "./Viewport";
import { UnifiedSidebar } from "@/components/unified-sidebar";

function downloadFile(name: string, content: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function CrystalStudio({ initialDashboard = false }: { initialDashboard?: boolean } = {}) {
  // Opening /crystal should enter the modeling workspace immediately. The
  // project dashboard remains available from the Home control in the top bar.
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [dashboardSidebarCollapsed, setDashboardSidebarCollapsed] = useState(false);
  const router = useRouter();
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [material, setMaterial] = useState<MaterialName>("Titanium");
  const [roughness, setRoughness] = useState(0.3);
  const [metallic, setMetallic] = useState(1);
  const [renderer, setRenderer] = useState("Realtime");
  const [quality, setQuality] = useState("Standard");
  const [topology, setTopology] = useState("Auto");
  const [texture, setTexture] = useState("PBR");
  const [separateParts, setSeparateParts] = useState(false);
  const [imageEnhancement, setImageEnhancement] = useState(false);
  const [codeExecution, setCodeExecution] = useState(true);
  const [credits, setCredits] = useState(200);
  const [renderLoading, setRenderLoading] = useState(false);
  const [exporting, setExporting] = useState<string|null>(null);
  const [renderJobs, setRenderJobs] = useState<Array<{id:string;status:string}>>([]);
  const [dialog, setDialog] = useState<"credits"|"profile"|"signout"|null>(null);
  const [toast, setToast] = useState<string|null>(null);
  const [copied, setCopied] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<StudioTool>("orbit");
  const [incognito, setIncognito] = useState(false);
  const [studioMode, setStudioMode] = useState<StudioMode>("modeling");
  const [floorPlanObjects, setFloorPlanObjects] = useState<FloorPlanObject[]>([
    { id: "wall-exterior-top", type: "wall", start: { x: 0, y: 0 }, end: { x: 8, y: 0 }, thickness: 0.18 },
    { id: "wall-exterior-right", type: "wall", start: { x: 8, y: 0 }, end: { x: 8, y: 6 }, thickness: 0.18 },
    { id: "wall-exterior-bottom", type: "wall", start: { x: 8, y: 6 }, end: { x: 0, y: 6 }, thickness: 0.18 },
    { id: "wall-exterior-left", type: "wall", start: { x: 0, y: 6 }, end: { x: 0, y: 0 }, thickness: 0.18 },
    { id: "room-living", type: "room", x: 0.35, y: 0.35, width: 4.2, height: 3.1, label: "Living room" },
    { id: "room-kitchen", type: "room", x: 4.55, y: 0.35, width: 3.1, height: 2.35, label: "Kitchen" },
    { id: "room-bedroom", type: "room", x: 4.55, y: 2.7, width: 3.1, height: 2.95, label: "Bedroom" },
    { id: "door-entry", type: "door", x: 3.1, y: 6, width: 0.9, height: 0.12, rotation: 0 },
    { id: "window-living", type: "window", x: 0, y: 1.45, width: 0.12, height: 1.4, rotation: 90 },
  ]);
  const [selectedFloorPlanId, setSelectedFloorPlanId] = useState<string | null>(null);
  const [floorPlanSettings, setFloorPlanSettings] = useState<FloorPlanSettings>(DEFAULT_FLOOR_PLAN_SETTINGS);
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
  const [mobilePricing, setMobilePricing] = useState(false);
  const [pricingPlan, setPricingPlan] = useState("Basic");
  const [mobileSplash, setMobileSplash] = useState(true);
  const uploadUrl = useRef<string | null>(null);
  const sceneFileInput = useRef<HTMLInputElement>(null);
  const selectedAsset = useMemo(() => assets.find((asset) => asset.id === selectedAssetId), [assets, selectedAssetId]);
  const renderEstimate = useMemo(() => { const q={Draft:1,Standard:2,High:4,Ultra:7}[quality]??2; const pixels=renderSettings.resolution.startsWith("3840")?2:renderSettings.resolution.startsWith("2560")?1.4:1; const sample=Math.max(.5,renderSettings.sampleCount/256); return {minutes:Math.max(1,Math.ceil(q*pixels*sample)),cost:Math.max(10,Math.ceil(q*pixels*sample*18))}; },[quality,renderSettings]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setCurrent((frame) => frame >= end ? start : frame + 1),
      1000 / Math.max(1, Number.parseInt(frameRate)),
    );
    return () => window.clearInterval(timer);
  }, [playing, start, end, frameRate]);

  useEffect(() => () => { if (uploadUrl.current) URL.revokeObjectURL(uploadUrl.current); }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setMobileSplash(false), 1100);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const savedPrompt = window.sessionStorage.getItem("crystal-design-prompt");
    if (savedPrompt) {
      setPrompt(savedPrompt);
      window.sessionStorage.removeItem("crystal-design-prompt");
    }
  }, []);

  useEffect(() => { const presets:Record<string,RenderSettings>={Draft:{resolution:"1920x1080",sampleCount:64,exposure:1.2},Standard:{resolution:"2560x1440",sampleCount:256,exposure:1.2},High:{resolution:"3840x2160",sampleCount:512,exposure:1.2},Ultra:{resolution:"3840x2160",sampleCount:1024,exposure:1.2}}; setRenderSettings(presets[quality]??presets.Standard); },[quality]);
  useEffect(() => { if(!toast)return; const timer=window.setTimeout(()=>setToast(null),2800); return()=>window.clearTimeout(timer); },[toast]);
  useEffect(()=>{const close=(event:PointerEvent)=>{if(openMenu&&!(event.target as HTMLElement).closest("[aria-label='Application menu']"))setOpenMenu(null)};document.addEventListener("pointerdown",close);return()=>document.removeEventListener("pointerdown",close)},[openMenu]);

  if (dashboard) return <div className={`crystal-dashboard ${dashboardSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
    {mobileSplash && <div className="crystal-mobile-splash"><img src="/Logopng.png" alt="Crystal" /></div>}
    <header><div className="crystal-dashboard-brand"><img src="/Logopng.png" alt="Crystal" className="crystal-brand-logo"/><b>Crystal</b></div><div className="crystal-window-controls">•••　—　×　□</div></header>
    <UnifiedSidebar collapsed={dashboardSidebarCollapsed} onCollapse={() => setDashboardSidebarCollapsed((value) => !value)} activePath="/project" className="h-full" />
    <main><div className="crystal-dashboard-title"><div><h1>♦ Crystal</h1><b>Recent Projects</b></div><div><button className="crystal-sort">Last viewed　⌄</button><button className="crystal-new-project" onClick={() => router.push("/crystal")}>Launch Studio　<Plus size={16}/></button></div></div><div className="crystal-project-grid">{[{title:"Machinery - Turbbin", time:"Viewed 1mo ago", route:"/archplan"},{title:"Architecture Sketch",time:"Viewed 3mo ago", route:"/archplan"}].map((project) => <button key={project.title} onClick={() => router.push(project.route)} className="crystal-project-card"><div/><section><b>{project.title}</b><small>{project.time}</small><em>Free</em></section></button>)}</div></main>
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

  const handleExport = async (format: string) => {
    if (studioMode === "floor-plan") {
      const slug = "crystal-floor-plan";
      const scene = { version: 2, units: floorPlanSettings.unit, scale: `1:${floorPlanSettings.scale}`, precision: floorPlanSettings.precision, settings: floorPlanSettings, objects: floorPlanObjects, exportedAt: new Date().toISOString() };
      if (format === "JSON Scene") downloadFile(`${slug}.json`, JSON.stringify(scene, null, 2), "application/json");
      else {
        const svg = floorPlanSvg(floorPlanObjects, floorPlanSettings);
        const paper = floorPlanPaper(floorPlanObjects, floorPlanSettings);
        if (format === "SVG") downloadFile(`${slug}.svg`, svg, "image/svg+xml");
        else if (format === "PDF") downloadFile(`${slug}.pdf`, svgToPdf(floorPlanObjects, floorPlanSettings), "application/pdf");
        else {
          const image = new Image();
          image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
          await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Floor plan rasterization failed.")); });
          const dpi = 300;
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(paper.width / 25.4 * dpi);
          canvas.height = Math.round(paper.height / 25.4 * dpi);
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Floor plan canvas unavailable.");
          context.fillStyle = "#fafaf7";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const mime = format === "PNG" ? "image/png" : "image/jpeg";
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, mime, .95));
          if (!blob) throw new Error("Floor plan raster export failed.");
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = `${slug}.${format === "PNG" ? "png" : "jpg"}`;
          anchor.click();
          URL.revokeObjectURL(url);
        }
      }
      setToast(`${format} export ready.`);
      return;
    }
    if (!selectedAsset) { setToast("Add or select an asset before exporting."); return; }
    setExporting(format);
    const assetName = selectedAsset?.name ?? "crystal-model";
    const slug = assetName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const metadata = { asset: assetName, material, roughness, metallic, color, opacity, resolution, frameRate, renderSettings, transform, exportedAt: new Date().toISOString() };
    try {
    const response=await fetch("/api/export",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({asset:assetName,format})});if(!response.ok)throw new Error("Export failed");
    if (format === "JPEG & PNG") {
      const canvas = document.querySelector<HTMLCanvasElement>('canvas[aria-label="Interactive 3D perspective grid"]');
      if (!canvas) throw new Error("Viewport unavailable");
      ["image/png", "image/jpeg"].forEach((type) => canvas.toBlob((blob) => { if (!blob) return; const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${slug}-viewport.${type === "image/png" ? "png" : "jpg"}`; anchor.click(); URL.revokeObjectURL(url); }, type, .94));
    } else if (format === "STL File") downloadFile(`${slug}.stl`, `solid ${slug}\n facet normal 0 0 1\n  outer loop\n   vertex 0 0 0\n   vertex 1 0 0\n   vertex 0 1 0\n  endloop\n endfacet\nendsolid ${slug}`);
    else if (format === "STEP File") downloadFile(`${slug}.step`, `ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('Crystal mock STEP export'),'2;1');\nENDSEC;\nDATA;\n/* ${JSON.stringify(metadata)} */\nENDSEC;\nEND-ISO-10303-21;`);
    else if (format === "G-Code") downloadFile(`${slug}.gcode`, `; Crystal generated toolpath\nG21\nG90\nG0 X0 Y0 Z5\nG1 X20 Y0 Z0 F1200\nG1 X20 Y20\nG1 X0 Y20\nG1 X0 Y0\nM30`);
    else if (format === "Parameter Sheet (PDF)") downloadFile(`${slug}-parameters.pdf`, `%PDF-1.1\n% Crystal parameter sheet\n${JSON.stringify(metadata, null, 2)}\n%%EOF`, "application/pdf");
    else downloadFile(`${slug}-simulation-log.json`, JSON.stringify({ status: "completed", frames: end - start + 1, ...metadata }, null, 2), "application/json");
    setToast(`${format} export ready.`);
    } catch { setToast("Export failed. Please try again."); } finally { setExporting(null); }
  };

  const handleRender = async () => {
    if(!selectedAsset){setToast("Add or select an asset before rendering.");return} if(credits<renderEstimate.cost){setToast("Not enough credits.");return}
    setRenderLoading(true); const id=crypto.randomUUID(); setRenderJobs(j=>[{id,status:"Queued"},...j]);
    try{setRenderJobs(j=>j.map(x=>x.id===id?{...x,status:"Rendering"}:x)); const response=await fetch("/api/render",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({asset:selectedAsset.name,...renderSettings})}); if(!response.ok)throw new Error(); setCredits(c=>c-renderEstimate.cost); setRenderJobs(j=>j.map(x=>x.id===id?{...x,status:"Done"}:x)); setToast("Render completed and added to the queue.");}catch{setRenderJobs(j=>j.map(x=>x.id===id?{...x,status:"Failed"}:x));setToast("Render failed. Please try again.");}finally{setRenderLoading(false)}
  };
  const menuItems:Record<string,string[]>={File:["New Scene","Open","Save","Save As","Export","Import","Recent Files"],Edit:["Undo  Ctrl+Z","Redo  Ctrl+Y","Cut","Copy","Paste","Duplicate","Delete","Select All","Preferences"],Tools:["Move","Rotate","Scale","Measure","Snap"],Help:["Documentation","Keyboard Shortcuts","Report a Bug","About"],View:["Toggle Grid","Toggle Axis Gizmo","Wireframe Mode","Front Camera","Top Camera","Side Camera","Perspective","Fullscreen"]};
  const openScene = (file: File) => { void file.text().then(raw => { const saved = JSON.parse(raw) as Partial<{ assets: StudioAsset[]; material: MaterialName; roughness: number; metallic: number; renderSettings: RenderSettings; floorPlanObjects: FloorPlanObject[]; floorPlanSettings: FloorPlanSettings; settings: FloorPlanSettings; units: FloorPlanSettings["unit"]; scale: string; precision: number }>; if (saved.assets) setAssets(saved.assets); if (saved.material) setMaterial(saved.material); if (typeof saved.roughness === "number") setRoughness(saved.roughness); if (typeof saved.metallic === "number") setMetallic(saved.metallic); if (saved.renderSettings) setRenderSettings(saved.renderSettings); if (saved.floorPlanObjects) setFloorPlanObjects(saved.floorPlanObjects); const settings = saved.floorPlanSettings ?? saved.settings ?? { ...DEFAULT_FLOOR_PLAN_SETTINGS, unit: saved.units ?? DEFAULT_FLOOR_PLAN_SETTINGS.unit, scale: Number(saved.scale?.split(":").pop()) || DEFAULT_FLOOR_PLAN_SETTINGS.scale, precision: saved.precision ?? DEFAULT_FLOOR_PLAN_SETTINGS.precision }; setFloorPlanSettings({ ...DEFAULT_FLOOR_PLAN_SETTINGS, ...settings }); setToast("Scene opened."); }).catch(() => setToast("Could not open scene.")); };
  const runMenuAction=(raw:string)=>{const action=raw.split("  ")[0];setOpenMenu(null);if(action==="New Scene"){setAssets(initialAssets);setSelectedAssetId(null);setToast("New scene created.")}else if(action==="Open"){sceneFileInput.current?.click()}else if(action==="Save"||action==="Save As"){localStorage.setItem("crystal-studio-state",JSON.stringify({assets,material,roughness,metallic,renderSettings,floorPlanObjects,floorPlanSettings}));setToast("Scene saved locally.")}else if(action==="Delete"&&selectedAssetId){setAssets(x=>x.filter(a=>a.id!==selectedAssetId));setSelectedAssetId(null);setToast("Asset deleted.")}else if(action==="Duplicate"&&selectedAsset){setAssets(x=>[{...selectedAsset,id:crypto.randomUUID(),name:`${selectedAsset.name} Copy`},...x]);setToast("Asset duplicated.")}else if(["Move","Rotate","Scale"].includes(action)){setActiveTool(action.toLowerCase() as StudioTool);setToast(`${action} tool active.`)}else if(action==="Fullscreen"){document.documentElement.requestFullscreen?.();}else if(action==="Export"){handleExport("glTF 2.0")}else setToast(`${action} selected.`)};

  return (
    <div className={`crystal-studio crystal-studio-enter fixed inset-0 z-[90] grid overflow-hidden bg-[#191919] text-zinc-100 ${leftOpen ? "" : "crystal-left-closed"} ${rightOpen ? "" : "crystal-right-closed"} ${alternateTheme ? "crystal-alt-theme" : ""}`}>
      {mobileSplash && <div className="crystal-mobile-splash"><img src="/Logopng.png" alt="Crystal" /></div>}
      <input ref={sceneFileInput} type="file" accept="application/json,.json" className="sr-only" onChange={event => { const file = event.target.files?.[0]; if (file) openScene(file); event.currentTarget.value = ""; }} />
      <header className="crystal-topbar col-span-full flex h-16 items-center border-b border-[#292929] bg-[#0F0F0F] px-7">
        <div className="flex items-center gap-3"><img src="/Logopng.png" alt="Crystal" className="crystal-brand-logo"/><b className="text-[18px] tracking-[-0.02em] text-zinc-100">Crystal</b><span className="mx-1 h-5 w-px bg-[#303030]" aria-hidden="true"/><button aria-label="Back to projects" onClick={() => router.push("/project")} className="crystal-home-button grid h-9 w-9 place-items-center rounded-[9px] text-zinc-300"><Home size={18}/></button></div>
        <nav aria-label="Application menu" className="crystal-app-menu relative ml-7 flex h-full items-center gap-1 text-[13px] text-zinc-400">{["File", "Edit", "Tools", "Help", "View"].map((item) => <button aria-expanded={openMenu===item} key={item} onClick={() => setOpenMenu(openMenu === item ? null : item)} className={`crystal-menu-item h-9 rounded-[8px] px-3 transition ${openMenu === item ? "is-open text-white" : ""}`}>{item}</button>)}{openMenu && <div className="absolute left-0 top-[52px] z-50 w-52 rounded-[12px] border border-white/10 bg-[#242424] p-1.5 shadow-2xl"><div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{openMenu}</div>{menuItems[openMenu].map(action => <button key={action} onClick={() => runMenuAction(action)} className="block w-full rounded-lg px-3 py-2 text-left text-[11px] text-zinc-200 hover:bg-[#353535]">{action}</button>)}</div>}</nav>
        <div className="ml-3 flex h-10 items-center rounded-full border border-[#303030] bg-[#202020] p-1" role="group" aria-label="Studio mode">
          <button type="button" aria-pressed={studioMode === "floor-plan"} onClick={() => { setStudioMode("floor-plan"); setOpenMenu(null); }} className={`h-8 rounded-full px-3 text-[11px] font-semibold transition ${studioMode === "floor-plan" ? "bg-[#1687f7] text-white shadow-[0_3px_10px_rgba(22,135,247,.28)]" : "text-zinc-400 hover:text-white"}`}>Floor plan</button>
          <button type="button" aria-pressed={studioMode === "modeling"} onClick={() => { setStudioMode("modeling"); setOpenMenu(null); }} className={`h-8 rounded-full px-3 text-[11px] font-semibold transition ${studioMode === "modeling" ? "bg-[#3b3b3b] text-white" : "text-zinc-400 hover:text-white"}`}>Modeling</button>
        </div>
        <div className="ml-auto flex items-center gap-2.5"><button onClick={()=>setDialog("credits")} className="crystal-credit-button flex h-10 items-center gap-2 rounded-[11px] border border-[#666] px-3 text-[11px] text-zinc-200">Starter <Zap size={16}/>{credits}</button><Link href="/pricing" className="crystal-pro-button flex h-10 w-[124px] items-center justify-center gap-2 rounded-[10px] bg-[#1687f7] text-[12px] font-semibold text-white"><Zap size={18} fill="currentColor" />Go Pro</Link></div>
      </header>

      {!leftOpen && !rightOpen && <div className="absolute left-4 top-[76px] z-30 flex items-center gap-2 rounded-[18px] bg-[#171717] p-2 shadow-[0_8px_22px_rgba(0,0,0,.3)]"><button type="button" aria-label="Copy studio link" title="Copy studio link" onClick={() => void navigator.clipboard?.writeText(window.location.href)} className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#303030] text-zinc-100 transition hover:bg-[#3b3b3b]"><Share2 size={21} strokeWidth={2.4}/></button><button type="button" aria-label="Show studio panels" title="Show sidebars" onClick={() => { setLeftOpen(true); setRightOpen(true); }} className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#1687f7] text-white shadow-[0_4px_14px_rgba(22,135,247,.25)] transition hover:bg-[#2d9bff]"><PanelLeftOpen size={20} strokeWidth={2.4} /></button></div>}
      {leftOpen && <LeftSidebar floorPlanMode={studioMode === "floor-plan"} floorPlanSettings={floorPlanSettings} onFloorPlanSettingsChange={setFloorPlanSettings} material={material} roughness={roughness} metallic={metallic} renderer={renderer} quality={quality} topology={topology} texture={texture} separateParts={separateParts} imageEnhancement={imageEnhancement} codeExecution={codeExecution} estimatedMinutes={renderEstimate.minutes} estimatedCost={renderEstimate.cost} credits={credits} renderLoading={renderLoading} uploadedImage={uploadedImage} settingsOpen={settingsOpen} onMaterialChange={setMaterial} onRoughnessChange={setRoughness} onMetallicChange={setMetallic} onRendererChange={setRenderer} onQualityChange={setQuality} onTopologyChange={setTopology} onTextureChange={setTexture} onSeparatePartsChange={setSeparateParts} onImageEnhancementChange={setImageEnhancement} onCodeExecutionChange={setCodeExecution} onRender={handleRender} onProfile={()=>setDialog("profile")} onSignOut={()=>setDialog("signout")} onUpload={handleUpload} onRemoveImage={() => setUploadedImage(null)} onToggleSettings={() => setSettingsOpen((value) => !value)} onCollapse={() => { setLeftOpen(false); setRightOpen(false); }} />}
      <Viewport renderer={renderer} selectedAsset={selectedAsset} activeTool={activeTool} prompt={prompt} loading={loading} progress={progress} error={error} transform={transform} color={color} roughness={roughness} metallic={metallic} incognito={incognito} studioMode={studioMode} onStudioModeChange={setStudioMode} floorPlanObjects={floorPlanObjects} selectedFloorPlanId={selectedFloorPlanId} floorPlanSettings={floorPlanSettings} onFloorPlanSettingsChange={setFloorPlanSettings} onFloorPlanObjectsChange={setFloorPlanObjects} onSelectFloorPlanObject={setSelectedFloorPlanId} onToolChange={setActiveTool} onPromptChange={setPrompt} onGenerate={handleGenerate} onTransformChange={setTransform} onClearError={() => setError(null)} onSelectAsset={(id) => setSelectedAssetId(id || null)} onCreateObject={() => { const source = selectedAsset ?? initialAssets[0]; const id = crypto.randomUUID(); setAssets((items) => [{ ...source, id, name: `${source.name} ${items.length + 1}`, createdAt: new Date().toISOString() }, ...items]); setSelectedAssetId(id); }} onAssetDrop={(id) => { setSelectedAssetId(id || null); if (id) setTransform({ x: 0, y: 0, rotation: -8, scale: 1 }); }} onColorChange={setColor} onOpenPricing={() => setMobilePricing(true)} onSnapshot={()=>handleExport("JPEG & PNG")} />
      {rightOpen && <RightPanel resolution={resolution} frameRate={frameRate} color={color} opacity={opacity} renderSettings={renderSettings} assets={assets} selectedAssetId={selectedAssetId} exporting={exporting} floorPlanMode={studioMode === "floor-plan"} floorPlanSettings={floorPlanSettings} onFloorPlanSettingsChange={setFloorPlanSettings} selectedFloorPlanObject={floorPlanObjects.find((object) => object.id === selectedFloorPlanId)} onUpdateFloorPlanObject={(updated) => setFloorPlanObjects((objects) => objects.map((object) => object.id === updated.id ? updated : object))} onDeleteFloorPlanObject={(id) => { setFloorPlanObjects((objects) => objects.filter((object) => object.id !== id)); setSelectedFloorPlanId(null); }} onResolutionChange={setResolution} onFrameRateChange={setFrameRate} onColorChange={setColor} onOpacityChange={setOpacity} onRenderChange={setRenderSettings} onSelectAsset={(id) => { setSelectedAssetId(id); setTransform({ x: 0, y: 0, rotation: -8, scale: 1 }); }} onDeleteAsset={(id) => { setAssets((items) => items.filter((item) => item.id !== id)); if (selectedAssetId === id) setSelectedAssetId(null); }} onExport={handleExport} onCollapse={() => { setLeftOpen(false); setRightOpen(false); }} />}
      <button aria-label="Mobile menu" onClick={() => { setMobileMenu(true); setMobileProfile(false); }} className="crystal-mobile-menu-trigger absolute left-3 top-3 hidden h-10 w-10 place-items-center rounded-full bg-[#303030] max-[700px]:grid"><Grid2X2 size={21} /></button>
      <button type="button" aria-label="Toggle Incognito mode" aria-pressed={incognito} title={incognito ? "Incognito mode active" : "Enable Incognito mode"} onClick={() => setIncognito(value => !value)} className={`crystal-mobile-incognito absolute right-3 top-3 hidden h-10 w-10 place-items-center rounded-full bg-[#303030] max-[700px]:grid ${incognito ? "is-active" : ""}`}><Glasses size={22} /></button>
      {mobileMenu && <div className="crystal-mobile-sheet">
        <div className="flex items-center justify-between"><img src="/Logopng.png" alt="Crystal" className="crystal-brand-logo crystal-brand-logo-mobile"/><button aria-label="Close menu" onClick={() => setMobileMenu(false)} className="grid h-11 w-11 place-items-center rounded-full bg-[#2a2a2a]"><ArrowLeft size={22}/></button></div>
        <button onClick={() => setMobilePricing(true)} className="crystal-mobile-pro"><Zap size={20} fill="currentColor"/> <b>Try Crystal Pro</b><span>Pay Now</span></button>
        <label className="crystal-mobile-search"><Search size={19}/><input placeholder="Search" /></label>
        <nav className="crystal-mobile-nav"><button className="active">⠿　All Projects</button><button><Globe2 size={17}/>Community</button><button><Archive size={17}/>Archive...</button><button onClick={() => { setMobileMenu(false); setDashboard(true); }}><Plus size={17}/>Project</button></nav>
        <h2>Recents</h2><button className="crystal-mobile-recent">Architecture build house</button>
        <div className="mt-auto flex items-center justify-between"><button onClick={() => setMobileProfile(true)} className="grid h-13 w-13 place-items-center rounded-full bg-[#292929] text-sm">B</button><button onClick={() => setMobileProfile(true)} className="grid h-13 w-13 place-items-center rounded-full bg-[#292929]"><Settings size={23}/></button></div>
      </div>}
      {mobileProfile && <div className="crystal-mobile-profile">
        <button aria-label="Back to menu" onClick={() => setMobileProfile(false)} className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-[#272727]"><ArrowLeft size={22}/></button><h1>My Profile</h1>
        <div className="crystal-profile-user"><span>B</span><div><b>Iam</b><small>email@live.com</small></div></div>
        <section><b>Upgrade to Pro</b><p>Lorem ipsum dolor sit amet consectetur. Et sit nec habitant mauris.</p><button onClick={() => setMobilePricing(true)} className="crystal-mobile-pro"><Zap size={17} fill="currentColor"/>Try Crystal Pro <span>Go Pro</span></button></section>
        {[['Account','Account Details','Billing & Subscription','Account Security'],['Crystal','My Creations','Projects','Generation History','Favorites'],['Preferences','Settings','Appearance'],['Support','Help & Support','Updates']].map(([title,...items]) => <section key={title}><b>{title}</b>{items.map(item => <button key={item}>{item}</button>)}</section>)}
        <button className="crystal-profile-signout">Sign Out</button>
      </div>}
      {mobilePricing && <div className="crystal-mobile-pricing">
        <button aria-label="Back to studio" onClick={() => setMobilePricing(false)} className="grid h-11 w-11 place-items-center rounded-full bg-[#272727]"><ArrowLeft size={22}/></button>
        <h1>Try <em>Crystal</em> Pro Plan</h1><p>Try for $0.00 for 7 Days</p>
        <div className="crystal-pricing-tabs">{["Basic","Pro","Teams","Studio"].map(plan=><button key={plan} onClick={() => setPricingPlan(plan)} className={pricingPlan===plan?"active":""}>{plan}</button>)}</div>
        <div className="crystal-pricing-cycle"><button className="active">Monthly</button><button>Yearly 25% off</button></div>
        <div className="crystal-pricing-cards">{[{name:"Basic",price:"$5",cta:"Start Basic"},{name:"Pro",price:"$19",cta:"Upgrade to Pro"},{name:"Teams",price:"$39",cta:"Start Team trial"},{name:"Studio",price:"$100",cta:"Upgrade to Studio"}].map(plan=><article key={plan.name} className={pricingPlan===plan.name?"selected":""}><h2>{plan.name} Plan</h2><p>For starting with Crystal and running a single workspace.</p><strong>{plan.price}<small>/mo, billed yearly</small></strong><ul><li>1 personal workspace</li><li>Claude Haiku agent</li><li>5 GB knowledge layer</li><li>Mail · Files · Notes</li><li>Community support</li></ul><button onClick={() => setPricingPlan(plan.name)}>{plan.cta}</button></article>)}</div>
      </div>}
      {toast && <div role="status" className="fixed bottom-14 left-1/2 z-[110] -translate-x-1/2 rounded-xl border border-[#4A90D9]/40 bg-[#202020] px-5 py-3 text-xs shadow-2xl">{toast}</div>}
      {dialog && <div role="dialog" aria-modal="true" className="fixed inset-0 z-[105] grid place-items-center bg-black/65 p-5 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#252525] p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{dialog==="credits"?"Starter plan":dialog==="profile"?"User account":"Sign out"}</h2><button aria-label="Close dialog" onClick={()=>setDialog(null)} className="rounded-lg px-3 py-1 text-zinc-400 hover:bg-white/10">×</button></div>{dialog==="credits"&&<><p className="mt-3 text-sm text-zinc-400">Current credit balance</p><div className="mt-2 flex items-center gap-2 text-3xl font-bold"><Zap className="text-[#4A90D9]"/>{credits}</div><div className="mt-5 space-y-2">{renderJobs.length?renderJobs.slice(0,5).map(job=><div key={job.id} className="flex justify-between rounded-lg bg-[#303030] px-3 py-2 text-xs"><span>Render {job.id.slice(0,6)}</span><span className="text-[#74adff]">{job.status}</span></div>):<p className="text-xs text-zinc-500">No render usage yet.</p>}</div><Link href="/pricing" className="mt-5 flex h-10 items-center justify-center rounded-lg bg-[#4A90D9] text-sm font-semibold">Upgrade plan</Link></>}{dialog==="profile"&&<div className="mt-4 grid gap-2">{["Profile","Settings","Billing"].map(x=><button key={x} onClick={()=>setToast(`${x} opened`)} className="rounded-lg bg-[#303030] px-4 py-3 text-left text-sm hover:bg-[#383838]">{x}</button>)}</div>}{dialog==="signout"&&<><p className="mt-4 text-sm text-zinc-400">Are you sure you want to sign out?</p><div className="mt-5 flex gap-2"><button onClick={()=>setDialog(null)} className="h-10 flex-1 rounded-lg bg-[#363636]">Cancel</button><button onClick={()=>{localStorage.removeItem("crystal-studio-state");location.href="/login"}} className="h-10 flex-1 rounded-lg bg-red-600">Sign Out</button></div></>}</div></div>}
    </div>
  );
}
