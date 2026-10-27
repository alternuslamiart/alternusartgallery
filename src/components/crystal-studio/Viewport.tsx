"use client";
import { useStudioConversation, useStudioDock } from "@/components/crystal-studio/StudioConversation";

import { StudioToolbar } from "./kit";
import { StudioViewportToolbar, downloadStudioCSV } from "./StudioViewportToolbar";

import {
  Box,
  Camera,
  CircleHelp,
  Download,
  DoorOpen,
  EyeOff,
  FolderOpen,
  Glasses,
  Lightbulb,
  Maximize,
  MousePointer2,
  Move3D,
  Pause,
  Pencil,
  Play,
  Plus,
  Rotate3D,
  Ruler,
  Scaling,
  Share2,
  Sofa,
  SquareDashed,
  TextCursorInput,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CubeFilled } from "./filled-icons";
import {
  floorSnapPoint,
  floorDoorSymbol,
  floorPlaceOpening,
  floorTranslateObject,
  formatFloorLength,
  parseFloorLength,
  roundFloorValue,
} from "./floor-plan-geometry";
import { StudioAIChat } from "./StudioAIChat";
import type {
  FloorPlanObject,
  FloorPlanPoint,
  FloorPlanSettings,
  StudioAsset,
  StudioMode,
  StudioTool,
  Transform,
} from "./types";
import { IconButton } from "./ui";
import { useCrystalTheme } from "@/lib/crystal-theme";
import { readViewportTheme } from "./viewport-theme";
import { useStudioActionAdapter, verifyStudioState } from "./StudioActions";
import { normalizeCommand, STUDIO_ROUTES, type StudioAction } from "@/lib/studio-actions.mjs";
import type { StudioToolbarAPI } from "./StudioViewportToolbar";
import {useSketchEditor} from './SketchWorkspace';
import {createSketch,type SketchDocument} from '@/lib/sketch.mjs';
import type {useSketchProject} from './useSketchProject';

type Props = {
  sketch?:SketchDocument;
  onSketchChange?:(doc:SketchDocument)=>void;
  onSketchUndo?:()=>void;
  onSketchRedo?:()=>void;
  sketchCanUndo?:boolean;
  sketchCanRedo?:boolean;
  sketchProject?:ReturnType<typeof useSketchProject>;
  onFloorExport?:(format:string)=>void;
  onPencilModeChange?:(active:boolean)=>void;
  onOpenFloorFile?:()=>void;
  onStudioAction?:(action:StudioAction,signal:AbortSignal)=>Promise<string>;
  actionScope?:string;
  renderer: string;
  selectedAsset?: StudioAsset;
  activeTool: StudioTool;
  prompt: string;
  loading: boolean;
  progress: number;
  error: string | null;
  transform: Transform;
  color: string;
  roughness: number;
  metallic: number;
  incognito?: boolean;
  studioMode?: StudioMode;
  onStudioModeChange?: (v: StudioMode) => void;
  floorPlanObjects?: FloorPlanObject[];
  selectedFloorPlanId?: string | null;
  onHoverFloorPlanObject?: (id:string|null)=>void;
  floorPlanSettings?: FloorPlanSettings;
  onFloorPlanSettingsChange?: (settings: FloorPlanSettings) => void;
  onFloorPlanObjectsChange?: (objects: FloorPlanObject[]) => void;
  onSelectFloorPlanObject?: (id: string | null) => void;
  onToolChange: (v: StudioTool) => void;
  onPromptChange: (v: string) => void;
  onGenerate: () => void;
  onTransformChange: (v: Transform) => void;
  onClearError: () => void;
  onAssetDrop: (v: string) => void;
  onCreateObject: () => void;
  onSelectAsset: (id: string) => void;
  onColorChange: (v: string) => void;
  onOpenPricing: () => void;
  onSnapshot: () => void;
};

type CameraState = {
  yaw: number;
  pitch: number;
  distance: number;
  panX: number;
  panY: number;
};

type Point = { x: number; y: number };

const cameraStart: CameraState = {
  yaw: 0.74,
  pitch: 0.48,
  distance: 12,
  panX: 0,
  panY: 0,
};

const snapToGrid = (value: number, step = 0.5) => Math.round(value / step) * step;
const shade = (hex: string, n: number) => {
  const c = parseInt(hex.slice(1), 16);
  const f = (x: number) => Math.max(0, Math.min(255, Math.round(x * n)));
  return `rgb(${f(c >> 16)},${f((c >> 8) & 255)},${f(c & 255)})`;
};
const NEAR_PLANE = 0.75;

function cameraDepth(point: [number, number, number], camera: CameraState) {
  const [x, y, z] = point;
  const cy = Math.cos(camera.yaw);
  const sy = Math.sin(camera.yaw);
  const cp = Math.cos(camera.pitch);
  const sp = Math.sin(camera.pitch);
  const rz = x * sy + z * cy;
  return y * sp + rz * cp + camera.distance;
}

function project(
  point: [number, number, number],
  camera: CameraState,
  rect: DOMRect,
) {
  const [x, y, z] = point;
  const cy = Math.cos(camera.yaw);
  const sy = Math.sin(camera.yaw);
  const cp = Math.cos(camera.pitch);
  const sp = Math.sin(camera.pitch);
  const rx = x * cy - z * sy;
  const rz = x * sy + z * cy;
  const ry = y * cp - rz * sp;
  const d = cameraDepth(point, camera);
  return {
    x: rect.width / 2 + camera.panX + (rx * 620) / d,
    y: rect.height * 0.53 + camera.panY - (ry * 620) / d,
    d,
  };
}

function CanvasScene({
  camera,
  color,
  roughness,
  metallic,
  grid,
  selected,
  face,
  drawings,
  measurement,
  transform,
}: {
  camera: CameraState;
  color: string;
  roughness: number;
  metallic: number;
  grid: boolean;
  selected: boolean;
  face: number | null;
  drawings: Point[][];
  measurement: { a: Point; b: Point } | null;
  transform: Transform;
}) {
  const { theme } = useCrystalTheme();
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const node = canvas.current;
    if (!node) return;
    const draw = () => {
      const rect = node.getBoundingClientRect();
      const ratio = devicePixelRatio;
      const ctx = node.getContext("2d");
      if (!ctx) return;
      node.width = rect.width * ratio;
      node.height = rect.height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const bgGrad = ctx.createLinearGradient(0, 0, 0, rect.height);
      const palette = readViewportTheme();
      bgGrad.addColorStop(0, palette.top);
      bgGrad.addColorStop(0.54, palette.center);
      bgGrad.addColorStop(1, palette.bottom);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, rect.width, rect.height);
      const line = (
        a: [number, number, number],
        b: [number, number, number],
        stroke: string,
        width = 1,
      ) => {
        const da = cameraDepth(a, camera);
        const db = cameraDepth(b, camera);
        if (da < NEAR_PLANE && db < NEAR_PLANE) return;
        let start = a;
        let end = b;
        if (da < NEAR_PLANE || db < NEAR_PLANE) {
          const t = (NEAR_PLANE - da) / (db - da);
          const clipped: [number, number, number] = [
            a[0] + (b[0] - a[0]) * t,
            a[1] + (b[1] - a[1]) * t,
            a[2] + (b[2] - a[2]) * t,
          ];
          if (da < NEAR_PLANE) start = clipped;
          else end = clipped;
        }
        const p1 = project(start, camera, rect);
        const p2 = project(end, camera, rect);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      };
      if (grid) {
        const minorStep =
          camera.distance > 34
            ? 2
            : camera.distance > 20
              ? 1
              : camera.distance > 10
                ? 0.5
                : 0.25;
        const majorStep = minorStep * 5;
        const extent = Math.min(
          20,
          Math.max(
            2.5,
            ((camera.distance - NEAR_PLANE) /
              (Math.SQRT2 * Math.max(0.22, Math.cos(camera.pitch)))) *
              0.9,
          ),
        );
        const worldCorners: [number, number, number][] = [
          [-extent, 0, -extent],
          [extent, 0, -extent],
          [extent, 0, extent],
          [-extent, 0, extent],
        ];
        const corners = worldCorners.map((point) => project(point, camera, rect));
        const visibleCorners = worldCorners.every(
          (point) => cameraDepth(point, camera) > NEAR_PLANE,
        );
        ctx.save();
        if (visibleCorners) {
          ctx.beginPath();
          ctx.moveTo(corners[0].x, corners[0].y);
          corners.slice(1).forEach((corner) => ctx.lineTo(corner.x, corner.y));
          ctx.closePath();
          ctx.fillStyle = palette.ground;
          ctx.fill();
          ctx.strokeStyle = palette.grid;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.clip();
        }
        for (let n = -extent; n <= extent; n += minorStep) {
          const rounded = Math.round(n / minorStep) * minorStep;
          const axis = Math.abs(rounded) < 0.001;
          const major =
            Math.abs(Math.round(rounded / majorStep) * majorStep - rounded) < 0.001;
          const stroke = axis
            ? "rgba(225, 29, 72, 0.75)"
            : major
              ? palette.gridMajor
              : palette.grid;
          const width = axis ? 1.4 : major ? 0.9 : 0.55;
          line([rounded, 0, -extent], [rounded, 0, extent], stroke, width);
          line(
            [-extent, 0, rounded],
            [extent, 0, rounded],
            axis
              ? "rgba(16, 185, 129, 0.78)"
              : major
                ? palette.gridMajor
                : palette.grid,
            width,
          );
        }
        ctx.restore();
      }
      const radians = (transform.rotation * Math.PI) / 180;
      const c = Math.cos(radians);
      const s = Math.sin(radians);
      const shadowFootprint: [number, number, number][] = [
        [-0.58, 0, -0.58],
        [0.58, 0, -0.58],
        [0.58, 0, 0.58],
        [-0.58, 0, 0.58],
      ].map(([x, , z]) => {
        const sx = x * transform.scale;
        const sz = z * transform.scale;
        return [
          sx * c - sz * s + transform.x,
          0,
          sx * s + sz * c + (transform.z ?? 0),
        ];
      });
      if (shadowFootprint.every((pt) => cameraDepth(pt, camera) > NEAR_PLANE)) {
        const sPts = shadowFootprint.map((pt) => project(pt, camera, rect));
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sPts[0].x, sPts[0].y);
        sPts.slice(1).forEach((q) => ctx.lineTo(q.x, q.y));
        ctx.closePath();
        ctx.fillStyle = "rgba(15, 23, 42, 0.09)";
        ctx.fill();
        ctx.restore();
      }
      const v: [number, number, number][] = [
        [-0.5, 0, -0.5],
        [0.5, 0, -0.5],
        [0.5, 0, 0.5],
        [-0.5, 0, 0.5],
        [-0.5, 1, -0.5],
        [0.5, 1, -0.5],
        [0.5, 1, 0.5],
        [-0.5, 1, 0.5],
      ].map(([x, y, z]) => {
        const sx = x * transform.scale;
        const sy = y * transform.scale;
        const sz = z * transform.scale;
        return [
          sx * c - sz * s + transform.x,
          sy + transform.y,
          sx * s + sz * c + (transform.z ?? 0),
        ];
      });
      const faces = [
        [0, 1, 5, 4],
        [1, 2, 6, 5],
        [2, 3, 7, 6],
        [3, 0, 4, 7],
        [4, 5, 6, 7],
        [3, 2, 1, 0],
      ];
      faces
        .map((indices, index) => ({
          indices,
          index,
          depth:
            indices.reduce((sum, j) => sum + project(v[j], camera, rect).d, 0) /
            indices.length,
        }))
        .sort((a, b) => b.depth - a.depth)
        .forEach(({ indices, index }) => {
          const pts = indices.map((j) => project(v[j], camera, rect));
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          pts.slice(1).forEach((q) => ctx.lineTo(q.x, q.y));
          ctx.closePath();
          ctx.fillStyle =
            face === index
              ? "rgba(37, 99, 235, 0.82)"
              : shade(
                  color,
                  [0.74, 0.88, 1.06, 0.64, 1.16, 0.78][index] *
                    (0.84 + metallic * 0.16) *
                    (1 - roughness * 0.1),
                );
          ctx.fill();
          ctx.strokeStyle = selected
            ? "#2563EB"
            : "rgba(15, 23, 42, 0.24)";
          ctx.lineWidth = selected ? 2 : 1;
          ctx.stroke();
        });
      drawings.forEach((path) => {
        ctx.strokeStyle = "#4A90D9";
        ctx.lineWidth = 2;
        ctx.beginPath();
        path.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.stroke();
      });
      if (measurement) {
        ctx.strokeStyle = "#f5c451";
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(measurement.a.x, measurement.a.y);
        ctx.lineTo(measurement.b.x, measurement.b.y);
        ctx.stroke();
        ctx.setLineDash([]);
        const d =
          Math.hypot(
            measurement.b.x - measurement.a.x,
            measurement.b.y - measurement.a.y,
          ) / 62;
        ctx.fillStyle = "#f5c451";
        ctx.font = "12px Roboto, sans-serif";
        ctx.fillText(
          `${d.toFixed(2)} m`,
          (measurement.a.x + measurement.b.x) / 2 + 8,
          (measurement.a.y + measurement.b.y) / 2 - 8,
        );
      }
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(node);
    return () => observer.disconnect();
  }, [
    camera,
    color,
    roughness,
    metallic,
    grid,
    selected,
    face,
    drawings,
    measurement,
    transform,
    theme,
  ]);
  return (
    <canvas
      ref={canvas}
      aria-label="Interactive 3D perspective grid"
      className="absolute inset-0 h-full w-full"
    />
  );
}

const floorDistance = (a: FloorPlanPoint, b: FloorPlanPoint) =>
  Math.hypot(b.x - a.x, b.y - a.y);
const floorInitialObjects = (objects: FloorPlanObject[] | undefined) =>
  objects ?? [];

const FLOOR_PLAN_QUICK_PROMPTS = [
  { label: "8m × 6m 3-room layout", prompt: "8m by 6m with living room, kitchen, bedroom" },
  { label: "12m × 9m office suite", prompt: "12m by 9m with office, living room, kitchen, bathroom" },
];

const MODELING_QUICK_PROMPTS = [
  { label: "Aerospace turbine housing", prompt: "Precision brushed titanium turbine housing" },
  { label: "Rotate +45°", prompt: "rotate 45" },
  { label: "Move +2m X", prompt: "move right 2" },
];

function FloorPlanViewport({ p, isMobile }: { p: Props; isMobile: boolean }) {
  const sourceObjects = floorInitialObjects(p.floorPlanObjects);
  const [moving, setMoving] = useState<{ original: FloorPlanObject; start: FloorPlanPoint; preview: FloorPlanObject } | null>(null);
  const objects = moving && moving.preview !== moving.original ? sourceObjects.map(object => object.id === moving.original.id ? moving.preview : object) : sourceObjects;
  const [placementMessage, setPlacementMessage] = useState("");
  const [view, setView] = useState({ zoom: 72, panX: 0, panY: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [tool, setTool] = useState<
    | "select"
    | "wall"
    | "door"
    | "window"
    | "room"
    | "dimension"
    | "measure"
    | "text"
    | "furniture"
    | "delete"
  >("select");
  const [drag, setDrag] = useState<{
    start: FloorPlanPoint;
    current: FloorPlanPoint;
  } | null>(null);
  const [measure, setMeasure] = useState<{
    start: FloorPlanPoint;
    current: FloorPlanPoint;
  } | null>(null);
  const [panning, setPanning] = useState<{
    x: number;
    y: number;
    panX: number;
    panY: number;
  } | null>(null);
  const { open: chat, setOpen: setChat } = useStudioDock();
  const [aiModel, setAiModel] = useState("gemini");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useStudioConversation([
    {
      id: "fp-welcome",
      role: "assistant",
      text: "Ask Gemini, Groq, or You for design guidance. Choose Local floor-plan layout to create editable rooms from dimensions and room names.",
      meta: "2D CAD",
    },
  ]);

  const svgRef = useRef<SVGSVGElement>(null);
  const worldRef=useRef<SVGGElement>(null);
  const emptySketch=useMemo(()=>createSketch(),[]);
  const settings = p.floorPlanSettings ?? {
    unit: "mm",
    scale: 100,
    precision: 1,
    gridStepMm: 100,
    snapToGrid: true,
    snapToPoints: true,
    orthogonal: true,
  };
  const setSettings = (patch: Partial<FloorPlanSettings>) =>
    p.onFloorPlanSettingsChange?.({ ...settings, ...patch });
  const chatBeforePencil=useRef(true);
  const sketch=useSketchEditor({doc:p.sketch??emptySketch,onChange:next=>p.onSketchChange?.(next),undo:()=>p.onSketchUndo?.(),redo:()=>p.onSketchRedo?.(),canUndo:Boolean(p.sketchCanUndo),canRedo:Boolean(p.sketchCanRedo),worldRef,objects:sourceObjects,settings,view,setView,project:p.sketchProject,onExport:p.onFloorExport,onActivate:()=>p.onSelectFloorPlanObject?.(null),onOpenFile:p.onOpenFloorFile,onActiveChange:active=>{p.onPencilModeChange?.(active);if(active){chatBeforePencil.current=chat;setChat(false);}else setChat(chatBeforePencil.current);}});
  const fitRef=useRef(sketch.fit);fitRef.current=sketch.fit;
  const fittedProject=useRef('');
  useEffect(()=>{if(size.width&&p.sketchProject?.ready&&p.sketchProject.id!==fittedProject.current){fittedProject.current=p.sketchProject.id;fitRef.current();}},[size.width,p.sketchProject?.ready,p.sketchProject?.id]);

  useEffect(() => {
    const node = svgRef.current;
    if (!node) return;
    const updateSize = () =>
      setSize({ width: node.clientWidth, height: node.clientHeight });
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const pointFromEvent = (event: React.PointerEvent<SVGSVGElement>, snap = true) => {
    const matrix=worldRef.current?.getScreenCTM();
    const point=matrix?new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse()):new DOMPoint();
    const raw={x:point.x,y:point.y};
    return snap ? floorSnapPoint(raw, objects, settings, view.zoom) : raw;
  };
  const updateObjects = (next: FloorPlanObject[]) =>
    p.onFloorPlanObjectsChange?.(next);
  const select = (id: string | null) => p.onSelectFloorPlanObject?.(id);
  const addObject = (object: FloorPlanObject) => {
    updateObjects([...objects, object]);
    select(object.id);
  };
  const planRef=useRef(p);planRef.current=p;
  const toolbarAPI=useRef<StudioToolbarAPI>(null);
  const addDefaultRoom=()=>addObject({id:`room-${crypto.randomUUID().slice(0,6)}`,type:'room',x:1.2,y:1.2,width:3.2,height:2.6,label:`Room ${objects.filter(o=>o.type==='room').length+1}`});
  const activateDraftTool=(id:typeof tool)=>{if(id==='delete'&&p.selectedFloorPlanId){updateObjects(sourceObjects.filter(o=>o.id!==p.selectedFloorPlanId));select(null);}else setTool(id);};
  useStudioActionAdapter({name:`floor-plan:${p.actionScope??'guest'}`,
    confirmation:action=>action.intent==='project.new'?{key:JSON.stringify(sourceObjects),message:'Start a new floor plan and replace the current drawing?'}:action.intent==='scene.delete'&&action.parameters.scope==='all'&&sourceObjects.length>1?{key:JSON.stringify(sourceObjects),message:`Delete all ${sourceObjects.length} floor-plan objects?`}:null,
    execute:async(action,signal)=>{
      signal.throwIfAborted();
      if(p.actionScope==='loading')throw new Error('Wait for your studio session to finish loading.');
      const before=JSON.stringify(sourceObjects),selected=sourceObjects.find(o=>o.id===p.selectedFloorPlanId);
      if(action.intent==='viewport.zoom'){setView(v=>({...v,zoom:Math.max(24,Math.min(180,v.zoom*(action.parameters.direction==='in'?1.25:.8)**action.parameters.amount))}));await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));return 'Floor-plan zoom updated.';}
      if(action.intent==='viewport.reset'||action.intent==='viewport.focus'){if(action.intent==='viewport.focus'&&action.parameters.scope==='selected'&&!selected)throw new Error('Select a floor-plan element first.');const point=selected?('start'in selected?selected.start:{x:selected.x,y:selected.y}):{x:0,y:0};setView({zoom:72,panX:-point.x*72,panY:-point.y*72});await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));return 'Floor-plan view updated.';}
      if(action.intent==='viewport.pan'){const d=action.parameters.direction;setView(v=>({...v,panX:v.panX+(['left','west'].includes(d)?72:['right','east'].includes(d)?-72:0),panY:v.panY+(['up','north'].includes(d)?72:['down','south'].includes(d)?-72:0)}));await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));return 'Floor-plan view panned.';}
      if(action.intent==='viewport.view'){if(!['2D','Top','Orthographic'].includes(action.parameters.view))throw new Error('This is a 2D drawing. Open Architecture Studio or Interior 3D for perspective cameras.');setView({zoom:72,panX:0,panY:0});return 'Top 2D drafting view activated.';}
      if(action.intent==='toolbar.activate'){
        const t=action.parameters.tool==='translate'?'select':action.parameters.tool;
        if(!['select','wall','door','window','room','dimension','measure','text','furniture','delete'].includes(t))throw new Error('That transform tool is unavailable in 2D. Select an element and use its supported properties, or open a 3D studio.');
        activateDraftTool(t as typeof tool);
        if(t==='delete'&&selected){await verifyStudioState(()=>!planRef.current.floorPlanObjects?.some(o=>o.id===selected.id),signal);return 'Selected floor-plan element deleted.';}
        await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));return `${t} drafting tool activated.`;
      }
      if(action.intent==='ui.library'){toolbarAPI.current?.openLibrary();await verifyStudioState(()=>Boolean(document.querySelector('.casynus-material-library')),signal);return 'Material library opened. Applying mesh materials requires a 3D studio.';}
      if(action.intent==='ui.grid'||action.intent==='ui.snap'){const current=action.intent==='ui.grid'?settings.snapToGrid:settings.snapToPoints;const enabled=action.parameters.mode==='toggle'?!current:action.parameters.mode==='on';setSettings(action.intent==='ui.grid'?{snapToGrid:enabled}:{snapToPoints:enabled});await verifyStudioState(()=>(action.intent==='ui.grid'?planRef.current.floorPlanSettings?.snapToGrid:planRef.current.floorPlanSettings?.snapToPoints)===enabled,signal);return `Drafting snapping ${enabled?'enabled':'disabled'}.`;}
      if(action.intent==='ui.fullscreen'){await document.documentElement.requestFullscreen();return 'Fullscreen activated.';}
      if(action.intent==='project.export'&&action.parameters.format==='open'){toolbarAPI.current?.openExport();await verifyStudioState(()=>Boolean(document.querySelector('dialog[aria-label="Export scene"][open]')),signal);return 'Floor-plan export options opened.';}
      if(action.intent==='project.export'&&action.parameters.format==='csv'){toolbarAPI.current?.csv();return 'Floor-plan CSV download requested.';}
      if(action.intent==='selection.clear'){select(null);await verifyStudioState(()=>!planRef.current.selectedFloorPlanId,signal);return 'Selection cleared.';}
      if(action.intent==='selection.select'){
        const name=normalizeCommand(action.parameters.name),matches=sourceObjects.filter((o,i)=>!name||normalizeCommand(o.id)===name||normalizeCommand('label'in o&&o.label?o.label:`${o.type} ${i+1}`)===name);
        if(matches.length!==1)throw new Error('Specify one unique floor-plan element name from Scene hierarchy.');select(matches[0].id);await verifyStudioState(()=>planRef.current.selectedFloorPlanId===matches[0].id,signal);return 'Floor-plan element selected.';
      }
      if(action.intent==='scene.create'){
        const id=crypto.randomUUID(),kind=action.parameters.kind;
        if(kind==='room'){addDefaultRoom();}
        else if(kind==='Wall')addObject({id,type:'wall',start:{x:0,y:0},end:{x:4,y:0},thickness:.18});
        else if(kind==='Door'||kind==='Window'){
          if(selected?.type!=='wall')throw new Error('Select the host wall before adding a door or window.');
          const point={x:(selected.start.x+selected.end.x)/2,y:(selected.start.y+selected.end.y)/2},opening=floorPlaceOpening(point,kind==='Door'?.9:1.4,[selected],view.zoom);
          if(!opening)throw new Error('The selected wall cannot host this opening.');
          addObject({id,type:kind==='Door'?'door':'window',x:opening.point.x,y:opening.point.y,width:kind==='Door'?.9:1.4,height:selected.thickness,rotation:opening.rotation});
        }else throw new Error('This 2D editor can add rooms, walls, doors and windows. Open a 3D studio for meshes or buildings.');
      }else if(action.intent==='scene.delete'){if(action.parameters.scope==='all')updateObjects([]);else{if(!selected)throw new Error('Select a floor-plan element first.');updateObjects(sourceObjects.filter(o=>o.id!==selected.id));}select(null);}
      else if(action.intent==='scene.duplicate'){if(!selected)throw new Error('Select a floor-plan element first.');addObject({...floorTranslateObject(selected,{x:1,y:1},sourceObjects,settings,view.zoom),id:crypto.randomUUID()});}
      else if(action.intent==='scene.transform'){
        if(!selected)throw new Error('Select a floor-plan element first.');const q=action.parameters;
        let updated:FloorPlanObject;
        if(q.property==='position'){updated=floorTranslateObject(selected,{x:q.axis==='x'?q.value:0,y:q.axis==='y'?-q.value:q.axis==='z'?q.value:0},sourceObjects,settings,view.zoom);}
        else if(q.property==='rotation'){
          if(selected.type==='wall'||selected.type==='dimension'){const radians=q.value*Math.PI/180,dx=selected.end.x-selected.start.x,dy=selected.end.y-selected.start.y;updated={...selected,end:{x:selected.start.x+dx*Math.cos(radians)-dy*Math.sin(radians),y:selected.start.y+dx*Math.sin(radians)+dy*Math.cos(radians)}};}
          else if('rotation'in selected)updated={...selected,rotation:selected.rotation+q.value};else throw new Error('This floor-plan object has no editable rotation.');
        }else throw new Error('This is a 2D drawing, not a vertical building model. Use the existing dimension inspector or open a 3D studio.');
        updateObjects(sourceObjects.map(o=>o.id===selected.id?updated:o));
      }else{
        if(!p.onStudioAction)throw new Error('This action is unavailable in the current workspace.');
        const result=await p.onStudioAction(action,signal);
        if(action.intent==='studio.navigate'){const target=new URL(STUDIO_ROUTES[action.parameters.studio],location.origin);await verifyStudioState(()=>location.pathname===target.pathname&&new URL(location.href).searchParams.get('mode')===target.searchParams.get('mode'),signal);return `${action.parameters.studio} studio opened.`;}
        if(action.intent==='panel.open')await verifyStudioState(()=>Boolean(document.querySelector(action.parameters.panel==='sidebar'?'.interior-scene-sidebar,.crystal-left-panel,.modeling-sidebar':'.crystal-right-panel')),signal);
        if(!['history.undo','history.redo','project.new'].includes(action.intent))return result;
      }
      await verifyStudioState(()=>JSON.stringify(planRef.current.floorPlanObjects)!==before,signal);return 'Floor-plan change confirmed. Undo is available for drawing edits.';
    }
  });
  const nearestWall = (point: FloorPlanPoint, width: number) => floorPlaceOpening(point, width, sourceObjects, view.zoom);

  const parsePrompt = () => {
    const rawPrompt = p.prompt.trim();
    if (!rawPrompt) return;
    const text = rawPrompt.toLowerCase();
    const sizeMatch = text.match(
      /(-?\d+(?:[.,]\d+)?)\s*(mm|millimeters?|cm|centimeters?|m|meters?)?\s*(?:x|by)\s*(-?\d+(?:[.,]\d+)?)\s*(mm|millimeters?|cm|centimeters?|m|meters?)?/,
    );
    const width =
      parseFloorLength(`${sizeMatch?.[1] ?? 8}${sizeMatch?.[2] ?? "m"}`, "m") ?? 8;
    const height =
      parseFloorLength(
        `${sizeMatch?.[3] ?? 6}${sizeMatch?.[4] ?? sizeMatch?.[2] ?? "m"}`,
        "m",
      ) ?? 6;
    const names = [
      "living room",
      "kitchen",
      "bedroom",
      "bathroom",
      "office",
    ].filter((name) => text.includes(name));
    const roomNames = names.length ? names : ["Living room", "Kitchen"];
    const next: FloorPlanObject[] = [
      {
        id: crypto.randomUUID(),
        type: "wall",
        start: { x: 0, y: 0 },
        end: { x: width, y: 0 },
        thickness: 0.18,
      },
      {
        id: crypto.randomUUID(),
        type: "wall",
        start: { x: width, y: 0 },
        end: { x: width, y: height },
        thickness: 0.18,
      },
      {
        id: crypto.randomUUID(),
        type: "wall",
        start: { x: width, y: height },
        end: { x: 0, y: height },
        thickness: 0.18,
      },
      {
        id: crypto.randomUUID(),
        type: "wall",
        start: { x: 0, y: height },
        end: { x: 0, y: 0 },
        thickness: 0.18,
      },
    ];
    const columns = Math.max(1, Math.ceil(Math.sqrt(roomNames.length)));
    roomNames.forEach((name, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      next.push({
        id: crypto.randomUUID(),
        type: "room",
        x: roundFloorValue((column * width) / columns + 0.25, settings.precision),
        y: roundFloorValue((row * height) / columns + 0.25, settings.precision),
        width: roundFloorValue(width / columns - 0.5, settings.precision),
        height: roundFloorValue(
          height / Math.ceil(roomNames.length / columns) - 0.5,
          settings.precision,
        ),
        label: name.replace(/\b\w/g, (char) => char.toUpperCase()),
      });
    });
    updateObjects(next);
    select(null);
    setChatMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: rawPrompt },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: `Generated ${width}m × ${height}m perimeter (180 mm exterior walls) partitioned into ${roomNames.length} rooms: ${roomNames.join(", ")}.`,
        meta: `1:${settings.scale}`,
      },
    ]);
    p.onPromptChange("");
  };

  const completeDrag = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (moving) {
      if (moving.preview !== moving.original) updateObjects(sourceObjects.map(object => object.id === moving.original.id ? moving.preview : object));
      setMoving(null);
      return;
    }
    if (panning) {
      setPanning(null);
      return;
    }
    if (!drag) return;
    const start = drag.start;
    const end = drag.current;
    const preciseStart = {
      x: roundFloorValue(start.x, settings.precision),
      y: roundFloorValue(start.y, settings.precision),
    };
    const preciseEnd = {
      x: roundFloorValue(end.x, settings.precision),
      y: roundFloorValue(end.y, settings.precision),
    };
    if (tool === "wall" && floorDistance(preciseStart, preciseEnd) > 0.001)
      addObject({
        id: crypto.randomUUID(),
        type: "wall",
        start: preciseStart,
        end: preciseEnd,
        thickness: roundFloorValue(0.18, settings.precision),
      });
    if (tool === "dimension" && floorDistance(preciseStart, preciseEnd) > 0.001)
      addObject({
        id: crypto.randomUUID(),
        type: "dimension",
        start: preciseStart,
        end: preciseEnd,
      });
    if (tool === "measure") setMeasure({ start, current: end });
    if (tool === "room" && Math.abs(preciseStart.x - preciseEnd.x) >= .05 && Math.abs(preciseStart.y - preciseEnd.y) >= .05)
      addObject({
        id: crypto.randomUUID(),
        type: "room",
        x: roundFloorValue(
          Math.min(preciseStart.x, preciseEnd.x),
          settings.precision,
        ),
        y: roundFloorValue(
          Math.min(preciseStart.y, preciseEnd.y),
          settings.precision,
        ),
        width: roundFloorValue(
          Math.abs(preciseEnd.x - preciseStart.x),
          settings.precision,
        ),
        height: roundFloorValue(
          Math.abs(preciseEnd.y - preciseStart.y),
          settings.precision,
        ),
        label: "New room",
      });
    setDrag(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const onDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if ((event.target as Element).closest("button")) return;
    event.preventDefault();
    event.currentTarget.focus();
    if(sketch.active&&event.button===0&&!event.shiftKey)return;
    const point = pointFromEvent(event);
    if (event.button === 1 || (event.button === 0 && event.shiftKey)) {
      setPanning({
        x: event.clientX,
        y: event.clientY,
        panX: view.panX,
        panY: view.panY,
      });
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }
    if (event.button !== 0) return;
    setPlacementMessage("");
    if (tool === "select" || tool === "delete") {
      const id = (event.target as Element).closest('[data-floor-plan-object-id]')?.getAttribute('data-floor-plan-object-id');
      const object = sourceObjects.find(item => item.id === id);
      if (object && tool === "delete") { updateObjects(sourceObjects.filter(item => item.id !== id)); select(null); }
      else if (object) {
        select(object.id);
        setMoving({ original: object, start: pointFromEvent(event, false), preview: object });
        event.currentTarget.setPointerCapture(event.pointerId);
      } else select(null);
      return;
    }
    if (tool === "door") {
      const wall = nearestWall(point, .9);
      if (wall !== null)
        addObject({
          id: crypto.randomUUID(),
          type: "door",
          x: roundFloorValue(wall.point.x, settings.precision),
          y: roundFloorValue(wall.point.y, settings.precision),
          width: roundFloorValue(0.9, settings.precision),
          height: wall.thickness,
          rotation: wall.rotation,
          swing: "in",
          side: "right",
        });
      else setPlacementMessage("Place the door on a wall at least 900 mm long.");
      return;
    }
    if (tool === "window") {
      const wall = nearestWall(point, 1.2);
      if (wall !== null)
        addObject({
          id: crypto.randomUUID(),
          type: "window",
          x: roundFloorValue(wall.point.x, settings.precision),
          y: roundFloorValue(wall.point.y, settings.precision),
          width: roundFloorValue(1.2, settings.precision),
          height: wall.thickness,
          rotation: wall.rotation,
          sillHeight: roundFloorValue(0.9, settings.precision),
          windowType: "double",
        });
      else setPlacementMessage("Place the window on a wall at least 1200 mm long.");
      return;
    }
    if (tool === "text") {
      addObject({
        id: crypto.randomUUID(),
        type: "text",
        x: point.x,
        y: point.y,
        text: "Note",
      });
      return;
    }
    if (tool === "furniture") {
      addObject({
        id: crypto.randomUUID(),
        type: "furniture",
        x: roundFloorValue(point.x, settings.precision),
        y: roundFloorValue(point.y, settings.precision),
        width: 0.9,
        height: 0.6,
        label: "Furniture",
      });
      return;
    }
    setDrag({ start: point, current: point });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (moving) {
      const raw = pointFromEvent(event, false);
      const original = moving.preview === moving.original ? sourceObjects.find(object => object.id === moving.original.id) ?? moving.original : moving.original;
      if (Math.hypot(raw.x - moving.start.x, raw.y - moving.start.y) * view.zoom < 3) {
        setMoving({ ...moving, original, preview: original });
        return;
      }
      const preview = floorTranslateObject(original, { x: raw.x - moving.start.x, y: raw.y - moving.start.y }, sourceObjects, settings, view.zoom);
      setMoving({ ...moving, original, preview });
      return;
    }
    if (panning) {
      setView((current) => ({
        ...current,
        panX: panning.panX + event.clientX - panning.x,
        panY: panning.panY + event.clientY - panning.y,
      }));
      return;
    }
    if (drag) {
      let current = pointFromEvent(event);
      if (settings.orthogonal && tool === "wall") {
        const dx = Math.abs(current.x - drag.start.x);
        const dy = Math.abs(current.y - drag.start.y);
        current =
          dx >= dy
            ? { x: current.x, y: drag.start.y }
            : { x: drag.start.x, y: current.y };
      }
      setDrag({ ...drag, current });
    }
  };

  const tools = [
    ["select", "Select", "V", MousePointer2],
    ["wall", "Wall", "W", SquareDashed],
    ["door", "Door", "D", DoorOpen],
    ["window", "Window", "N", SquareDashed],
    ["room", "Room", "R", SquareDashed],
    ["dimension", "Dimension", "", Ruler],
    ["measure", "Measure", "M", Ruler],
    ["text", "Text", "T", TextCursorInput],
    ["furniture", "Furniture", "F", Sofa],
    ["delete", "Delete", "Del", Trash2],
  ] as const;

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if(sketch.active||event.defaultPrevented)return;
      if ((event.target as HTMLElement)?.matches("input,textarea,select")) return;
      if (event.ctrlKey || event.metaKey || event.altKey) {
        if (event.key.toLowerCase() === "z") { setMoving(null); setDrag(null); }
        return;
      }
      const key = event.key.toLowerCase();
      const shortcuts: Record<string, typeof tool> = {
        v: "select",
        w: "wall",
        d: "door",
        n: "window",
        r: "room",
        m: "measure",
        t: "text",
        f: "furniture",
      };
      if (shortcuts[key]) setTool(shortcuts[key]);
      const directions: Record<string, FloorPlanPoint> = { ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 } };
      const selected = objects.find(object => object.id === p.selectedFloorPlanId);
      if (directions[event.key] && selected && !moving) {
        event.preventDefault();
        const step = event.shiftKey ? settings.gridStepMm / 1000 : settings.precision / 1000;
        const direction = directions[event.key];
        const next = floorTranslateObject(selected, { x: direction.x * step, y: direction.y * step }, objects, { ...settings, snapToGrid: false, snapToPoints: false }, view.zoom);
        updateObjects(objects.map(object => object.id === selected.id ? next : object));
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        const selectedId = p.selectedFloorPlanId;
        if (selectedId) {
          updateObjects(objects.filter((object) => object.id !== selectedId));
          select(null);
        }
      }
      if (event.key === "Escape") {
        setMoving(null);
        setTool("select");
        setPlacementMessage("");
        setDrag(null);
        setMeasure(null);
        select(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const selectedId = p.selectedFloorPlanId;

  return (
    <section
      className={`floor-plan-canvas sketch-workspace ${sketch.active ? "is-pencil-mode" : ""} relative min-h-0 overflow-hidden bg-[var(--studio-bg-elevated)] text-[var(--studio-text-secondary)]`}
      aria-label="2D Floor Plan Drafting Workspace"
    >
      <div
        className="crystal-mobile-modebar"
        role="tablist"
        aria-label="Mobile studio mode"
      >
        <button
          type="button"
          role="tab"
          aria-selected="true"
          className="active"
        >
          Floor plan
        </button>
        <button
          type="button"
          role="tab"
          aria-selected="false"
          onClick={() => p.onStudioModeChange?.("modeling")}
        >
          Modeling
        </button>
        <button
          type="button"
          role="tab"
          aria-selected="false"
          onClick={() => p.onStudioModeChange?.("modeling")}
        >
          Images
        </button>
      </div>
      {p.incognito && (
        <div className="crystal-mobile-incognito-mode" role="status">
          <Glasses size={14} /> Incognito mode
        </div>
      )}

      {/* 2D Architectural Drafting SVG Canvas */}
      <svg
        ref={svgRef}
        tabIndex={0}
        aria-label="Sketch plan canvas"
        style={{ touchAction: "none" }}
        className="floor-plan-svg-surface absolute inset-0 h-full w-full cursor-crosshair"
        onPointerOver={event=>p.onHoverFloorPlanObject?.((event.target as Element).closest('[data-floor-plan-object-id]')?.getAttribute('data-floor-plan-object-id')??null)}
        onPointerLeave={()=>p.onHoverFloorPlanObject?.(null)}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={completeDrag}
        onPointerCancel={() => {
          setMoving(null);
          setDrag(null);
          setPanning(null);
        }}
        onWheel={(event) => {
          event.preventDefault();
          if (moving || drag || sketch.drawing) return;
          setView((current) => ({
            ...current,
            zoom: Math.max(
              4,
              Math.min(600, current.zoom * Math.exp(-event.deltaY * 0.001)),
            ),
          }));
        }}
        onContextMenu={(event) => event.preventDefault()}
      >
        <defs>
          <pattern
            id="floor-dots"
            width={Math.max(8, (settings.gridStepMm / 1000) * view.zoom)}
            height={Math.max(8, (settings.gridStepMm / 1000) * view.zoom)}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="1.5"
              cy="1.5"
              r={view.zoom > 55 ? 1 : 0.7}
              fill="var(--studio-grid)"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={sketch.active ? "#404040" : "var(--studio-draft-paper)"} />
        {!sketch.active && !isMobile && <rect width="100%" height="100%" fill="url(#floor-dots)" />}
        <defs><clipPath id="sketch-sheet-clip"><rect {...(p.sketch??emptySketch).sheet}/></clipPath><pattern id="sketch-world-grid" width={settings.gridStepMm/1000} height={settings.gridStepMm/1000} patternUnits="userSpaceOnUse"><circle cx="0" cy="0" r={.8/view.zoom} fill="#888" opacity=".5"/></pattern></defs>
        <g
          ref={worldRef}
          transform={`translate(${size.width / 2 + view.panX} ${
            size.height / 2 + view.panY
          }) rotate(${sketch.rotation}) scale(${view.zoom})`}
        >
          {sketch.active&&sketch.hasCanvas&&<rect data-sketch-sheet="true" {...(p.sketch??emptySketch).sheet} fill={(p.sketch??emptySketch).sheet.background||'#ffffff'}/>}
          {sketch.active&&sketch.hasCanvas&&sketch.grid&&<rect {...(p.sketch??emptySketch).sheet} fill="url(#sketch-world-grid)" pointerEvents="none"/>}
          {(!sketch.active||sketch.hasCanvas)&&<g clipPath={sketch.active?"url(#sketch-sheet-clip)":undefined}>
          {objects
            .filter((object) => object.type === "room")
            .map((room) => (
              <g
                key={room.id} data-floor-plan-object-id={room.id}
              >
                <rect
                  x={room.x}
                  y={room.y}
                  width={room.width}
                  height={room.height}
                  fill={selectedId === room.id ? "var(--studio-draft-selected)" : "var(--studio-draft-room)"}
                  stroke={selectedId === room.id ? "#1687f7" : "#b8c4ce"}
                  strokeWidth=".025"
                />
                <text
                  x={room.x + room.width / 2}
                  y={room.y + room.height / 2}
                  textAnchor="middle"
                  fontSize=".22"
                  fontWeight="500"
                  fill="var(--studio-text-primary)"
                >
                  {room.label}
                </text>
                <text
                  x={room.x + room.width / 2}
                  y={room.y + room.height / 2 + 0.26}
                  textAnchor="middle"
                  fontSize=".14"
                  fill="var(--studio-text-secondary)"
                >
                  {(room.width * room.height).toFixed(1)} m²
                </text>
              </g>
            ))}
          {objects
            .filter((object) => object.type === "wall")
            .map((wall) => (
              <line
                key={wall.id} data-floor-plan-object-id={wall.id}
                x1={wall.start.x}
                y1={wall.start.y}
                x2={wall.end.x}
                y2={wall.end.y}
                stroke={selectedId === wall.id ? "var(--studio-accent)" : "var(--studio-draft-wall)"}
                strokeWidth={wall.thickness}
                strokeLinecap="square"
              />
            ))}
          {objects
            .filter(
              (object) => object.type === "door" || object.type === "window",
            )
            .map((opening) => (
              <g
                key={opening.id} data-floor-plan-object-id={opening.id}
                transform={`translate(${opening.x} ${opening.y}) rotate(${opening.rotation})`}
              >
                <rect
                  x={-opening.width / 2}
                  y={-opening.height / 2}
                  width={opening.width}
                  height={opening.height}
                  fill="var(--studio-draft-paper)"
                  stroke="none"
                />
                {opening.type === "door" ? (
                  <g data-door-side={opening.side ?? "right"} data-door-swing={opening.swing ?? "in"}>
                    {[-1, 1].map(side => <line key={side} x1={side * opening.width / 2} x2={side * opening.width / 2} y1={-opening.height / 2} y2={opening.height / 2} stroke="var(--studio-text-secondary)" strokeWidth=".035" />)}
                    <path
                      d={floorDoorSymbol(opening).arc}
                      fill="none"
                      stroke={selectedId === opening.id ? "var(--studio-accent)" : "var(--studio-text-secondary)"}
                      strokeWidth=".025"
                    />
                    <line
                      x1={floorDoorSymbol(opening).hinge.x}
                      y1="0"
                      x2={floorDoorSymbol(opening).open.x}
                      y2={floorDoorSymbol(opening).open.y}
                      stroke={selectedId === opening.id ? "var(--studio-accent)" : "var(--studio-draft-wall)"}
                      strokeWidth=".04"
                    />
                    <circle cx={floorDoorSymbol(opening).hinge.x} cy="0" r=".035" fill="var(--studio-text-secondary)" />
                  </g>
                ) : (
                  <>
                    <line x1={-opening.width / 2} y1="0" x2={opening.width / 2} y2="0" stroke="#0891b2" strokeWidth=".02" />
                    {opening.windowType !== "single" && <line x1="0" y1={-opening.height / 2} x2="0" y2={opening.height / 2} stroke="#0891b2" strokeWidth=".025" />}
                    <line
                      x1={-opening.width / 2}
                      y1={-opening.height / 2}
                      x2={opening.width / 2}
                      y2={-opening.height / 2}
                      stroke={selectedId === opening.id ? "#1687f7" : "#0891b2"}
                      strokeWidth=".04"
                    />
                    <line
                      x1={-opening.width / 2}
                      y1={opening.height / 2}
                      x2={opening.width / 2}
                      y2={opening.height / 2}
                      stroke={selectedId === opening.id ? "#1687f7" : "#0891b2"}
                      strokeWidth=".04"
                    />
                  </>
                )}
              </g>
            ))}
          {objects
            .filter((object) => object.type === "furniture")
            .map((item) => (
              <g
                key={item.id} data-floor-plan-object-id={item.id}
              >
                <rect
                  x={item.x}
                  y={item.y}
                  width={item.width}
                  height={item.height}
                  rx=".06"
                  fill={selectedId === item.id ? "var(--studio-draft-selected)" : "var(--studio-draft-furniture)"}
                  stroke="#64748b"
                  strokeWidth=".025"
                />
                <text
                  x={item.x + item.width / 2}
                  y={item.y + item.height / 2 + 0.06}
                  textAnchor="middle"
                  fontSize=".13"
                  fill="var(--studio-text-secondary)"
                >
                  {item.label}
                </text>
              </g>
            ))}
          {objects
            .filter((object) => object.type === "dimension")
            .map((item) => (
              <g
                key={item.id} data-floor-plan-object-id={item.id}
              >
                <line
                  x1={item.start.x}
                  y1={item.start.y}
                  x2={item.end.x}
                  y2={item.end.y}
                  stroke={selectedId === item.id ? "#1687f7" : "#d97706"}
                  strokeWidth=".025"
                  strokeDasharray=".12 .08"
                />
                <text
                  x={(item.start.x + item.end.x) / 2}
                  y={(item.start.y + item.end.y) / 2 - 0.1}
                  textAnchor="middle"
                  fontSize=".18"
                  fill="var(--studio-warning)"
                >
                  {item.label ??
                    formatFloorLength(floorDistance(item.start, item.end), settings)}
                </text>
              </g>
            ))}
          {objects
            .filter((object) => object.type === "text")
            .map((item) => (
              <text
                key={item.id} data-floor-plan-object-id={item.id}
                x={item.x}
                y={item.y}
                fontSize=".24"
                fill={selectedId === item.id ? "var(--studio-accent)" : "var(--studio-text-primary)"}
              >
                {item.text}
              </text>
            ))}
          {drag && (
            <>
              <line
                x1={drag.start.x}
                y1={drag.start.y}
                x2={drag.current.x}
                y2={drag.current.y}
                stroke="#1687f7"
                strokeWidth=".035"
                strokeDasharray=".12 .08"
              />
              <text
                x={(drag.start.x + drag.current.x) / 2}
                y={(drag.start.y + drag.current.y) / 2 - 0.12}
                fontSize=".2"
                fill="#1687f7"
              >
                {formatFloorLength(floorDistance(drag.start, drag.current), settings)}
              </text>
            </>
          )}
          {measure && (
            <>
              <line
                x1={measure.start.x}
                y1={measure.start.y}
                x2={measure.current.x}
                y2={measure.current.y}
                stroke="#eab308"
                strokeWidth=".035"
                strokeDasharray=".12 .08"
              />
              <text
                x={(measure.start.x + measure.current.x) / 2}
                y={(measure.start.y + measure.current.y) / 2 - 0.12}
                fontSize=".2"
                fill="var(--studio-warning)"
              >
                {formatFloorLength(
                  floorDistance(measure.start, measure.current),
                  settings,
                )}
              </text>
            </>
          )}
          {sketch.overlay}
          </g>}
        </g>
      </svg>
      {sketch.panels}

      {!sketch.active&&<StudioViewportToolbar label="Architectural drafting tools"
        apiRef={toolbarAPI}
        leading={[{label:'Sketch Drawing & Paint',icon:Pencil,onClick:sketch.toggle,active:sketch.active,frame:true},{ label: "Add room to floor plan", icon: SquareDashed, onClick:()=>{sketch.deactivate();addDefaultRoom();} }]}
        tools={tools.map(([id, label, shortcut, icon]) => ({
          label: id === "select" ? "Select & Move (V)" : id === "delete" ? "Delete selected element (Del)" : shortcut ? `${label} (${shortcut})` : label,
          icon, active: !sketch.active&&tool === id, onClick: () => {sketch.deactivate();activateDraftTool(id);},
        }))}
        onFit={sketch.fit} onReset={() => setView({ zoom: 72, panX: 0, panY: 0 })}
        cameraViews={["Top 2D Drafting"]} cameraView="Top 2D Drafting" onCamera={() => setView({ zoom: 72, panX: 0, panY: 0 })}
        onZoom={factor => setView(current => ({ ...current, zoom: Math.max(24, Math.min(180, current.zoom * factor)) }))}
        exportFormats={["PNG","SVG","PDF","JSON Scene","JPEG"]} onExport={format=>p.onFloorExport?.(format)} onCSV={() => downloadStudioCSV("Floor_plan", objects.map(o => ({ ...o })))}
        settingsLabel="Toggle grid snapping" onSettings={() => setSettings({ snapToGrid: !settings.snapToGrid })} />}

      {/* Top Drafting Status HUD */}
      {!sketch.active&&placementMessage && <div role="alert" className="absolute left-1/2 top-20 z-10 -translate-x-1/2 rounded-lg bg-[var(--studio-bg-panel)] px-3 py-2 text-xs">{placementMessage}</div>}
      {!sketch.active&&<div className="floor-plan-hud-bar" role="status">
        <span className="floor-plan-hud-badge">2D CAD</span>
        <span>Top view</span>
        <i />
        <span>1:{settings.scale}</span>
        <i />
        <span>{settings.gridStepMm} mm grid</span>
        <i />
        <button
          type="button"
          aria-pressed={settings.snapToGrid}
          onClick={() => setSettings({ snapToGrid: !settings.snapToGrid })}
          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition ${
            settings.snapToGrid ? "bg-[#1a8cff] text-[var(--studio-text-primary)]" : "text-[var(--studio-text-secondary)] hover:text-[var(--studio-text-primary)]"
          }`}
        >
          Grid
        </button>
        <button
          type="button"
          aria-pressed={settings.orthogonal}
          onClick={() => setSettings({ orthogonal: !settings.orthogonal })}
          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition ${
            settings.orthogonal ? "bg-[#1a8cff] text-[var(--studio-text-primary)]" : "text-[var(--studio-text-secondary)] hover:text-[var(--studio-text-primary)]"
          }`}
        >
          Ortho 90°
        </button>
      </div>}

      {/* Unified Studio AI Chat at Bottom of Workspace */}
      <StudioAIChat
        studio="floor-plan"
        open={chat}
        onOpenChange={setChat}
        prompt={p.prompt}
        onPromptChange={p.onPromptChange}
        onSubmit={parsePrompt}
        model={aiModel}
        onModelChange={setAiModel}
        messages={chatMessages}
        onMessagesChange={setChatMessages}
        onClearMessages={() => setChatMessages([])}
        onNewChat={() => {
          setChatMessages([]);
          p.onPromptChange("");
        }}
        referenceImage={referenceImage}
        onAttachImage={(file) => setReferenceImage(URL.createObjectURL(file))}
        onRemoveImage={() => setReferenceImage(null)}
        quickPrompts={FLOOR_PLAN_QUICK_PROMPTS}
        placeholder="What do you want to create?"
        statusLabel={`1:${settings.scale} · ${settings.unit}`}
        className={`studio-ai-floating-floorplan ${sketch.active ? "pencil-studio-ai" : ""}`}
      />

      {!sketch.active&&<div className="floor-plan-shortcuts-hint pointer-events-none">
        Drag to move · W wall · D door · N window · Arrows nudge · Shift-drag pan · Ctrl+Z undo · Esc cancel
      </div>}
    </section>
  );
}

export function Viewport(p: Props) {
  const [camera, setCamera] = useState(cameraStart);
  const drag = useRef<{
    x: number;
    y: number;
    base: CameraState;
    mode: "orbit" | "pan" | "dolly";
  } | null>(null);
  const transformBase = useRef<Transform | null>(null);
  const objectCreate = useRef<{
    x: number;
    y: number;
    transform: Transform;
  } | null>(null);

  const [mode, setMode] = useState<"floor-plan" | "modeling" | "images">(
    "modeling",
  );
  const { open: chat, setOpen: setChat } = useStudioDock();
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [textureOpen, setTextureOpen] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [grid, setGrid] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [help, setHelp] = useState(false);
  const [lighting, setLighting] = useState(false);
  const [world, setWorld] = useState(false);
  const [model, setModel] = useState("gemini");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState(Boolean(p.selectedAsset));
  const [face, setFace] = useState<number | null>(null);
  const [drawings, setDrawings] = useState<Point[][]>([]);
  const [drawing, setDrawing] = useState<Point[] | null>(null);
  const [measureStart, setMeasureStart] = useState<Point | null>(null);
  const [measurement, setMeasurement] = useState<{
    a: Point;
    b: Point;
  } | null>(null);
  const [history, setHistory] = useState<Transform[]>([]);
  const [future, setFuture] = useState<Transform[]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [projectionMode, setProjectionMode] = useState<"Orthographic" | "Perspective">("Orthographic");
  const [chatMessages, setChatMessages] = useStudioConversation([
    {
      id: "3d-welcome",
      role: "assistant",
      text: "Ask Gemini, Groq, or You for design guidance. Choose Local scene commands for transforms such as 'rotate 45' or 'move right 2'.",
      meta: "3D Studio",
    },
  ]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const toggleChat = () => setChat((value) => !value);
    window.addEventListener("crystal:toggle-ai-chat", toggleChat);
    return () => window.removeEventListener("crystal:toggle-ai-chat", toggleChat);
  }, [setChat]);

  const selectMobileMode = (nextMode: "floor-plan" | "modeling" | "images") => {
    setMode(nextMode);
    setChat(true);
    setMobileToolsOpen(false);
    p.onStudioModeChange?.(
      nextMode === "floor-plan" ? "floor-plan" : "modeling",
    );
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setView = useCallback((view: string) => {
    const presets: Record<string, Partial<CameraState>> = {
      Perspective: { yaw: 0.74, pitch: 0.48 },
      Top: { yaw: 0, pitch: 1.52 },
      Front: { yaw: Math.PI, pitch: 0.02 },
      Right: { yaw: -Math.PI / 2, pitch: 0.02 },
    };
    setCamera((c) => ({
      ...c,
      ...(presets[view] ?? presets.Perspective),
      distance: 12,
      panX: 0,
      panY: 0,
    }));
  }, []);

  useEffect(() => {
    const handleViewportControl = (event: Event) => {
      const control = (event as CustomEvent<string>).detail;
      if (control === "lighting") setLighting((value) => !value);
      else if (control === "world") setWorld((value) => !value);
      else if (control === "grid") setGrid((value) => !value);
      else if (control === "help") setHelp((value) => !value);
      else if (control === "camera") setView("Perspective");
    };
    window.addEventListener("crystal:viewport-control", handleViewportControl);
    return () =>
      window.removeEventListener(
        "crystal:viewport-control",
        handleViewportControl,
      );
  }, [setView]);

  useEffect(() => {
    const updateFullscreen = () =>
      setFullscreen(document.fullscreenElement === canvasRef.current);
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () =>
      document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  const toolMode =
    p.activeTool === "orbit"
      ? "realtime"
      : p.activeTool === "brush"
        ? "draw"
        : p.activeTool === "erase"
          ? "erase"
          : p.activeTool === "tools"
            ? "measure"
            : p.activeTool === "model"
              ? "object"
              : p.activeTool === "viewport"
                ? "navigation"
                : p.activeTool;

  const remember = (next: Transform) => {
    setHistory((h) =>
      h.length && h[h.length - 1] === p.transform
        ? h
        : [...h, p.transform].slice(-30),
    );
    setFuture([]);
    p.onTransformChange(next);
  };

  const pointFromEvent = (event: React.PointerEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const scenePoint = (point: Point) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: ((point.x - rect.width / 2 - camera.panX) * camera.distance) / 620,
      y: ((rect.height * 0.53 + camera.panY - point.y) * camera.distance) / 620,
    };
  };

  const cubeFaces = useMemo(() => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return [];
    const radians = (p.transform.rotation * Math.PI) / 180;
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    const v: [number, number, number][] = [
      [-0.5, 0, -0.5],
      [0.5, 0, -0.5],
      [0.5, 0, 0.5],
      [-0.5, 0, 0.5],
      [-0.5, 1, -0.5],
      [0.5, 1, -0.5],
      [0.5, 1, 0.5],
      [-0.5, 1, 0.5],
    ].map(([x, y, z]) => {
      const sx = x * p.transform.scale;
      const sy = y * p.transform.scale;
      const sz = z * p.transform.scale;
      return [
        sx * c - sz * s + p.transform.x,
        sy + p.transform.y,
        sx * s + sz * c + (p.transform.z ?? 0),
      ];
    });
    return [
      [0, 1, 5, 4],
      [1, 2, 6, 5],
      [2, 3, 7, 6],
      [3, 0, 4, 7],
      [4, 5, 6, 7],
      [3, 2, 1, 0],
    ].map((indices) => indices.map((i) => project(v[i], camera, rect)));
  }, [camera, p.transform]);

  const hitFace = (point: Point) =>
    cubeFaces.findIndex((poly) => {
      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i].x;
        const yi = poly[i].y;
        const xj = poly[j].x;
        const yj = poly[j].y;
        const intersect =
          yi > point.y !== yj > point.y &&
          point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    });

  const focus = () => {
    setCamera((c) => ({ ...c, distance: 9, panX: 0, panY: 0 }));
  };

  const runCommand = () => {
    const text = p.prompt.toLowerCase();
    const number = Number(text.match(/-?\d+(?:\.\d+)?/)?.[0] ?? "0");
    if (!number) return false;
    if (text.includes("move") || text.includes("right")) {
      remember({ ...p.transform, x: p.transform.x + number });
      return true;
    }
    if (text.includes("rotate")) {
      remember({ ...p.transform, rotation: p.transform.rotation + number });
      return true;
    }
    return false;
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.matches("input,textarea,select")) return;
      const key = e.key.toLowerCase();
      if (key === "q") p.onToolChange("select");
      else if (key === "w" || key === "g") p.onToolChange("move");
      else if (key === "e") p.onToolChange("rotate");
      else if (key === "s") p.onToolChange("scale");
      else if (key === "f") focus();
      else if (e.key === "Escape") {
        setMeasureStart(null);
        setDrawing(null);
        setFace(null);
        setMeasurement(null);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selected) {
          setSelected(false);
          p.onAssetDrop("");
        }
      } else if ((e.ctrlKey || e.metaKey) && key === "z") {
        e.preventDefault();
        const previous = history.at(-1);
        if (previous) {
          setHistory((h) => h.slice(0, -1));
          setFuture((f) => [p.transform, ...f]);
          p.onTransformChange(previous);
        }
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (key === "y" || (e.shiftKey && key === "z"))
      ) {
        e.preventDefault();
        const next = future.at(-1);
        if (next) {
          setFuture((f) => f.slice(0, -1));
          setHistory((h) => [...h, p.transform]);
          p.onTransformChange(next);
        }
      } else {
        const views: Record<string, string> = {
          "1": "Front",
          "3": "Right",
          "7": "Top",
          "0": "Perspective",
          ".": "Perspective",
        };
        if (views[e.key]) setView(views[e.key]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [history, future, p.transform, selected, p, setView]);

  useEffect(() => {
    if (p.selectedAsset) setSelected(true);
  }, [p.selectedAsset]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () =>
        p.onTransformChange({
          ...p.transform,
          rotation: p.transform.rotation + 0.7,
        }),
      50,
    );
    return () => window.clearInterval(timer);
  }, [playing, p.onTransformChange, p.transform]);

  const onPointerDown = (event: React.PointerEvent) => {
    if (
      (event.target as HTMLElement).closest(
        "button,input,select,textarea,label",
      )
    )
      return;
    const point = pointFromEvent(event);
    const cameraMode =
      event.button === 1 && event.ctrlKey
        ? "dolly"
        : event.button === 2 || event.button === 1
          ? "orbit"
          : event.button === 0 && event.shiftKey
            ? "pan"
            : null;
    if (cameraMode) {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = {
        x: event.clientX,
        y: event.clientY,
        base: camera,
        mode: cameraMode,
      };
      return;
    }
    if (toolMode === "erase") {
      setDrawings((paths) =>
        paths.filter((path) =>
          path.every((item) => Math.hypot(item.x - point.x, item.y - point.y) > 14),
        ),
      );
      return;
    }
    if (toolMode === "realtime") return;
    if (toolMode === "object") {
      const position = scenePoint(point);
      const startTransform = {
        x: position.x,
        y: 0,
        z: position.y,
        rotation: 0,
        scale: 0.05,
      };
      objectCreate.current = {
        x: point.x,
        y: point.y,
        transform: startTransform,
      };
      p.onCreateObject();
      p.onTransformChange(startTransform);
      setSelected(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }
    if (toolMode === "draw") {
      setDrawing([point]);
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }
    if (toolMode === "measure") {
      if (!measureStart) setMeasureStart(point);
      else {
        setMeasurement({ a: measureStart, b: point });
        setMeasureStart(null);
      }
      return;
    }
    if (toolMode === "scale") {
      const index = hitFace(point);
      setFace(index >= 0 ? index : null);
      setSelected(index >= 0 || selected);
      if (index >= 0) p.onSelectAsset(p.selectedAsset?.id ?? "industrial-desk");
      if (selected) {
        event.currentTarget.setPointerCapture(event.pointerId);
        transformBase.current = p.transform;
        drag.current = {
          x: event.clientX,
          y: event.clientY,
          base: camera,
          mode: "pan",
        };
      }
      return;
    }
    if (toolMode === "select") {
      const index = hitFace(point);
      setSelected(index >= 0);
      if (index >= 0) p.onSelectAsset(p.selectedAsset?.id ?? "industrial-desk");
      else {
        setFace(null);
        p.onSelectAsset("");
      }
      return;
    }
    if (toolMode === "move" || toolMode === "rotate") {
      if (!selected) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      transformBase.current = p.transform;
      drag.current = {
        x: event.clientX,
        y: event.clientY,
        base: camera,
        mode: "pan",
      };
      return;
    }
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const point = pointFromEvent(event);
    if (objectCreate.current) {
      const dx = point.x - objectCreate.current.x;
      const dy = point.y - objectCreate.current.y;
      const size = Math.max(0.05, Math.min(10, Math.hypot(dx, dy) / 62));
      p.onTransformChange({ ...objectCreate.current.transform, scale: size });
      return;
    }
    if (drawing) {
      setDrawing((path) => (path ? [...path, point] : path));
      return;
    }
    const d = drag.current;
    if (!d) return;
    const dx = event.clientX - d.x;
    const dy = event.clientY - d.y;
    if (toolMode === "move" && transformBase.current) {
      const worldScale = d.base.distance / 620;
      remember({
        ...transformBase.current,
        x: snapToGrid(transformBase.current.x + dx * worldScale),
        z: snapToGrid((transformBase.current.z ?? 0) - dy * worldScale),
      });
    } else if (toolMode === "rotate" && transformBase.current)
      remember({
        ...transformBase.current,
        rotation: transformBase.current.rotation + dx * 0.5,
      });
    else if (toolMode === "scale" && transformBase.current)
      remember({
        ...transformBase.current,
        scale: Math.max(0.1, Math.min(10, transformBase.current.scale - dy * 0.01)),
      });
    else if (d.mode === "pan")
      setCamera({ ...d.base, panX: d.base.panX + dx, panY: d.base.panY + dy });
    else if (d.mode === "dolly")
      setCamera({
        ...d.base,
        distance: Math.max(
          2.1,
          Math.min(42, d.base.distance * Math.exp(dy * 0.012)),
        ),
      });
    else
      setCamera({
        ...d.base,
        yaw: d.base.yaw - dx * 0.008,
        pitch: Math.max(-1.38, Math.min(1.38, d.base.pitch + dy * 0.007)),
      });
  };

  const onPointerUp = (event: React.PointerEvent) => {
    if (objectCreate.current) objectCreate.current = null;
    if (drawing) {
      if (drawing.length > 1) setDrawings((paths) => [...paths, drawing]);
      setDrawing(null);
    }
    drag.current = null;
    transformBase.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const submit = () => {
    const rawPrompt = p.prompt.trim();
    if (!rawPrompt) return;
    if (runCommand()) {
      setChatMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", text: rawPrompt },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: `Applied transform command "${rawPrompt}" to active scene object.`,
          meta: "Transform",
        },
      ]);
      p.onPromptChange("");
      return;
    }
    setChatMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: rawPrompt },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: `Requested a local demo asset for "${rawPrompt}". This demo does not generate a mesh through an AI provider.`,
        meta: model,
      },
    ]);
    p.onGenerate();
  };

  if (p.studioMode === "floor-plan") {
    return <FloorPlanViewport p={p} isMobile={isMobile} />;
  }

  return (
    <section
      ref={canvasRef as React.RefObject<HTMLElement>}
      className={`crystal-3d-viewport relative min-h-0 overflow-hidden bg-[var(--studio-bg-canvas)] ${
        mobileToolsOpen ? "crystal-mobile-tools-open" : ""
      } ${
        toolMode === "object" || toolMode === "draw"
          ? "cursor-crosshair"
          : toolMode === "move"
            ? "cursor-move"
            : toolMode === "rotate"
              ? "cursor-grab"
              : "cursor-default"
      }`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        objectCreate.current = null;
        drag.current = null;
        setDrawing(null);
      }}
      onContextMenu={(e) => e.preventDefault()}
      onWheel={(e) => {
        e.preventDefault();
        setCamera((c) => ({
          ...c,
          distance: Math.max(
            2.1,
            Math.min(42, c.distance * Math.exp(e.deltaY * 0.0012)),
          ),
        }));
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const id = e.dataTransfer.getData("text/asset-id");
        if (id) {
          p.onAssetDrop(id);
          setSelected(true);
        }
      }}
    >
      {mode === "images" ? (
        showImagePreview && (
          <div className="crystal-mobile-build-frame">
            <img
              src={referenceImage || "/Build.png"}
              alt={
                referenceImage ? "Uploaded reference" : "Generated Build preview"
              }
            />
            <div className="crystal-mobile-build-actions">
              <button
                type="button"
                aria-label="Share image"
                onClick={() => {
                  const image =
                    referenceImage || `${window.location.origin}/Build.png`;
                  if (navigator.share)
                    void navigator.share({ title: "Casynus image", url: image });
                  else void navigator.clipboard?.writeText(image);
                }}
              >
                <Share2 size={17} />
              </button>
              <a
                href={referenceImage || "/Build.png"}
                download="Build.png"
                aria-label="Download image"
              >
                <Download size={18} />
              </a>
            </div>
          </div>
        )
      ) : (
        <>
          <CanvasScene
            camera={camera}
            color={p.color}
            roughness={p.roughness}
            metallic={p.metallic}
            grid={grid && !isMobile}
            selected={selected}
            face={face}
            drawings={drawing ? [...drawings, drawing] : drawings}
            measurement={measurement}
            transform={p.transform}
          />
          <div className="studio-viewport-footer-bar pointer-events-none">
            <span>RMB / MMB: Orbit · Shift + LMB: Pan · Wheel: Zoom</span>
            {selected && (
              <span className="studio-transform-readout">
                X {p.transform.x.toFixed(1)} · Y {p.transform.y.toFixed(1)} · Rot{" "}
                {p.transform.rotation.toFixed(0)}° · Scale{" "}
                {p.transform.scale.toFixed(2)}×
              </span>
            )}
          </div>
        </>
      )}

      <div
        className="crystal-mobile-modebar"
        role="tablist"
        aria-label="Mobile studio mode"
      >
        {(["floor-plan", "modeling", "images"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={mode === item}
            onClick={() => selectMobileMode(item)}
            className={mode === item ? "active" : ""}
          >
            {item === "floor-plan"
              ? "Floor plan"
              : item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      <div className="crystal-mobile-empty-state" aria-hidden="true">
        <img src="/Logopng.png" alt="Casynus" />
        <span>What should we create?</span>
      </div>

      {textureOpen && (
        <div className="crystal-mobile-texture-panel" aria-label="Texture modeling">
          <div className="crystal-mobile-texture-heading">
            <div>
              <strong>Texture Modeling</strong>
              <span>
                Create new texture
                <br />
                from photo
              </span>
            </div>
            <button type="button" aria-label="Add texture">
              <Plus size={18} />
            </button>
          </div>
          <div className="crystal-mobile-texture-grid">
            {[
              "chrome-black",
              "chrome-white",
              "stone",
              "ocean",
              "violet",
              "purple",
            ].map((textureName) => (
              <button
                type="button"
                key={textureName}
                aria-label={`Use ${textureName} texture`}
                className={`crystal-texture-card ${textureName}`}
                onClick={() => setTextureOpen(false)}
              >
                <span />
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className={`crystal-mobile-model-tools ${
          mobileToolsOpen ? "is-visible" : ""
        }`}
        aria-label="Studio tools"
      >
        <button
          type="button"
          aria-label="Play or pause animation"
          className={playing ? "active" : ""}
          onClick={() => setPlaying((value) => !value)}
        >
          <span className="crystal-tool-record" />
        </button>
        <button
          type="button"
          aria-label="Texture modeling"
          className={`crystal-mobile-texture-trigger ${
            textureOpen ? "active" : ""
          }`}
          onClick={() => {
            setTextureOpen((value) => !value);
            setMobileToolsOpen(true);
            setChat(true);
          }}
        >
          <CubeFilled size={18} />
        </button>
        <button
          type="button"
          aria-label="Toggle object visibility"
          className={!selected ? "active" : ""}
          onClick={() => {
            setSelected((value) => !value);
            p.onAssetDrop(
              selected ? "" : p.selectedAsset?.id ?? "industrial-desk",
            );
          }}
        >
          <EyeOff size={20} />
        </button>
        <button
          type="button"
          aria-label="Open object assets"
          onClick={() => p.onToolChange("model")}
        >
          <FolderOpen size={20} />
        </button>
        <button
          type="button"
          aria-label="Take snapshot"
          onClick={p.onSnapshot}
        >
          <Camera size={20} />
        </button>
        <button
          type="button"
          aria-label="Toggle lighting tools"
          className={lighting ? "active" : ""}
          onClick={() => setLighting((value) => !value)}
        >
          <Lightbulb size={20} />
        </button>
        <button
          type="button"
          aria-label="Show modeling help"
          className={help ? "active" : ""}
          onClick={() => setHelp((value) => !value)}
        >
          <CircleHelp size={20} />
        </button>
      </div>

      {/* Reference Orientation Axis Gizmo + Orthographic / Perspective Pill */}
      <div className="ref-viewport-gizmo-dock" aria-label="Viewport orientation and projection">
        <div
          className="crystal-axis-gizmo ref-axis-disc"
          aria-label="Viewport axis navigation"
        >
          <button
            type="button"
            onClick={() => setView("Front")}
            title="View along Y axis (Front — Numpad 1)"
            className="ref-axis-node is-y"
            aria-label="View along Y axis"
          >
            Y
          </button>
          <button
            type="button"
            onClick={() => setView("Right")}
            title="View along X axis (Right — Numpad 3)"
            className="ref-axis-node is-x"
            aria-label="View along X axis"
          >
            X
          </button>
          <button
            type="button"
            onClick={() => setView("Top")}
            title="View along Z axis (Top — Numpad 7)"
            className="ref-axis-node is-z"
            aria-label="View along Z axis"
          >
            Z
          </button>
          <span className="ref-axis-line is-y" />
          <span className="ref-axis-line is-x" />
          <span className="ref-axis-line is-z" />
        </div>

        <div className="ref-projection-pill" role="group" aria-label="Camera projection">
          <button
            type="button"
            aria-pressed={projectionMode === "Orthographic"}
            onClick={() => {
              setProjectionMode("Orthographic");
              setView("Top");
            }}
            className={projectionMode === "Orthographic" ? "is-active" : ""}
          >
            Orthographic
          </button>
          <button
            type="button"
            aria-pressed={projectionMode === "Perspective"}
            onClick={() => {
              setProjectionMode("Perspective");
              setView("Perspective");
            }}
            className={projectionMode === "Perspective" ? "is-active" : ""}
          >
            Perspective
          </button>
        </div>
      </div>

      {help && (
        <div className="studio-floating-help absolute right-[296px] top-16 z-30 w-64 rounded-[14px] border border-[var(--studio-border)] bg-[var(--studio-bg-panel)] p-3.5 text-[11.5px] leading-relaxed text-[var(--studio-text-secondary)] shadow-xl backdrop-blur-xl">
          <strong className="mb-1 block text-[var(--studio-text-primary)]">Viewport Navigation</strong>
          MMB / RMB orbits, Shift + LMB pans, wheel zooms. Keys Q/W/E/S switch tools; Numpad 1/3/7/0 switches camera presets.
        </div>
      )}
      {(lighting || world) && (
        <div className="studio-floating-help absolute right-[280px] top-16 z-30 w-56 rounded-[10px] border border-[var(--studio-border)] bg-[var(--studio-bg-elevated)] p-3 text-[11px] leading-relaxed text-[var(--studio-text-primary)] shadow-2xl">
          <div className="mb-1.5 flex items-center justify-between">
            <strong className="text-[var(--studio-text-primary)]">
              {lighting ? "Scene Lighting" : "World Environment"}
            </strong>
            <button
              type="button"
              onClick={() => {
                setLighting(false);
                setWorld(false);
              }}
              className="text-[var(--studio-text-secondary)] hover:text-[var(--studio-text-primary)]"
            >
              ✕
            </button>
          </div>
          <p className="text-[var(--studio-text-secondary)]">
            Renderer: <span className="text-[var(--studio-text-primary)]">{p.renderer}</span> · Grid{" "}
            <span className="text-[var(--studio-text-primary)]">{grid ? "Visible" : "Hidden"}</span>
          </p>
        </div>
      )}

      {/* Unified Studio AI Chat at Bottom of Workspace */}
      <StudioAIChat
        studio="modeling"
        open={chat}
        onOpenChange={setChat}
        prompt={p.prompt}
        onPromptChange={(value) => {
          p.onPromptChange(value);
          setChat(true);
        }}
        onSubmit={submit}
        loading={p.loading}
        progress={p.progress}
        error={p.error}
        onClearError={p.onClearError}
        model={model}
        onModelChange={setModel}
        messages={chatMessages}
        onMessagesChange={setChatMessages}
        onClearMessages={() => setChatMessages([])}
        onNewChat={() => {
          setChatMessages([]);
          p.onPromptChange("");
        }}
        referenceImage={referenceImage}
        onAttachImage={(file) => {
          setReferenceImage(URL.createObjectURL(file));
          setShowImagePreview(false);
          setMobileToolsOpen(false);
          setChat(true);
        }}
        onRemoveImage={() => setReferenceImage(null)}
        quickPrompts={MODELING_QUICK_PROMPTS}
        placeholder="What do you want to create?"
        statusLabel={p.selectedAsset ? p.selectedAsset.name : p.renderer}
      />

      {/* Reference Top Floating Toolbar: + Shapes | Select (Blue) | Frame | 100% v | Export (Blue) | Play */}
      <StudioToolbar
        className="crystal-modeling-tools studio-floating-toolbar ref-top-toolbar"
        role="toolbar"
        aria-label="3D modeling tools"
      >
        <div className="crystal-modeling-tool-group">
          <IconButton
            icon={Plus}
            label="Add object to scene"
            active={false}
            onClick={p.onCreateObject}
          />
          <IconButton
            icon={Box}
            label="Add cube primitive"
            active={p.activeTool === "model"}
            onClick={() => p.onToolChange("model")}
          />
          <IconButton
            icon={Move3D}
            label="Move tool (W)"
            active={p.activeTool === "move"}
            onClick={() => p.onToolChange("move")}
          />
          <IconButton
            icon={Rotate3D}
            label="Rotate tool (E)"
            active={p.activeTool === "rotate"}
            onClick={() => p.onToolChange("rotate")}
          />
          <IconButton
            icon={Scaling}
            label="Scale tool (S)"
            active={p.activeTool === "scale"}
            onClick={() => p.onToolChange("scale")}
          />
          <IconButton
            icon={Pencil}
            label="Pen annotation tool"
            active={p.activeTool === "brush"}
            onClick={() => p.onToolChange("brush")}
          />
          <IconButton
            icon={Ruler}
            label="Measure distance"
            active={p.activeTool === "tools"}
            onClick={() => p.onToolChange("tools")}
          />
        </div>

        <span className="crystal-modeling-tool-divider" aria-hidden="true" />

        <IconButton
          icon={MousePointer2}
          label="Select tool (Q)"
          active={p.activeTool === "select" || p.activeTool === "orbit"}
          onClick={() => {
            p.onToolChange("select");
            setSelected(false);
          }}
          className={
            p.activeTool === "select" || p.activeTool === "orbit"
              ? "ref-select-active-blue"
              : ""
          }
        />

        <span className="crystal-modeling-tool-divider" aria-hidden="true" />

        <IconButton
          icon={Maximize}
          label="Frame active object (F)"
          active={fullscreen}
          onClick={focus}
        />

        <span className="crystal-modeling-tool-divider" aria-hidden="true" />

        <button
          type="button"
          title="Cycle camera zoom preset"
          aria-label="Camera zoom percentage"
          onClick={() => {
            const distances = [16, 12, 9.6, 8];
            const currentIdx = distances.findIndex((d) => Math.abs(d - camera.distance) < 1.2);
            const nextDist = distances[(currentIdx + 1) % distances.length];
            setCamera((c) => ({ ...c, distance: nextDist }));
          }}
          className="ref-zoom-readout-btn"
        >
          <span>{Math.round((12 / camera.distance) * 100)}%</span>
          <span className="text-[9px] opacity-65">▾</span>
        </button>

        <button
          type="button"
          className="crystal-modeling-action ref-export-primary-btn"
          aria-label="Export viewport"
          title="Export viewport snapshot (PNG & JPEG)"
          onClick={p.onSnapshot}
        >
          <span>Export</span>
        </button>

        <span className="crystal-modeling-tool-divider" aria-hidden="true" />

        <IconButton
          icon={playing ? Pause : Play}
          label={playing ? "Pause preview" : "Play preview"}
          active={playing}
          onClick={() => setPlaying((value) => !value)}
        />
      </StudioToolbar>
    </section>
  );
}
