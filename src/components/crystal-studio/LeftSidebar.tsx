"use client";

import { StudioPanel, StudioHeader } from "./kit";

import {
  Box,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  DoorOpen,
  Download,
  Eye,
  EyeOff,
  Folder,
  Grid2X2,
  Layers3,
  LayoutGrid,
  LoaderCircle,
  Lock,
  LogOut,
  Ruler,
  Search,
  SlidersHorizontal,
  Sparkles,
  Square,
  SquareDashed,
  Unlock,
  Upload,
  User,
  Video,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { materials } from "./data";
import type { FloorPlanObject, FloorPlanSettings, MaterialName, StudioMode } from "./types";
import { StudioModeNav } from "./ui";

type Props = {
  material: MaterialName;
  roughness: number;
  metallic: number;
  renderer: string;
  quality: string;
  topology: string;
  texture: string;
  separateParts: boolean;
  imageEnhancement: boolean;
  codeExecution: boolean;
  estimatedMinutes: number;
  estimatedCost: number;
  credits: number;
  renderLoading: boolean;
  uploadedImage: string | null;
  prompt?: string;
  loading?: boolean;
  onPromptChange?: (value: string) => void;
  onGenerate?: () => void;
  settingsOpen: boolean;
  floorPlanMode?: boolean;
  floorPlanSettings?: FloorPlanSettings;
  onFloorPlanSettingsChange?: (settings: FloorPlanSettings) => void;
  floorPlanObjects?: FloorPlanObject[];
  selectedFloorPlanId?: string | null;
  onSelectFloorPlanObject?: (id: string | null) => void;
  onStudioModeChange?: (mode: StudioMode) => void;
  onBack?: () => void;
  onMaterialChange: (v: MaterialName) => void;
  onRoughnessChange: (v: number) => void;
  onMetallicChange: (v: number) => void;
  onRendererChange: (v: string) => void;
  onQualityChange: (v: string) => void;
  onTopologyChange: (v: string) => void;
  onTextureChange: (v: string) => void;
  onSeparatePartsChange: (v: boolean) => void;
  onImageEnhancementChange: (v: boolean) => void;
  onCodeExecutionChange: (v: boolean) => void;
  onRender: () => void;
  onProfile: () => void;
  onSignOut: () => void;
  onUpload: (f: File) => void;
  onRemoveImage: () => void;
  onToggleSettings: () => void;
  onCollapse: () => void;
};

const clamp = (v: number) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));

function Toggle({
  label,
  enabled,
  onChange,
}: {
  label: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
      className={`crystal-property-toggle studio-toggle-row ${enabled ? "is-on" : ""}`}
    >
      <span>{label}</span>
      <i />
    </button>
  );
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="studio-segmented-group">
      {options.map((x) => (
        <button
          type="button"
          aria-pressed={value === x}
          onClick={() => onChange(x)}
          key={x}
          className={value === x ? "is-selected" : ""}
        >
          {x}
        </button>
      ))}
    </div>
  );
}

export function LeftSidebar(p: Props) {
  const settings = p.floorPlanSettings;
  const updateSettings = (patch: Partial<FloorPlanSettings>) => {
    if (settings && p.onFloorPlanSettingsChange) {
      p.onFloorPlanSettingsChange({ ...settings, ...patch });
    }
  };

  const [query, setQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    rooms: true,
    walls: true,
    openings: true,
    annotations: true,
  });
  const [setupExpanded, setSetupExpanded] = useState(false);
  const [lockedIds, setLockedIds] = useState<Record<string, boolean>>({});
  const [hiddenIds, setHiddenIds] = useState<Record<string, boolean>>({});
  const importInputRef = useRef<HTMLInputElement>(null);

  const toggleGroup = (key: string) =>
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const objects = p.floorPlanObjects ?? [];
  const matchesQuery = (text: string) =>
    !query.trim() || text.toLowerCase().includes(query.toLowerCase());

  const getObjectLabel = (obj: FloorPlanObject, index: number) => {
    if (obj.type === "room") return obj.label || `Room ${index + 1}`;
    if (obj.type === "wall") return `Structural Wall ${index + 1}`;
    if (obj.type === "door") return `Door Opening ${index + 1}`;
    if (obj.type === "window") return `Window Glazing ${index + 1}`;
    if (obj.type === "dimension") return `Dimension ${index + 1}`;
    if (obj.type === "text") return obj.text || `Annotation ${index + 1}`;
    return `${obj.type} ${index + 1}`;
  };

  const rooms = objects.filter((o) => o.type === "room");
  const walls = objects.filter((o) => o.type === "wall");
  const openings = objects.filter((o) => o.type === "door" || o.type === "window");
  const annotations = objects.filter(
    (o) => o.type === "dimension" || o.type === "text" || o.type === "furniture",
  );

  return (
    <StudioPanel
      aria-label="Scene and material controls"
      className="crystal-left-panel crystal-reference-left studio-sidebar-shell ref-floating-sidebar flex min-h-0 flex-col justify-between overflow-hidden"
    >
      <input
        ref={importInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) p.onUpload(f);
          e.currentTarget.value = "";
        }}
      />

      {/* Reference Top Header */}
      <StudioHeader title={p.floorPlanMode ? "Interior & Floor Plan" : "Generative 3D"} onBack={p.onBack} onCollapse={p.onCollapse} />

      <StudioModeNav
        activeStudio={p.floorPlanMode ? "floor-plan" : "modeling"}
        onStudioModeChange={p.onStudioModeChange}
      />

      {/* Reference Search Input */}
      <label className="ref-search-box">
        <Search size={14} className="text-[var(--studio-text-secondary)]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search plan elements…"
          aria-label="Search floor-plan elements"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="studio-search-clear"
          >
            <X size={12} />
          </button>
        )}
      </label>

      {p.floorPlanMode ? (
        <>
          {/* Reference Hierarchical Scene Tree for Interior & Floor Plan */}
          <div className="ref-hierarchy-scroll" role="tree" aria-label="Floor plan hierarchy">
            <div className="ref-tree-root">
              {/* Top 2D Drafting Camera Node */}
              <div className="ref-tree-branch">
                <div className="ref-tree-row">
                  <span className="ref-tree-connector" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => p.onSelectFloorPlanObject?.(null)}
                    className="ref-tree-label-btn"
                  >
                    <Video size={14} className="text-[var(--studio-text-secondary)]" />
                    <span>Top 2D Camera · 1:{settings?.scale ?? 100}</span>
                  </button>
                </div>
              </div>

              {/* Group 1: Rooms & Interior Zones */}
              <div className="ref-tree-branch">
                <div className="ref-tree-row">
                  <button
                    type="button"
                    aria-label="Toggle Rooms group"
                    onClick={() => toggleGroup("rooms")}
                    className="ref-tree-disclosure"
                  >
                    {expandedGroups.rooms ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleGroup("rooms")}
                    className="ref-tree-label-btn"
                  >
                    <Grid2X2 size={14} className="text-emerald-400" />
                    <span className="font-medium text-[var(--studio-text-primary)]">Rooms & Zones ({rooms.length})</span>
                  </button>
                </div>

                {expandedGroups.rooms && (
                  <div className="ref-tree-children" role="group">
                    {rooms.map((room, idx) => {
                      const label = getObjectLabel(room, idx);
                      if (!matchesQuery(label)) return null;
                      const isSelected = p.selectedFloorPlanId === room.id;
                      const isLocked = !!lockedIds[room.id];
                      const isHidden = !!hiddenIds[room.id];
                      return (
                        <div
                          key={room.id}
                          role="treeitem"
                          aria-selected={isSelected}
                          className={`ref-tree-row is-child ${isSelected ? "is-selected" : ""} ${
                            isHidden ? "opacity-50" : ""
                          }`}
                        >
                          <span className="ref-tree-child-connector" aria-hidden="true" />
                          <button
                            type="button"
                            onClick={() => p.onSelectFloorPlanObject?.(room.id)}
                            className="ref-tree-label-btn"
                          >
                            <SquareDashed
                              size={13.5}
                              className={isSelected ? "text-[#1a8cff]" : "text-[var(--studio-text-secondary)]"}
                            />
                            <span className="truncate">{label}</span>
                          </button>
                          <span className="ref-tree-actions">
                            <button
                              type="button"
                              aria-label={`${isLocked ? "Unlock" : "Lock"} ${label}`}
                              onClick={() =>
                                setLockedIds((v) => ({ ...v, [room.id]: !v[room.id] }))
                              }
                            >
                              {isLocked ? <Lock size={11} /> : <Unlock size={11} />}
                            </button>
                            <button
                              type="button"
                              aria-label={`${isHidden ? "Show" : "Hide"} ${label}`}
                              onClick={() =>
                                setHiddenIds((v) => ({ ...v, [room.id]: !v[room.id] }))
                              }
                            >
                              {isHidden ? <EyeOff size={11} /> : <Eye size={11} />}
                            </button>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Group 2: Structural Walls */}
              <div className="ref-tree-branch">
                <div className="ref-tree-row">
                  <button
                    type="button"
                    aria-label="Toggle Structural Walls group"
                    onClick={() => toggleGroup("walls")}
                    className="ref-tree-disclosure"
                  >
                    {expandedGroups.walls ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleGroup("walls")}
                    className="ref-tree-label-btn"
                  >
                    <Layers3 size={14} className="text-[#1a8cff]" />
                    <span className="font-medium text-[var(--studio-text-primary)]">
                      Structural Walls ({walls.length})
                    </span>
                  </button>
                </div>

                {expandedGroups.walls && (
                  <div className="ref-tree-children" role="group">
                    {walls.map((wall, idx) => {
                      const label = getObjectLabel(wall, idx);
                      if (!matchesQuery(label)) return null;
                      const isSelected = p.selectedFloorPlanId === wall.id;
                      return (
                        <div
                          key={wall.id}
                          role="treeitem"
                          aria-selected={isSelected}
                          className={`ref-tree-row is-child ${isSelected ? "is-selected" : ""}`}
                        >
                          <span className="ref-tree-child-connector" aria-hidden="true" />
                          <button
                            type="button"
                            onClick={() => p.onSelectFloorPlanObject?.(wall.id)}
                            className="ref-tree-label-btn"
                          >
                            <Box
                              size={13.5}
                              className={isSelected ? "text-[#1a8cff]" : "text-[var(--studio-text-secondary)]"}
                            />
                            <span className="truncate">{label}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Group 3: Doors & Windows */}
              <div className="ref-tree-branch">
                <div className="ref-tree-row">
                  <button
                    type="button"
                    aria-label="Toggle Doors and Windows group"
                    onClick={() => toggleGroup("openings")}
                    className="ref-tree-disclosure"
                  >
                    {expandedGroups.openings ? (
                      <ChevronDown size={11} />
                    ) : (
                      <ChevronRight size={11} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleGroup("openings")}
                    className="ref-tree-label-btn"
                  >
                    <DoorOpen size={14} className="text-amber-400" />
                    <span className="font-medium text-[var(--studio-text-primary)]">
                      Doors & Windows ({openings.length})
                    </span>
                  </button>
                </div>

                {expandedGroups.openings && (
                  <div className="ref-tree-children" role="group">
                    {openings.map((item, idx) => {
                      const label = getObjectLabel(item, idx);
                      if (!matchesQuery(label)) return null;
                      const isSelected = p.selectedFloorPlanId === item.id;
                      return (
                        <div
                          key={item.id}
                          role="treeitem"
                          aria-selected={isSelected}
                          className={`ref-tree-row is-child ${isSelected ? "is-selected" : ""}`}
                        >
                          <span className="ref-tree-child-connector" aria-hidden="true" />
                          <button
                            type="button"
                            onClick={() => p.onSelectFloorPlanObject?.(item.id)}
                            className="ref-tree-label-btn"
                          >
                            <DoorOpen
                              size={13.5}
                              className={isSelected ? "text-[#1a8cff]" : "text-[var(--studio-text-secondary)]"}
                            />
                            <span className="truncate">{label}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Group 4: Dimensions & Furniture */}
              {annotations.length > 0 && (
                <div className="ref-tree-branch">
                  <div className="ref-tree-row">
                    <button
                      type="button"
                      aria-label="Toggle Annotations group"
                      onClick={() => toggleGroup("annotations")}
                      className="ref-tree-disclosure"
                    >
                      {expandedGroups.annotations ? (
                        <ChevronDown size={11} />
                      ) : (
                        <ChevronRight size={11} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleGroup("annotations")}
                      className="ref-tree-label-btn"
                    >
                      <Ruler size={14} className="text-[var(--studio-text-secondary)]" />
                      <span>Annotations & Furniture ({annotations.length})</span>
                    </button>
                  </div>
                  {expandedGroups.annotations && (
                    <div className="ref-tree-children" role="group">
                      {annotations.map((item, idx) => {
                        const label = getObjectLabel(item, idx);
                        if (!matchesQuery(label)) return null;
                        const isSelected = p.selectedFloorPlanId === item.id;
                        return (
                          <div
                            key={item.id}
                            role="treeitem"
                            aria-selected={isSelected}
                            className={`ref-tree-row is-child ${isSelected ? "is-selected" : ""}`}
                          >
                            <span className="ref-tree-child-connector" aria-hidden="true" />
                            <button
                              type="button"
                              onClick={() => p.onSelectFloorPlanObject?.(item.id)}
                              className="ref-tree-label-btn"
                            >
                              <Ruler
                                size={13.5}
                                className={isSelected ? "text-[#1a8cff]" : "text-[var(--studio-text-secondary)]"}
                              />
                              <span className="truncate">{label}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Drafting Floor Grid Node */}
              <div className="ref-tree-branch">
                <div className="ref-tree-row">
                  <span className="ref-tree-connector" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => updateSettings({ snapToGrid: !settings?.snapToGrid })}
                    className="ref-tree-label-btn"
                  >
                    <Square size={14} className="text-[var(--studio-text-secondary)]" />
                    <span>
                      Drafting Grid ({settings?.gridStepMm ?? 100} mm)
                    </span>
                  </button>
                </div>
              </div>

              {objects.length === 0 && (
                <div className="crystal-reference-empty">
                  <Folder size={16} />
                  <span>Empty floor plan</span>
                  <small>Use the top toolbar or AI Chat below</small>
                </div>
              )}
            </div>
          </div>

          {/* Collapsible Architectural Standards & Scale Drawer */}
          <div className="ref-collapsible-drawer">
            <button
              type="button"
              aria-expanded={setupExpanded}
              onClick={() => setSetupExpanded((v) => !v)}
              className="ref-drawer-trigger"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal size={13} className="text-[var(--studio-text-secondary)]" />
                <span>Drafting Setup & Scale</span>
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-[var(--studio-text-secondary)]">
                <span>
                  {settings?.unit ?? "m"} · 1:{settings?.scale ?? 100}
                </span>
                <ChevronDown
                  size={13}
                  className={`transition-transform ${setupExpanded ? "rotate-180" : ""}`}
                />
              </span>
            </button>

            {setupExpanded && (
              <div className="ref-drawer-body space-y-2 pt-2">
                <div className="studio-field-row">
                  <span>Drawing Units</span>
                  <select
                    aria-label="Drawing units"
                    value={settings?.unit ?? "m"}
                    onChange={(e) =>
                      updateSettings({ unit: e.target.value as FloorPlanSettings["unit"] })
                    }
                    className="studio-inline-select"
                  >
                    <option value="mm">Millimeters (mm)</option>
                    <option value="cm">Centimeters (cm)</option>
                    <option value="m">Meters (m)</option>
                  </select>
                </div>
                <div className="studio-field-row">
                  <span>Drawing Scale</span>
                  <select
                    aria-label="Drawing scale"
                    value={settings?.scale ?? 100}
                    onChange={(e) => updateSettings({ scale: Number(e.target.value) })}
                    className="studio-inline-select"
                  >
                    <option value={50}>1 : 50</option>
                    <option value={100}>1 : 100</option>
                    <option value={200}>1 : 200</option>
                  </select>
                </div>
                <div className="studio-field-row">
                  <span>Grid Step</span>
                  <select
                    aria-label="Default grid step"
                    value={settings?.gridStepMm ?? 100}
                    onChange={(e) => updateSettings({ gridStepMm: Number(e.target.value) })}
                    className="studio-inline-select"
                  >
                    <option value={50}>50 mm Fine</option>
                    <option value={100}>100 mm Standard</option>
                    <option value={250}>250 mm Modular</option>
                    <option value={500}>500 mm Structural</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="ref-hierarchy-scroll space-y-3 px-1">
          <div className="studio-card-group">
            <span className="studio-group-kicker">Surface Material</span>
            <div className="studio-field-row">
              <span>Preset</span>
              <select
                aria-label="Preset"
                value={p.material}
                onChange={(e) => p.onMaterialChange(e.target.value as MaterialName)}
                className="studio-inline-select"
              >
                {materials.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="studio-field-row">
              <span>Roughness</span>
              <input
                aria-label="Roughness"
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={p.roughness}
                onChange={(e) => p.onRoughnessChange(clamp(Number(e.target.value)))}
                className="studio-number-input"
              />
            </div>
            <div className="studio-field-row">
              <span>Metallic</span>
              <input
                aria-label="Metallic"
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={p.metallic}
                onChange={(e) => p.onMetallicChange(clamp(Number(e.target.value)))}
                className="studio-number-input"
              />
            </div>
          </div>
          <div className="studio-card-group">
            <span className="studio-group-kicker">Topology & Texture</span>
            <Segmented
              value={p.topology}
              options={["Auto", "Quad", "Low Poly"]}
              onChange={p.onTopologyChange}
            />
            <Segmented
              value={p.texture}
              options={["None", "Albedo", "PBR"]}
              onChange={p.onTextureChange}
            />
          </div>
          <div className="studio-card-group">
            <span className="studio-group-kicker">Pipeline Options</span>
            <Toggle
              label="Separate Parts"
              enabled={p.separateParts}
              onChange={p.onSeparatePartsChange}
            />
            <Toggle
              label="Image Enhancement"
              enabled={p.imageEnhancement}
              onChange={p.onImageEnhancementChange}
            />
            <Toggle
              label="Code Execution"
              enabled={p.codeExecution}
              onChange={p.onCodeExecutionChange}
            />
          </div>
          <div className="studio-render-card">
            <div className="flex items-center justify-between text-[11px] text-[var(--studio-text-primary)]">
              <span>Est. {p.estimatedMinutes} min</span>
              <span className="inline-flex items-center gap-1 font-semibold text-[var(--studio-text-primary)]">
                <Zap size={12} className="text-[#1a8cff]" />
                {p.estimatedCost} credits
              </span>
            </div>
            <button
              type="button"
              onClick={p.onRender}
              disabled={p.renderLoading}
              className="studio-primary-btn mt-2 w-full"
            >
              {p.renderLoading ? (
                <span className="inline-flex items-center gap-1.5">
                  <LoaderCircle size={13} className="animate-spin" />
                  Rendering…
                </span>
              ) : (
                "Render Queue"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Hidden legacy reference generator kept for DOM/test compatibility */}
      <div className="crystal-reference-generator sr-only" aria-hidden="true">
        <div>
          <Sparkles size={13} />
          <span>Reference Image</span>
        </div>
        <label>
          <Upload size={13} />
          <span>{p.uploadedImage ? "Reference attached" : "Upload reference"}</span>
          <input
            aria-label="Upload Image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) p.onUpload(f);
              e.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      {/* Reference Bottom Secondary Navigation: Library, Import, Help & Feedback */}
      <footer className="ref-sidebar-footer">
        <button
          type="button"
          onClick={() => setSetupExpanded((v) => !v)}
          className={`ref-footer-nav-item ${setupExpanded ? "is-active" : ""}`}
        >
          <LayoutGrid size={15} />
          <span>Library & Presets</span>
          <em className="ml-auto text-[11px] not-italic text-[var(--studio-text-secondary)]">{objects.length}</em>
        </button>
        <button
          type="button"
          onClick={() => importInputRef.current?.click()}
          className="ref-footer-nav-item"
        >
          <Download size={15} />
          <span>{p.uploadedImage ? "Reference Attached" : "Import"}</span>
        </button>
        <div className="flex items-center justify-between">
          <Link href="/help" className="ref-footer-nav-item flex-1">
            <CircleHelp size={15} />
            <span>Help & Feedback</span>
          </Link>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={p.onProfile}
              aria-label="Account profile"
              title="Account profile"
              className="grid h-6 w-6 place-items-center rounded-md text-[var(--studio-text-secondary)] hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)]"
            >
              <User size={12} />
            </button>
            <button
              type="button"
              onClick={p.onSignOut}
              aria-label="Sign out"
              title="Sign out"
              className="grid h-6 w-6 place-items-center rounded-md text-[var(--studio-text-secondary)] hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)]"
            >
              <LogOut size={12} />
            </button>
          </div>
        </div>
      </footer>
    </StudioPanel>
  );
}
