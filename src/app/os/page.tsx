"use client";

import { useState, useRef, useEffect } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alternus AI Studio — Tools browser layout (Image #6 style)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type ThemeMode = "dark" | "light";

interface ChatMsg {
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface Cap {
  id: string;
  label: string;
  desc: string;
  icon: string;          // emoji or SVG path key
  iconColor: string;
  iconBg: string;
  category: string;
  type: "Built-in" | "Agent";
  provider: string;
}

// ── palette ─────────────────────────────────────────────────
const pal = {
  light: {
    pageBg: "#F7F8FA",
    sidebarBg: "#FFFFFF",
    mainBg: "#F7F8FA",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    cardHover: "#F9FAFB",
    border: "#E8EAEE",
    borderLight: "#F1F3F6",
    text: "#111827",
    textSec: "#4B5563",
    textMuted: "#9CA3AF",
    accent: "#2563EB",
    accentSoft: "rgba(37,99,235,0.07)",
    accentText: "#1D4ED8",
    accentBorder: "rgba(37,99,235,0.25)",
    success: "#10B981",
    successSoft: "rgba(16,185,129,0.10)",
    checkBorder: "#D1D5DB",
    checkBg: "#FFFFFF",
    checkActive: "#2563EB",
    tagBg: "#F3F4F6",
    tagText: "#6B7280",
    tagBgActive: "rgba(37,99,235,0.08)",
    tagTextActive: "#1D4ED8",
    shadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
    shadowMd: "0 4px 12px rgba(0,0,0,0.08)",
    inputBg: "#FFFFFF",
    inputBorder: "#D1D5DB",
    inputBorderFocus: "#2563EB",
    msgUserBg: "#2563EB",
    bubbleBg: "#F3F4F6",
    bubbleBorder: "#E5E7EB",
    footerBg: "#FFFFFF",
    footerBorder: "#E8EAEE",
    onlineDot: "#10B981",
  },
  dark: {
    pageBg: "#111827",
    sidebarBg: "#1F2937",
    mainBg: "#111827",
    surface: "#1F2937",
    card: "#1F2937",
    cardHover: "#263040",
    border: "#374151",
    borderLight: "#2D3748",
    text: "#F9FAFB",
    textSec: "#D1D5DB",
    textMuted: "#6B7280",
    accent: "#3B82F6",
    accentSoft: "rgba(59,130,246,0.12)",
    accentText: "#60A5FA",
    accentBorder: "rgba(59,130,246,0.30)",
    success: "#34D399",
    successSoft: "rgba(52,211,153,0.12)",
    checkBorder: "#4B5563",
    checkBg: "#1F2937",
    checkActive: "#3B82F6",
    tagBg: "#374151",
    tagText: "#9CA3AF",
    tagBgActive: "rgba(59,130,246,0.15)",
    tagTextActive: "#60A5FA",
    shadow: "0 1px 4px rgba(0,0,0,0.3)",
    shadowMd: "0 4px 14px rgba(0,0,0,0.35)",
    inputBg: "#1F2937",
    inputBorder: "#374151",
    inputBorderFocus: "#3B82F6",
    msgUserBg: "#3B82F6",
    bubbleBg: "#2D3748",
    bubbleBorder: "#374151",
    footerBg: "#1F2937",
    footerBorder: "#374151",
    onlineDot: "#34D399",
  },
};

// ── icons (SVG path strings) ─────────────────────────────────
function Ico({ d, s = 14, color }: { d: string; s?: number; color?: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke={color || "currentColor"} strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ic = {
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  close:  "M18 6L6 18M6 6l12 12",
  chevD:  "M6 9l6 6 6-6",
  send:   "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  attach: "M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48",
  mic:    "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8",
  sparkle:"M12 3v1m0 16v1m-8-9H3m18 0h1M5.6 5.6l.7.7m12.1 12.1l.7.7M5.6 18.4l.7-.7m12.1-12.1l.7-.7M12 8a4 4 0 100 8 4 4 0 000-8z",
  moon:   "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  sun:    "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 6a6 6 0 100 12 6 6 0 000-12z",
  mail:   "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  doc:    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  folder: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
  globe:  "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z",
  monitor:"M2 3h20v14H2zM8 21h8M12 17v4",
  term:   "M4 17l6-6-6-6M12 19h8",
  code:   "M16 18l6-6-6-6M8 6l-6 6 6 6",
  sun2:   "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 6a6 6 0 100 12 6 6 0 000-12z",
  image:  "M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.5 8.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM21 15l-5-5L5 21",
  wifi:   "M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01",
  cpu:    "M18 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2zM9 9h6v6H9z",
  cal:    "M3 10h18M8 2v4M16 2v4M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z",
  power:  "M18.36 6.64a9 9 0 11-12.73 0M12 2v10",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  settings:"M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z",
  person: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z",
  chat:   "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
};

// ── capabilities data ────────────────────────────────────────
const CAPS: Cap[] = [
  { id:"email",     label:"Email Assistant",  desc:"Draft, reply & manage professional emails with AI",           icon:"mail",     iconColor:"#F59E0B", iconBg:"rgba(245,158,11,0.10)",  category:"Communication", type:"Built-in", provider:"Alternus" },
  { id:"documents", label:"Documents",        desc:"Create & edit Word documents, reports and proposals",         icon:"doc",      iconColor:"#3B82F6", iconBg:"rgba(59,130,246,0.10)",  category:"Productivity",  type:"Built-in", provider:"Alternus" },
  { id:"files",     label:"File Manager",     desc:"Create, read, update & delete files in the OS file system",   icon:"folder",   iconColor:"#10B981", iconBg:"rgba(16,185,129,0.10)",  category:"System",        type:"Built-in", provider:"Alternus" },
  { id:"research",  label:"Research",         desc:"Browse the web and analyze information from multiple sources", icon:"globe",    iconColor:"#6366F1", iconBg:"rgba(99,102,241,0.10)",  category:"Productivity",  type:"Built-in", provider:"Alternus" },
  { id:"apps",      label:"App Launcher",     desc:"Launch, close and control any OS application via chat",       icon:"monitor",  iconColor:"#06B6D4", iconBg:"rgba(6,182,212,0.10)",   category:"System",        type:"Built-in", provider:"Alternus" },
  { id:"terminal",  label:"Terminal",         desc:"Run shell commands and scripts via natural language",          icon:"term",     iconColor:"#6B7280", iconBg:"rgba(107,114,128,0.10)", category:"Development",   type:"Built-in", provider:"Alternus" },
  { id:"theme",     label:"Theme Control",    desc:"Switch between dark and light mode instantly",                 icon:"sun2",     iconColor:"#F59E0B", iconBg:"rgba(245,158,11,0.10)",  category:"System",        type:"Built-in", provider:"Alternus" },
  { id:"wallpaper", label:"Wallpaper",        desc:"Change the desktop wallpaper and visual appearance",          icon:"image",    iconColor:"#EC4899", iconBg:"rgba(236,72,153,0.10)",  category:"System",        type:"Built-in", provider:"Alternus" },
  { id:"network",   label:"Network",          desc:"Check WiFi status and get connection diagnostics",            icon:"wifi",     iconColor:"#06B6D4", iconBg:"rgba(6,182,212,0.10)",   category:"System",        type:"Built-in", provider:"Alternus" },
  { id:"system",    label:"System Monitor",   desc:"View CPU, memory and real-time performance metrics",          icon:"cpu",      iconColor:"#8B5CF6", iconBg:"rgba(139,92,246,0.10)",  category:"System",        type:"Built-in", provider:"Alternus" },
  { id:"calendar",  label:"Calendar",         desc:"Schedule events, set reminders and manage appointments",      icon:"cal",      iconColor:"#8B5CF6", iconBg:"rgba(139,92,246,0.10)",  category:"Productivity",  type:"Built-in", provider:"Alternus" },
  { id:"power",     label:"Power Control",    desc:"Restart or shut down the system safely",                      icon:"power",    iconColor:"#EF4444", iconBg:"rgba(239,68,68,0.10)",   category:"System",        type:"Built-in", provider:"Alternus" },
  { id:"code",      label:"Code Editor",      desc:"Write, review and debug code with AI pair programming",       icon:"code",     iconColor:"#3B82F6", iconBg:"rgba(59,130,246,0.10)",  category:"Development",   type:"Built-in", provider:"Alternus" },
  { id:"security",  label:"Security",         desc:"Monitor access, permissions and protect sensitive data",      icon:"shield",   iconColor:"#10B981", iconBg:"rgba(16,185,129,0.10)",  category:"System",        type:"Built-in", provider:"Alternus" },
  { id:"ai",        label:"AI Assistant",     desc:"Intelligent task automation with full OS context awareness",  icon:"sparkle",  iconColor:"#8B5CF6", iconBg:"rgba(139,92,246,0.10)",  category:"Productivity",  type:"Agent",    provider:"Anthropic" },
  { id:"voice",     label:"Voice AI",         desc:"Talk to the AI using your microphone and hear responses",     icon:"mic",      iconColor:"#EF4444", iconBg:"rgba(239,68,68,0.10)",   category:"Communication", type:"Agent",    provider:"Anthropic" },
  { id:"chat",      label:"AI Chat",          desc:"Open-ended conversation with Claude Opus 4.6 model",          icon:"chat",     iconColor:"#6366F1", iconBg:"rgba(99,102,241,0.10)",  category:"Productivity",  type:"Agent",    provider:"Anthropic" },
];

const CATEGORIES = ["Communication", "Productivity", "Development", "System"];
const PROVIDERS  = ["Alternus", "Anthropic"];
const TYPES: Cap["type"][] = ["Built-in", "Agent"];

function catCount(cat: string)  { return CAPS.filter(c => c.category === cat).length; }
function provCount(p: string)   { return CAPS.filter(c => c.provider === p).length; }
function typeCount(t: string)   { return CAPS.filter(c => c.type === t).length; }

// ── small checkbox ───────────────────────────────────────────
function CB({ checked, onChange, label, count, c }: {
  checked: boolean; onChange: () => void;
  label: string; count: number; c: typeof pal.light;
}) {
  return (
    <label style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0", cursor:"pointer", userSelect:"none" }}>
      <div onClick={onChange} style={{ width:14, height:14, borderRadius:3, border:`1.5px solid ${checked ? c.checkActive : c.checkBorder}`, background: checked ? c.checkActive : c.checkBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.12s" }}>
        {checked && <svg width={8} height={8} viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <span onClick={onChange} style={{ fontSize:13, color: checked ? c.text : c.textSec, flex:1 }}>{label}</span>
      <span style={{ fontSize:11, color: checked ? c.accentText : c.textMuted, fontWeight:500 }}>{count}</span>
    </label>
  );
}

// ── capability card (horizontal, Image #6 style) ─────────────
function CapCard({ cap, onClick, c }: { cap: Cap; onClick: () => void; c: typeof pal.light }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        background: hov ? c.cardHover : c.card,
        border: `1px solid ${hov ? c.accentBorder : c.border}`,
        borderRadius: 10, padding: "14px 16px",
        textAlign: "left", cursor: "pointer",
        transition: "all 0.13s ease",
        boxShadow: hov ? c.shadowMd : c.shadow,
      }}
    >
      {/* Icon */}
      <div style={{ width:38, height:38, borderRadius:8, background:cap.iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Ico d={ic[cap.icon as keyof typeof ic]} s={18} color={cap.iconColor} />
      </div>
      {/* Text */}
      <div style={{ minWidth:0, flex:1 }}>
        <p style={{ fontSize:13, fontWeight:600, color:c.text, margin:0, marginBottom:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{cap.label}</p>
        <p style={{ fontSize:11.5, color:c.textMuted, margin:0, lineHeight:1.45, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as const, overflow:"hidden" }}>{cap.desc}</p>
        <p style={{ fontSize:10.5, color: cap.type === "Agent" ? c.accentText : c.textMuted, marginTop:6, fontWeight:500 }}>
          {cap.type}: {cap.provider}
        </p>
      </div>
    </button>
  );
}

// ── main page ────────────────────────────────────────────────
export default function AlternusOSPage() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [search, setSearch] = useState("");
  const [activeCats, setActiveCats] = useState<string[]>([]);
  const [activeProvs, setActiveProvs] = useState<string[]>([]);
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Default");
  const [showSort, setShowSort] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const c = pal[theme];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const toggleArr = (arr: string[], setArr: (v:string[])=>void, val: string) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const filtered = CAPS.filter(cap => {
    const q = search.toLowerCase();
    const matchQ = !q || cap.label.toLowerCase().includes(q) || cap.desc.toLowerCase().includes(q);
    const matchC = activeCats.length === 0 || activeCats.includes(cap.category);
    const matchP = activeProvs.length === 0 || activeProvs.includes(cap.provider);
    const matchT = activeTypes.length === 0 || activeTypes.includes(cap.type);
    return matchQ && matchC && matchP && matchT;
  });

  const sorted = [...filtered].sort((a, b) =>
    sortBy === "A–Z" ? a.label.localeCompare(b.label) :
    sortBy === "Z–A" ? b.label.localeCompare(a.label) : 0
  );

  const hasFilters = activeCats.length > 0 || activeProvs.length > 0 || activeTypes.length > 0;
  const clearAll = () => { setActiveCats([]); setActiveProvs([]); setActiveTypes([]); };

  const sendMessage = async (text?: string) => {
    const m = (text || chatInput).trim();
    if (!m || isTyping) return;
    setChatInput("");
    setMsgs(p => [...p, { role:"user", text:m, timestamp:new Date() }]);
    setIsTyping(true);
    setMsgs(p => [...p, { role:"ai", text:"", timestamp:new Date() }]);
    try {
      const history = msgs.map(msg => ({ role: msg.role === "ai" ? "assistant" as const : "user" as const, content: msg.text })).slice(-10);
      const res = await fetch("/api/os/ai", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ message:m, conversationHistory:history, osContext:{ openApps:[], theme } }),
      });
      if (!res.ok || !res.body) throw new Error();
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let full = ""; let actDone = false; let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream:true });
        if (!actDone) { const nl = buf.indexOf("\n"); if (nl !== -1) { buf = buf.slice(nl+1); actDone = true; } }
        else { full += buf; buf = ""; }
        if (full) setMsgs(p => { const cp=[...p]; cp[cp.length-1]={...cp[cp.length-1],text:full}; return cp; });
      }
    } catch {
      setMsgs(p => { const cp=[...p]; cp[cp.length-1]={...cp[cp.length-1],text:"Something went wrong. Please try again."}; return cp; });
    } finally { setIsTyping(false); }
  };

  const fmt = (d: Date) => d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:c.pageBg, color:c.text, fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", overflow:"hidden" }}>

      {/* ── top bar ── */}
      <div style={{ background:c.surface, borderBottom:`1px solid ${c.border}`, height:50, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", flexShrink:0, zIndex:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:"linear-gradient(135deg,#FF8B3E,#FF5F1F)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:10, color:"#fff" }}>AA</div>
          <span style={{ fontWeight:700, fontSize:14 }}>Alternus AI</span>
          <span style={{ fontSize:11, color:c.textMuted, display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:c.onlineDot, display:"inline-block" }} />
            All services are online
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button onClick={() => setTheme(theme==="light"?"dark":"light")} style={{ width:30, height:30, borderRadius:7, border:`1px solid ${c.border}`, background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Ico d={theme==="light"?ic.moon:ic.sun} s={13} color={c.textMuted} />
          </button>
          <button onClick={() => setChatOpen(!chatOpen)} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 13px", borderRadius:7, border:`1px solid ${chatOpen ? c.accentBorder : c.border}`, background:chatOpen?c.accentSoft:"transparent", color:chatOpen?c.accentText:c.textSec, fontSize:12, fontWeight:500, cursor:"pointer" }}>
            <Ico d={ic.chat} s={12} color={chatOpen?c.accentText:c.textSec} />
            AI Chat {msgs.filter(m=>m.role==="ai" && m.text).length > 0 && <span style={{ width:16, height:16, borderRadius:"50%", background:c.accent, color:"#fff", fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{msgs.filter(m=>m.role==="ai" && m.text).length}</span>}
          </button>
        </div>
      </div>

      {/* ── body ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* ── sidebar ── */}
        <aside style={{ width:192, background:c.sidebarBg, borderRight:`1px solid ${c.border}`, flexShrink:0, overflowY:"auto", padding:"18px 14px", display:"flex", flexDirection:"column", gap:18 }}>

          {[
            { title:"Type",     items: TYPES.map(t=>({ label:t, count:typeCount(t), checked:activeTypes.includes(t), toggle:()=>toggleArr(activeTypes,setActiveTypes,t) })) },
            { title:"Provider", items: PROVIDERS.map(p=>({ label:p, count:provCount(p), checked:activeProvs.includes(p), toggle:()=>toggleArr(activeProvs,setActiveProvs,p) })) },
            { title:"Category", items: CATEGORIES.map(cat=>({ label:cat, count:catCount(cat), checked:activeCats.includes(cat), toggle:()=>toggleArr(activeCats,setActiveCats,cat) })) },
          ].map(group => (
            <div key={group.title}>
              <p style={{ fontSize:11, fontWeight:700, color:c.textMuted, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:8 }}>{group.title}</p>
              {group.items.map(item => (
                <CB key={item.label} checked={item.checked} onChange={item.toggle} label={item.label} count={item.count} c={c} />
              ))}
            </div>
          ))}
        </aside>

        {/* ── main ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {!chatOpen ? (
            <div style={{ flex:1, overflowY:"auto", padding:"20px 24px 24px" }}>

              {/* header */}
              <div style={{ marginBottom:16 }}>
                <h1 style={{ fontSize:20, fontWeight:700, margin:0, marginBottom:14 }}>
                  Tools ({CAPS.length})
                </h1>

                {/* search + filters row */}
                <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                  {/* search */}
                  <div style={{ position:"relative", flex:"0 0 220px" }}>
                    <div style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
                      <Ico d={ic.search} s={13} color={c.textMuted} />
                    </div>
                    <input
                      value={search} onChange={e=>setSearch(e.target.value)}
                      placeholder="Search"
                      style={{ paddingLeft:30, paddingRight:28, paddingTop:7, paddingBottom:7, borderRadius:7, border:`1.5px solid ${c.inputBorder}`, background:c.inputBg, color:c.text, fontSize:13, outline:"none", width:"100%", fontFamily:"inherit" }}
                      onFocus={e=>(e.target.style.borderColor=c.inputBorderFocus)}
                      onBlur={e=>(e.target.style.borderColor=c.inputBorder)}
                    />
                    {search && <button onClick={()=>setSearch("")} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center" }}><Ico d={ic.close} s={11} color={c.textMuted} /></button>}
                  </div>

                  {/* active filter chips */}
                  {hasFilters && (
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                      {[...activeTypes,...activeProvs,...activeCats].map(f => (
                        <span key={f} style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:99, background:c.tagBgActive, color:c.tagTextActive, fontSize:11, fontWeight:500, border:`1px solid ${c.accentBorder}` }}>
                          {f}
                          <button onClick={()=>{ toggleArr(activeTypes,setActiveTypes,f); toggleArr(activeProvs,setActiveProvs,f); toggleArr(activeCats,setActiveCats,f); }} style={{ background:"none", border:"none", cursor:"pointer", padding:0, display:"flex" }}><Ico d={ic.close} s={9} color={c.accentText} /></button>
                        </span>
                      ))}
                      <button onClick={clearAll} style={{ fontSize:11, color:c.textMuted, background:"none", border:"none", cursor:"pointer", padding:"3px 4px" }}>Clear filters</button>
                    </div>
                  )}

                  {/* sort */}
                  <div style={{ marginLeft:"auto", position:"relative" }}>
                    <button onClick={()=>setShowSort(!showSort)} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:7, border:`1.5px solid ${c.inputBorder}`, background:c.inputBg, color:c.textSec, fontSize:13, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                      Sort by: {sortBy} <Ico d={ic.chevD} s={11} color={c.textMuted} />
                    </button>
                    {showSort && (
                      <div style={{ position:"absolute", top:"calc(100% + 4px)", right:0, background:c.surface, border:`1px solid ${c.border}`, borderRadius:9, boxShadow:c.shadowMd, zIndex:100, minWidth:140, padding:4 }}>
                        {["Default","A–Z","Z–A"].map(opt => (
                          <button key={opt} onClick={()=>{setSortBy(opt);setShowSort(false);}} style={{ display:"block", width:"100%", textAlign:"left", padding:"7px 12px", background:sortBy===opt?c.accentSoft:"transparent", color:sortBy===opt?c.accentText:c.textSec, fontSize:13, border:"none", cursor:"pointer", borderRadius:6, fontFamily:"inherit" }}>{opt}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* result count */}
                {(hasFilters || search) && (
                  <p style={{ fontSize:12, color:c.textMuted, marginTop:10 }}>
                    Showing {sorted.length} of {CAPS.length} capabilities
                  </p>
                )}
              </div>

              {/* capability cards grid — 3 columns horizontal (Image #6) */}
              {sorted.length > 0 ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                  {sorted.map(cap => (
                    <CapCard key={cap.id} cap={cap} c={c} onClick={() => { setChatOpen(true); sendMessage(`Help me use: ${cap.label} — ${cap.desc}`); }} />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign:"center", padding:"60px 0", color:c.textMuted }}>
                  <Ico d={ic.search} s={28} color={c.textMuted} />
                  <p style={{ marginTop:10, fontSize:14 }}>No results for &ldquo;{search}&rdquo;</p>
                </div>
              )}
            </div>

          ) : (
            /* ── chat panel ── */
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <div style={{ borderBottom:`1px solid ${c.border}`, padding:"10px 20px", background:c.surface, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <div style={{ width:30, height:30, borderRadius:7, background:"linear-gradient(135deg,#FF8B3E,#FF5F1F)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:10, color:"#fff" }}>AA</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600 }}>Alternus AI</div>
                    <div style={{ fontSize:11, color:c.textMuted, display:"flex", alignItems:"center", gap:4 }}>
                      <span style={{ width:5, height:5, borderRadius:"50%", background:c.onlineDot, display:"inline-block" }} />
                      Online · Claude Opus 4.6
                    </div>
                  </div>
                </div>
                <button onClick={()=>setChatOpen(false)} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 11px", borderRadius:7, border:`1px solid ${c.border}`, background:"transparent", color:c.textSec, fontSize:12, cursor:"pointer" }}>
                  <Ico d={ic.close} s={11} color={c.textSec} /> Close
                </button>
              </div>

              {/* messages */}
              <div style={{ flex:1, overflowY:"auto", padding:"18px 20px", display:"flex", flexDirection:"column", gap:14 }}>
                {msgs.length === 0 && (
                  <div style={{ textAlign:"center", padding:"50px 0", color:c.textMuted }}>
                    <p style={{ fontSize:14, color:c.textSec, fontWeight:500 }}>Click a capability card to start, or type a message.</p>
                  </div>
                )}
                {msgs.map((msg, i) => (
                  <div key={i} style={{ display:"flex", gap:9, flexDirection:msg.role==="user"?"row-reverse":"row", alignItems:"flex-start" }}>
                    <div style={{ width:26, height:26, borderRadius:6, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:9, color:msg.role==="ai"?"#fff":c.accentText, background:msg.role==="ai"?"linear-gradient(135deg,#FF8B3E,#FF5F1F)":c.accentSoft, border:msg.role==="user"?`1px solid ${c.border}`:"none" }}>
                      {msg.role==="ai"?"AA":"Me"}
                    </div>
                    <div style={{ maxWidth:"72%" }}>
                      <div style={{ fontSize:10, color:c.textMuted, marginBottom:3, textAlign:msg.role==="user"?"right":"left" }}>
                        {msg.role==="ai"?<span style={{ color:c.accentText, fontWeight:600 }}>Alternus AI </span>:<span>You </span>}{fmt(msg.timestamp)}
                      </div>
                      <div style={{ background:msg.role==="user"?c.msgUserBg:c.bubbleBg, border:`1px solid ${msg.role==="user"?"transparent":c.bubbleBorder}`, borderRadius:msg.role==="user"?"12px 3px 12px 12px":"3px 12px 12px 12px", padding:"9px 13px", fontSize:13, lineHeight:1.6, color:msg.role==="user"?"#fff":c.text, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
                        {msg.text||<span style={{ display:"flex", gap:3, alignItems:"center" }}>{[0,1,2].map(j=><span key={j} style={{ width:4, height:4, borderRadius:"50%", background:c.textMuted, display:"inline-block", animation:`b 1.2s ease ${j*0.2}s infinite` }}/>)}</span>}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>

              {/* input */}
              <div style={{ borderTop:`1px solid ${c.border}`, padding:"10px 16px 14px", background:c.surface }}>
                <div style={{ display:"flex", alignItems:"flex-end", gap:7, background:c.inputBg, border:`1.5px solid ${c.inputBorder}`, borderRadius:12, padding:"7px 7px 7px 12px" }}
                  onFocusCapture={e=>(e.currentTarget.style.borderColor=c.inputBorderFocus)}
                  onBlurCapture={e=>(e.currentTarget.style.borderColor=c.inputBorder)}
                >
                  <textarea
                    value={chatInput}
                    onChange={e=>{setChatInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,100)+"px";}}
                    onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}}
                    placeholder="Message Alternus AI..."
                    rows={1}
                    style={{ flex:1, resize:"none", border:"none", outline:"none", background:"transparent", color:c.text, fontSize:13, lineHeight:1.5, padding:"3px 0", fontFamily:"inherit", overflowY:"hidden", minHeight:20 }}
                  />
                  <button onClick={()=>sendMessage()} disabled={!chatInput.trim()||isTyping} style={{ width:32, height:32, borderRadius:8, border:"none", background:chatInput.trim()&&!isTyping?c.accent:c.accentSoft, color:chatInput.trim()&&!isTyping?"#fff":c.textMuted, cursor:chatInput.trim()&&!isTyping?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.13s" }}>
                    <Ico d={ic.send} s={13} color={chatInput.trim()&&!isTyping?"#fff":c.textMuted} />
                  </button>
                </div>
                <div style={{ display:"flex", gap:14, marginTop:7, paddingLeft:2 }}>
                  {[["attach","Attach"],[" mic","Voice"],["sparkle","Prompts"]].map(([k,l])=>(
                    <button key={l} style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"none", cursor:"pointer", color:c.textMuted, fontSize:11 }}>
                      <Ico d={ic[k.trim() as keyof typeof ic]} s={11} color={c.textMuted} />{l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── footer ── */}
      <div style={{ background:c.footerBg, borderTop:`1px solid ${c.footerBorder}`, height:34, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:c.success }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:c.onlineDot, display:"inline-block" }} />
          All services are online
        </div>
        <div style={{ display:"flex", gap:14 }}>
          {["About","Changelog","Terms","Privacy","Support"].map(l=>(
            <a key={l} href="#" style={{ fontSize:11, color:c.textMuted, textDecoration:"none" }}
              onMouseEnter={e=>((e.target as HTMLElement).style.color=c.accentText)}
              onMouseLeave={e=>((e.target as HTMLElement).style.color=c.textMuted)}
            >{l}</a>
          ))}
        </div>
      </div>

      <style>{`@keyframes b{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.12);border-radius:99px}textarea::placeholder,input::placeholder{color:#9CA3AF}`}</style>
    </div>
  );
}
