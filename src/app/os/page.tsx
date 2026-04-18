"use client";

import { useState, useEffect, useRef } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alternus AI Studio — Clean redesign
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type ThemeMode = "dark" | "light";

interface OSAIAction {
  type: "open_app" | "close_app" | "minimize_app" | "send_notification";
  payload: Record<string, string>;
}

interface ChatMsg {
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

type TabId = "general" | "ai-chat" | "files" | "code" | "terminal" | "settings";

const pal = {
  light: {
    bg: "#F2F0FF",
    bgGrad: "linear-gradient(160deg, #F2F0FF 0%, #EAE6FF 100%)",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    card: "#FFFFFF",
    cardAlt: "#F7F5FF",
    border: "#E4E0F5",
    borderLight: "#F0EDF9",
    text: "#18142E",
    textSec: "#574F7A",
    textMuted: "#9590B0",
    accent: "#7C6FFF",
    accentHover: "#6356E8",
    accentSoft: "rgba(124,111,255,0.10)",
    accentText: "#6356E8",
    success: "#22C07A",
    successSoft: "rgba(34,192,122,0.12)",
    warning: "#E5A117",
    danger: "#E85454",
    online: "#22C07A",
    tagBg: "rgba(124,111,255,0.10)",
    tagText: "#6356E8",
    liveDot: "#22C07A",
    avatarFrom: "#FF8B3E",
    avatarTo: "#FF5F1F",
    inputBg: "#FFFFFF",
    inputBorder: "#E4E0F5",
    capCardBorder: "#EDE8FF",
    capCardHover: "#F5F2FF",
    shadow: "0 2px 16px rgba(100,80,200,0.07)",
    shadowCard: "0 1px 8px rgba(100,80,200,0.06)",
    shadowInput: "0 2px 24px rgba(100,80,200,0.10)",
    dockBg: "rgba(255,255,255,0.88)",
    dockBorder: "rgba(228,224,245,0.8)",
    bubbleBg: "#F5F2FF",
    bubbleBorder: "#EDE8FF",
    msgUserBg: "#7C6FFF",
    msgUserText: "#FFFFFF",
  },
  dark: {
    bg: "#16142A",
    bgGrad: "linear-gradient(160deg, #16142A 0%, #1C1A35 100%)",
    surface: "#1F1D35",
    surfaceElevated: "#252340",
    card: "#252340",
    cardAlt: "#2C2A4A",
    border: "#353255",
    borderLight: "#2C2A48",
    text: "#EEECFf",
    textSec: "#A09CC5",
    textMuted: "#6B6890",
    accent: "#8B7FFF",
    accentHover: "#9B90FF",
    accentSoft: "rgba(139,127,255,0.13)",
    accentText: "#A09CFF",
    success: "#3DD68C",
    successSoft: "rgba(61,214,140,0.13)",
    warning: "#F5B73B",
    danger: "#F47272",
    online: "#3DD68C",
    tagBg: "rgba(139,127,255,0.15)",
    tagText: "#A09CFF",
    liveDot: "#3DD68C",
    avatarFrom: "#FF8B3E",
    avatarTo: "#FF5F1F",
    inputBg: "#1F1D35",
    inputBorder: "#353255",
    capCardBorder: "#353255",
    capCardHover: "#2C2A4A",
    shadow: "0 2px 20px rgba(0,0,0,0.25)",
    shadowCard: "0 1px 10px rgba(0,0,0,0.20)",
    shadowInput: "0 2px 24px rgba(0,0,0,0.3)",
    dockBg: "rgba(31,29,53,0.92)",
    dockBorder: "rgba(53,50,85,0.8)",
    bubbleBg: "#252340",
    bubbleBorder: "#353255",
    msgUserBg: "#8B7FFF",
    msgUserText: "#FFFFFF",
  },
};

function Ico({ d, s = 16, color, fill }: { d: string; s?: number; color?: string; fill?: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={fill || "none"} stroke={color || "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ic = {
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  attach: "M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48",
  mic: "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8",
  sparkle: "M12 3v1m0 16v1m-8-9H3m18 0h1M5.6 5.6l.7.7m12.1 12.1l.7.7M5.6 18.4l.7-.7m12.1-12.1l.7-.7M12 8a4 4 0 100 8 4 4 0 000-8z",
  terminal: "M4 17l6-6-6-6M12 19h8",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  folder: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
  settings: "M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  hash: "M4 9h16M4 15h16M10 3L8 21M16 3l-2 18",
  home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  globe: "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  share: "M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13",
  more: "M12 5v.01M12 12v.01M12 19v.01",
  voice: "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8",
  interview: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  video: "M23 7l-7 5 7 5V7zM1 5h15v14H1z",
  doc: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  study: "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
  sun: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 6a6 6 0 100 12 6 6 0 000-12z",
  moon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  check: "M20 6L9 17l-5-5",
  arrowUp: "M18 15l-6-6-6 6",
};

const CAPABILITIES = [
  {
    id: "ai-chat",
    label: "AI Interview",
    desc: "Practice job interviews with AI coaching & feedback",
    icon: ic.interview,
    color: "#8B7FFF",
    bg: "rgba(139,127,255,0.10)",
  },
  {
    id: "files",
    label: "File Manager",
    desc: "Create, read, update & delete files with AI help",
    icon: ic.folder,
    color: "#F5A623",
    bg: "rgba(245,166,35,0.10)",
  },
  {
    id: "code",
    label: "Code Editor",
    desc: "Write, review & debug code with AI assistance",
    icon: ic.code,
    color: "#4F8EF7",
    bg: "rgba(79,142,247,0.10)",
  },
  {
    id: "terminal",
    label: "Terminal",
    desc: "Run commands and scripts via natural language",
    icon: ic.terminal,
    color: "#22C07A",
    bg: "rgba(34,192,122,0.10)",
  },
  {
    id: "mail",
    label: "Email Assistant",
    desc: "Compose, reply & manage professional emails",
    icon: ic.mail,
    color: "#F47272",
    bg: "rgba(244,114,114,0.10)",
  },
  {
    id: "settings",
    label: "System Control",
    desc: "Manage OS settings, themes & preferences",
    icon: ic.settings,
    color: "#A78BFA",
    bg: "rgba(167,139,250,0.10)",
  },
];

const TABS: { id: TabId; label: string }[] = [
  { id: "general", label: "# General" },
  { id: "ai-chat", label: "AI Chat" },
  { id: "files", label: "Files" },
  { id: "code", label: "Code" },
  { id: "terminal", label: "Terminal" },
];

const QUICK_PROMPTS = [
  "Summarize my recent files",
  "Help me write a professional email",
  "Explain how to use the terminal",
  "Show me what I can do here",
];

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AlternusOSPage() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const c = pal[theme];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const sendMessage = async (text?: string) => {
    const m = (text || input).trim();
    if (!m || isTyping) return;
    setInput("");
    setCharCount(0);
    const userMsg: ChatMsg = { role: "user", text: m, timestamp: new Date() };
    setMsgs(p => [...p, userMsg]);
    setIsTyping(true);
    setMsgs(p => [...p, { role: "ai", text: "", timestamp: new Date() }]);

    try {
      const conversationHistory = msgs.map(msg => ({
        role: msg.role === "ai" ? "assistant" as const : "user" as const,
        content: msg.text,
      })).slice(-10);

      const response = await fetch("/api/os/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: m,
          conversationHistory,
          osContext: { openApps: [], theme },
        }),
      });

      if (!response.ok || !response.body) throw new Error(`API error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let actionsProcessed = false;
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        if (!actionsProcessed) {
          const nlIdx = buffer.indexOf("\n");
          if (nlIdx !== -1) {
            buffer = buffer.slice(nlIdx + 1);
            actionsProcessed = true;
          }
        } else {
          fullText += buffer;
          buffer = "";
        }

        if (fullText) {
          setMsgs(p => {
            const copy = [...p];
            copy[copy.length - 1] = { ...copy[copy.length - 1], text: fullText };
            return copy;
          });
        }
      }
    } catch (e) {
      setMsgs(p => {
        const copy = [...p];
        copy[copy.length - 1] = { ...copy[copy.length - 1], text: "Sorry, something went wrong. Please try again." };
        return copy;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmpty = msgs.length === 0;

  return (
    <div
      style={{
        background: c.bgGrad,
        color: c.text,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background: c.surface,
          borderBottom: `1px solid ${c.border}`,
          boxShadow: c.shadow,
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        {/* Agent info row */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${c.avatarFrom}, ${c.avatarTo})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 2px 10px rgba(255,95,31,0.3)`,
                fontWeight: 700,
                fontSize: 15,
                color: "#fff",
                letterSpacing: "-0.5px",
              }}
            >
              AA
            </div>

            {/* Name + badge + status */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{ fontWeight: 700, fontSize: 15, color: c.text }}>Alternus AI</span>
                <span
                  style={{
                    background: c.tagBg,
                    color: c.tagText,
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 99,
                    border: `1px solid ${c.accentSoft}`,
                    letterSpacing: "0.02em",
                  }}
                >
                  Flagship
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.online }} />
                <span style={{ fontSize: 11, color: c.textMuted }}>Online</span>
                <span style={{ fontSize: 11, color: c.textMuted, marginLeft: 2 }}>· Anthropic</span>
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Voice */}
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${c.border}`,
                background: "transparent",
                color: c.textSec,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <Ico d={ic.voice} s={13} color={c.textSec} />
              <span className="hidden sm:inline">Voice</span>
            </button>
            {/* Share */}
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${c.border}`,
                background: "transparent",
                color: c.textSec,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <Ico d={ic.share} s={13} color={c.textSec} />
              <span className="hidden sm:inline">Share</span>
            </button>
            {/* More */}
            <button
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: `1px solid ${c.border}`,
                background: "transparent",
                color: c.textSec,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ico d={ic.more} s={16} color={c.textSec} />
            </button>
            {/* Live */}
            <div className="flex items-center gap-1.5 ml-1">
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.liveDot, boxShadow: `0 0 0 2px ${c.successSoft}` }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: c.success }}>Live</span>
            </div>
          </div>
        </div>

        {/* Model info strip */}
        <div
          style={{
            borderTop: `1px solid ${c.borderLight}`,
            borderBottom: `1px solid ${c.border}`,
            background: c.cardAlt,
            padding: "6px 24px",
            display: "flex",
            alignItems: "center",
            gap: 0,
            overflowX: "auto",
          }}
        >
          {[
            { label: "Context", value: "200K" },
            { label: "Latency", value: "<20ms" },
            { label: "Provider", value: "Anthropic" },
            { label: "Model", value: "Claude Opus 4.6" },
          ].map((item, i) => (
            <div key={item.label} className="flex items-center">
              {i > 0 && <div style={{ width: 1, height: 14, background: c.border, margin: "0 16px" }} />}
              <span style={{ fontSize: 11, color: c.textMuted, marginRight: 4 }}>{item.label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: c.textSec }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 px-4 sm:px-6 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? c.accent : c.textMuted,
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? `2px solid ${c.accent}` : "2px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
                outline: "none",
              }}
            >
              {tab.label}
            </button>
          ))}

          {/* Theme toggle pushed to right */}
          <div className="ml-auto flex items-center gap-1 py-2">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                border: `1px solid ${c.border}`,
                background: "transparent",
                color: c.textMuted,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              title="Toggle theme"
            >
              <Ico d={theme === "light" ? ic.moon : ic.sun} s={14} color={c.textMuted} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Chat area ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px 16px", maxWidth: 760, width: "100%", margin: "0 auto" }}>
        {isEmpty ? (
          /* Welcome state */
          <div>
            {/* AI welcome bubble */}
            <div className="flex items-start gap-3 mb-8">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${c.avatarFrom}, ${c.avatarTo})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontWeight: 700,
                  fontSize: 12,
                  color: "#fff",
                }}
              >
                AA
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span style={{ fontSize: 13, fontWeight: 600, color: c.accent }}>Alternus AI</span>
                  <span style={{ fontSize: 11, color: c.textMuted }}>just now</span>
                </div>
                <div
                  style={{
                    background: c.bubbleBg,
                    border: `1px solid ${c.bubbleBorder}`,
                    borderRadius: "4px 16px 16px 16px",
                    padding: "12px 16px",
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: c.text,
                    maxWidth: 500,
                    boxShadow: c.shadowCard,
                  }}
                >
                  Hello! I&apos;m <strong>Alternus AI</strong> powered by Anthropic. I specialize in advanced reasoning and deep analysis.<br /><br />
                  How can I assist you today?
                </div>
              </div>
            </div>

            {/* Capabilities grid */}
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, letterSpacing: "0.08em", marginBottom: 12, textTransform: "uppercase" }}>
                Capabilities
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                {CAPABILITIES.map(cap => (
                  <button
                    key={cap.id}
                    onClick={() => sendMessage(`Tell me about your ${cap.label} capability`)}
                    style={{
                      background: c.card,
                      border: `1px solid ${c.capCardBorder}`,
                      borderRadius: 14,
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                      boxShadow: c.shadowCard,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = c.capCardHover;
                      (e.currentTarget as HTMLButtonElement).style.borderColor = cap.color + "50";
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = c.card;
                      (e.currentTarget as HTMLButtonElement).style.borderColor = c.capCardBorder;
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: cap.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Ico d={cap.icon} s={18} color={cap.color} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 2 }}>{cap.label}</p>
                      <p style={{ fontSize: 11, color: c.textMuted, lineHeight: 1.4 }}>{cap.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat messages */
          <div className="flex flex-col gap-4">
            {msgs.map((msg, i) => (
              <div key={i} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: msg.role === "ai"
                      ? `linear-gradient(135deg, ${c.avatarFrom}, ${c.avatarTo})`
                      : c.accentSoft,
                    border: msg.role === "user" ? `1px solid ${c.border}` : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontWeight: 700,
                    fontSize: 11,
                    color: msg.role === "ai" ? "#fff" : c.accentText,
                  }}
                >
                  {msg.role === "ai" ? "AA" : "Me"}
                </div>

                <div style={{ maxWidth: "72%", minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: c.textMuted,
                      marginBottom: 4,
                      textAlign: msg.role === "user" ? "right" : "left",
                    }}
                  >
                    {msg.role === "ai" ? (
                      <span style={{ color: c.accent, fontWeight: 600 }}>Alternus AI </span>
                    ) : (
                      <span>You </span>
                    )}
                    {formatTime(msg.timestamp)}
                  </div>
                  <div
                    style={{
                      background: msg.role === "user" ? c.msgUserBg : c.bubbleBg,
                      border: `1px solid ${msg.role === "user" ? "transparent" : c.bubbleBorder}`,
                      borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                      padding: "10px 14px",
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: msg.role === "user" ? c.msgUserText : c.text,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      boxShadow: c.shadowCard,
                    }}
                  >
                    {msg.text || (
                      <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        {[0, 1, 2].map(j => (
                          <span
                            key={j}
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: c.textMuted,
                              display: "inline-block",
                              animation: `bounce 1.2s ease-in-out ${j * 0.2}s infinite`,
                            }}
                          />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* ── Input area ── */}
      <div
        style={{
          background: c.surface,
          borderTop: `1px solid ${c.border}`,
          padding: "12px 16px 8px",
          maxWidth: 760,
          width: "100%",
          margin: "0 auto",
          alignSelf: "stretch",
        }}
      >
        {/* Quick prompts (only when empty) */}
        {isEmpty && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {QUICK_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 99,
                  border: `1px solid ${c.border}`,
                  background: "transparent",
                  color: c.textSec,
                  fontSize: 12,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = c.accent;
                  (e.currentTarget as HTMLButtonElement).style.color = c.accentText;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = c.border;
                  (e.currentTarget as HTMLButtonElement).style.color = c.textSec;
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Main input row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            background: c.inputBg,
            border: `1.5px solid ${c.inputBorder}`,
            borderRadius: 16,
            padding: "8px 8px 8px 14px",
            boxShadow: c.shadowInput,
            transition: "border-color 0.15s ease",
          }}
          onFocusCapture={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = c.accent;
          }}
          onBlurCapture={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = c.inputBorder;
          }}
        >
          {/* Attach button */}
          <button
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${c.border}`,
              background: "transparent",
              color: c.textMuted,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Ico d={ic.attach} s={15} color={c.textMuted} />
          </button>

          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              setCharCount(e.target.value.length);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKey}
            placeholder="Message Alternus AI..."
            rows={1}
            style={{
              flex: 1,
              resize: "none",
              border: "none",
              outline: "none",
              background: "transparent",
              color: c.text,
              fontSize: 14,
              lineHeight: 1.5,
              padding: "4px 0",
              fontFamily: "inherit",
              overflowY: "hidden",
              minHeight: 24,
            }}
          />

          {/* Send button */}
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: "none",
              background: input.trim() && !isTyping ? c.accent : c.accentSoft,
              color: input.trim() && !isTyping ? "#fff" : c.textMuted,
              cursor: input.trim() && !isTyping ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.15s ease",
            }}
          >
            <Ico d={ic.send} s={15} color={input.trim() && !isTyping ? "#fff" : c.textMuted} />
          </button>
        </div>

        {/* Input footer */}
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center gap-4">
            <button style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: c.textMuted, fontSize: 11 }}>
              <Ico d={ic.attach} s={12} color={c.textMuted} /> Attach
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: c.textMuted, fontSize: 11 }}>
              <Ico d={ic.mic} s={12} color={c.textMuted} /> Voice Message
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: c.textMuted, fontSize: 11 }}>
              <Ico d={ic.sparkle} s={12} color={c.textMuted} /> Browse Prompts
            </button>
          </div>
          <span style={{ fontSize: 11, color: charCount > 2800 ? c.danger : c.textMuted }}>
            {charCount} / 3,000
          </span>
        </div>
      </div>

      {/* ── Bottom dock ── */}
      <div
        style={{
          background: c.dockBg,
          backdropFilter: "blur(20px)",
          borderTop: `1px solid ${c.dockBorder}`,
          padding: "10px 24px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: c.surface,
            border: `1px solid ${c.border}`,
            borderRadius: 99,
            padding: "6px 16px",
            boxShadow: c.shadowCard,
          }}
        >
          {[
            { icon: ic.home, label: "Home" },
            { icon: ic.grid, label: "Apps" },
            { icon: ic.search, label: "Search" },
          ].map((item, i) => (
            <button
              key={item.label}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "none",
                background: "transparent",
                color: c.textMuted,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              title={item.label}
              onMouseEnter={e => (e.currentTarget.style.background = c.accentSoft)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Ico d={item.icon} s={18} color={c.textSec} />
            </button>
          ))}

          {/* Center orb */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: `radial-gradient(circle at 35% 35%, #A89FFF, #6B5EFF 60%, #4A3FCC)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 16px rgba(107,94,255,0.4), 0 0 0 2px ${c.surface}`,
              margin: "0 4px",
              cursor: "pointer",
              transition: "transform 0.15s ease",
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Ico d={ic.sparkle} s={20} color="#fff" />
          </div>

          {[
            { icon: ic.folder, label: "Files" },
            { icon: ic.refresh, label: "Refresh" },
            { icon: ic.settings, label: "Settings" },
          ].map(item => (
            <button
              key={item.label}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "none",
                background: "transparent",
                color: c.textMuted,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              title={item.label}
              onMouseEnter={e => (e.currentTarget.style.background = c.accentSoft)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Ico d={item.icon} s={18} color={c.textSec} />
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(150,140,200,0.3); border-radius: 99px; }
        textarea::placeholder { color: #9590B0; }
      `}</style>
    </div>
  );
}
