"use client";

import {
  ArrowLeft,
  Box,
  ChevronDown,
  Eye,
  EyeOff,
  Folder,
  Grid2X2,
  Lightbulb,
  Lock,
  PanelLeftClose,
  Plus,
  Search,
  Sparkles,
  Unlock,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import type { MaterialName, StudioAsset, StudioMode } from "./types";
import { StudioModeNav } from "./ui";

type Props = {
  quality: string;
  topology: string;
  texture: string;
  material: MaterialName;
  prompt: string;
  loading: boolean;
  separateParts: boolean;
  imageEnhancement: boolean;
  codeExecution: boolean;
  renderLoading: boolean;
  estimatedMinutes: number;
  estimatedCost: number;
  assets: StudioAsset[];
  selectedAssetId: string | null;
  uploadedImage: string | null;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  onUpload: (file: File) => void;
  onQualityChange: (value: string) => void;
  onTopologyChange: (value: string) => void;
  onTextureChange: (value: string) => void;
  onSeparatePartsChange: (value: boolean) => void;
  onImageEnhancementChange: (value: boolean) => void;
  onCodeExecutionChange: (value: boolean) => void;
  onMaterialChange: (value: MaterialName) => void;
  onCollapse: () => void;
  onAddObject: () => void;
  onRender: () => void;
  onSignOut: () => void;
  onBack: () => void;
  onSelectAsset: (id: string) => void;
  onStudioModeChange?: (mode: StudioMode) => void;
};

const materials: MaterialName[] = [
  "Titanium",
  "Aluminum",
  "Steel",
  "Carbon Fiber",
  "Plastic",
  "Glass",
  "Rubber",
];

export function ModelingSidebar({
  quality,
  topology,
  texture,
  material,
  prompt,
  loading,
  separateParts,
  imageEnhancement,
  codeExecution,
  renderLoading,
  estimatedMinutes,
  estimatedCost,
  assets,
  selectedAssetId,
  uploadedImage,
  onPromptChange,
  onGenerate,
  onUpload,
  onQualityChange,
  onTopologyChange,
  onTextureChange,
  onSeparatePartsChange,
  onImageEnhancementChange,
  onCodeExecutionChange,
  onMaterialChange,
  onCollapse,
  onAddObject,
  onRender,
  onSignOut,
  onBack,
  onSelectAsset,
  onStudioModeChange,
}: Props) {
  const [tab, setTab] = useState<"objects" | "assets">("objects");
  const [selected, setSelected] = useState("Scene 1");
  const [query, setQuery] = useState("");
  const [locked, setLocked] = useState<Record<string, boolean>>({ "Scene 1": true });
  const [hidden, setHidden] = useState<Record<string, boolean>>({});

  const objects = [
    ["Shape 0", Box],
    ["Scene 1", Grid2X2],
    ["Particle Emitter", Sparkles],
    ["Small Particle Emitter", Sparkles],
    ["Directional Light", Lightbulb],
  ] as const;

  const filteredObjects = objects.filter(([name]) =>
    name.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(query.toLowerCase()),
  );

  const toggles = [
    { label: "Separate Parts", value: separateParts, onChange: onSeparatePartsChange },
    { label: "Image Enhancement", value: imageEnhancement, onChange: onImageEnhancementChange },
    { label: "Code execution", value: codeExecution, onChange: onCodeExecutionChange },
  ];

  return (
    <aside className="crystal-modeling-sidebar crystal-reference-left studio-sidebar-shell" aria-label="Objects panel">
      <header className="crystal-reference-project-header studio-sidebar-top">
        <button
          type="button"
          aria-label="Back to projects"
          title="Back to projects"
          onClick={onBack}
          className="studio-header-icon-btn"
        >
          <ArrowLeft size={14} />
        </button>
        <div className="studio-brand-stack">
          <b>Casynus</b>
          <small>3D Modeling Studio</small>
        </div>
        <button
          type="button"
          aria-label="Collapse panels"
          title="Collapse sidebars"
          onClick={onCollapse}
          className="studio-header-icon-btn"
        >
          <PanelLeftClose size={15} />
        </button>
      </header>

      <StudioModeNav activeStudio="modeling" onStudioModeChange={onStudioModeChange} />

      <div className="crystal-reference-tabs" role="tablist" aria-label="Scene hierarchy and assets">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "objects"}
          className={tab === "objects" ? "is-active" : ""}
          onClick={() => setTab("objects")}
        >
          <span>Objects</span>
          <em className="studio-tab-count">{objects.length}</em>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "assets"}
          className={tab === "assets" ? "is-active" : ""}
          onClick={() => setTab("assets")}
        >
          <span>Assets</span>
          <em className="studio-tab-count">{assets.length}</em>
        </button>
      </div>

      <div className="crystal-scene-title">
        <span>{tab === "objects" ? "Scene Hierarchy" : "Studio Assets"}</span>
        <div>
          <button type="button" aria-label="List view" title="Hierarchy view">
            <Grid2X2 size={13} />
          </button>
          <button type="button" aria-label="Add object" title="Duplicate / add object to scene" onClick={onAddObject}>
            <Plus size={14} />
          </button>
        </div>
      </div>

      <label className="crystal-reference-search">
        <Search size={13} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={tab === "objects" ? "Filter scene objects…" : "Filter studio assets…"}
          aria-label="Search scene objects and assets"
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

      {tab === "objects" ? (
        <div className="crystal-reference-tree" role="tree" aria-label="Scene objects">
          {filteredObjects.map(([name, Icon], index) => {
            const isSelected = selected === name;
            const isLocked = !!locked[name];
            const isHidden = !!hidden[name];
            return (
              <div
                key={name}
                role="treeitem"
                aria-selected={isSelected}
                className={`crystal-reference-tree-row ${isSelected ? "is-selected" : ""} ${
                  index > 1 ? "is-child" : ""
                } ${isHidden ? "opacity-55" : ""}`}
              >
                <button
                  type="button"
                  className="crystal-reference-tree-select"
                  onClick={() => setSelected(name)}
                  aria-pressed={isSelected}
                >
                  <ChevronDown
                    size={11}
                    className={name === "Scene 1" ? "text-zinc-400" : "opacity-0"}
                  />
                  <Icon size={13} className={isSelected ? "text-[#4A90D9]" : "text-zinc-400"} />
                  <span>{name}</span>
                </button>
                <i>
                  <button
                    type="button"
                    title={`${isLocked ? "Unlock" : "Lock"} ${name}`}
                    aria-label={`${isLocked ? "Unlock" : "Lock"} ${name}`}
                    aria-pressed={isLocked}
                    onClick={() => setLocked((value) => ({ ...value, [name]: !value[name] }))}
                  >
                    {isLocked ? <Lock size={11} /> : <Unlock size={11} />}
                  </button>
                  <button
                    type="button"
                    title={`${isHidden ? "Show" : "Hide"} ${name}`}
                    aria-label={`${isHidden ? "Show" : "Hide"} ${name}`}
                    aria-pressed={!isHidden}
                    onClick={() => setHidden((value) => ({ ...value, [name]: !value[name] }))}
                  >
                    {isHidden ? <EyeOff size={11} /> : <Eye size={11} />}
                  </button>
                </i>
              </div>
            );
          })}
          {filteredObjects.length === 0 && (
            <div className="crystal-reference-empty">
              <Folder size={16} />
              <span>No matching objects</span>
              <small>Try another filter query</small>
            </div>
          )}
        </div>
      ) : (
        <div className="crystal-reference-tree crystal-reference-asset-list">
          {filteredAssets.map((asset) => (
            <button
              type="button"
              key={asset.id}
              onClick={() => onSelectAsset(asset.id)}
              className={`crystal-reference-tree-row ${selectedAssetId === asset.id ? "is-selected" : ""}`}
            >
              <span className={`crystal-asset-dot bg-gradient-to-br ${asset.thumbnail}`} />
              <span className="truncate">{asset.name}</span>
              <small className="ml-auto text-[10px] text-zinc-500">{asset.category}</small>
            </button>
          ))}
          {filteredAssets.length === 0 && (
            <div className="crystal-reference-empty">
              <Folder size={17} />
              <span>No matching assets</span>
              <small>Try another search</small>
            </div>
          )}
        </div>
      )}

      <section className="crystal-modeling-properties">
        <h2>Properties</h2>
        <label>
          <span>Model Quality</span>
          <select value={quality} onChange={(event) => onQualityChange(event.target.value)}>
            <option>Draft</option>
            <option>Standard</option>
            <option>High</option>
            <option>Ultra</option>
          </select>
        </label>
        <label>
          <span>Material</span>
          <select
            value={material}
            onChange={(event) => onMaterialChange(event.target.value as MaterialName)}
          >
            {materials.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <h3>Topology</h3>
        <div>
          {["Auto", "Low Poly", "Topology"].map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={topology === item}
              className={topology === item ? "is-selected" : ""}
              onClick={() => onTopologyChange(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <h3>Texture</h3>
        <div>
          {["None", "Standard", "PBR"].map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={texture === item}
              className={texture === item ? "is-selected" : ""}
              onClick={() => onTextureChange(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <h3>Advanced</h3>
        {toggles.map(({ label, value, onChange }) => (
          <button
            type="button"
            key={label}
            aria-pressed={value}
            onClick={() => onChange(!value)}
            className={`crystal-property-toggle ${value ? "is-on" : ""}`}
          >
            <span>{label}</span>
            <i />
          </button>
        ))}
      </section>

      <section className="crystal-reference-generator">
        <div>
          <Sparkles size={12} />
          <span>Quick generate</span>
        </div>
        <label>
          <Upload size={13} />
          <span>{uploadedImage ? "Reference ready" : "Add reference"}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUpload(file);
              event.currentTarget.value = "";
            }}
          />
        </label>
        <textarea
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          placeholder="Describe an object..."
        />
        <button disabled={!prompt.trim() || loading} onClick={onGenerate}>
          <Sparkles size={13} />
          {loading ? "Generating" : "Generate"}
        </button>
      </section>

      <footer className="crystal-reference-footer crystal-modeling-footer">
        <a href="/pricing" className="crystal-modeling-pro-notice">
          Pro workspace: unlimited renders,
          <br />
          industrial-grade mesh export
        </a>
        <div className="crystal-modeling-render-card">
          <div>
            <strong>{estimatedMinutes} min</strong>
            <strong>
              <Zap size={12} /> {estimatedCost}
            </strong>
          </div>
          <button type="button" onClick={onRender} disabled={renderLoading}>
            {renderLoading ? "Rendering..." : "Render Queue"}
            <span>{renderLoading ? "…" : estimatedCost}</span>
          </button>
        </div>
        <div className="crystal-modeling-account">
          <span>B</span>
          <button type="button" onClick={onSignOut}>
            ↪ <small>Sign Out</small>
          </button>
        </div>
        <button
          type="button"
          aria-label="Collapse panel"
          title="Collapse panel"
          onClick={onCollapse}
          className="crystal-modeling-collapse"
        >
          <PanelLeftClose size={14} />
        </button>
      </footer>
    </aside>
  );
}
