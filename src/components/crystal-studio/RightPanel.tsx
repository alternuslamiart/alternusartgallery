"use client";

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
  PanelRightClose,
  Plus,
  Sparkles,
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
import { SectionTitle } from "./ui";

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
      <span className="flex-1 capitalize text-zinc-400">{label}</span>
      <input
        aria-label={label}
        type="text"
        value={display}
        onChange={(event) => {
          const parsed = parseFloorLength(event.target.value, settings.unit);
          if (parsed !== null)
            onChange(roundFloorValue(Math.max(min, parsed), settings.precision));
        }}
        className="w-16 rounded-[5px] border border-white/[0.08] bg-[#13161b] px-1.5 py-0.5 text-right text-zinc-100 outline-none focus:border-[#1687f7]"
      />
      <span className="ml-1 text-[10px] text-zinc-500">{settings.unit}</span>
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
  const [swatchGrid, setSwatchGrid] = useState(true);
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [frameRateOpen, setFrameRateOpen] = useState(false);
  const [activeUtility, setActiveUtility] = useState("grid");
  const [hdriIndex, setHdriIndex] = useState(0);

  const canvasOptions = ["1920x1080", "2560x1440", "3840x2160", "7680x4320"];
  const frameRateOptions = ["24 fps", "30 fps", "60 fps", "120 fps"];
  const utilities = [
    { id: "lighting", label: "Lighting", icon: Lightbulb },
    { id: "world", label: "Layers", icon: Layers3 },
    { id: "camera", label: "Camera", icon: Camera },
    { id: "grid", label: "Grid", icon: Grid2X2 },
    { id: "help", label: "Help", icon: CircleHelp },
  ];

  const selected = props.selectedFloorPlanObject;
  const floorSettings = props.floorPlanSettings ?? {
    unit: "mm",
    scale: 100,
    precision: 1,
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
    <aside
      className="crystal-right-panel studio-sidebar-shell min-h-0 overflow-y-auto scrollbar-hide"
      aria-label={props.floorPlanMode ? "Floor plan inspector" : "Studio inspector"}
    >
      {/* Top Bar / Utility Bar */}
      {!props.floorPlanMode ? (
        <div className="studio-right-top">
          <div className="crystal-utility-icons" role="group" aria-label="Viewport utilities">
            {utilities.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-label={label}
                title={label}
                aria-pressed={activeUtility === id}
                className={activeUtility === id ? "is-active" : ""}
                onClick={() => {
                  setActiveUtility(id);
                  window.dispatchEvent(
                    new CustomEvent("crystal:viewport-control", { detail: id }),
                  );
                }}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Collapse right panel"
            title="Collapse inspector"
            onClick={props.onCollapse}
            className="studio-header-icon-btn"
          >
            <PanelRightClose size={15} />
          </button>
        </div>
      ) : (
        <header className="studio-sidebar-top mb-3">
          <div className="studio-brand-stack">
            <b>Inspector</b>
            <small>2D Architectural Drafting</small>
          </div>
          <button
            type="button"
            aria-label="Collapse right panel"
            title="Collapse inspector"
            onClick={props.onCollapse}
            className="studio-header-icon-btn"
          >
            <PanelRightClose size={15} />
          </button>
        </header>
      )}

      {/* Floor Plan Mode Sections */}
      {props.floorPlanMode && (
        <section className="studio-panel-section">
          <SectionTitle
            action={
              selected ? (
                <button
                  type="button"
                  aria-label="Delete selected floor-plan object"
                  title="Delete selected element"
                  onClick={() => props.onDeleteFloorPlanObject?.(selected.id)}
                  className="studio-danger-icon-btn"
                >
                  <Trash2 size={14} />
                </button>
              ) : undefined
            }
          >
            Floor plan properties
          </SectionTitle>
          {selected ? (
            <div className="space-y-2 text-[12px]">
              <div className="studio-kv-row">
                <span>Element Type</span>
                <strong className="capitalize text-white">{selected.type}</strong>
              </div>
              {selected.type === "wall" && (
                <>
                  <div className="studio-kv-row">
                    <span>Wall Length</span>
                    <b className="text-white">
                      {formatFloorLength(
                        Math.hypot(
                          selected.end.x - selected.start.x,
                          selected.end.y - selected.start.y,
                        ),
                        floorSettings,
                      )}
                    </b>
                  </div>
                  <label className="studio-input-pill">
                    <span className="flex-1 text-zinc-400">Thickness</span>
                    <input
                      type="text"
                      value={formatFloorLength(selected.thickness, floorSettings).replace(
                        ` ${floorSettings.unit}`,
                        "",
                      )}
                      onChange={(e) => {
                        const value = parseFloorLength(
                          e.target.value,
                          floorSettings.unit,
                        );
                        if (value !== null)
                          updateSelected({
                            thickness: roundFloorValue(
                              Math.max(0.001, value),
                              floorSettings.precision,
                            ),
                          });
                      }}
                      className="w-20 rounded-[5px] border border-white/[0.08] bg-[#13161b] px-2 py-0.5 text-right text-zinc-100 outline-none focus:border-[#1687f7]"
                    />
                    <span className="ml-1 text-[10px] text-zinc-500">
                      {floorSettings.unit}
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["start", "end"] as const).map((point) => (
                      <div key={point} className="studio-coord-box">
                        <span className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500">
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
                            className="w-full rounded-[5px] border border-white/[0.08] bg-[#13161b] px-1 py-1 text-center text-[11px] text-zinc-100 outline-none focus:border-[#1687f7]"
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
                            className="w-full rounded-[5px] border border-white/[0.08] bg-[#13161b] px-1 py-1 text-center text-[11px] text-zinc-100 outline-none focus:border-[#1687f7]"
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
                    <span className="flex-1 text-zinc-400">Room Label</span>
                    <input
                      value={selected.label}
                      onChange={(e) => updateSelected({ label: e.target.value })}
                      className="w-28 rounded-[5px] border border-white/[0.08] bg-[#13161b] px-2 py-0.5 text-right text-zinc-100 outline-none focus:border-[#1687f7]"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <FloorLengthInput
                      label="width"
                      value={selected.width}
                      settings={floorSettings}
                      min={0.001}
                      onChange={(width) => updateSelected({ width })}
                    />
                    <FloorLengthInput
                      label="height"
                      value={selected.height}
                      settings={floorSettings}
                      min={0.001}
                      onChange={(height) => updateSelected({ height })}
                    />
                  </div>
                </>
              )}
              {selected.type === "text" && (
                <label className="studio-input-pill">
                  <span className="flex-1 text-zinc-400">Note Text</span>
                  <input
                    value={selected.text}
                    onChange={(e) => updateSelected({ text: e.target.value })}
                    className="w-32 rounded-[5px] border border-white/[0.08] bg-[#13161b] px-2 py-0.5 text-right text-zinc-100 outline-none focus:border-[#1687f7]"
                  />
                </label>
              )}
              {(selected.type === "door" ||
                selected.type === "window" ||
                selected.type === "furniture") && (
                <div className="grid grid-cols-2 gap-2">
                  <FloorLengthInput
                    label="width"
                    value={selected.width}
                    settings={floorSettings}
                    min={0.001}
                    onChange={(width) => updateSelected({ width })}
                  />
                  <FloorLengthInput
                    label="height"
                    value={selected.height}
                    settings={floorSettings}
                    min={0.001}
                    onChange={(height) => updateSelected({ height })}
                  />
                  {selected.type === "door" && (
                    <label className="studio-input-pill col-span-2">
                      <span className="flex-1 text-zinc-400">Door Swing</span>
                      <select
                        value={selected.swing ?? "in"}
                        onChange={(e) =>
                          updateSelected({ swing: e.target.value as "in" | "out" })
                        }
                        className="bg-transparent text-right text-zinc-100 outline-none"
                      >
                        <option value="in">Inward</option>
                        <option value="out">Outward</option>
                      </select>
                    </label>
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
                <div className="studio-kv-row">
                  <span>Measured Span</span>
                  <b className="text-white">
                    {formatFloorLength(
                      Math.hypot(
                        selected.end.x - selected.start.x,
                        selected.end.y - selected.start.y,
                      ),
                      floorSettings,
                    )}
                  </b>
                </div>
              )}
            </div>
          ) : (
            <div className="studio-empty-card">
              <MousePointer2 size={16} className="text-zinc-500" />
              <p>Select a wall, room, opening, dimension, or note on the canvas to edit its parameters.</p>
            </div>
          )}
        </section>
      )}

      {props.floorPlanMode && (
        <section className="studio-panel-section">
          <SectionTitle>Precision & Scale</SectionTitle>
          <div className="grid grid-cols-3 gap-2">
            <label className="studio-coord-box">
              <span className="block text-[10px] text-zinc-400">Unit</span>
              <select
                value={floorSettings.unit}
                onChange={(e) =>
                  updateFloorSettings({
                    unit: e.target.value as FloorPlanSettings["unit"],
                  })
                }
                className="mt-1 w-full bg-transparent font-medium text-white outline-none"
              >
                <option value="mm">mm</option>
                <option value="cm">cm</option>
                <option value="m">m</option>
              </select>
            </label>
            <label className="studio-coord-box">
              <span className="block text-[10px] text-zinc-400">Scale (1:N)</span>
              <input
                type="number"
                min="1"
                step="1"
                value={floorSettings.scale}
                onChange={(e) =>
                  updateFloorSettings({
                    scale: Math.max(1, Number(e.target.value)),
                  })
                }
                className="mt-1 w-full bg-transparent font-medium text-white outline-none"
              />
            </label>
            <label className="studio-coord-box">
              <span className="block text-[10px] text-zinc-400">Precision</span>
              <div className="mt-1 flex items-center">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={floorSettings.precision}
                  onChange={(e) =>
                    updateFloorSettings({
                      precision: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className="w-full bg-transparent font-medium text-white outline-none"
                />
                <small className="text-[10px] text-zinc-500">{floorSettings.unit}</small>
              </div>
            </label>
          </div>
          <p className="mt-2 rounded-[8px] border border-white/[0.06] bg-[#15181e] px-2.5 py-2 text-[11px] leading-relaxed text-zinc-400">
            Geometry is stored in meters; inputs and dimensions are normalized to{" "}
            <strong className="text-zinc-200">{floorSettings.unit}</strong>.
          </p>
        </section>
      )}

      {/* Output / Architectural Output Section */}
      <section className="studio-panel-section">
        <SectionTitle>
          {props.floorPlanMode ? "Architectural output" : "Output"}
        </SectionTitle>
        {props.floorPlanMode ? (
          <div className="space-y-2.5">
            <div className="studio-kv-row">
              <div>
                <span className="block font-medium text-zinc-200">Drawing Sheet</span>
                <small className="text-[11px] text-zinc-400">
                  {floorSettings.unit} · Scale 1:{floorSettings.scale} · Top view
                </small>
              </div>
              <span className="studio-badge-neutral">CAD Ready</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {floorPlanExportOptions.map(({ label, icon: Icon }) => (
                <button
                  type="button"
                  disabled={props.exporting !== null}
                  key={label}
                  onClick={() => props.onExport(label)}
                  className="studio-export-btn"
                >
                  <Icon size={14} />
                  <span>{props.exporting === label ? "Preparing..." : label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <button
                type="button"
                aria-expanded={canvasOpen}
                onClick={() => setCanvasOpen((value) => !value)}
                className="studio-select-trigger"
              >
                <span className="text-zinc-400">Canvas</span>
                <span className="ml-auto mr-2 font-medium text-zinc-100">
                  {props.resolution}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-zinc-400 transition-transform ${
                    canvasOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {canvasOpen && (
                <div className="studio-dropdown-menu">
                  {canvasOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        props.onResolutionChange(option);
                        setCanvasOpen(false);
                      }}
                      className={`studio-dropdown-item ${
                        props.resolution === option ? "is-selected" : ""
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                aria-expanded={frameRateOpen}
                onClick={() => setFrameRateOpen((value) => !value)}
                className="studio-select-trigger"
              >
                <span className="text-zinc-400">Frame rate</span>
                <span className="ml-auto mr-2 font-medium text-zinc-100">
                  {props.frameRate}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-zinc-400 transition-transform ${
                    frameRateOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {frameRateOpen && (
                <div className="studio-dropdown-menu">
                  {frameRateOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        props.onFrameRateChange(option);
                        setFrameRateOpen(false);
                      }}
                      className={`studio-dropdown-item ${
                        props.frameRate === option ? "is-selected" : ""
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 3D Modeling Specific Sections */}
      {!props.floorPlanMode && (
        <section className="studio-panel-section">
          <SectionTitle
            action={
              <div className="flex items-center gap-1.5 text-zinc-400">
                <button
                  type="button"
                  title="Toggle swatch layout"
                  aria-label="Toggle swatch layout"
                  onClick={() => setSwatchGrid((v) => !v)}
                  className="studio-mini-icon-btn"
                >
                  <Grid2X2 size={14} />
                </button>
                <label
                  title="Add custom swatch"
                  aria-label="Add custom swatch"
                  className="studio-mini-icon-btn cursor-pointer"
                >
                  <Plus size={14} />
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
            }
          >
            Color Swatches
          </SectionTitle>
          <div
            className={`mb-2.5 ${
              swatchGrid ? "flex flex-wrap" : "grid grid-cols-3"
            } gap-1.5`}
          >
            {swatches.map((x) => (
              <button
                type="button"
                aria-label={`Apply swatch ${x}`}
                title={x.toUpperCase()}
                key={x}
                onClick={() => props.onColorChange(x)}
                className={`h-6 min-w-6 rounded-[6px] border transition ${
                  props.color.toLowerCase() === x.toLowerCase()
                    ? "scale-105 border-white shadow-[0_0_0_2px_rgba(22,135,247,.5)]"
                    : "border-white/15 hover:border-white/40"
                }`}
                style={{ backgroundColor: x }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <label className="studio-input-pill flex-1">
              <input
                aria-label="Model color"
                type="color"
                value={props.color}
                onChange={(event) => props.onColorChange(event.target.value)}
                className="h-4 w-4 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span className="ml-2 font-mono text-[11px] text-zinc-200">
                {props.color.toUpperCase()}
              </span>
            </label>
            <label className="studio-input-pill w-[134px]">
              <input
                aria-label="Color opacity"
                type="range"
                min="0"
                max="100"
                value={props.opacity}
                onChange={(event) =>
                  props.onOpacityChange(Number(event.target.value))
                }
                className="mr-1.5 w-14 accent-[#1687f7]"
              />
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
                className="w-8 bg-transparent text-right text-[11px] text-zinc-100 outline-none"
              />
              <span className="text-[10px] text-zinc-500">%</span>
            </label>
          </div>
        </section>
      )}

      {!props.floorPlanMode && (
        <section className="studio-panel-section">
          <SectionTitle>Render Engine</SectionTitle>
          <div className="space-y-2 text-[12px]">
            <label className="studio-input-pill">
              <span className="flex-1 text-zinc-400">Resolution</span>
              <input
                aria-label="Render resolution"
                value={props.renderSettings.resolution}
                onChange={(event) =>
                  props.onRenderChange({
                    ...props.renderSettings,
                    resolution: event.target.value,
                  })
                }
                className="w-[108px] rounded-[5px] border border-white/[0.08] bg-[#13161b] px-2 py-0.5 text-right text-[11px] text-zinc-100 outline-none focus:border-[#1687f7]"
              />
            </label>
            <label className="studio-input-pill">
              <span className="flex-1 text-zinc-400">Sample Count</span>
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
                className="w-[108px] rounded-[5px] border border-white/[0.08] bg-[#13161b] px-2 py-0.5 text-right text-[11px] text-zinc-100 outline-none focus:border-[#1687f7]"
              />
            </label>
            <label className="studio-input-pill">
              <span className="flex-1 text-zinc-400">Exposure</span>
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
                className="w-[90px] rounded-[5px] border border-white/[0.08] bg-[#13161b] px-2 py-0.5 text-right text-[11px] text-zinc-100 outline-none focus:border-[#1687f7]"
              />
              <span className="ml-1.5 text-[10px] text-zinc-500">EV</span>
            </label>
          </div>
        </section>
      )}

      {!props.floorPlanMode && (
        <section className="studio-panel-section">
          <SectionTitle>Export Options</SectionTitle>
          <div className="grid grid-cols-2 gap-1.5">
            {exportOptions.map(({ label, icon: Icon }, index) => (
              <button
                type="button"
                disabled={props.exporting !== null}
                key={label}
                onClick={() => props.onExport(label)}
                className={`studio-export-btn ${index > 3 ? "col-span-2" : ""}`}
              >
                <Icon size={14} />
                <span>{props.exporting === label ? "Preparing..." : label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {!props.floorPlanMode && (
        <section className="studio-panel-section">
          <SectionTitle>
            <span className="flex items-center gap-1.5">
              <Box size={13} className="text-[#4A90D9]" /> Asset Library
            </span>
          </SectionTitle>
          <div className="grid grid-cols-2 gap-2">
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
                  className={`studio-asset-card group relative h-[106px] cursor-pointer overflow-hidden rounded-[9px] border bg-[#171a20] transition ${
                    isSelected
                      ? "border-[#1687f7] shadow-[0_0_0_1px_rgba(22,135,247,.4)]"
                      : "border-white/[0.07] hover:border-white/[0.18]"
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${asset.thumbnail} opacity-65`}
                  />
                  <div className="crystal-mini-model absolute left-1/2 top-[42%] h-10 w-14 -translate-x-1/2 -translate-y-1/2 bg-zinc-200/75 shadow-lg" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center bg-black/65 px-2 py-1.5 text-[10px] text-white backdrop-blur-sm">
                    <span className="truncate font-medium">{asset.name}</span>
                    <button
                      type="button"
                      aria-label={`Download ${asset.name}`}
                      title={`Export ${asset.name} as STL`}
                      onClick={(event) => {
                        event.stopPropagation();
                        props.onExport("STL File");
                      }}
                      className="ml-auto opacity-0 transition group-hover:opacity-100 hover:text-[#4A90D9]"
                    >
                      <Download size={12} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${asset.name}`}
                      title={`Delete ${asset.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        props.onDeleteAsset(asset.id);
                      }}
                      className="ml-1.5 opacity-0 transition group-hover:opacity-100 hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {!props.floorPlanMode && (
        <section className="studio-panel-section">
          <SectionTitle>Environment</SectionTitle>
          <button
            type="button"
            onClick={() => setHdriIndex((current) => (current + 1) % hdriPresets.length)}
            title="Cycle studio HDRI environment"
            className="studio-select-trigger"
          >
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Sparkles size={13} className="text-[#4A90D9]" />
              HDRI Lighting
            </span>
            <span className="ml-auto rounded-[6px] border border-white/[0.08] bg-[#14171c] px-2.5 py-1 text-[11px] font-medium text-zinc-200">
              {hdriPresets[hdriIndex]}
            </span>
          </button>
        </section>
      )}
    </aside>
  );
}
