"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type NavId = "home" | "models" | "datasets" | "deployments" | "settings";
type ModelStatus = "active" | "training" | "idle" | "error";

interface ModelRow {
  id: string;
  name: string;
  status: ModelStatus;
  version: string;
  type: string;
  size: string;
  updated: string;
  tokens: number;
}

// ─── Sample data ─────────────────────────────────────────────────────────────
const MODELS: ModelRow[] = [
  { id: "m1", name: "Alternus Vision v2", status: "active",   version: "2.4.1", type: "Vision",      size: "7B",   updated: "2h ago",   tokens: 128000 },
  { id: "m2", name: "ArtStyle Classifier", status: "active",  version: "1.9.0", type: "Classifier",  size: "340M", updated: "5h ago",   tokens: 32000  },
  { id: "m3", name: "Palette Generator",   status: "training",version: "3.1.0", type: "Generative",  size: "1.3B", updated: "12m ago",  tokens: 64000  },
  { id: "m4", name: "Price Estimator",     status: "idle",    version: "0.8.2", type: "Regression",  size: "120M", updated: "1d ago",   tokens: 16000  },
  { id: "m5", name: "GPT-Art Tuned",       status: "active",  version: "4.0.1", type: "LLM",         size: "70B",  updated: "30m ago",  tokens: 200000 },
  { id: "m6", name: "Style Transfer Net",  status: "error",   version: "1.0.3", type: "Diffusion",   size: "2.1B", updated: "3d ago",   tokens: 8000   },
];

const SUB_NAV: Record<NavId, { group: string; items: string[] }[]> = {
  home: [
    { group: "Overview",   items: ["Dashboard", "Activity Feed", "Announcements"] },
    { group: "Quick Links",items: ["Recent Projects", "Starred", "Shared with Me"] },
  ],
  models: [
    { group: "Manage",     items: ["Explorer", "Training", "Fine-tuning", "Evaluation"] },
    { group: "Versions",   items: ["Published", "Draft", "Archived"] },
    { group: "Tools",      items: ["Benchmark", "Compare", "Export"] },
  ],
  datasets: [
    { group: "Library",    items: ["All Datasets", "Upload", "Schema Editor"] },
    { group: "Processing", items: ["Augmentation", "Labeling", "Validation"] },
  ],
  deployments: [
    { group: "Endpoints",  items: ["Active", "History", "Logs"] },
    { group: "Scaling",    items: ["Auto-Scale", "Load Balancer", "Quotas"] },
  ],
  settings: [
    { group: "Workspace",  items: ["General", "Team", "Integrations"] },
    { group: "Security",   items: ["API Keys", "Access Control", "Audit Log"] },
    { group: "Billing",    items: ["Plan", "Usage", "Invoices"] },
  ],
};

const BREADCRUMBS: Record<NavId, string[]> = {
  home:        ["Alternus AI", "Home"],
  models:      ["Alternus AI", "Models", "Explorer"],
  datasets:    ["Alternus AI", "Datasets", "Library"],
  deployments: ["Alternus AI", "Deployments", "Active"],
  settings:    ["Alternus AI", "Settings", "General"],
};

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
const Icon = {
  home:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  models:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  datasets: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  deploy:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>,
  settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  search:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  save:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  export:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  clone:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  run:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  terminal: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
  chevDown: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  chevUp:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>,
  close:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  upload:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  mic:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  star:     <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  send:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  bell:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  cpu:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  zap:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  token:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>,
  chart:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  info:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  edit:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
};

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ModelStatus }) {
  const cfg: Record<ModelStatus, { color: string; dot: string; label: string }> = {
    active:   { color: "bg-emerald-100/80 text-emerald-700", dot: "bg-emerald-500", label: "Active" },
    training: { color: "bg-blue-100/80 text-blue-700",       dot: "bg-blue-500 animate-pulse", label: "Training" },
    idle:     { color: "bg-gray-100/80 text-gray-600",        dot: "bg-gray-400", label: "Idle" },
    error:    { color: "bg-red-100/80 text-red-700",          dot: "bg-red-500", label: "Error" },
  };
  const c = cfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

// ─── Circular progress widget ─────────────────────────────────────────────────
function CircleMetric({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  const r = 28, circ = 2 * Math.PI * r;
  const dash = circ * (1 - value / 100);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
          <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round" className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-white/80">{icon}</div>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-white/90">{value}%</p>
        <p className="text-xs text-white/60">{label}</p>
      </div>
    </div>
  );
}

// ─── Tooltip wrapper ──────────────────────────────────────────────────────────
function Tip({ text, children, side = "right" }: { text: string; children: React.ReactNode; side?: "right" | "bottom" | "top" }) {
  const pos = side === "right" ? "left-full ml-2 top-1/2 -translate-y-1/2" : side === "bottom" ? "top-full mt-1 left-1/2 -translate-x-1/2" : "bottom-full mb-1 left-1/2 -translate-x-1/2";
  return (
    <div className="group relative flex items-center">
      {children}
      <div className={`pointer-events-none absolute ${pos} z-50 whitespace-nowrap rounded-lg bg-gray-900/90 px-2.5 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm`}>
        {text}
      </div>
    </div>
  );
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function BarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm opacity-80 transition-all duration-300" style={{ height: `${(v / max) * 100}%`, background: color }} />
      ))}
    </div>
  );
}

// ─── JSON inspector view ──────────────────────────────────────────────────────
function JsonView({ model }: { model: ModelRow }) {
  const json = {
    id: model.id,
    name: model.name,
    version: model.version,
    type: model.type,
    parameters: { temperature: 0.7, max_tokens: model.tokens, top_p: 0.9, frequency_penalty: 0.1 },
    metadata: { size: model.size, status: model.status, last_updated: model.updated, provider: "Alternus AI" },
  };
  const str = JSON.stringify(json, null, 2);
  return (
    <pre className="text-xs text-emerald-300 font-mono leading-relaxed overflow-auto max-h-40 whitespace-pre-wrap">
      {str.split("\n").map((line, i) => {
        const isKey = /"[^"]+":/.test(line) && !line.trim().startsWith('"');
        const isStr = line.includes(": \"");
        const isNum = /: \d/.test(line);
        return (
          <span key={i} className="block">
            <span className={isKey ? "text-blue-300" : isStr ? "text-amber-300" : isNum ? "text-purple-300" : "text-white/60"}>
              {line}
            </span>
          </span>
        );
      })}
    </pre>
  );
}

// ─── Slider control ───────────────────────────────────────────────────────────
function ParamSlider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className="text-white/90 font-medium tabular-nums">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, #a78bfa ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.15) 0)` }}
      />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function OSPage() {
  const [activeNav, setActiveNav] = useState<NavId>("models");
  const [activeSubNav, setActiveSubNav] = useState("Explorer");
  const [selectedModel, setSelectedModel] = useState<ModelRow>(MODELS[0]);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [terminalMinimized, setTerminalMinimized] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [termLines, setTermLines] = useState([
    "$ alternus-ai v3.2.0 — Production Environment",
    "→ Connected to cluster: us-east-1-prod",
    "→ GPU Pool: 8× A100 | Available: 5",
    "→ Token budget remaining: 4.2M",
    "$ _",
  ]);
  const [termInput, setTermInput] = useState("");
  const [params, setParams] = useState({ temperature: 0.7, max_tokens: 2048, top_p: 0.9, freq_penalty: 0.1 });
  const [cpuVal] = useState(67);
  const [gpuVal] = useState(82);
  const [apiData] = useState([40, 65, 55, 80, 70, 90, 75, 85, 60, 95, 78, 88]);
  const searchRef = useRef<HTMLInputElement>(null);
  const termInputRef = useRef<HTMLInputElement>(null);

  // Ctrl+K → open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  const navItems: { id: NavId; label: string; icon: React.ReactNode }[] = [
    { id: "home",        label: "Home",        icon: Icon.home     },
    { id: "models",      label: "Models",      icon: Icon.models   },
    { id: "datasets",    label: "Datasets",    icon: Icon.datasets },
    { id: "deployments", label: "Deployments", icon: Icon.deploy   },
    { id: "settings",    label: "Settings",    icon: Icon.settings },
  ];

  const handleTermCmd = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && termInput.trim()) {
      const outputs: Record<string, string[]> = {
        "help":   ["→ Available: list, status, deploy, train, export, clear"],
        "list":   ["→ m1: Alternus Vision v2 [active]", "→ m2: ArtStyle Classifier [active]", "→ m3: Palette Generator [training]"],
        "status": [`→ CPU: ${cpuVal}%  GPU: ${gpuVal}%  Memory: 54%  Uptime: 14h 22m`],
        "clear":  [],
      };
      const cmd = termInput.trim().toLowerCase();
      if (cmd === "clear") {
        setTermLines(["$ _"]);
      } else {
        const resp = outputs[cmd] ?? [`→ Unknown command: '${cmd}'. Type 'help' for available commands.`];
        setTermLines((prev) => [...prev.slice(0, -1), `$ ${termInput}`, ...resp, "$ _"]);
      }
      setTermInput("");
    }
  };

  const glassCard = "bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl";
  const glassCardDark = "bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl";

  // ── Filtered search results ──
  const searchResults = searchQuery
    ? MODELS.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.type.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="fixed inset-0 overflow-hidden select-none" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* ── Animated gradient background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-blue-500/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute -bottom-16 left-1/3 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/4 left-1/2 w-64 h-64 bg-indigo-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.7s" }} />
      </div>

      {/* ── Search modal (Ctrl+K) ── */}
      {searchOpen && (
        <div className="absolute inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 backdrop-blur-sm">
          <div className={`${glassCard} w-full max-w-xl shadow-2xl overflow-hidden`}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <span className="text-white/50">{Icon.search}</span>
              <input ref={searchRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models, datasets, deployments..." autoComplete="off"
                className="flex-1 bg-transparent text-white placeholder-white/40 text-sm outline-none" />
              <kbd className="px-2 py-0.5 rounded-md bg-white/10 text-white/50 text-xs font-mono">ESC</kbd>
            </div>
            {searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.map((m) => (
                  <button key={m.id} onClick={() => { setSelectedModel(m); setSearchOpen(false); setSearchQuery(""); setActiveNav("models"); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left">
                    <span className="text-white/40">{Icon.models}</span>
                    <div>
                      <p className="text-sm text-white/90">{m.name}</p>
                      <p className="text-xs text-white/50">{m.type} · v{m.version}</p>
                    </div>
                    <StatusBadge status={m.status} />
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <p className="px-4 py-4 text-sm text-white/40">No results for &ldquo;{searchQuery}&rdquo;</p>
            ) : (
              <div className="px-4 py-3 text-xs text-white/40 space-y-1">
                <p>↑↓ navigate · Enter to select · Esc to close</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Layout: sidebar + sub-nav + main + inspector ── */}
      <div className="absolute inset-0 flex flex-col">
        {/* Top bar */}
        <div className="flex-none flex items-center gap-3 px-4 py-2.5 border-b border-white/10 bg-black/10 backdrop-blur-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mr-4">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span className="text-white font-semibold text-sm">Alternus <span className="text-violet-300">AI</span></span>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 flex-1">
            {BREADCRUMBS[activeNav].map((crumb, i, arr) => (
              <span key={i} className="flex items-center gap-1">
                <span className={`text-xs ${i === arr.length - 1 ? "text-white/80 font-medium" : "text-white/40"}`}>{crumb}</span>
                {i < arr.length - 1 && <span className="text-white/25 text-xs">/</span>}
              </span>
            ))}
          </div>

          {/* Search shortcut */}
          <Tip text="Global search (Ctrl+K)" side="bottom">
            <button onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white/60 text-xs transition-colors">
              <span>{Icon.search}</span>
              <span>Search</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/40 font-mono text-xs">Ctrl K</kbd>
            </button>
          </Tip>

          {/* Notification + avatar */}
          <Tip text="Notifications" side="bottom">
            <button className="relative p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              {Icon.bell}
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-400" />
            </button>
          </Tip>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow">A</div>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden p-3 gap-3">
          {/* ─ Left icon sidebar ─ */}
          <div className={`flex-none w-14 flex flex-col items-center py-3 gap-1 ${glassCard}`}>
            {navItems.map(({ id, label, icon }) => (
              <Tip key={id} text={label} side="right">
                <button onClick={() => { setActiveNav(id); setActiveSubNav(SUB_NAV[id][0]?.items[0] ?? ""); }}
                  className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all ${
                    activeNav === id
                      ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30"
                      : "text-white/50 hover:text-white hover:bg-white/10"
                  }`}>
                  {icon}
                </button>
              </Tip>
            ))}
            <div className="flex-1" />
            <Tip text="Terminal" side="right">
              <button onClick={() => { setTerminalOpen(true); setTerminalMinimized(false); }}
                className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all ${terminalOpen && !terminalMinimized ? "bg-white/20 text-white" : "text-white/50 hover:text-white hover:bg-white/10"}`}>
                {Icon.terminal}
              </button>
            </Tip>
          </div>

          {/* ─ Sub-navigation panel ─ */}
          <div className={`flex-none w-48 flex flex-col py-3 ${glassCard} overflow-hidden`}>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider px-4 mb-2">{activeNav}</p>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {SUB_NAV[activeNav].map(({ group, items }) => (
                <div key={group}>
                  <p className="text-xs text-white/30 px-3 mb-1 font-medium uppercase tracking-wide">{group}</p>
                  {items.map((item) => (
                    <button key={item} onClick={() => setActiveSubNav(item)}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-sm transition-all mb-0.5 ${
                        activeSubNav === item
                          ? "bg-white/15 text-white font-medium"
                          : "text-white/55 hover:text-white hover:bg-white/8"
                      }`}>
                      {item}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* ─ Main canvas ─ */}
          <div className="flex-1 flex flex-col gap-3 min-w-0 overflow-hidden">
            {/* Action bar */}
            <div className={`flex-none flex items-center gap-2 px-4 py-2 ${glassCard}`}>
              <span className="text-white/60 text-sm font-medium mr-2">{activeSubNav}</span>
              <div className="flex-1" />
              {[
                { label: "Save",   icon: Icon.save,   tip: "Save current configuration" },
                { label: "Export", icon: Icon.export, tip: "Export as JSON or ONNX" },
                { label: "Clone",  icon: Icon.clone,  tip: "Duplicate this model" },
                { label: "Run",    icon: Icon.run,    tip: "Start inference run", primary: true },
              ].map(({ label, icon, tip, primary }) => (
                <Tip key={label} text={tip} side="bottom">
                  <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    primary
                      ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/30 hover:shadow-violet-500/50"
                      : "bg-white/10 hover:bg-white/15 text-white/70 hover:text-white border border-white/10"
                  }`}>
                    {icon}{label}
                  </button>
                </Tip>
              ))}
            </div>

            {/* Metrics row */}
            <div className="flex-none grid grid-cols-4 gap-3">
              {/* CPU */}
              <div className={`${glassCard} p-3 flex items-center gap-3`}>
                <CircleMetric label="CPU" value={cpuVal} color="#a78bfa" icon={Icon.cpu} />
                <div className="flex-1 min-w-0">
                  <BarChart data={[50, 60, 67, 55, 70, 67]} color="#a78bfa" />
                  <p className="text-xs text-white/40 mt-1">12 cores active</p>
                </div>
              </div>
              {/* GPU */}
              <div className={`${glassCard} p-3 flex items-center gap-3`}>
                <CircleMetric label="GPU" value={gpuVal} color="#60a5fa" icon={Icon.zap} />
                <div className="flex-1 min-w-0">
                  <BarChart data={[70, 75, 82, 80, 85, 82]} color="#60a5fa" />
                  <p className="text-xs text-white/40 mt-1">8× A100 SXM</p>
                </div>
              </div>
              {/* Tokens */}
              <div className={`${glassCard} p-3 flex flex-col justify-between`}>
                <div className="flex items-center gap-2 text-white/50">{Icon.token}<span className="text-xs">Token Usage</span></div>
                <div>
                  <p className="text-2xl font-bold text-white/90 tabular-nums">4.2M</p>
                  <p className="text-xs text-white/40">of 10M daily quota</p>
                  <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-pink-400" style={{ width: "42%" }} />
                  </div>
                </div>
              </div>
              {/* API Calls */}
              <div className={`${glassCard} p-3 flex flex-col justify-between`}>
                <div className="flex items-center gap-2 text-white/50">{Icon.chart}<span className="text-xs">API Calls / hr</span></div>
                <div>
                  <BarChart data={apiData} color="#34d399" />
                  <p className="text-xs text-white/40 mt-1">↑ 12% vs last hour</p>
                </div>
              </div>
            </div>

            {/* Models data table */}
            <div className={`flex-1 ${glassCard} flex flex-col overflow-hidden`}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <p className="text-sm font-semibold text-white/80">Models</p>
                <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs">{MODELS.length}</span>
                <div className="flex-1" />
                <span className="text-xs text-white/40">Click row to inspect</span>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["Name", "Status", "Version", "Type", "Context", "Updated", "Actions"].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-white/40 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MODELS.map((m, i) => (
                      <tr key={m.id} onClick={() => setSelectedModel(m)}
                        className={`border-b border-white/5 cursor-pointer transition-colors ${selectedModel.id === m.id ? "bg-white/10" : "hover:bg-white/5"} ${i % 2 === 0 ? "" : "bg-white/3"}`}>
                        <td className="px-4 py-2.5">
                          <span className="text-white/85 font-medium text-xs">{m.name}</span>
                        </td>
                        <td className="px-4 py-2.5"><StatusBadge status={m.status} /></td>
                        <td className="px-4 py-2.5"><span className="font-mono text-xs text-white/60">v{m.version}</span></td>
                        <td className="px-4 py-2.5"><span className="text-xs text-white/60">{m.type}</span></td>
                        <td className="px-4 py-2.5"><span className="font-mono text-xs text-violet-300">{(m.tokens / 1000).toFixed(0)}K</span></td>
                        <td className="px-4 py-2.5"><span className="text-xs text-white/40">{m.updated}</span></td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1">
                            <Tip text="Edit model config" side="top">
                              <button className="p-1 rounded-lg hover:bg-white/15 text-white/40 hover:text-white transition-colors">{Icon.edit}</button>
                            </Tip>
                            <Tip text="Clone model" side="top">
                              <button className="p-1 rounded-lg hover:bg-white/15 text-white/40 hover:text-white transition-colors">{Icon.clone}</button>
                            </Tip>
                            <Tip text="Delete model" side="top">
                              <button className="p-1 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors">{Icon.trash}</button>
                            </Tip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ─ Inspector panel ─ */}
          <div className={`flex-none w-64 flex flex-col gap-3 ${glassCard} overflow-hidden`}>
            {/* Header */}
            <div className="px-4 pt-4 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-white/40">{Icon.info}</span>
                <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Inspector</p>
              </div>
              <p className="text-sm font-medium text-white/90 mt-2 leading-tight">{selectedModel.name}</p>
              <div className="mt-1"><StatusBadge status={selectedModel.status} /></div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
              {/* Metadata */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wide">Metadata</p>
                {[
                  ["Type",    selectedModel.type],
                  ["Version", `v${selectedModel.version}`],
                  ["Size",    selectedModel.size],
                  ["Context", `${(selectedModel.tokens/1000).toFixed(0)}K tokens`],
                  ["Updated", selectedModel.updated],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-white/40">{k}</span>
                    <span className="text-white/80 font-medium">{v}</span>
                  </div>
                ))}
              </div>

              {/* Parameters */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wide">Parameters</p>
                <ParamSlider label="Temperature" value={params.temperature} min={0} max={2} step={0.1} onChange={(v) => setParams({ ...params, temperature: v })} />
                <ParamSlider label="Max Tokens" value={params.max_tokens} min={128} max={selectedModel.tokens} step={128} onChange={(v) => setParams({ ...params, max_tokens: v })} />
                <ParamSlider label="Top-P" value={params.top_p} min={0} max={1} step={0.05} onChange={(v) => setParams({ ...params, top_p: v })} />
                <ParamSlider label="Freq Penalty" value={params.freq_penalty} min={0} max={2} step={0.1} onChange={(v) => setParams({ ...params, freq_penalty: v })} />
              </div>

              {/* JSON config */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wide">JSON Config</p>
                <div className={`${glassCardDark} p-3 rounded-2xl`}>
                  <JsonView model={selectedModel} />
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                {["Apply Changes", "Reset to Default", "View Logs"].map((label, i) => (
                  <button key={label} className={`w-full py-2 rounded-xl text-xs font-medium transition-all ${
                    i === 0
                      ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-sm hover:shadow-violet-500/40 shadow-md"
                      : "bg-white/8 hover:bg-white/15 text-white/60 hover:text-white border border-white/10"
                  }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─ Terminal / Console ─ */}
        {terminalOpen && (
          <div className={`flex-none mx-3 mb-3 ${glassCardDark} overflow-hidden transition-all`} style={{ height: terminalMinimized ? 40 : 160 }}>
            {/* Terminal title bar */}
            <div className="flex items-center gap-2 px-4 h-10 border-b border-white/10 flex-none">
              <span className="text-white/50">{Icon.terminal}</span>
              <p className="text-xs font-medium text-white/60">Console</p>
              <span className="flex items-center gap-1 ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400/70">connected</span>
              </span>
              <div className="flex-1" />
              <Tip text={terminalMinimized ? "Expand" : "Minimize"} side="top">
                <button onClick={() => setTerminalMinimized((v) => !v)} className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                  {terminalMinimized ? Icon.chevUp : Icon.chevDown}
                </button>
              </Tip>
              <Tip text="Close terminal" side="top">
                <button onClick={() => setTerminalOpen(false)} className="p-1 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors">
                  {Icon.close}
                </button>
              </Tip>
            </div>

            {!terminalMinimized && (
              <div className="flex flex-col h-[calc(160px-40px)]">
                <div className="flex-1 overflow-y-auto px-4 py-2 font-mono text-xs space-y-0.5">
                  {termLines.map((line, i) => (
                    <p key={i} className={line.startsWith("$") ? "text-white/80" : line.startsWith("→") ? "text-emerald-400" : "text-white/50"}>
                      {line}
                    </p>
                  ))}
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 border-t border-white/5">
                  <span className="text-emerald-400 font-mono text-xs">$</span>
                  <input ref={termInputRef} value={termInput} onChange={(e) => setTermInput(e.target.value)} onKeyDown={handleTermCmd}
                    placeholder="type 'help' for commands..." autoComplete="off" spellCheck={false}
                    className="flex-1 bg-transparent text-white/80 font-mono text-xs outline-none placeholder-white/20" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─ Floating chat bar (Image 5 style) ─ */}
        <div className="flex-none flex justify-center pb-4 px-4">
          <div className="relative w-full max-w-2xl">
            {/* Gradient glow background */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/40 via-pink-400/40 to-blue-400/40 blur-xl scale-105" />
            <div className="relative flex items-center gap-2 px-2 py-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/25 shadow-2xl">
              {/* Star button */}
              <Tip text="Alternus AI — Ask anything" side="top">
                <button className="flex-none w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow">
                  {Icon.star}
                </button>
              </Tip>
              {/* Input */}
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && chatInput.trim()) { setChatInput(""); } }}
                placeholder="Ask me anything — I can help with tasks, ideas, and answers..."
                className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none px-1" />
              {/* Right actions */}
              <div className="flex items-center gap-1">
                <Tip text="Upload file or image" side="top">
                  <button className="p-2 rounded-full hover:bg-white/15 text-white/50 hover:text-white transition-colors">{Icon.upload}</button>
                </Tip>
                <Tip text="Voice input" side="top">
                  <button className="p-2 rounded-full hover:bg-white/15 text-white/50 hover:text-white transition-colors">{Icon.mic}</button>
                </Tip>
                <Tip text="Send message" side="top">
                  <button className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow">
                    {Icon.send}
                  </button>
                </Tip>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollbar style */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 99px; }
        input[type=range]::-webkit-slider-thumb { appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #a78bfa; cursor: pointer; box-shadow: 0 0 0 2px rgba(167,139,250,0.3); }
        input[type=range]::-webkit-slider-runnable-track { border-radius: 99px; height: 6px; }
        .bg-white\\/3 { background: rgba(255,255,255,0.03); }
        .bg-white\\/8 { background: rgba(255,255,255,0.08); }
      `}</style>
    </div>
  );
}
