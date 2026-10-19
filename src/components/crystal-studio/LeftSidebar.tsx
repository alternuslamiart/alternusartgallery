"use client";

import {
  ArrowLeft,
  Box,
  ChevronDown,
  DoorOpen,
  Layers3,
  LoaderCircle,
  LogOut,
  PanelLeftClose,
  Ruler,
  Sparkles,
  SquareDashed,
  Upload,
  User,
  Zap,
} from "lucide-react";
import { useState } from "react";
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

function NumberSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="studio-slider-row">
      <b className="flex-1">{label}</b>
      <input
        aria-label={`${label} slider`}
        type="range"
        min="0"
        max="1"
        step=".01"
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="mr-2 w-20 accent-[#1687f7]"
      />
      <input
        aria-label={`${label} value`}
        type="number"
        min="0"
        max="1"
        step=".01"
        value={value.toFixed(2)}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="w-14 rounded-[6px] border border-white/[0.08] bg-[#14171c] py-1 text-center text-[11px] outline-none focus:border-[#1687f7]"
      />
    </label>
  );
}

function CompactSelect({
  label,
  value,
  options,
  onChange,
  icon,
}: {
  label?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative min-w-0 flex-1">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-full w-full items-center gap-2 rounded-[8px] px-2 text-left text-[12px] font-medium text-zinc-100 transition hover:bg-white/[0.04]"
      >
        {icon}
        <span className="min-w-0 flex-1 truncate">{value}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="studio-dropdown-menu">
          {options.map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`studio-dropdown-item ${option === value ? "is-selected" : ""}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function LeftSidebar(p: Props) {
  const [draftingProfile, setDraftingProfile] = useState("Architectural 2D");
  const floorSettings = p.floorPlanSettings;
  const updateFloorSettings = (patch: Partial<FloorPlanSettings>) => {
    if (floorSettings) p.onFloorPlanSettingsChange?.({ ...floorSettings, ...patch });
  };
  const floorObjects = p.floorPlanObjects ?? [];
  const wallCount = floorObjects.filter((o) => o.type === "wall").length;
  const roomCount = floorObjects.filter((o) => o.type === "room").length;
  const openingCount = floorObjects.filter((o) => o.type === "door" || o.type === "window").length;

  return (
    <aside
      className="crystal-left-panel crystal-sidebar studio-sidebar-shell flex min-h-0 flex-col overflow-hidden"
      aria-label={p.floorPlanMode ? "Floor plan drafting sidebar" : "Modeling sidebar"}
    >
      <header className="crystal-reference-project-header studio-sidebar-top">
        {p.onBack && (
          <button
            type="button"
            aria-label="Back to projects"
            title="Back to projects"
            onClick={p.onBack}
            className="studio-header-icon-btn"
          >
            <ArrowLeft size={14} />
          </button>
        )}
        <div className="studio-brand-stack">
          <b>Casynus</b>
          <small>{p.floorPlanMode ? "Floor Plan Studio" : "3D Modeling Studio"}</small>
        </div>
        <button
          type="button"
          aria-label="Collapse left panel"
          title="Collapse sidebar"
          onClick={p.onCollapse}
          className="studio-header-icon-btn"
        >
          <PanelLeftClose size={15} />
        </button>
      </header>

      <StudioModeNav
        activeStudio={p.floorPlanMode ? "floor-plan" : "modeling"}
        onStudioModeChange={p.onStudioModeChange}
      />

      <div className="crystal-left-scroll studio-sidebar-scroll min-h-0 flex-1 overflow-y-auto">
        <div className="studio-profile-card">
          <span className="studio-profile-icon">
            <Layers3 size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <span className="studio-profile-kicker">
              {p.floorPlanMode ? "Drafting Profile" : "Render Engine"}
            </span>
            <CompactSelect
              label={p.floorPlanMode ? "Studio" : "Renderer"}
              value={p.floorPlanMode ? draftingProfile : p.renderer}
              options={
                p.floorPlanMode
                  ? ["Architectural 2D", "Drafting / CAD", "Presentation"]
                  : ["Realtime", "Path-Traced", "Cycles-style"]
              }
              onChange={p.floorPlanMode ? setDraftingProfile : p.onRendererChange}
            />
          </div>
        </div>

        {p.floorPlanMode ? (
          <>
            <section className="studio-panel-section">
              <div className="studio-section-title-row">
                <h2>Drafting Setup</h2>
                <span>ISO / Metric</span>
              </div>
              <div className="studio-kv-list">
                <label className="studio-kv-row">
                  <span>Drawing Units</span>
                  <select
                    aria-label="Drawing units"
                    value={floorSettings?.unit ?? "mm"}
                    onChange={(e) =>
                      updateFloorSettings({ unit: e.target.value as FloorPlanSettings["unit"] })
                    }
                  >
                    <option value="mm">Millimeters (mm)</option>
                    <option value="cm">Centimeters (cm)</option>
                    <option value="m">Meters (m)</option>
                  </select>
                </label>
                <label className="studio-kv-row">
                  <span>Drawing Scale</span>
                  <select
                    aria-label="Drawing scale"
                    value={floorSettings?.scale ?? 100}
                    onChange={(e) => updateFloorSettings({ scale: Number(e.target.value) })}
                  >
                    <option value={50}>1 : 50</option>
                    <option value={100}>1 : 100</option>
                    <option value={200}>1 : 200</option>
                  </select>
                </label>
                <label className="studio-kv-row">
                  <span>Grid Step</span>
                  <select
                    aria-label="Grid step"
                    value={floorSettings?.gridStepMm ?? 100}
                    onChange={(e) => updateFloorSettings({ gridStepMm: Number(e.target.value) })}
                  >
                    <option value={10}>10 mm</option>
                    <option value={50}>50 mm</option>
                    <option value={100}>100 mm</option>
                    <option value={250}>250 mm</option>
                  </select>
                </label>
                <div className="studio-kv-row">
                  <span>Wall Standard</span>
                  <b>180 mm</b>
                </div>
              </div>
            </section>

            <section className="studio-panel-section">
              <div className="studio-section-title-row">
                <h2>Snapping & Constraints</h2>
              </div>
              <div className="studio-toggle-group">
                <Toggle
                  label="Snap to grid"
                  enabled={floorSettings?.snapToGrid ?? true}
                  onChange={(snapToGrid) => updateFloorSettings({ snapToGrid })}
                />
                <Toggle
                  label="Endpoint / midpoint"
                  enabled={floorSettings?.snapToPoints ?? true}
                  onChange={(snapToPoints) => updateFloorSettings({ snapToPoints })}
                />
                <Toggle
                  label="Orthogonal 90°"
                  enabled={floorSettings?.orthogonal ?? true}
                  onChange={(orthogonal) => updateFloorSettings({ orthogonal })}
                />
              </div>
            </section>

            <section className="studio-panel-section">
              <div className="studio-section-title-row">
                <h2>Drawing Standards</h2>
              </div>
              <Segmented
                value={p.quality}
                options={["Draft", "Standard", "Presentation"]}
                onChange={p.onQualityChange}
              />
            </section>

            <section className="studio-panel-section">
              <div className="studio-section-title-row">
                <h2>Plan Elements</h2>
                <span>{floorObjects.length} total</span>
              </div>
              <div className="studio-plan-summary-grid">
                <div>
                  <strong>{wallCount}</strong>
                  <span>Walls</span>
                </div>
                <div>
                  <strong>{roomCount}</strong>
                  <span>Rooms</span>
                </div>
                <div>
                  <strong>{openingCount}</strong>
                  <span>Openings</span>
                </div>
              </div>
              {floorObjects.length > 0 && (
                <div className="studio-layer-list" role="listbox" aria-label="Floor plan elements">
                  {floorObjects.map((item, idx) => {
                    const isSelected = p.selectedFloorPlanId === item.id;
                    const label =
                      item.type === "room"
                        ? item.label
                        : item.type === "text"
                          ? item.text
                          : item.type === "furniture"
                            ? item.label
                            : `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} ${idx + 1}`;
                    const Icon =
                      item.type === "door" || item.type === "window"
                        ? DoorOpen
                        : item.type === "dimension"
                          ? Ruler
                          : SquareDashed;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() =>
                          p.onSelectFloorPlanObject?.(isSelected ? null : item.id)
                        }
                        className={`studio-layer-item ${isSelected ? "is-selected" : ""}`}
                      >
                        <Icon size={13} className={isSelected ? "text-[#4A90D9]" : "text-zinc-400"} />
                        <span className="truncate">{label}</span>
                        <small>{item.type}</small>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            <div className="crystal-modeling-tabs">
              <button type="button" className="is-active">
                Modeling
              </button>
              <button type="button">Shaders</button>
              <button type="button">Render</button>
            </div>
            <div className="crystal-generative-panel">
              <div className="crystal-panel-label">GENERATIVE 3D</div>
              <label className="crystal-reference-upload">
                <Upload size={17} />
                <span>
                  Drag or upload image reference
                  <small>JPG, PNG, WEBP · up to 5MB</small>
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) p.onUpload(file);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
              <textarea
                value={p.prompt ?? ""}
                onChange={(event) => p.onPromptChange?.(event.target.value)}
                placeholder="Describe the object you want to generate..."
              />
              <div className="crystal-generation-meta">
                <span>
                  AI Model <b>Precision Mode</b>
                </span>
                <span>
                  Quantity <b>1</b>
                </span>
              </div>
              <button
                type="button"
                className="crystal-generation-button"
                disabled={!p.prompt?.trim() || p.loading}
                onClick={p.onGenerate}
              >
                <Sparkles size={14} />
                {p.loading ? "Generating..." : "Generate 3D Model"}
              </button>
            </div>
            <section className="studio-panel-section">
              <div className="studio-section-title-row">
                <h2>Properties</h2>
              </div>
              <div className="studio-kv-list">
                <div className="studio-kv-row">
                  <span>Model Quality</span>
                  <CompactSelect
                    value={p.quality}
                    options={["Draft", "Standard", "High", "Ultra"]}
                    onChange={p.onQualityChange}
                  />
                </div>
                <div className="studio-kv-row">
                  <span>Material</span>
                  <CompactSelect
                    label="Material"
                    value={p.material}
                    options={materials}
                    onChange={(value) => p.onMaterialChange(value as MaterialName)}
                    icon={<Box size={13} className="text-[#4A90D9]" />}
                  />
                </div>
              </div>
              <NumberSlider label="Roughness" value={p.roughness} onChange={p.onRoughnessChange} />
              <NumberSlider label="Metallic" value={p.metallic} onChange={p.onMetallicChange} />
            </section>
            <section className="studio-panel-section">
              <div className="studio-section-title-row">
                <h2>Topology</h2>
              </div>
              <Segmented
                value={p.topology}
                options={["Auto", "Low Poly", "Topology"]}
                onChange={p.onTopologyChange}
              />
              <div className="studio-section-title-row mt-3">
                <h2>Texture</h2>
              </div>
              <Segmented
                value={p.texture}
                options={["None", "Standard", "PBR"]}
                onChange={p.onTextureChange}
              />
            </section>
            <section className="studio-panel-section">
              <div className="studio-section-title-row">
                <h2>Advanced</h2>
              </div>
              <div className="studio-toggle-group">
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
            </section>
          </>
        )}
      </div>

      <footer className="crystal-left-footer crystal-reference-footer crystal-modeling-footer shrink-0">
        <a href="/pricing" className="crystal-modeling-pro-notice">
          Pro workspace: unlimited renders,
          <br />
          architectural CAD & mesh export
        </a>
        <div className="crystal-modeling-render-card">
          <div>
            <strong>{p.estimatedMinutes} min</strong>
            <strong>
              <Zap size={12} /> {p.estimatedCost}
            </strong>
          </div>
          <button
            type="button"
            disabled={p.renderLoading || p.credits < p.estimatedCost}
            onClick={p.onRender}
          >
            {p.renderLoading ? (
              <>
                <LoaderCircle className="animate-spin" size={14} /> Submitting
              </>
            ) : (
              <>
                Render Queue <span>{p.estimatedCost}</span>
              </>
            )}
          </button>
        </div>
        <div className="crystal-modeling-account">
          <button
            type="button"
            aria-label="Open user menu"
            onClick={p.onProfile}
            className="studio-user-avatar-btn"
          >
            <User size={14} />
          </button>
          <button type="button" onClick={p.onSignOut} className="studio-signout-btn">
            <LogOut size={13} />
            <small>Sign Out</small>
          </button>
        </div>
      </footer>
    </aside>
  );
}
