"use client";

import { Camera, ChevronDown, CircleHelp, Download, DoorOpen, EyeOff, FolderOpen, Glasses, Globe2, Grid3X3, Hand, Lightbulb, Link2, LoaderCircle, MessageSquare, MousePointer2, Plus, Ruler, Send, Share2, Sofa, SquareDashed, TextCursorInput, Trash2, X, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { modelingTools } from "./data";
import { CubeFilled, SparkleFilled } from "./filled-icons";
import type { FloorPlanObject, FloorPlanPoint, FloorPlanSettings, StudioAsset, StudioMode, StudioTool, Transform } from "./types";
import { formatFloorLength, floorSnapPoint, parseFloorLength, roundFloorValue } from "./floor-plan-geometry";
import { IconButton } from "./ui";

type Props = { renderer:string; selectedAsset?:StudioAsset; activeTool:StudioTool; prompt:string; loading:boolean; progress:number; error:string|null; transform:Transform; color:string; roughness:number; metallic:number; incognito?:boolean; studioMode?:StudioMode; onStudioModeChange?:(v:StudioMode)=>void; floorPlanObjects?:FloorPlanObject[]; selectedFloorPlanId?:string|null; floorPlanSettings?:FloorPlanSettings; onFloorPlanSettingsChange?:(settings:FloorPlanSettings)=>void; onFloorPlanObjectsChange?:(objects:FloorPlanObject[])=>void; onSelectFloorPlanObject?:(id:string|null)=>void; onToolChange:(v:StudioTool)=>void; onPromptChange:(v:string)=>void; onGenerate:()=>void; onTransformChange:(v:Transform)=>void; onClearError:()=>void; onAssetDrop:(v:string)=>void; onCreateObject:()=>void; onSelectAsset:(id:string)=>void; onColorChange:(v:string)=>void; onOpenPricing:()=>void; onSnapshot:()=>void };
type Camera={yaw:number;pitch:number;distance:number;panX:number;panY:number};
type Point={x:number;y:number};
const cameraStart:Camera={yaw:.74,pitch:.48,distance:12,panX:0,panY:0};
const snapToGrid=(value:number,step=0.5)=>Math.round(value/step)*step;
const shade=(hex:string,n:number)=>{const c=parseInt(hex.slice(1),16),f=(x:number)=>Math.max(0,Math.min(255,Math.round(x*n)));return `rgb(${f(c>>16)},${f((c>>8)&255)},${f(c&255)})`};
const NEAR_PLANE=.75;

function cameraDepth(point:[number,number,number], camera:Camera) {
  const [x,y,z]=point, cy=Math.cos(camera.yaw), sy=Math.sin(camera.yaw), cp=Math.cos(camera.pitch), sp=Math.sin(camera.pitch);
  const rz=x*sy+z*cy;
  return y*sp+rz*cp+camera.distance;
}

function project(point:[number,number,number], camera:Camera, rect:DOMRect) {
  const [x,y,z]=point, cy=Math.cos(camera.yaw), sy=Math.sin(camera.yaw), cp=Math.cos(camera.pitch), sp=Math.sin(camera.pitch);
  const rx=x*cy-z*sy, rz=x*sy+z*cy, ry=y*cp-rz*sp, d=cameraDepth(point,camera);
  return { x:rect.width/2+camera.panX+rx*620/d, y:rect.height*.53+camera.panY-ry*620/d, d };
}

function CanvasScene({camera,color,roughness,metallic,grid,selected,face,drawings,measurement,transform}:{camera:Camera;color:string;roughness:number;metallic:number;grid:boolean;selected:boolean;face:number|null;drawings:Point[][];measurement:{a:Point;b:Point}|null;transform:Transform}) {
  const canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{const node=canvas.current;if(!node)return;const draw=()=>{const rect=node.getBoundingClientRect(),ratio=devicePixelRatio,ctx=node.getContext("2d");if(!ctx)return;node.width=rect.width*ratio;node.height=rect.height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.fillStyle="#171717";ctx.fillRect(0,0,rect.width,rect.height);
    const line=(a:[number,number,number],b:[number,number,number],stroke:string,width=1)=>{const da=cameraDepth(a,camera),db=cameraDepth(b,camera);if(da<NEAR_PLANE&&db<NEAR_PLANE)return;let start=a,end=b;if(da<NEAR_PLANE||db<NEAR_PLANE){const t=(NEAR_PLANE-da)/(db-da);const clipped:[number,number,number]=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];if(da<NEAR_PLANE)start=clipped;else end=clipped}const p1=project(start,camera,rect),p2=project(end,camera,rect);ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke()};
    if(grid){const minorStep=camera.distance>34?2:camera.distance>20?1:camera.distance>10?.5:.25;const majorStep=minorStep*5;const extent=Math.min(20,Math.max(2.5,(camera.distance-NEAR_PLANE)/(Math.SQRT2*Math.max(.22,Math.cos(camera.pitch)))*.9));const worldCorners:[number,number,number][]=[[-extent,0,-extent],[extent,0,-extent],[extent,0,extent],[-extent,0,extent]];const corners=worldCorners.map(point=>project(point,camera,rect));const visibleCorners=worldCorners.every(point=>cameraDepth(point,camera)>NEAR_PLANE);
      ctx.save();if(visibleCorners){ctx.beginPath();ctx.moveTo(corners[0].x,corners[0].y);corners.slice(1).forEach((corner)=>ctx.lineTo(corner.x,corner.y));ctx.closePath();ctx.fillStyle="rgba(36,38,41,.72)";ctx.fill();ctx.clip();}
      for(let n=-extent;n<=extent;n+=minorStep){const rounded=Math.round(n/minorStep)*minorStep,axis=Math.abs(rounded)<.001,major=Math.abs(Math.round(rounded/majorStep)*majorStep-rounded)<.001;const stroke=axis?"#e65353":major?"rgba(185,193,202,.34)":"rgba(135,143,153,.16)";const width=axis?1.7:major?1:.65;line([rounded,0,-extent],[rounded,0,extent],stroke,width);line([-extent,0,rounded],[extent,0,rounded],axis?"#65c466":major?"rgba(185,193,202,.34)":"rgba(135,143,153,.16)",width)}ctx.restore();
    }
    const radians=transform.rotation*Math.PI/180, c=Math.cos(radians), s=Math.sin(radians);
    const v:[number,number,number][]=[[-.5,0,-.5],[.5,0,-.5],[.5,0,.5],[-.5,0,.5],[-.5,1,-.5],[.5,1,-.5],[.5,1,.5],[-.5,1,.5]].map(([x,y,z])=>{const sx=x*transform.scale,sy=y*transform.scale,sz=z*transform.scale;return [sx*c-sz*s+transform.x,sy+transform.y,sx*s+sz*c+(transform.z??0)]});
    const faces=[[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7],[3,2,1,0]];
    faces.map((indices,index)=>({indices,index,depth:indices.reduce((sum,j)=>sum+project(v[j],camera,rect).d,0)/indices.length})).sort((a,b)=>b.depth-a.depth).forEach(({indices,index})=>{const pts=indices.map(j=>project(v[j],camera,rect));ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);pts.slice(1).forEach(q=>ctx.lineTo(q.x,q.y));ctx.closePath();ctx.fillStyle=face===index?"rgba(22,135,247,.78)":shade(color,[.62,.8,1.04,.5,1.15,.72][index]*(.8+metallic*.2)*(1-roughness*.12));ctx.fill();ctx.strokeStyle=selected?"rgba(74,144,217,.95)":"rgba(235,242,250,.45)";ctx.lineWidth=selected?2:1;ctx.stroke()});
    drawings.forEach(path=>{ctx.strokeStyle="#4A90D9";ctx.lineWidth=2;ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke()});
    if(measurement){ctx.strokeStyle="#f5c451";ctx.setLineDash([6,4]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(measurement.a.x,measurement.a.y);ctx.lineTo(measurement.b.x,measurement.b.y);ctx.stroke();ctx.setLineDash([]);const d=Math.hypot(measurement.b.x-measurement.a.x,measurement.b.y-measurement.a.y)/62;ctx.fillStyle="#f5c451";ctx.font="12px Roboto, sans-serif";ctx.fillText(`${d.toFixed(2)} m`,(measurement.a.x+measurement.b.x)/2+8,(measurement.a.y+measurement.b.y)/2-8)}
  };draw();const observer=new ResizeObserver(draw);observer.observe(node);return()=>observer.disconnect()},[camera,color,roughness,metallic,grid,selected,face,drawings,measurement,transform]);
  return <canvas ref={canvas} aria-label="Interactive 3D perspective grid" className="absolute inset-0 h-full w-full"/>;
}

const floorDistance = (a:FloorPlanPoint,b:FloorPlanPoint) => Math.hypot(b.x - a.x, b.y - a.y);
const floorInitialObjects = (objects:FloorPlanObject[]|undefined) => objects ?? [];

function FloorPlanViewport({ p }: { p: Props }) {
  const objects = floorInitialObjects(p.floorPlanObjects);
  const [view,setView] = useState({ zoom: 72, panX: 0, panY: 0 });
  const [size,setSize] = useState({ width: 0, height: 0 });
  const [tool,setTool] = useState<"select"|"wall"|"door"|"window"|"room"|"dimension"|"measure"|"text"|"furniture"|"delete">("select");
  const [drag,setDrag] = useState<{start:FloorPlanPoint;current:FloorPlanPoint}|null>(null);
  const [measure,setMeasure] = useState<{start:FloorPlanPoint;current:FloorPlanPoint}|null>(null);
  const [panning,setPanning] = useState<{x:number;y:number;panX:number;panY:number}|null>(null);
  const [chat,setChat] = useState(true);
  const [aiModel,setAiModel] = useState("Precision Mode");
  const svgRef = useRef<SVGSVGElement>(null);
  const settings = p.floorPlanSettings ?? { unit: "mm", scale: 100, precision: 1, gridStepMm: 100, snapToGrid: true, snapToPoints: true, orthogonal: true };
  const setSettings = (patch: Partial<FloorPlanSettings>) => p.onFloorPlanSettingsChange?.({ ...settings, ...patch });
  useEffect(() => {
    const node = svgRef.current;
    if (!node) return;
    const updateSize = () => setSize({ width: node.clientWidth, height: node.clientHeight });
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const pointFromEvent = (event:React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const raw = { x: (event.clientX - rect.left - rect.width / 2 - view.panX) / view.zoom, y: (event.clientY - rect.top - rect.height / 2 - view.panY) / view.zoom };
    return floorSnapPoint(raw, objects, settings, view.zoom);
  };
  const updateObjects = (next:FloorPlanObject[]) => p.onFloorPlanObjectsChange?.(next);
  const select = (id:string|null) => p.onSelectFloorPlanObject?.(id);
  const addObject = (object:FloorPlanObject) => { updateObjects([...objects, object]); select(object.id); };
  const nearestWall = (point:FloorPlanPoint) => {
    let result: { point: FloorPlanPoint; rotation: number; distance: number } | null = null;
    const walls = objects.filter((item): item is Extract<FloorPlanObject,{type:"wall"}> => item.type === "wall");
    for (const wall of walls) {
      const dx = wall.end.x - wall.start.x, dy = wall.end.y - wall.start.y, length = Math.hypot(dx, dy) || 1;
      const t = Math.max(0, Math.min(1, ((point.x - wall.start.x) * dx + (point.y - wall.start.y) * dy) / (length * length)));
      const candidate = { x: wall.start.x + dx * t, y: wall.start.y + dy * t };
      const distance = floorDistance(point, candidate);
      if (result === null || distance < result.distance) result = { point: candidate, rotation: Math.atan2(dy, dx) * 180 / Math.PI, distance };
    }
    return result !== null && result.distance < 0.65 ? result : null;
  };
  const parsePrompt = () => {
    const text = p.prompt.toLowerCase();
    const size = text.match(/(-?\d+(?:[.,]\d+)?)\s*(mm|millimeters?|cm|centimeters?|m|meters?)?\s*(?:x|by)\s*(-?\d+(?:[.,]\d+)?)\s*(mm|millimeters?|cm|centimeters?|m|meters?)?/);
    const width = parseFloorLength(`${size?.[1] ?? 8}${size?.[2] ?? "m"}`, "m") ?? 8;
    const height = parseFloorLength(`${size?.[3] ?? 6}${size?.[4] ?? size?.[2] ?? "m"}`, "m") ?? 6;
    const names = ["living room","kitchen","bedroom","bathroom","office"].filter(name => text.includes(name));
    const roomNames = names.length ? names : ["Living room","Kitchen"];
    const next:FloorPlanObject[] = [
      { id: crypto.randomUUID(), type:"wall", start:{x:0,y:0}, end:{x:width,y:0}, thickness:.18 },
      { id: crypto.randomUUID(), type:"wall", start:{x:width,y:0}, end:{x:width,y:height}, thickness:.18 },
      { id: crypto.randomUUID(), type:"wall", start:{x:width,y:height}, end:{x:0,y:height}, thickness:.18 },
      { id: crypto.randomUUID(), type:"wall", start:{x:0,y:height}, end:{x:0,y:0}, thickness:.18 },
    ];
    const columns = Math.max(1, Math.ceil(Math.sqrt(roomNames.length)));
    roomNames.forEach((name,index) => {
      const column = index % columns, row = Math.floor(index / columns);
      next.push({ id: crypto.randomUUID(), type:"room", x:roundFloorValue(column * width / columns + .25, settings.precision), y:roundFloorValue(row * height / columns + .25, settings.precision), width:roundFloorValue(width / columns - .5, settings.precision), height:roundFloorValue(height / Math.ceil(roomNames.length / columns) - .5, settings.precision), label:name.replace(/\b\w/g, char => char.toUpperCase()) });
    });
    updateObjects(next); select(null); p.onPromptChange("");
  };
  const completeDrag = (event:React.PointerEvent<SVGSVGElement>) => {
    if (panning) { setPanning(null); return; }
    if (!drag) return;
    const start = drag.start, end = drag.current;
    const preciseStart = { x: roundFloorValue(start.x, settings.precision), y: roundFloorValue(start.y, settings.precision) };
    const preciseEnd = { x: roundFloorValue(end.x, settings.precision), y: roundFloorValue(end.y, settings.precision) };
    if (tool === "wall" && floorDistance(preciseStart,preciseEnd) > .001) addObject({ id:crypto.randomUUID(), type:"wall", start: preciseStart, end: preciseEnd, thickness:roundFloorValue(.18, settings.precision) });
    if (tool === "dimension" && floorDistance(preciseStart,preciseEnd) > .001) addObject({ id:crypto.randomUUID(), type:"dimension", start: preciseStart, end: preciseEnd });
    if (tool === "measure") setMeasure({ start, current:end });
    if (tool === "room" && floorDistance(preciseStart,preciseEnd) > .001) addObject({ id:crypto.randomUUID(), type:"room", x:roundFloorValue(Math.min(preciseStart.x,preciseEnd.x), settings.precision), y:roundFloorValue(Math.min(preciseStart.y,preciseEnd.y), settings.precision), width:roundFloorValue(Math.abs(preciseEnd.x-preciseStart.x), settings.precision), height:roundFloorValue(Math.abs(preciseEnd.y-preciseStart.y), settings.precision), label:"New room" });
    setDrag(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const onDown = (event:React.PointerEvent<SVGSVGElement>) => {
    if ((event.target as Element).closest("button")) return;
    const point = pointFromEvent(event);
    if (event.button === 1 || (event.button === 0 && event.shiftKey)) { setPanning({x:event.clientX,y:event.clientY,panX:view.panX,panY:view.panY}); event.currentTarget.setPointerCapture(event.pointerId); return; }
    if (tool === "select" || tool === "delete") { select(null); return; }
    if (tool === "door") { const wall = nearestWall(point); if (wall !== null) addObject({id:crypto.randomUUID(),type:"door",x:roundFloorValue(wall.point.x, settings.precision),y:roundFloorValue(wall.point.y, settings.precision),width:roundFloorValue(.9, settings.precision),height:roundFloorValue(.12, settings.precision),rotation:wall.rotation,swing:"in",side:"right"}); return; }
    if (tool === "window") { const wall = nearestWall(point); if (wall !== null) addObject({id:crypto.randomUUID(),type:"window",x:roundFloorValue(wall.point.x, settings.precision),y:roundFloorValue(wall.point.y, settings.precision),width:roundFloorValue(1.2, settings.precision),height:roundFloorValue(.12, settings.precision),rotation:wall.rotation,sillHeight:roundFloorValue(.9, settings.precision),windowType:"double"}); return; }
    if (tool === "text") { addObject({id:crypto.randomUUID(),type:"text",x:point.x,y:point.y,text:"Note"}); return; }
    if (tool === "furniture") { addObject({id:crypto.randomUUID(),type:"furniture",x:point.x-.45,y:point.y-.3,width:.9,height:.6,label:"Furniture"}); return; }
    setDrag({start:point,current:point}); event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onMove = (event:React.PointerEvent<SVGSVGElement>) => {
    if (panning) { setView(current => ({...current,panX:panning.panX + event.clientX - panning.x,panY:panning.panY + event.clientY - panning.y})); return; }
    if (drag) {
      let current = pointFromEvent(event);
      if (settings.orthogonal && tool === "wall") {
        const dx = Math.abs(current.x - drag.start.x), dy = Math.abs(current.y - drag.start.y);
        current = dx >= dy ? { x: current.x, y: drag.start.y } : { x: drag.start.x, y: current.y };
      }
      setDrag({...drag,current});
    }
  };
  const objectAt = (object:FloorPlanObject, point:FloorPlanPoint) => {
    if (object.type === "wall" || object.type === "dimension") {
      const length = floorDistance(object.start,object.end), t = Math.max(0,Math.min(1,((point.x-object.start.x)*(object.end.x-object.start.x)+(point.y-object.start.y)*(object.end.y-object.start.y))/(length*length || 1)));
      return floorDistance(point,{x:object.start.x+(object.end.x-object.start.x)*t,y:object.start.y+(object.end.y-object.start.y)*t}) < .2;
    }
    if ("width" in object && "height" in object) return point.x >= object.x && point.x <= object.x+object.width && point.y >= object.y && point.y <= object.y+object.height;
    return object.type === "text" && floorDistance(point,{x:object.x,y:object.y}) < .35;
  };
  const tools = [
    ["select","Select",MousePointer2],["wall","Wall",SquareDashed],["door","Door",DoorOpen],["window","Window",SquareDashed],["room","Room",SquareDashed],["dimension","Dimension",Ruler],["measure","Measure",Ruler],["text","Text",TextCursorInput],["furniture","Furniture",Sofa],["delete","Delete",Trash2],
  ] as const;
  useEffect(() => {
    const handler = (event:KeyboardEvent) => {
      if ((event.target as HTMLElement)?.matches("input,textarea,select")) return;
      const key = event.key.toLowerCase();
      const shortcuts:Record<string,typeof tool> = { v:"select", w:"wall", d:"door", n:"window", r:"room", m:"measure", t:"text", f:"furniture" };
      if (shortcuts[key]) setTool(shortcuts[key]);
      if (event.key === "Delete" || event.key === "Backspace") {
        const selectedId = p.selectedFloorPlanId;
        if (selectedId) { updateObjects(objects.filter(object => object.id !== selectedId)); select(null); }
      }
      if (event.key === "Escape") { setDrag(null); setMeasure(null); select(null); }
    };
    window.addEventListener("keydown",handler); return () => window.removeEventListener("keydown",handler);
  }, [objects,p.selectedFloorPlanId,tool]);
  const selectedId = p.selectedFloorPlanId;
  return <section className="floor-plan-canvas relative min-h-0 overflow-hidden bg-[#fbfbfa] text-zinc-800">
    <div className="crystal-mobile-modebar" role="tablist" aria-label="Mobile studio mode">
      <button type="button" role="tab" aria-selected="true" className="active">Floor plan</button>
      <button type="button" role="tab" aria-selected="false" onClick={() => { p.onStudioModeChange?.("modeling"); }}>Modeling</button>
      <button type="button" role="tab" aria-selected="false" onClick={() => { p.onStudioModeChange?.("modeling"); }}>Images</button>
    </div>
    {p.incognito && <div className="crystal-mobile-incognito-mode" role="status"><Glasses size={14} /> Incognito mode</div>}
    <svg ref={svgRef} className="absolute inset-0 h-full w-full cursor-crosshair" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={completeDrag} onPointerCancel={() => {setDrag(null);setPanning(null)}} onWheel={event => { event.preventDefault(); setView(current => ({...current,zoom:Math.max(24,Math.min(180,current.zoom * Math.exp(-event.deltaY * .001)))})); }} onContextMenu={event => event.preventDefault()}>
      <defs><pattern id="floor-dots" width={Math.max(8, settings.gridStepMm / 1000 * view.zoom)} height={Math.max(8, settings.gridStepMm / 1000 * view.zoom)} patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r={view.zoom > 55 ? 1 : .7} fill="#c9cbc8"/></pattern></defs>
      <rect width="100%" height="100%" fill="#fbfbfa"/><rect width="100%" height="100%" fill="url(#floor-dots)"/>
      <g transform={`translate(${size.width/2 + view.panX} ${size.height/2 + view.panY}) scale(${view.zoom})`}>
        {objects.filter(object => object.type === "room").map(room => <g key={room.id} onPointerDown={event => {event.stopPropagation(); if(tool==="delete"){updateObjects(objects.filter(item=>item.id!==room.id));select(null)} else if(tool==="select")select(room.id)}}><rect x={room.x} y={room.y} width={room.width} height={room.height} fill={selectedId===room.id?"#dbeafe":"#edf2f1"} stroke={selectedId===room.id?"#1687f7":"#c7d1d0"} strokeWidth=".025"/><text x={room.x+room.width/2} y={room.y+room.height/2} textAnchor="middle" fontSize=".22" fill="#64748b">{room.label}</text></g>)}
        {objects.filter(object => object.type === "wall").map(wall => <line key={wall.id} x1={wall.start.x} y1={wall.start.y} x2={wall.end.x} y2={wall.end.y} stroke={selectedId===wall.id?"#1687f7":"#30343b"} strokeWidth={wall.thickness} strokeLinecap="square" onPointerDown={event => {event.stopPropagation(); if(tool==="delete"){updateObjects(objects.filter(item=>item.id!==wall.id));select(null)} else if(tool==="select")select(wall.id)}}/>)}
        {objects.filter(object => object.type === "door" || object.type === "window").map(opening => <g key={opening.id} transform={`translate(${opening.x} ${opening.y}) rotate(${opening.rotation})`} onPointerDown={event => { event.stopPropagation(); if (tool === "delete") { updateObjects(objects.filter(item => item.id !== opening.id)); select(null); } else if (tool === "select") select(opening.id); }}>
          <rect x={-opening.width/2} y={-opening.height/2} width={opening.width} height={opening.height} fill="#f7f7f4" stroke="none"/>
          {opening.type === "door" ? <><path d={`M ${-opening.width/2} 0 A ${opening.width} ${opening.width} 0 0 1 ${opening.width/2} ${opening.width}`} fill="none" stroke={selectedId===opening.id?"#1687f7":"#475569"} strokeWidth=".025"/><line x1={-opening.width/2} y1="0" x2={-opening.width/2} y2={opening.width} stroke={selectedId===opening.id?"#1687f7":"#30343b"} strokeWidth=".04"/></> : <><line x1={-opening.width/2} y1={-opening.height/2} x2={opening.width/2} y2={-opening.height/2} stroke={selectedId===opening.id?"#1687f7":"#0891b2"} strokeWidth=".04"/><line x1={-opening.width/2} y1={opening.height/2} x2={opening.width/2} y2={opening.height/2} stroke={selectedId===opening.id?"#1687f7":"#0891b2"} strokeWidth=".04"/></>}
        </g>)}
        {objects.filter(object => object.type === "furniture").map(item => <g key={item.id} onPointerDown={event => {event.stopPropagation(); if(tool==="delete"){updateObjects(objects.filter(object=>object.id!==item.id));select(null)} else if(tool==="select")select(item.id)}}><rect x={item.x} y={item.y} width={item.width} height={item.height} rx=".06" fill={selectedId===item.id?"#bfdbfe":"#d7dee5"} stroke="#64748b" strokeWidth=".025"/><text x={item.x+item.width/2} y={item.y+item.height/2+.06} textAnchor="middle" fontSize=".13" fill="#475569">{item.label}</text></g>)}
        {objects.filter(object => object.type === "dimension").map(item => <g key={item.id} onPointerDown={event => {event.stopPropagation(); if(tool==="delete"){updateObjects(objects.filter(object => object.id !== item.id));select(null)} else if(tool==="select")select(item.id)}}><line x1={item.start.x} y1={item.start.y} x2={item.end.x} y2={item.end.y} stroke={selectedId===item.id?"#1687f7":"#d97706"} strokeWidth=".025" strokeDasharray=".12 .08"/><text x={(item.start.x+item.end.x)/2} y={(item.start.y+item.end.y)/2-.1} textAnchor="middle" fontSize=".18" fill="#a16207">{item.label ?? formatFloorLength(floorDistance(item.start,item.end), settings)}</text></g>)}
        {objects.filter(object => object.type === "text").map(item => <text key={item.id} x={item.x} y={item.y} fontSize=".24" fill={selectedId===item.id?"#1687f7":"#334155"} onPointerDown={event => {event.stopPropagation(); if(tool==="delete"){updateObjects(objects.filter(object=>object.id!==item.id));select(null)} else if(tool==="select")select(item.id)}}>{item.text}</text>)}
        {drag && <><line x1={drag.start.x} y1={drag.start.y} x2={drag.current.x} y2={drag.current.y} stroke="#1687f7" strokeWidth=".035" strokeDasharray=".12 .08"/><text x={(drag.start.x+drag.current.x)/2} y={(drag.start.y+drag.current.y)/2-.12} fontSize=".2" fill="#1687f7">{formatFloorLength(floorDistance(drag.start,drag.current), settings)}</text></>}
        {measure && <><line x1={measure.start.x} y1={measure.start.y} x2={measure.current.x} y2={measure.current.y} stroke="#eab308" strokeWidth=".035" strokeDasharray=".12 .08"/><text x={(measure.start.x+measure.current.x)/2} y={(measure.start.y+measure.current.y)/2-.12} fontSize=".2" fill="#a16207">{formatFloorLength(floorDistance(measure.start,measure.current), settings)}</text></>}
      </g>
    </svg>
    <div className="absolute left-5 top-5 rounded-lg border border-[#d8d9d4] bg-white/90 px-3 py-2 text-[10px] text-zinc-500 shadow-sm">Top view · 1:{settings.scale} · {settings.gridStepMm} mm grid · {formatFloorLength(view.panX / view.zoom, settings)} / {formatFloorLength(view.panY / view.zoom, settings)}</div>
    <div className="absolute right-5 top-5 flex gap-1 rounded-xl border border-[#d8d9d4] bg-white/90 p-1 shadow-sm"><button title="Pan" onClick={() => setTool("select")} className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100"><Hand size={15}/></button><button title="Zoom in" onClick={() => setView(current => ({...current,zoom:Math.min(260,current.zoom*1.2)}))} className="rounded-lg px-2 text-sm text-zinc-500 hover:bg-zinc-100">+</button><button title="Zoom out" onClick={() => setView(current => ({...current,zoom:Math.max(24,current.zoom/1.2)}))} className="rounded-lg px-2 text-sm text-zinc-500 hover:bg-zinc-100">−</button><button title="Fit drawing" onClick={() => setView(current => ({...current,zoom:72,panX:0,panY:0}))} className="rounded-lg px-2 text-[10px] text-zinc-500 hover:bg-zinc-100">Fit</button><button title="Grid snap" onClick={() => setSettings({ snapToGrid: !settings.snapToGrid })} className={`rounded-lg px-2 text-[10px] ${settings.snapToGrid?"bg-[#e5effb] text-[#1687f7]":"text-zinc-500"} hover:bg-zinc-100`}>Grid</button><button title="Point snap" onClick={() => setSettings({ snapToPoints: !settings.snapToPoints })} className={`rounded-lg px-2 text-[10px] ${settings.snapToPoints?"bg-[#e5effb] text-[#1687f7]":"text-zinc-500"} hover:bg-zinc-100`}>Points</button><button title="Toggle orthogonal" onClick={() => setSettings({ orthogonal: !settings.orthogonal })} className={`rounded-lg px-2 text-[10px] ${settings.orthogonal?"bg-[#e5effb] text-[#1687f7]":"text-zinc-500"} hover:bg-zinc-100`}>Ortho</button><select aria-label="Grid spacing" value={settings.gridStepMm} onChange={event=>setSettings({ gridStepMm: Number(event.target.value) })} className="rounded-lg bg-transparent px-1 text-[10px] text-zinc-500 outline-none"><option value="10">10 mm</option><option value="50">50 mm</option><option value="100">100 mm</option><option value="250">250 mm</option></select></div>
    <div className="absolute bottom-[18px] left-1/2 flex h-[54px] max-w-[calc(100%_-_30px)] -translate-x-1/2 items-center gap-1 rounded-[12px] border border-[#343434] bg-[#202020] px-2 shadow-[0_10px_24px_rgba(0,0,0,.25)]">{tools.map(([id,label,Icon]) => <button key={id} title={`${label}${id==="wall"?" — W":""}`} onClick={() => setTool(id)} className={`grid h-9 min-w-9 place-items-center rounded-[9px] px-2 text-[10px] ${tool===id?"bg-[#1687f7] text-white":"text-zinc-200 hover:bg-[#343434]"}`}><Icon size={16}/><span className="hidden xl:inline ml-1">{label}</span></button>)}</div>
    {chat ? <div className="crystal-ai-prompt absolute bottom-[80px] left-1/2 w-[488px] max-w-[calc(100%_-_32px)] -translate-x-1/2 rounded-[12px] border border-[#1687f2] bg-[#202020] px-2 pb-2 pt-1 shadow-[0_12px_28px_rgba(0,0,0,.28)]"><div className="crystal-mobile-upgrade"><Zap size={18}/><b>Try Crystal Pro</b><button onClick={p.onOpenPricing}>Pay Now</button></div><div className="flex items-start gap-2"><textarea aria-label="AI floor-plan prompt" value={p.prompt} onChange={event => p.onPromptChange(event.target.value)} onKeyDown={event => {if((event.ctrlKey||event.metaKey)&&event.key==="Enter")parsePrompt()}} placeholder="What do you want to create?" className="h-[68px] min-w-0 flex-1 resize-none bg-transparent px-2 py-3 text-[11px] outline-none"/><button type="button" aria-label="Hide AI chat" title="Hide AI chat" onClick={() => setChat(false)} className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-[7px] text-zinc-400 hover:bg-[#303030] hover:text-white"><X size={15}/></button></div><div className="flex h-10 items-center gap-2"><label className="grid h-9 w-9 cursor-pointer place-items-center rounded-[9px] bg-[#303030] text-zinc-200" aria-label="Attach reference"><Link2 size={16}/><input type="file" accept="image/png,image/jpeg" className="sr-only"/></label><label className="relative flex h-9 items-center rounded-[9px] bg-[#303030] text-[11px] text-zinc-200"><select aria-label="AI mode" value={aiModel} onChange={event => setAiModel(event.target.value)} className="h-full appearance-none bg-transparent pl-3 pr-8 outline-none"><option>Precision Mode</option><option>Fast Concept</option></select><ChevronDown size={14} className="pointer-events-none absolute right-2 top-3"/></label><button disabled={!p.prompt.trim()} onClick={parsePrompt} className="ml-auto grid h-9 w-9 place-items-center rounded-[9px] bg-[#1687f7] text-white disabled:opacity-40"><Send size={16}/></button></div></div> : <button type="button" aria-label="Show AI chat" title="Show AI chat" onClick={() => setChat(true)} className="absolute bottom-[80px] left-1/2 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-[10px] border border-[#1687f7] bg-[#202020] text-[#1687f2] shadow-[0_8px_20px_rgba(0,0,0,.2)]"><MessageSquare size={17}/></button>}
    <div className="pointer-events-none absolute bottom-2 right-5 text-[10px] text-zinc-500">Wheel zoom · Shift-drag pan · W wall · D door · N window · Delete remove</div>
  </section>;
}

export function Viewport(p:Props){
  const [camera,setCamera]=useState(cameraStart), drag=useRef<{x:number;y:number;base:Camera;mode:"orbit"|"pan"|"dolly"}|null>(null), transformBase=useRef<Transform|null>(null), objectCreate=useRef<{x:number;y:number;transform:Transform}|null>(null);
  const [mode,setMode]=useState<"floor-plan"|"modeling"|"images">("images"),[chat,setChat]=useState(true),[mobileToolsOpen,setMobileToolsOpen]=useState(false),[textureOpen,setTextureOpen]=useState(false),[showImagePreview,setShowImagePreview]=useState(false),[grid,setGrid]=useState(true),[help,setHelp]=useState(false),[lighting,setLighting]=useState(false),[world,setWorld]=useState(false),[model,setModel]=useState("Precision Mode"),[referenceImage,setReferenceImage]=useState<string|null>(null);
  const [playing,setPlaying]=useState(false),[selected,setSelected]=useState(Boolean(p.selectedAsset)),[face,setFace]=useState<number|null>(null),[drawings,setDrawings]=useState<Point[][]>([]),[drawing,setDrawing]=useState<Point[]|null>(null),[measureStart,setMeasureStart]=useState<Point|null>(null),[measurement,setMeasurement]=useState<{a:Point;b:Point}|null>(null),[history,setHistory]=useState<Transform[]>([]),[future,setFuture]=useState<Transform[]>([]);
  const selectMobileMode = (nextMode:"floor-plan"|"modeling"|"images") => {
    setMode(nextMode);
    setChat(true);
    setMobileToolsOpen(false);
    p.onStudioModeChange?.(nextMode === "floor-plan" ? "floor-plan" : "modeling");
  };
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const setView=useCallback((view:string)=>{const presets:Record<string,Partial<Camera>>={Perspective:{yaw:.74,pitch:.48},Top:{yaw:0,pitch:1.52},Front:{yaw:Math.PI,pitch:.02},Right:{yaw:-Math.PI/2,pitch:.02}};setCamera(c=>({...c,...(presets[view]??presets.Perspective),distance:12,panX:0,panY:0}))},[]);
  const toolMode = p.activeTool==="orbit"?"realtime":p.activeTool==="brush"?"draw":p.activeTool==="tools"?"measure":p.activeTool==="model"?"object":p.activeTool==="viewport"?"navigation":p.activeTool;
  const remember=(next:Transform)=>{setHistory(h=>h.length && h[h.length-1]===p.transform ? h : [...h,p.transform].slice(-30));setFuture([]);p.onTransformChange(next)};
  const pointFromEvent=(event:React.PointerEvent)=>{const rect=event.currentTarget.getBoundingClientRect();return{x:event.clientX-rect.left,y:event.clientY-rect.top}};
  const scenePoint=(point:Point)=>{const rect=canvasRef.current?.getBoundingClientRect();if(!rect)return{x:0,y:0};return{x:(point.x-rect.width/2-camera.panX)*camera.distance/620,y:(rect.height*.53+camera.panY-point.y)*camera.distance/620}};
  const cubeFaces=useMemo(()=>{const rect=canvasRef.current?.getBoundingClientRect();if(!rect)return [];const radians=p.transform.rotation*Math.PI/180,c=Math.cos(radians),s=Math.sin(radians);const v:[number,number,number][]=[[-.5,0,-.5],[.5,0,-.5],[.5,0,.5],[-.5,0,.5],[-.5,1,-.5],[.5,1,-.5],[.5,1,.5],[-.5,1,.5]].map(([x,y,z])=>{const sx=x*p.transform.scale,sy=y*p.transform.scale,sz=z*p.transform.scale;return [sx*c-sz*s+p.transform.x,sy+p.transform.y,sx*s+sz*c+(p.transform.z??0)]});return [[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7],[3,2,1,0]].map(indices=>indices.map(i=>project(v[i],camera,rect)))},[camera,p.transform]);
  const hitFace=(point:Point)=>cubeFaces.findIndex(poly=>{let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const xi=poly[i].x,yi=poly[i].y,xj=poly[j].x,yj=poly[j].y;const intersect=((yi>point.y)!==(yj>point.y))&&point.x<(xj-xi)*(point.y-yi)/(yj-yi)+xi;if(intersect)inside=!inside}return inside});
  const focus=()=>{if(selected){setCamera(c=>({...c,distance:7,panX:0,panY:0}));}};
  const runCommand=()=>{const text=p.prompt.toLowerCase();const number=Number(text.match(/-?\d+(?:\.\d+)?/)?.[0]??"0");if(!number)return false;if(text.includes("move")||text.includes("right")){remember({...p.transform,x:p.transform.x+number});return true}if(text.includes("rotate")){remember({...p.transform,rotation:p.transform.rotation+number});return true}return false};
  useEffect(()=>{const handler=(e:KeyboardEvent)=>{if((e.target as HTMLElement)?.matches("input,textarea,select"))return;const key=e.key.toLowerCase();if(key==="q")p.onToolChange("select");else if(key==="w"||key==="g")p.onToolChange("move");else if(key==="e")p.onToolChange("rotate");else if(key==="s")p.onToolChange("scale");else if(key==="f")focus();else if(e.key==="Escape"){setMeasureStart(null);setDrawing(null);setFace(null);setMeasurement(null)}else if(e.key==="Delete"||e.key==="Backspace"){if(selected){setSelected(false);p.onAssetDrop("")}}else if((e.ctrlKey||e.metaKey)&&key==="z"){e.preventDefault();const previous=history.at(-1);if(previous){setHistory(h=>h.slice(0,-1));setFuture(f=>[p.transform,...f]);p.onTransformChange(previous)}}else if((e.ctrlKey||e.metaKey)&&(key==="y"||(e.shiftKey&&key==="z"))){e.preventDefault();const next=future.at(-1);if(next){setFuture(f=>f.slice(0,-1));setHistory(h=>[...h,p.transform]);p.onTransformChange(next)}}else{const views:Record<string,string>={"1":"Front","3":"Right","7":"Top","0":"Perspective",".":"Perspective"};if(views[e.key])setView(views[e.key])}};window.addEventListener("keydown",handler);return()=>window.removeEventListener("keydown",handler)},[history,future,p.transform,selected,p]);
  useEffect(()=>{if(p.selectedAsset)setSelected(true)},[p.selectedAsset]);
  useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>p.onTransformChange({...p.transform,rotation:p.transform.rotation+2}),40);return()=>window.clearInterval(timer)},[playing,p.onTransformChange,p.transform]);
  const onPointerDown=(event:React.PointerEvent)=>{if((event.target as HTMLElement).closest("button,input,select,textarea,label"))return;const point=pointFromEvent(event);const cameraMode=event.button===1&&event.ctrlKey?"dolly":event.button===2||event.button===1?"orbit":event.button===0&&event.shiftKey?"pan":null;if(cameraMode){event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);drag.current={x:event.clientX,y:event.clientY,base:camera,mode:cameraMode};return}if(toolMode==="realtime")return;if(toolMode==="object"){const position=scenePoint(point);const startTransform={x:position.x,y:0,z:position.y,rotation:0,scale:.05};objectCreate.current={x:point.x,y:point.y,transform:startTransform};p.onCreateObject();p.onTransformChange(startTransform);setSelected(true);event.currentTarget.setPointerCapture(event.pointerId);return}if(toolMode==="draw"){setDrawing([point]);event.currentTarget.setPointerCapture(event.pointerId);return}if(toolMode==="measure"){if(!measureStart)setMeasureStart(point);else{setMeasurement({a:measureStart,b:point});setMeasureStart(null)}return}if(toolMode==="scale"){const index=hitFace(point);setFace(index>=0?index:null);setSelected(index>=0||selected);if(index>=0)p.onSelectAsset(p.selectedAsset?.id??"industrial-desk");if(selected){event.currentTarget.setPointerCapture(event.pointerId);transformBase.current=p.transform;drag.current={x:event.clientX,y:event.clientY,base:camera,mode:"pan"}}return}if(toolMode==="select"){const index=hitFace(point);setSelected(index>=0);if(index>=0)p.onSelectAsset(p.selectedAsset?.id??"industrial-desk");else{setFace(null);p.onSelectAsset("")}return}if(toolMode==="move"||toolMode==="rotate"){if(!selected)return;event.currentTarget.setPointerCapture(event.pointerId);transformBase.current=p.transform;drag.current={x:event.clientX,y:event.clientY,base:camera,mode:"pan"};return}};
  const onPointerMove=(event:React.PointerEvent)=>{const point=pointFromEvent(event);if(objectCreate.current){const dx=point.x-objectCreate.current.x,dy=point.y-objectCreate.current.y;const size=Math.max(0.05,Math.min(10,Math.hypot(dx,dy)/62));p.onTransformChange({...objectCreate.current.transform,scale:size});return}if(drawing){setDrawing(path=>path?[...path,point]:path);return}const d=drag.current;if(!d)return;const dx=event.clientX-d.x,dy=event.clientY-d.y;if(toolMode==="move"&&transformBase.current){const worldScale=d.base.distance/620;remember({...transformBase.current,x:snapToGrid(transformBase.current.x+dx*worldScale),z:snapToGrid((transformBase.current.z??0)-dy*worldScale)})}else if(toolMode==="rotate"&&transformBase.current)remember({...transformBase.current,rotation:transformBase.current.rotation+dx*.5});else if(toolMode==="scale"&&transformBase.current)remember({...transformBase.current,scale:Math.max(.1,Math.min(10,transformBase.current.scale-dy*.01))});else if(d.mode==="pan")setCamera({...d.base,panX:d.base.panX+dx,panY:d.base.panY+dy});else if(d.mode==="dolly")setCamera({...d.base,distance:Math.max(2.1,Math.min(42,d.base.distance*Math.exp(dy*.012)))});else setCamera({...d.base,yaw:d.base.yaw-dx*.008,pitch:Math.max(-1.38,Math.min(1.38,d.base.pitch+dy*.007))})};
  const onPointerUp=(event:React.PointerEvent)=>{if(objectCreate.current)objectCreate.current=null;if(drawing){if(drawing.length>1)setDrawings(paths=>[...paths,drawing]);setDrawing(null)}drag.current=null;transformBase.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)};
  const submit=()=>{if(toolMode==="ai"&&runCommand()){p.onPromptChange("");return}p.onGenerate()};
  if (p.studioMode === "floor-plan") return <FloorPlanViewport p={p}/>;
  return <section ref={canvasRef as React.RefObject<HTMLElement>} className={`relative min-h-0 overflow-hidden bg-[#171717] ${mobileToolsOpen ? "crystal-mobile-tools-open" : ""} ${toolMode==="object"||toolMode==="draw"?"cursor-crosshair":toolMode==="move"?"cursor-move":toolMode==="rotate"?"cursor-grab":"cursor-default"}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={()=>{objectCreate.current=null;drag.current=null;setDrawing(null)}} onContextMenu={e=>e.preventDefault()} onWheel={e=>{e.preventDefault();setCamera(c=>({...c,distance:Math.max(2.1,Math.min(42,c.distance*Math.exp(e.deltaY*.0012)))}))}} onDragOver={e=>e.preventDefault()} onDrop={e=>{const id=e.dataTransfer.getData("text/asset-id");if(id){p.onAssetDrop(id);setSelected(true)}}}>
    {mode === "images" ? showImagePreview && <div className="crystal-mobile-build-frame"><img src={referenceImage || "/Build.png"} alt={referenceImage ? "Uploaded reference" : "Generated Build preview"} /><div className="crystal-mobile-build-actions"><button type="button" aria-label="Share image" onClick={() => { const image = referenceImage || `${window.location.origin}/Build.png`; if (navigator.share) void navigator.share({ title: "Crystal image", url: image }); else void navigator.clipboard?.writeText(image); }}><Share2 size={17} /></button><a href={referenceImage || "/Build.png"} download="Build.png" aria-label="Download image"><Download size={18} /></a></div></div> : <><CanvasScene camera={camera} color={p.color} roughness={p.roughness} metallic={p.metallic} grid={grid} selected={selected} face={face} drawings={drawing?[...drawings,drawing]:drawings} measurement={measurement} transform={p.transform}/><div className="pointer-events-none absolute bottom-5 left-5 rounded-md bg-black/25 px-2 py-1 text-[10px] text-zinc-300">RMB / MMB: orbit · Shift + LMB: pan · Ctrl + MMB: dolly · Wheel: zoom</div></>}
    <div className="crystal-mobile-modebar" role="tablist" aria-label="Mobile studio mode">
      {(["floor-plan", "modeling", "images"] as const).map((item) => <button key={item} type="button" role="tab" aria-selected={mode === item} onClick={() => selectMobileMode(item)} className={mode === item ? "active" : ""}>{item === "floor-plan" ? "Floor plan" : item[0].toUpperCase() + item.slice(1)}</button>)}
    </div>
    <div className="crystal-mobile-empty-state" aria-hidden="true"><img src="/Logo.png" alt="Crystal" /><span>What should we create?</span></div>
    {textureOpen && <div className="crystal-mobile-texture-panel" aria-label="Texture modeling">
      <div className="crystal-mobile-texture-heading"><div><strong>Texture Modeling</strong><span>Create new texture<br />from photo</span></div><button type="button" aria-label="Add texture"><Plus size={18} /></button></div>
      <div className="crystal-mobile-texture-grid">{["chrome-black","chrome-white","stone","ocean","violet","purple"].map((textureName) => <button type="button" key={textureName} aria-label={`Use ${textureName} texture`} className={`crystal-texture-card ${textureName}`} onClick={() => setTextureOpen(false)}><span /></button>)}</div>
    </div>}
    <div className={`crystal-mobile-model-tools ${mobileToolsOpen ? "is-visible" : ""}`} aria-label="Studio tools">
      <button type="button" aria-label="Play or pause animation" className={playing ? "active" : ""} onClick={() => setPlaying(value => !value)}><span className="crystal-tool-record" /></button>
      <button type="button" aria-label="Texture modeling" className={`crystal-mobile-texture-trigger ${textureOpen ? "active" : ""}`} onClick={() => { setTextureOpen(value => !value); setMobileToolsOpen(true); setChat(true); }}><CubeFilled size={18} /><span>Texture</span></button>
      <button type="button" aria-label="Toggle object visibility" className={!selected ? "active" : ""} onClick={() => { setSelected(value => !value); p.onAssetDrop(selected ? "" : p.selectedAsset?.id ?? "industrial-desk"); }}><EyeOff size={20} /></button>
      <button type="button" aria-label="Open object assets" onClick={() => p.onToolChange("model")}><FolderOpen size={20} /></button>
      <button type="button" aria-label="Take snapshot" onClick={p.onSnapshot}><Camera size={20} /></button>
      <button type="button" aria-label="Toggle lighting tools" className={lighting ? "active" : ""} onClick={() => setLighting(value => !value)}><Lightbulb size={20} /></button>
      <button type="button" aria-label="Show modeling help" className={help ? "active" : ""} onClick={() => setHelp(value => !value)}><CircleHelp size={20} /></button>
    </div>
    <div className="crystal-axis-gizmo absolute right-9 top-24 z-20 h-14 w-14" aria-label="Viewport axis navigation">
      <button onClick={()=>setView("Front")} className="absolute left-7 top-0 grid h-5 w-5 place-items-center rounded-full bg-[#78b7ff] text-[9px] font-bold text-[#10233d]" aria-label="View along Y axis">Y</button>
      <button onClick={()=>setView("Right")} className="absolute right-0 top-7 grid h-5 w-5 place-items-center rounded-full bg-[#ef5261] text-[9px] font-bold text-[#3d1118]" aria-label="View along X axis">X</button>
      <button onClick={()=>setView("Top")} className="absolute bottom-0 left-0 grid h-5 w-5 place-items-center rounded-full bg-[#8bd35b] text-[9px] font-bold text-[#193015]" aria-label="View along Z axis">Z</button>
      <span className="absolute left-1/2 top-1/2 h-8 w-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#8bd35b]/70" />
      <span className="absolute left-1/2 top-1/2 h-8 w-px -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#ef5261]/70" />
    </div>
    <div className="crystal-viewport-tools absolute right-6 top-[168px] z-20 grid gap-2">{[{I:Lightbulb,l:"Lighting",a:lighting,f:()=>setLighting(v=>!v)},{I:Globe2,l:"World",a:world,f:()=>setWorld(v=>!v)},{I:Grid3X3,l:"Toggle grid",a:grid,f:()=>setGrid(v=>!v)},{I:CircleHelp,l:"Help",a:help,f:()=>setHelp(v=>!v)}].map(({I,l,a,f})=><button key={l} title={l} onClick={f} className={`grid h-10 w-10 place-items-center rounded-[10px] border transition-all ${a?"border-[#4A90D9] bg-[#4A90D9] shadow-[0_0_0_3px_rgba(74,144,217,.35),0_4px_12px_rgba(74,144,217,.25)]":"border-transparent bg-[#252525]"}`}><I size={20}/></button>)}</div>{help&&<div className="absolute right-20 top-[168px] z-30 w-52 rounded-xl border border-white/10 bg-[#242424] p-4 text-xs shadow-2xl">MMB orbits, Shift + MMB pans, wheel zooms. Numpad 1/3/7/0 changes view.</div>}
    <div className={`${chat?"":"hidden"} crystal-ai-prompt absolute bottom-[80px] left-1/2 w-[488px] max-w-[calc(100%_-_32px)] -translate-x-1/2 rounded-[12px] bg-[#202020] px-2 pb-2 pt-1 shadow-[0_12px_28px_rgba(0,0,0,.28)]`}>{selected&&<button type="button" onClick={()=>p.onToolChange("ai")} className="mb-1 flex h-7 w-full items-center gap-2 rounded-[8px] px-2 text-left text-[11px] text-zinc-300 transition hover:bg-[#303030] hover:text-white"><span className="grid h-4 w-4 place-items-center rounded-[4px] bg-[#1687f7] text-[10px] text-white">+</span><span>Ask for changes</span><span className="ml-auto text-[10px] text-zinc-500">Edit object</span></button>}<div className="crystal-mobile-upgrade"><Zap size={18}/><b>Try Crystal Pro</b><button onClick={p.onOpenPricing}>Pay Now</button></div>{referenceImage&&<div className="crystal-mobile-reference"><img src={referenceImage} alt="Uploaded reference" /><button type="button" aria-label="Remove uploaded image" onClick={()=>setReferenceImage(null)}><X size={13}/></button></div>}<textarea aria-label="AI model prompt" value={p.prompt} onChange={e=>{p.onPromptChange(e.target.value);setChat(true)}} onFocus={()=>setChat(true)} onKeyDown={e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter")submit()}} enterKeyHint="send" placeholder={selected?"Ask for changes to this object":"What do you want to create?"} className="h-[68px] w-full resize-none bg-transparent px-2 py-3 text-[11px] outline-none"/>{p.error&&<div className="flex justify-between text-xs text-red-200"><span>{p.error}</span><button onClick={p.onClearError}><X size={14}/></button></div>}<div className="flex h-10 items-center gap-2"><label className="grid h-9 w-9 cursor-pointer place-items-center rounded-[9px] bg-[#303030] text-zinc-200" aria-label="Attach reference"><Link2 size={16}/>    <input type="file" accept="image/png,image/jpeg" className="sr-only" onChange={e=>{const file=e.target.files?.[0];if(file){setReferenceImage(URL.createObjectURL(file));setMobileToolsOpen(false);setChat(true)}e.currentTarget.value=""}}/></label><label className="relative flex h-9 items-center rounded-[9px] bg-[#303030] text-[12px]"><select value={model} onChange={e=>setModel(e.target.value)} className="h-full bg-transparent pl-4 pr-9 outline-none"><option>Precision Mode</option><option>Fast Concept</option></select><ChevronDown size={15} className="absolute right-3 top-2"/></label>            <button type="button" aria-label="Open studio tools" aria-expanded={mobileToolsOpen} onClick={() => { setMobileToolsOpen(true); setShowImagePreview(true); setChat(false); }} className="ml-auto grid h-9 w-9 place-items-center rounded-[9px] bg-[#1687f7]">{p.loading?<LoaderCircle className="animate-spin" size={18}/>:<Send size={18}/>}</button></div></div>
    <div className="crystal-modeling-tools absolute bottom-[18px] left-1/2 flex h-[52px] w-[488px] max-w-[calc(100%_-_32px)] -translate-x-1/2 items-center justify-between rounded-[12px] border border-[#343434] bg-[#202020] px-2 shadow-[0_10px_24px_rgba(0,0,0,.2)]">{modelingTools.slice(0,5).map(t=><IconButton key={t.id} icon={t.icon} label={t.label} active={p.activeTool===t.id} onClick={()=>{p.onToolChange(t.id);if(t.id==="focus")focus();if(t.id==="orbit")setPlaying(v=>!v);if(t.id==="select")setSelected(false)}}/>)}<IconButton icon={SparkleFilled} label="Crystal AI Assistant" active={p.activeTool==="ai"&&chat} onClick={()=>{p.onToolChange("ai");setChat(v=>!v)}}/>{modelingTools.slice(5).map(t=><IconButton key={t.id} icon={t.icon} label={t.label} active={p.activeTool===t.id} onClick={()=>p.onToolChange(t.id)}/>)}</div>
  </section>;
}
