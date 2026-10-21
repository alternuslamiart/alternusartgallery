"use client";

import { InspectorSection, StudioPanel } from "./kit";

import {
  Box,
  Camera,
  ChevronDown,
  CircleHelp,
  Download,
  FileBox,
  FileText,
  Grid2X2,
  Image,
  Layers3,
  Lightbulb,
  MousePointer2,
  Settings,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import {
  formatFloorLength,
  parseFloorLength,
  roundFloorValue,
} from "./floor-plan-geometry";
import type {
  FloorPlanObject,
  FloorPlanSettings,
  RenderSettings,
  StudioAsset,
} from "./types";
import { BinaryToggle, InspectorCollaboratorBar, SectionTitle } from "./ui";

type Props = {
  resolution: string;
  frameRate: string;
  color: string;
  opacity: number;
  renderSettings: RenderSettings;
  assets: StudioAsset[];
  selectedAssetId: string | null;
  exporting: string | null;
  onResolutionChange: (value: string) => void;
  onFrameRateChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onOpacityChange: (value: number) => void;
  onRenderChange: (value: RenderSettings) => void;
  onSelectAsset: (id: string) => void;
  onDeleteAsset: (id: string) => void;
  onExport: (format: string) => void;
  onCollapse: () => void;
  floorPlanMode?: boolean;
  floorPlanSettings?: FloorPlanSettings;
  onFloorPlanSettingsChange?: (settings: FloorPlanSettings) => void;
  selectedFloorPlanObject?: FloorPlanObject;
  onUpdateFloorPlanObject?: (object: FloorPlanObject) => void;
  onDeleteFloorPlanObject?: (id: string) => void;
};

const exportOptions = [
  { label: "glTF 2.0", icon: FileBox },
  { label: "JPEG & PNG", icon: Image },
  { label: "STEP AP214", icon: FileBox },
  { label: "OBJ Mesh", icon: FileBox },
  { label: "Spec Sheet (PDF)", icon: FileText },
  { label: "Render Log", icon: FileText },
];

const floorPlanExportOptions = [
  { label: "PDF", icon: FileText },
  { label: "PNG", icon: Image },
  { label: "SVG", icon: FileBox },
  { label: "JSON Scene", icon: FileText },
];

const hdriPresets = ["Studio Soft", "Neutral Daylight", "Architectural Warm", "Dark Rim"];

function FloorLengthInput({
  label,
  value,
  settings,
  min = 0,
  onChange,
}: {
  label: string;
  value: number;
  settings: FloorPlanSettings;
  min?: number;
  onChange: (value: number) => void;
}) {
  const display = formatFloorLength(value, settings).replace(` ${settings.unit}`, "");
  return (
    <label className="studio-input-pill">
      <span className="flex-1 capitalize text-[var(--studio-text-secondary)]">{label}</span>
      <input
        aria-label={label}
        type="text"
        value={display}
        onChange={(event) => {
          const parsed = parseFloorLength(event.target.value, settings.unit);
          if (parsed !== null)
            onChange(roundFloorValue(Math.max(min, parsed), settings.precision));
        }}
        className="w-16 rounded-[6px] border border-[var(--studio-border)] bg-[var(--studio-bg-panel)] px-1.5 py-0.5 text-right text-[var(--studio-text-primary)] outline-none focus:border-[var(--studio-accent)]"
      />
      <span className="ml-1 text-[10px] text-[var(--studio-text-secondary)]">{settings.unit}</span>
    </label>
  );
}

export function RightPanel(props: Props) {
  const [swatches, setSwatches] = useState([
    "#4A90D9",
    "#256DCC",
    "#64748B",
    "#E8793E",
    "#84CC6A",
    "#A855F7",
  ]);
  const [cameraMode, setCameraMode] = useState("Personal Camera");
  const [frameEditOpen, setFrameEditOpen] = useState(false);
  const [globalOpen, setGlobalOpen] = useState(true);
  const [snapping, setSnapping] = useState(true);
  const [pixelGrid, setPixelGrid] = useState(true);
  const [softOrbit, setSoftOrbit] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [helpers, setHelpers] = useState(true);
  const [postProcessing, setPostProcessing] = useState(false);
  const [envLight, setEnvLight] = useState(true);
  const [envAmbient, setEnvAmbient] = useState(true);
  const [envFog, setEnvFog] = useState(false);
  const [hdriIndex, setHdriIndex] = useState(0);
  const [exportDeliverablesOpen, setExportDeliverablesOpen] = useState(false);
  const [showFloorDimensions, setShowFloorDimensions] = useState(true);
  const [showRoomAreas, setShowRoomAreas] = useState(true);
  const [activeUtility, setActiveUtility] = useState("grid");

  const canvasOptions = ["Full Screen", "3840x2160", "2560x1440", "1920x1080"];
  const frameRateOptions = ["24 fps", "30 fps", "60 fps", "120 fps"];
  const utilities = [
    { id: "lighting", label: "Lighting", icon: Lightbulb },
    { id: "world", label: "Layers", icon: Layers3 },
    { id: "camera", label: "Camera", icon: Camera },
    { id: "grid", label: "Grid", icon: Grid2X2 },
    { id: "help", label: "Help", icon: CircleHelp },
  ];

  const selected = props.selectedFloorPlanObject;
  const floorSettings: FloorPlanSettings = props.floorPlanSettings ?? {
    unit: "m",
    scale: 100,
    precision: 10,
    gridStepMm: 100,
    snapToGrid: true,
    snapToPoints: true,
    orthogonal: true,
  };
  const updateFloorSettings = (patch: Partial<FloorPlanSettings>) =>
    props.onFloorPlanSettingsChange?.({ ...floorSettings, ...patch });
  const updateSelected = (patch: Partial<FloorPlanObject>) => {
    if (selected && props.onUpdateFloorPlanObject)
      props.onUpdateFloorPlanObject({ ...selected, ...patch } as FloorPlanObject);
  };

  return (
    <StudioPanel
      className="crystal-right-panel studio-sidebar-shell ref-floating-sidebar min-h-0 overflow-y-auto scrollbar-hide"
      aria-label={props.floorPlanMode ? "Floor plan inspector" : "Studio inspector"}
    >
      {/* Reference Top Collaborator / Invite Header */}
      <InspectorCollaboratorBar onCollapse={props.onCollapse} />

      {/* Hidden utility trigger buttons preserved for event/test compatibility */}
      <div className="crystal-utility-icons sr-only" role="group" aria-label="Viewport utilities">
        {utilities.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-pressed={activeUtility === id}
            onClick={() => {
              setActiveUtility(id);
              window.dispatchEvent(new CustomEvent("crystal:viewport-control", { detail: id }));
            }}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>

      {props.floorPlanMode ? (
        /* ==============================================================
           INTERIOR & 2D FLOOR PLAN INSPECTOR (/interior)
           ============================================================== */
        <div className="ref-inspector-body">
          {/* Section 1: Camera & Sheet */}
          <InspectorSection title={<>Camera & Sheet</>}>

            <div className="ref-prop-row">
              <span className="ref-prop-label">Current</span>
              <select
                aria-label="Drafting view"
                value={cameraMode}
                onChange={(e) => setCameraMode(e.target.value)}
                className="ref-select-control"
              >
                <option value="Personal Camera">Top 2D Drafting</option>
                <option value="Architectural Sheet">Architectural Sheet</option>
                <option value="Interior Zone Plan">Interior Zone Plan</option>
              </select>
            </div>
            <div className="ref-prop-row">
              <span className="ref-prop-label">Scale</span>
              <select
                aria-label="Drawing scale"
                value={floorSettings.scale}
                onChange={(e) => updateFloorSettings({ scale: Number(e.target.value) })}
                className="ref-select-control"
              >
                <option value={50}>1 : 50</option>
                <option value={100}>1 : 100</option>
                <option value={200}>1 : 200</option>
              </select>
            </div>
            <div className="ref-prop-row">
              <span className="ref-prop-label">Units</span>
              <select
                aria-label="Drawing units"
                value={floorSettings.unit}
                onChange={(e) =>
                  updateFloorSettings({
                    unit: e.target.value as FloorPlanSettings["unit"],
                  })
                }
                className="ref-select-control"
              >
                <option value="mm">Millimeters (mm)</option>
                <option value="cm">Centimeters (cm)</option>
                <option value="m">Meters (m)</option>
                <option value="ft">Feet (ft)</option>
              </select>
            </div>
          </InspectorSection>

          {/* Section 2: Selected Floor Plan Element */}
          <section className="ref-inspector-section">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="ref-section-heading !mb-0">
                {selected ? `Selected · ${selected.type}` : "Selected Element"}
              </h2>
              {selected && (
                <button
                  type="button"
                  aria-label="Delete selected floor-plan object"
                  title="Delete selected element"
                  onClick={() => props.onDeleteFloorPlanObject?.(selected.id)}
                  className="studio-danger-icon-btn"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {selected ? (
              <div className="space-y-2 text-[12px]">
                {selected.type === "wall" && (
                  <>
                    <div className="ref-prop-row">
                      <span className="ref-prop-label">Length</span>
                      <strong className="text-[12px] font-semibold text-[var(--studio-text-primary)]">
                        {formatFloorLength(
                          Math.hypot(
                            selected.end.x - selected.start.x,
                            selected.end.y - selected.start.y,
                          ),
                          floorSettings,
                        )}
                      </strong>
                    </div>
                    <FloorLengthInput
                      label="thickness"
                      value={selected.thickness}
                      settings={floorSettings}
                      min={0.05}
                      onChange={(thickness) => updateSelected({ thickness })}
                    />
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {(["start", "end"] as const).map((point) => (
                        <div key={point} className="studio-coord-box">
                          <span className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--studio-text-secondary)]">
                            {point} (X / Y)
                          </span>
                          <div className="flex gap-1">
                            <input
                              aria-label={`${point} X`}
                              type="text"
                              value={formatFloorLength(
                                selected[point].x,
                                floorSettings,
                              ).replace(` ${floorSettings.unit}`, "")}
                              onChange={(e) => {
                                const value = parseFloorLength(
                                  e.target.value,
                                  floorSettings.unit,
                                );
                                if (value !== null)
                                  updateSelected({
                                    [point]: {
                                      ...selected[point],
                                      x: roundFloorValue(value, floorSettings.precision),
                                    },
                                  });
                              }}
                              className="w-full rounded-[6px] border border-[var(--studio-border)] bg-[var(--studio-bg-panel)] px-1 py-1 text-center text-[11px] text-[var(--studio-text-primary)] outline-none focus:border-[var(--studio-accent)]"
                            />
                            <input
                              aria-label={`${point} Y`}
                              type="text"
                              value={formatFloorLength(
                                selected[point].y,
                                floorSettings,
                              ).replace(` ${floorSettings.unit}`, "")}
                              onChange={(e) => {
                                const value = parseFloorLength(
                                  e.target.value,
                                  floorSettings.unit,
                                );
                                if (value !== null)
                                  updateSelected({
                                    [point]: {
                                      ...selected[point],
                                      y: roundFloorValue(value, floorSettings.precision),
                                    },
                                  });
                              }}
                              className="w-full rounded-[6px] border border-[var(--studio-border)] bg-[var(--studio-bg-panel)] px-1 py-1 text-center text-[11px] text-[var(--studio-text-primary)] outline-none focus:border-[var(--studio-accent)]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {selected.type === "room" && (
                  <>
                    <label className="studio-input-pill">
                      <span className="flex-1 text-[var(--studio-text-secondary)]">Room Label</span>
                      <input
                        value={selected.label}
                        onChange={(e) => updateSelected({ label: e.target.value })}
                        className="w-28 rounded-[6px] border border-[var(--studio-border)] bg-[var(--studio-bg-panel)] px-2 py-0.5 text-right text-[var(--studio-text-primary)] outline-none focus:border-[var(--studio-accent)]"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <FloorLengthInput
                        label="width"
                        value={selected.width}
                        settings={floorSettings}
                        min={0.1}
                        onChange={(width) => updateSelected({ width })}
                      />
                      <FloorLengthInput
                        label="height"
                        value={selected.height}
                        settings={floorSettings}
                        min={0.1}
                        onChange={(height) => updateSelected({ height })}
                      />
                    </div>
                  </>
                )}

                {selected.type === "text" && (
                  <label className="studio-input-pill">
                    <span className="flex-1 text-[var(--studio-text-secondary)]">Annotation</span>
                    <input
                      value={selected.text}
                      onChange={(e) => updateSelected({ text: e.target.value })}
                      className="w-32 rounded-[6px] border border-[var(--studio-border)] bg-[var(--studio-bg-panel)] px-2 py-0.5 text-right text-[var(--studio-text-primary)] outline-none focus:border-[var(--studio-accent)]"
                    />
                  </label>
                )}

                {(selected.type === "door" ||
                  selected.type === "window" ||
                  selected.type === "furniture") && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <FloorLengthInput
                      label="width"
                      value={selected.width}
                      settings={floorSettings}
                      min={0.1}
                      onChange={(width) => updateSelected({ width })}
                    />
                    <FloorLengthInput
                      label="height"
                      value={selected.height}
                      settings={floorSettings}
                      min={0.05}
                      onChange={(height) => updateSelected({ height })}
                    />
                    {selected.type === "door" && (
                      <div className="col-span-2">
                        <div className="ref-prop-row">
                          <span className="ref-prop-label">Door Swing</span>
                          <select
                            value={selected.swing ?? "in"}
                            onChange={(e) =>
                              updateSelected({ swing: e.target.value as "in" | "out" })
                            }
                            className="ref-select-control"
                          >
                            <option value="in">Inward Swing</option>
                            <option value="out">Outward Swing</option>
                          </select>
                        </div>
                      </div>
                    )}
                    {selected.type === "window" && (
                      <div className="col-span-2">
                        <FloorLengthInput
                          label="sill height"
                          value={selected.sillHeight ?? 0.9}
                          settings={floorSettings}
                          min={0}
                          onChange={(sillHeight) => updateSelected({ sillHeight })}
                        />
                      </div>
                    )}
                  </div>
                )}

                {selected.type === "dimension" && (
                  <div className="ref-prop-row">
                    <span className="ref-prop-label">Measured Span</span>
                    <strong className="text-[12px] font-semibold text-[var(--studio-text-primary)]">
                      {formatFloorLength(
                        Math.hypot(
                          selected.end.x - selected.start.x,
                          selected.end.y - selected.start.y,
                        ),
                        floorSettings,
                      )}
                    </strong>
                  </div>
                )}
              </div>
            ) : (
              <div className="studio-empty-card">
                <MousePointer2 size={15} className="text-[var(--studio-text-secondary)]" />
                <p>Select any wall, room, door, window, or furniture item to inspect its dimensions.</p>
              </div>
            )}
          </section>

          {/* Section 3: Global Settings (Reference Yes/No & Show/Hide pills) */}
          <section className="ref-inspector-section">
            <button
              type="button"
              onClick={() => setGlobalOpen((v) => !v)}
              className="ref-section-collapse-btn"
            >
              <span className="ref-section-heading !mb-0">Global Settings</span>
              <ChevronDown
                size={14}
                className={`text-[var(--studio-text-secondary)] transition-transform ${
                  globalOpen ? "" : "-rotate-90"
                }`}
              />
            </button>

            {globalOpen && (
              <div className="mt-2.5 space-y-2">
                <BinaryToggle
                  label="Snapping"
                  value={floorSettings.snapToPoints}
                  onChange={(snapToPoints) => updateFloorSettings({ snapToPoints })}
                />
                <BinaryToggle
                  label="Drafting Grid"
                  value={floorSettings.snapToGrid}
                  onChange={(snapToGrid) => updateFloorSettings({ snapToGrid })}
                />
                <BinaryToggle
                  label="Ortho 90°"
                  value={floorSettings.orthogonal}
                  onChange={(orthogonal) => updateFloorSettings({ orthogonal })}
                />
                <BinaryToggle
                  label="Dimensions"
                  value={showFloorDimensions}
                  onChange={setShowFloorDimensions}
                  onLabel="Show"
                  offLabel="Hide"
                />
                <BinaryToggle
                  label="Room Areas"
                  value={showRoomAreas}
                  onChange={setShowRoomAreas}
                  onLabel="Show"
                  offLabel="Hide"
                />
              </div>
            )}
          </section>

          {/* Section 4: Architectural Output */}
          <section className="ref-inspector-section !border-b-0">
            <h2 className="ref-section-heading">Architectural Output</h2>
            <div className="grid grid-cols-2 gap-1.5">
              {floorPlanExportOptions.map(({ label, icon: Icon }) => (
                <button
                  type="button"
                  disabled={props.exporting !== null}
                  key={label}
                  onClick={() => props.onExport(label)}
                  className="studio-export-btn"
                >
                  <Icon size={13.5} />
                  <span>{props.exporting === label ? "Preparing…" : label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : (
        /* ==============================================================
           3D STUDIO INSPECTOR (/casynus) — Reference Image Layout
           ============================================================== */
        <div className="ref-inspector-body">
          {/* Section 1: Camera (Reference Image Match) */}
          <InspectorSection title={<>Camera</>}>

            <div className="ref-prop-row">
              <span className="ref-prop-label">Current</span>
              <select
                aria-label="Current camera"
                value={cameraMode}
                onChange={(e) => {
                  setCameraMode(e.target.value);
                  window.dispatchEvent(
                    new CustomEvent("crystal:viewport-control", { detail: "camera" }),
                  );
                }}
                className="ref-select-control"
              >
                <option value="Personal Camera">Personal Camera</option>
                <option value="Perspective">Perspective Camera</option>
                <option value="Orthographic">Orthographic Camera</option>
                <option value="Top View">Top Elevation</option>
                <option value="Front View">Front Elevation</option>
              </select>
            </div>
          </InspectorSection>

          {/* Section 2: Frame (Reference Image Match) */}
          <InspectorSection title={<>Frame</>}>

            <div className="ref-prop-row">
              <span className="ref-prop-label">BG Color</span>
              <div className="ref-color-control-group">
                <label className="ref-color-swatch-box" title="Pick surface/frame color">
                  <input
                    aria-label="Model color"
                    type="color"
                    value={props.color}
                    onChange={(event) => props.onColorChange(event.target.value)}
                    className="sr-only"
                  />
                  <span
                    className="block h-full w-full rounded-[5px]"
                    style={{ backgroundColor: props.color }}
                  />
                </label>
                <input
                  type="text"
                  aria-label="Color hex value"
                  value={props.color.replace("#", "").toUpperCase()}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
                    if (clean.length === 6) props.onColorChange(`#${clean}`);
                  }}
                  className="ref-hex-pill"
                />
                <label className="ref-opacity-pill">
                  <input
                    aria-label="Opacity value"
                    type="number"
                    min="0"
                    max="100"
                    value={props.opacity}
                    onChange={(e) =>
                      props.onOpacityChange(
                        Math.max(0, Math.min(100, Number(e.target.value))),
                      )
                    }
                    className="w-7 bg-transparent text-right text-[11px] text-[var(--studio-text-primary)] outline-none"
                  />
                  <span>%</span>
                </label>
              </div>
            </div>

            <div className="ref-prop-row mt-2">
              <span className="ref-prop-label">Size</span>
              <select
                aria-label="Canvas resolution"
                value={props.resolution}
                onChange={(e) => props.onResolutionChange(e.target.value)}
                className="ref-select-control"
              >
                {canvasOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setFrameEditOpen((v) => !v)}
              className="ref-edit-frame-btn mt-2.5"
            >
              {frameEditOpen ? "Done Editing Frame" : "Edit Frame"}
            </button>

            {frameEditOpen && (
              <div className="mt-2.5 space-y-2 rounded-[10px] border border-[var(--studio-border)] bg-[var(--studio-bg-elevated)] p-2.5">
                <div className="flex items-center justify-between text-[11px] text-[var(--studio-text-secondary)]">
                  <span>Color Swatches</span>
                  <label className="cursor-pointer font-medium text-[var(--studio-accent)] hover:underline">
                    + Add
                    <input
                      type="color"
                      className="sr-only"
                      onChange={(e) => {
                        setSwatches((x) => [...x, e.target.value]);
                        props.onColorChange(e.target.value);
                      }}
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {swatches.map((swatch) => (
                    <button
                      type="button"
                      key={swatch}
                      aria-label={`Apply swatch ${swatch}`}
                      onClick={() => props.onColorChange(swatch)}
                      className={`h-5 w-5 rounded-[5px] border ${
                        props.color.toLowerCase() === swatch.toLowerCase()
                          ? "border-[var(--studio-border)] ring-1 ring-[var(--studio-accent)]"
                          : "border-[var(--studio-border)]"
                      }`}
                      style={{ backgroundColor: swatch }}
                    />
                  ))}
                </div>
                <div className="ref-prop-row pt-1">
                  <span className="ref-prop-label">Frame Rate</span>
                  <select
                    aria-label="Frame rate"
                    value={props.frameRate}
                    onChange={(e) => props.onFrameRateChange(e.target.value)}
                    className="ref-select-control"
                  >
                    {frameRateOptions.map((fps) => (
                      <option key={fps} value={fps}>
                        {fps}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </InspectorSection>

          {/* Section 3: Global Settings (Exact Reference Match: Snapping, Pixel Grid, Soft Orbit, Wireframe, Helpers) */}
          <section className="ref-inspector-section">
            <button
              type="button"
              onClick={() => setGlobalOpen((v) => !v)}
              className="ref-section-collapse-btn"
            >
              <span className="ref-section-heading !mb-0">Global Settings</span>
              <ChevronDown
                size={14}
                className={`text-[var(--studio-text-secondary)] transition-transform ${
                  globalOpen ? "" : "-rotate-90"
                }`}
              />
            </button>

            {globalOpen && (
              <div className="mt-2.5 space-y-2">
                <BinaryToggle
                  label="Snapping"
                  value={snapping}
                  onChange={setSnapping}
                />
                <BinaryToggle
                  label="Pixel Grid"
                  value={pixelGrid}
                  onChange={(next) => {
                    setPixelGrid(next);
                    window.dispatchEvent(
                      new CustomEvent("crystal:viewport-control", { detail: "grid" }),
                    );
                  }}
                />
                <BinaryToggle
                  label="Soft Orbit"
                  value={softOrbit}
                  onChange={(next) => {
                    setSoftOrbit(next);
                    window.dispatchEvent(
                      new CustomEvent("crystal:viewport-control", { detail: "camera" }),
                    );
                  }}
                />
                <BinaryToggle
                  label="Wireframe"
                  value={wireframe}
                  onChange={(next) => {
                    setWireframe(next);
                    window.dispatchEvent(
                      new CustomEvent("crystal:viewport-control", { detail: "world" }),
                    );
                  }}
                />
                <BinaryToggle
                  label="Helpers"
                  value={helpers}
                  onChange={setHelpers}
                  onLabel="Show"
                  offLabel="Hide"
                />
              </div>
            )}
          </section>

          {/* Section 4: Post-Processing (Reference Switch Row + Render Settings) */}
          <section className="ref-inspector-section">
            <div className="flex items-center justify-between">
              <span className="ref-section-heading !mb-0">Post-Processing</span>
              <button
                type="button"
                role="switch"
                aria-checked={postProcessing}
                aria-label="Toggle Post-Processing"
                onClick={() => setPostProcessing((v) => !v)}
                className={`ref-switch-pill ${postProcessing ? "is-on" : ""}`}
              >
                <span />
              </button>
            </div>

            {postProcessing && (
              <div className="mt-2.5 space-y-2 text-[12px]">
                <label className="studio-input-pill">
                  <span className="flex-1 text-[var(--studio-text-secondary)]">Resolution</span>
                  <input
                    aria-label="Render resolution"
                    value={props.renderSettings.resolution}
                    onChange={(event) =>
                      props.onRenderChange({
                        ...props.renderSettings,
                        resolution: event.target.value,
                      })
                    }
                    className="w-[100px] rounded-[6px] border border-[var(--studio-border)] bg-[var(--studio-bg-panel)] px-2 py-0.5 text-right text-[11px] text-[var(--studio-text-primary)] outline-none focus:border-[var(--studio-accent)]"
                  />
                </label>
                <label className="studio-input-pill">
                  <span className="flex-1 text-[var(--studio-text-secondary)]">Sample Count</span>
                  <input
                    aria-label="Sample count"
                    type="number"
                    min="1"
                    max="4096"
                    value={props.renderSettings.sampleCount}
                    onChange={(event) =>
                      props.onRenderChange({
                        ...props.renderSettings,
                        sampleCount: Number(event.target.value),
                      })
                    }
                    className="w-[90px] rounded-[6px] border border-[var(--studio-border)] bg-[var(--studio-bg-panel)] px-2 py-0.5 text-right text-[11px] text-[var(--studio-text-primary)] outline-none focus:border-[var(--studio-accent)]"
                  />
                </label>
                <label className="studio-input-pill">
                  <span className="flex-1 text-[var(--studio-text-secondary)]">Exposure</span>
                  <input
                    aria-label="Exposure"
                    type="number"
                    step="0.5"
                    value={props.renderSettings.exposure}
                    onChange={(event) =>
                      props.onRenderChange({
                        ...props.renderSettings,
                        exposure: Number(event.target.value),
                      })
                    }
                    className="w-[80px] rounded-[6px] border border-[var(--studio-border)] bg-[var(--studio-bg-panel)] px-2 py-0.5 text-right text-[11px] text-[var(--studio-text-primary)] outline-none focus:border-[var(--studio-accent)]"
                  />
                </label>
              </div>
            )}
          </section>

          {/* Section 5: Environment (Exact Reference Match: Light, Ambient, Fog with Gear + Yes/No) */}
          <section className="ref-inspector-section">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="ref-section-heading !mb-0">Environment</span>
              <button
                type="button"
                onClick={() => setHdriIndex((current) => (current + 1) % hdriPresets.length)}
                title="Cycle HDRI environment preset"
                className="text-[11px] font-medium text-[var(--studio-text-secondary)] transition hover:text-[var(--studio-text-primary)]"
              >
                {hdriPresets[hdriIndex]}
              </button>
            </div>
            <div className="space-y-2">
              <BinaryToggle
                label="Light"
                value={envLight}
                onChange={(next) => {
                  setEnvLight(next);
                  window.dispatchEvent(
                    new CustomEvent("crystal:viewport-control", { detail: "lighting" }),
                  );
                }}
                leadingAction={
                  <button
                    type="button"
                    aria-label="Configure Directional Light"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent("crystal:viewport-control", { detail: "lighting" }),
                      )
                    }
                    className="ref-gear-btn"
                  >
                    <Settings size={12} />
                  </button>
                }
              />
              <BinaryToggle
                label="Ambient"
                value={envAmbient}
                onChange={setEnvAmbient}
                leadingAction={
                  <button
                    type="button"
                    aria-label="Configure Ambient Light"
                    onClick={() => setHdriIndex((current) => (current + 1) % hdriPresets.length)}
                    className="ref-gear-btn"
                  >
                    <Settings size={12} />
                  </button>
                }
              />
              <BinaryToggle
                label="Fog"
                value={envFog}
                onChange={setEnvFog}
                leadingAction={
                  <button
                    type="button"
                    aria-label="Configure Scene Fog"
                    onClick={() => setEnvFog((v) => !v)}
                    className="ref-gear-btn"
                  >
                    <Settings size={12} />
                  </button>
                }
              />
            </div>
          </section>

          {/* Section 6: Export & Scene Assets (Collapsible) */}
          <section className="ref-inspector-section !border-b-0">
            <button
              type="button"
              onClick={() => setExportDeliverablesOpen((v) => !v)}
              className="ref-section-collapse-btn"
            >
              <span className="ref-section-heading !mb-0">Export & Scene Library</span>
              <ChevronDown
                size={14}
                className={`text-[var(--studio-text-secondary)] transition-transform ${
                  exportDeliverablesOpen ? "" : "-rotate-90"
                }`}
              />
            </button>

            {exportDeliverablesOpen && (
              <div className="mt-2.5 space-y-3">
                <div className="grid grid-cols-2 gap-1.5">
                  {exportOptions.map(({ label, icon: Icon }, index) => (
                    <button
                      type="button"
                      disabled={props.exporting !== null}
                      key={label}
                      onClick={() => props.onExport(label)}
                      className={`studio-export-btn ${index > 3 ? "col-span-2" : ""}`}
                    >
                      <Icon size={13.5} />
                      <span>{props.exporting === label ? "Preparing…" : label}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <SectionTitle>
                    <span className="flex items-center gap-1.5">
                      <Box size={12} className="text-[var(--studio-accent)]" /> Scene Assets
                    </span>
                  </SectionTitle>
                  <div className="grid grid-cols-2 gap-1.5">
                    {props.assets.slice(0, 6).map((asset) => {
                      const isSelected = props.selectedAssetId === asset.id;
                      return (
                        <article
                          key={asset.id}
                          draggable
                          onDragStart={(event) =>
                            event.dataTransfer.setData("text/asset-id", asset.id)
                          }
                          onClick={() => props.onSelectAsset(asset.id)}
                          className={`studio-asset-card group relative h-[86px] cursor-pointer overflow-hidden rounded-[10px] border bg-[var(--studio-bg-elevated)] transition ${
                            isSelected
                              ? "border-[var(--studio-accent)] shadow-[0_0_0_2px_rgba(37,99,235,.22)]"
                              : "border-[var(--studio-border)] hover:border-[var(--studio-border)]"
                          }`}
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${asset.thumbnail} opacity-65`}
                          />
                          <div className="crystal-mini-model absolute left-1/2 top-[40%] h-8 w-11 -translate-x-1/2 -translate-y-1/2 bg-[var(--studio-bg-panel)] shadow-md" />
                          <div className="absolute inset-x-0 bottom-0 flex items-center bg-[var(--studio-bg-panel)] px-2 py-1 text-[10px] text-[var(--studio-text-secondary)] backdrop-blur-sm">
                            <span className="truncate font-medium">{asset.name}</span>
                            <button
                              type="button"
                              aria-label={`Download ${asset.name}`}
                              title={`Export ${asset.name} as STL`}
                              onClick={(event) => {
                                event.stopPropagation();
                                props.onExport("STL File");
                              }}
                              className="ml-auto opacity-0 transition group-hover:opacity-100 hover:text-[var(--studio-accent)]"
                            >
                              <Download size={11} />
                            </button>
                            <button
                              type="button"
                              aria-label={`Delete ${asset.name}`}
                              title={`Delete ${asset.name}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                props.onDeleteAsset(asset.id);
                              }}
                              className="ml-1 opacity-0 transition group-hover:opacity-100 hover:text-red-500"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </StudioPanel>
  );
}
