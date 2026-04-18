"use client";

import { useState, useRef, useEffect } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alternus AI Studio — Tools browser + expanded capabilities
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type ThemeMode = "dark" | "light";

interface ChatMsg {
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface Capability {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  iconBg: string;
  category: string;
  type: string;
}

// ━━━━ Palette ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const pal = {
  light: {
    pageBg: "#F8F8FB",
    sidebarBg: "#FFFFFF",
    mainBg: "#F8F8FB",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    cardHover: "#F5F5FA",
    cardActive: "#F0EFF8",
    border: "#EBEBF0",
    borderLight: "#F2F2F5",
    text: "#16141F",
    textSec: "#5A5870",
    textMuted: "#9896A8",
    accent: "#7C6FFF",
    accentSoft: "rgba(124,111,255,0.08)",
    accentText: "#6356E8",
    accentBorder: "rgba(124,111,255,0.25)",
    success: "#22C07A",
    successSoft: "rgba(34,192,122,0.10)",
    checkBorder: "#D0D0DC",
    checkBg: "#FFFFFF",
    checkActive: "#7C6FFF",
    tagBg: "rgba(124,111,255,0.08)",
    tagText: "#6356E8",
    shadow: "0 1px 4px rgba(60,50,120,0.06)",
    shadowMd: "0 2px 12px rgba(60,50,120,0.08)",
    inputBg: "#FFFFFF",
    inputBorder: "#E4E2F0",
    msgUserBg: "#7C6FFF",
    bubbleBg: "#F2F0FF",
    bubbleBorder: "#E4E0F5",
    sidebarWidth: 220,
    avatarFrom: "#FF8B3E",
    avatarTo: "#FF5F1F",
    online: "#22C07A",
    liveDot: "#22C07A",
    footerBg: "#FFFFFF",
    footerBorder: "#EBEBF0",
  },
  dark: {
    pageBg: "#141320",
    sidebarBg: "#1A1929",
    mainBg: "#141320",
    surface: "#1E1D2E",
    card: "#1E1D2E",
    cardHover: "#252440",
    cardActive: "#2A2945",
    border: "#2E2C44",
    borderLight: "#252440",
    text: "#EEEDF8",
    textSec: "#9C9AB8",
    textMuted: "#6B6888",
    accent: "#8B7FFF",
    accentSoft: "rgba(139,127,255,0.12)",
    accentText: "#A09CFF",
    accentBorder: "rgba(139,127,255,0.25)",
    success: "#3DD68C",
    successSoft: "rgba(61,214,140,0.12)",
    checkBorder: "#3A3858",
    checkBg: "#1E1D2E",
    checkActive: "#8B7FFF",
    tagBg: "rgba(139,127,255,0.14)",
    tagText: "#A09CFF",
    shadow: "0 1px 6px rgba(0,0,0,0.2)",
    shadowMd: "0 2px 16px rgba(0,0,0,0.28)",
    inputBg: "#1E1D2E",
    inputBorder: "#2E2C44",
    msgUserBg: "#8B7FFF",
    bubbleBg: "#252440",
    bubbleBorder: "#2E2C44",
    sidebarWidth: 220,
    avatarFrom: "#FF8B3E",
    avatarTo: "#FF5F1F",
    online: "#3DD68C",
    liveDot: "#3DD68C",
    footerBg: "#1A1929",
    footerBorder: "#2E2C44",
  },
};

// ━━━━ Icons ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Ico({ d, s = 16, color }: { d: string; s?: number; color?: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ic = {
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  close: "M18 6L6 18M6 6l12 12",
  chevDown: "M6 9l6 6 6-6",
  chevRight: "M9 18l6-6-6-6",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  sort: "M3 6h18M7 12h10M11 18h2",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  attach: "M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48",
  mic: "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8",
  sparkle: "M12 3v1m0 16v1m-8-9H3m18 0h1M5.6 5.6l.7.7m12.1 12.1l.7.7M5.6 18.4l.7-.7m12.1-12.1l.7-.7M12 8a4 4 0 100 8 4 4 0 000-8z",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  doc: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  folder: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
  globe: "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z",
  monitor: "M2 3h20v14H2zM8 21h8M12 17v4",
  terminal: "M4 17l6-6-6-6M12 19h8",
  sun: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 6a6 6 0 100 12 6 6 0 000-12z",
  moon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  image: "M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.5 8.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM21 15l-5-5L5 21",
  wifi: "M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01",
  settings: "M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z",
  calendar: "M3 10h18M8 2v4M16 2v4M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z",
  power: "M18.36 6.64a9 9 0 11-12.73 0M12 2v10",
  cpu: "M18 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2zM9 9h6v6H9z",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
};

// ━━━━ Capabilities data ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ALL_CAPABILITIES: Capability[] = [
  {
    id: "email", label: "Email", desc: "Draft & send messages",
    icon: <Ico d={ic.mail} s={24} color="#FF8B3E" />,
    iconBg: "rgba(255,139,62,0.12)", category: "Communication", type: "Built-in",
  },
  {
    id: "documents", label: "Documents", desc: "Create & edit docs",
    icon: <Ico d={ic.doc} s={24} color="#6B9FFF" />,
    iconBg: "rgba(107,159,255,0.12)", category: "Productivity", type: "Built-in",
  },
  {
    id: "files", label: "Files", desc: "Manage & organize",
    icon: <Ico d={ic.folder} s={24} color="#3DD68C" />,
    iconBg: "rgba(61,214,140,0.12)", category: "System", type: "Built-in",
  },
  {
    id: "research", label: "Research", desc: "Browse & analyze info",
    icon: <Ico d={ic.globe} s={24} color="#6B9FFF" />,
    iconBg: "rgba(107,159,255,0.12)", category: "Productivity", type: "Built-in",
  },
  {
    id: "apps", label: "Apps", desc: "Launch & control apps",
    icon: <Ico d={ic.monitor} s={24} color="#3DD6CC" />,
    iconBg: "rgba(61,214,204,0.12)", category: "System", type: "Built-in",
  },
  {
    id: "terminal", label: "Terminal", desc: "Run system commands",
    icon: <Ico d={ic.terminal} s={24} color="#8B8FA5" />,
    iconBg: "rgba(139,143,165,0.12)", category: "Development", type: "Built-in",
  },
  {
    id: "theme", label: "Theme", desc: "Switch dark / light",
    icon: <Ico d={ic.sun} s={24} color="#F5B73B" />,
    iconBg: "rgba(245,183,59,0.12)", category: "System", type: "Built-in",
  },
  {
    id: "wallpaper", label: "Wallpaper", desc: "Change desktop background",
    icon: <Ico d={ic.image} s={24} color="#F472B6" />,
    iconBg: "rgba(244,114,182,0.12)", category: "System", type: "Built-in",
  },
  {
    id: "network", label: "Network", desc: "WiFi & connection info",
    icon: <Ico d={ic.wifi} s={24} color="#3DD6CC" />,
    iconBg: "rgba(61,214,204,0.12)", category: "System", type: "Built-in",
  },
  {
    id: "system", label: "System", desc: "CPU, memory & status",
    icon: <Ico d={ic.cpu} s={24} color="#7C6FFF" />,
    iconBg: "rgba(124,111,255,0.12)", category: "System", type: "Built-in",
  },
  {
    id: "calendar", label: "Calendar", desc: "Schedule & events",
    icon: <Ico d={ic.calendar} s={24} color="#A78BFA" />,
    iconBg: "rgba(167,139,250,0.12)", category: "Productivity", type: "Built-in",
  },
  {
    id: "power", label: "Power", desc: "Restart or shut down",
    icon: <Ico d={ic.power} s={24} color="#F47272" />,
    iconBg: "rgba(244,114,114,0.12)", category: "System", type: "Built-in",
  },
  {
    id: "code", label: "Code Editor", desc: "Write & review code",
    icon: <Ico d={ic.code} s={24} color="#6B9FFF" />,
    iconBg: "rgba(107,159,255,0.12)", category: "Development", type: "Built-in",
  },
  {
    id: "security", label: "Security", desc: "Protect & monitor access",
    icon: <Ico d={ic.shield} s={24} color="#3DD68C" />,
    iconBg: "rgba(61,214,140,0.12)", category: "System", type: "Built-in",
  },
  {
    id: "ai", label: "AI Assistant", desc: "Intelligent task automation",
    icon: <Ico d={ic.sparkle} s={24} color="#7C6FFF" />,
    iconBg: "rgba(124,111,255,0.12)", category: "Productivity", type: "Built-in",
  },
];

const CATEGORIES = ["All", "Communication", "Productivity", "Development", "System"];
const TYPES = ["Built-in"];

// ━━━━ Checkbox ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Checkbox({ checked, onChange, label, count, c }: {
  checked: boolean; onChange: () => void; label: string; count: number;
  c: typeof pal.light;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 0",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <div
        onClick={onChange}
        style={{
          width: 15,
          height: 15,
          borderRadius: 4,
          border: `1.5px solid ${checked ? c.checkActive : c.checkBorder}`,
          background: checked ? c.checkActive : c.checkBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.12s ease",
        }}
      >
        {checked && (
          <svg width={9} height={9} viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: 13, color: checked ? c.text : c.textSec, flex: 1 }} onClick={onChange}>{label}</span>
      <span
        style={{
          fontSize: 11,
          color: checked ? c.accentText : c.textMuted,
          background: checked ? c.tagBg : "transparent",
          padding: checked ? "1px 6px" : "1px 0",
          borderRadius: 99,
          fontWeight: 500,
          minWidth: 16,
          textAlign: "center",
        }}
      >
        {count}
      </span>
    </label>
  );
}

// ━━━━ Main page ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function AlternusOSPage() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Default");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const c = pal[theme];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  // Filter capabilities
  const filtered = ALL_CAPABILITIES.filter(cap => {
    const matchesSearch = !searchQuery ||
      cap.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cap.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategories.length === 0 ||
      activeCategories.includes(cap.category);
    return matchesSearch && matchesCategory;
  });

  const sortedFiltered = [...filtered].sort((a, b) => {
    if (sortBy === "A–Z") return a.label.localeCompare(b.label);
    if (sortBy === "Z–A") return b.label.localeCompare(a.label);
    return 0;
  });

  const toggleCategory = (cat: string) => {
    if (cat === "All") { setActiveCategories([]); return; }
    setActiveCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const catCount = (cat: string) =>
    ALL_CAPABILITIES.filter(cap => cat === "All" ? true : cap.category === cat).length;

  const sendMessage = async (text?: string) => {
    const m = (text || chatInput).trim();
    if (!m || isTyping) return;
    setChatInput("");
    setMsgs(p => [...p, { role: "user", text: m, timestamp: new Date() }]);
    setIsTyping(true);
    setMsgs(p => [...p, { role: "ai", text: "", timestamp: new Date() }]);

    try {
      const history = msgs.map(msg => ({
        role: msg.role === "ai" ? "assistant" as const : "user" as const,
        content: msg.text,
      })).slice(-10);

      const res = await fetch("/api/os/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: m, conversationHistory: history, osContext: { openApps: [], theme } }),
      });
      if (!res.ok || !res.body) throw new Error();
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let actionsProcessed = false;
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        if (!actionsProcessed) {
          const nl = buffer.indexOf("\n");
          if (nl !== -1) { buffer = buffer.slice(nl + 1); actionsProcessed = true; }
        } else { fullText += buffer; buffer = ""; }
        if (fullText) setMsgs(p => { const cp = [...p]; cp[cp.length - 1] = { ...cp[cp.length - 1], text: fullText }; return cp; });
      }
    } catch {
      setMsgs(p => { const cp = [...p]; cp[cp.length - 1] = { ...cp[cp.length - 1], text: "Something went wrong. Please try again." }; return cp; });
    } finally { setIsTyping(false); }
  };

  const handleCapabilityClick = (cap: Capability) => {
    setChatOpen(true);
    sendMessage(`Help me with: ${cap.label} — ${cap.desc}`);
  };

  const fmtTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: c.pageBg, color: c.text, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", overflow: "hidden" }}>

      {/* ── Top nav bar ── */}
      <div style={{ background: c.surface, borderBottom: `1px solid ${c.border}`, height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Hamburger for sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: c.textMuted }}
          >
            <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
              <rect x={1} y={3} width={14} height={1.5} rx={0.75} fill={c.textMuted} />
              <rect x={1} y={7.25} width={14} height={1.5} rx={0.75} fill={c.textMuted} />
              <rect x={1} y={11.5} width={14} height={1.5} rx={0.75} fill={c.textMuted} />
            </svg>
          </button>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${c.avatarFrom}, ${c.avatarTo})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, color: "#fff" }}>AA</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1 }}>Alternus AI</div>
              <div style={{ fontSize: 10, color: c.textMuted, lineHeight: 1, marginTop: 2 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.online, display: "inline-block" }} />
                  All services are online
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${c.border}`, background: "transparent", color: c.textMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Ico d={theme === "light" ? ic.moon : ic.sun} s={14} color={c.textMuted} />
          </button>
          {/* Chat toggle */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8,
              border: `1px solid ${chatOpen ? c.accentBorder : c.border}`,
              background: chatOpen ? c.accentSoft : "transparent",
              color: chatOpen ? c.accentText : c.textSec,
              cursor: "pointer", fontSize: 12, fontWeight: 500,
            }}
          >
            <Ico d={ic.sparkle} s={13} color={chatOpen ? c.accentText : c.textSec} />
            AI Chat
            {msgs.length > 0 && (
              <span style={{ width: 16, height: 16, borderRadius: "50%", background: c.accent, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {msgs.filter(m => m.role === "ai").length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Body (sidebar + main) ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── LEFT SIDEBAR ── */}
        {sidebarOpen && (
          <aside style={{ width: c.sidebarWidth, background: c.sidebarBg, borderRight: `1px solid ${c.border}`, flexShrink: 0, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Type */}
            <div>
              <button
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", marginBottom: 8, padding: 0 }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>Type</span>
                <Ico d={ic.chevDown} s={12} color={c.textMuted} />
              </button>
              {TYPES.map(t => (
                <Checkbox
                  key={t}
                  checked={false}
                  onChange={() => {}}
                  label={t}
                  count={ALL_CAPABILITIES.filter(cap => cap.type === t).length}
                  c={c}
                />
              ))}
            </div>

            {/* Category */}
            <div>
              <button
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", marginBottom: 8, padding: 0 }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>Category</span>
                <Ico d={ic.chevDown} s={12} color={c.textMuted} />
              </button>
              {CATEGORIES.slice(1).map(cat => (
                <Checkbox
                  key={cat}
                  checked={activeCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  label={cat}
                  count={catCount(cat)}
                  c={c}
                />
              ))}
            </div>
          </aside>
        )}

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Content area (capabilities or chat) */}
          {!chatOpen ? (
            <div style={{ flex: 1, overflowY: "auto", padding: "28px 28px 24px" }}>

              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px", margin: 0, lineHeight: 1.2 }}>
                    What I Can Do
                    <span style={{ fontSize: 14, fontWeight: 500, color: c.textMuted, marginLeft: 8 }}>({ALL_CAPABILITIES.length})</span>
                  </h1>
                  {activeCategories.length > 0 && (
                    <p style={{ fontSize: 12, color: c.textMuted, marginTop: 4 }}>
                      Showing {sortedFiltered.length} of {ALL_CAPABILITIES.length}
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Search */}
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                      <Ico d={ic.search} s={13} color={c.textMuted} />
                    </div>
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search"
                      style={{
                        paddingLeft: 30, paddingRight: 10, paddingTop: 7, paddingBottom: 7,
                        borderRadius: 8, border: `1.5px solid ${c.inputBorder}`,
                        background: c.inputBg, color: c.text, fontSize: 13, outline: "none",
                        width: 200, fontFamily: "inherit",
                        transition: "border-color 0.15s ease",
                      }}
                      onFocus={e => (e.target.style.borderColor = c.accent)}
                      onBlur={e => (e.target.style.borderColor = c.inputBorder)}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: c.textMuted, display: "flex", alignItems: "center" }}
                      >
                        <Ico d={ic.close} s={12} color={c.textMuted} />
                      </button>
                    )}
                  </div>

                  {/* Active filters */}
                  {activeCategories.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {activeCategories.map(cat => (
                        <span
                          key={cat}
                          style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 99, background: c.accentSoft, color: c.accentText, fontSize: 11, fontWeight: 500, border: `1px solid ${c.accentBorder}` }}
                        >
                          {cat}
                          <button onClick={() => toggleCategory(cat)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: c.accentText }}>
                            <Ico d={ic.close} s={10} color={c.accentText} />
                          </button>
                        </span>
                      ))}
                      <button
                        onClick={() => setActiveCategories([])}
                        style={{ padding: "4px 10px", borderRadius: 99, background: "none", border: "none", cursor: "pointer", fontSize: 11, color: c.textMuted }}
                      >
                        Clear filters
                      </button>
                    </div>
                  )}

                  {/* Sort */}
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => setShowSortMenu(!showSortMenu)}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: `1.5px solid ${c.inputBorder}`, background: c.inputBg, color: c.textSec, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Sort by: {sortBy}
                      <Ico d={ic.chevDown} s={12} color={c.textMuted} />
                    </button>
                    {showSortMenu && (
                      <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, boxShadow: c.shadowMd, zIndex: 100, minWidth: 140, padding: 4 }}>
                        {["Default", "A–Z", "Z–A"].map(opt => (
                          <button
                            key={opt}
                            onClick={() => { setSortBy(opt); setShowSortMenu(false); }}
                            style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", background: sortBy === opt ? c.accentSoft : "transparent", color: sortBy === opt ? c.accentText : c.textSec, fontSize: 13, border: "none", cursor: "pointer", borderRadius: 7, fontFamily: "inherit" }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* "WHAT I CAN DO" label */}
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", color: c.textMuted, textTransform: "uppercase", marginBottom: 16 }}>
                {activeCategories.length > 0 ? activeCategories.join(", ") : "All capabilities"}
              </p>

              {/* Capability cards grid — large like Image #4 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
                {sortedFiltered.map(cap => (
                  <button
                    key={cap.id}
                    onClick={() => handleCapabilityClick(cap)}
                    style={{
                      background: c.card,
                      border: `1px solid ${c.border}`,
                      borderRadius: 16,
                      padding: "24px 22px 22px",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 0,
                      boxShadow: c.shadow,
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget;
                      el.style.background = c.cardHover;
                      el.style.borderColor = c.accentBorder;
                      el.style.transform = "translateY(-2px)";
                      el.style.boxShadow = c.shadowMd;
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget;
                      el.style.background = c.card;
                      el.style.borderColor = c.border;
                      el.style.transform = "translateY(0)";
                      el.style.boxShadow = c.shadow;
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 14,
                        background: cap.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 18,
                        flexShrink: 0,
                      }}
                    >
                      {cap.icon}
                    </div>
                    {/* Label */}
                    <p style={{ fontSize: 15, fontWeight: 600, color: c.text, margin: 0, marginBottom: 5 }}>
                      {cap.label}
                    </p>
                    {/* Description */}
                    <p style={{ fontSize: 12, color: c.textMuted, margin: 0, lineHeight: 1.4 }}>
                      {cap.desc}
                    </p>
                  </button>
                ))}
              </div>

              {sortedFiltered.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", color: c.textMuted }}>
                  <Ico d={ic.search} s={32} color={c.textMuted} />
                  <p style={{ marginTop: 12, fontSize: 14 }}>No capabilities found for &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>

          ) : (
            /* ── CHAT VIEW ── */
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {/* Chat header */}
              <div style={{ borderBottom: `1px solid ${c.border}`, padding: "12px 24px", background: c.surface, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${c.avatarFrom}, ${c.avatarTo})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, color: "#fff" }}>AA</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Alternus AI</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: c.textMuted }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.online, display: "inline-block" }} />
                      Online · Claude Opus 4.6
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${c.border}`, background: "transparent", color: c.textSec, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Ico d={ic.close} s={12} color={c.textSec} /> Close chat
                </button>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                {msgs.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px 0", color: c.textMuted }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${c.avatarFrom}, ${c.avatarTo})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontWeight: 800, fontSize: 14, color: "#fff" }}>AA</div>
                    <p style={{ fontSize: 14, color: c.textSec, fontWeight: 500 }}>Start a conversation with Alternus AI</p>
                    <p style={{ fontSize: 12, color: c.textMuted, marginTop: 4 }}>Or click any capability card to get started</p>
                  </div>
                )}
                {msgs.map((msg, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 10, color: msg.role === "ai" ? "#fff" : c.accentText, background: msg.role === "ai" ? `linear-gradient(135deg, ${c.avatarFrom}, ${c.avatarTo})` : c.accentSoft, border: msg.role === "user" ? `1px solid ${c.border}` : "none" }}>
                      {msg.role === "ai" ? "AA" : "Me"}
                    </div>
                    <div style={{ maxWidth: "70%" }}>
                      <div style={{ fontSize: 10, color: c.textMuted, marginBottom: 3, textAlign: msg.role === "user" ? "right" : "left" }}>
                        {msg.role === "ai" ? <span style={{ color: c.accentText, fontWeight: 600 }}>Alternus AI </span> : <span>You </span>}
                        {fmtTime(msg.timestamp)}
                      </div>
                      <div style={{ background: msg.role === "user" ? c.msgUserBg : c.bubbleBg, border: `1px solid ${msg.role === "user" ? "transparent" : c.bubbleBorder}`, borderRadius: msg.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px", padding: "10px 14px", fontSize: 13, lineHeight: 1.6, color: msg.role === "user" ? "#fff" : c.text, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {msg.text || <span style={{ display: "flex", gap: 3, alignItems: "center" }}>{[0,1,2].map(j => <span key={j} style={{ width: 5, height: 5, borderRadius: "50%", background: c.textMuted, display: "inline-block", animation: `bounce 1.2s ease ${j*0.2}s infinite` }} />)}</span>}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>

              {/* Chat input */}
              <div style={{ borderTop: `1px solid ${c.border}`, padding: "12px 20px 16px", background: c.surface }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, background: c.inputBg, border: `1.5px solid ${c.inputBorder}`, borderRadius: 14, padding: "8px 8px 8px 14px", transition: "border-color 0.15s ease" }}
                  onFocusCapture={e => (e.currentTarget.style.borderColor = c.accent)}
                  onBlurCapture={e => (e.currentTarget.style.borderColor = c.inputBorder)}
                >
                  <textarea
                    ref={chatInputRef}
                    value={chatInput}
                    onChange={e => { setChatInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Message Alternus AI..."
                    rows={1}
                    style={{ flex: 1, resize: "none", border: "none", outline: "none", background: "transparent", color: c.text, fontSize: 13, lineHeight: 1.5, padding: "4px 0", fontFamily: "inherit", overflowY: "hidden", minHeight: 22 }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!chatInput.trim() || isTyping}
                    style={{ width: 34, height: 34, borderRadius: 9, border: "none", background: chatInput.trim() && !isTyping ? c.accent : c.accentSoft, color: chatInput.trim() && !isTyping ? "#fff" : c.textMuted, cursor: chatInput.trim() && !isTyping ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s ease" }}
                  >
                    <Ico d={ic.send} s={14} color={chatInput.trim() && !isTyping ? "#fff" : c.textMuted} />
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8, paddingLeft: 4 }}>
                  <button style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: c.textMuted, fontSize: 11 }}><Ico d={ic.attach} s={11} color={c.textMuted} /> Attach</button>
                  <button style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: c.textMuted, fontSize: 11 }}><Ico d={ic.mic} s={11} color={c.textMuted} /> Voice</button>
                  <button style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: c.textMuted, fontSize: 11 }}><Ico d={ic.sparkle} s={11} color={c.textMuted} /> Prompts</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ background: c.footerBg, borderTop: `1px solid ${c.footerBorder}`, height: 36, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: c.success }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.online, display: "inline-block" }} />
          All services are online
        </div>
        <div style={{ display: "flex", items: "center", gap: 16 }}>
          {["About", "Changelog", "Terms", "Privacy", "Support"].map(l => (
            <a key={l} href="#" style={{ fontSize: 11, color: c.textMuted, textDecoration: "none" }}
              onMouseEnter={e => ((e.target as HTMLElement).style.color = c.accentText)}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = c.textMuted)}
            >{l}</a>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)} }
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(140,130,190,0.25);border-radius:99px}
        textarea::placeholder,input::placeholder{color:#9896A8}
      `}</style>
    </div>
  );
}
