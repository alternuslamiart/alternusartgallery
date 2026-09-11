"use client";

import { Canvas, ThreeEvent } from "@react-three/fiber";
import { Grid, Html, OrbitControls, useTexture } from "@react-three/drei";
import { Roboto } from "next/font/google";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle, Armchair, Bike, BusFront, ChevronDown, Download, Fence,
  Building2, Footprints, Home, LampCeiling, Lightbulb, Loader2, MapPin, MessageCircle, MousePointer2, Plus,
  Redo2, Route, Ruler, Send, Signpost, Sparkles, Trash2, TreePine,
  Undo2, Zap,
} from "lucide-react";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" });

type ElementType =
  | "road" | "sidewalk" | "tree" | "streetlight" | "crosswalk"
  | "bikeLane" | "busStop" | "trafficLight" | "roadSign" | "barrier" | "bench" | "cityModel";
type Tool = "select" | "move" | "delete" | "measure" | ElementType;
type StreetElement = { id: number; type: ElementType; x: number; z: number };
type Point = { x: number; z: number };

const elementLabels: Record<ElementType, string> = {
  road: "Road",
  sidewalk: "Sidewalk",
  tree: "Tree",
  streetlight: "Streetlight",
  crosswalk: "Crosswalk",
  bikeLane: "Bike lane",
  busStop: "Bus stop",
  trafficLight: "Traffic light",
  roadSign: "Road sign",
  barrier: "Fence / barrier",
  bench: "Bench",
  cityModel: "City model",
};

const toolItems: Array<{ type: Tool; label: string; icon: typeof Route }> = [
  { type: "road", label: "Draw Road", icon: Route },
  { type: "sidewalk", label: "Add Sidewalk", icon: Footprints },
  { type: "bikeLane", label: "Add Bike Lane", icon: Bike },
  { type: "busStop", label: "Add Bus Stop", icon: BusFront },
  { type: "trafficLight", label: "Add Traffic Light", icon: LampCeiling },
  { type: "roadSign", label: "Add Road Sign", icon: Signpost },
  { type: "barrier", label: "Add Fence / Barrier", icon: Fence },
  { type: "bench", label: "Add Bench", icon: Armchair },
  { type: "cityModel", label: "Add 3D City Model", icon: Building2 },
  { type: "tree", label: "Add Tree", icon: TreePine },
  { type: "streetlight", label: "Add Streetlight", icon: Zap },
  { type: "crosswalk", label: "Add Crosswalk", icon: MapPin },
  { type: "select", label: "Select", icon: MousePointer2 },
  { type: "move", label: "Move", icon: Plus },
  { type: "delete", label: "Delete", icon: Trash2 },
  { type: "measure", label: "Measure distance", icon: Ruler },
];

function Element({ item, selected, onSelect }: { item: StreetElement; selected: boolean; onSelect: () => void }) {
  const click = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect();
  };
  const highlight = selected ? (
    <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.9, 1.04, 32]} />
      <meshBasicMaterial color="#70b7ff" transparent opacity={0.9} />
    </mesh>
  ) : null;

  if (item.type === "cityModel") return <CityModelElement item={item} selected={selected} onClick={click} highlight={highlight} />;
  if (item.type === "tree") return <group position={[item.x, 0, item.z]} onClick={click}>{highlight}<mesh position={[0, 0.65, 0]}><cylinderGeometry args={[0.12, 0.16, 1.3, 10]} /><meshStandardMaterial color="#76513b" /></mesh><mesh position={[0, 1.55, 0]}><icosahedronGeometry args={[0.75, 1]} /><meshStandardMaterial color={selected ? "#8ee6a0" : "#3d9b5b"} /></mesh></group>;
  if (item.type === "streetlight") return <group position={[item.x, 0, item.z]} onClick={click}>{highlight}<mesh position={[0, 1.25, 0]}><cylinderGeometry args={[0.045, 0.06, 2.5, 8]} /><meshStandardMaterial color={selected ? "#b9d8ff" : "#77818d"} /></mesh><mesh position={[0.18, 2.45, 0]}><boxGeometry args={[0.38, 0.08, 0.08]} /><meshStandardMaterial color="#d9e7ff" emissive="#6c9cff" emissiveIntensity={0.35} /></mesh></group>;
  if (item.type === "crosswalk") return <group position={[item.x, 0, item.z]} onClick={click}>{highlight}<mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[3, 1.4]} /><meshStandardMaterial color={selected ? "#dbeafe" : "#e5e7eb"} /></mesh></group>;
  if (item.type === "bikeLane") return <group position={[item.x, 0, item.z]} onClick={click}>{highlight}<mesh position={[0, 0.07, 0]}><boxGeometry args={[2.2, 0.12, 8]} /><meshStandardMaterial color={selected ? "#72b5f8" : "#2879bd"} /></mesh><mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.8, 1.5]} /><meshBasicMaterial color="#d9f3ff" /></mesh></group>;
  if (item.type === "busStop") return <group position={[item.x, 0, item.z]} onClick={click}>{highlight}<mesh position={[-1, 1, 0]}><boxGeometry args={[0.08, 2, 0.08]} /><meshStandardMaterial color="#8693a1" /></mesh><mesh position={[0, 1.9, 0]}><boxGeometry args={[2.2, 0.08, 1.1]} /><meshStandardMaterial color="#74b8e8" transparent opacity={0.7} /></mesh><mesh position={[0, 0.45, 0]}><boxGeometry args={[1.7, 0.12, 0.5]} /><meshStandardMaterial color="#4b5563" /></mesh></group>;
  if (item.type === "trafficLight") return <group position={[item.x, 0, item.z]} onClick={click}>{highlight}<mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.05, 0.07, 2.4, 8]} /><meshStandardMaterial color="#3f4650" /></mesh><mesh position={[0, 2.1, 0]}><boxGeometry args={[0.25, 0.6, 0.2]} /><meshStandardMaterial color={selected ? "#8eb8ee" : "#222a33"} /></mesh><mesh position={[0, 2.28, 0.11]}><sphereGeometry args={[0.055, 12, 8]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.4} /></mesh></group>;
  if (item.type === "roadSign") return <group position={[item.x, 0, item.z]} onClick={click}>{highlight}<mesh position={[0, 0.8, 0]}><cylinderGeometry args={[0.045, 0.05, 1.6, 8]} /><meshStandardMaterial color="#9ba4ad" /></mesh><mesh position={[0, 1.55, 0]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.55, 0.55, 0.05]} /><meshStandardMaterial color={selected ? "#fca5a5" : "#dc4b4b"} /></mesh></group>;
  if (item.type === "barrier") return <group position={[item.x, 0, item.z]} onClick={click}>{highlight}{[-1.2, 0, 1.2].map((offset) => <mesh key={offset} position={[offset, 0.45, 0]}><cylinderGeometry args={[0.07, 0.09, 0.9, 8]} /><meshStandardMaterial color="#d6a744" /></mesh>)}<mesh position={[0, 0.55, 0]}><boxGeometry args={[2.7, 0.12, 0.12]} /><meshStandardMaterial color={selected ? "#f5d27a" : "#b5862d"} /></mesh></group>;
  if (item.type === "bench") return <group position={[item.x, 0, item.z]} onClick={click}>{highlight}<mesh position={[0, 0.55, 0]}><boxGeometry args={[1.7, 0.14, 0.45]} /><meshStandardMaterial color={selected ? "#d7a66c" : "#9b6b3f"} /></mesh><mesh position={[0, 0.95, 0.17]}><boxGeometry args={[1.7, 0.75, 0.1]} /><meshStandardMaterial color="#875b38" /></mesh>{[-0.65, 0.65].map((offset) => <mesh key={offset} position={[offset, 0.25, 0]}><boxGeometry args={[0.1, 0.5, 0.3]} /><meshStandardMaterial color="#444b55" /></mesh>)}</group>;
  const sidewalk = item.type === "sidewalk";
  return <group position={[item.x, 0, item.z]} onClick={click}>{highlight}<mesh position={[0, sidewalk ? 0.12 : 0.08, 0]}><boxGeometry args={[sidewalk ? 2 : 4, sidewalk ? 0.24 : 0.16, 8]} /><meshStandardMaterial color={selected ? "#8eb8ee" : sidewalk ? "#89929c" : "#282d34"} /></mesh></group>;
}

function CityModelElement({ item, selected, onClick, highlight }: { item: StreetElement; selected: boolean; onClick: (event: ThreeEvent<MouseEvent>) => void; highlight: ReactNode }) {
  const texture = useTexture("/Section/infra.jpg");
  texture.colorSpace = "srgb";
  return <group position={[item.x, 0.2, item.z]} rotation={[-0.42, 0, 0]} onClick={onClick}>
    {highlight}
    <mesh position={[0, 0, 0.1]}>
      <boxGeometry args={[8.4, 0.12, 8.4]} />
      <meshStandardMaterial color="#1c2633" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[8, 8]} />
      <meshStandardMaterial map={texture} color={selected ? "#b8d9ff" : "#ffffff"} roughness={0.7} />
    </mesh>
  </group>;
}

function MeasureGuide({ points }: { points: Point[] }) {
  if (points.length < 1) return null;
  return <>{points.map((point) => <mesh key={`${point.x}-${point.z}`} position={[point.x, 0.12, point.z]}><sphereGeometry args={[0.12, 12, 8]} /><meshBasicMaterial color="#70b7ff" /></mesh>)}{points.length === 2 && (() => {
    const [start, end] = points;
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    return <mesh position={[(start.x + end.x) / 2, 0.12, (start.z + end.z) / 2]} rotation={[0, Math.atan2(dz, dx), 0]}><boxGeometry args={[distance, 0.04, 0.04]} /><meshBasicMaterial color="#70b7ff" /></mesh>;
  })()}</>;
}

function SelectedOverlay({ item, suggestion, onFix }: { item: StreetElement; suggestion: string; onFix: () => void }) {
  return <Html position={[item.x, 2.8, item.z]} center distanceFactor={9} occlude={false}>
    <div className="w-64 rounded-xl border border-blue-300/25 bg-[#202020]/95 p-3 text-left text-zinc-100 shadow-xl shadow-black/40 backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between border-b border-white/[0.08] pb-2">
        <span className="text-[11px] font-semibold text-blue-100">Selected element</span>
        <span className="rounded-md bg-blue-400/10 px-2 py-1 text-[10px] text-blue-200">{elementLabels[item.type]}</span>
      </div>
      <p className="text-[10px] leading-4 text-zinc-300">{suggestion}</p>
      <button onClick={onFix} className="mt-3 w-full rounded-lg border border-blue-300/20 bg-blue-400/10 px-3 py-2 text-[10px] text-blue-100 transition hover:bg-blue-400/20">AI Suggest Fix</button>
    </div>
  </Html>;
}

function Scene({ tool, elements, selectedId, selected, selectedSuggestion, measurePoints, undergroundUtilities, onPlace, onSelect, onEmpty, onFix }: {
  tool: Tool;
  elements: StreetElement[];
  selectedId: number | null;
  selected: StreetElement | null;
  selectedSuggestion: string;
  measurePoints: Point[];
  undergroundUtilities: boolean;
  onPlace: (event: ThreeEvent<MouseEvent>) => void;
  onSelect: (id: number) => void;
  onEmpty: (event: ThreeEvent<MouseEvent>) => void;
  onFix: () => void;
}) {
  return <><color attach="background" args={["#0a0a0a"]} /><ambientLight intensity={0.7} /><directionalLight position={[5, 8, 4]} intensity={1.4} /><Grid args={[100, 100]} cellSize={0.5} sectionSize={5} cellColor="#303640" sectionColor="#566170" fadeDistance={30} fadeStrength={1.3} infiniteGrid /><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} onClick={tool === "measure" ? onPlace : onEmpty}><planeGeometry args={[100, 100]} /><meshBasicMaterial transparent opacity={0} /></mesh>{undergroundUtilities && <group position={[0, -0.18, 0]}>{[-2, 0, 2].map((x) => <mesh key={x} rotation={[0, 0, Math.PI / 2]} position={[x, 0, 0]}><cylinderGeometry args={[0.045, 0.045, 100, 8]} /><meshBasicMaterial color={x === -2 ? "#3b82f6" : x === 0 ? "#eab308" : "#ef4444"} transparent opacity={0.75} /></mesh>)}</group>}<MeasureGuide points={measurePoints} />{elements.map((item) => <Element key={item.id} item={item} selected={item.id === selectedId} onSelect={() => onSelect(item.id)} />)}{selected && <SelectedOverlay item={selected} suggestion={selectedSuggestion} onFix={onFix} />}<OrbitControls makeDefault enableDamping /></>;
}

export default function InfrastructurePage() {
  const [tool, setTool] = useState<Tool>("select");
  const [elements, setElements] = useState<StreetElement[]>([{ id: 1, type: "road", x: 0, z: 0 }, { id: 2, type: "sidewalk", x: -3, z: 0 }, { id: 3, type: "sidewalk", x: 3, z: 0 }, { id: 4, type: "cityModel", x: 0, z: 0 }]);
  const [past, setPast] = useState<StreetElement[][]>([]);
  const [future, setFuture] = useState<StreetElement[][]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [measurePoints, setMeasurePoints] = useState<Point[]>([]);
  const [undergroundUtilities, setUndergroundUtilities] = useState(false);
  const [specialOpen, setSpecialOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    { role: "assistant", text: "I can analyze mobility, accessibility, drainage, safety, and zoning for this layout." },
  ]);
  const aiTimer = useRef<number | null>(null);

  useEffect(() => () => { if (aiTimer.current) window.clearTimeout(aiTimer.current); }, []);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedId(null);
        setMeasurePoints([]);
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);

  const commitElements = (next: StreetElement[]) => {
    setPast((history) => [...history, elements]);
    setElements(next);
    setFuture([]);
  };
  const undo = () => {
    const previous = past[past.length - 1];
    if (!previous) return;
    setFuture((history) => [elements, ...history]);
    setElements(previous);
    setPast((history) => history.slice(0, -1));
    setSelectedId(null);
  };
  const redo = () => {
    const next = future[0];
    if (!next) return;
    setPast((history) => [...history, elements]);
    setElements(next);
    setFuture((history) => history.slice(1));
    setSelectedId(null);
  };

  const counts = useMemo(() => Object.fromEntries(Object.keys(elementLabels).map((type) => [type, elements.filter((item) => item.type === type).length])) as Record<ElementType, number>, [elements]);
  const selected = elements.find((item) => item.id === selectedId) ?? null;
  const selectedDimensions = selected ? (selected.type === "road" ? "4m wide x 8m long" : selected.type === "sidewalk" ? "2m wide x 8m long" : "1m wide x 1m long") : "";
  const selectedSuggestion = selected?.type === "sidewalk" ? "Width: 1.5m — meets accessibility standard" : selected?.type === "tree" ? "Distance to nearest tree: 4m" : selected ? "No element-specific issues detected." : "";
  const measuredDistance = measurePoints.length === 2 ? Math.hypot(measurePoints[1].x - measurePoints[0].x, measurePoints[1].z - measurePoints[0].z) : null;
  const suggestions = useMemo(() => [
    ...(counts.sidewalk === 0 ? ["Sidewalk coverage is missing — add a continuous accessible route"] : []),
    ...(counts.tree === 0 ? ["No trees within 50m — consider adding greenery"] : []),
    ...(counts.crosswalk === 0 ? ["Crosswalk spacing exceeds 150m — consider adding a crossing point"] : []),
    ...(counts.trafficLight > 0 && counts.crosswalk === 0 ? ["Traffic control should connect to a marked crossing"] : []),
  ], [counts]);
  const aiInsight = counts.busStop === 0 ? "Transit coverage is the next opportunity." : counts.bikeLane === 0 ? "A bike connection would improve multimodal access." : "Your active network has a strong multimodal mix.";

  const place = (event: ThreeEvent<MouseEvent>) => {
    if (tool === "measure") {
      setMeasurePoints((points) => points.length === 2 ? [{ x: event.point.x, z: event.point.z }] : [...points, { x: Math.round(event.point.x), z: Math.round(event.point.z) }]);
      setSelectedId(null);
      return;
    }
    if (!toolItems.some((item) => item.type === tool && !["select", "move", "delete", "measure"].includes(item.type))) return;
    const nextId = elements.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    commitElements([...elements, { id: nextId, type: tool as ElementType, x: Math.round(event.point.x), z: Math.round(event.point.z) }]);
    setSelectedId(nextId);
  };
  const select = (id: number) => {
    if (tool === "delete") {
      commitElements(elements.filter((item) => item.id !== id));
      if (selectedId === id) setSelectedId(null);
    } else {
      setSelectedId(id);
    }
  };
  const deleteSelected = () => {
    if (!selected) return;
    commitElements(elements.filter((item) => item.id !== selected.id));
    setSelectedId(null);
    setTool("select");
  };
  const runAiAction = (action: "auto-layout" | "optimize" | "accessibility" | "greenery" | "transit") => {
    setAiLoading(action);
    aiTimer.current = window.setTimeout(() => {
      const additions: StreetElement[] = [];
      const nextId = () => elements.reduce((max, item) => Math.max(max, item.id, ...additions.map((added) => added.id)), 0) + 1;
      if (action === "auto-layout") {
        if (counts.road === 0) additions.push({ id: nextId(), type: "road", x: 0, z: 0 });
        if (counts.sidewalk < 2) [-3, 3].slice(counts.sidewalk).forEach((x) => additions.push({ id: nextId(), type: "sidewalk", x, z: 0 }));
        if (counts.tree < 4) [-6, -2, 2, 6].slice(counts.tree).forEach((x) => additions.push({ id: nextId(), type: "tree", x, z: 4 }));
        if (counts.streetlight < 2) [-4, 4].slice(counts.streetlight).forEach((x) => additions.push({ id: nextId(), type: "streetlight", x, z: -3 }));
      }
      if (action === "optimize" && counts.tree < 3) [-4, 0, 4].slice(counts.tree).forEach((x) => additions.push({ id: nextId(), type: "tree", x, z: 4 }));
      if (action === "accessibility" && counts.crosswalk === 0) additions.push({ id: nextId(), type: "crosswalk", x: 0, z: 5 });
      if (action === "greenery" && counts.tree < 3) {
        [-4, 0, 4].slice(counts.tree).forEach((x) => additions.push({ id: nextId(), type: "tree", x, z: 4 }));
      }
      if (action === "transit" && counts.busStop === 0) additions.push({ id: nextId(), type: "busStop", x: 5, z: -3 });
      if (additions.length) commitElements([...elements, ...additions]);
      setAiLoading(null);
    }, 650);
  };
  const applySuggestion = (suggestion: string) => {
    if (suggestion.includes("trees")) runAiAction("greenery");
    else if (suggestion.includes("crosswalk") || suggestion.includes("crossing")) runAiAction("accessibility");
    else runAiAction("optimize");
  };
  const sendChat = () => {
    const prompt = chatInput.trim();
    if (!prompt) return;
    const lower = prompt.toLowerCase();
    const response = lower.includes("drain") ? "Drainage review: keep utility corridors clear and add a low-point inspection near the road edge." : lower.includes("safety") || lower.includes("emergency") ? "Safety review: place traffic lights at crossings and keep a continuous emergency access lane." : lower.includes("bike") || lower.includes("mobility") ? "Mobility review: connect the bike lane to the bus stop and keep the sidewalk at least 1.5m wide." : "Layout review: the current scene is ready for an accessibility and greenery pass.";
    setChatMessages((messages) => [...messages, { role: "user", text: prompt }, { role: "assistant", text: response }]);
    setChatInput("");
  };
  const exportLayout = (format: string) => {
    const content = format === "GeoJSON" ? JSON.stringify({ type: "FeatureCollection", features: elements.map((item) => ({ type: "Feature", properties: { type: item.type }, geometry: { type: "Point", coordinates: [item.x, item.z] } })) }) : elements.map((item) => `${item.type},${item.x},${item.z}`).join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `infrastructure.${format === "GeoJSON" ? "geojson" : "csv"}`; anchor.click(); URL.revokeObjectURL(url);
  };

  return <main className={`${roboto.className} flex h-screen w-full gap-2 overflow-hidden bg-[#0a0a0a] p-2 pt-20 text-zinc-100`}>
    <aside className="relative z-40 flex w-[286px] shrink-0 flex-col rounded-xl border border-white/[0.08] bg-[#171717] p-4 shadow-lg shadow-black/30"><div className="mb-5 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#3188f4] shadow-sm shadow-blue-500/20"><Route size={18} /></span><div><b className="text-sm">Crystal</b><p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Infrastructure</p></div></div><div className="mb-4 rounded-lg border border-white/[0.08] bg-[#202020] px-3 py-2 text-xs text-zinc-200">Items <ChevronDown size={13} className="float-right mt-0.5 text-zinc-500" /></div><p className="mb-2 px-1 text-[10px] uppercase tracking-[0.18em] text-zinc-600">Tools</p><div className="max-h-[52vh] space-y-1 overflow-y-auto pr-1">{toolItems.map(({ type, label, icon: Icon }) => <button key={type} onClick={() => { setTool(type); if (type !== "measure") setMeasurePoints([]); }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs transition-all duration-200 active:scale-95 ${tool === type ? "border border-blue-400/20 bg-blue-500/20 text-[#9ac3ff] shadow-sm shadow-blue-500/10" : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"}`}><Icon size={15} />{label}</button>)}</div><div className="mt-3 flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#202020] px-3 py-2 text-xs"><span className="flex items-center gap-2 text-zinc-400"><Zap size={13} />Underground utilities</span><button aria-label="Toggle underground utilities" onClick={() => setUndergroundUtilities((value) => !value)} className={`relative h-5 w-9 rounded-full transition ${undergroundUtilities ? "bg-blue-500" : "bg-zinc-700"}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${undergroundUtilities ? "left-[18px]" : "left-0.5"}`} /></button></div><div className="mt-3 flex gap-2"><button disabled={!past.length} onClick={undo} title="Undo" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-[#202020] py-2 text-xs text-zinc-300 disabled:cursor-not-allowed disabled:opacity-30"><Undo2 size={14} />Undo</button><button disabled={!future.length} onClick={redo} title="Redo" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-[#202020] py-2 text-xs text-zinc-300 disabled:cursor-not-allowed disabled:opacity-30"><Redo2 size={14} />Redo</button></div><div className="mt-auto rounded-xl border border-white/[0.08] bg-[#202020] p-3 text-[11px] text-zinc-500 shadow-sm shadow-black/20">Click the grid to place the active element. Escape clears selection.</div></aside>
    <section className="flex min-w-0 flex-1 flex-col bg-[#101112]"><header className="fixed left-2 right-2 top-2 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-[#292929] bg-[#0f0f0f] px-6"><div className="flex items-center gap-3"><img src="/Logopng.png" alt="Crystal" className="h-6 w-6 object-contain" /><b className="text-[18px] tracking-[-0.02em] text-zinc-100">Crystal</b><span className="mx-1 h-5 w-px bg-[#303030]" /><Home size={17} className="text-zinc-300" /><span className="h-5 w-px bg-[#303030] text-zinc-300" /><span className="text-[12px] font-semibold tracking-wide text-zinc-300">3D Studio <span className="text-zinc-500">/ Infrastructure</span></span></div><nav className="ml-7 flex h-full items-center gap-1 text-[13px] text-zinc-400">{["File", "Edit", "Tools", "Help", "View"].map((item) => <button key={item} className="h-9 rounded-lg px-3 transition hover:bg-white/[0.05] hover:text-white">{item}</button>)}</nav><div className="ml-3 flex h-10 items-center rounded-full border border-[#303030] bg-[#202020] p-1 text-[11px]"><a href="/crystal" className="rounded-full px-3 py-2 text-zinc-400 transition hover:text-white">Floor plan</a><a href="/crystal" className="rounded-full px-3 py-2 text-zinc-400 transition hover:text-white">Modeling</a><a href="/infrastructure" className="rounded-full bg-[#3b3b3b] px-3 py-2 font-semibold text-white shadow-[0_3px_10px_rgba(0,0,0,.24)]">Infrastructure</a></div><div className="ml-auto flex items-center gap-2.5"><div className="relative"><button onClick={() => setSpecialOpen((value) => !value)} className="flex items-center gap-2 rounded-[11px] border border-[#666] px-3 py-2 text-[11px] text-zinc-200 transition hover:bg-[#202020]">Special <ChevronDown size={13} /></button>{specialOpen && <div className="absolute right-0 top-11 z-20 w-48 rounded-xl border border-white/[0.08] bg-[#202020] p-2 shadow-lg">{["Residential Street", "Main Avenue", "Pedestrian-only Zone"].map((preset) => <button key={preset} onClick={() => setSpecialOpen(false)} className="block w-full rounded-lg px-3 py-2 text-left text-xs text-zinc-400 transition-all duration-200 hover:bg-white/[0.06] hover:text-white">{preset}</button>)}</div>}</div><button onClick={() => exportLayout("GeoJSON")} className="flex items-center gap-2 rounded-[11px] border border-[#666] px-3 py-2 text-[11px] text-zinc-200 transition hover:bg-[#202020]"><Download size={14} />Export</button><button className="flex h-10 items-center gap-2 rounded-[11px] border border-[#666] px-3 text-[11px] text-zinc-200">Starter <Zap size={15} />200</button><button className="flex h-10 items-center gap-2 rounded-[10px] bg-[#1687f7] px-4 py-2 text-[12px] font-semibold text-white shadow-[0_8px_20px_rgba(22,135,247,.2)]"><Zap size={17} fill="currentColor" />Go Pro</button></div></header><div className="relative min-h-0 flex-1"><div className="absolute left-3 top-3 z-10 flex flex-col gap-1 rounded-lg border border-white/[0.08] bg-[#202020]/95 p-1 shadow-lg">{toolItems.slice(0, 5).map(({ type, label, icon: Icon }) => <button key={type} onClick={() => setTool(type)} title={label} className={`grid h-9 w-9 place-items-center rounded-md transition-all duration-200 active:scale-95 ${tool === type ? "bg-blue-500/20 text-[#9ac3ff]" : "text-zinc-400 hover:bg-white/[0.07] hover:text-white"}`}><Icon size={16} /></button>)}</div>        <Canvas camera={{ position: [9, 8, 10], fov: 45 }}><Scene tool={tool} elements={elements} selectedId={selectedId} selected={selected} selectedSuggestion={selectedSuggestion} measurePoints={measurePoints} undergroundUtilities={undergroundUtilities} onPlace={place} onSelect={select} onEmpty={() => setSelectedId(null)} onFix={() => applySuggestion(selectedSuggestion)} /></Canvas>{tool === "measure" && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-blue-400/20 bg-[#202020]/95 px-4 py-2 text-xs text-blue-100 shadow-lg">{measuredDistance ? `Distance: ${measuredDistance.toFixed(1)} m` : "Click two points to measure distance"}</div>}{chatOpen ? <div className="absolute bottom-4 left-1/2 z-20 w-[min(520px,calc(100%-2rem))] -translate-x-1/2 rounded-xl border border-blue-400/30 bg-[#101010]/95 p-3 shadow-xl shadow-black/40 backdrop-blur-sm"><div className="mb-2 flex items-center justify-between"><div className="flex items-center gap-2 text-xs font-medium text-zinc-200"><MessageCircle size={15} className="text-blue-300" />AI Chat</div><button onClick={() => setChatOpen(false)} className="rounded-md px-2 py-1 text-[10px] text-zinc-500 hover:bg-white/[0.06] hover:text-white">Hide</button></div><div className="mb-2 max-h-20 overflow-y-auto">{chatMessages.slice(-2).map((message, index) => <div key={`${message.role}-${index}`} className="mb-1 rounded-lg bg-white/[0.05] px-3 py-2 text-[10px] leading-4 text-zinc-300">{message.text}</div>)}</div><div className="mb-2 flex flex-wrap gap-1"><button onClick={() => setChatInput("Analyze mobility and transit connections")} className="rounded-md border border-white/[0.08] px-2 py-1 text-[9px] text-zinc-400 hover:bg-white/[0.06]">Mobility</button><button onClick={() => setChatInput("Review drainage and utility corridors")} className="rounded-md border border-white/[0.08] px-2 py-1 text-[9px] text-zinc-400 hover:bg-white/[0.06]">Drainage</button><button onClick={() => setChatInput("Check emergency route safety")} className="rounded-md border border-white/[0.08] px-2 py-1 text-[9px] text-zinc-400 hover:bg-white/[0.06]">Safety</button></div><div className="flex gap-2"><input value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendChat(); }} placeholder="Ask about this layout..." className="min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-[#171717] px-3 py-2 text-[10px] text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-blue-400/40" /><button onClick={sendChat} aria-label="Send AI message" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-500/20 text-blue-200 hover:bg-blue-500/30"><Send size={13} /></button></div></div> : <button onClick={() => setChatOpen(true)} className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-blue-400/30 bg-[#202020]/95 px-4 py-2 text-xs text-blue-100 shadow-lg"><MessageCircle size={14} />Show AI Chat</button>}</div></section>
    <aside className="relative z-40 w-[286px] shrink-0 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#171717] p-4 shadow-lg shadow-black/30"><div className="mb-5 flex items-center justify-between"><h2 className="text-sm font-semibold">Statistics</h2><button className="rounded-md p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"><ChevronDown size={14} /></button></div><div className="space-y-2">{[["Total Street Length", `${counts.road * 100} m`], ["Sidewalk Width", counts.sidewalk ? "1.5 m" : "0 m"], ["Tree Count", `${counts.tree}`], ["Bike Lanes", `${counts.bikeLane}`], ["Transit Stops", `${counts.busStop}`], ["Traffic Controls", `${counts.trafficLight}`], ["Green Coverage", `${Math.min(100, counts.tree * 8)}%`], ["Underground Utilities", undergroundUtilities ? "Enabled" : "Surface"]].map(([label, value]) => <div key={label} className="rounded-lg border border-white/[0.08] bg-[#202020] p-3 shadow-sm shadow-black/20"><p className="text-[10px] text-zinc-500">{label}</p><p className="mt-1 text-sm font-semibold text-zinc-200">{value}</p></div>)}</div>{selected && <div className="mt-6 rounded-xl border border-blue-400/20 bg-blue-400/[0.06] p-3"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold text-blue-100">Inspector</h2><button onClick={() => setSelectedId(null)} className="text-[10px] text-blue-200/60 hover:text-white">Clear</button></div>    <p className="text-xs font-medium text-zinc-100">{elementLabels[selected.type]}</p><p className="mt-1 text-[11px] text-zinc-400">Position {selected.x}, {selected.z}</p><p className="mt-1 text-[11px] text-zinc-400">Dimensions {selectedDimensions}</p><p className="mt-2 text-[11px] leading-4 text-blue-100/80">{selectedSuggestion}</p><button onClick={deleteSelected} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-red-400/20 bg-red-400/[0.08] py-2 text-xs text-red-200 hover:bg-red-400/[0.15]"><Trash2 size={13} />Delete selected</button></div>}<div className="mt-6 rounded-xl border border-white/[0.08] bg-[#202020] p-3"><div className="mb-2 flex items-center gap-2"><Sparkles size={15} className="text-blue-300" /><h2 className="text-sm font-semibold">AI Tools</h2></div><p className="mb-3 text-[11px] leading-4 text-zinc-500">{aiInsight} Actions use the current layout and run locally.</p>    <div className="space-y-2">{[["auto-layout", "AI Auto-Layout", "Generate a complete street arrangement"], ["optimize", "AI Optimize", "Adjust spacing to planning standards"], ["accessibility", "Improve accessibility", "Add a crossing where one is missing"], ["greenery", "Balance greenery", "Place trees along the active corridor"], ["transit", "Add transit coverage", "Place a bus stop near the road"]].map(([action, label, description]) => <button key={action} disabled={!!aiLoading} onClick={() => runAiAction(action as "auto-layout" | "optimize" | "accessibility" | "greenery" | "transit")} className="flex w-full items-center justify-between rounded-lg border border-white/[0.08] px-3 py-2 text-left transition hover:bg-white/[0.06] disabled:cursor-wait disabled:opacity-60"><span><span className="block text-xs text-zinc-200">{aiLoading === action ? action === "auto-layout" ? "Generating suggestions..." : "Analyzing layout..." : label}</span><span className="block text-[10px] text-zinc-500">{description}</span></span>{aiLoading === action ? <Loader2 size={14} className="animate-spin text-blue-300" /> : <Sparkles size={13} className="text-zinc-500" />}</button>)}</div></div><h2 className="mb-3 mt-6 text-sm font-semibold">Suggestions</h2><div className="space-y-2">{suggestions.map((suggestion) => <div key={suggestion} className="flex gap-2 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] p-3 text-[11px] leading-4 text-amber-100 shadow-sm shadow-black/20">    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-300" /><span className="flex-1">{suggestion}</span><button onClick={() => applySuggestion(suggestion)} disabled={!!aiLoading} className="shrink-0 rounded-md border border-amber-300/20 px-2 py-1 text-[10px] text-amber-100 transition hover:bg-amber-300/10 disabled:opacity-50">AI Fix</button></div>)}{suggestions.length === 0 && <div className="flex gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] p-3 text-[11px] text-emerald-100 shadow-sm shadow-black/20"><Lightbulb size={14} />Layout looks balanced.</div>}</div></aside>
  </main>;
}
