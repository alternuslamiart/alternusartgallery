"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    title: "AI Agent",
    desc: "A native agent that reads files, drafts emails, opens apps, and runs commands on its own OS.",
    icon: "M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.936A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.963 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.582a.5.5 0 010 .963L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.963 0z",
    color: "#5865F2",
  },
  {
    title: "Native Mail",
    desc: "A minimalist inbox with compose, threading, labels, and inline reply — all controllable by the agent.",
    icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
    color: "#EB459E",
  },
  {
    title: "Smart Files",
    desc: "Semantic search, drag-and-drop, and an AI assistant that understands your folder structure.",
    icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
    color: "#FEE75C",
  },
  {
    title: "Voice Mode",
    desc: "Talk to the OS naturally. Dictate, transcribe, run workflows, or have a conversation.",
    icon: "M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3zM19 10v1a7 7 0 01-14 0v-1M12 19v4",
    color: "#57F287",
  },
  {
    title: "Code Studio",
    desc: "A full VS Code–style editor with an integrated AI pair-programmer on top of your project.",
    icon: "M16 18l6-6-6-6M8 6l-6 6 6 6",
    color: "#ED4245",
  },
  {
    title: "Knowledge Base",
    desc: "Build a private, indexed knowledge layer. The agent cites your docs when it answers.",
    icon: "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
    color: "#5865F2",
  },
];

const suggestions = [
  "Draft an email to my team about the Q2 launch",
  "Find last month's invoices in Files",
  "Open the Code editor with a new React project",
  "Summarize today's unread mail",
];

const featuredApps = [
  {
    title: "AI Mail Assistant",
    desc: "Auto-draft, summarize threads, and reply with one command. Your inbox, finally under control.",
    tag: "Mail",
    tagColor: "#EB459E",
    gradient: "linear-gradient(135deg, #1a1040 0%, #3d1f6e 50%, #6d28d9 100%)",
    raised: 68,
    goal: 100,
    backers: 1240,
    funds: "$24,800",
  },
  {
    title: "Smart File System",
    desc: "Semantic search across all your files. The AI finds anything by meaning, not just filename.",
    tag: "Files",
    tagColor: "#57F287",
    gradient: "linear-gradient(135deg, #0a2a1a 0%, #064e3b 50%, #059669 100%)",
    raised: 82,
    goal: 100,
    backers: 2180,
    funds: "$41,600",
  },
  {
    title: "Code Studio Pro",
    desc: "VS Code-style editor with an AI pair-programmer that understands your full project context.",
    tag: "Code",
    tagColor: "#5865F2",
    gradient: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #2563eb 100%)",
    raised: 55,
    goal: 100,
    backers: 890,
    funds: "$17,200",
  },
];

const testimonials = [
  {
    name: "Marcus Johnson",
    role: "Product Designer",
    avatar: "MJ",
    avatarColor: "#5865F2",
    text: "Alternus completely changed how I work. I just describe what I need and the AI handles the rest. It's like having a senior assistant that never sleeps.",
  },
  {
    name: "Priya Sharma",
    role: "Software Engineer",
    avatar: "PS",
    avatarColor: "#EB459E",
    text: "The Code Studio with AI integration is phenomenal. It understands my entire codebase and suggests contextually relevant solutions every time.",
  },
  {
    name: "David Chen",
    role: "Startup Founder",
    avatar: "DC",
    avatarColor: "#57F287",
    text: "I replaced 4 different tools with Alternus. Mail, files, code, and knowledge — all in one place with one AI that understands context across all of them.",
  },
  {
    name: "Elena Voss",
    role: "Content Creator",
    avatar: "EV",
    avatarColor: "#FEE75C",
    text: "The voice mode is a game changer. I dictate my ideas and Alternus drafts emails, creates files, and organizes everything automatically.",
  },
  {
    name: "James Carter",
    role: "Freelance Developer",
    avatar: "JC",
    avatarColor: "#ED4245",
    text: "Being able to ask the AI to find last month's invoices across my files and emails at the same time — that alone saves me hours every week.",
  },
  {
    name: "Lena Spencer",
    role: "UX Researcher",
    avatar: "LS",
    avatarColor: "#5865F2",
    text: "The knowledge base feature is what sold me. I indexed all my research docs and now the AI cites them directly when I ask questions. Incredibly powerful.",
  },
];

const BLURPLE = "#5865F2";
const BLURPLE_DARK_HEX = "#4752C4";
const GREEN = "#23A559";

const DARK_THEME = {
  BG: "#1E1F22",
  SURFACE: "#2B2D31",
  SURFACE_RAISED: "#313338",
  SURFACE_OVERLAY: "#383A40",
  CHROME: "#111214",
  TEXT: "#F2F3F5",
  TEXT_MUTED: "#B5BAC1",
  TEXT_DIMMER: "#80848E",
  BORDER: "rgba(255,255,255,0.06)",
  BORDER_STRONG: "rgba(255,255,255,0.1)",
  BLURPLE_SOFT: "rgba(88,101,242,0.15)",
  INPUT_PH: "#4E5058",
};

const LIGHT_THEME = {
  BG: "#FFFFFF",
  SURFACE: "#F2F3F5",
  SURFACE_RAISED: "#FFFFFF",
  SURFACE_OVERLAY: "#E3E5E8",
  CHROME: "#E3E5E8",
  TEXT: "#060607",
  TEXT_MUTED: "#4E5058",
  TEXT_DIMMER: "#80848E",
  BORDER: "rgba(0,0,0,0.08)",
  BORDER_STRONG: "rgba(0,0,0,0.12)",
  BLURPLE_SOFT: "rgba(88,101,242,0.08)",
  INPUT_PH: "#C4C9D4",
};

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const T = isDark ? DARK_THEME : LIGHT_THEME;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToChat = (q?: string) => {
    const text = (q ?? prompt).trim();
    if (text) router.push(`/os?prompt=${encodeURIComponent(text)}`);
    else router.push("/os");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToChat();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.BG,
        color: T.TEXT,
        fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      {/* ─── Nav ─── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          width: "100%",
          transition: "background 0.25s, border-color 0.25s",
          backdropFilter: scrolled ? "blur(20px) saturate(150%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(150%)" : "none",
          background: scrolled
            ? isDark ? "rgba(30,31,34,0.92)" : "rgba(255,255,255,0.92)"
            : "transparent",
          borderBottom: `1px solid ${scrolled ? T.BORDER_STRONG : "transparent"}`,
        }}
      >
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{
              width: 32, height: 32,
              background: `linear-gradient(135deg, ${BLURPLE} 0%, ${BLURPLE_DARK_HEX} 100%)`,
              borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(88,101,242,0.4)",
            }}>
              <span style={{ color: "#FFF", fontSize: 15, fontWeight: 700 }}>A</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 650, letterSpacing: "-0.025em", color: T.TEXT }}>Alternus</span>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 40 }} className="hidden md:flex">
            {[
              { label: "Features", href: "#features" },
              { label: "How it works", href: "#how" },
              { label: "Gallery", href: "/gallery" },
              { label: "Pricing", href: "/pricing" },
            ].map((l) => (
              <Link key={l.label} href={l.href} style={{
                fontSize: 14, color: T.TEXT_MUTED, fontWeight: 500, textDecoration: "none",
                padding: "0 12px", height: 36, display: "flex", alignItems: "center",
                borderRadius: 6, transition: "color 0.15s, background 0.15s",
              }}
                className={isDark ? "hover:bg-white/[0.07] hover:!text-white" : "hover:bg-black/[0.05] hover:!text-black"}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div style={{ flex: 1 }} />

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Theme toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              style={{
                width: 36, height: 36, borderRadius: 6, border: `1px solid ${T.BORDER_STRONG}`,
                background: T.SURFACE, cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", transition: "all 0.2s", color: T.TEXT_MUTED,
              }}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              )}
            </button>

            <Link href="/login" style={{
              display: "none", alignItems: "center", height: 36, padding: "0 14px",
              borderRadius: 6, fontSize: 14, fontWeight: 500, color: T.TEXT_MUTED,
              textDecoration: "none", transition: "background 0.15s, color 0.15s",
            }} className="sm:!inline-flex">Log in</Link>

            <Link href="/os" style={{
              display: "inline-flex", alignItems: "center", gap: 6, height: 36,
              padding: "0 16px", background: BLURPLE, color: "#FFF", borderRadius: 6,
              fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", textDecoration: "none",
              transition: "background 0.15s", boxShadow: "0 2px 8px rgba(88,101,242,0.4)",
            }} className="hover:bg-[#4752C4]">
              Try in Chat
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section style={{ position: "relative", paddingTop: 96, paddingBottom: 80, overflow: "hidden" }} className="md:pt-[128px] md:pb-[96px]">
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <div style={{
            position: "absolute", left: "50%", top: "-20%", transform: "translateX(-50%)",
            width: 900, height: 700, borderRadius: "50%",
            background: isDark
              ? "radial-gradient(closest-side, rgba(88,101,242,0.18), rgba(88,101,242,0.06) 55%, transparent 74%)"
              : "radial-gradient(closest-side, rgba(88,101,242,0.12), rgba(88,101,242,0.04) 55%, transparent 74%)",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: isDark
              ? "radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)"
              : "radial-gradient(rgba(0,0,0,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse at 50% 30%, black 25%, transparent 65%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 25%, transparent 65%)",
          }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, height: 32, padding: "0 14px",
            background: T.SURFACE, border: `1px solid ${T.BORDER_STRONG}`, borderRadius: 6, marginBottom: 32,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, display: "block", boxShadow: "0 0 0 2px rgba(35,165,89,0.3)" }} />
            <span style={{ fontSize: 12.5, fontWeight: 500, color: T.TEXT_MUTED }}>Claude Opus 4.6 · Online</span>
          </div>

          <h1 style={{ fontSize: "clamp(40px, 6.4vw, 70px)", lineHeight: 1.04, fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 20 }}>
            <span style={{ color: T.TEXT, display: "block" }}>The operating system</span>
            <span style={{
              display: "block",
              background: "linear-gradient(90deg, #5865F2 0%, #7289DA 50%, #EB459E 100%)",
              WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent",
            }}>
              that thinks with you.
            </span>
          </h1>

          <p style={{ fontSize: 17, color: T.TEXT_MUTED, maxWidth: 520, margin: "0 auto", lineHeight: 1.68, fontWeight: 400, marginBottom: 44 }}>
            Alternus is an AI-native desktop. Ask it in plain language — it drafts emails, opens apps, finds files, and runs your workflows across a fully functional OS in your browser.
          </p>

          <form onSubmit={onSubmit} style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{
              position: "relative", background: T.SURFACE_RAISED, border: `1px solid ${T.BORDER_STRONG}`,
              borderRadius: 12, overflow: "hidden",
              boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
            }}>
              <input
                ref={inputRef} value={prompt} onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask Alternus anything — try 'draft an email to my team'"
                style={{ width: "100%", padding: "18px 20px 10px", fontSize: 14.5, background: "transparent", border: "none", outline: "none", color: T.TEXT, boxSizing: "border-box" }}
                className={isDark ? "placeholder:text-[#4E5058]" : "placeholder:text-[#C4C9D4]"}
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px 10px" }}>
                <div style={{ display: "flex", gap: 2, color: T.TEXT_DIMMER }}>
                  {[
                    { d: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3", title: "Upload" },
                    { d: "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20", title: "Research" },
                    { d: "M16 18l6-6-6-6M8 6l-6 6 6 6", title: "Code" },
                    { d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z", title: "Chat" },
                  ].map((b, i) => (
                    <button key={i} type="button" title={b.title} style={{
                      width: 32, height: 32, borderRadius: 6, display: "flex", alignItems: "center",
                      justifyContent: "center", background: "transparent", border: "none", cursor: "pointer",
                      transition: "background 0.15s, color 0.15s", color: "inherit",
                    }} className={isDark ? "hover:bg-white/[0.07] hover:!text-white" : "hover:bg-black/[0.06] hover:!text-black"}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={b.d} />
                      </svg>
                    </button>
                  ))}
                </div>
                <button type="submit" style={{
                  display: "inline-flex", alignItems: "center", gap: 6, height: 34, padding: "0 16px",
                  background: BLURPLE, color: "#FFF", borderRadius: 6, fontSize: 13, fontWeight: 600,
                  border: "none", cursor: "pointer", letterSpacing: "-0.01em", transition: "background 0.15s",
                  boxShadow: "0 2px 8px rgba(88,101,242,0.4)",
                }} className="hover:bg-[#4752C4]">
                  Try in Chat
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 14 }}>
              {suggestions.map((s) => (
                <button key={s} type="button" onClick={() => goToChat(s)} style={{
                  fontSize: 12.5, color: T.TEXT_MUTED, padding: "0 14px", height: 30,
                  borderRadius: 6, border: `1px solid ${T.BORDER_STRONG}`, background: T.SURFACE,
                  cursor: "pointer", fontWeight: 450, transition: "all 0.15s",
                }} className="hover:border-[#5865F2]/60 hover:!text-[#5865F2] hover:bg-[#5865F2]/10">
                  {s}
                </button>
              ))}
            </div>
          </form>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginTop: 44, flexWrap: "wrap", rowGap: 10 }}>
            <span style={{ fontSize: 10.5, color: T.TEXT_DIMMER, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginRight: 18 }}>
              Powered by
            </span>
            {["Claude Opus 4.6", "Next.js 15", "Prisma · PostgreSQL"].map((label, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && <span style={{ display: "inline-block", width: 1, height: 12, background: T.BORDER_STRONG, margin: "0 16px" }} />}
                <span style={{ fontSize: 13.5, color: T.TEXT_MUTED, fontWeight: 600 }}>{label}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OS Preview ─── */}
      <section style={{ paddingBottom: 80 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <Link href="/os"
            className="group block hover:border-[#5865F2]/50"
            style={{
              borderRadius: 16, overflow: "hidden", border: `1px solid ${T.BORDER_STRONG}`,
              boxShadow: isDark
                ? "0 20px 60px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)"
                : "0 20px 60px -10px rgba(0,0,0,0.12)",
              display: "block", textDecoration: "none", transition: "border-color 0.25s, box-shadow 0.25s",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", gap: 7, padding: "0 16px", height: 38,
              background: T.CHROME, borderBottom: `1px solid ${T.BORDER}`,
            }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ED4245" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FEE75C" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#57F287" }} />
              <div style={{
                marginLeft: 16, height: 22, padding: "0 12px", borderRadius: 4,
                background: T.SURFACE, display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: 11, color: T.TEXT_DIMMER }}>alternus.art/os</span>
              </div>
              <span style={{ marginLeft: "auto", fontSize: 10.5, color: T.TEXT_DIMMER, transition: "color 0.15s" }} className="group-hover:!text-[#5865F2]">
                Click to open →
              </span>
            </div>

            <div style={{ position: "relative", height: 440, background: T.BG, display: "flex" }} className="md:h-[520px]">
              {/* Server sidebar */}
              <div style={{
                width: 72, background: T.CHROME, padding: "12px 0",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 16,
                  background: `linear-gradient(135deg, ${BLURPLE} 0%, #7289DA 100%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 4, boxShadow: "0 4px 12px rgba(88,101,242,0.4)",
                }}>
                  <span style={{ color: "#FFF", fontSize: 18, fontWeight: 800 }}>A</span>
                </div>
                <div style={{ width: 32, height: 1, background: T.SURFACE_OVERLAY, borderRadius: 1 }} />
                {[
                  { icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", label: "Mail", active: false },
                  { icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z", label: "Files", active: true },
                  { icon: "M16 18l6-6-6-6M8 6l-6 6 6 6", label: "Code", active: false },
                  { icon: "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z", label: "Docs", active: false },
                ].map((app) => (
                  <div key={app.label} style={{ position: "relative" }}>
                    {app.active && (
                      <div style={{
                        position: "absolute", left: -12, top: "50%", transform: "translateY(-50%)",
                        width: 4, height: 32, background: isDark ? "white" : BLURPLE, borderRadius: "0 4px 4px 0",
                      }} />
                    )}
                    <div style={{
                      width: 48, height: 48, borderRadius: app.active ? 16 : 24,
                      background: app.active ? BLURPLE : T.SURFACE,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "border-radius 0.2s, background 0.2s", cursor: "pointer",
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={app.active ? "#fff" : T.TEXT_DIMMER} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d={app.icon} />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {/* Channel list */}
              <div style={{ width: 240, background: T.SURFACE, borderRight: `1px solid ${T.BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
                <div style={{ padding: "16px 12px 10px", borderBottom: `1px solid ${T.BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.TEXT }}>Smart Files</span>
                </div>
                <div style={{ padding: "8px 8px", flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.TEXT_DIMMER, padding: "4px 8px", marginBottom: 2 }}>
                    Folders
                  </div>
                  {[{ name: "Projects", unread: 0 }, { name: "Invoices", unread: 2 }, { name: "Design Assets", unread: 0 }, { name: "Contracts", unread: 0 }, { name: "Archive", unread: 0 }].map((ch) => (
                    <div key={ch.name} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "5px 8px", borderRadius: 4, cursor: "pointer",
                      background: ch.name === "Invoices" ? T.SURFACE_OVERLAY : "transparent",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14, color: T.TEXT_DIMMER }}>#</span>
                        <span style={{ fontSize: 13, color: ch.unread > 0 ? T.TEXT : T.TEXT_MUTED, fontWeight: ch.unread > 0 ? 600 : 400 }}>{ch.name}</span>
                      </div>
                      {ch.unread > 0 && (
                        <div style={{ minWidth: 18, height: 18, borderRadius: 9, background: BLURPLE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#FFF", padding: "0 5px" }}>
                          {ch.unread}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: T.CHROME, borderTop: `1px solid ${T.BORDER}` }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${BLURPLE} 0%, #7289DA 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#FFF" }}>A</div>
                    <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: GREEN, border: `2px solid ${T.CHROME}` }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.TEXT }}>You</div>
                    <div style={{ fontSize: 10, color: GREEN }}>● Online</div>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "0 20px", height: 48, borderBottom: `1px solid ${T.BORDER}`, display: "flex", alignItems: "center", gap: 8, background: T.SURFACE_RAISED }}>
                  <span style={{ fontSize: 14, color: T.TEXT_DIMMER }}>#</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.TEXT }}>Invoices</span>
                  <div style={{ width: 1, height: 16, background: T.BORDER_STRONG, margin: "0 4px" }} />
                  <span style={{ fontSize: 12, color: T.TEXT_DIMMER }}>12 files · AI indexed</span>
                </div>
                <div style={{ flex: 1, padding: 20, overflow: "hidden" }}>
                  <div style={{ display: "flex", gap: 12, padding: "12px 16px", borderRadius: 8, background: isDark ? "rgba(88,101,242,0.12)" : "rgba(88,101,242,0.06)", border: `1px solid rgba(88,101,242,0.2)`, marginBottom: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${BLURPLE} 0%, #7289DA 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 800, color: "#FFF" }}>AI</div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: BLURPLE }}>Alternus AI</span>
                        <span style={{ fontSize: 10.5, color: T.TEXT_DIMMER }}>Today at 10:42</span>
                      </div>
                      <p style={{ fontSize: 12.5, color: T.TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>
                        Found <strong style={{ color: T.TEXT }}>2 invoices from last month</strong> — Total: <strong style={{ color: T.TEXT }}>$4,820</strong>. Want me to export a summary?
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {[
                      { name: "Invoice_March_2026.pdf", size: "128 KB", color: "#ED4245" },
                      { name: "Design_Contract_Q2.pdf", size: "84 KB", color: BLURPLE },
                      { name: "Stripe_Receipt.pdf", size: "32 KB", color: "#57F287" },
                    ].map((f) => (
                      <div key={f.name} style={{ padding: "10px 12px", borderRadius: 8, background: T.SURFACE_RAISED, border: `1px solid ${T.BORDER}`, cursor: "pointer" }}>
                        <div style={{ width: 28, height: 32, borderRadius: 4, background: `${f.color}22`, border: `1px solid ${f.color}44`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, fontSize: 8, fontWeight: 800, color: f.color, letterSpacing: "0.05em" }}>PDF</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: T.TEXT, lineHeight: 1.3, marginBottom: 2 }}>{f.name}</div>
                        <div style={{ fontSize: 10, color: T.TEXT_DIMMER }}>{f.size}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: "10px 16px 16px", background: T.SURFACE_RAISED, borderTop: `1px solid ${T.BORDER}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 14px", height: 40, borderRadius: 8, background: T.SURFACE_OVERLAY }}>
                    <span style={{ fontSize: 12, color: T.TEXT_DIMMER }}>Ask AI about these files...</span>
                    <div style={{ flex: 1 }} />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={BLURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ─── Featured Apps ─── */}
      <section style={{ paddingTop: 96, paddingBottom: 96, borderTop: `1px solid ${T.BORDER}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, letterSpacing: "-0.035em", color: T.TEXT, marginBottom: 8 }}>
                New Featured Apps
              </h2>
              <p style={{ fontSize: 14, color: T.TEXT_MUTED }}>Check out the latest AI-powered modules. Let&apos;s start your journey from here.</p>
            </div>
            <Link href="/gallery" style={{ fontSize: 13.5, fontWeight: 600, color: BLURPLE, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
              View All
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredApps.map((app) => (
              <div key={app.title} style={{
                borderRadius: 16, overflow: "hidden", background: T.SURFACE_RAISED,
                border: `1px solid ${T.BORDER}`,
                boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.07)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }} className="hover:-translate-y-1">
                {/* Card image */}
                <div style={{ height: 160, background: app.gradient, position: "relative", overflow: "hidden" }}>
                  <div style={{
                    position: "absolute", top: 12, left: 12,
                    height: 22, padding: "0 10px", borderRadius: 4,
                    background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)",
                    display: "flex", alignItems: "center",
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: app.tagColor, letterSpacing: "0.04em" }}>{app.tag}</span>
                  </div>
                  {/* Abstract decoration */}
                  <div style={{
                    position: "absolute", right: -20, bottom: -20, width: 120, height: 120,
                    borderRadius: "50%", background: "rgba(255,255,255,0.06)",
                  }} />
                  <div style={{
                    position: "absolute", right: 20, top: 20, width: 60, height: 60,
                    borderRadius: "50%", background: "rgba(255,255,255,0.08)",
                  }} />
                </div>

                {/* Card body */}
                <div style={{ padding: "20px 20px 16px" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", color: T.TEXT, marginBottom: 6, lineHeight: 1.3 }}>
                    {app.title}
                  </h3>
                  <p style={{ fontSize: 13, color: T.TEXT_MUTED, lineHeight: 1.6, marginBottom: 16 }}>{app.desc}</p>

                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 11.5, color: T.TEXT_DIMMER }}>{app.funds} Raised</span>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: T.TEXT }}>{app.funds}</span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 4, borderRadius: 4, background: T.SURFACE_OVERLAY, marginBottom: 16, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 4, width: `${app.raised}%`,
                      background: `linear-gradient(90deg, ${BLURPLE} 0%, #7289DA 100%)`,
                      transition: "width 0.5s ease",
                    }} />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: 16 }}>
                      <span style={{ fontSize: 11.5, color: T.TEXT_DIMMER }}><strong style={{ color: T.TEXT_MUTED }}>{app.backers.toLocaleString()}</strong> Backers</span>
                      <span style={{ fontSize: 11.5, color: T.TEXT_DIMMER }}><strong style={{ color: T.TEXT_MUTED }}>{app.raised}%</strong></span>
                    </div>
                    <button style={{
                      height: 32, padding: "0 16px", borderRadius: 6, border: `1px solid ${BLURPLE}40`,
                      background: isDark ? "rgba(88,101,242,0.12)" : "rgba(88,101,242,0.08)",
                      color: BLURPLE, fontSize: 12.5, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                    }} className="hover:bg-[#5865F2] hover:!text-white hover:border-[#5865F2]">
                      Open App
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" style={{ paddingTop: 96, paddingBottom: 96, borderTop: `1px solid ${T.BORDER}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ maxWidth: 560, marginBottom: 52 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", height: 26, padding: "0 10px",
              background: isDark ? "rgba(88,101,242,0.15)" : "rgba(88,101,242,0.08)",
              border: `1px solid rgba(88,101,242,0.3)`, borderRadius: 4, marginBottom: 16,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: BLURPLE }}>
                Built-in capabilities
              </span>
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.08, color: T.TEXT, marginBottom: 16 }}>
              Every app, one intelligence.
            </h2>
            <p style={{ fontSize: 15, color: T.TEXT_MUTED, lineHeight: 1.65 }}>
              Mail, Files, Code, Voice, Knowledge — they all share the same agent and memory.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((f) => (
              <div key={f.title} style={{
                padding: 24, borderRadius: 12, background: T.SURFACE, border: `1px solid ${T.BORDER}`,
                transition: "border-color 0.2s, transform 0.2s, background 0.2s",
              }} className="hover:border-[#5865F2]/40 hover:-translate-y-[2px]">
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: `${f.color}18`,
                  border: `1px solid ${f.color}35`, display: "flex", alignItems: "center",
                  justifyContent: "center", marginBottom: 16,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={f.color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d={f.icon} />
                  </svg>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.015em", color: T.TEXT, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: T.TEXT_MUTED, lineHeight: 1.62 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how" style={{ paddingTop: 96, paddingBottom: 96, borderTop: `1px solid ${T.BORDER}`, background: T.SURFACE }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ maxWidth: 560, marginBottom: 52 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", height: 26, padding: "0 10px",
              background: isDark ? "rgba(88,101,242,0.15)" : "rgba(88,101,242,0.08)",
              border: `1px solid rgba(88,101,242,0.3)`, borderRadius: 4, marginBottom: 16,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: BLURPLE }}>
                How it works
              </span>
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.08, color: T.TEXT }}>
              Three steps to a smarter desktop.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { n: "01", t: "Describe what you want", d: "Type or speak a goal. The agent plans and confirms before taking action." },
              { n: "02", t: "Agent runs your apps", d: "It opens Mail, Files, Code, Calendar — whatever's needed — and runs the steps." },
              { n: "03", t: "You review & ship", d: "Every change is visible in-app. Approve, tweak, or redo with one command." },
            ].map((s) => (
              <div key={s.n} style={{ position: "relative", padding: 28, borderRadius: 12, background: T.SURFACE_RAISED, border: `1px solid ${T.BORDER}`, overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${BLURPLE} 0%, transparent 100%)` }} />
                <div style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28,
                  borderRadius: 6, background: isDark ? "rgba(88,101,242,0.15)" : "rgba(88,101,242,0.1)",
                  border: `1px solid rgba(88,101,242,0.25)`, marginBottom: 16,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "var(--font-geist-mono), monospace", color: BLURPLE }}>{s.n}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 10, color: T.TEXT, lineHeight: 1.3 }}>{s.t}</h3>
                <p style={{ fontSize: 13.5, color: T.TEXT_MUTED, lineHeight: 1.64 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section style={{ paddingTop: 96, paddingBottom: 96, borderTop: `1px solid ${T.BORDER}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ maxWidth: 560, marginBottom: 52 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", height: 26, padding: "0 10px",
              background: isDark ? "rgba(88,101,242,0.15)" : "rgba(88,101,242,0.08)",
              border: `1px solid rgba(88,101,242,0.3)`, borderRadius: 4, marginBottom: 16,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: BLURPLE }}>
                Testimonials
              </span>
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.08, color: T.TEXT, marginBottom: 12 }}>
              Hear How We&apos;ve Made a Difference
            </h2>
            <p style={{ fontSize: 15, color: T.TEXT_MUTED, lineHeight: 1.65 }}>
              Real users sharing how Alternus transformed their daily workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <div key={i} style={{
                padding: "22px 24px", borderRadius: 12, background: T.SURFACE,
                border: `1px solid ${T.BORDER}`,
                boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.2)" : "0 2px 12px rgba(0,0,0,0.05)",
                transition: "transform 0.2s, border-color 0.2s",
              }} className="hover:-translate-y-[2px] hover:border-[#5865F2]/30">
                {/* Stars */}
                <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                  {[...Array(5)].map((_, si) => (
                    <svg key={si} width="13" height="13" viewBox="0 0 24 24" fill={BLURPLE} stroke="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p style={{ fontSize: 13.5, color: T.TEXT_MUTED, lineHeight: 1.7, marginBottom: 18 }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 16, borderTop: `1px solid ${T.BORDER}` }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: `${t.avatarColor}22`, border: `2px solid ${t.avatarColor}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800, color: t.avatarColor, flexShrink: 0,
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.TEXT }}>{t.name}</div>
                    <div style={{ fontSize: 11.5, color: T.TEXT_DIMMER }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ position: "relative", paddingTop: 112, paddingBottom: 112, borderTop: `1px solid ${T.BORDER}`, overflow: "hidden", background: T.SURFACE }}>
        <div style={{
          position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
          width: 800, height: 500, borderRadius: "50%",
          background: isDark ? "radial-gradient(closest-side, rgba(88,101,242,0.14), transparent 70%)" : "radial-gradient(closest-side, rgba(88,101,242,0.08), transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(36px, 5.5vw, 60px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.04, marginBottom: 20, color: T.TEXT }}>
            Stop clicking.
            <br />
            <span style={{
              background: "linear-gradient(90deg, #5865F2 0%, #7289DA 50%, #EB459E 100%)",
              WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent",
            }}>
              Start asking.
            </span>
          </h2>
          <p style={{ fontSize: 16, color: T.TEXT_MUTED, lineHeight: 1.68, maxWidth: 460, margin: "0 auto", marginBottom: 44 }}>
            Alternus is free to try. Launch the chat and explore a complete AI-native OS in your browser.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/os" style={{
              display: "inline-flex", alignItems: "center", gap: 8, height: 48, padding: "0 28px",
              background: BLURPLE, color: "#FFF", borderRadius: 8, fontSize: 15, fontWeight: 700,
              letterSpacing: "-0.015em", textDecoration: "none", transition: "background 0.15s",
              boxShadow: "0 8px 24px rgba(88,101,242,0.4)",
            }} className="hover:bg-[#4752C4]">
              Try in Chat
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/gallery" style={{
              display: "inline-flex", alignItems: "center", height: 48, padding: "0 24px",
              borderRadius: 8, fontSize: 15, fontWeight: 600, color: T.TEXT_MUTED,
              border: `1px solid ${T.BORDER_STRONG}`, background: T.SURFACE_RAISED,
              textDecoration: "none", transition: "all 0.15s",
            }} className="hover:border-[#5865F2]/60 hover:!text-[#5865F2]">
              Browse Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: `1px solid ${T.BORDER}`, padding: "32px 0", background: T.CHROME }}>
        <div style={{
          maxWidth: 1160, margin: "0 auto", padding: "0 24px",
          display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px 32px",
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: `linear-gradient(135deg, ${BLURPLE} 0%, ${BLURPLE_DARK_HEX} 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 3px 8px rgba(88,101,242,0.35)",
            }}>
              <span style={{ color: "#FFF", fontSize: 13, fontWeight: 700 }}>A</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", color: T.TEXT }}>Alternus</span>
          </Link>
          <nav style={{ display: "flex", flexWrap: "wrap", gap: "4px 4px" }}>
            {[
              { label: "About", href: "/about" },
              { label: "Gallery", href: "/gallery" },
              { label: "Artists", href: "/artists" },
              { label: "Pricing", href: "/pricing" },
              { label: "Contact", href: "/contact" },
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} style={{
                fontSize: 13, color: T.TEXT_DIMMER, textDecoration: "none",
                padding: "4px 10px", borderRadius: 4, transition: "color 0.15s, background 0.15s",
              }} className={isDark ? "hover:!text-white hover:bg-white/[0.07]" : "hover:!text-black hover:bg-black/[0.06]"}>
                {label}
              </Link>
            ))}
          </nav>
          <span style={{ fontSize: 12, color: T.TEXT_DIMMER, marginLeft: "auto" }}>
            © {new Date().getFullYear()} Alternus Art Gallery
          </span>
        </div>
      </footer>
    </div>
  );
}
