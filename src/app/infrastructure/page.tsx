"use client";

import {
  Armchair,
  ArrowLeft,
  Bike,
  Building2,
  BusFront,
  Check,
  ChevronDown,
  Copy,
  Download,
  Eye,
  EyeOff,
  Focus,
  Folder,
  Footprints,
  Gauge,
  HelpCircle,
  Home,
  LampCeiling,
  LayoutGrid,
  Lightbulb,
  Lock,
  Menu,
  MousePointer2,
  PanelLeftOpen,
  PanelRightOpen,
  ParkingSquare,
  Play,
  Plus,
  Redo2,
  Rotate3D,
  Route,
  Ruler,
  Search,
  Settings,
  Signpost,
  Sun,
  TrafficCone,
  Trash2,
  TreePine,
  Undo2,
  Unlock,
  Upload,
  Video,
  Waves,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Roboto } from "next/font/google";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  StudioAIChat,
  type StudioChatMessage,
} from "@/components/crystal-studio/StudioAIChat";
import {
  BinaryToggle,
  InspectorCollaboratorBar,
  StudioModeNav,
} from "@/components/crystal-studio/ui";
import { InfrastructureViewport } from "./infrastructure-scene";
import type {
  CameraPreset,
  LightingSettings,
  TransformMode,
  ViewportApi,
} from "./infrastructure-scene";
import {
  loadInfrastructure,
  saveInfrastructure,
} from "./infrastructure-storage.mjs";
import type {
  InfrastructureLoadResult,
  InfrastructureSaveResult,
} from "./infrastructure-storage.mjs";
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

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const cameraPresets: CameraPreset[] = [
  "Perspective",
  "Front",
  "Back",
  "Left",
  "Right",
  "Top",
  "Bottom",
];
const lightPresets: LightingPreset[] = ["Day", "Golden hour", "Night", "Studio"];
const categories: Array<{
  title: string;
  items: Array<{ type: InfrastructureType; label: string; icon: LucideIcon }>;
}> = [
  {
    title: "Roads & circulation",
    items: [
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
    ],
  },
  {
    title: "Buildings",
    items: [
      { type: "building", label: "Commercial building", icon: Building2 },
      { type: "pavilion", label: "Pavilion", icon: Home },
    ],
  },
  {
    title: "Landscape & public realm",
    items: [
      { type: "tree", label: "Tree", icon: TreePine },
      { type: "shrub", label: "Shrub bed", icon: TreePine },
      { type: "path", label: "Pedestrian path", icon: Footprints },
      { type: "water", label: "Waterway", icon: Waves },
      { type: "bridge", label: "Pedestrian bridge", icon: Route },
      { type: "plaza", label: "Public plaza", icon: Armchair },
      { type: "fountain", label: "Fountain", icon: Waves },
      { type: "bench", label: "Bench", icon: Armchair },
      { type: "lamp", label: "Street light", icon: LampCeiling },
    ],
  },
];

const toolButtons: Array<{
  id: TransformMode;
  title: string;
  icon: LucideIcon;
}> = [
  { id: "select", title: "Select (V)", icon: MousePointer2 },
  { id: "move", title: "Move (G)", icon: Route },
  { id: "rotate", title: "Rotate (R)", icon: Rotate3D },
  { id: "scale", title: "Scale (S)", icon: Focus },
  { id: "measure", title: "Measure distance", icon: Ruler },
];

const INFRA_QUICK_PROMPTS = [
  { label: "Review parking & access", prompt: "Review parking and gateway access" },
  { label: "Check waterway & drainage", prompt: "Review creek waterway and bridge clearance" },
  { label: "Landscape & tree coverage", prompt: "Summarize tree and green space distribution" },
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
  const [objects, setObjects] = useState<InfrastructureObject[]>(
    createInitialInfrastructure,
  );
  const [past, setPast] = useState<InfrastructureObject[][]>([]);
  const [future, setFuture] = useState<InfrastructureObject[][]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [storageWritable, setStorageWritable] = useState(false);
  const [saveMessage, setSaveMessage] = useState("Loading local site…");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tool, setTool] = useState<TransformMode>("select");
  const [roadStart, setRoadStart] = useState<[number, number] | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [hierarchyQuery, setHierarchyQuery] = useState("");
  const [lighting, setLighting] = useState<LightingSettings>(initialLighting);
  const [undergroundUtilities, setUndergroundUtilities] = useState(false);
  const [lightingOpen, setLightingOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [chatModel, setChatModel] = useState("Site Assistant");
  const [treeGroupsOpen, setTreeGroupsOpen] = useState({
    circulation: true,
    buildings: true,
    landscape: false,
  });
  const [addDrawerOpen, setAddDrawerOpen] = useState(true);
  const [projectionMode, setProjectionMode] = useState<
    "Orthographic" | "Perspective"
  >("Perspective");
  const [messages, setMessages] = useState<StudioChatMessage[]>([
    {
      id: "infra-welcome",
      role: "assistant",
      text: "I can review access, mobility, public space and landscape across this concept site.",
      meta: "Local Demo",
    },
  ]);
  const [measurePoints, setMeasurePoints] = useState<Array<[number, number]>>(
    [],
  );
  const viewport = useRef<ViewportApi>(null);

  const selected = objects.find((object) => object.id === selectedId) ?? null;
  const visibleObjects = useMemo(
    () => objects.filter((object) => object.visible),
    [objects],
  );
  const filteredObjects = useMemo(
    () =>
      objects.filter((object) =>
        object.name.toLowerCase().includes(hierarchyQuery.toLowerCase()),
      ),
    [objects, hierarchyQuery],
  );
  const counts = useMemo(
    () =>
      objects.reduce(
        (summary, object) => {
          summary[object.type] = (summary[object.type] ?? 0) + 1;
          return summary;
        },
        {} as Partial<Record<InfrastructureType, number>>,
      ),
    [objects],
  );
  const measuredDistance =
    measurePoints.length === 2
      ? Math.hypot(
          measurePoints[1][0] - measurePoints[0][0],
          measurePoints[1][1] - measurePoints[0][1],
        )
      : null;

  const commitObjects = (next: InfrastructureObject[]) => {
    setPast((history) => [...history.slice(-39), objects]);
    setObjects(next);
    setFuture([]);
    setStorageWritable(true);
  };
  const updateObject = (id: number, changes: Partial<InfrastructureObject>) => {
    const target = objects.find((object) => object.id === id);
    if (target?.locked && !("locked" in changes) && !("visible" in changes))
      return;
    commitObjects(
      objects.map((object) =>
        object.id === id ? { ...object, ...changes } : object,
      ),
    );
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
    const nextId =
      objects.reduce((max, object) => Math.max(max, object.id), 0) + 1;
    const defaults: Partial<InfrastructureObject> =
      type === "road"
        ? {
            name: "New road segment",
            width: 7,
            depth: roadPath
              ? Math.hypot(
                  roadPath[1][0] - roadPath[0][0],
                  roadPath[1][1] - roadPath[0][1],
                )
              : 24,
            lanes: 2,
            path: roadPath ?? [
              [-12, 0],
              [12, 0],
            ],
          }
        : type === "building"
          ? {
              name: "New commercial building",
              width: 10,
              depth: 8,
              height: 5,
              style: "commercial",
            }
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
      const snapped: [number, number] = [
        Math.round(point.x * 2) / 2,
        Math.round(point.z * 2) / 2,
      ];
      if (!roadStart) {
        setRoadStart(snapped);
        return;
      }
      const center: [number, number] = [
        (roadStart[0] + snapped[0]) / 2,
        (roadStart[1] + snapped[1]) / 2,
      ];
      const deltaX = snapped[0] - roadStart[0];
      const deltaZ = snapped[1] - roadStart[1];
      const arc = Math.hypot(deltaX, deltaZ) * 0.14;
      const path: [number, number][] = [
        [roadStart[0] - center[0], roadStart[1] - center[1]],
        [
          (roadStart[0] + snapped[0]) / 2 -
            center[0] -
            (deltaZ / Math.max(1, Math.hypot(deltaX, deltaZ))) * arc,
          (roadStart[1] + snapped[1]) / 2 -
            center[1] +
            (deltaX / Math.max(1, Math.hypot(deltaX, deltaZ))) * arc,
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
    if (
      categories.some((category) =>
        category.items.some((item) => item.type === tool),
      )
    ) {
      handlePlacement(point);
    } else if (tool === "measure") {
      setMeasurePoints((current) =>
        current.length === 2
          ? [[point.x, point.z]]
          : [...current, [point.x, point.z]],
      );
    } else if (tool === "delete") {
      const object = objects.find((item) => item.id === id);
      if (object && window.confirm(`Delete "${object.name}" from the site?`)) {
        commitObjects(objects.filter((item) => item.id !== id));
        setSelectedId((current) => (current === id ? null : current));
      }
    } else {
      setSelectedId(id);
      setInspectorOpen(true);
    }
  };

  const handleEmptyClick = (point: { x: number; z: number }) => {
    if (
      categories.some((category) =>
        category.items.some((item) => item.type === tool),
      )
    ) {
      handlePlacement(point);
    } else if (tool === "measure") {
      setMeasurePoints((current) =>
        current.length === 2
          ? [[point.x, point.z]]
          : [...current, [point.x, point.z]],
      );
    } else {
      setSelectedId(null);
    }
  };

  const confirmDeleteSelected = () => {
    if (
      !selected ||
      !window.confirm(`Delete "${selected.name}" from the site?`)
    )
      return;
    commitObjects(objects.filter((object) => object.id !== selected.id));
    setSelectedId(null);
    setTool("select");
  };
  const duplicateSelected = () => {
    if (!selected) return;
    const id =
      objects.reduce((max, object) => Math.max(max, object.id), 0) + 1;
    const duplicate = {
      ...selected,
      id,
      name: `${selected.name} copy`,
      x: selected.x + 2,
      z: selected.z + 2,
      locked: false,
    };
    commitObjects([...objects, duplicate]);
    setSelectedId(id);
  };
  const resetSelectedTransform = () => {
    if (selected) updateObject(selected.id, { x: 0, y: 0, z: 0, rotation: 0 });
  };

  const setLightPreset = (preset: LightingPreset) => {
    const sun =
      preset === "Night"
        ? { azimuth: 18, elevation: 12 }
        : preset === "Golden hour"
          ? { azimuth: -28, elevation: 16 }
          : preset === "Studio"
            ? { azimuth: -42, elevation: 65 }
            : { azimuth: -42, elevation: 48 };
    setLighting((current) => ({ ...current, preset, ...sun }));
  };

  const exportLayout = (format: "GeoJSON" | "CSV") => {
    const content =
      format === "GeoJSON"
        ? JSON.stringify(
            {
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
            },
            null,
            2,
          )
        : [
            "id,name,type,x,y,z,rotation,width,depth,height,lanes,color",
            ...objects.map((object) =>
              [
                object.id,
                `"${object.name.replaceAll('"', '""')}"`,
                object.type,
                object.x,
                object.y,
                object.z,
                object.rotation,
                object.width,
                object.depth,
                object.height,
                object.lanes ?? "",
                object.color,
              ].join(","),
            ),
          ].join("\n");
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/plain" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `crystal-infrastructure.${
      format === "GeoJSON" ? "geojson" : "csv"
    }`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const applySiteAction = (action: string) => {
    const additions: InfrastructureObject[] = [];
    const add = (
      type: InfrastructureType,
      x: number,
      z: number,
      name: string,
    ) => {
      const id =
        objects.reduce((max, object) => Math.max(max, object.id), 0) +
        additions.length +
        1;
      additions.push(makeInfrastructureObject(id, type, x, z, { name }));
    };
    if (action === "auto-layout" || action === "greenery") {
      if ((counts.tree ?? 0) < 30) {
        [
          [-13, 7],
          [-11, 5],
          [12, 11],
          [14, 9],
        ].forEach(([x, z], index) =>
          add("tree", x, z, `Suggested landscape tree ${index + 1}`),
        );
      } else if ((counts.shrub ?? 0) < 6) {
        add("shrub", -5, 12, "Suggested planted bed");
      }
      if (action === "auto-layout" && !(counts.lamp ?? 0))
        add("lamp", 5, 16, "Suggested promenade light");
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
    const response =
      lower.includes("parking") || lower.includes("access")
        ? "Access review: the east and west parking areas connect to the internal boulevard; keep the pedestrian crossings clear at each gateway."
        : lower.includes("water") || lower.includes("drain") || lower.includes("creek")
          ? "Water review: the creek crosses the public realm with a dedicated pedestrian bridge. Keep planting and path edges clear of the channel."
          : lower.includes("tree") || lower.includes("green")
            ? `Landscape review: ${counts.tree ?? 0} individual trees are distributed around the perimeter and public spaces.`
            : `Site review: ${objects.length} editable objects are arranged across roads, buildings, parking and public space.`;
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", text },
      { id: crypto.randomUUID(), role: "assistant", text: response, meta: chatModel },
    ]);
    setChatInput("");
  };

  useEffect(() => {
    let result: InfrastructureLoadResult;
    try {
      result = loadInfrastructure(window.localStorage);
    } catch (error) {
      result = {
        status: "error",
        message: `Could not access this browser's local storage: ${
          error instanceof Error ? error.message : "Unknown error."
        }`,
      };
    }
    if (result.status === "loaded") {
      setObjects(result.objects);
      setStorageWritable(true);
      setSaveMessage("Site restored from this device");
    } else if (result.status === "empty") {
      setStorageWritable(true);
      setSaveMessage("Saving changes on this device");
    } else {
      setStorageWritable(false);
      setSaveMessage(result.message);
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady || !storageWritable) return;
    let result: InfrastructureSaveResult;
    try {
      result = saveInfrastructure(window.localStorage, objects);
    } catch (error) {
      result = {
        ok: false as const,
        message: `Could not access this browser's local storage: ${
          error instanceof Error ? error.message : "Unknown error."
        }`,
      };
    }
    setSaveMessage(result.ok ? "Saved on this device" : result.message);
  }, [objects, storageReady, storageWritable]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      )
        return;
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
        if (
          selected &&
          window.confirm(`Delete "${selected.name}" from the site?`)
        ) {
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

  const circulationTypes: InfrastructureType[] = [
    "road",
    "roundabout",
    "parking",
    "crosswalk",
    "barrier",
    "sidewalk",
    "bikeLane",
    "busStop",
    "trafficLight",
    "roadSign",
    "vehicle",
  ];
  const buildingTypes: InfrastructureType[] = ["building", "pavilion"];
  const circulationObjects = filteredObjects.filter((obj) =>
    circulationTypes.includes(obj.type),
  );
  const buildingObjects = filteredObjects.filter((obj) =>
    buildingTypes.includes(obj.type),
  );
  const landscapeObjects = filteredObjects.filter(
    (obj) =>
      !circulationTypes.includes(obj.type) && !buildingTypes.includes(obj.type),
  );

  return (
    <main
      className={`crystal-infrastructure-page ${roboto.className} fixed inset-0 z-20 h-screen w-full overflow-hidden bg-[#08090b] text-zinc-100`}
    >
      {/* Left Sidebar: Reference Scene Hierarchy + Site Tools */}
      <aside
        className={`infra-sidebar infra-left-panel studio-sidebar-shell ref-floating-sidebar flex shrink-0 flex-col ${
          libraryOpen ? "is-open" : ""
        } ${leftCollapsed ? "is-collapsed-desktop" : ""}`}
        aria-label="Infrastructure site tools"
      >
        <div className="ref-sidebar-header">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href="/project"
              aria-label="Back to projects"
              title="Back to projects"
              className="ref-header-icon-btn"
            >
              <ArrowLeft size={14} />
            </Link>
            <span className="ref-sidebar-title truncate">
              Willow Creek District
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ActionButton
              title="Undo (Ctrl+Z)"
              onClick={undo}
              disabled={!past.length}
            >
              <Undo2 size={13} />
            </ActionButton>
            <ActionButton
              title="Redo (Ctrl+Y)"
              onClick={redo}
              disabled={!future.length}
            >
              <Redo2 size={13} />
            </ActionButton>
            <button
              type="button"
              aria-label="Collapse site tools panel"
              title="Collapse sidebar"
              onClick={() => setLeftCollapsed(true)}
              className="ref-header-icon-btn max-[700px]:hidden"
            >
              <Menu size={14} />
            </button>
          </div>
        </div>

        <StudioModeNav activeStudio="infrastructure" />

        <div className="px-3 pb-2 pt-1">
          <label className="ref-search-box">
            <Search size={13} className="shrink-0 text-zinc-500" />
            <input
              value={hierarchyQuery}
              onChange={(event) => setHierarchyQuery(event.target.value)}
              placeholder="Search"
              aria-label="Filter site objects"
            />
            {hierarchyQuery && (
              <button
                type="button"
                aria-label="Clear filter"
                onClick={() => setHierarchyQuery("")}
                className="studio-search-clear"
              >
                <X size={11} />
              </button>
            )}
          </label>
        </div>

        {/* Hierarchical Scene Tree with Reference Connector Lines */}
        <div className="ref-tree-container flex-1 overflow-y-auto px-2.5 py-1">
          <button
            type="button"
            onClick={() => viewport.current?.fit()}
            className="ref-tree-row"
          >
            <span className="ref-tree-spacer" />
            <Video size={13} className="ref-tree-icon" />
            <span className="ref-tree-label">Site Camera</span>
            <span className="ml-auto text-[10px] text-zinc-500">
              {visibleObjects.length} vis
            </span>
          </button>

          {/* Group 1: Roads & Circulation */}
          <div className="ref-tree-group">
            <button
              type="button"
              onClick={() =>
                setTreeGroupsOpen((curr) => ({
                  ...curr,
                  circulation: !curr.circulation,
                }))
              }
              className="ref-tree-row"
            >
              <span className="ref-tree-branch">├</span>
              <ChevronDown
                size={12}
                className={`ref-tree-chevron transition-transform ${
                  treeGroupsOpen.circulation ? "" : "-rotate-90"
                }`}
              />
              <Folder size={13} className="ref-tree-icon" />
              <span className="ref-tree-label">
                Roads & Circulation ({circulationObjects.length})
              </span>
            </button>
            {treeGroupsOpen.circulation && (
              <div className="ref-tree-children">
                {circulationObjects.map((object, index) => {
                  const isLast = index === circulationObjects.length - 1;
                  return (
                    <div
                      key={object.id}
                      className={`ref-tree-row is-nested group ${
                        object.id === selectedId ? "is-selected" : ""
                      } ${!object.visible ? "opacity-50" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(object.id);
                          setTool("select");
                          setInspectorOpen(true);
                          setLibraryOpen(false);
                        }}
                        className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                        title={object.name}
                      >
                        <span className="ref-tree-guide">│</span>
                        <span className="ref-tree-branch">
                          {isLast ? "└" : "├"}
                        </span>
                        <Route size={12} className="ref-tree-icon" />
                        <span className="ref-tree-label truncate">
                          {object.name}
                        </span>
                      </button>
                      <div className="infra-tree-row-actions">
                        <button
                          type="button"
                          aria-label={
                            object.locked
                              ? `Unlock ${object.name}`
                              : `Lock ${object.name}`
                          }
                          title={object.locked ? "Unlock" : "Lock"}
                          onClick={() =>
                            updateObject(object.id, { locked: !object.locked })
                          }
                        >
                          {object.locked ? (
                            <Lock size={11} />
                          ) : (
                            <Unlock size={11} />
                          )}
                        </button>
                        <button
                          type="button"
                          aria-label={
                            object.visible
                              ? `Hide ${object.name}`
                              : `Show ${object.name}`
                          }
                          title={object.visible ? "Hide" : "Show"}
                          onClick={() =>
                            updateObject(object.id, {
                              visible: !object.visible,
                            })
                          }
                        >
                          {object.visible ? (
                            <Eye size={11} />
                          ) : (
                            <EyeOff size={11} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Group 2: Buildings & Structures */}
          <div className="ref-tree-group">
            <button
              type="button"
              onClick={() =>
                setTreeGroupsOpen((curr) => ({
                  ...curr,
                  buildings: !curr.buildings,
                }))
              }
              className="ref-tree-row"
            >
              <span className="ref-tree-branch">├</span>
              <ChevronDown
                size={12}
                className={`ref-tree-chevron transition-transform ${
                  treeGroupsOpen.buildings ? "" : "-rotate-90"
                }`}
              />
              <Building2 size={13} className="ref-tree-icon" />
              <span className="ref-tree-label">
                Buildings ({buildingObjects.length})
              </span>
            </button>
            {treeGroupsOpen.buildings && (
              <div className="ref-tree-children">
                {buildingObjects.map((object, index) => {
                  const isLast = index === buildingObjects.length - 1;
                  return (
                    <div
                      key={object.id}
                      className={`ref-tree-row is-nested group ${
                        object.id === selectedId ? "is-selected" : ""
                      } ${!object.visible ? "opacity-50" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(object.id);
                          setTool("select");
                          setInspectorOpen(true);
                          setLibraryOpen(false);
                        }}
                        className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                        title={object.name}
                      >
                        <span className="ref-tree-guide">│</span>
                        <span className="ref-tree-branch">
                          {isLast ? "└" : "├"}
                        </span>
                        <Building2 size={12} className="ref-tree-icon" />
                        <span className="ref-tree-label truncate">
                          {object.name}
                        </span>
                      </button>
                      <div className="infra-tree-row-actions">
                        <button
                          type="button"
                          aria-label={
                            object.locked
                              ? `Unlock ${object.name}`
                              : `Lock ${object.name}`
                          }
                          title={object.locked ? "Unlock" : "Lock"}
                          onClick={() =>
                            updateObject(object.id, { locked: !object.locked })
                          }
                        >
                          {object.locked ? (
                            <Lock size={11} />
                          ) : (
                            <Unlock size={11} />
                          )}
                        </button>
                        <button
                          type="button"
                          aria-label={
                            object.visible
                              ? `Hide ${object.name}`
                              : `Show ${object.name}`
                          }
                          title={object.visible ? "Hide" : "Show"}
                          onClick={() =>
                            updateObject(object.id, {
                              visible: !object.visible,
                            })
                          }
                        >
                          {object.visible ? (
                            <Eye size={11} />
                          ) : (
                            <EyeOff size={11} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Group 3: Landscape & Public Realm */}
          <div className="ref-tree-group">
            <button
              type="button"
              onClick={() =>
                setTreeGroupsOpen((curr) => ({
                  ...curr,
                  landscape: !curr.landscape,
                }))
              }
              className="ref-tree-row"
            >
              <span className="ref-tree-branch">└</span>
              <ChevronDown
                size={12}
                className={`ref-tree-chevron transition-transform ${
                  treeGroupsOpen.landscape ? "" : "-rotate-90"
                }`}
              />
              <TreePine size={13} className="ref-tree-icon" />
              <span className="ref-tree-label">
                Landscape & Public ({landscapeObjects.length})
              </span>
            </button>
            {treeGroupsOpen.landscape && (
              <div className="ref-tree-children">
                {landscapeObjects.map((object, index) => {
                  const isLast = index === landscapeObjects.length - 1;
                  return (
                    <div
                      key={object.id}
                      className={`ref-tree-row is-nested group ${
                        object.id === selectedId ? "is-selected" : ""
                      } ${!object.visible ? "opacity-50" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(object.id);
                          setTool("select");
                          setInspectorOpen(true);
                          setLibraryOpen(false);
                        }}
                        className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                        title={object.name}
                      >
                        <span className="ref-tree-guide"> </span>
                        <span className="ref-tree-branch">
                          {isLast ? "└" : "├"}
                        </span>
                        <TreePine size={12} className="ref-tree-icon" />
                        <span className="ref-tree-label truncate">
                          {object.name}
                        </span>
                      </button>
                      <div className="infra-tree-row-actions">
                        <button
                          type="button"
                          aria-label={
                            object.locked
                              ? `Unlock ${object.name}`
                              : `Lock ${object.name}`
                          }
                          title={object.locked ? "Unlock" : "Lock"}
                          onClick={() =>
                            updateObject(object.id, { locked: !object.locked })
                          }
                        >
                          {object.locked ? (
                            <Lock size={11} />
                          ) : (
                            <Unlock size={11} />
                          )}
                        </button>
                        <button
                          type="button"
                          aria-label={
                            object.visible
                              ? `Hide ${object.name}`
                              : `Show ${object.name}`
                          }
                          title={object.visible ? "Hide" : "Show"}
                          onClick={() =>
                            updateObject(object.id, {
                              visible: !object.visible,
                            })
                          }
                        >
                          {object.visible ? (
                            <Eye size={11} />
                          ) : (
                            <EyeOff size={11} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Site Tools & Asset Catalog Drawer */}
        <div className="ref-sidebar-drawer">
          <button
            type="button"
            onClick={() => setAddDrawerOpen((open) => !open)}
            className="ref-drawer-trigger"
          >
            <span className="flex items-center gap-2">
              <Settings size={12} className="text-[#4A90D9]" />
              <span>Add to Scene & Tools</span>
            </span>
            <ChevronDown
              size={12}
              className={`text-zinc-500 transition-transform ${
                addDrawerOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {addDrawerOpen && (
            <div className="max-h-[250px] overflow-y-auto px-2 pb-2 pt-1">
              <div className="infra-section-label">TRANSFORM & MEASURE</div>
              <div className="infra-transform-tools">
                {toolButtons.map(({ id, title, icon: Icon }) => (
                  <ActionButton
                    key={id}
                    title={title}
                    active={tool === id}
                    onClick={() => setTool(id)}
                  >
                    <Icon size={15} />
                  </ActionButton>
                ))}
                <ActionButton
                  title="Delete object"
                  active={tool === "delete"}
                  onClick={() => setTool("delete")}
                >
                  <Trash2 size={15} />
                </ActionButton>
              </div>

              <div className="infra-section-label infra-assets-title">
                ADD TO SCENE
              </div>
              <div className="infra-asset-categories">
                {categories.map((category) => (
                  <details key={category.title} open>
                    <summary>
                      <span>{category.title}</span>
                      <ChevronDown size={13} />
                    </summary>
                    <div className="infra-asset-grid">
                      {category.items.map(({ type, label, icon: Icon }) => (
                        <button
                          type="button"
                          key={type}
                          title={`Add ${label.toLowerCase()} to the scene`}
                          aria-pressed={tool === type}
                          onClick={() => {
                            setTool(tool === type ? "select" : type);
                            setMeasurePoints([]);
                            setRoadStart(null);
                            setLibraryOpen(false);
                          }}
                          className={`infra-asset-button ${
                            tool === type ? "is-active" : ""
                          }`}
                        >
                          <Icon size={14} />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </details>
                ))}
              </div>

              <label className="infra-utility-toggle mt-1">
                <span>
                  <Zap size={13} className="text-[#4A90D9]" />
                  Show underground utilities
                </span>
                <input
                  type="checkbox"
                  checked={undergroundUtilities}
                  onChange={(event) =>
                    setUndergroundUtilities(event.target.checked)
                  }
                />
              </label>

              <div className="infra-status mt-1" title={saveMessage}>
                {saveMessage.startsWith("Saved") ||
                saveMessage.startsWith("Site restored") ? (
                  <span className="infra-online-dot" />
                ) : (
                  <span
                    className={`infra-save-dot ${
                      saveMessage.startsWith("Could not") ||
                      saveMessage.startsWith("Saved site")
                        ? "has-error"
                        : ""
                    }`}
                  />
                )}
                <span className="truncate">{saveMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Secondary Actions Footer matching Reference */}
        <div className="ref-sidebar-footer">
          <button
            type="button"
            onClick={() => setAddDrawerOpen((open) => !open)}
            className="ref-footer-action"
          >
            <LayoutGrid size={13} />
            <span>Library</span>
          </button>
          <button
            type="button"
            onClick={() => exportLayout("GeoJSON")}
            className="ref-footer-action"
          >
            <Upload size={13} />
            <span>Import</span>
          </button>
          <button
            type="button"
            onClick={() => setChatOpen((open) => !open)}
            className="ref-footer-action"
          >
            <HelpCircle size={13} />
            <span>Help & Feedback</span>
          </button>
        </div>
      </aside>

      {/* Center 3D Infrastructure Workspace */}
      <section className="infra-workspace relative flex min-w-0 flex-1 flex-col bg-[#0b0d10]">
        <div className="infra-viewport relative min-h-0 flex-1">
          {leftCollapsed && (
            <button
              type="button"
              onClick={() => setLeftCollapsed(false)}
              aria-label="Show site tools panel"
              title="Show site tools sidebar"
              className="studio-restore-side-btn is-left max-[700px]:hidden"
            >
              <PanelLeftOpen size={15} />
              <span>Site tools</span>
            </button>
          )}
          {rightCollapsed && (
            <button
              type="button"
              onClick={() => setRightCollapsed(false)}
              aria-label="Show inspector panel"
              title="Show inspector sidebar"
              className="studio-restore-side-btn is-right max-[700px]:hidden"
            >
              <span>Inspector</span>
              <PanelRightOpen size={15} />
            </button>
          )}

          <div className="infra-mobile-actions" aria-label="Studio panels">
            <button
              type="button"
              onClick={() => setLibraryOpen((open) => !open)}
              aria-expanded={libraryOpen}
            >
              Library
            </button>
            <button
              type="button"
              onClick={() => setInspectorOpen((open) => !open)}
              aria-expanded={inspectorOpen}
            >
              Inspector
            </button>
          </div>

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

          {/* Top Floating Toolbar matching Reference Image */}
          <div
            className="ref-top-toolbar"
            role="toolbar"
            aria-label="Object tools"
          >
            <button
              type="button"
              title="Add Road segment"
              onClick={() => setTool(tool === "road" ? "select" : "road")}
              className={`ref-toolbar-icon-btn ${
                tool === "road" ? "is-active" : ""
              }`}
            >
              <Plus size={15} />
            </button>
            <button
              type="button"
              title="Add Commercial building"
              onClick={() =>
                setTool(tool === "building" ? "select" : "building")
              }
              className={`ref-toolbar-icon-btn ${
                tool === "building" ? "is-active" : ""
              }`}
            >
              <Building2 size={14} />
            </button>
            <button
              type="button"
              title="Add Tree"
              onClick={() => setTool(tool === "tree" ? "select" : "tree")}
              className={`ref-toolbar-icon-btn ${
                tool === "tree" ? "is-active" : ""
              }`}
            >
              <TreePine size={14} />
            </button>

            <span className="ref-toolbar-divider" />

            {toolButtons.map(({ id, title, icon: Icon }) => (
              <button
                key={id}
                type="button"
                title={title}
                aria-label={title}
                aria-pressed={tool === id}
                onClick={() => setTool(id)}
                className={`ref-toolbar-icon-btn ${
                  tool === id ? "is-active" : ""
                }`}
              >
                <Icon size={14} />
              </button>
            ))}

            <button
              type="button"
              title="Fit entire scene"
              aria-label="Fit entire scene"
              onClick={() => viewport.current?.fit()}
              className="ref-toolbar-icon-btn"
            >
              <Focus size={14} />
            </button>
            <button
              type="button"
              title="Reset camera"
              aria-label="Reset camera"
              onClick={() => viewport.current?.reset()}
              className="ref-toolbar-icon-btn"
            >
              <Home size={14} />
            </button>

            <span className="ref-toolbar-divider" />

            <div
              className="flex items-center gap-1"
              aria-label="Camera controls"
            >
              <label className="sr-only" htmlFor="infra-camera-view">
                Camera view
              </label>
              <select
                id="infra-camera-view"
                defaultValue="Perspective"
                onChange={(event) =>
                  viewport.current?.preset(event.target.value as CameraPreset)
                }
                className="ref-toolbar-zoom-pill cursor-pointer bg-transparent"
              >
                {cameraPresets.map((preset) => (
                  <option key={preset} value={preset} className="bg-[#151619]">
                    {preset}
                  </option>
                ))}
              </select>
              <button
                type="button"
                title="Zoom in (+)"
                aria-label="Zoom in (+)"
                onClick={() => viewport.current?.zoom(true)}
                className="ref-toolbar-icon-btn"
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                title="Zoom out (−)"
                aria-label="Zoom out (−)"
                onClick={() => viewport.current?.zoom(false)}
                className="ref-toolbar-icon-btn"
              >
                <ZoomOut size={14} />
              </button>
            </div>

            <button
              type="button"
              title="Export scene as GeoJSON"
              aria-label="Export scene as GeoJSON"
              onClick={() => exportLayout("GeoJSON")}
              className="ref-toolbar-export-btn"
            >
              Export
            </button>
            <button
              type="button"
              title="Export scene as CSV"
              aria-label="Export scene as CSV"
              onClick={() => exportLayout("CSV")}
              className="ref-toolbar-icon-btn text-[10px] font-bold"
            >
              CSV
            </button>
            <button
              type="button"
              title="Lighting & sun settings"
              aria-label="Lighting & sun settings"
              onClick={() => setLightingOpen((open) => !open)}
              className={`ref-toolbar-icon-btn ${
                lightingOpen ? "is-active" : ""
              }`}
            >
              <Play size={13} />
            </button>
          </div>

          {lightingOpen && (
            <div className="infra-lighting">
              <div className="infra-lighting-panel">
                <div className="infra-lighting-title">
                  <span>
                    <Lightbulb size={14} />
                    Lighting & sun
                  </span>
                  <button
                    type="button"
                    onClick={() => setLightingOpen(false)}
                    aria-label="Close lighting controls"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="infra-light-presets">
                  {lightPresets.map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      className={lighting.preset === preset ? "is-active" : ""}
                      onClick={() => setLightPreset(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <label className="infra-slider">
                  <span>
                    Sun intensity <b>{lighting.intensity.toFixed(1)}</b>
                  </span>
                  <input
                    type="range"
                    min="0.25"
                    max="1.8"
                    step="0.05"
                    value={lighting.intensity}
                    onChange={(event) =>
                      setLighting((current) => ({
                        ...current,
                        intensity: Number(event.target.value),
                      }))
                    }
                  />
                </label>
                <label className="infra-slider">
                  <span>
                    Azimuth <b>{lighting.azimuth}°</b>
                  </span>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={lighting.azimuth}
                    onChange={(event) =>
                      setLighting((current) => ({
                        ...current,
                        azimuth: Number(event.target.value),
                      }))
                    }
                  />
                </label>
                <label className="infra-slider">
                  <span>
                    Elevation <b>{lighting.elevation}°</b>
                  </span>
                  <input
                    type="range"
                    min="8"
                    max="85"
                    step="1"
                    value={lighting.elevation}
                    onChange={(event) =>
                      setLighting((current) => ({
                        ...current,
                        elevation: Number(event.target.value),
                      }))
                    }
                  />
                </label>
                <label className="infra-slider">
                  <span>
                    Shadow softness <b>{lighting.shadowSoftness}</b>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={lighting.shadowSoftness}
                    disabled={!lighting.shadows}
                    onChange={(event) =>
                      setLighting((current) => ({
                        ...current,
                        shadowSoftness: Number(event.target.value),
                      }))
                    }
                  />
                </label>
                <label className="infra-switch">
                  <span>Cast shadows</span>
                  <input
                    type="checkbox"
                    checked={lighting.shadows}
                    onChange={(event) =>
                      setLighting((current) => ({
                        ...current,
                        shadows: event.target.checked,
                      }))
                    }
                  />
                </label>
              </div>
            </div>
          )}

          {selected && (
            <div className="infra-selection-pill">
              <span className="infra-selection-indicator" />
              <span>{selected.name}</span>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Clear selection"
              >
                <X size={13} />
              </button>
            </div>
          )}
          {tool === "measure" && (
            <div className="infra-measure-pill">
              <Ruler size={14} />
              {measuredDistance === null
                ? "Click two points to measure"
                : `${measuredDistance.toFixed(2)} m`}
              <button
                type="button"
                onClick={() => setMeasurePoints([])}
                aria-label="Clear measurement"
              >
                <X size={13} />
              </button>
            </div>
          )}
          {tool === "road" && (
            <div className="infra-road-hint">
              <Route size={14} />
              {roadStart
                ? "Click the second endpoint · curved road"
                : "Click a start point to draw a curved road"}
              {roadStart && (
                <button type="button" onClick={() => setRoadStart(null)}>
                  Cancel
                </button>
              )}
            </div>
          )}

          {/* Orientation Axis Gizmo + Orthographic / Perspective Switcher */}
          <div className="ref-viewport-gizmo-dock max-[900px]:hidden">
            <div
              className="ref-axis-gizmo"
              title="3D Viewport Orientation Axes (Click to reset view)"
              onClick={() => viewport.current?.reset()}
            >
              <svg viewBox="0 0 72 72" className="h-14 w-14">
                <circle
                  cx="36"
                  cy="36"
                  r="31"
                  fill="rgba(22, 24, 29, 0.85)"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
                <line
                  x1="36"
                  y1="36"
                  x2="36"
                  y2="13"
                  stroke="#34d399"
                  strokeWidth="2"
                />
                <circle cx="36" cy="12" r="5" fill="#34d399" />
                <text
                  x="36"
                  y="14.5"
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="700"
                  fill="#06281e"
                >
                  Y
                </text>
                <line
                  x1="36"
                  y1="36"
                  x2="57"
                  y2="44"
                  stroke="#f43f5e"
                  strokeWidth="2"
                />
                <circle cx="58" cy="45" r="5" fill="#f43f5e" />
                <text
                  x="58"
                  y="47.5"
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="700"
                  fill="#fff"
                >
                  X
                </text>
                <line
                  x1="36"
                  y1="36"
                  x2="17"
                  y2="47"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <circle cx="16" cy="48" r="5" fill="#38bdf8" />
                <text
                  x="16"
                  y="50.5"
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="700"
                  fill="#062235"
                >
                  Z
                </text>
                <circle cx="36" cy="36" r="3" fill="#e4e4e7" />
              </svg>
            </div>
            <div className="ref-projection-pill">
              <button
                type="button"
                onClick={() => {
                  setProjectionMode("Orthographic");
                  viewport.current?.preset("Top");
                }}
                className={`ref-projection-btn ${
                  projectionMode === "Orthographic" ? "is-active" : ""
                }`}
              >
                Orthographic
              </button>
              <button
                type="button"
                onClick={() => {
                  setProjectionMode("Perspective");
                  viewport.current?.preset("Perspective");
                }}
                className={`ref-projection-btn ${
                  projectionMode === "Perspective" ? "is-active" : ""
                }`}
              >
                Perspective
              </button>
            </div>
          </div>

          {/* Unified Studio AI Chat */}
          <StudioAIChat
            studio="infrastructure"
            open={chatOpen}
            onOpenChange={setChatOpen}
            prompt={chatInput}
            onPromptChange={setChatInput}
            onSubmit={sendMessage}
            model={chatModel}
            onModelChange={setChatModel}
            messages={messages}
            onClearMessages={() => setMessages([])}
            onNewChat={() => {
              setMessages([]);
              setChatInput("");
            }}
            quickPrompts={INFRA_QUICK_PROMPTS}
            placeholder="Describe what you want to create or change…"
            statusLabel={`${objects.length} site objects`}
            className="infra-ai-chat studio-ai-floating-infra"
          />
        </div>
      </section>

      {/* Right Sidebar: Reference Collaborator Header + Properties & Settings */}
      <aside
        className={`infra-sidebar infra-inspector studio-sidebar-shell ref-floating-sidebar flex shrink-0 flex-col ${
          inspectorOpen ? "is-open" : ""
        } ${rightCollapsed ? "is-collapsed-desktop" : ""}`}
        aria-label="Infrastructure inspector"
      >
        <InspectorCollaboratorBar
          onCollapse={() => setRightCollapsed(true)}
          onAction={() => exportLayout("GeoJSON")}
          actionLabel="Invite"
        />

        <div className="ref-inspector-scroll flex-1 overflow-y-auto">
          {/* Camera Section */}
          <div className="ref-inspector-section">
            <div className="ref-inspector-section-header">
              <span>Camera</span>
              <span className="text-[11px] font-normal text-zinc-500">
                {lighting.preset}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(["Perspective", "Top", "Front", "Right"] as CameraPreset[]).map(
                (preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => viewport.current?.preset(preset)}
                    className="rounded-md bg-white/[0.04] px-2 py-1.5 text-[11px] font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    {preset}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Frame / Surface Color Section */}
          <div className="ref-inspector-section">
            <div className="ref-inspector-section-header">
              <span>Frame</span>
            </div>
            <div className="ref-frame-color-row">
              <label className="ref-color-swatch-box" title="Surface color">
                <input
                  type="color"
                  value={selected?.color ?? "#3b82f6"}
                  disabled={!selected}
                  onChange={(event) => {
                    if (selected) {
                      updateObject(selected.id, { color: event.target.value });
                    }
                  }}
                  className="sr-only"
                />
                <span
                  className="ref-color-swatch-fill"
                  style={{ backgroundColor: selected?.color ?? "#1D1D1D" }}
                />
              </label>
              <span className="ref-color-hex">
                {(selected?.color ?? "#1D1D1D").replace("#", "").toUpperCase()}
              </span>
              <span className="ref-color-opacity">100 %</span>
            </div>
            <button
              type="button"
              onClick={() => viewport.current?.fit()}
              className="ref-full-action-btn mt-2.5"
            >
              Edit Frame
            </button>
          </div>

          {/* Global Settings with Reference Blue Yes/No & Show/Hide Pills */}
          <div className="ref-inspector-section">
            <div className="ref-inspector-section-header">
              <span>Global Settings</span>
            </div>
            <div className="space-y-2.5">
              <div className="ref-setting-row">
                <span className="ref-setting-label">Cast Shadows</span>
                <BinaryToggle
                  value={lighting.shadows}
                  onChange={(shadows) =>
                    setLighting((current) => ({ ...current, shadows }))
                  }
                  trueLabel="Yes"
                  falseLabel="No"
                />
              </div>
              <div className="ref-setting-row">
                <span className="ref-setting-label">Utilities</span>
                <BinaryToggle
                  value={undergroundUtilities}
                  onChange={setUndergroundUtilities}
                  trueLabel="Show"
                  falseLabel="Hide"
                />
              </div>
            </div>
          </div>

          {/* Post-Processing Section */}
          <div className="ref-inspector-section">
            <div className="ref-setting-row">
              <span className="ref-inspector-section-title">
                Post-Processing
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={lighting.shadowSoftness > 0}
                onClick={() =>
                  setLighting((current) => ({
                    ...current,
                    shadowSoftness: current.shadowSoftness > 0 ? 0 : 3,
                  }))
                }
                className={`studio-switch ${
                  lighting.shadowSoftness > 0 ? "is-on" : ""
                }`}
              />
            </div>
          </div>

          {/* Environment Section */}
          <div className="ref-inspector-section">
            <div className="ref-inspector-section-header">
              <span>Environment</span>
            </div>
            <div className="space-y-2.5">
              <div className="ref-setting-row">
                <span className="ref-setting-label">Sun Light</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLightingOpen((open) => !open)}
                    className="ref-mini-gear-btn"
                    title="Open lighting sliders"
                  >
                    <Settings size={12} />
                  </button>
                  <BinaryToggle
                    value={lighting.intensity >= 0.8}
                    onChange={(bright) =>
                      setLighting((current) => ({
                        ...current,
                        intensity: bright ? 1.1 : 0.45,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="ref-setting-row">
                <span className="ref-setting-label">Daylight</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setLightPreset(
                        lighting.preset === "Day" ? "Golden hour" : "Day",
                      )
                    }
                    className="ref-mini-gear-btn"
                    title="Cycle daylight preset"
                  >
                    <Sun size={12} />
                  </button>
                  <BinaryToggle
                    value={lighting.preset !== "Night"}
                    onChange={(day) => setLightPreset(day ? "Day" : "Night")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Selected Object Properties */}
          {selected ? (
            <div className="ref-inspector-section">
              <div className="infra-object-title mb-2">
                <span className="infra-object-icon">
                  <Building2 size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="infra-muted-label">
                    {infrastructureLabels[selected.type]}
                  </div>
                  <input
                    aria-label="Object name"
                    value={selected.name}
                    onChange={(event) =>
                      updateObject(selected.id, { name: event.target.value })
                    }
                  />
                </div>
              </div>
              <div className="infra-inspector-actions mb-3">
                <ActionButton
                  title={selected.visible ? "Hide object" : "Show object"}
                  active={!selected.visible}
                  onClick={() =>
                    updateObject(selected.id, { visible: !selected.visible })
                  }
                >
                  {selected.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </ActionButton>
                <ActionButton
                  title={selected.locked ? "Unlock object" : "Lock object"}
                  active={selected.locked}
                  onClick={() =>
                    updateObject(selected.id, { locked: !selected.locked })
                  }
                >
                  {selected.locked ? <Lock size={14} /> : <Unlock size={14} />}
                </ActionButton>
                <ActionButton
                  title="Duplicate selected object"
                  onClick={duplicateSelected}
                >
                  <Copy size={14} />
                </ActionButton>
                <ActionButton
                  title="Reset selected transform"
                  onClick={resetSelectedTransform}
                >
                  <Rotate3D size={14} />
                </ActionButton>
                <ActionButton
                  title="Delete selected object"
                  onClick={confirmDeleteSelected}
                  className="infra-danger"
                >
                  <Trash2 size={14} />
                </ActionButton>
              </div>

              <div className="infra-inspector-section-title">
                TRANSFORM{" "}
                <button
                  type="button"
                  title="Focus selected object (F)"
                  onClick={() => viewport.current?.focus(selected)}
                >
                  <Focus size={12} />
                  Focus
                </button>
              </div>
              <div className="infra-field-grid mb-3">
                <NumericField
                  label="X"
                  value={selected.x}
                  onChange={(x) => updateObject(selected.id, { x })}
                />
                <NumericField
                  label="Y"
                  value={selected.y}
                  onChange={(y) => updateObject(selected.id, { y })}
                />
                <NumericField
                  label="Z"
                  value={selected.z}
                  onChange={(z) => updateObject(selected.id, { z })}
                />
                <NumericField
                  label="Rotation °"
                  step={1}
                  value={(selected.rotation * 180) / Math.PI}
                  onChange={(rotation) =>
                    updateObject(selected.id, {
                      rotation: (rotation * Math.PI) / 180,
                    })
                  }
                />
              </div>

              <div className="infra-inspector-section-title">
                DIMENSIONS <span>metres</span>
              </div>
              <div className="infra-field-grid mb-3">
                <NumericField
                  label="Width"
                  value={selected.width}
                  onChange={(width) =>
                    updateObject(selected.id, { width: Math.max(0.4, width) })
                  }
                />
                <NumericField
                  label={
                    selected.type === "road" ||
                    selected.type === "water" ||
                    selected.type === "path"
                      ? "Length"
                      : "Depth"
                  }
                  value={selected.depth}
                  onChange={(depth) => {
                    const nextDepth = Math.max(0.4, depth);
                    if (!selected.path && selected.type !== "road") {
                      updateObject(selected.id, { depth: nextDepth });
                      return;
                    }
                    const ratio = nextDepth / Math.max(0.4, selected.depth);
                    const path = (
                      selected.path ?? [
                        [-selected.depth / 2, 0],
                        [selected.depth / 2, 0],
                      ]
                    ).map(
                      ([x, z]) => [x * ratio, z * ratio] as [number, number],
                    );
                    updateObject(selected.id, { depth: nextDepth, path });
                  }}
                />
                <NumericField
                  label="Height"
                  value={selected.height}
                  onChange={(height) =>
                    updateObject(selected.id, { height: Math.max(0.3, height) })
                  }
                />
                {selected.type === "road" && (
                  <NumericField
                    label="Lanes"
                    step={1}
                    value={selected.lanes ?? 2}
                    onChange={(lanes) =>
                      updateObject(selected.id, {
                        lanes: Math.max(1, Math.min(8, Math.round(lanes))),
                      })
                    }
                  />
                )}
              </div>
              {selected.type === "building" && (
                <label className="infra-field infra-style-field mb-3">
                  <span>Building style</span>
                  <select
                    value={selected.style ?? "commercial"}
                    onChange={(event) =>
                      updateObject(selected.id, {
                        style: event.target
                          .value as InfrastructureObject["style"],
                      })
                    }
                  >
                    <option value="commercial">Commercial</option>
                    <option value="retail">Retail</option>
                    <option value="service">Service</option>
                    <option value="curved">Curved corner</option>
                    <option value="solar">Solar roof</option>
                    <option value="glass">Glass facade</option>
                  </select>
                </label>
              )}
              <label className="infra-color-field">
                <span>Surface color</span>
                <input
                  type="color"
                  value={selected.color}
                  onChange={(event) =>
                    updateObject(selected.id, { color: event.target.value })
                  }
                />
              </label>
            </div>
          ) : (
            <div className="ref-inspector-section">
              <div className="ref-inspector-section-header">
                <span>Selected Element</span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Choose a building, road, tree or site element in the hierarchy
                or 3D viewport to edit its dimensions, materials, and transform.
              </p>
            </div>
          )}

          {/* Planning Suggestions */}
          <div className="ref-inspector-section">
            <div className="ref-inspector-section-header">
              <span>Planning Suggestions</span>
              <span className="text-[10px] font-normal text-zinc-500">
                local demo
              </span>
            </div>
            <div className="infra-ai-action-grid">
              {[
                ["auto-layout", "Auto layout"],
                ["accessibility", "Accessibility"],
                ["greenery", "Add greenery"],
                ["transit", "Transit stop"],
                ["optimize", "Cycle link"],
              ].map(([action, label]) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => applySiteAction(action)}
                >
                  <Check size={12} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Export & Site Overview */}
          <div className="ref-inspector-section border-b-0">
            <div className="ref-inspector-section-header">
              <span>Export</span>
              <span className="text-[10px] font-normal text-zinc-500">
                {objects.length} objects · {counts.road ?? 0} roads
              </span>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => exportLayout("GeoJSON")}
                className="ref-full-action-btn flex-1"
              >
                <Download size={12} />
                GeoJSON
              </button>
              <button
                type="button"
                onClick={() => exportLayout("CSV")}
                className="ref-full-action-btn flex-1"
              >
                <Download size={12} />
                CSV Schedule
              </button>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}
