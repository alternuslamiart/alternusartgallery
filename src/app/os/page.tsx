"use client";

import { useState, useEffect, useRef } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alternus OS — AI-Powered Creative Operating System
// Clean, soft, minimal UI. No heavy gradients. Fluid design.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type ThemeMode = "dark" | "light";

const t = {
  dark: {
    bg: "#0B0F19",
    surface: "#111827",
    card: "#1A2233",
    cardAlt: "#151D2E",
    border: "#1E293B",
    borderLight: "#243044",
    text: "#F1F5F9",
    textSec: "#94A3B8",
    textMuted: "#64748B",
    accent: "#3B82F6",
    accentSoft: "rgba(59,130,246,0.12)",
    accentText: "#60A5FA",
    success: "#34D399",
    successSoft: "rgba(52,211,153,0.12)",
    warning: "#FBBF24",
    warningSoft: "rgba(251,191,36,0.12)",
    danger: "#F87171",
    dangerSoft: "rgba(248,113,113,0.12)",
    purple: "#A78BFA",
    purpleSoft: "rgba(167,139,250,0.12)",
  },
  light: {
    bg: "#F8FAFC",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    cardAlt: "#F1F5F9",
    border: "#E2E8F0",
    borderLight: "#F1F5F9",
    text: "#0F172A",
    textSec: "#64748B",
    textMuted: "#94A3B8",
    accent: "#3B82F6",
    accentSoft: "rgba(59,130,246,0.08)",
    accentText: "#2563EB",
    success: "#10B981",
    successSoft: "rgba(16,185,129,0.08)",
    warning: "#F59E0B",
    warningSoft: "rgba(245,158,11,0.08)",
    danger: "#EF4444",
    dangerSoft: "rgba(239,68,68,0.08)",
    purple: "#8B5CF6",
    purpleSoft: "rgba(139,92,246,0.08)",
  },
};

// ━━━━ Reusable Styles ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const card = (theme: typeof t.dark) =>
  ({
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: 16,
  }) as const;

const cardInner = (theme: typeof t.dark) =>
  ({
    background: theme.cardAlt,
    borderRadius: 12,
    padding: "12px 14px",
  }) as const;

// ━━━━ Icons (simple, clean strokes) ━━━━━━━━━━━━━━━━━━━━━━
function Icon({
  d,
  size = 18,
  fill,
  color,
}: {
  d: string;
  size?: number;
  fill?: string;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill || "none"}
      stroke={color || "currentColor"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

const icons = {
  terminal: "M4 17l6-6-6-6M12 19h8",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  sparkle:
    "M12 3v1m0 16v1m-8-9H3m18 0h1M5.6 5.6l.7.7m12.1 12.1l.7.7M5.6 18.4l.7-.7m12.1-12.1l.7-.7M12 8a4 4 0 100 8 4 4 0 000-8z",
  folder: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
  settings:
    "M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z",
  bell: "M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 003.4 0",
  music: "M9 18V5l12-2v13M6 18a3 3 0 100-6 3 3 0 000 6zM18 16a3 3 0 100-6 3 3 0 000 6z",
  calendar:
    "M3 10h18M8 2v4M16 2v4M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z",
  cloud: "M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 110 9z",
  chart: "M18 20V10M12 20V4M6 20v-6",
  wallet: "M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7zM2 10h20",
  search: "M11 11a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
  sun: "M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41",
  moon: "M12 3a6 6 0 009 9 9 9 0 11-9-9z",
  wifi: "M5 13a10 10 0 0114 0M8.5 16.5a5 5 0 017 0M2 8.82a15 15 0 0120 0M12 20h.01",
  play: "M5 3l14 9-14 9V3z",
  pause: "M6 4h4v16H6zM14 4h4v16h-4z",
  skip: "M5 4l10 8-10 8V4zM19 5v14",
  chevronR: "M9 18l6-6-6-6",
  chevronL: "M15 18l-6-6 6-6",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z",
  cpu: "M4 4h16v16H4zM9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3",
  globe: "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z",
  layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN OS COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function AlternusOS() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [time, setTime] = useState(new Date());
  const [isLocked, setIsLocked] = useState(true);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([
    {
      role: "ai",
      text: "Welcome to Alternus OS. I'm your AI assistant. Ask me to create apps, write code, or help with anything.",
    },
  ]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const aiEndRef = useRef<HTMLDivElement>(null);

  const c = t[mode];

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  // AI chat handler
  const sendAiMessage = () => {
    if (!aiInput.trim()) return;
    const msg = aiInput.trim();
    setAiInput("");
    setAiMessages((prev) => [...prev, { role: "user", text: msg }]);

    setTimeout(() => {
      let reply = "I understand. Let me help you with that.";
      if (msg.toLowerCase().includes("create") || msg.toLowerCase().includes("build")) {
        reply =
          "I can help you build that. Let me generate the code structure and components. Would you like me to proceed with React, Python, or another framework?";
      } else if (msg.toLowerCase().includes("code") || msg.toLowerCase().includes("function")) {
        reply =
          "Here's a code approach for that:\n\n```\nfunction solve(input) {\n  // Processing logic\n  return result;\n}\n```\n\nWant me to elaborate?";
      } else if (msg.toLowerCase().includes("design") || msg.toLowerCase().includes("ui")) {
        reply =
          "I'll design a clean, minimal interface for that. Focusing on usability and aesthetics. Shall I generate a wireframe?";
      } else if (msg.toLowerCase().includes("hello") || msg.toLowerCase().includes("hi")) {
        reply =
          "Hello! I'm Alternus AI. I can help you create applications, write code, design interfaces, and much more. What would you like to build today?";
      }
      setAiMessages((prev) => [...prev, { role: "ai", text: reply }]);
    }, 800);
  };

  // Calendar data
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const calDays: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null as null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Music tracks
  const tracks = [
    { name: "Focus Flow", artist: "Ambient AI", duration: "3:42" },
    { name: "Deep Work", artist: "Neural Beats", duration: "4:15" },
    { name: "Code Session", artist: "Synthwave", duration: "5:01" },
    { name: "Creative Space", artist: "Lo-Fi Engine", duration: "3:58" },
    { name: "Night Coding", artist: "Chill Pulse", duration: "4:33" },
  ];

  // Notifications
  const notifs = [
    { title: "Build Successful", desc: "Project compiled with 0 errors", time: "2m", type: "success" },
    { title: "New Collaborator", desc: "Eva joined your workspace", time: "5m", type: "info" },
    { title: "AI Training Complete", desc: "Model accuracy: 94.2%", time: "12m", type: "purple" },
    { title: "Storage Warning", desc: "85% of cloud storage used", time: "1h", type: "warning" },
  ];

  // ━━━━ LOCK SCREEN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isLocked) {
    return (
      <div
        style={{ background: c.bg }}
        className="fixed inset-0 flex flex-col items-center justify-center"
      >
        {/* Subtle ambient */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.04] pointer-events-none"
          style={{ background: c.accent, filter: "blur(120px)", top: "20%", left: "30%" }}
        />

        <div className="relative z-10 flex flex-col items-center">
          <p style={{ color: c.text }} className="text-6xl font-extralight tracking-wide mb-1">
            {fmt(time)}
          </p>
          <p style={{ color: c.textMuted }} className="text-sm mb-12">
            {fmtDate(time)}
          </p>

          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
            style={{ background: c.accentSoft }}
          >
            <span style={{ color: c.accentText }} className="text-xl font-semibold">
              A
            </span>
          </div>
          <p style={{ color: c.text }} className="text-sm font-medium mb-6">
            Alternus OS
          </p>

          <button
            onClick={() => setIsLocked(false)}
            className="px-8 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.97] cursor-pointer"
            style={{ background: c.accent }}
          >
            Unlock
          </button>

          <p style={{ color: c.textMuted }} className="text-xs mt-4">
            Click to enter
          </p>
        </div>
      </div>
    );
  }

  // ━━━━ DESKTOP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div style={{ background: c.bg }} className="fixed inset-0 flex flex-col overflow-hidden">
      {/* ── Top Bar ────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 h-10 flex-shrink-0"
        style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: c.accentText }} className="text-xs font-bold tracking-wider">
            ALTERNUS
          </span>
          <span style={{ color: c.textMuted }} className="text-[10px]">
            OS v1.0
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span style={{ color: c.textSec }} className="text-xs">
            {fmt(time)}
          </span>
          <span style={{ color: c.textMuted }} className="text-xs mx-1">
            ·
          </span>
          <span style={{ color: c.textMuted }} className="text-xs">
            {time.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            className="p-1 rounded-md transition-colors"
            style={{ color: c.textSec }}
          >
            <Icon d={mode === "dark" ? icons.sun : icons.moon} size={14} />
          </button>
          <span style={{ color: c.textSec }}>
            <Icon d={icons.wifi} size={13} />
          </span>
          <span style={{ color: c.textSec }} className="text-xs">
            100%
          </span>
          <button
            onClick={() => setIsLocked(true)}
            className="ml-1 p-1 rounded-md transition-colors"
            style={{ color: c.textMuted }}
          >
            <Icon d={icons.user} size={14} />
          </button>
        </div>
      </div>

      {/* ── Main Content: Bento Grid ──────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-3 md:gap-4 auto-rows-min">
          {/* ─── AI Assistant (Main Card) ─────────────── */}
          <div
            className="col-span-12 lg:col-span-8 row-span-2 flex flex-col overflow-hidden"
            style={{ ...card(c), minHeight: 420 }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-5 py-3"
              style={{ borderBottom: `1px solid ${c.border}` }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: c.accentSoft }}
              >
                <Icon d={icons.sparkle} size={14} color={c.accentText} />
              </div>
              <div>
                <p style={{ color: c.text }} className="text-sm font-semibold">
                  Alternus AI
                </p>
                <p style={{ color: c.textMuted }} className="text-[10px]">
                  Code · Create · Design · Build
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: c.success }}
                />
                <span style={{ color: c.success }} className="text-[10px]">
                  Online
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {aiMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[75%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed"
                    style={
                      msg.role === "user"
                        ? { background: c.accent, color: "#fff" }
                        : { background: c.cardAlt, color: c.text, border: `1px solid ${c.border}` }
                    }
                  >
                    <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                  </div>
                </div>
              ))}
              <div ref={aiEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4">
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}
              >
                <input
                  type="text"
                  placeholder="Ask AI to create, code, design..."
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: c.text }}
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendAiMessage()}
                />
                <button
                  onClick={sendAiMessage}
                  className="p-2 rounded-lg transition-colors"
                  style={{ background: c.accent, color: "#fff" }}
                >
                  <Icon d={icons.send} size={14} color="#fff" />
                </button>
              </div>
            </div>
          </div>

          {/* ─── Quick Actions ────────────────────────── */}
          <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-3 md:gap-4">
            {[
              { icon: icons.terminal, label: "Terminal", desc: "Command line", color: c.success, bg: c.successSoft },
              { icon: icons.code, label: "Code Editor", desc: "Write & run", color: c.accentText, bg: c.accentSoft },
              { icon: icons.layers, label: "Projects", desc: "Your workspace", color: c.purple, bg: c.purpleSoft },
              { icon: icons.zap, label: "Deploy", desc: "Ship to cloud", color: c.warning, bg: c.warningSoft },
            ].map((item, i) => (
              <button
                key={i}
                className="flex flex-col gap-3 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ ...card(c) }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: item.bg }}
                >
                  <Icon d={item.icon} size={16} color={item.color} />
                </div>
                <div>
                  <p style={{ color: c.text }} className="text-sm font-medium">
                    {item.label}
                  </p>
                  <p style={{ color: c.textMuted }} className="text-[11px]">
                    {item.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* ─── Notifications ────────────────────────── */}
          <div className="col-span-12 md:col-span-6 lg:col-span-4" style={card(c)}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${c.border}` }}>
              <div className="flex items-center gap-2">
                <Icon d={icons.bell} size={15} color={c.textSec} />
                <p style={{ color: c.text }} className="text-sm font-semibold">
                  Notifications
                </p>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ background: c.accentSoft, color: c.accentText }}
              >
                {notifs.length}
              </span>
            </div>
            <div className="p-2 space-y-0.5">
              {notifs.map((n, i) => {
                const colors = {
                  success: { dot: c.success, bg: c.successSoft },
                  info: { dot: c.accent, bg: c.accentSoft },
                  purple: { dot: c.purple, bg: c.purpleSoft },
                  warning: { dot: c.warning, bg: c.warningSoft },
                }[n.type] || { dot: c.accent, bg: c.accentSoft };

                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer"
                    style={{ ["--hover" as string]: c.cardAlt }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = c.cardAlt)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: colors.bg }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: colors.dot }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: c.text }} className="text-xs font-medium">
                        {n.title}
                      </p>
                      <p style={{ color: c.textMuted }} className="text-[11px] truncate">
                        {n.desc}
                      </p>
                    </div>
                    <span style={{ color: c.textMuted }} className="text-[10px] flex-shrink-0">
                      {n.time}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="px-4 pb-3">
              <button
                className="w-full py-2 rounded-xl text-xs font-medium transition-colors"
                style={{ color: c.accentText, background: c.accentSoft }}
              >
                Mark all as read
              </button>
            </div>
          </div>

          {/* ─── Calendar ─────────────────────────────── */}
          <div className="col-span-12 md:col-span-6 lg:col-span-4" style={card(c)}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${c.border}` }}>
              <div className="flex items-center gap-2">
                <Icon d={icons.calendar} size={15} color={c.textSec} />
                <p style={{ color: c.text }} className="text-sm font-semibold">
                  {now.toLocaleString("default", { month: "long" })} {now.getFullYear()}
                </p>
              </div>
              <div className="flex gap-1">
                <button className="p-1 rounded-md" style={{ color: c.textMuted }}>
                  <Icon d={icons.chevronL} size={14} />
                </button>
                <button className="p-1 rounded-md" style={{ color: c.textMuted }}>
                  <Icon d={icons.chevronR} size={14} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div
                    key={i}
                    style={{ color: c.textMuted }}
                    className="text-center text-[10px] font-medium py-1"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calDays.map((day, i) => (
                  <button
                    key={i}
                    onClick={() => day && setSelectedDay(day)}
                    className="aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all"
                    style={{
                      background:
                        day === selectedDay
                          ? c.accent
                          : day === now.getDate()
                          ? c.accentSoft
                          : "transparent",
                      color:
                        day === selectedDay
                          ? "#fff"
                          : day === now.getDate()
                          ? c.accentText
                          : day
                          ? c.text
                          : "transparent",
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Music Player ─────────────────────────── */}
          <div className="col-span-12 md:col-span-6 lg:col-span-4" style={card(c)}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${c.border}` }}>
              <Icon d={icons.music} size={15} color={c.textSec} />
              <p style={{ color: c.text }} className="text-sm font-semibold">
                Music
              </p>
            </div>

            <div className="p-2 space-y-0.5 max-h-[180px] overflow-y-auto">
              {tracks.map((track, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentTrack(i);
                    setIsPlaying(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors"
                  style={{
                    background: i === currentTrack ? c.accentSoft : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (i !== currentTrack) e.currentTarget.style.background = c.cardAlt;
                  }}
                  onMouseLeave={(e) => {
                    if (i !== currentTrack) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: i === currentTrack ? c.accent : c.cardAlt,
                    }}
                  >
                    {i === currentTrack && isPlaying ? (
                      <div className="flex gap-[2px] items-end h-3">
                        {[2, 3, 4, 2].map((h, j) => (
                          <div
                            key={j}
                            className="w-[2px] rounded-full bg-white animate-pulse"
                            style={{ height: h * 3, animationDelay: `${j * 0.1}s` }}
                          />
                        ))}
                      </div>
                    ) : (
                      <Icon d={icons.music} size={12} color={i === currentTrack ? "#fff" : c.textMuted} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-medium truncate"
                      style={{ color: i === currentTrack ? c.accentText : c.text }}
                    >
                      {track.name}
                    </p>
                    <p style={{ color: c.textMuted }} className="text-[10px]">
                      {track.artist}
                    </p>
                  </div>
                  <span style={{ color: c.textMuted }} className="text-[10px]">
                    {track.duration}
                  </span>
                </button>
              ))}
            </div>

            {/* Player Controls */}
            <div className="px-4 py-3" style={{ borderTop: `1px solid ${c.border}` }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p style={{ color: c.text }} className="text-xs font-medium truncate">
                    {tracks[currentTrack].name}
                  </p>
                  <p style={{ color: c.textMuted }} className="text-[10px]">
                    {tracks[currentTrack].artist}
                  </p>
                </div>
              </div>
              <div className="w-full h-1 rounded-full mb-3" style={{ background: c.cardAlt }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ background: c.accent, width: isPlaying ? "45%" : "0%" }}
                />
              </div>
              <div className="flex items-center justify-center gap-5">
                <button
                  style={{ color: c.textSec }}
                  onClick={() => setCurrentTrack((p) => (p > 0 ? p - 1 : tracks.length - 1))}
                >
                  <Icon d={icons.skip} size={14} />
                </button>
                <button
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: c.accent }}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  <Icon
                    d={isPlaying ? icons.pause : icons.play}
                    size={12}
                    color="#fff"
                    fill="#fff"
                  />
                </button>
                <button
                  style={{ color: c.textSec }}
                  onClick={() => setCurrentTrack((p) => (p < tracks.length - 1 ? p + 1 : 0))}
                >
                  <Icon d={icons.skip} size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* ─── Weather ──────────────────────────────── */}
          <div className="col-span-12 md:col-span-6 lg:col-span-4" style={card(c)}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${c.border}` }}>
              <Icon d={icons.cloud} size={15} color={c.textSec} />
              <p style={{ color: c.text }} className="text-sm font-semibold">
                Weather
              </p>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p style={{ color: c.text }} className="text-3xl font-light">
                    17°
                  </p>
                  <p style={{ color: c.textMuted }} className="text-xs">
                    Partly Cloudy
                  </p>
                </div>
                <span className="text-3xl">&#9925;</span>
              </div>

              <div className="flex gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => (
                  <div
                    key={day}
                    className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl"
                    style={{
                      background: i === 2 ? c.accentSoft : "transparent",
                    }}
                  >
                    <span
                      style={{ color: i === 2 ? c.accentText : c.textMuted }}
                      className="text-[10px] font-medium"
                    >
                      {day}
                    </span>
                    <span className="text-sm">{["&#9728;", "&#9925;", "&#9926;", "&#9925;", "&#9728;"][i].replace(/&#(\d+);/, (_, code) => String.fromCharCode(Number(code)))}</span>
                    <span
                      style={{ color: i === 2 ? c.accentText : c.text }}
                      className="text-[11px] font-medium"
                    >
                      {[15, 14, 17, 16, 19][i]}°
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="p-3 rounded-xl" style={cardInner(c)}>
                  <p style={{ color: c.textMuted }} className="text-[10px]">
                    Humidity
                  </p>
                  <p style={{ color: c.text }} className="text-sm font-semibold">
                    62%
                  </p>
                </div>
                <div className="p-3 rounded-xl" style={cardInner(c)}>
                  <p style={{ color: c.textMuted }} className="text-[10px]">
                    Wind
                  </p>
                  <p style={{ color: c.text }} className="text-sm font-semibold">
                    12 km/h
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── System Stats ─────────────────────────── */}
          <div className="col-span-12 lg:col-span-4" style={card(c)}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${c.border}` }}>
              <Icon d={icons.cpu} size={15} color={c.textSec} />
              <p style={{ color: c.text }} className="text-sm font-semibold">
                System
              </p>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: "CPU Usage", value: "23%", pct: 23, color: c.accent },
                { label: "Memory", value: "4.2 / 16 GB", pct: 26, color: c.purple },
                { label: "Storage", value: "124 / 256 GB", pct: 48, color: c.success },
                { label: "GPU", value: "12%", pct: 12, color: c.warning },
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span style={{ color: c.textSec }} className="text-[11px]">
                      {s.label}
                    </span>
                    <span style={{ color: c.text }} className="text-[11px] font-medium">
                      {s.value}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: c.cardAlt }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ background: s.color, width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Settings Quick Access ────────────────── */}
          <div className="col-span-12 lg:col-span-4" style={card(c)}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${c.border}` }}>
              <Icon d={icons.settings} size={15} color={c.textSec} />
              <p style={{ color: c.text }} className="text-sm font-semibold">
                Settings
              </p>
            </div>
            <div className="p-2 space-y-0.5">
              {[
                { icon: icons.wifi, label: "Network", desc: "Connected · 5GHz" },
                { icon: icons.bell, label: "Notifications", desc: "4 unread" },
                { icon: icons.globe, label: "Language", desc: "English (US)" },
                { icon: icons.user, label: "Account", desc: "admin@alternus.art" },
                { icon: icons.moon, label: "Appearance", desc: mode === "dark" ? "Dark Mode" : "Light Mode" },
              ].map((item, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors"
                  onMouseEnter={(e) => (e.currentTarget.style.background = c.cardAlt)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  onClick={() => {
                    if (item.label === "Appearance") setMode(mode === "dark" ? "light" : "dark");
                  }}
                >
                  <span style={{ color: c.textSec }}>
                    <Icon d={item.icon} size={16} />
                  </span>
                  <div className="flex-1">
                    <p style={{ color: c.text }} className="text-xs font-medium">
                      {item.label}
                    </p>
                    <p style={{ color: c.textMuted }} className="text-[10px]">
                      {item.desc}
                    </p>
                  </div>
                  <Icon d={icons.chevronR} size={12} color={c.textMuted} />
                </button>
              ))}
            </div>
          </div>

          {/* ─── Wallet Card ──────────────────────────── */}
          <div className="col-span-12 lg:col-span-4" style={card(c)}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${c.border}` }}>
              <Icon d={icons.wallet} size={15} color={c.textSec} />
              <p style={{ color: c.text }} className="text-sm font-semibold">
                Wallet
              </p>
            </div>
            <div className="p-4">
              {/* Card Visual */}
              <div
                className="w-full h-36 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden"
                style={{ background: c.accent }}
              >
                <div
                  className="absolute -top-8 -right-8 w-24 h-24 rounded-full"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                />
                <div className="flex justify-between items-start relative z-10">
                  <p className="text-white/70 text-[10px] font-medium">ALTERNUS PAY</p>
                  <p className="text-white text-xs font-bold">VISA</p>
                </div>
                <div className="relative z-10">
                  <p className="text-white text-base font-mono tracking-widest">
                    •••• •••• •••• 4821
                  </p>
                  <p className="text-white/60 text-[10px] mt-1">Valid 09/27</p>
                </div>
              </div>

              {/* Balance */}
              <div className="mt-3 p-3 rounded-xl" style={cardInner(c)}>
                <p style={{ color: c.textMuted }} className="text-[10px]">
                  Balance
                </p>
                <p style={{ color: c.text }} className="text-xl font-semibold">
                  $12,847<span style={{ color: c.textMuted }} className="text-sm">.50</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Dock ───────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-center py-2">
        <div
          className="flex items-center gap-1 px-3 py-1.5 rounded-2xl"
          style={{ background: c.surface, border: `1px solid ${c.border}` }}
        >
          {[
            { icon: icons.sparkle, label: "AI", color: c.accentText },
            { icon: icons.terminal, label: "Terminal", color: c.success },
            { icon: icons.code, label: "Code", color: c.purple },
            { icon: icons.folder, label: "Files", color: c.warning },
            { icon: icons.globe, label: "Browser", color: c.accentText },
            { icon: icons.music, label: "Music", color: "#F472B6" },
            { icon: icons.settings, label: "Settings", color: c.textSec },
          ].map((app, i) => (
            <div key={i} className="relative group">
              <button
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{ background: activePanel === app.label ? c.accentSoft : "transparent" }}
                onClick={() => setActivePanel(activePanel === app.label ? null : app.label)}
              >
                <Icon d={app.icon} size={18} color={app.color} />
              </button>
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                style={{ background: c.surface, color: c.text, border: `1px solid ${c.border}` }}
              >
                {app.label}
              </div>
            </div>
          ))}

          <div className="w-px h-6 mx-1" style={{ background: c.border }} />

          <button
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
          >
            <Icon d={mode === "dark" ? icons.sun : icons.moon} size={18} color={c.textSec} />
          </button>
        </div>
      </div>
    </div>
  );
}
