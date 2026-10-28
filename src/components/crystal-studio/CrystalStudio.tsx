"use client";

import { Archive, ArrowLeft, ArrowRight, BookOpen, Box, ChevronDown, FilePlus2, Glasses, Globe2, Grid2X2, Home, Image as ImageIcon, PanelLeftOpen, Paperclip, Play, Plus, Search, Settings, Share2, Sparkles, Wand2, Zap } from "lucide-react";
import NextImage from "next/image";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { generateModel } from "@/services/ai";
import Link from "next/link";
import { initialAssets } from "./data";
import { LeftSidebar } from "./LeftSidebar";
import { InteriorSceneSidebar } from "./InteriorSceneSidebar";
import { RightPanel } from "./RightPanel";
import type { FloorPlanObject, MaterialName, RenderSettings, StudioAsset, StudioMode, StudioTool, Transform } from "./types";
import type { FloorPlanSettings } from "./types";
import { DEFAULT_FLOOR_PLAN_SETTINGS, floorPlanHistoryReducer } from "./floor-plan-geometry";
import {exportSketch} from './sketch-export';
import {createSketch,sketchHistory,normalizeSketch} from '@/lib/sketch.mjs';
import {useSketchProject} from './useSketchProject';
import { Viewport } from "./Viewport";
import { UnifiedSidebar } from "@/components/unified-sidebar";
import { ModelingSidebar } from "./ModelingSidebar";
import { CrystalThemeToggle } from "./CrystalThemeToggle";
import { useCrystalTheme } from "@/lib/crystal-theme";
import { useSession } from "next-auth/react";
import { STUDIO_ROUTES, type StudioAction } from "@/lib/studio-actions.mjs";
import { parseFloorPlanRecovery } from "@/lib/floor-plan-recovery.mjs";
import { navigateStudioRoute } from "./StudioActions";

function downloadFile(name: string, content: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function CrystalStudio({
  initialDashboard = false,
  embedded = false,
  dedicated = false,
  initialStudioMode = "modeling",
  insetPanels = false,
}: {
  initialDashboard?: boolean;
  embedded?: boolean;
  dedicated?: boolean;
  initialStudioMode?: StudioMode;
  insetPanels?: boolean;
} = {}) {
  // Opening /casynus or /interior should enter the active workspace immediately.
  // The project dashboard remains available from the Home control.
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [dashboardSidebarCollapsed, setDashboardSidebarCollapsed] = useState(false);
  const router = useRouter();
  const {data:session,status:sessionStatus}=useSession();
  const recoveryIdentity=session?.user?.id??session?.user?.email??(sessionStatus==='loading'?'loading':'guest');
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
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<StudioTool>("orbit");
  const [incognito, setIncognito] = useState(false);
  const [studioMode, setStudioMode] = useState<StudioMode>(initialStudioMode);
  useEffect(() => {
    if (
      window.location.pathname === "/interior" ||
      new URLSearchParams(window.location.search).get("mode") === "floor-plan"
    ) {
      setStudioMode("floor-plan");
    }
  }, []);
  const switchStudioMode = (nextMode: StudioMode) => {
    if (insetPanels && nextMode === "modeling") { router.push("/casynus"); return; }
    setStudioMode(nextMode);
    if (typeof window !== "undefined") {
      if (nextMode === "floor-plan") {
        window.history.replaceState({}, "", "/interior");
      } else {
        window.history.replaceState({}, "", "/casynus");
      }
    }
  };
  const [floorPlanHistory, dispatchFloorPlan] = useReducer(floorPlanHistoryReducer, { past: [], future: [], present: [
    { id: "wall-exterior-top", type: "wall", start: { x: 0, y: 0 }, end: { x: 8, y: 0 }, thickness: 0.18 },
    { id: "wall-exterior-right", type: "wall", start: { x: 8, y: 0 }, end: { x: 8, y: 6 }, thickness: 0.18 },
    { id: "wall-exterior-bottom", type: "wall", start: { x: 8, y: 6 }, end: { x: 0, y: 6 }, thickness: 0.18 },
    { id: "wall-exterior-left", type: "wall", start: { x: 0, y: 6 }, end: { x: 0, y: 0 }, thickness: 0.18 },
    { id: "room-living", type: "room", x: 0.35, y: 0.35, width: 4.2, height: 3.1, label: "Living room" },
    { id: "room-kitchen", type: "room", x: 4.55, y: 0.35, width: 3.1, height: 2.35, label: "Kitchen" },
    { id: "room-bedroom", type: "room", x: 4.55, y: 2.7, width: 3.1, height: 2.95, label: "Bedroom" },
    { id: "door-entry", type: "door", x: 3.1, y: 6, width: 0.9, height: 0.18, rotation: 180, side: "right", swing: "in" },
    { id: "window-living", type: "window", x: 0, y: 1.45, width: 1.4, height: .18, rotation: 90, windowType: "double" },
  ] });
  const floorPlanObjects = floorPlanHistory.present;
  const setFloorPlanObjects = (next: FloorPlanObject[] | ((previous: FloorPlanObject[]) => FloorPlanObject[])) => dispatchFloorPlan({ type: "commit", next });
  useEffect(() => {
    if (studioMode !== "floor-plan") return;
    const handler = (event: KeyboardEvent) => {
      if(event.defaultPrevented)return;
      if ((event.target as HTMLElement)?.closest("input,textarea,select,[contenteditable=true]")) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        dispatchFloorPlan({ type: event.shiftKey ? "redo" : "undo" });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [studioMode]);
  const [hoveredFloorPlanId,setHoveredFloorPlanId]=useState<string|null>(null);
  const [pencilMode,setPencilMode]=useState(false);
  const pencilActive=pencilMode&&studioMode==='floor-plan';
  const [floorPlanName, setFloorPlanName] = useState("Untitled project");
  const [selectedFloorPlanId, setSelectedFloorPlanId] = useState<string | null>(null);
  const [floorPlanSettings, setFloorPlanSettings] = useState<FloorPlanSettings>(DEFAULT_FLOOR_PLAN_SETTINGS);
  const [drawingHistory,dispatchDrawing]=useReducer(sketchHistory,{past:[],present:createSketch(),future:[]});
  const sketch=drawingHistory.present;
  const planSnapshot=useMemo(()=>({version:1 as const,name:floorPlanName,objects:floorPlanObjects,settings:floorPlanSettings,sketch}),[floorPlanName,floorPlanObjects,floorPlanSettings,sketch]);
  const sketchProject=useSketchProject(recoveryIdentity,studioMode==='floor-plan',sessionStatus==='authenticated',planSnapshot,saved=>{
    dispatchFloorPlan({type:'replace',next:saved.objects});setFloorPlanName(saved.name);setFloorPlanSettings(saved.settings);dispatchDrawing({type:'replace',next:saved.sketch??createSketch()});setSelectedFloorPlanId(null);
  });
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
  const start = 0;
  const end = 300;
  const { theme } = useCrystalTheme();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [contextSubmenu, setContextSubmenu] = useState<"widget" | "plugins" | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobileProfile, setMobileProfile] = useState(false);
  const [mobilePricing, setMobilePricing] = useState(false);
  const [mobileHome, setMobileHome] = useState(initialStudioMode!=='floor-plan');
  const [mobileViewport, setMobileViewport] = useState(false);
  const [mobileModelSheet, setMobileModelSheet] = useState(false);
  const [mobileWorkspace, setMobileWorkspace] = useState<"floor-plan" | "modeling" | "images">("images");
  const [mobileModel, setMobileModel] = useState("Nano Banana");
  const [pricingPlan, setPricingPlan] = useState("Basic");
  const [mobileSplash, setMobileSplash] = useState(true);
  const uploadUrl = useRef<string | null>(null);
  const sceneFileInput = useRef<HTMLInputElement>(null);
  const selectedAsset = useMemo(() => assets.find((asset) => asset.id === selectedAssetId), [assets, selectedAssetId]);
  const renderEstimate = useMemo(() => { const q={Draft:1,Standard:2,High:4,Ultra:7}[quality]??2; const pixels=renderSettings.resolution.startsWith("3840")?2:renderSettings.resolution.startsWith("2560")?1.4:1; const sample=Math.max(.5,renderSettings.sampleCount/256); return {minutes:Math.max(1,Math.ceil(q*pixels*sample)),cost:Math.max(10,Math.ceil(q*pixels*sample*18))}; },[quality,renderSettings]);

  useEffect(() => () => { if (uploadUrl.current) URL.revokeObjectURL(uploadUrl.current); }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setMobileSplash(false), 1100);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const breakpoint = window.matchMedia("(max-width: 700px)");
    const updateViewport = () => setMobileViewport(breakpoint.matches);
    updateViewport();
    breakpoint.addEventListener("change", updateViewport);
    return () => breakpoint.removeEventListener("change", updateViewport);
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

  if (dashboard && !mobileViewport) return <div className={`crystal-dashboard ${dashboardSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
    {mobileSplash && <div className="crystal-mobile-splash"><img src="/Logopng.png" alt="Casynus" /></div>}
    <header className="crystal-dashboard-header"><div className="crystal-dashboard-brand"><img src="/Logopng.png" alt="Casynus" className="crystal-brand-logo"/><b>Casynus</b><Link href="/project" aria-label="Home" className="crystal-dashboard-home"><Home size={16} /></Link></div><div className="crystal-window-controls">•••　—　×　□</div></header>
    <UnifiedSidebar collapsed={dashboardSidebarCollapsed} onCollapse={() => setDashboardSidebarCollapsed((value) => !value)} activePath="/project" className="h-full" />
    <main><div className="crystal-dashboard-title"><div><h1>♦ Casynus</h1><b>Recent Projects</b></div><div><button className="crystal-sort">Last viewed　⌄</button><button className="crystal-new-project" onClick={() => router.push("/casynus")}>New Project　<Plus size={16}/></button></div></div><div className="crystal-project-grid">{[{title:"Machinery - Turbbin", time:"Viewed 1mo ago", route:"/casynus", image:"/Section/wave0.jpg"},{title:"Architecture Sketch", time:"Viewed 3mo ago", route:"/casynus", image:"/Section/wave1.webp"},{title:"Urban Infrastructure", time:"Viewed 4mo ago", route:"/casynus", image:"/Section/wave2.jpg"}].map((project) => <button key={project.title} onClick={() => router.push(project.route)} className="crystal-project-card"><div style={{ backgroundImage: `url(${project.image})`, backgroundSize: "cover", backgroundPosition: "center", position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }} /><section style={{ position: "absolute", left: "8px", right: "8px", bottom: "8px", zIndex: 2, background: "rgba(24, 24, 27, 0.82)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderRadius: "15px", border: "1px solid rgba(255, 255, 255, 0.1)", padding: "14px 18px", display: "grid", gap: "4px" }}><b>{project.title}</b><small>{project.time}</small><em>Free</em></section></button>)}</div></main>
  </div>;

  const handleUpload = (file: File) => {
    if (uploadUrl.current) URL.revokeObjectURL(uploadUrl.current);
    uploadUrl.current = URL.createObjectURL(file);
    setUploadedImage(uploadUrl.current);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    window.dispatchEvent(new CustomEvent("crystal:studio-generation-start", { detail: prompt }));
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
      setExporting(format);
      try{
        const slug=floorPlanName.replace(/[^a-z0-9_-]/gi,'_')||'Sketch';
        if(format==='JSON Scene')downloadFile(`${slug}.json`,JSON.stringify({...planSnapshot,id:sketchProject.id},null,2),'application/json');
        else{const output=await exportSketch(format==='JPEG & PNG'?'PNG':format,floorPlanObjects,floorPlanSettings,sketch),url=URL.createObjectURL(output),link=document.createElement('a');link.href=url;link.download=`${slug}.${format==='JPEG'?'jpg':format==='JPEG & PNG'?'png':format.toLowerCase()}`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
        setToast(`${format} export ready.`);
      }catch(caught){setError(caught instanceof Error?caught.message:'Sketch export failed.');}finally{setExporting(null);}
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
    else if (format === "STEP File") downloadFile(`${slug}.step`, `ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('Casynus mock STEP export'),'2;1');\nENDSEC;\nDATA;\n/* ${JSON.stringify(metadata)} */\nENDSEC;\nEND-ISO-10303-21;`);
    else if (format === "G-Code") downloadFile(`${slug}.gcode`, `; Casynus generated toolpath\nG21\nG90\nG0 X0 Y0 Z5\nG1 X20 Y0 Z0 F1200\nG1 X20 Y20\nG1 X0 Y20\nG1 X0 Y0\nM30`);
    else if (format === "Parameter Sheet (PDF)") downloadFile(`${slug}-parameters.pdf`, `%PDF-1.1\n% Casynus parameter sheet\n${JSON.stringify(metadata, null, 2)}\n%%EOF`, "application/pdf");
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
  const openScene = (file: File) => { if(studioMode==='floor-plan'){void file.text().then(raw=>{const saved=JSON.parse(raw);const document=parseFloorPlanRecovery(JSON.stringify({version:1,name:saved.name??'Imported project',objects:saved.objects??saved.floorPlanObjects??[],settings:saved.settings??saved.floorPlanSettings??DEFAULT_FLOOR_PLAN_SETTINGS,sketch:saved.sketch}));sketchProject.importProject(document);setToast('Sketch project imported as a new editable copy.');}).catch(()=>setToast('Could not import this Sketch project. The current drawing was preserved.'));return;} void file.text().then(raw => { const saved = JSON.parse(raw) as Partial<{ name: string; objects: FloorPlanObject[]; assets: StudioAsset[]; material: MaterialName; roughness: number; metallic: number; renderSettings: RenderSettings; floorPlanObjects: FloorPlanObject[]; floorPlanSettings: FloorPlanSettings; settings: FloorPlanSettings; units: FloorPlanSettings["unit"]; scale: string; precision: number }>; if (saved.assets) setAssets(saved.assets); if (saved.material) setMaterial(saved.material); if (typeof saved.roughness === "number") setRoughness(saved.roughness); if (typeof saved.metallic === "number") setMetallic(saved.metallic); if (saved.renderSettings) setRenderSettings(saved.renderSettings); if (saved.floorPlanObjects ?? saved.objects) setFloorPlanObjects((saved.floorPlanObjects ?? saved.objects)!); if (typeof saved.name === "string") setFloorPlanName(saved.name); const settings = saved.floorPlanSettings ?? saved.settings ?? { ...DEFAULT_FLOOR_PLAN_SETTINGS, unit: saved.units ?? DEFAULT_FLOOR_PLAN_SETTINGS.unit, scale: Number(saved.scale?.split(":").pop()) || DEFAULT_FLOOR_PLAN_SETTINGS.scale, precision: saved.precision ?? DEFAULT_FLOOR_PLAN_SETTINGS.precision }; setFloorPlanSettings({ ...DEFAULT_FLOOR_PLAN_SETTINGS, ...settings }); setToast("Scene opened."); }).catch(() => setToast("Could not open scene.")); };
  const runMenuAction=(raw:string)=>{const action=raw.split("  ")[0];setOpenMenu(null);if(studioMode==='floor-plan'){if(action==='Save'||action==='Save As'){void sketchProject.save().then(setToast).catch((error:Error)=>setError(error.message));return;}if(action==='New Scene'){if(window.confirm('Create a new Sketch project? The current drawing will remain in project recovery.'))sketchProject.create();return;}if(action==='Export'){void handleExport('JSON Scene');return;}}if(action==="New Scene"){setAssets(initialAssets);setSelectedAssetId(null);setToast("New scene created.")}else if(action==="Open"){sceneFileInput.current?.click()}else if(action==="Save"||action==="Save As"){localStorage.setItem("crystal-studio-state",JSON.stringify({assets,material,roughness,metallic,renderSettings,floorPlanObjects,floorPlanSettings}));setToast("Scene saved locally.")}else if(action==="Delete"&&selectedAssetId){setAssets(x=>x.filter(a=>a.id!==selectedAssetId));setSelectedAssetId(null);setToast("Asset deleted.")}else if(action==="Duplicate"&&selectedAsset){setAssets(x=>[{...selectedAsset,id:crypto.randomUUID(),name:`${selectedAsset.name} Copy`},...x]);setToast("Asset duplicated.")}else if(["Move","Rotate","Scale"].includes(action)){setActiveTool(action.toLowerCase() as StudioTool);setToast(`${action} tool active.`)}else if(action==="Fullscreen"){document.documentElement.requestFullscreen?.();}else if(action==="Export"){handleExport("glTF 2.0")}else setToast(`${action} selected.`)};
  const persistPlan=()=>sketchProject.persist();
  const studioAction=async(action:StudioAction,signal:AbortSignal):Promise<string>=>{
    signal.throwIfAborted();
    if(action.intent==='studio.navigate'){persistPlan();navigateStudioRoute(STUDIO_ROUTES[action.parameters.studio],router.push);return 'Navigation requested; floor plan retained in browser recovery.';}
    if(action.intent==='project.save')return sketchProject.save();
    if(action.intent==='history.undo'){if(!floorPlanHistory.past.length)throw new Error('There is nothing to undo.');dispatchFloorPlan({type:'undo'});return 'Floor-plan undo confirmed.';}
    if(action.intent==='history.redo'){if(!floorPlanHistory.future.length)throw new Error('There is nothing to redo.');dispatchFloorPlan({type:'redo'});return 'Floor-plan redo confirmed.';}
    if(action.intent==='panel.open'){if(action.parameters.panel==='lighting')throw new Error('The 2D drawing has no 3D lighting controls.');if(action.parameters.panel==='sidebar')setLeftOpen(true);else setRightOpen(true);return 'Panel opened.';}
    if(action.intent==='project.export'){
      const formats:Record<string,string>={json:'JSON Scene',pdf:'PDF',svg:'SVG',png:'PNG',jpeg:'JPEG'};
      if(!formats[action.parameters.format])throw new Error('The 2D drawing supports JSON, SVG, PDF, PNG or JPEG export.');await handleExport(formats[action.parameters.format]);return 'Floor-plan export finished; browser download requested.';
    }
    if(action.intent==='project.new'){sketchProject.create();return 'New Sketch project opened; previous drawing retained in project recovery.';}
    if(action.intent==='project.open')throw new Error('Use the existing Open menu to choose a floor-plan JSON file. Voice input cannot silently choose files from your device.');
    throw new Error('This command is unavailable in the 2D Floor Plan editor. Open a 3D studio for mesh operations.');
  };
  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setOpenMenu(null);
    setContextSubmenu(null);
    setContextMenu({ x: Math.min(event.clientX, window.innerWidth - 232), y: Math.min(event.clientY, window.innerHeight - 268) });
  };
  const closeContextMenu = () => {
    setContextMenu(null);
    setContextSubmenu(null);
  };
  const runContextAction = async (action: "copy" | "paste" | "chat" | "toggle-ui" | "widget" | "plugins") => {
    closeContextMenu();
    if (action === "copy") {
      await navigator.clipboard?.writeText(window.location.href);
      setToast("Link copied.");
    } else if (action === "paste") {
      const text = await navigator.clipboard?.readText();
      if (text) setPrompt(current => current ? `${current} ${text}` : text);
    } else if (action === "chat") {
      router.push("/aichat");
    } else if (action === "toggle-ui") {
      setLeftOpen(current => !current);
      setRightOpen(current => !current);
    } else if (action === "widget") {
      setToast("Widget options selected.");
    } else if (action === "plugins") {
      setToast("Plugin options selected.");
    }
  };

  return (
    <div data-crystal-studio-theme={theme} onClick={() => contextMenu && closeContextMenu()} onContextMenuCapture={handleContextMenu} className={`crystal-studio crystal-ui-kit crystal-studio-enter ${insetPanels ? "interior-plan-restored" : ""} ${studioMode === "modeling" ? "crystal-modeling-mode" : ""} ${mobileHome ? "crystal-mobile-home-active" : ""} ${embedded ? "crystal-studio-embedded" : "fixed inset-0 z-[90]"} grid overflow-hidden bg-[var(--studio-bg-canvas)] text-[var(--studio-text-primary)] ${leftOpen && !pencilActive ? "" : "crystal-left-closed"} ${rightOpen && !pencilActive ? "" : "crystal-right-closed"}`}>
      {mobileSplash && <div className="crystal-mobile-splash"><img src="/Logopng.png" alt="Casynus" /></div>}
      <input ref={sceneFileInput} type="file" accept="application/json,.json" className="sr-only" onChange={event => { const file = event.target.files?.[0]; if (file) openScene(file); event.currentTarget.value = ""; }} />
      <section className="crystal-mobile-home" aria-label="Casynus mobile home">
        <header className="crystal-mobile-home-header">
          <button type="button" aria-label="Open Casynus menu" onClick={() => setMobileMenu(true)}><Grid2X2 size={19} /></button>
          <div className="crystal-mobile-workspace-tabs" role="tablist" aria-label="Casynus studios">
            {[
              { id: "floor-plan", label: "Animate", icon: Play },
              { id: "modeling", label: "Modeling", icon: Box },
              { id: "images", label: "Images", icon: ImageIcon },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={mobileWorkspace === tab.id}
                  onClick={() => {
                    setMobileWorkspace(tab.id as any);
                    setDashboard(false);
                    setStudioMode(tab.id as any);
                    setMobileHome(tab.id === "images");
                  }}
                >
                  <TabIcon size={13} className="inline-block shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          <button type="button" aria-label={incognito ? "Disable incognito mode" : "Enable incognito mode"} aria-pressed={incognito} onClick={() => setIncognito((value) => !value)}><Glasses size={21} /></button>
        </header>
        <div className="crystal-mobile-home-hero">
          <CrystalThemeToggle className="crystal-mobile-home-theme" />
          <div className="crystal-mobile-mark" aria-hidden="true"><NextImage src="/Logopng.png" alt="" width={72} height={72} /></div>
          <h1>What’s on your mind today?</h1>
        </div>
        <div className="crystal-mobile-preview-cards" role="region" aria-label="3D model previews">
          {[
            { title: "Modern Villa", tag: "3D House", img: "/Section/architectresectionone.png", promptText: "Create a modern 3D isometric villa" },
            { title: "Isometric Farm", tag: "3D Farm", img: "/Section/wave1.webp", promptText: "Generate an isometric farmstead layout" },
            { title: "Smart Home", tag: "Architecture", img: "/Section/wave0.jpg", promptText: "Design a 3D isometric smart house" },
          ].map((item) => (
            <button
              key={item.title}
              type="button"
              className="crystal-mobile-preview-card"
              onClick={() => setPrompt(item.promptText)}
            >
              <div className="crystal-mobile-preview-img" style={{ backgroundImage: `url(${item.img})` }} />
              <div className="crystal-mobile-preview-info">
                <span>{item.title}</span>
                <small>{item.tag}</small>
              </div>
            </button>
          ))}
        </div>
        <form className="crystal-mobile-composer" onSubmit={(event) => { event.preventDefault(); if (!prompt.trim()) return; setDashboard(false); setMobileHome(false); window.dispatchEvent(new CustomEvent("crystal:submit-ai-chat", { detail: mobileModel.toLowerCase() })); }}>
          <button type="button" className="crystal-mobile-pro-banner" onClick={() => setMobilePricing(true)}><Zap size={15} fill="currentColor" /><span><b>Try Casynus Pro</b><small>Unlock faster generations</small></span><em>Pay Now</em></button>
          <label className="crystal-mobile-composer-label" htmlFor="mobile-crystal-prompt">What do you want to create?</label>
          <textarea id="mobile-crystal-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Describe your next architectural idea..." rows={2} />
          <div className="crystal-mobile-composer-actions">
            <button type="button" aria-label="Attach reference" onClick={() => sceneFileInput.current?.click()}><Paperclip size={18} /></button>
            <button type="button" className="crystal-mobile-model-select" onClick={() => setMobileModelSheet(true)}><Zap size={14} fill="#1597ff" color="#1597ff" /><span>{mobileModel}</span><ChevronDown size={15} /></button>
            <button type="submit" aria-label="Generate with Casynus" disabled={loading}><ArrowRight size={22} strokeWidth={1.8} /></button>
          </div>
        </form>
        <nav className="crystal-mobile-bottom-nav" aria-label="Studio shortcuts">
          <div>
            <button type="button" aria-label="Home" aria-current={mobileHome ? "page" : undefined} onClick={() => { setDashboard(false); setMobileHome(true); }}><Home size={20} fill="currentColor" /></button>
            <button type="button" aria-label="Open floor plan studio" onClick={() => { setDashboard(false); setStudioMode("floor-plan"); setMobileWorkspace("floor-plan"); setMobileHome(false); }}><BookOpen size={20} /></button>
            <button type="button" aria-label="Create a new scene" onClick={() => { setDashboard(false); runMenuAction("New Scene"); setMobileHome(false); }}><FilePlus2 size={20} /></button>
            <button type="button" aria-label="Focus creation prompt" onClick={() => document.getElementById("mobile-crystal-prompt")?.focus()}><Wand2 size={20} /></button>
            <button type="button" aria-label="Open profile and settings" onClick={() => setMobileProfile(true)}><Settings size={20} /></button>
          </div>
          <button type="button" aria-label="Search studio" onClick={() => setMobileMenu(true)}><Search size={20} /></button>
        </nav>
        {mobileModelSheet && <div className="crystal-mobile-model-overlay" role="dialog" aria-modal="true" aria-label="Choose AI model" onClick={() => setMobileModelSheet(false)}>
          <div className="crystal-mobile-model-sheet" onClick={(event) => event.stopPropagation()}><div className="crystal-sheet-handle" /><div className="flex items-center justify-between"><div><b>AI model</b><small>Choose your creative partner</small></div><button type="button" aria-label="Close model selector" onClick={() => setMobileModelSheet(false)}>×</button></div>
            {["Nano Banana", "Gemini", "Groq", "You"].map((model) => <button type="button" key={model} className={mobileModel === model ? "is-selected" : ""} onClick={() => { setMobileModel(model); setMobileModelSheet(false); }}><span><Sparkles size={17} />{model}</span>{mobileModel === model && <span>✓</span>}</button>)}
          </div>
        </div>}
        <CrystalThemeToggle className="crystal-mobile-theme-toggle" />
      </section>
      {!mobileViewport && (
      <header className={`crystal-topbar ${pencilActive ? "!hidden" : ""} col-span-full flex h-16 items-center border-b border-[var(--studio-border)] bg-[var(--studio-bg-canvas)] px-7`}>
        <div className="flex items-center gap-3"><img src="/Logopng.png" alt="Casynus" className="crystal-brand-logo"/><b className="text-[18px] tracking-[-0.02em] text-[var(--studio-text-primary)]">Casynus</b><span className="mx-1 h-5 w-px bg-[var(--studio-bg-elevated)]" aria-hidden="true"/><button aria-label={dedicated ? "Back to Casynus AI Chat" : "Back to projects"} onClick={() => router.push(dedicated ? "/aichat" : "/project")} className="crystal-home-button grid h-9 w-9 place-items-center rounded-[9px] text-[var(--studio-text-primary)]"><Home size={18}/></button><span className="hidden h-5 w-px bg-[var(--studio-bg-elevated)] sm:block" aria-hidden="true"/><span className="hidden text-[12px] font-semibold tracking-wide text-[var(--studio-text-primary)] sm:block">3D Studio <span className="text-[var(--studio-text-secondary)]">/ Modeling</span></span></div>
        <nav aria-label="Application menu" className="crystal-app-menu relative ml-7 flex h-full items-center gap-1 text-[13px] text-[var(--studio-text-secondary)]">{["File", "Edit", "Tools", "Help", "View"].map((item) => <button aria-expanded={openMenu===item} key={item} onClick={() => setOpenMenu(openMenu === item ? null : item)} className={`crystal-menu-item h-9 rounded-[8px] px-3 transition ${openMenu === item ? "is-open text-[var(--studio-text-primary)]" : ""}`}>{item}</button>)}{openMenu && <div className="absolute left-0 top-[52px] z-50 w-52 rounded-[12px] border border-[var(--studio-border)] bg-[var(--studio-bg-panel)] p-1.5 shadow-2xl"><div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--studio-text-secondary)]">{openMenu}</div>{menuItems[openMenu].map(action => <button key={action} onClick={() => runMenuAction(action)} className="block w-full rounded-lg px-3 py-2 text-left text-[11px] text-[var(--studio-text-primary)] hover:bg-[var(--studio-bg-hover)]">{action}</button>)}</div>}</nav>
        <div className="ml-3 flex h-10 items-center rounded-full border border-[var(--studio-border)] bg-[var(--studio-bg-elevated)] p-1" role="group" aria-label="Studio mode">
          <button type="button" aria-pressed={studioMode === "floor-plan"} onClick={() => { switchStudioMode("floor-plan"); setOpenMenu(null); }} className={`h-8 rounded-full px-3 text-[11px] font-semibold transition ${studioMode === "floor-plan" ? "bg-[var(--studio-accent)] text-[var(--studio-text-primary)] shadow-[0_3px_10px_rgba(22,135,247,.28)]" : "text-[var(--studio-text-secondary)] hover:text-[var(--studio-text-primary)]"}`}>Floor Plan Studio</button>
          <button type="button" aria-pressed={studioMode === "modeling"} onClick={() => { switchStudioMode("modeling"); setOpenMenu(null); }} className={`h-8 rounded-full px-3 text-[11px] font-semibold transition ${studioMode === "modeling" ? "bg-[var(--studio-bg-elevated)] text-[var(--studio-text-primary)]" : "text-[var(--studio-text-secondary)] hover:text-[var(--studio-text-primary)]"}`}>Modeling Studio</button>
          <Link href="/infrastructure" className="h-8 rounded-full px-3 py-2 text-[11px] font-semibold text-[var(--studio-text-secondary)] transition hover:text-[var(--studio-text-primary)]">Infrastructure Studio</Link>
        </div>
        <div className="ml-auto flex items-center gap-2.5"><CrystalThemeToggle /><button onClick={()=>setDialog("credits")} className="crystal-credit-button flex h-10 items-center gap-2 rounded-[11px] border border-[var(--studio-border)] px-3 text-[11px] text-[var(--studio-text-primary)]">Starter <Zap size={16}/>{credits}</button><Link href="/pricing" className="crystal-pro-button flex h-10 w-[124px] items-center justify-center gap-2 rounded-[10px] bg-[var(--studio-accent)] text-[12px] font-semibold text-[var(--studio-text-primary)]"><Zap size={18} fill="currentColor" />Go Pro</Link></div>
      </header>
      )}

      {!mobileViewport && !pencilActive && !leftOpen && !rightOpen && <div className="studio-restore-pill absolute left-4 top-4 z-50 flex items-center gap-1.5 rounded-[10px] border border-[var(--studio-border)] bg-[var(--studio-bg-elevated)] p-1.5 shadow-[0_8px_24px_rgba(0,0,0,.35)] backdrop-blur-md"><button type="button" aria-label="Copy studio link" title="Copy studio link" onClick={() => void navigator.clipboard?.writeText(window.location.href)} className="grid h-8 w-8 place-items-center rounded-[7px] bg-[var(--studio-bg-elevated)] text-[var(--studio-text-primary)] transition hover:bg-[var(--studio-bg-hover)]"><Share2 size={15} strokeWidth={2}/></button><button type="button" aria-label="Show studio panels" title="Show sidebars" onClick={() => { setLeftOpen(true); setRightOpen(true); }} className="grid h-8 w-8 place-items-center rounded-[7px] bg-[var(--studio-accent)] text-[var(--studio-text-primary)] shadow-[0_2px_10px_rgba(22,135,247,.3)] transition hover:bg-[var(--studio-accent-hover)]"><PanelLeftOpen size={15} strokeWidth={2} /></button></div>}
      {!mobileViewport && leftOpen && !pencilActive && (studioMode === "modeling" ? <ModelingSidebar quality={quality} topology={topology} texture={texture} material={material} prompt={prompt} loading={loading} separateParts={separateParts} imageEnhancement={imageEnhancement} codeExecution={codeExecution} renderLoading={renderLoading} estimatedMinutes={renderEstimate.minutes} estimatedCost={renderEstimate.cost} assets={assets} selectedAssetId={selectedAssetId} uploadedImage={uploadedImage} onPromptChange={setPrompt} onGenerate={handleGenerate} onUpload={handleUpload} onQualityChange={setQuality} onTopologyChange={setTopology} onTextureChange={setTexture} onSeparatePartsChange={setSeparateParts} onImageEnhancementChange={setImageEnhancement} onCodeExecutionChange={setCodeExecution} onMaterialChange={setMaterial} onRender={handleRender} onSignOut={() => setDialog("signout")} onBack={() => router.push("/project")} onStudioModeChange={switchStudioMode} onAddObject={() => { const source = selectedAsset ?? initialAssets[0]; const id = crypto.randomUUID(); setAssets(items => [{ ...source, id, name: `${source.name} ${items.length + 1}`, createdAt: new Date().toISOString() }, ...items]); setSelectedAssetId(id); }} onSelectAsset={id => { setSelectedAssetId(id); setTransform({ x: 0, y: 0, rotation: -8, scale: 1 }); }} onCollapse={() => { setLeftOpen(false); setRightOpen(false); }} /> : insetPanels ? <InteriorSceneSidebar onSettings={()=>{setRightOpen(true);requestAnimationFrame(()=>globalThis.document.querySelector(".interior-scene-inspector")?.scrollTo({top:0}));}} onProfile={()=>{window.open("/account","_blank","noopener,noreferrer");}} hoveredId={hoveredFloorPlanId} onHover={setHoveredFloorPlanId} objects={floorPlanObjects} selectedId={selectedFloorPlanId} projectName={floorPlanName} onProjectNameChange={setFloorPlanName} onSelect={setSelectedFloorPlanId} onOpen={() => sceneFileInput.current?.click()} onExport={format => void handleExport(format)} onBack={() => router.push("/project")} onCollapse={() => { setLeftOpen(false); setRightOpen(false); }} /> : <LeftSidebar floorPlanMode floorPlanSettings={floorPlanSettings} onFloorPlanSettingsChange={setFloorPlanSettings} floorPlanObjects={floorPlanObjects} selectedFloorPlanId={selectedFloorPlanId} onSelectFloorPlanObject={setSelectedFloorPlanId} onStudioModeChange={switchStudioMode} onBack={() => router.push("/project")} material={material} roughness={roughness} metallic={metallic} renderer={renderer} quality={quality} topology={topology} texture={texture} separateParts={separateParts} imageEnhancement={imageEnhancement} codeExecution={codeExecution} estimatedMinutes={renderEstimate.minutes} estimatedCost={renderEstimate.cost} credits={credits} renderLoading={renderLoading} uploadedImage={uploadedImage} prompt={prompt} loading={loading} onPromptChange={setPrompt} onGenerate={handleGenerate} settingsOpen={settingsOpen} onMaterialChange={setMaterial} onRoughnessChange={setRoughness} onMetallicChange={setMetallic} onRendererChange={setRenderer} onQualityChange={setQuality} onTopologyChange={setTopology} onTextureChange={setTexture} onSeparatePartsChange={setSeparateParts} onImageEnhancementChange={setImageEnhancement} onCodeExecutionChange={setCodeExecution} onRender={handleRender} onProfile={()=>setDialog("profile")} onSignOut={()=>setDialog("signout")} onUpload={handleUpload} onRemoveImage={() => setUploadedImage(null)} onToggleSettings={() => setSettingsOpen((value) => !value)} onCollapse={() => { setLeftOpen(false); setRightOpen(false); }} />)}
      {(!mobileViewport || !mobileHome) && <Viewport sketch={sketch} onSketchChange={next=>{dispatchDrawing({type:'commit',next:normalizeSketch(next)});}} onSketchUndo={()=>dispatchDrawing({type:'undo'})} onSketchRedo={()=>dispatchDrawing({type:'redo'})} sketchCanUndo={drawingHistory.past.length>0} sketchCanRedo={drawingHistory.future.length>0} sketchProject={sketchProject} onFloorExport={format=>void handleExport(format)} onPencilModeChange={setPencilMode} onOpenFloorFile={()=>sceneFileInput.current?.click()} actionScope={recoveryIdentity} onStudioAction={studioAction} onHoverFloorPlanObject={setHoveredFloorPlanId} renderer={renderer} selectedAsset={selectedAsset} activeTool={activeTool} prompt={prompt} loading={loading} progress={progress} error={error} transform={transform} color={color} roughness={roughness} metallic={metallic} incognito={incognito} studioMode={studioMode} onStudioModeChange={switchStudioMode} floorPlanObjects={floorPlanObjects} selectedFloorPlanId={selectedFloorPlanId} floorPlanSettings={floorPlanSettings} onFloorPlanSettingsChange={setFloorPlanSettings} onFloorPlanObjectsChange={setFloorPlanObjects} onSelectFloorPlanObject={setSelectedFloorPlanId} onToolChange={setActiveTool} onPromptChange={setPrompt} onGenerate={handleGenerate} onTransformChange={setTransform} onClearError={() => setError(null)} onSelectAsset={(id) => setSelectedAssetId(id || null)} onCreateObject={() => { const source = selectedAsset ?? initialAssets[0]; const id = crypto.randomUUID(); setAssets((items) => [{ ...source, id, name: `${source.name} ${items.length + 1}`, createdAt: new Date().toISOString() }, ...items]); setSelectedAssetId(id); }} onAssetDrop={(id) => { setSelectedAssetId(id || null); if (id) setTransform({ x: 0, y: 0, rotation: -8, scale: 1 }); }} onColorChange={setColor} onOpenPricing={() => setMobilePricing(true)} onSnapshot={()=>handleExport("JPEG & PNG")} />}
      {!mobileViewport && rightOpen && !pencilActive && <RightPanel scenePresentation={insetPanels} resolution={resolution} frameRate={frameRate} color={color} opacity={opacity} renderSettings={renderSettings} assets={assets} selectedAssetId={selectedAssetId} exporting={exporting} floorPlanMode={studioMode === "floor-plan"} floorPlanSettings={floorPlanSettings} onFloorPlanSettingsChange={setFloorPlanSettings} selectedFloorPlanObject={floorPlanObjects.find((object) => object.id === selectedFloorPlanId)} onUpdateFloorPlanObject={(updated) => setFloorPlanObjects((objects) => objects.map((object) => object.id === updated.id ? updated : object))} onDeleteFloorPlanObject={(id) => { setFloorPlanObjects((objects) => objects.filter((object) => object.id !== id)); setSelectedFloorPlanId(null); }} onResolutionChange={setResolution} onFrameRateChange={setFrameRate} onColorChange={setColor} onOpacityChange={setOpacity} onRenderChange={setRenderSettings} onSelectAsset={(id) => { setSelectedAssetId(id); setTransform({ x: 0, y: 0, rotation: -8, scale: 1 }); }} onDeleteAsset={(id) => { setAssets((items) => items.filter((item) => item.id !== id)); if (selectedAssetId === id) setSelectedAssetId(null); }} onExport={handleExport} onCollapse={() => { setLeftOpen(false); setRightOpen(false); }} />}
      <button aria-label="Mobile menu" onClick={() => { setMobileMenu(true); setMobileProfile(false); }} className="crystal-mobile-menu-trigger absolute left-3 top-3 hidden h-10 w-10 place-items-center rounded-full bg-[var(--studio-bg-elevated)] max-[700px]:grid"><Grid2X2 size={21} /></button>
      <button type="button" aria-label="Toggle Incognito mode" aria-pressed={incognito} title={incognito ? "Incognito mode active" : "Enable Incognito mode"} onClick={() => setIncognito(value => !value)} className={`crystal-mobile-incognito absolute right-3 top-3 hidden h-10 w-10 place-items-center rounded-full bg-[var(--studio-bg-elevated)] max-[700px]:grid ${incognito ? "is-active" : ""}`}><Glasses size={22} /></button>
      {mobileMenu && <div className="crystal-mobile-sheet">
        <div className="flex items-center justify-between"><img src="/Logopng.png" alt="Casynus" className="crystal-brand-logo crystal-brand-logo-mobile"/><button aria-label="Close menu" onClick={() => setMobileMenu(false)} className="grid h-11 w-11 place-items-center rounded-full bg-[var(--studio-bg-elevated)]"><ArrowLeft size={22}/></button></div>
        <button onClick={() => setMobilePricing(true)} className="crystal-mobile-pro"><Zap size={20} fill="currentColor"/> <b>Try Casynus Pro</b><span>Pay Now</span></button>
        <label className="crystal-mobile-search"><Search size={19}/><input placeholder="Search" /></label>
        <nav className="crystal-mobile-nav"><button className="active">⠿　All Projects</button><button><Globe2 size={17}/>Community</button><button><Archive size={17}/>Archive...</button><button onClick={() => { setMobileMenu(false); setDashboard(false); runMenuAction("New Scene"); setMobileHome(false); }}><Plus size={17}/>Project</button></nav>
        <h2>Recents</h2><button className="crystal-mobile-recent">Architecture build house</button>
        <div className="mt-auto flex items-center justify-between"><button onClick={() => setMobileProfile(true)} className="grid h-13 w-13 place-items-center rounded-full bg-[var(--studio-bg-elevated)] text-sm">B</button><button onClick={() => setMobileProfile(true)} className="grid h-13 w-13 place-items-center rounded-full bg-[var(--studio-bg-elevated)]"><Settings size={23}/></button></div>
      </div>}
      {mobileProfile && <div className="crystal-mobile-profile">
        <button aria-label="Back to menu" onClick={() => setMobileProfile(false)} className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-[var(--studio-bg-elevated)]"><ArrowLeft size={22}/></button><h1>My Profile</h1>
        <div className="crystal-profile-user"><span>B</span><div><b>Iam</b><small>email@live.com</small></div></div>
        <section><b>Upgrade to Pro</b><p>Lorem ipsum dolor sit amet consectetur. Et sit nec habitant mauris.</p><button onClick={() => setMobilePricing(true)} className="crystal-mobile-pro"><Zap size={17} fill="currentColor"/>Try Casynus Pro <span>Go Pro</span></button></section>
        {[['Account','Account Details','Billing & Subscription','Account Security'],['Casynus','My Creations','Projects','Generation History','Favorites'],['Preferences','Settings','Appearance'],['Support','Help & Support','Updates']].map(([title,...items]) => <section key={title}><b>{title}</b>{items.map(item => <button key={item}>{item}</button>)}</section>)}
        <button className="crystal-profile-signout">Sign Out</button>
      </div>}
      {mobilePricing && <div className="crystal-mobile-pricing">
        <button aria-label="Back to studio" onClick={() => setMobilePricing(false)} className="grid h-11 w-11 place-items-center rounded-full bg-[var(--studio-bg-elevated)]"><ArrowLeft size={22}/></button>
        <h1>Try <em>Casynus</em> Pro Plan</h1><p>Try for $0.00 for 7 Days</p>
        <div className="crystal-pricing-tabs">{["Basic","Pro","Team","Studio"].map(plan=><button key={plan} onClick={() => setPricingPlan(plan)} className={pricingPlan===plan?"active":""}>{plan}</button>)}</div>
        <div className="crystal-pricing-cycle"><button>Monthly</button><button className="active">Yearly</button></div>
        <div className="crystal-pricing-cards">{[{name:"Basic",price:"$5",cta:"Start Basic",features:["Claude AI architectural assistant","Architectural metrics and statistics","AI-generated concept imagery","Professional PDF documentation"]},{name:"Pro",price:"$48",cta:"Upgrade to Pro",features:["Claude AI research and design support","OpenAI Codex development tools","Advanced architectural analysis","Presentation-ready image and PDF exports"]},{name:"Team",price:"$124",cta:"Start Team trial",features:["Claude AI and Codex for team workflows","Shared Architecture Studio","Centralized project knowledge and files","Collaborative review and documentation"]},{name:"Studio",price:"$248",cta:"Upgrade to Studio",features:["Claude AI and OpenAI Codex","Studio-grade 3D modeling","Intelligent floor plan generation","Infrastructure systems planning","Technical reports and deliverables"]}].map(plan=><article key={plan.name} className={pricingPlan===plan.name?"selected":""}><h2>{plan.name} Plan</h2><p>Professional AI tools for architecture and design workflows.</p><strong>{plan.price}<small>/mo, billed yearly</small></strong><ul>{plan.features.map(feature=><li key={feature}>{feature}</li>)}</ul><button onClick={() => setPricingPlan(plan.name)}>{plan.cta}</button></article>)}</div>
      </div>}
      {contextMenu && <div role="menu" onPointerDown={event => event.stopPropagation()} className="fixed z-[120] flex h-[256px] w-[220px] max-w-[calc(100vw-24px)] flex-col gap-1 rounded-[20px] border-[2px] border-[var(--studio-border)] bg-[var(--studio-bg-panel)] p-1 text-[var(--studio-text-primary)] shadow-2xl" style={{ left: contextMenu.x, top: contextMenu.y }}>
        <button role="menuitem" onClick={() => void runContextAction("copy")} className="flex h-9 min-h-9 w-full items-center justify-between rounded-[12px] px-4 text-sm font-medium hover:bg-[var(--studio-bg-hover)]"><span>Copy</span><span>Ctrl + C</span></button>
        <button role="menuitem" onClick={() => void runContextAction("paste")} className="flex h-9 min-h-9 w-full items-center justify-between rounded-[12px] px-4 text-sm font-medium hover:bg-[var(--studio-bg-hover)]"><span>Paste</span><span>Ctrl + V</span></button>
        <button role="menuitem" onClick={() => void runContextAction("chat")} className="flex h-9 min-h-9 w-full items-center justify-between rounded-[12px] px-4 text-sm font-medium hover:bg-[var(--studio-bg-hover)]"><span>Cursor Chat</span><span>/</span></button>
        <button role="menuitem" onClick={() => void runContextAction("toggle-ui")} className="flex h-9 min-h-9 w-full items-center justify-between rounded-[12px] px-4 text-sm font-medium hover:bg-[var(--studio-bg-hover)]"><span>Show/Hide UI</span><span>‘</span></button>
        <div className="relative">
          <button role="menuitem" onMouseEnter={() => setContextSubmenu("widget")} className="flex h-9 min-h-9 w-full items-center justify-between rounded-[12px] px-4 text-sm font-medium hover:bg-[var(--studio-bg-hover)]"><span>Widget</span><span>▹</span></button>
          {contextSubmenu === "widget" && <div className="absolute left-full top-0 ml-2 flex h-[132px] w-[220px] flex-col justify-center gap-1 rounded-2xl border-[2px] border-[var(--studio-border)] bg-[var(--studio-bg-panel)] p-1 shadow-2xl"><button onClick={() => setToast("Development widgets opened.")} className="flex h-9 min-h-9 w-full items-center justify-between rounded-xl px-4 text-left text-sm hover:bg-[var(--studio-bg-hover)]">Development <span>▹</span></button><button onClick={() => void runContextAction("widget")} className="h-9 min-h-9 w-full rounded-xl px-4 text-left text-sm hover:bg-[var(--studio-bg-hover)]">Manage widgets</button><button onClick={() => setToast("All widgets selected.")} className="h-9 min-h-9 w-full rounded-xl px-4 text-left text-sm hover:bg-[var(--studio-bg-hover)]">Select All Widget</button></div>}
        </div>
        <div className="relative">
          <button role="menuitem" onMouseEnter={() => setContextSubmenu("plugins")} className="flex h-9 min-h-9 w-full items-center justify-between rounded-[12px] px-4 text-sm font-medium hover:bg-[var(--studio-bg-hover)]"><span>Plugins</span><span>▹</span></button>
          {contextSubmenu === "plugins" && <div className="absolute left-full bottom-0 ml-2 flex h-[132px] w-[220px] flex-col justify-center gap-1 rounded-2xl border-[2px] border-[var(--studio-border)] bg-[var(--studio-bg-panel)] p-1 shadow-2xl"><button onClick={() => setToast("Casynus tools opened.")} className="h-9 min-h-9 w-full rounded-xl px-4 text-left text-sm hover:bg-[var(--studio-bg-hover)]">Casynus tool</button><button onClick={() => setToast("Development plugins opened.")} className="flex h-9 min-h-9 w-full items-center justify-between rounded-xl px-4 text-left text-sm hover:bg-[var(--studio-bg-hover)]">Development <span>▹</span></button><button onClick={() => void runContextAction("plugins")} className="h-9 min-h-9 w-full rounded-xl px-4 text-left text-sm hover:bg-[var(--studio-bg-hover)]">Manage plugin</button></div>}
        </div>
      </div>}
      {toast && <div role="status" className="fixed bottom-14 left-1/2 z-[110] -translate-x-1/2 rounded-xl border border-[#4A90D9]/40 bg-[var(--studio-bg-elevated)] px-5 py-3 text-xs shadow-2xl">{toast}</div>}
      {dialog && <div role="dialog" aria-modal="true" className="fixed inset-0 z-[105] grid place-items-center bg-[var(--studio-bg-elevated)] p-5 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-bg-elevated)] p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{dialog==="credits"?"Starter plan":dialog==="profile"?"User account":"Sign out"}</h2><button aria-label="Close dialog" onClick={()=>setDialog(null)} className="rounded-lg px-3 py-1 text-[var(--studio-text-secondary)] hover:bg-[var(--studio-bg-hover)]">×</button></div>{dialog==="credits"&&<><p className="mt-3 text-sm text-[var(--studio-text-secondary)]">Current credit balance</p><div className="mt-2 flex items-center gap-2 text-3xl font-bold"><Zap className="text-[#4A90D9]"/>{credits}</div><div className="mt-5 space-y-2">{renderJobs.length?renderJobs.slice(0,5).map(job=><div key={job.id} className="flex justify-between rounded-lg bg-[var(--studio-bg-elevated)] px-3 py-2 text-xs"><span>Render {job.id.slice(0,6)}</span><span className="text-[#74adff]">{job.status}</span></div>):<p className="text-xs text-[var(--studio-text-secondary)]">No render usage yet.</p>}</div><Link href="/pricing" className="mt-5 flex h-10 items-center justify-center rounded-lg bg-[#4A90D9] text-sm font-semibold">Upgrade plan</Link></>}{dialog==="profile"&&<div className="mt-4 grid gap-2">{["Profile","Settings","Billing"].map(x=><button key={x} onClick={()=>setToast(`${x} opened`)} className="rounded-lg bg-[var(--studio-bg-elevated)] px-4 py-3 text-left text-sm hover:bg-[var(--studio-bg-hover)]">{x}</button>)}</div>}{dialog==="signout"&&<><p className="mt-4 text-sm text-[var(--studio-text-secondary)]">Are you sure you want to sign out?</p><div className="mt-5 flex gap-2"><button onClick={()=>setDialog(null)} className="h-10 flex-1 rounded-lg bg-[var(--studio-bg-elevated)]">Cancel</button><button onClick={()=>{localStorage.removeItem("crystal-studio-state");location.href="/login"}} className="h-10 flex-1 rounded-lg bg-red-600">Sign Out</button></div></>}</div></div>}
    </div>
  );
}
