"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alternus OS — AI-Powered Desktop Operating System
// Fixed viewport, windowed apps, no scrolling
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type ThemeMode = "dark" | "light";
type WinId = "ai" | "terminal" | "code" | "files" | "settings" | "music" | "weather" | "calendar" | "notes" | "browser" | "store" | "movies";

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
  power: "M12 2v10M16.24 7.76a6 6 0 11-8.49 0",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  store: "M3 3h18l-2 13H5L3 3zM16 16a2 2 0 100 4 2 2 0 000-4zM9 16a2 2 0 100 4 2 2 0 000-4z",
  film: "M2 2h20v20H2zM7 2v20M17 2v20M2 7h5M2 12h20M2 17h5M17 7h5M17 17h5",
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
  const [activeSection, setActiveSection] = useState("Network");
  const items = [
    { icon: ic.wifi, label: "Network", desc: "Connected · 5GHz" },
    { icon: ic.user, label: "Account", desc: "admin@alternus.art" },
    { icon: ic.globe, label: "Language", desc: "English (US)" },
    { icon: ic.moon, label: "Appearance", desc: mode === "dark" ? "Dark" : "Light" },
    { icon: ic.settings, label: "System", desc: "Alternus OS v1.0" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "Network":
        return (
          <div className="p-5 space-y-4 overflow-y-auto h-full">
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: c.cardAlt }}>
              <div><p className="text-sm font-medium" style={{ color: c.text }}>Wi-Fi</p><p className="text-xs" style={{ color: c.textMuted }}>Connected to AlternusNet · 5GHz</p></div>
              <div className="w-10 h-5 rounded-full flex items-center px-0.5" style={{ background: c.accent }}><div className="w-4 h-4 rounded-full bg-white ml-auto" /></div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium px-1 mb-2" style={{ color: c.textMuted }}>Available Networks</p>
              {["AlternusNet", "Guest_WiFi", "Office_5G"].map((net, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors" style={{ background: i === 0 ? c.cardAlt : "transparent" }}
                  onMouseEnter={e => { if (i !== 0) e.currentTarget.style.background = c.cardAlt; }} onMouseLeave={e => { if (i !== 0) e.currentTarget.style.background = "transparent"; }}>
                  <div className="flex items-center gap-3"><I d={ic.wifi} s={16} c={c.textSec} /><span className="text-sm" style={{ color: c.text }}>{net}</span></div>
                  {i === 0 && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: c.accentSoft, color: c.accentText }}>Connected</span>}
                </div>
              ))}
            </div>
          </div>
        );
      case "Account":
        return (
          <div className="p-5 space-y-4 overflow-y-auto h-full">
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: c.cardAlt }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: c.accentSoft, color: c.accentText }}><I d={ic.user} s={28} /></div>
              <div><p className="text-sm font-medium" style={{ color: c.text }}>Admin</p><p className="text-xs" style={{ color: c.textMuted }}>admin@alternus.art</p></div>
            </div>
            {[{ l: "Display Name", v: "Admin" }, { l: "Email", v: "admin@alternus.art" }, { l: "Role", v: "Administrator" }].map((f, i) => (
              <div key={i} className="px-4 py-3 rounded-xl" style={{ background: c.cardAlt }}>
                <p className="text-[10px] mb-1" style={{ color: c.textMuted }}>{f.l}</p>
                <p className="text-sm" style={{ color: c.text }}>{f.v}</p>
              </div>
            ))}
          </div>
        );
      case "Language":
        return (
          <div className="p-5 space-y-1 overflow-y-auto h-full">
            {["English (US)", "Shqip", "Deutsch", "Français", "Español", "日本語"].map((lang, i) => (
              <button key={i} className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors"
                onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <span className="text-sm" style={{ color: c.text }}>{lang}</span>
                {i === 0 && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: c.accentSoft, color: c.accentText }}>Active</span>}
              </button>
            ))}
          </div>
        );
      case "Appearance":
        return (
          <div className="p-5 space-y-4 overflow-y-auto h-full">
            <p className="text-xs font-medium px-1" style={{ color: c.textMuted }}>Theme</p>
            <div className="flex gap-3">
              {(["dark", "light"] as ThemeMode[]).map(m => (
                <button key={m} onClick={() => setMode(m)} className="flex-1 p-4 rounded-xl text-center transition-all"
                  style={{ background: mode === m ? c.accentSoft : c.cardAlt, border: `2px solid ${mode === m ? c.accent : "transparent"}` }}>
                  <I d={m === "dark" ? ic.moon : ic.sun} s={24} c={mode === m ? c.accentText : c.textSec} />
                  <p className="text-xs mt-2 capitalize" style={{ color: mode === m ? c.accentText : c.text }}>{m}</p>
                </button>
              ))}
            </div>
            <p className="text-xs font-medium px-1 mt-4" style={{ color: c.textMuted }}>Accent Color</p>
            <div className="flex gap-2 px-1">
              {["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899"].map(col => (
                <div key={col} className="w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110" style={{ background: col, border: col === c.accent ? "3px solid " + c.text : "3px solid transparent" }} />
              ))}
            </div>
          </div>
        );
      case "System":
        return (
          <div className="p-5 space-y-3 overflow-y-auto h-full">
            {[{ l: "OS Version", v: "Alternus OS v1.0" }, { l: "Kernel", v: "AlternusKernel 6.2" }, { l: "Architecture", v: "x86_64" }, { l: "Uptime", v: "3h 24m" }, { l: "Memory", v: "16 GB DDR5" }, { l: "Storage", v: "512 GB SSD — 234 GB free" }].map((info, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: c.cardAlt }}>
                <span className="text-xs" style={{ color: c.textMuted }}>{info.l}</span>
                <span className="text-xs font-medium" style={{ color: c.text }}>{info.v}</span>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-[170px] flex-shrink-0 flex flex-col py-3 px-2 overflow-y-auto" style={{ borderRight: `1px solid ${c.border}` }}>
        <p className="text-sm font-semibold px-3 mb-3" style={{ color: c.accentText }}>Settings</p>
        {items.map((it, i) => (
          <button key={i} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors mb-0.5"
            onClick={() => setActiveSection(it.label)}
            style={{ background: activeSection === it.label ? c.accentSoft : "transparent" }}
            onMouseEnter={e => { if (activeSection !== it.label) e.currentTarget.style.background = c.cardAlt; }}
            onMouseLeave={e => { if (activeSection !== it.label) e.currentTarget.style.background = "transparent"; }}>
            <I d={it.icon} s={16} c={activeSection === it.label ? c.accentText : c.textSec} />
            <span className="text-xs font-medium" style={{ color: activeSection === it.label ? c.accentText : c.text }}>{it.label}</span>
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}

function FilesApp({ c, onOpenApp }: { c: typeof palette.dark; onOpenApp: (id: WinId) => void }) {
  const [currentPath, setCurrentPath] = useState("Home");
  const [fileContent, setFileContent] = useState<string | null>(null);

  const folders: Record<string, { name: string; icon: string; size: string; action?: WinId | string }[]> = {
    Home: [
      { name: "Documents", icon: "📁", size: "12 items", action: "Documents" },
      { name: "Projects", icon: "💼", size: "7 items", action: "Projects" },
      { name: "Images", icon: "🖼️", size: "48 items", action: "Images" },
      { name: "Downloads", icon: "📥", size: "23 items", action: "Downloads" },
      { name: "report.pdf", icon: "📄", size: "2.4 MB", action: "file" },
      { name: "design.fig", icon: "🎨", size: "18 MB", action: "file" },
    ],
    Documents: [
      { name: "notes.md", icon: "📝", size: "4 KB", action: "notes" },
      { name: "todo.txt", icon: "📄", size: "1 KB", action: "file" },
      { name: "meeting-notes.md", icon: "📝", size: "8 KB", action: "notes" },
    ],
    Projects: [
      { name: "alternus-os/", icon: "📂", size: "24 files" },
      { name: "website/", icon: "📂", size: "18 files" },
      { name: "README.md", icon: "📄", size: "2 KB", action: "file" },
    ],
    Images: [
      { name: "screenshot.png", icon: "🖼️", size: "1.2 MB" },
      { name: "logo.svg", icon: "🎨", size: "4 KB" },
      { name: "wallpaper.jpg", icon: "🖼️", size: "3.8 MB" },
    ],
    Downloads: [
      { name: "installer.dmg", icon: "💿", size: "120 MB" },
      { name: "archive.zip", icon: "📦", size: "45 MB" },
      { name: "font-pack.zip", icon: "📦", size: "12 MB" },
    ],
  };

  const currentFiles = folders[currentPath] || folders.Home;

  if (fileContent) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: `1px solid ${c.border}` }}>
          <button onClick={() => setFileContent(null)} className="p-1 rounded-md" style={{ color: c.textSec }}>
            <I d={ic.chevL} s={14} />
          </button>
          <span className="text-xs" style={{ color: c.textSec }}>File Preview</span>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed" style={{ color: c.text }}>{fileContent}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search + path */}
      <div className="p-2 space-y-1">
        <div className="px-3 py-2 flex items-center gap-2 rounded-xl" style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}>
          <I d={ic.search} s={14} c={c.textMuted} />
          <input className="flex-1 bg-transparent outline-none text-xs" style={{ color: c.text }} placeholder="Search files..." />
        </div>
        {currentPath !== "Home" && (
          <button onClick={() => setCurrentPath("Home")} className="flex items-center gap-1 px-2 py-1 text-xs rounded-md" style={{ color: c.accentText }}>
            <I d={ic.chevL} s={12} c={c.accentText} /> Back to Home
          </button>
        )}
      </div>
      {/* Files */}
      <div className="flex-1 overflow-y-auto px-2">
        {currentFiles.map((f, i) => (
          <button key={i} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors"
            onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            onClick={() => {
              if (f.action === "notes") { onOpenApp("notes"); }
              else if (f.action === "file") { setFileContent(`# ${f.name}\n\nFile size: ${f.size}\nType: ${f.name.split('.').pop()?.toUpperCase()}\nModified: ${new Date().toLocaleDateString()}\n\n--- Content Preview ---\n\nThis is a preview of ${f.name}.\nFull file editing available in Code Editor.`); }
              else if (folders[f.action || ""]) { setCurrentPath(f.action as string); }
            }}>
            <span className="text-lg">{f.icon}</span>
            <p className="flex-1 text-xs" style={{ color: c.text }}>{f.name}</p>
            <span className="text-[10px]" style={{ color: c.textMuted }}>{f.size}</span>
            <I d={ic.chevR} s={12} c={c.textMuted} />
          </button>
        ))}
      </div>
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
  const [url, setUrl] = useState("https://alternus.art");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>(["https://alternus.art"]);
  const [bookmarks] = useState([
    { name: "Alternus Art", url: "https://alternus.art" },
    { name: "GitHub", url: "https://github.com" },
    { name: "Google", url: "https://google.com" },
    { name: "Stack Overflow", url: "https://stackoverflow.com" },
  ]);

  const navigate = (newUrl: string) => {
    let finalUrl = newUrl;
    if (!finalUrl.startsWith("http")) finalUrl = "https://" + finalUrl;
    setUrl(finalUrl);
    setHistory(p => [...p, finalUrl]);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* URL Bar */}
      <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        <button onClick={() => { if (history.length > 1) { const h = [...history]; h.pop(); setHistory(h); setUrl(h[h.length - 1]); } }} style={{ color: c.textMuted }} className="p-1">
          <I d={ic.chevL} s={14} />
        </button>
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}>
          {isLoading ? (
            <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${c.accent} transparent ${c.accent} ${c.accent}` }} />
          ) : (
            <I d={ic.globe} s={12} c={c.textMuted} />
          )}
          <input
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ color: c.text }}
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") navigate(url); }}
          />
        </div>
      </div>

      {/* Bookmarks */}
      <div className="flex items-center gap-1 px-3 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        {bookmarks.map((b, i) => (
          <button key={i} onClick={() => navigate(b.url)} className="px-2 py-0.5 rounded-md text-[10px] transition-colors"
            style={{ color: c.textSec }}
            onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            {b.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={url}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          title="Browser"
        />
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
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [zCounter, setZCounter] = useState(10);
  const [showApps, setShowApps] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiActions, setAiActions] = useState<{ label: string; action: WinId }[]>([]);

  const c = palette[mode];

  const defaultWins: WinState[] = [
    { id: "ai", title: "Alternus AI", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 80, y: 40, w: 600, h: 450 },
    { id: "terminal", title: "Terminal", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 200, y: 60, w: 550, h: 380 },
    { id: "code", title: "Code Editor", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 150, y: 50, w: 650, h: 450 },
    { id: "files", title: "Files", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 300, y: 80, w: 400, h: 380 },
    { id: "settings", title: "Settings", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 200, y: 50, w: 560, h: 440 },
    { id: "music", title: "Music", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 250, y: 50, w: 340, h: 420 },
    { id: "weather", title: "Weather", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 400, y: 60, w: 360, h: 400 },
    { id: "calendar", title: "Calendar", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 450, y: 80, w: 320, h: 380 },
    { id: "notes", title: "Notes", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 180, y: 90, w: 450, h: 380 },
    { id: "browser", title: "Browser", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 120, y: 40, w: 700, h: 480 },
    { id: "store", title: "Store", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 180, y: 60, w: 550, h: 420 },
    { id: "movies", title: "Movies", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 220, y: 50, w: 600, h: 450 },
  ];

  const [wins, setWins] = useState<WinState[]>(defaultWins);

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  // Boot animation
  useEffect(() => {
    if (!isBooting) return;
    const start = Date.now();
    const duration = 2500;
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setBootProgress(progress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => setIsBooting(false), 300);
      }
    };
    requestAnimationFrame(animate);
  }, [isBooting]);

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

  const handleDesktopSearch = () => {
    const q = aiInput.trim().toLowerCase();
    if (!q) return;

    // Smart search - find apps, files, or respond with AI
    if (q.includes("file") || q.includes("document") || q.includes("folder")) {
      setAiResponse("I found your files. Would you like to open the file manager?");
      setAiActions([{ label: "Open Files", action: "files" }]);
    } else if (q.includes("code") || q.includes("edit") || q.includes("program")) {
      setAiResponse("Ready to code. I can open the code editor for you.");
      setAiActions([{ label: "Open Code Editor", action: "code" }]);
    } else if (q.includes("terminal") || q.includes("command") || q.includes("shell")) {
      setAiResponse("Opening terminal for command line access.");
      setAiActions([{ label: "Open Terminal", action: "terminal" }]);
    } else if (q.includes("browse") || q.includes("web") || q.includes("search") || q.includes("google")) {
      setAiResponse("I can open the browser for you. What would you like to search?");
      setAiActions([{ label: "Open Browser", action: "browser" }]);
    } else if (q.includes("music") || q.includes("song") || q.includes("play")) {
      setAiResponse("Let me open the music player for you.");
      setAiActions([{ label: "Open Music", action: "music" }]);
    } else if (q.includes("weather") || q.includes("temperature")) {
      setAiResponse("Currently 17° and partly cloudy. Would you like more details?");
      setAiActions([{ label: "Open Weather", action: "weather" }]);
    } else if (q.includes("note") || q.includes("write") || q.includes("memo")) {
      setAiResponse("I can open Notes for you to start writing.");
      setAiActions([{ label: "Open Notes", action: "notes" }]);
    } else if (q.includes("setting") || q.includes("config") || q.includes("theme")) {
      setAiResponse("Opening settings. You can change theme, language, and more.");
      setAiActions([{ label: "Open Settings", action: "settings" }]);
    } else if (q.includes("calendar") || q.includes("date") || q.includes("schedule")) {
      setAiResponse(`Today is ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}.`);
      setAiActions([{ label: "Open Calendar", action: "calendar" }]);
    } else if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      setAiResponse("Hello! I'm Alternus AI. I can open apps, find files, write code, or answer questions. Try asking me anything.");
      setAiActions([]);
    } else if (q.includes("create") || q.includes("build") || q.includes("make")) {
      setAiResponse("I can help you build that. Let me set up the code editor and terminal for your project.");
      setAiActions([{ label: "Open Code", action: "code" }, { label: "Open Terminal", action: "terminal" }]);
    } else {
      setAiResponse(`I understand "${aiInput.trim()}". Here's what I can help with: open apps, find files, write code, browse the web, check weather, or manage settings.`);
      setAiActions([{ label: "Open Files", action: "files" }, { label: "Open Browser", action: "browser" }, { label: "Open Code", action: "code" }]);
    }
  };

  const winContent: Record<WinId, React.ReactNode> = {
    ai: <AIChat c={c} />,
    terminal: <TerminalApp c={c} />,
    code: <CodeApp c={c} />,
    files: <FilesApp c={c} onOpenApp={openWin} />,
    settings: <SettingsApp c={c} mode={mode} setMode={setMode} />,
    music: <MusicApp c={c} />,
    weather: <WeatherApp c={c} />,
    calendar: <CalendarApp c={c} />,
    notes: <NotesApp c={c} />,
    browser: <BrowserApp c={c} />,
    store: (
      <div className="p-5 space-y-4 overflow-y-auto h-full">
        <p className="text-lg font-semibold" style={{ color: c.text }}>Alternus Store</p>
        <p className="text-xs" style={{ color: c.textMuted }}>Discover apps for Alternus OS</p>
        {[{ name: "Alternus Paint", desc: "Digital art & drawing", cat: "Creative" }, { name: "Alternus Docs", desc: "Document editor", cat: "Productivity" }, { name: "Alternus Chat", desc: "Messaging app", cat: "Social" }, { name: "Alternus Maps", desc: "Navigation & maps", cat: "Utilities" }, { name: "Alternus Photos", desc: "Photo gallery & editor", cat: "Creative" }].map((app, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-xl transition-colors" style={{ background: c.cardAlt }}
            onMouseEnter={e => (e.currentTarget.style.background = c.accentSoft)} onMouseLeave={e => (e.currentTarget.style.background = c.cardAlt)}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.accentSoft, color: c.accentText }}><I d={ic.sparkle} s={20} /></div>
            <div className="flex-1"><p className="text-sm font-medium" style={{ color: c.text }}>{app.name}</p><p className="text-[10px]" style={{ color: c.textMuted }}>{app.desc}</p></div>
            <span className="text-[10px] px-3 py-1 rounded-full" style={{ background: c.accent, color: "#fff" }}>Get</span>
          </div>
        ))}
      </div>
    ),
    movies: (
      <div className="p-5 space-y-4 overflow-y-auto h-full">
        <p className="text-lg font-semibold" style={{ color: c.text }}>Movies</p>
        <p className="text-xs" style={{ color: c.textMuted }}>Watch & discover</p>
        {[{ name: "The Last Algorithm", genre: "Sci-Fi", year: "2025", rating: "8.7" }, { name: "Digital Dreams", genre: "Drama", year: "2024", rating: "7.9" }, { name: "Code Runner", genre: "Action", year: "2025", rating: "8.2" }, { name: "Neural Path", genre: "Thriller", year: "2024", rating: "8.5" }, { name: "Pixel World", genre: "Animation", year: "2025", rating: "9.1" }].map((m, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-xl transition-colors" style={{ background: c.cardAlt }}
            onMouseEnter={e => (e.currentTarget.style.background = c.accentSoft)} onMouseLeave={e => (e.currentTarget.style.background = c.cardAlt)}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.purpleSoft, color: c.purple }}><I d={ic.film} s={20} /></div>
            <div className="flex-1"><p className="text-sm font-medium" style={{ color: c.text }}>{m.name}</p><p className="text-[10px]" style={{ color: c.textMuted }}>{m.genre} · {m.year}</p></div>
            <span className="text-xs font-medium" style={{ color: c.warning }}>{m.rating}</span>
          </div>
        ))}
      </div>
    ),
  };

  const dockApps: { id: WinId; icon: string; label: string; color: string }[] = [
    { id: "terminal", icon: ic.terminal, label: "Terminal", color: c.success },
    { id: "code", icon: ic.code, label: "Code", color: c.purple },
    { id: "files", icon: ic.folder, label: "Files", color: c.warning },
    { id: "browser", icon: ic.globe, label: "Browser", color: c.accentText },
    { id: "store", icon: ic.store, label: "Store", color: c.accent },
    { id: "movies", icon: ic.film, label: "Movies", color: c.purple },
    { id: "music", icon: ic.music, label: "Music", color: "#F472B6" },
    { id: "calendar", icon: ic.calendar, label: "Calendar", color: "#60A5FA" },
    { id: "weather", icon: ic.cloud, label: "Weather", color: "#22D3EE" },
    { id: "notes", icon: ic.note, label: "Notes", color: "#FBBF24" },
    { id: "settings", icon: ic.settings, label: "Settings", color: c.textSec },
  ];

  // ━━━━ BOOT SCREEN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isBooting) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden" style={{ background: "#000" }}>
        {/* Alternus logo */}
        <h1
          className="text-7xl md:text-8xl font-semibold mb-12 select-none bg-clip-text"
          style={{
            backgroundImage: "linear-gradient(90deg, #666 0%, #eee 50%, #666 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            opacity: 0.6 + bootProgress * 0.4,
          }}
        >
          Alternus
        </h1>

        {/* Neon blue progress bar */}
        <div className="w-64 h-[3px] rounded-full overflow-hidden" style={{ background: "#1a1a1a" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${bootProgress * 100}%`,
              background: "linear-gradient(90deg, #7C3AED, #3B82F6, #06B6D4)",
              boxShadow: "0 0 12px #3B82F6, 0 0 24px rgba(59,130,246,0.4)",
              transition: "width 0.1s linear",
            }}
          />
        </div>

        <p className="mt-4 text-xs" style={{ color: "#555" }}>
          {bootProgress < 0.3 ? "Initializing..." : bootProgress < 0.7 ? "Loading AI Engine..." : bootProgress < 1 ? "Starting Desktop..." : "Ready"}
        </p>
      </div>
    );
  }

  // ━━━━ LOCK SCREEN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isLocked) {
    return (
      <div
        style={{ background: c.bg }}
        className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Top-right icons: WiFi + Settings */}
        <div className="absolute top-4 right-4 flex items-center gap-3">
          <span style={{ color: c.textMuted }}><I d={ic.wifi} s={16} /></span>
          <span style={{ color: c.textMuted }}><I d={ic.settings} s={16} /></span>
        </div>

        {/* Clock + Date — shifted up */}
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 flex flex-col items-center">
          <p style={{ color: c.text }} className="text-7xl font-bold tracking-wide mb-1">{fmt(time)}</p>
          <p style={{ color: c.textMuted }} className="text-sm">{time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>

        {/* Bottom content: Welcome + Button + Profile */}
        <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 flex flex-col items-center">
          <p style={{ color: c.textSec }} className="text-sm font-light mb-6">
            Welcome to Alternus OS
          </p>

          {/* Round profile icon */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
            style={{ border: `2px solid ${c.border}`, color: c.textMuted }}
          >
            <I d={ic.user} s={22} />
          </div>

          <button
            onClick={() => setIsLocked(false)}
            className="group flex items-center gap-3 px-8 py-3 rounded-2xl text-sm font-medium transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
            style={{
              background: c.surface,
              border: `1px solid ${c.border}`,
              color: c.text,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = c.accent; e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = c.surface; e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.text; }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
            Open Desktop
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
          <span style={{ color: c.text }} className="text-[11px] font-bold tracking-wider">ALTERNUS</span>
          <span style={{ color: c.textMuted }} className="text-[10px]">OS</span>
        </div>
        <span style={{ color: c.textSec }} className="text-xs">{fmt(time)} · {time.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        <div className="flex items-center gap-2">
          {(() => { const ic_ = mode === "dark" ? "#FFFFFF" : "#444444"; return (<>
            <button onClick={() => openWin("browser")} className="p-1 rounded-md" style={{ color: ic_ }}><I d={ic.globe} s={13} /></button>
            <button onClick={() => openWin("settings")} className="p-1 rounded-md" style={{ color: ic_ }}><I d={ic.settings} s={13} /></button>
            <button onClick={() => openWin("code")} className="p-1 rounded-md" style={{ color: ic_ }}><I d={ic.code} s={13} /></button>
            <button onClick={() => openWin("terminal")} className="p-1 rounded-md" style={{ color: ic_ }}><I d={ic.terminal} s={13} /></button>
            <button onClick={() => openWin("weather")} className="p-1 rounded-md" style={{ color: ic_ }}><I d={ic.cloud} s={13} /></button>
            <button onClick={() => openWin("calendar")} className="p-1 rounded-md" style={{ color: ic_ }}><I d={ic.calendar} s={13} /></button>
            <button onClick={() => openWin("store")} className="p-1 rounded-md" style={{ color: ic_ }}><I d={ic.store} s={13} /></button>
            <button onClick={() => openWin("movies")} className="p-1 rounded-md" style={{ color: ic_ }}><I d={ic.film} s={13} /></button>
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-1 rounded-md relative" style={{ color: ic_ }}>
              <I d={ic.bell} s={13} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: c.danger }} />
            </button>
            <span style={{ color: ic_ }}><I d={ic.wifi} s={13} /></span>
            <button onClick={() => setMode(mode === "dark" ? "light" : "dark")} className="p-1 rounded-md" style={{ color: ic_ }}>
              <I d={mode === "dark" ? ic.sun : ic.moon} s={13} />
            </button>
            <button onClick={() => setIsLocked(true)} className="p-1 rounded-md" style={{ color: ic_ }}>
              <I d={ic.user} s={13} />
            </button>
            <button onClick={() => { setIsBooting(true); setIsLocked(true); }} className="p-1 rounded-md" style={{ color: ic_ }}>
              <I d={ic.power} s={13} />
            </button>
          </>); })()}
        </div>
      </div>

      {/* Desktop Area - fixed, no scroll */}
      <div className="flex-1 relative overflow-hidden">
        {/* Apps button - top center, always visible */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[50] flex flex-col items-center">
            <button
              onClick={() => setShowApps(!showApps)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{
                background: showApps ? c.accent : c.surface,
                border: `1px solid ${showApps ? c.accent : c.border}`,
                color: showApps ? "#fff" : c.textSec,
              }}
              onMouseEnter={e => {
                if (!showApps) {
                  e.currentTarget.style.background = c.accent;
                  e.currentTarget.style.borderColor = c.accent;
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={e => {
                if (!showApps) {
                  e.currentTarget.style.background = c.surface;
                  e.currentTarget.style.borderColor = c.border;
                  e.currentTarget.style.color = c.textSec;
                }
              }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: showApps ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </button>

            {/* Apps panel - slides down, horizontal scroll */}
            <div
              className="mt-2 overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: showApps ? 80 : 0,
                opacity: showApps ? 1 : 0,
              }}
            >
              <div
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl overflow-x-auto"
                style={{ background: c.surface, border: `1px solid ${c.border}`, boxShadow: mode === "dark" ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.08)", scrollbarWidth: "none", msOverflowStyle: "none" }}
                onWheel={e => { e.currentTarget.scrollLeft += e.deltaY; }}
              >
                {dockApps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => { openWin(app.id); setShowApps(false); }}
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}
                    onMouseEnter={e => { e.currentTarget.style.background = c.accent; e.currentTarget.style.borderColor = c.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.background = c.cardAlt; e.currentTarget.style.borderColor = c.border; }}
                  >
                    <I d={app.icon} s={16} c={app.color} />
                  </button>
                ))}
              </div>
            </div>
          </div>

        {/* Center: Alternus branding + AI Search - always visible behind windows */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-[0]">
          {/* Alternus gradient text */}
          <h1
            className="text-8xl md:text-9xl font-semibold mb-4 select-none bg-clip-text"
            style={{
              backgroundImage: `linear-gradient(90deg, ${c.textMuted} 0%, ${c.text} 50%, ${c.textMuted} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            Alternus<span className="text-xl align-super" style={{ WebkitTextFillColor: c.textMuted }}>©</span>
          </h1>

          {/* Welcome message */}
          <p className="text-base font-light mb-10" style={{ color: c.textSec }}>
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}. What would you like to create today?
          </p>

          {/* AI Search Bar with inline response */}
          <div className="w-full max-w-2xl">
            <div
              className="flex items-center gap-2 pl-5 pr-2 py-2 rounded-2xl transition-all"
              style={{ background: c.surface, border: `1px solid ${c.border}`, boxShadow: mode === "dark" ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.08)" }}
            >
              <I d={ic.search} s={20} c={c.textMuted} />
              <input
                className="flex-1 bg-transparent outline-none text-base py-2"
                style={{ color: c.text }}
                placeholder="Search or ask AI anything..."
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && aiInput.trim()) {
                    handleDesktopSearch();
                  }
                }}
              />
              <button
                onClick={() => aiInput.trim() && handleDesktopSearch()}
                className="px-5 py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-95"
                style={{ background: c.accent }}
              >
                <I d={ic.send} s={16} c="#fff" />
              </button>
            </div>

            {/* Inline AI response */}
            {aiResponse && (
              <div
                className="mt-3 px-5 py-4 rounded-2xl text-[13px] leading-relaxed"
                style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.text, boxShadow: mode === "dark" ? "0 4px 20px rgba(0,0,0,0.2)" : "0 4px 20px rgba(0,0,0,0.06)" }}
              >
                <pre className="whitespace-pre-wrap font-sans">{aiResponse}</pre>
                {aiActions.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {aiActions.map((a, i) => (
                      <button
                        key={i}
                        onClick={() => { openWin(a.action); setAiResponse(null); setAiActions([]); setAiInput(""); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                        style={{ background: c.accentSoft, color: c.accentText }}
                      >
                        {a.label}
                      </button>
                    ))}
                    <button
                      onClick={() => { setAiResponse(null); setAiActions([]); }}
                      className="px-3 py-1.5 rounded-lg text-xs transition-colors"
                      style={{ color: c.textMuted }}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

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

        {/* Notification Sidebar */}
        <div
          className="absolute top-0 right-0 h-full z-[100] transition-transform duration-300 ease-in-out"
          style={{
            width: 320,
            transform: showNotifications ? "translateX(0)" : "translateX(100%)",
            background: c.surface,
            borderLeft: `1px solid ${c.border}`,
            boxShadow: showNotifications ? (mode === "dark" ? "-4px 0 20px rgba(0,0,0,0.4)" : "-4px 0 20px rgba(0,0,0,0.1)") : "none",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
            <p className="text-sm font-semibold" style={{ color: c.text }}>Notifications</p>
            <button onClick={() => setShowNotifications(false)} className="p-1 rounded-md" style={{ color: c.textMuted }}><I d={ic.close} s={14} /></button>
          </div>
          <div className="p-3 space-y-2 overflow-y-auto" style={{ height: "calc(100% - 48px)" }}>
            {[
              { title: "System Update", desc: "Alternus OS v1.1 is available", time: "2 min ago", icon: ic.settings },
              { title: "Welcome", desc: "Welcome to Alternus OS! Explore your new desktop.", time: "5 min ago", icon: ic.sparkle },
              { title: "Network", desc: "Connected to AlternusNet · 5GHz", time: "10 min ago", icon: ic.wifi },
              { title: "Store", desc: "3 new apps available in the Store", time: "15 min ago", icon: ic.store },
              { title: "Calendar", desc: "Team meeting tomorrow at 10:00 AM", time: "30 min ago", icon: ic.calendar },
              { title: "Security", desc: "Your system is protected and up to date", time: "1 hr ago", icon: ic.user },
            ].map((n, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl transition-colors"
                style={{ background: i < 2 ? c.accentSoft : "transparent" }}
                onMouseEnter={e => { if (i >= 2) e.currentTarget.style.background = c.cardAlt; }}
                onMouseLeave={e => { if (i >= 2) e.currentTarget.style.background = "transparent"; }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: i < 2 ? c.accent : c.cardAlt }}>
                  <I d={n.icon} s={14} c={i < 2 ? "#fff" : c.textSec} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium" style={{ color: c.text }}>{n.title}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: c.textMuted }}>{n.desc}</p>
                  <p className="text-[9px] mt-1" style={{ color: c.textMuted }}>{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
