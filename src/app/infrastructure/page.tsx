"use client";

import { Roboto } from "next/font/google";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  Armchair,
  Bike,
  Building2,
  BusFront,
  ChevronDown,
  Check,
  CircleHelp,
  Copy,
  Eye,
  EyeOff,
  Focus,
  Footprints,
  Gauge,
  Home,
  LampCeiling,
  Lightbulb,
  Lock,
  MessageCircle,
  MousePointer2,
  ParkingSquare,
  Redo2,
  Rotate3D,
  Route,
  Ruler,
  Send,
  Signpost,
  Sun,
  Trash2,
  TreePine,
  Undo2,
  Unlock,
  Waves,
  TrafficCone,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { InfrastructureViewport } from "./infrastructure-scene";
import type {
  CameraPreset,
  LightingSettings,
  TransformMode,
  ViewportApi,
} from "./infrastructure-scene";
import {
  createInitialInfrastructure,
  infrastructureLabels,
  makeInfrastructureObject,
} from "./infrastructure-types";
import type {
  InfrastructureObject,
  InfrastructureType,
  LightingPreset,
} from "./infrastructure-types";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" });

const cameraPresets: CameraPreset[] = ["Perspective", "Front", "Back", "Left", "Right", "Top", "Bottom"];
const lightPresets: LightingPreset[] = ["Day", "Golden hour", "Night", "Studio"];
const categories: Array<{ title: string; items: Array<{ type: InfrastructureType; label: string; icon: LucideIcon }> }> = [
  { title: "Roads & circulation", items: [
    { type: "road", label: "Road segment", icon: Route },
    { type: "roundabout", label: "Roundabout", icon: Rotate3D },
    { type: "parking", label: "Parking lot", icon: ParkingSquare },
    { type: "crosswalk", label: "Crosswalk", icon: Footprints },
    { type: "barrier", label: "Road barrier", icon: Route },
    { type: "sidewalk", label: "Sidewalk", icon: Footprints },
    { type: "bikeLane", label: "Bike lane", icon: Bike },
    { type: "busStop", label: "Bus stop", icon: BusFront },
    { type: "trafficLight", label: "Traffic light", icon: TrafficCone },
    { type: "roadSign", label: "Road sign", icon: Signpost },
    { type: "vehicle", label: "Vehicle", icon: Gauge },
  ] },
  { title: "Buildings", items: [
    { type: "building", label: "Commercial building", icon: Building2 },
    { type: "pavilion", label: "Pavilion", icon: Home },
  ] },
  { title: "Landscape & public realm", items: [
    { type: "tree", label: "Tree", icon: TreePine },
    { type: "shrub", label: "Shrub bed", icon: TreePine },
    { type: "path", label: "Pedestrian path", icon: Footprints },
    { type: "water", label: "Waterway", icon: Waves },
    { type: "bridge", label: "Pedestrian bridge", icon: Route },
    { type: "plaza", label: "Public plaza", icon: Armchair },
    { type: "fountain", label: "Fountain", icon: Waves },
    { type: "bench", label: "Bench", icon: Armchair },
    { type: "lamp", label: "Street light", icon: LampCeiling },
  ] },
];

const toolButtons: Array<{ id: TransformMode; title: string; icon: LucideIcon }> = [
  { id: "select", title: "Select (V)", icon: MousePointer2 },
  { id: "move", title: "Move (G)", icon: Route },
  { id: "rotate", title: "Rotate (R)", icon: Rotate3D },
  { id: "scale", title: "Scale (S)", icon: Focus },
  { id: "measure", title: "Measure distance", icon: Ruler },
];

const initialLighting: LightingSettings = {
  preset: "Day",
  intensity: 1,
  azimuth: -42,
  elevation: 48,
  shadowSoftness: 3,
  shadows: true,
};

function NumericField({
  label,
  value,
  step = 0.5,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="infra-field">
      <span>{label}</span>
      <input
        type="number"
        value={Number(value.toFixed(2))}
        step={step}
        onChange={(event) => {
          const next = event.currentTarget.valueAsNumber;
          if (Number.isFinite(next)) onChange(next);
        }}
      />
    </label>
  );
}

function ActionButton({
  title,
  onClick,
  children,
  active = false,
  disabled = false,
  className = "",
}: {
  title: string;
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`infra-action ${active ? "is-active" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

export default function InfrastructurePage() {
  const [objects, setObjects] = useState<InfrastructureObject[]>(createInitialInfrastructure);
  const [past, setPast] = useState<InfrastructureObject[][]>([]);
  const [future, setFuture] = useState<InfrastructureObject[][]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tool, setTool] = useState<TransformMode>("select");
  const [roadStart, setRoadStart] = useState<[number, number] | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [lighting, setLighting] = useState<LightingSettings>(initialLighting);
  const [undergroundUtilities, setUndergroundUtilities] = useState(false);
  const [lightingOpen, setLightingOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    { role: "assistant", text: "I can review access, mobility, public space and landscape across this concept site." },
  ]);
  const [measurePoints, setMeasurePoints] = useState<Array<[number, number]>>([]);
  const viewport = useRef<ViewportApi>(null);

  const selected = objects.find((object) => object.id === selectedId) ?? null;
  const visibleObjects = useMemo(() => objects.filter((object) => object.visible), [objects]);
  const counts = useMemo(() => objects.reduce((summary, object) => {
    summary[object.type] = (summary[object.type] ?? 0) + 1;
    return summary;
  }, {} as Partial<Record<InfrastructureType, number>>), [objects]);
  const measuredDistance = measurePoints.length === 2
    ? Math.hypot(measurePoints[1][0] - measurePoints[0][0], measurePoints[1][1] - measurePoints[0][1])
    : null;

  const commitObjects = (next: InfrastructureObject[]) => {
    setPast((history) => [...history.slice(-39), objects]);
    setObjects(next);
    setFuture([]);
  };
  const updateObject = (id: number, changes: Partial<InfrastructureObject>) => {
    const target = objects.find((object) => object.id === id);
    if (target?.locked && !("locked" in changes) && !("visible" in changes)) return;
    commitObjects(objects.map((object) => object.id === id ? { ...object, ...changes } : object));
  };
  const undo = () => {
    const previous = past[past.length - 1];
    if (!previous) return;
    setFuture((history) => [objects, ...history]);
    setObjects(previous);
    setPast((history) => history.slice(0, -1));
  };
  const redo = () => {
    const next = future[0];
    if (!next) return;
    setPast((history) => [...history, objects]);
    setObjects(next);
    setFuture((history) => history.slice(1));
  };

  const placeObject = (
    type: InfrastructureType,
    point: { x: number; z: number },
    roadPath?: [number, number][],
  ) => {
    const nextId = objects.reduce((max, object) => Math.max(max, object.id), 0) + 1;
    const defaults: Partial<InfrastructureObject> = type === "road"
      ? {
        name: "New road segment",
        width: 7,
        depth: roadPath ? Math.hypot(roadPath[1][0] - roadPath[0][0], roadPath[1][1] - roadPath[0][1]) : 24,
        lanes: 2,
        path: roadPath ?? [[-12, 0], [12, 0]],
      }
      : type === "building"
        ? { name: "New commercial building", width: 10, depth: 8, height: 5, style: "commercial" }
        : type === "pavilion"
          ? { name: "New public pavilion", width: 6, depth: 6, height: 4 }
          : {};
    const object = makeInfrastructureObject(
      nextId,
      type,
      Math.round(point.x * 2) / 2,
      Math.round(point.z * 2) / 2,
      defaults,
    );
    commitObjects([...objects, object]);
    setSelectedId(object.id);
    setTool("select");
    setLibraryOpen(false);
    setInspectorOpen(true);
  };

  const handlePlacement = (point: { x: number; z: number }) => {
    if (tool === "road") {
      const snapped: [number, number] = [Math.round(point.x * 2) / 2, Math.round(point.z * 2) / 2];
      if (!roadStart) {
        setRoadStart(snapped);
        return;
      }
      const center: [number, number] = [(roadStart[0] + snapped[0]) / 2, (roadStart[1] + snapped[1]) / 2];
      const deltaX = snapped[0] - roadStart[0];
      const deltaZ = snapped[1] - roadStart[1];
      const arc = Math.hypot(deltaX, deltaZ) * 0.14;
      const path: [number, number][] = [
        [roadStart[0] - center[0], roadStart[1] - center[1]],
        [
          (roadStart[0] + snapped[0]) / 2 - center[0] - (deltaZ / Math.max(1, Math.hypot(deltaX, deltaZ))) * arc,
          (roadStart[1] + snapped[1]) / 2 - center[1] + (deltaX / Math.max(1, Math.hypot(deltaX, deltaZ))) * arc,
        ],
        [snapped[0] - center[0], snapped[1] - center[1]],
      ];
      placeObject("road", { x: center[0], z: center[1] }, path);
      setRoadStart(null);
    } else {
      placeObject(tool as InfrastructureType, point);
    }
  };

  const handleSceneSelect = (id: number, point: { x: number; z: number }) => {
    if (categories.some((category) => category.items.some((item) => item.type === tool))) {
      handlePlacement(point);
    } else if (tool === "measure") {
      setMeasurePoints((current) => current.length === 2
        ? [[point.x, point.z]]
        : [...current, [point.x, point.z]]);
    } else if (tool === "delete") {
      const object = objects.find((item) => item.id === id);
      if (object && window.confirm(`Delete "${object.name}" from the site?`)) {
        commitObjects(objects.filter((item) => item.id !== id));
        setSelectedId((current) => current === id ? null : current);
      }
    } else {
      setSelectedId(id);
      setInspectorOpen(true);
    }
  };

  const handleEmptyClick = (point: { x: number; z: number }) => {
    if (categories.some((category) => category.items.some((item) => item.type === tool))) {
      handlePlacement(point);
    } else if (tool === "measure") {
      setMeasurePoints((current) => current.length === 2
        ? [[point.x, point.z]]
        : [...current, [point.x, point.z]]);
    } else {
      setSelectedId(null);
    }
  };

  const confirmDeleteSelected = () => {
    if (!selected || !window.confirm(`Delete "${selected.name}" from the site?`)) return;
    commitObjects(objects.filter((object) => object.id !== selected.id));
    setSelectedId(null);
    setTool("select");
  };
  const duplicateSelected = () => {
    if (!selected) return;
    const id = objects.reduce((max, object) => Math.max(max, object.id), 0) + 1;
    const duplicate = { ...selected, id, name: `${selected.name} copy`, x: selected.x + 2, z: selected.z + 2, locked: false };
    commitObjects([...objects, duplicate]);
    setSelectedId(id);
  };
  const resetSelectedTransform = () => {
    if (selected) updateObject(selected.id, { x: 0, y: 0, z: 0, rotation: 0 });
  };

  const setLightPreset = (preset: LightingPreset) => {
    const sun = preset === "Night"
      ? { azimuth: 18, elevation: 12 }
      : preset === "Golden hour"
        ? { azimuth: -28, elevation: 16 }
        : preset === "Studio"
          ? { azimuth: -42, elevation: 65 }
          : { azimuth: -42, elevation: 48 };
    setLighting((current) => ({ ...current, preset, ...sun }));
  };

  const exportLayout = (format: "GeoJSON" | "CSV") => {
    const content = format === "GeoJSON"
      ? JSON.stringify({
        type: "FeatureCollection",
        features: objects.map((object) => ({
          type: "Feature",
          properties: {
            id: object.id,
            name: object.name,
            type: object.type,
            width: object.width,
            depth: object.depth,
            height: object.height,
            rotation: object.rotation,
            color: object.color,
          },
          geometry: { type: "Point", coordinates: [object.x, object.z] },
        })),
      }, null, 2)
      : [
        "id,name,type,x,y,z,rotation,width,depth,height,lanes,color",
        ...objects.map((object) => [
          object.id, `"${object.name.replaceAll('"', '""')}"`, object.type, object.x, object.y, object.z,
          object.rotation, object.width, object.depth, object.height, object.lanes ?? "", object.color,
        ].join(",")),
      ].join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `crystal-infrastructure.${format === "GeoJSON" ? "geojson" : "csv"}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const applySiteAction = (action: string) => {
    const additions: InfrastructureObject[] = [];
    const add = (type: InfrastructureType, x: number, z: number, name: string) => {
      const id = objects.reduce((max, object) => Math.max(max, object.id), 0) + additions.length + 1;
      additions.push(makeInfrastructureObject(id, type, x, z, { name }));
    };
    if (action === "auto-layout" || action === "greenery") {
      if ((counts.tree ?? 0) < 30) {
        [[-13, 7], [-11, 5], [12, 11], [14, 9]].forEach(([x, z], index) => add("tree", x, z, `Suggested landscape tree ${index + 1}`));
      } else if ((counts.shrub ?? 0) < 6) {
        add("shrub", -5, 12, "Suggested planted bed");
      }
      if (action === "auto-layout" && !(counts.lamp ?? 0)) add("lamp", 5, 16, "Suggested promenade light");
    }
    if (action === "accessibility" && (counts.crosswalk ?? 0) < 5) {
      add("crosswalk", 0, 8, "Suggested accessible crossing");
    }
    if (action === "transit" && (counts.busStop ?? 0) < 2) {
      add("busStop", -13, 20, "Suggested transit shelter");
    }
    if (action === "optimize") {
      add("bikeLane", 29, 0, "Suggested cycle connection");
    }
    if (!additions.length) return;
    commitObjects([...objects, ...additions]);
    setSelectedId(additions[0].id);
  };

  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text) return;
    const lower = text.toLowerCase();
    const response = lower.includes("parking") || lower.includes("access")
      ? "Access review: the east and west parking areas connect to the internal boulevard; keep the pedestrian crossings clear at each gateway."
      : lower.includes("water") || lower.includes("drain")
        ? "Water review: the creek crosses the public realm with a dedicated pedestrian bridge. Keep planting and path edges clear of the channel."
        : lower.includes("tree") || lower.includes("green")
          ? `Landscape review: ${counts.tree ?? 0} individual trees are distributed around the perimeter and public spaces.`
          : `Site review: ${objects.length} editable objects are arranged across roads, buildings, parking and public space.`;
    setMessages((current) => [...current, { role: "user", text }, { role: "assistant", text: response }]);
    setChatInput("");
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if ((event.ctrlKey || event.metaKey) && key === "y") {
        event.preventDefault();
        redo();
      } else if (key === "escape") {
        setSelectedId(null);
        setMeasurePoints([]);
        setRoadStart(null);
        setTool("select");
      } else if (key === "f" && selected) {
        viewport.current?.focus(selected);
      } else if (key === "delete" || key === "backspace") {
        if (selected && window.confirm(`Delete "${selected.name}" from the site?`)) {
          commitObjects(objects.filter((object) => object.id !== selected.id));
          setSelectedId(null);
        }
      } else if (["1", "2", "3", "4", "5", "6", "7"].includes(key)) {
        viewport.current?.preset(cameraPresets[Number(key) - 1]);
      } else if (key === "+" || key === "=") {
        viewport.current?.zoom(true);
      } else if (key === "-") {
        viewport.current?.zoom(false);
      } else if (key === "v") setTool("select");
      else if (key === "g") setTool("move");
      else if (key === "r") setTool("rotate");
      else if (key === "s") setTool("scale");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <main className={`crystal-infrastructure-page ${roboto.className} fixed inset-0 z-20 flex h-screen w-full overflow-hidden bg-[#08090b] pt-16 text-zinc-100`}>
      <header className="infra-topbar fixed left-0 right-0 top-0 z-50 flex h-16 items-center gap-3 border-b border-white/[0.08] bg-[#0c0e11]/95 px-4 backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-500 text-white"><Route size={17} /></span>
          <div className="leading-tight">
            <b className="text-[13px] tracking-wide">CRYSTAL</b>
            <div className="text-[10px] text-zinc-500">Infrastructure Studio</div>
          </div>
          <span className="mx-2 hidden h-6 w-px bg-white/10 sm:block" />
          <span className="hidden text-xs text-zinc-400 sm:block">Willow Creek District</span>
        </div>
        <div className="infra-mobile-actions">
          <button type="button" onClick={() => setLibraryOpen((open) => !open)} aria-expanded={libraryOpen}>Library</button>
          <button type="button" onClick={() => setInspectorOpen((open) => !open)} aria-expanded={inspectorOpen}>Edit</button>
        </div>
        <nav className="infra-main-nav ml-3 flex items-center gap-1 text-[11px] text-zinc-400" aria-label="Studio views">
          <button type="button" className="rounded-md px-2.5 py-2 hover:bg-white/[0.06] hover:text-white">File</button>
          <button type="button" className="rounded-md px-2.5 py-2 hover:bg-white/[0.06] hover:text-white">Edit</button>
          <button type="button" className="rounded-md px-2.5 py-2 hover:bg-white/[0.06] hover:text-white">View</button>
        </nav>
        <div className="infra-top-actions ml-auto flex items-center gap-1.5">
          <ActionButton title="Undo (Ctrl+Z)" onClick={undo} disabled={!past.length}><Undo2 size={15} /></ActionButton>
          <ActionButton title="Redo (Ctrl+Y)" onClick={redo} disabled={!future.length}><Redo2 size={15} /></ActionButton>
          <span className="mx-1 hidden h-5 w-px bg-white/10 sm:block" />
          <button type="button" onClick={() => exportLayout("GeoJSON")} className="infra-text-button">Export</button>
          <button type="button" onClick={() => exportLayout("CSV")} className="infra-text-button infra-csv-button">CSV</button>
        </div>
      </header>

      <aside className={`infra-sidebar infra-left-panel flex w-[252px] shrink-0 flex-col border-r border-white/[0.08] bg-[#101216] ${libraryOpen ? "is-open" : ""}`}>
        <div className="infra-panel-heading">
          <div><b>Site tools</b><p>Build your district</p></div>
          <CircleHelp size={15} className="text-zinc-500" />
        </div>
        <div className="infra-section-label">TRANSFORM</div>
        <div className="infra-transform-tools">
          {toolButtons.map(({ id, title, icon: Icon }) => (
            <ActionButton key={id} title={title} active={tool === id} onClick={() => setTool(id)}><Icon size={16} /></ActionButton>
          ))}
          <ActionButton title="Delete object" active={tool === "delete"} onClick={() => setTool("delete")}><Trash2 size={15} /></ActionButton>
        </div>
        <div className="infra-section-label infra-assets-title">ADD TO SCENE</div>
        <div className="infra-asset-categories">
          {categories.map((category) => (
            <details key={category.title} open>
              <summary>{category.title}<ChevronDown size={13} /></summary>
              <div className="infra-asset-grid">
                {category.items.map(({ type, label, icon: Icon }) => (
                  <button
                    type="button"
                    key={type}
                    title={`Add ${label.toLowerCase()} to the scene`}
                    aria-pressed={tool === type}
                    onClick={() => { setTool(tool === type ? "select" : type); setMeasurePoints([]); setRoadStart(null); setLibraryOpen(false); }}
                    className={`infra-asset-button ${tool === type ? "is-active" : ""}`}
                  >
                    <Icon size={15} /><span>{label}</span>
                  </button>
                ))}
              </div>
            </details>
          ))}
        </div>
        <div className="infra-hierarchy">
          <div className="infra-section-label flex items-center justify-between">
            <span>SCENE HIERARCHY</span><span className="font-normal normal-case tracking-normal text-zinc-600">{visibleObjects.length} visible</span>
          </div>
          <div className="infra-hierarchy-list">
            {objects.map((object) => (
              <button
                type="button"
                key={object.id}
                onClick={() => { setSelectedId(object.id); setTool("select"); setInspectorOpen(true); setLibraryOpen(false); }}
                className={`infra-tree-row ${object.id === selectedId ? "is-selected" : ""} ${!object.visible ? "is-hidden" : ""}`}
                title={object.name}
              >
                <span className="infra-tree-dot" />
                <span className="min-w-0 flex-1 truncate">{object.name}</span>
                {!object.visible && <EyeOff size={12} />}
              </button>
            ))}
          </div>
        </div>
        <label className="infra-utility-toggle">
          <span><Zap size={13} />Show underground utilities</span>
          <input type="checkbox" checked={undergroundUtilities} onChange={(event) => setUndergroundUtilities(event.target.checked)} />
        </label>
        <div className="infra-status"><span className="infra-online-dot" /> Session-only concept <span className="ml-auto">V / G / R / S</span></div>
      </aside>

      <section className="infra-workspace relative flex min-w-0 flex-1 flex-col bg-[#0b0d10]">
        <div className="infra-viewport relative min-h-0 flex-1">
          <InfrastructureViewport
            ref={viewport}
            objects={objects}
            selectedId={selectedId}
            tool={tool}
            lighting={lighting}
            undergroundUtilities={undergroundUtilities}
            onSelect={handleSceneSelect}
            onEmpty={handleEmptyClick}
            onFocus={(object) => viewport.current?.focus(object)}
            onTransform={(id, values) => updateObject(id, values)}
          />
          <div className="infra-floating-tools infra-transform-floating" aria-label="Object tools">
            {toolButtons.map(({ id, title, icon: Icon }) => (
              <ActionButton key={id} title={title} active={tool === id} onClick={() => setTool(id)}><Icon size={15} /></ActionButton>
            ))}
          </div>
          <div className="infra-view-controls" aria-label="Camera controls">
            <label className="sr-only" htmlFor="infra-camera-view">Camera view</label>
            <select id="infra-camera-view" defaultValue="Perspective" onChange={(event) => viewport.current?.preset(event.target.value as CameraPreset)}>
              {cameraPresets.map((preset) => <option key={preset}>{preset}</option>)}
            </select>
            <ActionButton title="Zoom in" onClick={() => viewport.current?.zoom(true)}><ZoomIn size={15} /></ActionButton>
            <ActionButton title="Zoom out" onClick={() => viewport.current?.zoom(false)}><ZoomOut size={15} /></ActionButton>
            <ActionButton title="Fit entire scene" onClick={() => viewport.current?.fit()}><Focus size={15} /></ActionButton>
            <ActionButton title="Reset camera" onClick={() => viewport.current?.reset()}><Home size={15} /></ActionButton>
            {selected && <ActionButton title="Focus selected object (F)" onClick={() => viewport.current?.focus(selected)} active><Focus size={15} /></ActionButton>}
          </div>
          <div className="infra-lighting">
            <button type="button" className="infra-lighting-trigger" onClick={() => setLightingOpen((open) => !open)} aria-expanded={lightingOpen}>
              <Sun size={15} /><span>{lighting.preset}</span><ChevronDown size={13} />
            </button>
            {lightingOpen && (
              <div className="infra-lighting-panel">
                <div className="infra-lighting-title"><span><Lightbulb size={14} />Lighting & sun</span><button type="button" onClick={() => setLightingOpen(false)} aria-label="Close lighting controls"><X size={14} /></button></div>
                <div className="infra-light-presets">
                  {lightPresets.map((preset) => (
                    <button type="button" key={preset} className={lighting.preset === preset ? "is-active" : ""} onClick={() => setLightPreset(preset)}>{preset}</button>
                  ))}
                </div>
                <label className="infra-slider"><span>Sun intensity <b>{lighting.intensity.toFixed(1)}</b></span><input type="range" min="0.25" max="1.8" step="0.05" value={lighting.intensity} onChange={(event) => setLighting((current) => ({ ...current, intensity: Number(event.target.value) }))} /></label>
                <label className="infra-slider"><span>Azimuth <b>{lighting.azimuth}°</b></span><input type="range" min="-180" max="180" step="1" value={lighting.azimuth} onChange={(event) => setLighting((current) => ({ ...current, azimuth: Number(event.target.value) }))} /></label>
                <label className="infra-slider"><span>Elevation <b>{lighting.elevation}°</b></span><input type="range" min="8" max="85" step="1" value={lighting.elevation} onChange={(event) => setLighting((current) => ({ ...current, elevation: Number(event.target.value) }))} /></label>
                <label className="infra-slider"><span>Shadow softness <b>{lighting.shadowSoftness}</b></span><input type="range" min="0" max="8" step="1" value={lighting.shadowSoftness} disabled={!lighting.shadows} onChange={(event) => setLighting((current) => ({ ...current, shadowSoftness: Number(event.target.value) }))} /></label>
                <label className="infra-switch"><span>Cast shadows</span><input type="checkbox" checked={lighting.shadows} onChange={(event) => setLighting((current) => ({ ...current, shadows: event.target.checked }))} /></label>
              </div>
            )}
          </div>

          {selected && (
            <div className="infra-selection-pill">
              <span className="infra-selection-indicator" />
              <span>{selected.name}</span>
              <button type="button" onClick={() => setSelectedId(null)} aria-label="Clear selection"><X size={13} /></button>
            </div>
          )}
          {tool === "measure" && (
            <div className="infra-measure-pill">
              <Ruler size={14} />{measuredDistance === null ? "Click two points to measure" : `${measuredDistance.toFixed(2)} m`}
              <button type="button" onClick={() => setMeasurePoints([])} aria-label="Clear measurement"><X size={13} /></button>
            </div>
          )}
          {tool === "road" && (
            <div className="infra-road-hint">
              <Route size={14} />{roadStart ? "Click the second endpoint · curved road" : "Click a start point to draw a curved road"}
              {roadStart && <button type="button" onClick={() => setRoadStart(null)}>Cancel</button>}
            </div>
          )}

          {chatOpen ? (
            <div className="infra-ai-chat">
              <div className="infra-chat-heading"><span><MessageCircle size={14} />Crystal site assistant</span><button type="button" onClick={() => setChatOpen(false)} aria-label="Hide AI chat"><X size={14} /></button></div>
              <div className="infra-chat-messages">
                {messages.slice(-2).map((message, index) => <div key={`${message.role}-${index}`} className={`infra-chat-message ${message.role}`}>{message.text}</div>)}
              </div>
              <div className="infra-chat-compose">
                <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendMessage(); }} placeholder="Ask about site access, landscape..." aria-label="Message the site assistant" />
                <button type="button" onClick={sendMessage} aria-label="Send message"><Send size={14} /></button>
              </div>
            </div>
          ) : (
            <button type="button" className="infra-chat-reopen" onClick={() => setChatOpen(true)}><MessageCircle size={14} />Show site assistant</button>
          )}
        </div>
        <footer className="infra-bottom-bar">
          <div><span className="infra-online-dot" /> 3D viewport ready</div>
          <span>{objects.length} objects</span>
          <span>Orbit: drag · Pan: right-click / two fingers · Zoom: scroll</span>
          <button type="button" onClick={() => viewport.current?.fit()}>Fit view</button>
        </footer>
      </section>

      <aside className={`infra-sidebar infra-inspector flex w-[278px] shrink-0 flex-col border-l border-white/[0.08] bg-[#101216] ${inspectorOpen ? "is-open" : ""}`}>
        <div className="infra-panel-heading"><div><b>Inspector</b><p>Site properties & scene</p></div><button type="button" className="infra-icon-button" title="Lighting settings" onClick={() => setLightingOpen((open) => !open)}><Sun size={15} /></button></div>
        <div className="infra-ai-actions">
          <div className="infra-ai-actions-title"><span><Lightbulb size={13} />Planning suggestions</span><small>local demo</small></div>
          <div className="infra-ai-action-grid">
            {[
              ["auto-layout", "Auto layout"],
              ["accessibility", "Accessibility"],
              ["greenery", "Add greenery"],
              ["transit", "Transit stop"],
              ["optimize", "Cycle link"],
            ].map(([action, label]) => (
              <button key={action} type="button" onClick={() => applySiteAction(action)}><Check size={12} />{label}</button>
            ))}
          </div>
        </div>
        {selected ? (
          <div className="infra-inspector-scroll">
            <div className="infra-object-title">
              <span className="infra-object-icon"><Building2 size={16} /></span>
              <div className="min-w-0 flex-1"><div className="infra-muted-label">{infrastructureLabels[selected.type]}</div><input aria-label="Object name" value={selected.name} onChange={(event) => updateObject(selected.id, { name: event.target.value })} /></div>
            </div>
            <div className="infra-inspector-actions">
              <ActionButton title={selected.visible ? "Hide object" : "Show object"} active={!selected.visible} onClick={() => updateObject(selected.id, { visible: !selected.visible })}>{selected.visible ? <Eye size={15} /> : <EyeOff size={15} />}</ActionButton>
              <ActionButton title={selected.locked ? "Unlock object" : "Lock object"} active={selected.locked} onClick={() => updateObject(selected.id, { locked: !selected.locked })}>{selected.locked ? <Lock size={15} /> : <Unlock size={15} />}</ActionButton>
              <ActionButton title="Duplicate selected object" onClick={duplicateSelected}><Copy size={15} /></ActionButton>
              <ActionButton title="Reset selected transform" onClick={resetSelectedTransform}><Rotate3D size={15} /></ActionButton>
              <ActionButton title="Delete selected object" onClick={confirmDeleteSelected} className="infra-danger"><Trash2 size={15} /></ActionButton>
            </div>
            <div className="infra-inspector-section">
              <div className="infra-inspector-section-title">TRANSFORM <button type="button" title="Focus selected object (F)" onClick={() => viewport.current?.focus(selected)}><Focus size={13} />Focus</button></div>
              <div className="infra-field-grid">
                <NumericField label="X" value={selected.x} onChange={(x) => updateObject(selected.id, { x })} />
                <NumericField label="Y" value={selected.y} onChange={(y) => updateObject(selected.id, { y })} />
                <NumericField label="Z" value={selected.z} onChange={(z) => updateObject(selected.id, { z })} />
                <NumericField label="Rotation °" step={1} value={(selected.rotation * 180) / Math.PI} onChange={(rotation) => updateObject(selected.id, { rotation: (rotation * Math.PI) / 180 })} />
              </div>
            </div>
            <div className="infra-inspector-section">
              <div className="infra-inspector-section-title">DIMENSIONS <span>metres</span></div>
              <div className="infra-field-grid">
                <NumericField label="Width" value={selected.width} onChange={(width) => updateObject(selected.id, { width: Math.max(0.4, width) })} />
                <NumericField
                  label={selected.type === "road" || selected.type === "water" || selected.type === "path" ? "Length" : "Depth"}
                  value={selected.depth}
                  onChange={(depth) => {
                    const nextDepth = Math.max(0.4, depth);
                    if (!selected.path && selected.type !== "road") {
                      updateObject(selected.id, { depth: nextDepth });
                      return;
                    }
                    const ratio = nextDepth / Math.max(0.4, selected.depth);
                    const path = (selected.path ?? [[-selected.depth / 2, 0], [selected.depth / 2, 0]])
                      .map(([x, z]) => [x * ratio, z * ratio] as [number, number]);
                    updateObject(selected.id, { depth: nextDepth, path });
                  }}
                />
                <NumericField label="Height" value={selected.height} onChange={(height) => updateObject(selected.id, { height: Math.max(0.3, height) })} />
                {selected.type === "road" && <NumericField label="Lanes" step={1} value={selected.lanes ?? 2} onChange={(lanes) => updateObject(selected.id, { lanes: Math.max(1, Math.min(8, Math.round(lanes))) })} />}
              </div>
              {selected.type === "building" && (
                <label className="infra-field infra-style-field"><span>Building style</span><select value={selected.style ?? "commercial"} onChange={(event) => updateObject(selected.id, { style: event.target.value as InfrastructureObject["style"] })}><option value="commercial">Commercial</option><option value="retail">Retail</option><option value="service">Service</option><option value="curved">Curved corner</option><option value="solar">Solar roof</option><option value="glass">Glass facade</option></select></label>
              )}
            </div>
            <div className="infra-inspector-section">
              <div className="infra-inspector-section-title">MATERIAL</div>
              <label className="infra-color-field"><span>Surface color</span><input type="color" value={selected.color} onChange={(event) => updateObject(selected.id, { color: event.target.value })} /></label>
            </div>
            <div className="infra-inspector-note">
              {selected.type === "road"
                ? "Road width and lane count regenerate the curved pavement and markings."
                : selected.type === "building"
                  ? "Footprint, facade and roof are generated from the editable building parameters."
                  : "Geometry and proportions update with the dimensions above."}
            </div>
          </div>
        ) : (
          <div className="infra-empty-inspector">
            <span><MousePointer2 size={18} /></span>
            <b>Select an object</b>
            <p>Choose a building, road, tree or site element to edit its dimensions, materials and transform.</p>
            <button type="button" onClick={() => viewport.current?.fit()}><Focus size={14} />Fit entire scene</button>
          </div>
        )}
        <div className="infra-site-summary">
          <div className="infra-section-label">SITE OVERVIEW</div>
          <div className="infra-summary-grid">
            <div><b>{objects.length}</b><span>Objects</span></div>
            <div><b>{counts.road ?? 0}</b><span>Roads</span></div>
            <div><b>{counts.building ?? 0}</b><span>Buildings</span></div>
            <div><b>{counts.tree ?? 0}</b><span>Trees</span></div>
          </div>
          <div className="infra-saved-state"><span className="infra-online-dot" /> Local concept · not connected to a project API</div>
        </div>
        <div className="infra-shortcuts"><AlertTriangle size={13} /> V select · G move · R rotate · S scale · F focus · Del remove</div>
      </aside>
    </main>
  );
}
