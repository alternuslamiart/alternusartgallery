"use client";

import { Canvas, ThreeEvent } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import { Roboto } from "next/font/google";
import { useMemo, useState } from "react";
import {
  AlertTriangle, ChevronDown, Download, Footprints, LampCeiling,
  Lightbulb, MapPin, MousePointer2, Plus, Route, Trash2, TreePine,
} from "lucide-react";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" });

type ElementType = "road" | "sidewalk" | "tree" | "streetlight" | "crosswalk";
type Tool = "select" | "move" | "delete" | ElementType;
type StreetElement = { id: number; type: ElementType; x: number; z: number };

const toolItems: Array<{ type: Tool; label: string; icon: typeof Route }> = [
  { type: "road", label: "Draw Road", icon: Route },
  { type: "sidewalk", label: "Add Sidewalk", icon: Footprints },
  { type: "tree", label: "Add Tree", icon: TreePine },
  { type: "streetlight", label: "Add Streetlight", icon: LampCeiling },
  { type: "crosswalk", label: "Add Crosswalk", icon: MapPin },
  { type: "select", label: "Select", icon: MousePointer2 },
  { type: "move", label: "Move", icon: Plus },
  { type: "delete", label: "Delete", icon: Trash2 },
];

function Element({ item, selected, onSelect }: { item: StreetElement; selected: boolean; onSelect: () => void }) {
  if (item.type === "tree") return <group position={[item.x, 0, item.z]} onClick={(event) => { event.stopPropagation(); onSelect(); }}><mesh position={[0, 0.65, 0]}><cylinderGeometry args={[0.12, 0.16, 1.3, 10]} /><meshStandardMaterial color="#76513b" /></mesh><mesh position={[0, 1.55, 0]}><icosahedronGeometry args={[0.75, 1]} /><meshStandardMaterial color={selected ? "#8ee6a0" : "#3d9b5b"} /></mesh></group>;
  if (item.type === "streetlight") return <group position={[item.x, 0, item.z]} onClick={(event) => { event.stopPropagation(); onSelect(); }}><mesh position={[0, 1.25, 0]}><cylinderGeometry args={[0.045, 0.06, 2.5, 8]} /><meshStandardMaterial color={selected ? "#b9d8ff" : "#77818d"} /></mesh><mesh position={[0.18, 2.45, 0]}><boxGeometry args={[0.38, 0.08, 0.08]} /><meshStandardMaterial color="#d9e7ff" emissive="#6c9cff" emissiveIntensity={0.35} /></mesh></group>;
  if (item.type === "crosswalk") return <mesh position={[item.x, 0.035, item.z]} rotation={[-Math.PI / 2, 0, 0]} onClick={(event) => { event.stopPropagation(); onSelect(); }}><planeGeometry args={[3, 1.4]} /><meshStandardMaterial color={selected ? "#dbeafe" : "#e5e7eb"} /></mesh>;
  const sidewalk = item.type === "sidewalk";
  return <mesh position={[item.x, sidewalk ? 0.12 : 0.08, item.z]} onClick={(event) => { event.stopPropagation(); onSelect(); }}><boxGeometry args={[sidewalk ? 2 : 4, sidewalk ? 0.24 : 0.16, 8]} /><meshStandardMaterial color={selected ? "#8eb8ee" : sidewalk ? "#89929c" : "#282d34"} /></mesh>;
}

function Scene({ tool, elements, selectedId, onPlace, onSelect }: { tool: Tool; elements: StreetElement[]; selectedId: number | null; onPlace: (event: ThreeEvent<MouseEvent>) => void; onSelect: (id: number) => void }) {
  return <><color attach="background" args={["#0a0a0a"]} /><ambientLight intensity={0.7} /><directionalLight position={[5, 8, 4]} intensity={1.4} /><Grid args={[100, 100]} cellSize={0.5} sectionSize={5} cellColor="#303640" sectionColor="#566170" fadeDistance={30} fadeStrength={1.3} infiniteGrid /><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} onClick={onPlace} visible={tool !== "select"}><planeGeometry args={[100, 100]} /><meshBasicMaterial transparent opacity={0} /></mesh>{elements.map((item) => <Element key={item.id} item={item} selected={item.id === selectedId} onSelect={() => onSelect(item.id)} />)}<OrbitControls makeDefault enableDamping /></>;
}

export default function InfrastructurePage() {
  const [tool, setTool] = useState<Tool>("select");
  const [elements, setElements] = useState<StreetElement[]>([{ id: 1, type: "road", x: 0, z: 0 }, { id: 2, type: "sidewalk", x: -3, z: 0 }, { id: 3, type: "sidewalk", x: 3, z: 0 }]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [specialOpen, setSpecialOpen] = useState(false);
  const trees = elements.filter((item) => item.type === "tree").length;
  const roads = elements.filter((item) => item.type === "road").length;
  const crosswalks = elements.filter((item) => item.type === "crosswalk").length;
  const suggestions = useMemo(() => [
    ...(elements.some((item) => item.type === "sidewalk") ? [] : ["Sidewalk width below 1.5m — consider widening for accessibility"]),
    ...(trees === 0 ? ["No trees within 50m — consider adding greenery"] : []),
    ...(crosswalks === 0 ? ["Crosswalk spacing exceeds 150m — consider adding a crossing point"] : []),
  ], [elements, trees, crosswalks]);
  const place = (event: ThreeEvent<MouseEvent>) => {
    if (!["road", "sidewalk", "tree", "streetlight", "crosswalk"].includes(tool)) return;
    const id = Date.now();
    setElements((items) => [...items, { id, type: tool as ElementType, x: Math.round(event.point.x), z: Math.round(event.point.z) }]);
    setSelectedId(id);
  };
  const select = (id: number) => {
    if (tool === "delete") setElements((items) => items.filter((item) => item.id !== id));
    else setSelectedId(id);
  };
  const exportLayout = (format: string) => {
    const content = format === "GeoJSON" ? JSON.stringify({ type: "FeatureCollection", features: elements.map((item) => ({ type: "Feature", properties: { type: item.type }, geometry: { type: "Point", coordinates: [item.x, item.z] } })) }) : elements.map((item) => `${item.type},${item.x},${item.z}`).join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `infrastructure.${format === "GeoJSON" ? "geojson" : "csv"}`; anchor.click(); URL.revokeObjectURL(url);
  };

  return <main className={`${roboto.className} flex h-screen w-full gap-2 overflow-hidden bg-[#0a0a0a] p-2 text-zinc-100`}>
    <aside className="flex w-[286px] shrink-0 flex-col rounded-xl border border-white/[0.08] bg-[#171717] p-4 shadow-lg shadow-black/30"><div className="mb-5 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#3188f4] shadow-sm shadow-blue-500/20"><Route size={18} /></span><div><b className="text-sm">Crystal</b><p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Infrastructure</p></div></div><div className="mb-4 rounded-lg border border-white/[0.08] bg-[#202020] px-3 py-2 text-xs text-zinc-200">Items <ChevronDown size={13} className="float-right mt-0.5 text-zinc-500" /></div><p className="mb-2 px-1 text-[10px] uppercase tracking-[0.18em] text-zinc-600">Tools</p><div className="space-y-1">{toolItems.map(({ type, label, icon: Icon }) => <button key={type} onClick={() => setTool(type)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs transition-all duration-200 active:scale-95 ${tool === type ? "border border-blue-400/20 bg-blue-500/20 text-[#9ac3ff] shadow-sm shadow-blue-500/10" : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"}`}><Icon size={15} />{label}</button>)}</div><div className="mt-auto rounded-xl border border-white/[0.08] bg-[#202020] p-3 text-[11px] text-zinc-500 shadow-sm shadow-black/20">Click the grid to place the active element.</div></aside>
    <section className="flex min-w-0 flex-1 flex-col bg-[#101112]"><header className="flex h-14 shrink-0 items-center gap-4 border-b border-white/[0.08] px-4"><b className="text-sm">Crystal</b><span className="text-zinc-600">/</span><span className="text-xs text-zinc-300">3D Studio / Infrastructure</span><nav className="ml-4 flex rounded-lg border border-white/[0.08] bg-[#202020] p-1 text-xs shadow-sm shadow-black/20"><a href="/crystal" className="rounded-md px-3 py-1.5 text-zinc-500 transition-all duration-200 hover:bg-white/[0.05] hover:text-white">Floor plan</a><a href="/crystal" className="rounded-md px-3 py-1.5 text-zinc-500 transition-all duration-200 hover:bg-white/[0.05] hover:text-white">Modeling</a><a href="/infrastructure" className="rounded-md border border-blue-400/20 bg-blue-500/20 px-3 py-1.5 text-[#9ac3ff] shadow-sm shadow-blue-500/10">Infrastructure</a></nav><div className="ml-auto flex items-center gap-2"><div className="relative"><button onClick={() => setSpecialOpen((value) => !value)} className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#202020] px-3 py-2 text-xs shadow-sm transition-all duration-200 hover:bg-[#292929] active:scale-95">Special <ChevronDown size={13} /></button>{specialOpen && <div className="absolute right-0 top-11 z-20 w-48 rounded-xl border border-white/[0.08] bg-[#202020] p-2 shadow-lg">{["Residential Street", "Main Avenue", "Pedestrian-only Zone"].map((preset) => <button key={preset} onClick={() => setSpecialOpen(false)} className="block w-full rounded-lg px-3 py-2 text-left text-xs text-zinc-400 transition-all duration-200 hover:bg-white/[0.06] hover:text-white">{preset}</button>)}</div>}</div><button onClick={() => exportLayout("GeoJSON")} className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#202020] px-3 py-2 text-xs shadow-sm transition-all duration-200 hover:bg-[#292929] active:scale-95"><Download size={14} />Export</button></div></header><div className="relative min-h-0 flex-1"><div className="absolute left-3 top-3 z-10 flex flex-col gap-1 rounded-lg border border-white/[0.08] bg-[#202020]/95 p-1 shadow-lg">{toolItems.slice(0, 5).map(({ type, label, icon: Icon }) => <button key={type} onClick={() => setTool(type)} title={label} className={`grid h-9 w-9 place-items-center rounded-md transition-all duration-200 active:scale-95 ${tool === type ? "bg-blue-500/20 text-[#9ac3ff]" : "text-zinc-400 hover:bg-white/[0.07] hover:text-white"}`}><Icon size={16} /></button>)}</div><Canvas camera={{ position: [9, 8, 10], fov: 45 }}><Scene tool={tool} elements={elements} selectedId={selectedId} onPlace={place} onSelect={select} /></Canvas></div></section>
    <aside className="w-[286px] shrink-0 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#171717] p-4 shadow-lg shadow-black/30"><div className="mb-5 flex items-center justify-between"><h2 className="text-sm font-semibold">Statistics</h2><button className="rounded-md p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"><ChevronDown size={14} /></button></div><div className="space-y-2">{[["Total Street Length", `${roads * 100} m`], ["Sidewalk Width", "1.5 m"], ["Tree Count", `${trees}`], ["Trees per 100m ratio", `${trees}`], ["Green Coverage", `${Math.min(100, trees * 8)}%`], ["Parking Spots", "0"]].map(([label, value]) => <div key={label} className="rounded-lg border border-white/[0.08] bg-[#202020] p-3 shadow-sm shadow-black/20"><p className="text-[10px] text-zinc-500">{label}</p><p className="mt-1 text-sm font-semibold text-zinc-200">{value}</p></div>)}</div><h2 className="mb-3 mt-6 text-sm font-semibold">Suggestions</h2><div className="space-y-2">{suggestions.map((suggestion) => <div key={suggestion} className="flex gap-2 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] p-3 text-[11px] leading-4 text-amber-100 shadow-sm shadow-black/20"><AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-300" />{suggestion}</div>)}{suggestions.length === 0 && <div className="flex gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] p-3 text-[11px] text-emerald-100 shadow-sm shadow-black/20"><Lightbulb size={14} />Layout looks balanced.</div>}</div></aside>
  </main>;
}
