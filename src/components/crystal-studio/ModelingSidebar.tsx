"use client";

import { StudioPanel, StudioHeader } from "./kit";

import {
  Box,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Download,
  Eye,
  EyeOff,
  Folder,
  Grid2X2,
  Layers,
  LayoutGrid,
  Lightbulb,
  Lock,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Square,
  Unlock,
  Upload,
  Video,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
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
  const [selectedNode, setSelectedNode] = useState("Scene Objects");
  const [query, setQuery] = useState("");
  const [locked, setLocked] = useState<Record<string, boolean>>({});
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    tiles: false,
    instances: false,
    objects: true,
    subGroup: false,
  });
  const [propertiesExpanded, setPropertiesExpanded] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const toggleGroup = (key: string) =>
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(query.toLowerCase()),
  );

  const staticSceneItems = [
    { id: "node-camera", label: "Camera", icon: Video, type: "leaf" as const },
    { id: "node-tiles", label: "Tiles", icon: Layers, type: "group" as const, groupKey: "tiles" },
    {
      id: "node-instances",
      label: "Asset Instance",
      icon: Sparkles,
      type: "group" as const,
      groupKey: "instances",
      accent: "text-emerald-400",
    },
  ];

  const bottomSceneItems = [
    { id: "node-aux-mesh", label: "Reference Mesh", icon: Box },
    { id: "node-light", label: "Directional Light", icon: Lightbulb },
    { id: "node-floor", label: "Floor", icon: Square },
  ];

  const matchesQuery = (label: string) =>
    !query.trim() || label.toLowerCase().includes(query.toLowerCase());

  const toggles = [
    { label: "Separate Parts", value: separateParts, onChange: onSeparatePartsChange },
    { label: "Image Enhancement", value: imageEnhancement, onChange: onImageEnhancementChange },
    { label: "Code execution", value: codeExecution, onChange: onCodeExecutionChange },
  ];

  const activeAssetName =
    assets.find((a) => a.id === selectedAssetId)?.name ?? "Generative 3D Studio";

  return (
    <StudioPanel
      className="crystal-modeling-sidebar crystal-reference-left studio-sidebar-shell ref-floating-sidebar"
      aria-label="Objects panel"
    >
      <input
        ref={importInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUpload(file);
          event.currentTarget.value = "";
        }}
      />

      {/* Reference Top Header: Back arrow + project title + collapse menu button */}
      <StudioHeader title={activeAssetName} onBack={onBack} onCollapse={onCollapse} />

      <StudioModeNav activeStudio="modeling" onStudioModeChange={onStudioModeChange} />

      {/* Reference Search Input */}
      <label className="ref-search-box">
        <Search size={14} className="text-[var(--studio-text-secondary)]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search"
          aria-label="Search scene objects and assets"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="studio-search-clear"
          >
            <X size={12} />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Add object"
            title="Add object to scene"
            onClick={onAddObject}
            className="studio-search-clear"
          >
            <Plus size={13} />
          </button>
        )}
      </label>

      {/* Main Hierarchical Scene Tree or Asset Library */}
      {tab === "objects" ? (
        <div className="ref-hierarchy-scroll" role="tree" aria-label="Scene objects">
          <div className="ref-tree-root">
            {staticSceneItems
              .filter((item) => matchesQuery(item.label))
              .map((item) => {
                const Icon = item.icon;
                const isSelected = selectedNode === item.label;
                const isHidden = !!hidden[item.label];
                const isLocked = !!locked[item.label];
                const isExpanded = item.groupKey ? !!expandedGroups[item.groupKey] : false;

                return (
                  <div key={item.id} className="ref-tree-branch">
                    <div
                      role="treeitem"
                      aria-selected={isSelected}
                      className={`ref-tree-row ${isSelected ? "is-selected" : ""} ${
                        isHidden ? "opacity-50" : ""
                      }`}
                    >
                      {item.type === "group" && item.groupKey ? (
                        <button
                          type="button"
                          aria-label={`Toggle ${item.label}`}
                          onClick={() => toggleGroup(item.groupKey!)}
                          className="ref-tree-disclosure"
                        >
                          {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                        </button>
                      ) : (
                        <span className="ref-tree-connector" aria-hidden="true" />
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedNode(item.label)}
                        className="ref-tree-label-btn"
                      >
                        <Icon
                          size={14}
                          className={item.accent ?? (isSelected ? "text-[#1a8cff]" : "text-[var(--studio-text-secondary)]")}
                        />
                        <span>{item.label}</span>
                      </button>
                      <span className="ref-tree-actions">
                        <button
                          type="button"
                          title={`${isLocked ? "Unlock" : "Lock"} ${item.label}`}
                          aria-label={`${isLocked ? "Unlock" : "Lock"} ${item.label}`}
                          onClick={() =>
                            setLocked((v) => ({ ...v, [item.label]: !v[item.label] }))
                          }
                        >
                          {isLocked ? <Lock size={11} /> : <Unlock size={11} />}
                        </button>
                        <button
                          type="button"
                          title={`${isHidden ? "Show" : "Hide"} ${item.label}`}
                          aria-label={`${isHidden ? "Show" : "Hide"} ${item.label}`}
                          onClick={() =>
                            setHidden((v) => ({ ...v, [item.label]: !v[item.label] }))
                          }
                        >
                          {isHidden ? <EyeOff size={11} /> : <Eye size={11} />}
                        </button>
                      </span>
                    </div>
                  </div>
                );
              })}

            {/* Primary Scene Group (like "Cube" group in the reference image) */}
            <div className="ref-tree-branch">
              <div
                role="treeitem"
                aria-selected={selectedNode === "Scene Objects"}
                className={`ref-tree-row ${selectedNode === "Scene Objects" ? "is-selected" : ""}`}
              >
                <button
                  type="button"
                  aria-label="Toggle Scene Objects"
                  onClick={() => toggleGroup("objects")}
                  className="ref-tree-disclosure"
                >
                  {expandedGroups.objects ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNode("Scene Objects")}
                  className="ref-tree-label-btn"
                >
                  <Grid2X2 size={14} className="text-emerald-400" />
                  <span className="font-medium text-[var(--studio-text-primary)]">Scene Objects</span>
                </button>
                <span className="ref-tree-actions">
                  <button
                    type="button"
                    title="Add object to group"
                    aria-label="Add object to group"
                    onClick={onAddObject}
                  >
                    <Plus size={11} />
                  </button>
                </span>
              </div>

              {expandedGroups.objects && (
                <div className="ref-tree-children" role="group">
                  {filteredAssets.map((asset) => {
                    const isSelected = selectedAssetId === asset.id;
                    const isLocked = !!locked[asset.id];
                    const isHidden = !!hidden[asset.id];
                    return (
                      <div
                        key={asset.id}
                        role="treeitem"
                        aria-selected={isSelected}
                        className={`ref-tree-row is-child ${isSelected ? "is-selected" : ""} ${
                          isHidden ? "opacity-50" : ""
                        }`}
                      >
                        <span className="ref-tree-child-connector" aria-hidden="true" />
                        <button
                          type="button"
                          onClick={() => {
                            onSelectAsset(asset.id);
                            setSelectedNode(asset.name);
                          }}
                          className="ref-tree-label-btn"
                        >
                          <Box
                            size={13.5}
                            className={isSelected ? "text-[#1a8cff]" : "text-[var(--studio-text-secondary)]"}
                          />
                          <span className="truncate">{asset.name}</span>
                        </button>
                        <span className="ref-tree-actions">
                          <button
                            type="button"
                            title={`${isLocked ? "Unlock" : "Lock"} ${asset.name}`}
                            aria-label={`${isLocked ? "Unlock" : "Lock"} ${asset.name}`}
                            onClick={() =>
                              setLocked((v) => ({ ...v, [asset.id]: !v[asset.id] }))
                            }
                          >
                            {isLocked ? <Lock size={11} /> : <Unlock size={11} />}
                          </button>
                          <button
                            type="button"
                            title={`${isHidden ? "Show" : "Hide"} ${asset.name}`}
                            aria-label={`${isHidden ? "Show" : "Hide"} ${asset.name}`}
                            onClick={() =>
                              setHidden((v) => ({ ...v, [asset.id]: !v[asset.id] }))
                            }
                          >
                            {isHidden ? <EyeOff size={11} /> : <Eye size={11} />}
                          </button>
                        </span>
                      </div>
                    );
                  })}

                  {/* Sub-group node matching the reference hierarchy */}
                  <div className="ref-tree-row is-child">
                    <button
                      type="button"
                      aria-label="Toggle Component Group"
                      onClick={() => toggleGroup("subGroup")}
                      className="ref-tree-disclosure"
                    >
                      {expandedGroups.subGroup ? (
                        <ChevronDown size={11} />
                      ) : (
                        <ChevronRight size={11} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleGroup("subGroup")}
                      className="ref-tree-label-btn"
                    >
                      <Layers size={13.5} className="text-[var(--studio-text-secondary)]" />
                      <span>Group</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {bottomSceneItems
              .filter((item) => matchesQuery(item.label))
              .map((item) => {
                const Icon = item.icon;
                const isSelected = selectedNode === item.label;
                const isHidden = !!hidden[item.label];
                const isLocked = !!locked[item.label];
                return (
                  <div key={item.id} className="ref-tree-branch">
                    <div
                      role="treeitem"
                      aria-selected={isSelected}
                      className={`ref-tree-row ${isSelected ? "is-selected" : ""} ${
                        isHidden ? "opacity-50" : ""
                      }`}
                    >
                      <span className="ref-tree-connector" aria-hidden="true" />
                      <button
                        type="button"
                        onClick={() => setSelectedNode(item.label)}
                        className="ref-tree-label-btn"
                      >
                        <Icon
                          size={14}
                          className={isSelected ? "text-[#1a8cff]" : "text-[var(--studio-text-secondary)]"}
                        />
                        <span>{item.label}</span>
                      </button>
                      <span className="ref-tree-actions">
                        <button
                          type="button"
                          title={`${isLocked ? "Unlock" : "Lock"} ${item.label}`}
                          aria-label={`${isLocked ? "Unlock" : "Lock"} ${item.label}`}
                          onClick={() =>
                            setLocked((v) => ({ ...v, [item.label]: !v[item.label] }))
                          }
                        >
                          {isLocked ? <Lock size={11} /> : <Unlock size={11} />}
                        </button>
                        <button
                          type="button"
                          title={`${isHidden ? "Show" : "Hide"} ${item.label}`}
                          aria-label={`${isHidden ? "Show" : "Hide"} ${item.label}`}
                          onClick={() =>
                            setHidden((v) => ({ ...v, [item.label]: !v[item.label] }))
                          }
                        >
                          {isHidden ? <EyeOff size={11} /> : <Eye size={11} />}
                        </button>
                      </span>
                    </div>
                  </div>
                );
              })}

            {filteredAssets.length === 0 && query.trim() !== "" && (
              <div className="crystal-reference-empty">
                <Folder size={16} />
                <span>No matching objects</span>
                <small>Try another search term</small>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="ref-hierarchy-scroll">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--studio-text-secondary)]">
              Asset Library ({filteredAssets.length})
            </span>
            <button
              type="button"
              onClick={() => setTab("objects")}
              className="text-[11px] text-[#1a8cff] hover:underline"
            >
              Back to Tree
            </button>
          </div>
          <div className="space-y-1">
            {filteredAssets.map((asset) => (
              <button
                type="button"
                key={asset.id}
                onClick={() => onSelectAsset(asset.id)}
                className={`ref-tree-row w-full ${
                  selectedAssetId === asset.id ? "is-selected" : ""
                }`}
              >
                <span className={`crystal-asset-dot bg-gradient-to-br ${asset.thumbnail}`} />
                <span className="truncate text-[12px] text-[var(--studio-text-primary)]">{asset.name}</span>
                <small className="ml-auto text-[10px] text-[var(--studio-text-secondary)]">{asset.category}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Collapsible Mesh & Render Properties Drawer */}
      <div className="ref-collapsible-drawer">
        <button
          type="button"
          aria-expanded={propertiesExpanded}
          onClick={() => setPropertiesExpanded((v) => !v)}
          className="ref-drawer-trigger"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={13} className="text-[var(--studio-text-secondary)]" />
            <span>Mesh & Render Setup</span>
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-[var(--studio-text-secondary)]">
            <span>{material}</span>
            <ChevronDown
              size={13}
              className={`transition-transform ${propertiesExpanded ? "rotate-180" : ""}`}
            />
          </span>
        </button>

        {propertiesExpanded && (
          <section className="crystal-modeling-properties ref-drawer-body">
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

            <h3>Pipeline Options</h3>
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

            <div className="mt-2.5 flex items-center justify-between rounded-[8px] border border-[var(--studio-border)] bg-[var(--studio-bg-elevated)] px-2.5 py-2">
              <div className="text-[11px] text-[var(--studio-text-primary)]">
                <strong className="font-semibold text-[var(--studio-text-primary)]">{estimatedMinutes} min</strong> ·{" "}
                <span className="inline-flex items-center gap-0.5 text-[var(--studio-text-secondary)]">
                  <Zap size={11} className="text-[#1a8cff]" />
                  {estimatedCost}
                </span>
              </div>
              <button
                type="button"
                onClick={onRender}
                disabled={renderLoading}
                className="h-7 rounded-[6px] bg-[#1a8cff] px-2.5 text-[11px] font-semibold text-[var(--studio-text-primary)] transition hover:bg-[var(--studio-accent-hover)] disabled:opacity-50"
              >
                {renderLoading ? "Rendering…" : "Render Queue"}
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Hidden legacy generator kept for DOM/test compatibility */}
      <section className="crystal-reference-generator sr-only" aria-hidden="true">
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

      {/* Reference Bottom Secondary Navigation: Library, Import, Help & Feedback */}
      <footer className="ref-sidebar-footer">
        <button
          type="button"
          onClick={() => setTab((current) => (current === "assets" ? "objects" : "assets"))}
          aria-pressed={tab === "assets"}
          className={`ref-footer-nav-item ${tab === "assets" ? "is-active" : ""}`}
        >
          <LayoutGrid size={15} />
          <span>Library</span>
          <em className="ml-auto text-[11px] not-italic text-[var(--studio-text-secondary)]">{assets.length}</em>
        </button>
        <button
          type="button"
          onClick={() => importInputRef.current?.click()}
          className="ref-footer-nav-item"
        >
          <Download size={15} />
          <span>{uploadedImage ? "Reference Attached" : "Import"}</span>
        </button>
        <div className="flex items-center justify-between">
          <Link href="/help" className="ref-footer-nav-item flex-1">
            <CircleHelp size={15} />
            <span>Help & Feedback</span>
          </Link>
          <button
            type="button"
            onClick={onSignOut}
            title="Sign out"
            className="px-2 py-1 text-[11px] text-[var(--studio-text-secondary)] transition hover:text-[var(--studio-text-primary)]"
          >
            Sign out
          </button>
        </div>
      </footer>
    </StudioPanel>
  );
}
