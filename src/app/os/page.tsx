"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type ThemeMode = "dark" | "light";
interface ChatMsg { role: "user" | "ai"; text: string; timestamp: Date; }
interface Cap { id: string; label: string; desc: string; icon: string; iconColor: string; iconBg: string; category: string; type: "Built-in" | "Agent"; provider: string; }

// ── palette ──────────────────────────────────────────────────
const pal = {
  light: {
    pageBg:"#F7F8FA", sidebarBg:"#FFFFFF", surface:"#FFFFFF", card:"#FFFFFF", cardHover:"#F9FAFB",
    border:"#E8EAEE", borderLight:"#F1F3F6", text:"#111827", textSec:"#4B5563", textMuted:"#9CA3AF",
    accent:"#2563EB", accentSoft:"rgba(37,99,235,0.07)", accentText:"#1D4ED8", accentBorder:"rgba(37,99,235,0.25)",
    success:"#10B981", successSoft:"rgba(16,185,129,0.10)", danger:"#EF4444",
    checkBorder:"#D1D5DB", checkBg:"#FFFFFF", checkActive:"#2563EB",
    tagBgActive:"rgba(37,99,235,0.08)", tagTextActive:"#1D4ED8",
    shadow:"0 1px 3px rgba(0,0,0,0.06)", shadowMd:"0 4px 12px rgba(0,0,0,0.08)",
    inputBg:"#FFFFFF", inputBorder:"#D1D5DB", inputBorderFocus:"#2563EB",
    msgUserBg:"#2563EB", bubbleBg:"#F3F4F6", bubbleBorder:"#E5E7EB",
    codeBg:"#1E1E1E", codeText:"#D4D4D4", termBg:"#0D1117", termText:"#C9D1D9",
    onlineDot:"#10B981", textMutedHex:"#9CA3AF",
  },
  dark: {
    pageBg:"#111827", sidebarBg:"#1F2937", surface:"#1F2937", card:"#1F2937", cardHover:"#263040",
    border:"#374151", borderLight:"#2D3748", text:"#F9FAFB", textSec:"#D1D5DB", textMuted:"#6B7280",
    accent:"#3B82F6", accentSoft:"rgba(59,130,246,0.12)", accentText:"#60A5FA", accentBorder:"rgba(59,130,246,0.30)",
    success:"#34D399", successSoft:"rgba(52,211,153,0.12)", danger:"#F87171",
    checkBorder:"#4B5563", checkBg:"#1F2937", checkActive:"#3B82F6",
    tagBgActive:"rgba(59,130,246,0.15)", tagTextActive:"#60A5FA",
    shadow:"0 1px 4px rgba(0,0,0,0.3)", shadowMd:"0 4px 14px rgba(0,0,0,0.35)",
    inputBg:"#1F2937", inputBorder:"#374151", inputBorderFocus:"#3B82F6",
    msgUserBg:"#3B82F6", bubbleBg:"#2D3748", bubbleBorder:"#374151",
    codeBg:"#0D1117", codeText:"#C9D1D9", termBg:"#0D1117", termText:"#C9D1D9",
    onlineDot:"#34D399", textMutedHex:"#6B7280",
  },
};

function Ico({ d, s=14, color }: { d:string; s?:number; color?:string }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color||"currentColor"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;
}
const ic = {
  search:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", close:"M18 6L6 18M6 6l12 12",
  chevD:"M6 9l6 6 6-6", send:"M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  attach:"M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48",
  mic:"M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8",
  sparkle:"M12 3v1m0 16v1m-8-9H3m18 0h1M5.6 5.6l.7.7m12.1 12.1l.7.7M5.6 18.4l.7-.7m12.1-12.1l.7-.7M12 8a4 4 0 100 8 4 4 0 000-8z",
  moon:"M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z", sun:"M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 6a6 6 0 100 12 6 6 0 000-12z",
  mail:"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  doc:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  folder:"M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
  globe:"M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z",
  monitor:"M2 3h20v14H2zM8 21h8M12 17v4",
  term:"M4 17l6-6-6-6M12 19h8",
  code:"M16 18l6-6-6-6M8 6l-6 6 6 6",
  sun2:"M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 6a6 6 0 100 12 6 6 0 000-12z",
  image:"M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.5 8.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM21 15l-5-5L5 21",
  wifi:"M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01",
  cpu:"M18 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2zM9 9h6v6H9z",
  cal:"M3 10h18M8 2v4M16 2v4M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z",
  power:"M18.36 6.64a9 9 0 11-12.73 0M12 2v10",
  shield:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  settings:"M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z",
  chat:"M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  back:"M19 12H5M12 5l-7 7 7 7",
  plus:"M12 5v14M5 12h14", trash:"M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  edit:"M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  file:"M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z M13 2v7h7",
  check:"M20 6L9 17l-5-5", refresh:"M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
};

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

const CATEGORIES = ["Communication","Productivity","Development","System"];
const PROVIDERS  = ["Alternus","Anthropic"];
const TYPES: Cap["type"][] = ["Built-in","Agent"];

// ── view panel header ─────────────────────────────────────────
function PanelHeader({ cap, onBack, c }: { cap: Cap; onBack: ()=>void; c: typeof pal.light }) {
  return (
    <div style={{ borderBottom:`1px solid ${c.border}`, padding:"10px 18px", background:c.surface, display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
      <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:7, border:`1px solid ${c.border}`, background:"transparent", color:c.textSec, fontSize:12, cursor:"pointer" }}>
        <Ico d={ic.back} s={12} color={c.textSec}/> Back
      </button>
      <div style={{ width:28, height:28, borderRadius:7, background:cap.iconBg, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Ico d={ic[cap.icon as keyof typeof ic]} s={14} color={cap.iconColor}/>
      </div>
      <div>
        <p style={{ fontSize:13, fontWeight:600, margin:0 }}>{cap.label}</p>
        <p style={{ fontSize:11, color:c.textMuted, margin:0 }}>{cap.desc}</p>
      </div>
    </div>
  );
}

// ── TERMINAL VIEW ─────────────────────────────────────────────
function TerminalView({ cap, onBack, c }: { cap:Cap; onBack:()=>void; c: typeof pal.light }) {
  const [lines, setLines] = useState<{type:"cmd"|"out"|"err"; text:string}[]>([
    { type:"out", text:"Alternus OS Terminal v1.0" },
    { type:"out", text:'Type "help" for available commands.' },
    { type:"out", text:"" },
  ]);
  const [cmd, setCmd] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ endRef.current?.scrollIntoView({ behavior:"smooth" }); },[lines]);

  const run = () => {
    if (!cmd.trim()) return;
    const c2 = cmd.trim();
    setLines(p => [...p, { type:"cmd", text:`$ ${c2}` }]);
    setCmd("");
    const lower = c2.toLowerCase();
    let out = "";
    if (lower==="help") out = "Commands: help, clear, date, echo, pwd, ls, whoami, version";
    else if (lower==="clear") { setLines([]); return; }
    else if (lower==="date") out = new Date().toString();
    else if (lower==="pwd") out = "/home/alternus";
    else if (lower==="ls") out = "Documents  Downloads  Desktop  Projects  .config";
    else if (lower==="whoami") out = "alternus-user";
    else if (lower==="version") out = "Alternus OS v1.0  |  Claude Opus 4.6  |  Next.js 14";
    else if (lower.startsWith("echo ")) out = c2.slice(5);
    else out = `bash: ${c2.split(" ")[0]}: command not found`;
    setLines(p => [...p, { type: out.startsWith("bash:") ? "err" : "out", text: out }]);
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PanelHeader cap={cap} onBack={onBack} c={c}/>
      <div style={{ flex:1, background:"#0D1117", overflowY:"auto", padding:"14px 18px", fontFamily:"'Fira Code','Cascadia Code','Courier New',monospace", fontSize:13, lineHeight:1.7 }}>
        {lines.map((l,i) => (
          <div key={i} style={{ color: l.type==="cmd" ? "#79C0FF" : l.type==="err" ? "#F85149" : "#C9D1D9", whiteSpace:"pre-wrap" }}>{l.text}</div>
        ))}
        <div ref={endRef}/>
      </div>
      <div style={{ background:"#0D1117", borderTop:"1px solid #21262D", padding:"8px 14px", display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ color:"#79C0FF", fontFamily:"monospace", fontSize:13, flexShrink:0 }}>$</span>
        <input value={cmd} onChange={e=>setCmd(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") run(); }}
          placeholder="type a command..."
          style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"#C9D1D9", fontFamily:"'Fira Code','Courier New',monospace", fontSize:13 }}
          autoFocus
        />
        <button onClick={run} style={{ padding:"4px 12px", borderRadius:6, border:"none", background:"#1F6FEB", color:"#fff", fontSize:12, cursor:"pointer" }}>Run</button>
      </div>
    </div>
  );
}

// ── FILES VIEW ────────────────────────────────────────────────
function FilesView({ cap, onBack, c }: { cap:Cap; onBack:()=>void; c: typeof pal.light }) {
  const [files, setFiles] = useState([
    { name:"Budget Report Q1.docx", size:"24 KB", type:"doc", modified:"Apr 18, 2026" },
    { name:"Project Proposal.docx", size:"18 KB", type:"doc", modified:"Apr 15, 2026" },
    { name:"Meeting Notes.md",      size:"4 KB",  type:"md",  modified:"Apr 14, 2026" },
    { name:"Invoice_March.pdf",     size:"82 KB", type:"pdf", modified:"Apr 10, 2026" },
    { name:"Design System.fig",     size:"1.2 MB",type:"fig", modified:"Apr 8, 2026"  },
    { name:"API Documentation.md",  size:"12 KB", type:"md",  modified:"Apr 6, 2026"  },
    { name:"Personal Notes.txt",    size:"2 KB",  type:"txt", modified:"Apr 3, 2026"  },
  ]);
  const [sel, setSel] = useState<number|null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const typeColor: Record<string,string> = { doc:"#3B82F6", md:"#10B981", pdf:"#EF4444", fig:"#EC4899", txt:"#6B7280", default:"#9CA3AF" };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PanelHeader cap={cap} onBack={onBack} c={c}/>
      <div style={{ padding:"12px 18px 8px", borderBottom:`1px solid ${c.border}`, display:"flex", alignItems:"center", gap:8, flexShrink:0, background:c.surface }}>
        <span style={{ fontSize:13, fontWeight:600 }}>Documents</span>
        <span style={{ fontSize:11, color:c.textMuted }}>({files.length} files)</span>
        <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
          <button onClick={()=>setCreating(true)} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:7, border:`1px solid ${c.border}`, background:"transparent", fontSize:12, color:c.textSec, cursor:"pointer" }}>
            <Ico d={ic.plus} s={11} color={c.textSec}/> New File
          </button>
        </div>
      </div>
      {creating && (
        <div style={{ padding:"10px 18px", borderBottom:`1px solid ${c.border}`, display:"flex", gap:8, background:c.accentSoft }}>
          <input value={newName} onChange={e=>setNewName(e.target.value)}
            placeholder="filename.txt"
            onKeyDown={e=>{ if(e.key==="Enter" && newName.trim()) { setFiles(p=>[...p, { name:newName.trim(), size:"0 KB", type:newName.split(".").pop()||"txt", modified:"Just now" }]); setNewName(""); setCreating(false); } if(e.key==="Escape") setCreating(false); }}
            style={{ flex:1, padding:"5px 10px", borderRadius:6, border:`1px solid ${c.inputBorder}`, background:c.inputBg, color:c.text, fontSize:12, outline:"none", fontFamily:"inherit" }}
            autoFocus
          />
          <button onClick={()=>{ if(newName.trim()) { setFiles(p=>[...p, { name:newName.trim(), size:"0 KB", type:newName.split(".").pop()||"txt", modified:"Just now" }]); setNewName(""); setCreating(false); }}} style={{ padding:"5px 12px", borderRadius:6, border:"none", background:c.accent, color:"#fff", fontSize:12, cursor:"pointer" }}>Create</button>
          <button onClick={()=>setCreating(false)} style={{ padding:"5px 10px", borderRadius:6, border:`1px solid ${c.border}`, background:"transparent", fontSize:12, cursor:"pointer", color:c.textSec }}>Cancel</button>
        </div>
      )}
      <div style={{ flex:1, overflowY:"auto" }}>
        {files.map((f,i) => (
          <div key={i} onClick={()=>setSel(sel===i?null:i)}
            style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 18px", borderBottom:`1px solid ${c.borderLight}`, cursor:"pointer", background: sel===i ? c.accentSoft : "transparent", transition:"background 0.1s" }}
          >
            <div style={{ width:32, height:32, borderRadius:7, background:`${typeColor[f.type]||typeColor.default}15`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ico d={ic.file} s={14} color={typeColor[f.type]||typeColor.default}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:500, margin:0, color: sel===i ? c.accentText : c.text }}>{f.name}</p>
              <p style={{ fontSize:11, color:c.textMuted, margin:0 }}>{f.size} · {f.modified}</p>
            </div>
            {sel===i && (
              <div style={{ display:"flex", gap:6 }}>
                <button style={{ padding:"3px 8px", borderRadius:5, border:`1px solid ${c.border}`, background:"transparent", fontSize:11, cursor:"pointer", color:c.textSec }}>Open</button>
                <button onClick={e=>{ e.stopPropagation(); setFiles(p=>p.filter((_,j)=>j!==i)); setSel(null); }} style={{ padding:"3px 8px", borderRadius:5, border:`1px solid ${c.danger}20`, background:"transparent", fontSize:11, cursor:"pointer", color:c.danger }}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CODE EDITOR VIEW ──────────────────────────────────────────
function CodeView({ cap, onBack, c }: { cap:Cap; onBack:()=>void; c: typeof pal.light }) {
  const [code, setCode] = useState(`// Alternus Code Editor
// Start writing your code here

function greet(name: string): string {
  return \`Hello, \${name}! Welcome to Alternus OS.\`;
}

const message = greet("World");
console.log(message);
`);
  const [lang, setLang] = useState("TypeScript");
  const [output, setOutput] = useState("");

  const run = () => {
    try {
      const lines = code.split("\n").filter(l=>!l.trim().startsWith("//") && l.trim()).length;
      setOutput(`✓ Code analyzed — ${lines} executable lines\n⚡ Runtime: TypeScript/Node.js\n✓ No syntax errors detected`);
    } catch(e) { setOutput(`Error: ${e}`); }
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PanelHeader cap={cap} onBack={onBack} c={c}/>
      <div style={{ padding:"8px 14px", borderBottom:`1px solid ${c.border}`, display:"flex", alignItems:"center", gap:8, background:c.surface, flexShrink:0 }}>
        {["TypeScript","JavaScript","Python","HTML"].map(l=>(
          <button key={l} onClick={()=>setLang(l)} style={{ padding:"3px 10px", borderRadius:99, border:`1px solid ${lang===l ? c.accent : c.border}`, background:lang===l ? c.accentSoft : "transparent", color:lang===l ? c.accentText : c.textMuted, fontSize:11, cursor:"pointer" }}>{l}</button>
        ))}
        <button onClick={run} style={{ marginLeft:"auto", padding:"5px 14px", borderRadius:7, border:"none", background:c.accent, color:"#fff", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
          ▶ Run
        </button>
      </div>
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        <textarea value={code} onChange={e=>setCode(e.target.value)}
          style={{ flex:1, background:"#1E1E1E", color:"#D4D4D4", border:"none", outline:"none", padding:"14px 16px", fontFamily:"'Fira Code','Cascadia Code','Courier New',monospace", fontSize:13, lineHeight:1.7, resize:"none", overflowY:"auto" }}
          spellCheck={false}
        />
        {output && (
          <div style={{ width:240, background:"#0D1117", borderLeft:"1px solid #21262D", padding:"12px 14px", overflowY:"auto" }}>
            <p style={{ fontSize:11, color:"#79C0FF", fontWeight:600, marginBottom:8 }}>OUTPUT</p>
            <pre style={{ fontSize:12, color:"#C9D1D9", whiteSpace:"pre-wrap", lineHeight:1.6, fontFamily:"monospace" }}>{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ── EMAIL VIEW ────────────────────────────────────────────────
function EmailView({ cap, onBack, c }: { cap:Cap; onBack:()=>void; c: typeof pal.light }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  const inp = { padding:"7px 10px", borderRadius:7, border:`1px solid ${c.inputBorder}`, background:c.inputBg, color:c.text, fontSize:13, outline:"none", width:"100%", fontFamily:"inherit" };

  if (sent) return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PanelHeader cap={cap} onBack={onBack} c={c}/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
        <div style={{ width:52, height:52, borderRadius:"50%", background:c.successSoft, display:"flex", alignItems:"center", justifyContent:"center" }}><Ico d={ic.check} s={24} color={c.success}/></div>
        <p style={{ fontSize:15, fontWeight:600 }}>Email Sent!</p>
        <p style={{ fontSize:13, color:c.textMuted }}>To: {to}</p>
        <button onClick={()=>{ setSent(false); setTo(""); setSubject(""); setBody(""); }} style={{ padding:"7px 18px", borderRadius:8, border:"none", background:c.accent, color:"#fff", fontSize:13, cursor:"pointer" }}>Compose New</button>
      </div>
    </div>
  );

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PanelHeader cap={cap} onBack={onBack} c={c}/>
      <div style={{ flex:1, overflowY:"auto", padding:"18px" }}>
        <div style={{ maxWidth:600, display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <label style={{ fontSize:12, color:c.textMuted, fontWeight:500 }}>To</label>
            <input value={to} onChange={e=>setTo(e.target.value)} placeholder="recipient@email.com" style={inp} onFocus={e=>(e.target.style.borderColor=c.inputBorderFocus)} onBlur={e=>(e.target.style.borderColor=c.inputBorder)}/>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <label style={{ fontSize:12, color:c.textMuted, fontWeight:500 }}>Subject</label>
            <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Email subject" style={inp} onFocus={e=>(e.target.style.borderColor=c.inputBorderFocus)} onBlur={e=>(e.target.style.borderColor=c.inputBorder)}/>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <label style={{ fontSize:12, color:c.textMuted, fontWeight:500 }}>Message</label>
            <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Write your message..." rows={10} style={{ ...inp, resize:"vertical", lineHeight:1.6, minHeight:200 }} onFocus={e=>(e.target.style.borderColor=c.inputBorderFocus)} onBlur={e=>(e.target.style.borderColor=c.inputBorder)}/>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>{ if(to && subject && body) setSent(true); }} disabled={!to||!subject||!body} style={{ padding:"8px 20px", borderRadius:8, border:"none", background:to&&subject&&body?c.accent:c.accentSoft, color:to&&subject&&body?"#fff":c.textMuted, fontSize:13, cursor:to&&subject&&body?"pointer":"default", display:"flex", alignItems:"center", gap:6 }}>
              <Ico d={ic.send} s={13} color={to&&subject&&body?"#fff":c.textMuted}/> Send Email
            </button>
            <button onClick={()=>{ setTo(""); setSubject(""); setBody(""); }} style={{ padding:"8px 14px", borderRadius:8, border:`1px solid ${c.border}`, background:"transparent", color:c.textSec, fontSize:13, cursor:"pointer" }}>Clear</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SYSTEM MONITOR VIEW ───────────────────────────────────────
function SystemView({ cap, onBack, c }: { cap:Cap; onBack:()=>void; c: typeof pal.light }) {
  const [cpu, setCpu] = useState(Math.floor(Math.random()*30)+5);
  const [mem, setMem] = useState(Math.floor(Math.random()*40)+30);
  const [disk, setDisk] = useState(67);

  useEffect(()=>{
    const t = setInterval(()=>{
      setCpu(Math.floor(Math.random()*35)+5);
      setMem(Math.floor(Math.random()*20)+40);
    }, 2000);
    return ()=>clearInterval(t);
  },[]);

  const Bar = ({ val, color }: { val:number; color:string }) => (
    <div style={{ height:8, borderRadius:99, background:c.borderLight, overflow:"hidden", marginTop:6 }}>
      <div style={{ height:"100%", width:`${val}%`, background:color, borderRadius:99, transition:"width 0.5s ease" }}/>
    </div>
  );

  const stats = [
    { label:"CPU Usage", val:cpu, color: cpu>70?"#EF4444":"#3B82F6", unit:"%", sub:`${cpu < 30 ? "Low" : cpu < 70 ? "Normal" : "High"} load` },
    { label:"Memory", val:mem, color: mem>80?"#EF4444":"#10B981", unit:"%", sub:`${Math.round(mem*16/100*10)/10} GB / 16 GB` },
    { label:"Disk Usage", val:disk, color:"#8B5CF6", unit:"%", sub:"320 GB / 512 GB" },
  ];

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PanelHeader cap={cap} onBack={onBack} c={c}/>
      <div style={{ flex:1, overflowY:"auto", padding:"18px" }}>
        <div style={{ maxWidth:500, display:"flex", flexDirection:"column", gap:14 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:12, padding:"14px 16px", boxShadow:c.shadow }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                <span style={{ fontSize:13, fontWeight:500, color:c.textSec }}>{s.label}</span>
                <span style={{ fontSize:20, fontWeight:700, color:s.color }}>{s.val}{s.unit}</span>
              </div>
              <Bar val={s.val} color={s.color}/>
              <p style={{ fontSize:11, color:c.textMuted, marginTop:4 }}>{s.sub}</p>
            </div>
          ))}
          <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:12, padding:"14px 16px", boxShadow:c.shadow }}>
            <p style={{ fontSize:13, fontWeight:500, color:c.textSec, marginBottom:8 }}>System Info</p>
            {[["OS","Alternus OS v1.0"],["Node","v20.11.0"],["Browser","Next.js 14 Runtime"],["Uptime","2h 34m"],["Model","Claude Opus 4.6"]].map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:`1px solid ${c.borderLight}` }}>
                <span style={{ fontSize:12, color:c.textMuted }}>{k}</span>
                <span style={{ fontSize:12, color:c.text, fontWeight:500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CALENDAR VIEW ─────────────────────────────────────────────
function CalendarView({ cap, onBack, c }: { cap:Cap; onBack:()=>void; c: typeof pal.light }) {
  const today = new Date(2026, 3, 18);
  const [currentDate] = useState(today);
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const events: Record<number,{label:string;color:string}[]> = {
    18:[{label:"Team Sync",color:"#3B82F6"},{label:"Design Review",color:"#10B981"}],
    20:[{label:"Sprint Planning",color:"#8B5CF6"}],
    22:[{label:"Client Demo",color:"#F59E0B"}],
    25:[{label:"All Hands",color:"#EF4444"}],
  };

  const cells = Array(firstDay).fill(null).concat(Array.from({length:daysInMonth},(_,i)=>i+1));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PanelHeader cap={cap} onBack={onBack} c={c}/>
      <div style={{ flex:1, overflowY:"auto", padding:"18px" }}>
        <div style={{ maxWidth:540 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <h2 style={{ fontSize:17, fontWeight:700 }}>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
            {days.map(d=>(
              <div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:600, color:c.textMuted, padding:"6px 0" }}>{d}</div>
            ))}
            {cells.map((day,i)=>(
              <div key={i} style={{ minHeight:60, background: day===today.getDate() ? c.accentSoft : day ? c.card : "transparent", border: day ? `1px solid ${day===today.getDate() ? c.accentBorder : c.border}` : "none", borderRadius:8, padding:"4px 6px", position:"relative" }}>
                {day && <>
                  <span style={{ fontSize:12, fontWeight: day===today.getDate() ? 700 : 400, color: day===today.getDate() ? c.accentText : c.text }}>{day}</span>
                  <div style={{ marginTop:2, display:"flex", flexDirection:"column", gap:1 }}>
                    {(events[day]||[]).map((ev,j)=>(
                      <span key={j} style={{ fontSize:9, padding:"1px 4px", borderRadius:3, background:`${ev.color}20`, color:ev.color, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ev.label}</span>
                    ))}
                  </div>
                </>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── THEME VIEW ────────────────────────────────────────────────
function ThemeView({ cap, onBack, c, theme, setTheme }: { cap:Cap; onBack:()=>void; c: typeof pal.light; theme:ThemeMode; setTheme:(t:ThemeMode)=>void }) {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PanelHeader cap={cap} onBack={onBack} c={c}/>
      <div style={{ flex:1, overflowY:"auto", padding:"24px 18px" }}>
        <p style={{ fontSize:13, color:c.textMuted, marginBottom:18 }}>Choose your preferred appearance</p>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
          {(["light","dark"] as ThemeMode[]).map(t=>(
            <button key={t} onClick={()=>setTheme(t)}
              style={{ width:160, borderRadius:14, border:`2px solid ${theme===t?c.accent:c.border}`, background:"transparent", cursor:"pointer", overflow:"hidden", padding:0, transition:"all 0.15s", boxShadow:theme===t?c.shadowMd:c.shadow }}
            >
              <div style={{ height:80, background:t==="light"?"#F7F8FA":"#111827", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Ico d={t==="light"?ic.sun:ic.moon} s={28} color={t==="light"?"#F59E0B":"#8B5CF6"}/>
              </div>
              <div style={{ padding:"8px 12px", background:c.card, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:13, fontWeight:600, textTransform:"capitalize" }}>{t}</span>
                {theme===t && <Ico d={ic.check} s={14} color={c.accent}/>}
              </div>
            </button>
          ))}
        </div>
        <p style={{ fontSize:12, color:c.textMuted, marginTop:20 }}>
          Current mode: <strong style={{ color:c.text, textTransform:"capitalize" }}>{theme}</strong>
        </p>
      </div>
    </div>
  );
}

// ── AI CHAT VIEW ──────────────────────────────────────────────
function ChatView({ cap, onBack, c, theme }: { cap:Cap; onBack:()=>void; c: typeof pal.light; theme:ThemeMode }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ endRef.current?.scrollIntoView({ behavior:"smooth" }); },[msgs]);

  const send = async (text?: string) => {
    const m = (text||input).trim();
    if (!m||isTyping) return;
    setInput("");
    setMsgs(p=>[...p,{ role:"user", text:m, timestamp:new Date() }]);
    setIsTyping(true);
    setMsgs(p=>[...p,{ role:"ai", text:"", timestamp:new Date() }]);
    try {
      const history = msgs.map(msg=>({ role:msg.role==="ai"?"assistant" as const:"user" as const, content:msg.text })).slice(-10);
      const res = await fetch("/api/os/ai",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ message:m, conversationHistory:history, osContext:{ openApps:[], theme } }) });
      if (!res.ok||!res.body) throw new Error();
      const reader = res.body.getReader(); const dec = new TextDecoder();
      let full=""; let actDone=false; let buf="";
      while(true) {
        const { done, value } = await reader.read(); if(done) break;
        buf += dec.decode(value,{ stream:true });
        if(!actDone){ const nl=buf.indexOf("\n"); if(nl!==-1){ buf=buf.slice(nl+1); actDone=true; } }
        else { full+=buf; buf=""; }
        if(full) setMsgs(p=>{ const cp=[...p]; cp[cp.length-1]={...cp[cp.length-1],text:full}; return cp; });
      }
    } catch { setMsgs(p=>{ const cp=[...p]; cp[cp.length-1]={...cp[cp.length-1],text:"Something went wrong."}; return cp; }); }
    finally { setIsTyping(false); }
  };

  const fmt = (d:Date) => d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PanelHeader cap={cap} onBack={onBack} c={c}/>
      <div style={{ flex:1, overflowY:"auto", padding:"16px 18px", display:"flex", flexDirection:"column", gap:12 }}>
        {msgs.length===0 && (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <div style={{ width:42, height:42, borderRadius:11, background:"linear-gradient(135deg,#FF8B3E,#FF5F1F)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px", fontWeight:800, fontSize:13, color:"#fff" }}>AA</div>
            <p style={{ fontSize:14, fontWeight:500, color:c.textSec }}>Alternus AI — {cap.label}</p>
            <p style={{ fontSize:12, color:c.textMuted, marginTop:4 }}>{cap.desc}</p>
          </div>
        )}
        {msgs.map((msg,i)=>(
          <div key={i} style={{ display:"flex", gap:8, flexDirection:msg.role==="user"?"row-reverse":"row", alignItems:"flex-start" }}>
            <div style={{ width:26, height:26, borderRadius:6, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:9, color:msg.role==="ai"?"#fff":c.accentText, background:msg.role==="ai"?"linear-gradient(135deg,#FF8B3E,#FF5F1F)":c.accentSoft }}>
              {msg.role==="ai"?"AA":"Me"}
            </div>
            <div style={{ maxWidth:"72%" }}>
              <div style={{ fontSize:10, color:c.textMuted, marginBottom:2, textAlign:msg.role==="user"?"right":"left" }}>
                {msg.role==="ai"?<span style={{ color:c.accentText, fontWeight:600 }}>Alternus AI </span>:<span>You </span>}{fmt(msg.timestamp)}
              </div>
              <div style={{ background:msg.role==="user"?c.msgUserBg:c.bubbleBg, border:`1px solid ${msg.role==="user"?"transparent":c.bubbleBorder}`, borderRadius:msg.role==="user"?"12px 3px 12px 12px":"3px 12px 12px 12px", padding:"8px 12px", fontSize:13, lineHeight:1.6, color:msg.role==="user"?"#fff":c.text, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
                {msg.text||<span style={{ display:"flex", gap:3 }}>{[0,1,2].map(j=><span key={j} style={{ width:4, height:4, borderRadius:"50%", background:c.textMuted, display:"inline-block", animation:`b 1.2s ease ${j*0.2}s infinite` }}/>)}</span>}
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef}/>
      </div>
      <div style={{ borderTop:`1px solid ${c.border}`, padding:"10px 14px 12px", background:c.surface }}>
        <div style={{ display:"flex", alignItems:"flex-end", gap:6, background:c.inputBg, border:`1.5px solid ${c.inputBorder}`, borderRadius:12, padding:"7px 7px 7px 12px" }}
          onFocusCapture={e=>(e.currentTarget.style.borderColor=c.inputBorderFocus)}
          onBlurCapture={e=>(e.currentTarget.style.borderColor=c.inputBorder)}
        >
          <textarea value={input} onChange={e=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,100)+"px";}} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Message Alternus AI..." rows={1}
            style={{ flex:1, resize:"none", border:"none", outline:"none", background:"transparent", color:c.text, fontSize:13, lineHeight:1.5, padding:"3px 0", fontFamily:"inherit", overflowY:"hidden", minHeight:20 }}
          />
          <button onClick={()=>send()} disabled={!input.trim()||isTyping} style={{ width:32, height:32, borderRadius:8, border:"none", background:input.trim()&&!isTyping?c.accent:c.accentSoft, color:input.trim()&&!isTyping?"#fff":c.textMuted, cursor:input.trim()&&!isTyping?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Ico d={ic.send} s={13} color={input.trim()&&!isTyping?"#fff":c.textMuted}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CHECKBOX ──────────────────────────────────────────────────
function CB({ checked, onChange, label, count, c }: { checked:boolean; onChange:()=>void; label:string; count:number; c: typeof pal.light }) {
  return (
    <label style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0", cursor:"pointer", userSelect:"none" }}>
      <div onClick={onChange} style={{ width:14, height:14, borderRadius:3, border:`1.5px solid ${checked?c.checkActive:c.checkBorder}`, background:checked?c.checkActive:c.checkBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.12s" }}>
        {checked && <svg width={8} height={8} viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <span onClick={onChange} style={{ fontSize:13, color:checked?c.text:c.textSec, flex:1 }}>{label}</span>
      <span style={{ fontSize:11, color:checked?c.accentText:c.textMuted, fontWeight:500 }}>{count}</span>
    </label>
  );
}

// ── CAPABILITY CARD ───────────────────────────────────────────
function CapCard({ cap, onClick, c }: { cap:Cap; onClick:()=>void; c: typeof pal.light }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"flex", alignItems:"flex-start", gap:12, background:hov?c.cardHover:c.card, border:`1px solid ${hov?c.accentBorder:c.border}`, borderRadius:10, padding:"14px 16px", textAlign:"left", cursor:"pointer", transition:"all 0.13s", boxShadow:hov?c.shadowMd:c.shadow }}
    >
      <div style={{ width:38, height:38, borderRadius:8, background:cap.iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Ico d={ic[cap.icon as keyof typeof ic]} s={18} color={cap.iconColor}/>
      </div>
      <div style={{ minWidth:0, flex:1 }}>
        <p style={{ fontSize:13, fontWeight:600, color:c.text, margin:0, marginBottom:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{cap.label}</p>
        <p style={{ fontSize:11.5, color:c.textMuted, margin:0, lineHeight:1.45, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as const, overflow:"hidden" }}>{cap.desc}</p>
        <p style={{ fontSize:10.5, color:cap.type==="Agent"?c.accentText:c.textMuted, marginTop:6, fontWeight:500 }}>{cap.type}: {cap.provider}</p>
      </div>
    </button>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function AlternusOSPage() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [search, setSearch] = useState("");
  const [activeCats, setActiveCats] = useState<string[]>([]);
  const [activeProvs, setActiveProvs] = useState<string[]>([]);
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Default");
  const [showSort, setShowSort] = useState(false);
  const [activeView, setActiveView] = useState<{ cap: Cap } | null>(null);

  const c = pal[theme];

  const toggleArr = useCallback((arr:string[], setArr:(v:string[])=>void, val:string) =>
    setArr(arr.includes(val) ? arr.filter(x=>x!==val) : [...arr,val]), []);

  const filtered = CAPS.filter(cap => {
    const q = search.toLowerCase();
    const matchQ = !q || cap.label.toLowerCase().includes(q) || cap.desc.toLowerCase().includes(q);
    const matchC = activeCats.length===0 || activeCats.includes(cap.category);
    const matchP = activeProvs.length===0 || activeProvs.includes(cap.provider);
    const matchT = activeTypes.length===0 || activeTypes.includes(cap.type);
    return matchQ && matchC && matchP && matchT;
  });

  const sorted = [...filtered].sort((a,b) =>
    sortBy==="A–Z"?a.label.localeCompare(b.label):sortBy==="Z–A"?b.label.localeCompare(a.label):0
  );

  const hasFilters = activeCats.length>0 || activeProvs.length>0 || activeTypes.length>0;
  const clearAll = () => { setActiveCats([]); setActiveProvs([]); setActiveTypes([]); };

  const catCount  = (cat:string) => CAPS.filter(c=>c.category===cat).length;
  const provCount = (p:string)   => CAPS.filter(c=>c.provider===p).length;
  const typeCount = (t:string)   => CAPS.filter(c=>c.type===t).length;

  const openView = (cap: Cap) => setActiveView({ cap });
  const closeView = () => setActiveView(null);

  const renderView = () => {
    if (!activeView) return null;
    const { cap } = activeView;
    const props = { cap, onBack: closeView, c };
    switch(cap.id) {
      case "terminal": return <TerminalView {...props}/>;
      case "files":    return <FilesView {...props}/>;
      case "code":     return <CodeView {...props}/>;
      case "email":    return <EmailView {...props}/>;
      case "system":   return <SystemView {...props}/>;
      case "calendar": return <CalendarView {...props}/>;
      case "theme":    return <ThemeView {...props} theme={theme} setTheme={setTheme}/>;
      default:         return <ChatView {...props} theme={theme}/>;
    }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:c.pageBg, color:c.text, fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", overflow:"hidden" }}>

      {/* top bar */}
      <div style={{ background:c.surface, borderBottom:`1px solid ${c.border}`, height:50, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", flexShrink:0, zIndex:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:"linear-gradient(135deg,#FF8B3E,#FF5F1F)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:10, color:"#fff" }}>AA</div>
          <span style={{ fontWeight:700, fontSize:14 }}>Alternus AI</span>
          <span style={{ fontSize:11, color:c.textMuted, display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:c.onlineDot, display:"inline-block" }}/>
            All services are online
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {activeView && (
            <button onClick={closeView} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 11px", borderRadius:7, border:`1px solid ${c.border}`, background:"transparent", color:c.textSec, fontSize:12, cursor:"pointer" }}>
              <Ico d={ic.back} s={11} color={c.textSec}/> All Tools
            </button>
          )}
          <button onClick={()=>setTheme(theme==="light"?"dark":"light")} style={{ width:30, height:30, borderRadius:7, border:`1px solid ${c.border}`, background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Ico d={theme==="light"?ic.moon:ic.sun} s={13} color={c.textMuted}/>
          </button>
        </div>
      </div>

      {/* body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* sidebar — always visible */}
        <aside style={{ width:192, background:c.sidebarBg, borderRight:`1px solid ${c.border}`, flexShrink:0, overflowY:"auto", padding:"18px 14px", display:"flex", flexDirection:"column", gap:18 }}>
          {[
            { title:"Type",     items: TYPES.map(t=>({ label:t, count:typeCount(t), checked:activeTypes.includes(t), toggle:()=>toggleArr(activeTypes,setActiveTypes,t) })) },
            { title:"Provider", items: PROVIDERS.map(p=>({ label:p, count:provCount(p), checked:activeProvs.includes(p), toggle:()=>toggleArr(activeProvs,setActiveProvs,p) })) },
            { title:"Category", items: CATEGORIES.map(cat=>({ label:cat, count:catCount(cat), checked:activeCats.includes(cat), toggle:()=>toggleArr(activeCats,setActiveCats,cat) })) },
          ].map(group=>(
            <div key={group.title}>
              <p style={{ fontSize:11, fontWeight:700, color:c.textMuted, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:8 }}>{group.title}</p>
              {group.items.map(item=>(
                <CB key={item.label} checked={item.checked} onChange={item.toggle} label={item.label} count={item.count} c={c}/>
              ))}
            </div>
          ))}
        </aside>

        {/* main content */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {activeView ? renderView() : (
            <div style={{ flex:1, overflowY:"auto", padding:"20px 24px 24px" }}>
              {/* header */}
              <h1 style={{ fontSize:20, fontWeight:700, margin:0, marginBottom:14 }}>Tools ({CAPS.length})</h1>

              {/* search + filter + sort row */}
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:16 }}>
                <div style={{ position:"relative", flex:"0 0 220px" }}>
                  <div style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
                    <Ico d={ic.search} s={13} color={c.textMuted}/>
                  </div>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search"
                    style={{ paddingLeft:30, paddingRight:search?28:10, paddingTop:7, paddingBottom:7, borderRadius:7, border:`1.5px solid ${c.inputBorder}`, background:c.inputBg, color:c.text, fontSize:13, outline:"none", width:"100%", fontFamily:"inherit" }}
                    onFocus={e=>(e.target.style.borderColor=c.inputBorderFocus)} onBlur={e=>(e.target.style.borderColor=c.inputBorder)}
                  />
                  {search && <button onClick={()=>setSearch("")} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", display:"flex" }}><Ico d={ic.close} s={11} color={c.textMuted}/></button>}
                </div>

                {hasFilters && (
                  <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                    {[...activeTypes,...activeProvs,...activeCats].map(f=>(
                      <span key={f} style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:99, background:c.tagBgActive, color:c.tagTextActive, fontSize:11, fontWeight:500, border:`1px solid ${c.accentBorder}` }}>
                        {f}
                        <button onClick={()=>{ toggleArr(activeTypes,setActiveTypes,f); toggleArr(activeProvs,setActiveProvs,f); toggleArr(activeCats,setActiveCats,f); }} style={{ background:"none", border:"none", cursor:"pointer", padding:0, display:"flex" }}><Ico d={ic.close} s={9} color={c.accentText}/></button>
                      </span>
                    ))}
                    <button onClick={clearAll} style={{ fontSize:11, color:c.textMuted, background:"none", border:"none", cursor:"pointer" }}>Clear filters</button>
                  </div>
                )}

                <div style={{ marginLeft:"auto", position:"relative" }}>
                  <button onClick={()=>setShowSort(!showSort)} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:7, border:`1.5px solid ${c.inputBorder}`, background:c.inputBg, color:c.textSec, fontSize:13, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                    Sort by: {sortBy} <Ico d={ic.chevD} s={11} color={c.textMuted}/>
                  </button>
                  {showSort && (
                    <div style={{ position:"absolute", top:"calc(100% + 4px)", right:0, background:c.surface, border:`1px solid ${c.border}`, borderRadius:9, boxShadow:c.shadowMd, zIndex:100, minWidth:140, padding:4 }}>
                      {["Default","A–Z","Z–A"].map(opt=>(
                        <button key={opt} onClick={()=>{setSortBy(opt);setShowSort(false);}} style={{ display:"block", width:"100%", textAlign:"left", padding:"7px 12px", background:sortBy===opt?c.accentSoft:"transparent", color:sortBy===opt?c.accentText:c.textSec, fontSize:13, border:"none", cursor:"pointer", borderRadius:6, fontFamily:"inherit" }}>{opt}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {(hasFilters||search) && <p style={{ fontSize:12, color:c.textMuted, marginBottom:12 }}>Showing {sorted.length} of {CAPS.length} tools</p>}

              {/* 3-col grid */}
              {sorted.length>0 ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                  {sorted.map(cap=>(
                    <CapCard key={cap.id} cap={cap} c={c} onClick={()=>openView(cap)}/>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign:"center", padding:"60px 0", color:c.textMuted }}>
                  <Ico d={ic.search} s={28} color={c.textMuted}/>
                  <p style={{ marginTop:10, fontSize:14 }}>No results for &ldquo;{search}&rdquo;</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* footer */}
      <div style={{ background:c.surface, borderTop:`1px solid ${c.border}`, height:34, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:c.success }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:c.onlineDot, display:"inline-block" }}/>
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
