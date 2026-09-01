"use client";

import { Camera, Check, ChevronDown, CircleHelp, Globe2, Grid3X3, Lightbulb, Link2, LoaderCircle, Paperclip, Send, Sparkles, X, Zap } from "lucide-react";
import { modelingTools } from "./data";
import { IconButton } from "./ui";
import type { StudioAsset, StudioTool, Transform } from "./types";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type Camera = { targetX: number; targetZ: number; elevation: number; distance: number; yaw: number; pitch: number; orthographic: boolean };

function PerspectiveGrid({ camera, asset, color, transform }: { camera: Camera; asset?: StudioAsset; color: string; transform: Transform }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(bounds.width * dpr)); canvas.height = Math.max(1, Math.round(bounds.height * dpr));
      const ctx = canvas.getContext("2d"); if (!ctx) return; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, bounds.width, bounds.height);
      const cp = Math.cos(camera.pitch), sp = Math.sin(camera.pitch), cy = Math.cos(camera.yaw), sy = Math.sin(camera.yaw);
      const eye = { x: camera.targetX + camera.distance * sy * cp, y: camera.elevation + camera.distance * sp, z: camera.targetZ + camera.distance * cy * cp };
      const f = { x: camera.targetX - eye.x, y: -eye.y, z: camera.targetZ - eye.z }; const fl = Math.hypot(f.x, f.y, f.z); f.x/=fl; f.y/=fl; f.z/=fl;
      const r = { x: -f.z, y: 0, z: f.x }; const rl = Math.hypot(r.x, r.z); r.x/=rl; r.z/=rl;
      const u = { x: r.z*f.y, y: f.z*r.x-r.z*f.x, z: -r.x*f.y }; const focal = Math.min(bounds.width, bounds.height) * 1.05;
      const project = (x:number,y:number,z:number) => { const px=x-eye.x, py=y-eye.y, pz=z-eye.z; const depth=px*f.x+py*f.y+pz*f.z; if(depth<.12)return null; const scale=camera.orthographic ? focal/camera.distance : focal/depth; return { x:bounds.width/2+(px*r.x+pz*r.z)*scale, y:bounds.height*.52-(px*u.x+py*u.y+pz*u.z)*scale, depth }; };
      const line = (a:{x:number,z:number},b:{x:number,z:number},color:string,width=1) => { const p1=project(a.x,0,a.z),p2=project(b.x,0,b.z); if(!p1||!p2)return; ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke(); };
      for(let i=-40;i<=40;i++){ const major=i%5===0; line({x:i,z:-40},{x:i,z:40},major?"rgba(120,124,130,.31)":"rgba(108,112,118,.18)"); line({x:-40,z:i},{x:40,z:i},major?"rgba(120,124,130,.31)":"rgba(108,112,118,.18)"); }
      line({x:-40,z:0},{x:40,z:0},"rgba(224,75,75,.9)",1.35); line({x:0,z:-40},{x:0,z:40},"rgba(30,139,255,.95)",1.35);
      if (`${asset?.name ?? ""} ${asset?.prompt ?? ""}`.toLowerCase().includes("desk")) {
        const shade = ["#9a9a9a", "#5f646a", "#c0c3c8"];
        const offsetX = transform.x / 42, offsetZ = transform.y / 42;
        const box = (cx:number,cy:number,cz:number,w:number,h:number,d:number, tint?:string) => { const v=[[cx-w/2,cy-h/2,cz-d/2],[cx+w/2,cy-h/2,cz-d/2],[cx+w/2,cy+h/2,cz-d/2],[cx-w/2,cy+h/2,cz-d/2],[cx-w/2,cy-h/2,cz+d/2],[cx+w/2,cy-h/2,cz+d/2],[cx+w/2,cy+h/2,cz+d/2],[cx-w/2,cy+h/2,cz+d/2]].map(p=>project(p[0]+offsetX,p[1],p[2]+offsetZ)); const faces=[[0,1,2,3],[1,5,6,2],[3,2,6,7],[4,0,3,7],[5,4,7,6]]; faces.map(face=>({face,depth:face.reduce((n,i)=>n+(v[i]?.depth||0),0)/4})).sort((a,b)=>b.depth-a.depth).forEach(({face},i)=>{const p=face.map(i=>v[i]);if(p.some(x=>!x))return;ctx.beginPath();ctx.moveTo(p[0]!.x,p[0]!.y);p.slice(1).forEach(x=>ctx.lineTo(x!.x,x!.y));ctx.closePath();ctx.fillStyle=tint||shade[i%shade.length];ctx.fill();ctx.strokeStyle="rgba(232,239,246,.45)";ctx.stroke();}); };
        box(0,2.55,0,7.2,.38,3.4,"#6f4e34"); [-2.9,2.9].forEach(x=>[-1.25,1.25].forEach(z=>box(x,1.25,z,.34,2.45,.34,"#565c63"))); box(-1.55,1.55,.15,2.1,1.8,2.5,"#4d5359"); box(-1.55,1.8,-1.12,1.8,.5,.08,"#727980"); box(-1.55,1.22,-1.12,1.8,.5,.08,"#727980");
      }
    };
    draw(); const observer = new ResizeObserver(draw); observer.observe(canvas); return () => observer.disconnect();
  }, [camera, asset, color, transform]);
  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Interactive 3D perspective grid" />;
}

type Props = {
  selectedAsset?: StudioAsset;
  activeTool: StudioTool;
  prompt: string;
  loading: boolean;
  progress: number;
  error: string | null;
  transform: Transform;
  color: string;
  onToolChange: (tool: StudioTool) => void;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  onTransformChange: (transform: Transform) => void;
  onClearError: () => void;
  onAssetDrop: (id: string) => void;
  onColorChange: (value: string) => void;
  onOpenPricing: () => void;
};

export function Viewport(props: Props) {
  const drag = useRef<{ x: number; y: number; transform: Transform } | null>(null);
  const attachmentInput = useRef<HTMLInputElement | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("Precision Mode");
  const [objectSelected, setObjectSelected] = useState(true);
  const [shape, setShape] = useState<"organic" | "cube" | "sphere">("organic");
  const [viewportMode, setViewportMode] = useState<"solid" | "wireframe" | "xray">("solid");
  const [openPanel, setOpenPanel] = useState<"brush" | "tools" | null>(null);
  const [notice, setNotice] = useState("Orbit: drag the model to inspect it");
  // Keep the normal working perspective above the construction plane.  The
  // explicit Bottom control is still available, but normal orbiting cannot
  // accidentally leave the model looking at the underside of the grid.
  const [camera, setCamera] = useState<Camera>({ targetX: 0, targetZ: 0, elevation: 0, distance: 22, yaw: .72, pitch: .52, orthographic: false });
  const cameraDrag = useRef<{ x: number; y: number; camera: typeof camera } | null>(null);
  const [workspaceMode, setWorkspaceMode] = useState<"Animate" | "Modeling" | "Images">("Modeling");
  const [activeView, setActiveView] = useState("Perspective");
  const [chatOpen, setChatOpen] = useState(true);

  useEffect(() => {
    if (!props.selectedAsset) return;
    props.onTransformChange({ x: 0, y: 0, rotation: 0, scale: 1 });
    setCamera({ targetX: 0, targetZ: 0, elevation: 0, distance: 22, yaw: .72, pitch: .52, orthographic: false });
    setActiveView("Perspective");
  // Center and frame every selected asset in the scene.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedAsset?.id]);

  const setView = (view: string) => {
    const views: Record<string, Pick<Camera, "yaw" | "pitch" | "orthographic">> = { Perspective: { yaw: .72, pitch: .52, orthographic: false }, Top: { yaw: 0, pitch: 1.52, orthographic: true }, Bottom: { yaw: 0, pitch: -.72, orthographic: true }, Front: { yaw: Math.PI, pitch: .02, orthographic: true }, Back: { yaw: 0, pitch: .02, orthographic: true }, Left: { yaw: Math.PI / 2, pitch: .02, orthographic: true }, Right: { yaw: -Math.PI / 2, pitch: .02, orthographic: true }, Iso: { yaw: .78, pitch: .55, orthographic: false } };
    const from = camera; const to: Camera = { ...camera, ...views[view], targetX: 0, targetZ: 0, elevation: 0, distance: 22 }; const started = performance.now();
    const animate = (now: number) => { const p=Math.min(1,(now-started)/260); const ease=1-Math.pow(1-p,3); setCamera({ targetX:from.targetX+(to.targetX-from.targetX)*ease, targetZ:from.targetZ+(to.targetZ-from.targetZ)*ease, elevation:from.elevation+(to.elevation-from.elevation)*ease, distance:from.distance+(to.distance-from.distance)*ease, yaw:from.yaw+(to.yaw-from.yaw)*ease, pitch:from.pitch+(to.pitch-from.pitch)*ease, orthographic:p<1?from.orthographic:to.orthographic }); if(p<1)requestAnimationFrame(animate); }; requestAnimationFrame(animate); setActiveView(view);
  };
  const beginDrag = (event: React.PointerEvent) => {
    drag.current = { x: event.clientX, y: event.clientY, transform: props.transform };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event: React.PointerEvent) => {
    if (!drag.current) return;
    const deltaX = event.clientX - drag.current.x;
    const deltaY = event.clientY - drag.current.y;
    if (props.activeTool === "move") props.onTransformChange({ ...props.transform, x: drag.current.transform.x + deltaX, y: drag.current.transform.y + deltaY });
    if (props.activeTool === "rotate" || props.activeTool === "orbit") props.onTransformChange({ ...props.transform, rotation: drag.current.transform.rotation + deltaX * 0.5 });
    if (props.activeTool === "scale") props.onTransformChange({ ...props.transform, scale: Math.min(1.8, Math.max(0.45, drag.current.transform.scale + deltaX / 180)) });
  };

  const selectTool = (tool: StudioTool) => {
    props.onToolChange(tool);
    setOpenPanel(null);
    if (tool === "focus") {
      props.onTransformChange({ x: 0, y: 0, rotation: -8, scale: 1 });
      setNotice("Camera focused on the selected model");
    } else if (tool === "select") {
      setObjectSelected(true);
      setNotice("Selection mode: click the model to toggle selection");
    } else if (tool === "brush") {
      setOpenPanel("brush");
      setNotice("Material brush palette opened");
    } else if (tool === "tools") {
      setOpenPanel("tools");
      setNotice("Precision transform controls opened");
    } else if (tool === "model") {
      const nextShape = shape === "organic" ? "cube" : shape === "cube" ? "sphere" : "organic";
      setShape(nextShape);
      setNotice(`Model primitive: ${nextShape}`);
    } else if (tool === "viewport") {
      const nextMode = viewportMode === "solid" ? "wireframe" : viewportMode === "wireframe" ? "xray" : "solid";
      setViewportMode(nextMode);
      setNotice(`Viewport mode: ${nextMode}`);
    } else {
      setNotice(`${tool.charAt(0).toUpperCase() + tool.slice(1)} tool active`);
    }
  };

  return (
    <section
      className="relative min-h-0 overflow-hidden bg-[#292929]"
      onPointerDown={(event) => { if (event.button === 0 && props.selectedAsset && ["move", "rotate", "scale"].includes(props.activeTool)) { beginDrag(event); return; } if (event.button === 1 || event.button === 2) { event.preventDefault(); cameraDrag.current = { x: event.clientX, y: event.clientY, camera }; event.currentTarget.setPointerCapture(event.pointerId); } }}
      onPointerMove={(event) => { moveDrag(event); if (cameraDrag.current) { const dx = event.clientX - cameraDrag.current.x; const dy = event.clientY - cameraDrag.current.y; const base=cameraDrag.current.camera; if(event.buttons===4 && event.shiftKey) setCamera({ ...base, elevation:Math.max(-48,Math.min(48,base.elevation-dy*.05)), targetX:base.targetX-dx*.018, orthographic:false }); else if(event.buttons===4) setCamera({ ...base, targetX:base.targetX-dx*.018, targetZ:base.targetZ+dy*.018 }); else setCamera({ ...base, yaw:base.yaw-dx*.006, pitch:Math.max(.12,Math.min(1.42,base.pitch+dy*.005)), orthographic:false }); } }}
      onPointerUp={() => { drag.current = null; cameraDrag.current = null; }}
      onContextMenu={(event) => event.preventDefault()}
      onWheel={(event) => { event.preventDefault(); setCamera((value) => ({ ...value, distance: Math.max(4, Math.min(60, value.distance * Math.exp(event.deltaY * .0012))) })); }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const assetId = event.dataTransfer.getData("text/asset-id");
        if (assetId) props.onAssetDrop(assetId);
      }}
    >
      <PerspectiveGrid camera={camera} asset={props.selectedAsset} color={props.color} transform={props.transform} />
      <div className="pointer-events-none absolute bottom-5 left-5 rounded-md bg-black/25 px-2 py-1 text-[10px] text-zinc-400">Wheel: zoom · Middle drag: pan · Shift + middle drag: move above / below grid</div>
      <div className="absolute left-1/2 top-2 flex -translate-x-1/2 rounded-full bg-[#202020]/90 p-1 shadow-xl backdrop-blur-md">{(["Animate","Modeling","Images"] as const).map((mode)=><button key={mode} onClick={()=>{ setWorkspaceMode(mode); setChatOpen(true); }} className={`rounded-full px-5 py-2 text-[11px] transition-all duration-300 ${workspaceMode===mode?"bg-[#414141] text-white shadow-inner":"text-zinc-500 hover:text-zinc-200"}`}>{mode}</button>)}</div>
      {workspaceMode !== "Modeling" && <div className="absolute left-1/2 top-[58px] z-20 w-[310px] -translate-x-1/2 rounded-[14px] border border-white/10 bg-[#232323]/95 p-3 shadow-2xl backdrop-blur-md">{workspaceMode === "Animate" ? <><div className="flex items-center justify-between"><b className="text-[11px]">Animation controls</b><span className="rounded-full bg-[#1687f7]/20 px-2 py-1 text-[9px] text-[#71b4ff]">24 FPS</span></div><p className="mt-2 text-[10px] leading-4 text-zinc-400">Create keyframes and preview the selected asset motion.</p><div className="mt-3 flex gap-2"><button className="rounded-lg bg-[#1687f7] px-3 py-2 text-[10px] font-semibold">Add keyframe</button><button className="rounded-lg bg-[#363636] px-3 py-2 text-[10px]">Auto orbit</button></div></> : <><div className="flex items-center justify-between"><b className="text-[11px]">Image reference</b><span className="text-[9px] text-zinc-500">AI guided</span></div><p className="mt-2 text-[10px] leading-4 text-zinc-400">Attach an image to guide material, form and surface generation.</p><button onClick={() => attachmentInput.current?.click()} className="mt-3 rounded-lg bg-[#363636] px-3 py-2 text-[10px] text-zinc-100">Add image reference</button></>}</div>}

      <div className="hidden crystal-view-cube absolute right-7 top-5 z-30 grid w-[92px] grid-cols-3 gap-1 rounded-[14px] border border-white/10 bg-[#232323]/95 p-2 shadow-2xl backdrop-blur" aria-label="View cube navigation">
        {[["Iso","↖"],["Top","TOP"],["Iso","↗"],["Left","LEFT"],["Perspective","●"],["Right","RIGHT"],["Iso","↙"],["Bottom","BOT"],["Iso","↘"],["Front","FRONT"],["Back","BACK"]].map(([view,label], index)=><button key={`${view}-${index}`} onClick={()=>setView(view)} className={`min-h-5 rounded text-[7px] font-bold transition ${activeView===view?"bg-[#1687f7] text-white shadow-[0_0_12px_rgba(22,135,247,.55)]":"bg-[#373737] text-zinc-300 hover:bg-[#4a4a4a]"}`}>{label}</button>)}
      </div>
      <div className="absolute right-9 top-5 z-20 h-12 w-12" aria-label="Camera axis indicator"><span className="absolute left-5 top-5 h-2 w-2 rounded-full border border-[#1687f7]"/><span className="absolute left-6 top-0 h-6 w-[2px] bg-[#e95a55]"/><span className="absolute left-0 top-6 h-[2px] w-6 bg-[#73dc50]"/><span className="absolute left-6 top-6 h-5 w-[2px] bg-[#1687f7]"/></div>
      <div className="absolute right-6 top-[72px] z-20 grid gap-2">{[{icon:Lightbulb,label:"Lighting"},{icon:Globe2,label:"World"},{icon:Camera,label:"Reset view"},{icon:Grid3X3,label:"Assets"},{icon:CircleHelp,label:"Help"}].map(({icon:Icon,label})=><button key={label} aria-label={label} onClick={label==="Reset view"?()=>setView("Perspective"):undefined} className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#252525]/95 text-zinc-100 shadow-lg backdrop-blur hover:bg-[#353535]"><Icon size={20}/></button>)}</div>

      {props.selectedAsset && !`${props.selectedAsset.name} ${props.selectedAsset.prompt}`.toLowerCase().includes("desk") && (
        <button
          type="button"
          aria-label={`Manipulate ${props.selectedAsset.name}`}
          onPointerDown={beginDrag}
          onClick={() => { if (props.activeTool === "select") setObjectSelected((value) => !value); }}
          className={`crystal-object absolute left-1/2 top-[43%] h-[150px] w-[190px] cursor-grab active:cursor-grabbing ${objectSelected ? "crystal-object-selected" : ""}`}
          style={{ transform: `translate(calc(-50% + ${props.transform.x}px), calc(-50% + ${props.transform.y}px)) rotate(${props.transform.rotation}deg) scale(${props.transform.scale})` }}
        >
          <span className={`crystal-asset-cube crystal-view-${viewportMode} block h-full w-full ${objectSelected ? "crystal-asset-active" : ""}`} style={{ "--asset-color": props.color } as CSSProperties}><i className="crystal-cube-front"/><i className="crystal-cube-right"/><i className="crystal-cube-top"/></span>
          <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/45 px-3 py-1 text-[11px] text-zinc-200">{props.selectedAsset.name}</span>
        </button>
      )}

      <div className={`${chatOpen ? "" : "hidden"} absolute bottom-[80px] left-1/2 w-[488px] max-w-[calc(100%_-_32px)] -translate-x-1/2 rounded-[14px] border border-[#1687f7] bg-[#202020]/95 px-2 pb-2 pt-1 shadow-[0_10px_34px_rgba(0,0,0,.45),0_0_22px_rgba(22,135,247,.14)] backdrop-blur-md`}>
        {workspaceMode === "Images" && <div className="crystal-mobile-upgrade"><Zap size={18} fill="currentColor"/><b>Try Crystal Pro</b><button onClick={props.onOpenPricing}>Pay Now</button></div>}
        <textarea aria-label="AI model prompt" value={props.prompt} onChange={(event) => props.onPromptChange(event.target.value)} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") props.onGenerate(); }} placeholder="What do you want to create?" className="h-[68px] w-full resize-none bg-transparent px-2 py-3 text-[11px] text-zinc-100 outline-none placeholder:text-zinc-500" />
        {props.error && <div className="mb-2 flex items-center justify-between rounded-md bg-red-950/70 px-3 py-1.5 text-[11px] text-red-200"><span>{props.error}</span><button aria-label="Dismiss error" onClick={props.onClearError}><X size={14} /></button></div>}
        {props.loading && <div className="mb-2 h-1 overflow-hidden rounded-full bg-zinc-700"><div className="h-full bg-[#1687f7] transition-all" style={{ width: `${props.progress}%` }} /></div>}
        <div className="flex h-10 items-center gap-2">
          <input ref={attachmentInput} aria-label="Attach prompt reference" type="file" accept="image/*,.obj,.stl,.step,.glb,.gltf" className="sr-only" onChange={(event) => setAttachmentName(event.target.files?.[0]?.name ?? null)} />
          <IconButton icon={attachmentName ? Paperclip : Link2} label={attachmentName ? `Attached: ${attachmentName}` : "Attach reference"} onClick={() => attachmentInput.current?.click()} className="bg-[#303030]" />
          <label className="relative flex h-9 items-center rounded-[9px] bg-[#303030] text-[12px] text-zinc-100">
            <select aria-label="AI model" value={selectedModel} onChange={(event) => { setSelectedModel(event.target.value); setNotice(`${event.target.value} selected`); }} className="h-full appearance-none bg-transparent pl-4 pr-9 outline-none"><option className="bg-[#303030]">Precision Mode</option><option className="bg-[#303030]">Fast Concept</option><option className="bg-[#303030]">CAD Specialist</option></select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 text-zinc-300" />
          </label>
          {attachmentName && <button type="button" aria-label="Remove attachment" onClick={() => { setAttachmentName(null); if (attachmentInput.current) attachmentInput.current.value = ""; }} className="max-w-32 truncate rounded-full bg-[#303030] px-3 py-1.5 text-[10px] text-zinc-300">{attachmentName}</button>}
          <button type="button" disabled={props.loading || !props.prompt.trim()} onClick={props.onGenerate} aria-label="Generate 3D model" className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-[#1687f7] text-white transition hover:bg-[#2d9bff] disabled:cursor-not-allowed disabled:opacity-50">{props.loading ? <LoaderCircle className="animate-spin" size={18} /> : <Send size={18} fill="currentColor" />}</button>
        </div>
      </div>

      {openPanel === "brush" && <div className="absolute bottom-[204px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-[#333] bg-[#202020] p-2 shadow-xl">{["#b47272", "#1687f7", "#d5d5d5", "#e7a83e", "#54b88b"].map((swatch) => <button key={swatch} aria-label={`Apply ${swatch}`} onClick={() => { props.onColorChange(swatch); setNotice(`Material color changed to ${swatch}`); }} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10" style={{ backgroundColor: swatch }}>{props.color === swatch && <Check size={15} />}</button>)}</div>}
      {openPanel === "tools" && <div className="absolute bottom-[204px] left-1/2 z-20 grid w-[360px] -translate-x-1/2 grid-cols-4 gap-2 rounded-xl border border-[#333] bg-[#202020] p-2 shadow-xl">{(["x", "y", "rotation", "scale"] as const).map((field) => <label key={field} className="rounded-lg bg-[#303030] px-2 py-1 text-[9px] uppercase text-zinc-400">{field}<input aria-label={field} type="number" step={field === "scale" ? .1 : 1} value={props.transform[field]} onChange={(event) => props.onTransformChange({ ...props.transform, [field]: Number(event.target.value) })} className="mt-0.5 w-full bg-transparent text-[12px] normal-case text-white outline-none" /></label>)}</div>}

      <div className="crystal-modeling-tools absolute bottom-[18px] left-1/2 flex h-[56px] w-[488px] max-w-[calc(100%_-_32px)] -translate-x-1/2 items-center justify-between rounded-[14px] border border-[#292929] bg-[#202020] px-2 shadow-[0_8px_24px_rgba(0,0,0,.3)]">
        {modelingTools.slice(0, 5).map((tool) => <IconButton key={tool.id} icon={tool.icon} label={tool.label} active={props.activeTool === tool.id} onClick={() => selectTool(tool.id)} />)}
        <IconButton icon={Sparkles} label={chatOpen ? "Hide AI chat" : "Show AI chat"} onClick={() => setChatOpen((value) => !value)} />
        {modelingTools.slice(5).map((tool) => <IconButton key={tool.id} icon={tool.icon} label={tool.label} active={props.activeTool === tool.id} onClick={() => selectTool(tool.id)} />)}
      </div>
      <div aria-live="polite" className="sr-only">{notice}</div>
    </section>
  );
}
