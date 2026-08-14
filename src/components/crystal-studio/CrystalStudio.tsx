"use client";

import { Home, Menu, PanelLeftOpen, PanelRightOpen, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { generateModel } from "@/services/ai";
import { initialAssets } from "./data";
import { LeftSidebar } from "./LeftSidebar";
import { RightPanel } from "./RightPanel";
import { Timeline } from "./Timeline";
import type { MaterialName, RenderSettings, StudioAsset, StudioTool, Transform } from "./types";
import { Viewport } from "./Viewport";

function downloadFile(name: string, content: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function CrystalStudio() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [material, setMaterial] = useState<MaterialName>("Titanium");
  const [roughness, setRoughness] = useState(0.3);
  const [metallic, setMetallic] = useState(1);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<StudioTool>("orbit");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [assets, setAssets] = useState<StudioAsset[]>(initialAssets);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [resolution, setResolution] = useState("1920x1080");
  const [frameRate, setFrameRate] = useState("30 fps");
  const [color, setColor] = useState("#b47272");
  const [opacity, setOpacity] = useState(100);
  const [renderSettings, setRenderSettings] = useState<RenderSettings>({ resolution: "1920x1080", sampleCount: 512, exposure: 40.5 });
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, rotation: -8, scale: 1 });
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(240);
  const [current, setCurrent] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [alternateTheme, setAlternateTheme] = useState(false);
  const uploadUrl = useRef<string | null>(null);
  const selectedAsset = useMemo(() => assets.find((asset) => asset.id === selectedAssetId), [assets, selectedAssetId]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setCurrent((frame) => frame >= end ? start : frame + 1),
      1000 / Math.max(1, Number.parseInt(frameRate)),
    );
    return () => window.clearInterval(timer);
  }, [playing, start, end, frameRate]);

  useEffect(() => () => { if (uploadUrl.current) URL.revokeObjectURL(uploadUrl.current); }, []);

  const handleUpload = (file: File) => {
    if (uploadUrl.current) URL.revokeObjectURL(uploadUrl.current);
    uploadUrl.current = URL.createObjectURL(file);
    setUploadedImage(uploadUrl.current);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true); setProgress(8); setError(null);
    const timer = window.setInterval(() => setProgress((value) => Math.min(92, value + 7)), 120);
    try {
      const asset = await generateModel(prompt);
      setProgress(100); setAssets((items) => [asset, ...items]); setSelectedAssetId(asset.id); setTransform({ x: 0, y: 0, rotation: -8, scale: 1 }); setPrompt("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Model generation failed.");
    } finally {
      window.clearInterval(timer); window.setTimeout(() => { setLoading(false); setProgress(0); }, 250);
    }
  };

  const handleExport = (format: string) => {
    const assetName = selectedAsset?.name ?? "crystal-model";
    const slug = assetName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const metadata = { asset: assetName, material, roughness, metallic, color, opacity, resolution, frameRate, renderSettings, transform, exportedAt: new Date().toISOString() };
    if (format === "STL File") downloadFile(`${slug}.stl`, `solid ${slug}\n facet normal 0 0 1\n  outer loop\n   vertex 0 0 0\n   vertex 1 0 0\n   vertex 0 1 0\n  endloop\n endfacet\nendsolid ${slug}`);
    else if (format === "STEP File") downloadFile(`${slug}.step`, `ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('Crystal mock STEP export'),'2;1');\nENDSEC;\nDATA;\n/* ${JSON.stringify(metadata)} */\nENDSEC;\nEND-ISO-10303-21;`);
    else if (format === "G-Code") downloadFile(`${slug}.gcode`, `; Crystal generated toolpath\nG21\nG90\nG0 X0 Y0 Z5\nG1 X20 Y0 Z0 F1200\nG1 X20 Y20\nG1 X0 Y20\nG1 X0 Y0\nM30`);
    else if (format === "Parameter Sheet (PDF)") downloadFile(`${slug}-parameters.pdf`, `%PDF-1.1\n% Crystal parameter sheet\n${JSON.stringify(metadata, null, 2)}\n%%EOF`, "application/pdf");
    else downloadFile(`${slug}-simulation-log.json`, JSON.stringify({ status: "completed", frames: end - start + 1, ...metadata }, null, 2), "application/json");
  };

  return (
    <div className={`crystal-studio fixed inset-0 z-[90] grid overflow-hidden bg-[#191919] text-zinc-100 ${leftOpen ? "" : "crystal-left-closed"} ${rightOpen ? "" : "crystal-right-closed"} ${alternateTheme ? "crystal-alt-theme" : ""}`}>
      <header className="col-span-full flex h-16 items-center border-b border-[#303030] bg-[#202020] px-7">
        <div className="flex items-center gap-3"><Home size={18} /><span className="text-[16px] font-semibold">Crystal</span></div>
        <nav aria-label="Application menu" className="ml-16 flex items-center gap-9 text-[12px] text-zinc-300">{["File", "Edit", "Agent", "Help", "Layout"].map((item) => <button key={item} className="hover:text-white">{item}</button>)}</nav>
        <button className="ml-auto flex h-10 w-[124px] items-center justify-center gap-2 rounded-[11px] bg-[#1687f7] text-[12px] font-semibold text-white hover:bg-[#2d9bff]"><Zap size={19} fill="currentColor" />Upgrade</button>
      </header>

      {!leftOpen && <button aria-label="Open left panel" onClick={() => setLeftOpen(true)} className="absolute left-3 top-[76px] z-30 grid h-10 w-10 place-items-center rounded-lg bg-[#1687f7]"><PanelLeftOpen size={19} /></button>}
      {leftOpen && <LeftSidebar material={material} roughness={roughness} metallic={metallic} uploadedImage={uploadedImage} settingsOpen={settingsOpen} onMaterialChange={setMaterial} onRoughnessChange={setRoughness} onMetallicChange={setMetallic} onUpload={handleUpload} onRemoveImage={() => setUploadedImage(null)} onToggleSettings={() => setSettingsOpen((value) => !value)} onCollapse={() => setLeftOpen(false)} />}
      <Viewport selectedAsset={selectedAsset} activeTool={activeTool} prompt={prompt} loading={loading} progress={progress} error={error} transform={transform} onToolChange={(tool) => { setActiveTool(tool); if (tool === "focus") setTransform({ x: 0, y: 0, rotation: -8, scale: 1 }); }} onPromptChange={setPrompt} onGenerate={handleGenerate} onTransformChange={setTransform} onClearError={() => setError(null)} onAssetDrop={(id) => { setSelectedAssetId(id); setTransform({ x: 0, y: 0, rotation: -8, scale: 1 }); }} />
      {!rightOpen && <button aria-label="Open right panel" onClick={() => setRightOpen(true)} className="absolute right-3 top-[76px] z-30 grid h-10 w-10 place-items-center rounded-lg bg-[#1687f7]"><PanelRightOpen size={19} /></button>}
      {rightOpen && <RightPanel resolution={resolution} frameRate={frameRate} color={color} opacity={opacity} renderSettings={renderSettings} assets={assets} selectedAssetId={selectedAssetId} onResolutionChange={setResolution} onFrameRateChange={setFrameRate} onColorChange={setColor} onOpacityChange={setOpacity} onRenderChange={setRenderSettings} onSelectAsset={(id) => { setSelectedAssetId(id); setTransform({ x: 0, y: 0, rotation: -8, scale: 1 }); }} onDeleteAsset={(id) => { setAssets((items) => items.filter((item) => item.id !== id)); if (selectedAssetId === id) setSelectedAssetId(null); }} onExport={handleExport} onCollapse={() => setRightOpen(false)} />}
      <Timeline start={start} end={end} current={current} playing={playing} alternateTheme={alternateTheme} onStartChange={(value) => { setStart(value); setCurrent(Math.max(value, current)); }} onEndChange={(value) => { setEnd(Math.max(value, start + 1)); setCurrent(Math.min(value, current)); }} onCurrentChange={setCurrent} onPlayingChange={setPlaying} onThemeToggle={() => setAlternateTheme((value) => !value)} />
      <button aria-label="Mobile menu" className="absolute left-3 top-3 hidden h-10 w-10 place-items-center rounded-lg bg-[#303030] max-[700px]:grid"><Menu size={19} /></button>
    </div>
  );
}
