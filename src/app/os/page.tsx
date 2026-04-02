"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alternus OS — AI-Powered Desktop Operating System
// Fixed viewport, windowed apps, no scrolling
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type ThemeMode = "dark" | "light";
type WinId = "ai" | "terminal" | "code" | "files" | "settings" | "music" | "weather" | "calendar" | "notes" | "browser";

interface WinState {
  id: WinId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

// ━━━━ Colors ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const palette = {
  dark: {
    bg: "#242424",
    surface: "#2C2C2C",
    card: "#2C2C2C",
    cardAlt: "#333333",
    border: "#3A3A3A",
    text: "#F1F5F9",
    textSec: "#A0A0A0",
    textMuted: "#707070",
    accent: "#3B82F6",
    accentSoft: "rgba(59,130,246,0.15)",
    accentText: "#60A5FA",
    success: "#34D399",
    successSoft: "rgba(52,211,153,0.15)",
    warning: "#FBBF24",
    warningSoft: "rgba(251,191,36,0.15)",
    danger: "#F87171",
    purple: "#A78BFA",
    purpleSoft: "rgba(167,139,250,0.15)",
    titlebar: "#2C2C2C",
    titlebarBorder: "#3A3A3A",
  },
  light: {
    bg: "#EFEFEF",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    cardAlt: "#F5F5F5",
    border: "#E0E0E0",
    text: "#1A1A1A",
    textSec: "#666666",
    textMuted: "#999999",
    accent: "#3B82F6",
    accentSoft: "rgba(59,130,246,0.1)",
    accentText: "#2563EB",
    success: "#10B981",
    successSoft: "rgba(16,185,129,0.1)",
    warning: "#F59E0B",
    warningSoft: "rgba(245,158,11,0.1)",
    danger: "#EF4444",
    purple: "#8B5CF6",
    purpleSoft: "rgba(139,92,246,0.1)",
    titlebar: "#F5F5F5",
    titlebarBorder: "#E0E0E0",
  },
};

// ━━━━ Simple SVG Icon ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function I({ d, s = 16, c }: { d: string; s?: number; c?: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c || "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ic = {
  sparkle: "M12 3v1m0 16v1m-8-9H3m18 0h1M5.6 5.6l.7.7m12.1 12.1l.7.7M5.6 18.4l.7-.7m12.1-12.1l.7-.7M12 8a4 4 0 100 8 4 4 0 000-8z",
  terminal: "M4 17l6-6-6-6M12 19h8",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  folder: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
  settings: "M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z",
  music: "M9 18V5l12-2v13M6 18a3 3 0 100-6 3 3 0 000 6zM18 16a3 3 0 100-6 3 3 0 000 6z",
  cloud: "M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 110 9z",
  calendar: "M3 10h18M8 2v4M16 2v4M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z",
  note: "M16 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8zM15 3v4a2 2 0 002 2h4",
  globe: "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z",
  sun: "M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41",
  moon: "M12 3a6 6 0 009 9 9 9 0 11-9-9z",
  wifi: "M5 13a10 10 0 0114 0M8.5 16.5a5 5 0 017 0M2 8.82a15 15 0 0120 0M12 20h.01",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z",
  chevR: "M9 18l6-6-6-6",
  chevL: "M15 18l-6-6 6-6",
  play: "M5 3l14 9-14 9V3z",
  pause: "M6 4h4v16H6zM14 4h4v16h-4z",
  skip: "M5 4l10 8-10 8V4zM19 5v14",
  minimize: "M5 12h14",
  maximize: "M3 3h18v18H3z",
  close: "M18 6L6 18M6 6l12 12",
  search: "M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.3-4.3",
};

// ━━━━ Window Title Bar ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TitleBar({
  title,
  c,
  onClose,
  onMinimize,
  onMaximize,
  onMouseDown,
}: {
  title: string;
  c: typeof palette.dark;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="flex items-center justify-between h-9 px-3 select-none cursor-move flex-shrink-0"
      style={{ background: c.titlebar, borderBottom: `1px solid ${c.titlebarBorder}` }}
    >
      <span style={{ color: c.textSec }} className="text-xs font-medium">{title}</span>
      <div className="flex items-center gap-1">
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={onMinimize}
          className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
          style={{ color: c.textMuted }}
          onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <I d={ic.minimize} s={12} />
        </button>
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={onMaximize}
          className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
          style={{ color: c.textMuted }}
          onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <I d={ic.maximize} s={11} />
        </button>
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={onClose}
          className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
          onMouseEnter={e => { e.currentTarget.style.background = c.danger; (e.currentTarget.firstChild as HTMLElement).style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; (e.currentTarget.firstChild as HTMLElement).style.color = c.textMuted; }}
        >
          <span style={{ color: c.textMuted }}><I d={ic.close} s={12} /></span>
        </button>
      </div>
    </div>
  );
}

// ━━━━ Draggable/Resizable Window ━━━━━━━━━━━━━━━━━━━━━━━━
function AppWindow({
  win,
  c,
  children,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onMove,
}: {
  win: WinState;
  c: typeof palette.dark;
  children: React.ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
}) {
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (win.isMaximized) return;
    dragging.current = true;
    offset.current = { x: e.clientX - win.x, y: e.clientY - win.y };
    onFocus();

    const move = (e: MouseEvent) => {
      if (dragging.current) {
        onMove(e.clientX - offset.current.x, e.clientY - offset.current.y);
      }
    };
    const up = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  if (!win.isOpen || win.isMinimized) return null;

  const style: React.CSSProperties = win.isMaximized
    ? { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: win.zIndex }
    : { position: "absolute", top: win.y, left: win.x, width: win.w, height: win.h, zIndex: win.zIndex };

  return (
    <div
      style={{
        ...style,
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: win.isMaximized ? 0 : 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      onClick={onFocus}
    >
      <TitleBar
        title={win.title}
        c={c}
        onClose={onClose}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onMouseDown={handleMouseDown}
      />
      <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
    </div>
  );
}

// ━━━━ App Contents ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function AIChat({ c }: { c: typeof palette.dark }) {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Welcome to Alternus OS. I'm your AI assistant. Ask me to create apps, write code, or design anything." },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = () => {
    if (!input.trim()) return;
    const m = input.trim();
    setInput("");
    setMsgs(p => [...p, { role: "user", text: m }]);
    setTimeout(() => {
      let r = "I understand. Let me work on that for you.";
      const l = m.toLowerCase();
      if (l.includes("create") || l.includes("build")) r = "I can build that. Let me generate the code. Which framework: React, Python, or something else?";
      else if (l.includes("code") || l.includes("function")) r = "Here's an approach:\n\n```js\nfunction solve(data) {\n  return data.map(process);\n}\n```\n\nShall I expand this?";
      else if (l.includes("hello") || l.includes("hi")) r = "Hello! I'm Alternus AI. What would you like to build today?";
      setMsgs(p => [...p, { role: "ai", text: r }]);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[80%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed"
              style={m.role === "user" ? { background: c.accent, color: "#fff" } : { background: c.cardAlt, color: c.text, border: `1px solid ${c.border}` }}
            >
              <pre className="whitespace-pre-wrap font-sans">{m.text}</pre>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="p-3" style={{ borderTop: `1px solid ${c.border}` }}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}>
          <input
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: c.text }}
            placeholder="Ask AI anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
          />
          <button onClick={send} className="p-1.5 rounded-lg" style={{ background: c.accent }}>
            <I d={ic.send} s={14} c="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TerminalApp({ c }: { c: typeof palette.dark }) {
  const [lines, setLines] = useState(["Alternus OS Terminal v1.0", "Type 'help' for commands.", ""]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);

  const exec = () => {
    const cmd = input.trim();
    setInput("");
    if (!cmd) return;
    const output = [`$ ${cmd}`];
    const l = cmd.toLowerCase();
    if (l === "help") output.push("Commands: help, clear, date, whoami, ls, echo <text>, neofetch");
    else if (l === "clear") { setLines([]); return; }
    else if (l === "date") output.push(new Date().toString());
    else if (l === "whoami") output.push("admin@alternus-os");
    else if (l === "ls") output.push("Documents/  Projects/  Downloads/  Desktop/  .config/");
    else if (l === "neofetch") output.push("Alternus OS v1.0\nKernel: AlternusCore 6.1\nShell: atsh 1.0\nResolution: " + window.innerWidth + "x" + window.innerHeight + "\nTheme: Alternus Dark\nCPU: Virtual (AI-Powered)\nMemory: Unlimited");
    else if (l.startsWith("echo ")) output.push(cmd.slice(5));
    else output.push(`Command not found: ${cmd}`);
    setLines(p => [...p, ...output]);
  };

  return (
    <div className="flex flex-col h-full font-mono text-xs" style={{ background: "#1a1a1a" }}>
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {lines.map((l, i) => (
          <div key={i} style={{ color: l.startsWith("$") ? "#34D399" : "#ccc" }} className="leading-relaxed">
            <pre className="whitespace-pre-wrap">{l}</pre>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderTop: "1px solid #333" }}>
        <span style={{ color: "#34D399" }}>$</span>
        <input
          className="flex-1 bg-transparent outline-none text-xs"
          style={{ color: "#fff" }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && exec()}
          autoFocus
        />
      </div>
    </div>
  );
}

function MusicApp({ c }: { c: typeof palette.dark }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const tracks = [
    { name: "Focus Flow", artist: "Ambient AI", dur: "3:42" },
    { name: "Deep Work", artist: "Neural Beats", dur: "4:15" },
    { name: "Code Session", artist: "Synthwave", dur: "5:01" },
    { name: "Creative Space", artist: "Lo-Fi Engine", dur: "3:58" },
    { name: "Night Coding", artist: "Chill Pulse", dur: "4:33" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2">
        {tracks.map((t, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setPlaying(true); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors"
            style={{ background: i === current ? c.accentSoft : "transparent" }}
            onMouseEnter={e => { if (i !== current) e.currentTarget.style.background = c.cardAlt; }}
            onMouseLeave={e => { if (i !== current) e.currentTarget.style.background = "transparent"; }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: i === current ? c.accent : c.cardAlt }}>
              <I d={ic.music} s={14} c={i === current ? "#fff" : c.textMuted} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: i === current ? c.accentText : c.text }}>{t.name}</p>
              <p className="text-[10px]" style={{ color: c.textMuted }}>{t.artist}</p>
            </div>
            <span className="text-[10px]" style={{ color: c.textMuted }}>{t.dur}</span>
          </button>
        ))}
      </div>
      <div className="p-4 flex-shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
        <p className="text-xs font-medium mb-1" style={{ color: c.text }}>{tracks[current].name}</p>
        <p className="text-[10px] mb-3" style={{ color: c.textMuted }}>{tracks[current].artist}</p>
        <div className="w-full h-1 rounded-full mb-3" style={{ background: c.cardAlt }}>
          <div className="h-full rounded-full" style={{ background: c.accent, width: playing ? "45%" : "0%", transition: "width 0.3s" }} />
        </div>
        <div className="flex items-center justify-center gap-6">
          <button style={{ color: c.textSec }} onClick={() => setCurrent(p => p > 0 ? p - 1 : tracks.length - 1)}><I d={ic.skip} s={14} /></button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: c.accent }} onClick={() => setPlaying(!playing)}>
            <I d={playing ? ic.pause : ic.play} s={14} c="#fff" />
          </button>
          <button style={{ color: c.textSec }} onClick={() => setCurrent(p => p < tracks.length - 1 ? p + 1 : 0)}><I d={ic.skip} s={14} /></button>
        </div>
      </div>
    </div>
  );
}

function CalendarApp({ c }: { c: typeof palette.dark }) {
  const now = new Date();
  const [sel, setSel] = useState(now.getDate());
  const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const fd = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const days: (number | null)[] = [...Array.from({ length: fd }, () => null as null), ...Array.from({ length: dim }, (_, i) => i + 1)];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <button style={{ color: c.textMuted }} className="p-1"><I d={ic.chevL} s={14} /></button>
        <p className="text-sm font-semibold" style={{ color: c.text }}>{now.toLocaleString("default", { month: "long" })} {now.getFullYear()}</p>
        <button style={{ color: c.textMuted }} className="p-1"><I d={ic.chevR} s={14} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["S","M","T","W","T","F","S"].map((d,i) => <div key={i} className="text-center text-[10px] font-medium py-1" style={{ color: c.textMuted }}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <button key={i} onClick={() => d && setSel(d)} className="aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all"
            style={{ background: d === sel ? c.accent : d === now.getDate() && d !== sel ? c.accentSoft : "transparent", color: d === sel ? "#fff" : d === now.getDate() ? c.accentText : d ? c.text : "transparent" }}>
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

function WeatherApp({ c }: { c: typeof palette.dark }) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-3xl font-light" style={{ color: c.text }}>17°</p>
          <p className="text-xs" style={{ color: c.textMuted }}>Partly Cloudy</p>
        </div>
        <span className="text-4xl">⛅</span>
      </div>
      <div className="flex gap-2 mb-4">
        {["Mon","Tue","Wed","Thu","Fri"].map((d,i) => (
          <div key={d} className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl" style={{ background: i === 2 ? c.accentSoft : "transparent" }}>
            <span className="text-[10px] font-medium" style={{ color: i === 2 ? c.accentText : c.textMuted }}>{d}</span>
            <span className="text-sm">{["☀️","⛅","🌤","⛅","☀️"][i]}</span>
            <span className="text-[11px] font-medium" style={{ color: i === 2 ? c.accentText : c.text }}>{[15,14,17,16,19][i]}°</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[{l:"Humidity",v:"62%"},{l:"Wind",v:"12 km/h"},{l:"UV Index",v:"3 Low"},{l:"Pressure",v:"1013 hPa"}].map((s,i) => (
          <div key={i} className="p-3 rounded-xl" style={{ background: c.cardAlt }}>
            <p className="text-[10px]" style={{ color: c.textMuted }}>{s.l}</p>
            <p className="text-sm font-semibold" style={{ color: c.text }}>{s.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsApp({ c, mode, setMode }: { c: typeof palette.dark; mode: ThemeMode; setMode: (m: ThemeMode) => void }) {
  const items = [
    { icon: ic.wifi, label: "Network", desc: "Connected · 5GHz" },
    { icon: ic.user, label: "Account", desc: "admin@alternus.art" },
    { icon: ic.globe, label: "Language", desc: "English (US)" },
    { icon: ic.moon, label: "Appearance", desc: mode === "dark" ? "Dark" : "Light" },
    { icon: ic.settings, label: "System", desc: "Alternus OS v1.0" },
  ];
  return (
    <div className="p-2">
      {items.map((it, i) => (
        <button key={i} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors"
          onClick={() => { if (it.label === "Appearance") setMode(mode === "dark" ? "light" : "dark"); }}
          onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          <span style={{ color: c.textSec }}><I d={it.icon} s={16} /></span>
          <div className="flex-1">
            <p className="text-xs font-medium" style={{ color: c.text }}>{it.label}</p>
            <p className="text-[10px]" style={{ color: c.textMuted }}>{it.desc}</p>
          </div>
          <I d={ic.chevR} s={12} c={c.textMuted} />
        </button>
      ))}
    </div>
  );
}

function FilesApp({ c }: { c: typeof palette.dark }) {
  const files = [
    { name: "Documents", icon: "📁", size: "12 items" },
    { name: "Projects", icon: "💼", size: "7 items" },
    { name: "Images", icon: "🖼️", size: "48 items" },
    { name: "Downloads", icon: "📥", size: "23 items" },
    { name: "report.pdf", icon: "📄", size: "2.4 MB" },
    { name: "design.fig", icon: "🎨", size: "18 MB" },
  ];
  return (
    <div className="p-2">
      <div className="px-3 py-2 mb-1 flex items-center gap-2 rounded-xl" style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}>
        <I d={ic.search} s={14} c={c.textMuted} />
        <input className="flex-1 bg-transparent outline-none text-xs" style={{ color: c.text }} placeholder="Search files..." />
      </div>
      {files.map((f, i) => (
        <button key={i} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors"
          onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          <span className="text-lg">{f.icon}</span>
          <p className="flex-1 text-xs" style={{ color: c.text }}>{f.name}</p>
          <span className="text-[10px]" style={{ color: c.textMuted }}>{f.size}</span>
        </button>
      ))}
    </div>
  );
}

function NotesApp({ c }: { c: typeof palette.dark }) {
  const [text, setText] = useState("# My Notes\n\nStart typing here...\n\n- Project ideas\n- Meeting notes\n- Quick reminders");
  return (
    <div className="flex flex-col h-full">
      <textarea
        className="flex-1 p-4 bg-transparent outline-none resize-none text-sm leading-relaxed font-mono"
        style={{ color: c.text }}
        value={text}
        onChange={e => setText(e.target.value)}
      />
    </div>
  );
}

function BrowserApp({ c }: { c: typeof palette.dark }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: c.cardAlt }}>
          <I d={ic.globe} s={12} c={c.textMuted} />
          <span className="text-xs" style={{ color: c.textSec }}>alternus.art</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-light mb-2" style={{ color: c.text }}>Alternus Browser</p>
          <p className="text-xs" style={{ color: c.textMuted }}>Built-in web browser coming soon</p>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CodeApp({ c }: { c: typeof palette.dark }) {
  const [code, setCode] = useState(`// Alternus Code Editor\n\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\nconst result = greet("World");\nconsole.log(result);`);
  return (
    <div className="flex flex-col h-full" style={{ background: "#1e1e1e" }}>
      <div className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0" style={{ background: "#252526", borderBottom: "1px solid #333" }}>
        <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "#1e1e1e", color: "#ccc" }}>main.js</span>
      </div>
      <div className="flex flex-1">
        <div className="w-10 flex-shrink-0 pt-3 text-right pr-3" style={{ color: "#555" }}>
          {code.split("\n").map((_, i) => <div key={i} className="text-[11px] leading-5">{i + 1}</div>)}
        </div>
        <textarea
          className="flex-1 p-3 bg-transparent outline-none resize-none text-[13px] leading-5 font-mono"
          style={{ color: "#d4d4d4" }}
          value={code}
          onChange={e => setCode(e.target.value)}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

// ━━━━ MAIN OS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function AlternusOS() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [time, setTime] = useState(new Date());
  const [isLocked, setIsLocked] = useState(true);
  const [zCounter, setZCounter] = useState(10);

  const c = palette[mode];

  const defaultWins: WinState[] = [
    { id: "ai", title: "Alternus AI", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 80, y: 40, w: 600, h: 450 },
    { id: "terminal", title: "Terminal", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 200, y: 60, w: 550, h: 380 },
    { id: "code", title: "Code Editor", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 150, y: 50, w: 650, h: 450 },
    { id: "files", title: "Files", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 300, y: 80, w: 400, h: 380 },
    { id: "settings", title: "Settings", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 350, y: 70, w: 360, h: 380 },
    { id: "music", title: "Music", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 250, y: 50, w: 340, h: 420 },
    { id: "weather", title: "Weather", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 400, y: 60, w: 360, h: 400 },
    { id: "calendar", title: "Calendar", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 450, y: 80, w: 320, h: 380 },
    { id: "notes", title: "Notes", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 180, y: 90, w: 450, h: 380 },
    { id: "browser", title: "Browser", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 120, y: 40, w: 700, h: 480 },
  ];

  const [wins, setWins] = useState<WinState[]>(defaultWins);

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  const openWin = useCallback((id: WinId) => {
    setZCounter(z => z + 1);
    setWins(p => p.map(w => {
      if (w.id === id) {
        if (!w.isOpen) return { ...w, isOpen: true, isMinimized: false, zIndex: zCounter + 1 };
        if (w.isMinimized) return { ...w, isMinimized: false, zIndex: zCounter + 1 };
        return { ...w, zIndex: zCounter + 1 };
      }
      return w;
    }));
  }, [zCounter]);

  const closeWin = useCallback((id: WinId) => {
    setWins(p => p.map(w => w.id === id ? { ...w, isOpen: false, isMinimized: false, isMaximized: false } : w));
  }, []);

  const minimizeWin = useCallback((id: WinId) => {
    setWins(p => p.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  }, []);

  const maximizeWin = useCallback((id: WinId) => {
    setWins(p => p.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  }, []);

  const focusWin = useCallback((id: WinId) => {
    setZCounter(z => z + 1);
    setWins(p => p.map(w => w.id === id ? { ...w, zIndex: zCounter + 1 } : w));
  }, [zCounter]);

  const moveWin = useCallback((id: WinId, x: number, y: number) => {
    setWins(p => p.map(w => w.id === id ? { ...w, x, y } : w));
  }, []);

  const winContent: Record<WinId, React.ReactNode> = {
    ai: <AIChat c={c} />,
    terminal: <TerminalApp c={c} />,
    code: <CodeApp c={c} />,
    files: <FilesApp c={c} />,
    settings: <SettingsApp c={c} mode={mode} setMode={setMode} />,
    music: <MusicApp c={c} />,
    weather: <WeatherApp c={c} />,
    calendar: <CalendarApp c={c} />,
    notes: <NotesApp c={c} />,
    browser: <BrowserApp c={c} />,
  };

  const dockApps: { id: WinId; icon: string; label: string; color: string }[] = [
    { id: "ai", icon: ic.sparkle, label: "AI", color: c.accentText },
    { id: "terminal", icon: ic.terminal, label: "Terminal", color: c.success },
    { id: "code", icon: ic.code, label: "Code", color: c.purple },
    { id: "files", icon: ic.folder, label: "Files", color: c.warning },
    { id: "browser", icon: ic.globe, label: "Browser", color: c.accentText },
    { id: "music", icon: ic.music, label: "Music", color: "#F472B6" },
    { id: "calendar", icon: ic.calendar, label: "Calendar", color: "#60A5FA" },
    { id: "weather", icon: ic.cloud, label: "Weather", color: "#22D3EE" },
    { id: "notes", icon: ic.note, label: "Notes", color: "#FBBF24" },
    { id: "settings", icon: ic.settings, label: "Settings", color: c.textSec },
  ];

  // ━━━━ LOCK SCREEN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isLocked) {
    return (
      <div style={{ background: c.bg }} className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.04] pointer-events-none" style={{ background: c.accent, filter: "blur(120px)", top: "20%", left: "30%" }} />
        <div className="relative z-10 flex flex-col items-center">
          <p style={{ color: c.text }} className="text-6xl font-extralight tracking-wide mb-1">{fmt(time)}</p>
          <p style={{ color: c.textMuted }} className="text-sm mb-12">{time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: c.accentSoft }}>
            <span style={{ color: c.accentText }} className="text-xl font-semibold">A</span>
          </div>
          <p style={{ color: c.text }} className="text-sm font-medium mb-6">Alternus OS</p>
          <button onClick={() => setIsLocked(false)} className="px-8 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.97] cursor-pointer" style={{ background: c.accent }}>
            Unlock
          </button>
        </div>
      </div>
    );
  }

  // ━━━━ DESKTOP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div style={{ background: c.bg }} className="fixed inset-0 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 h-9 flex-shrink-0" style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}>
        <div className="flex items-center gap-3">
          <span style={{ color: c.accentText }} className="text-[11px] font-bold tracking-wider">ALTERNUS</span>
          <span style={{ color: c.textMuted }} className="text-[10px]">OS</span>
        </div>
        <span style={{ color: c.textSec }} className="text-xs">{fmt(time)} · {time.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setMode(mode === "dark" ? "light" : "dark")} className="p-1 rounded-md" style={{ color: c.textSec }}>
            <I d={mode === "dark" ? ic.sun : ic.moon} s={13} />
          </button>
          <span style={{ color: c.textSec }}><I d={ic.wifi} s={13} /></span>
          <button onClick={() => setIsLocked(true)} className="p-1 rounded-md" style={{ color: c.textMuted }}>
            <I d={ic.user} s={13} />
          </button>
        </div>
      </div>

      {/* Desktop Area - fixed, no scroll */}
      <div className="flex-1 relative overflow-hidden">
        {/* Center: Alternus branding + AI Search */}
        {!wins.some(w => w.isOpen && !w.isMinimized) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-[0]">
            {/* Alternus gradient text */}
            <h1
              className="text-7xl md:text-8xl font-semibold mb-8 select-none"
              style={{
                background: mode === "dark"
                  ? "linear-gradient(90deg, #555 0%, #fff 50%, #555 100%)"
                  : "linear-gradient(90deg, #aaa 0%, #333 50%, #aaa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Alternus<span className="text-lg align-super" style={{ WebkitTextFillColor: c.textMuted }}>©</span>
            </h1>

            {/* AI Search Bar */}
            <div
              className="w-full max-w-xl flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all"
              style={{ background: c.surface, border: `1px solid ${c.border}`, boxShadow: mode === "dark" ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.08)" }}
            >
              <I d={ic.search} s={18} c={c.textMuted} />
              <input
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: c.text }}
                placeholder="Search or ask AI anything..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                    openWin("ai");
                  }
                }}
              />
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium" style={{ background: c.cardAlt, color: c.textMuted, border: `1px solid ${c.border}` }}>⌘K</span>
              </div>
            </div>

            {/* Quick app launcher row */}
            <div className="flex items-center gap-3 mt-8">
              {dockApps.slice(0, 6).map(app => (
                <button
                  key={app.id}
                  onClick={() => openWin(app.id)}
                  className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                  onMouseEnter={e => (e.currentTarget.style.background = c.surface)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
                    <I d={app.icon} s={18} c={app.color} />
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: c.textMuted }}>{app.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Windows */}
        {wins.map(w => (
          <AppWindow
            key={w.id}
            win={w}
            c={c}
            onClose={() => closeWin(w.id)}
            onMinimize={() => minimizeWin(w.id)}
            onMaximize={() => maximizeWin(w.id)}
            onFocus={() => focusWin(w.id)}
            onMove={(x, y) => moveWin(w.id, x, y)}
          >
            {winContent[w.id]}
          </AppWindow>
        ))}
      </div>

      {/* Bottom: Minimal open windows indicator (only shows when windows are open) */}
      {wins.some(w => w.isOpen) && (
        <div className="flex-shrink-0 flex items-center justify-center py-1.5">
          <div className="flex items-center gap-0.5 px-2 py-1 rounded-2xl" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            {dockApps.filter(app => wins.find(w => w.id === app.id)?.isOpen).map(app => {
              const w = wins.find(w => w.id === app.id);
              return (
                <div key={app.id} className="relative group">
                  <button
                    onClick={() => {
                      if (w?.isMinimized) {
                        openWin(app.id);
                      } else {
                        focusWin(app.id);
                      }
                    }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    style={{ background: w?.isMinimized ? "transparent" : c.accentSoft }}
                  >
                    <I d={app.icon} s={17} c={app.color} />
                  </button>
                  {!w?.isMinimized && <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: c.accent }} />}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                    style={{ background: c.surface, color: c.text, border: `1px solid ${c.border}` }}>{app.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
