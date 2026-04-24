"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/* ─── Static data ─── */
const features = [
  { title: "AI Agent", desc: "A native agent that reads files, drafts emails, opens apps, and runs commands.", icon: "M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.936A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.963 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.582a.5.5 0 010 .963L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.963 0z", color: "#5865F2", bg: "linear-gradient(135deg,#1e1b4b,#312e81)" },
  { title: "Native Mail", desc: "Minimalist inbox with compose, threading, labels — controllable by the agent.", icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6", color: "#EB459E", bg: "linear-gradient(135deg,#4a044e,#831843)" },
  { title: "Smart Files", desc: "Semantic search, drag-and-drop, AI assistant that understands your folder structure.", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z", color: "#FEE75C", bg: "linear-gradient(135deg,#422006,#78350f)" },
  { title: "Voice Mode", desc: "Talk naturally. Dictate, transcribe, run workflows, or have a full conversation.", icon: "M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3zM19 10v1a7 7 0 01-14 0v-1M12 19v4", color: "#57F287", bg: "linear-gradient(135deg,#052e16,#166534)" },
  { title: "Code Studio", desc: "VS Code-style editor with an integrated AI pair-programmer on your project.", icon: "M16 18l6-6-6-6M8 6l-6 6 6 6", color: "#ED4245", bg: "linear-gradient(135deg,#450a0a,#991b1b)" },
  { title: "Knowledge Base", desc: "Private indexed knowledge layer. The agent cites your docs when answering.", icon: "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z", color: "#5865F2", bg: "linear-gradient(135deg,#0c1445,#1e3a8a)" },
];

const suggestions = [
  "Draft an email to my team about the Q2 launch",
  "Find last month's invoices in Files",
  "Open the Code editor with a new React project",
  "Summarize today's unread mail",
];

const featuredApps = [
  { title: "AI Mail Assistant", desc: "Auto-draft, summarize threads, and reply with one command. Your inbox, finally under control.", tag: "Mail", tagColor: "#EB459E", gradient: "linear-gradient(135deg,#1a0040 0%,#3d1f6e 50%,#6d28d9 100%)", raised: 68, backers: 1240, funds: "$24,800" },
  { title: "Smart File System", desc: "Semantic search across all your files. The AI finds anything by meaning, not just filename.", tag: "Files", tagColor: "#57F287", gradient: "linear-gradient(135deg,#0a2a1a 0%,#064e3b 50%,#059669 100%)", raised: 82, backers: 2180, funds: "$41,600" },
  { title: "Code Studio Pro", desc: "VS Code-style editor with an AI pair-programmer that understands your full project context.", tag: "Code", tagColor: "#5865F2", gradient: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#2563eb 100%)", raised: 55, backers: 890, funds: "$17,200" },
];

const exploreItems = [
  { title: "Mail Composer", category: "Mail", c1: "#EC4899", c2: "#8B5CF6", rating: 4.9, users: "12K", icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" },
  { title: "File Vault", category: "Files", c1: "#06B6D4", c2: "#3B82F6", rating: 4.8, users: "8K", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
  { title: "Code AI", category: "Code", c1: "#5865F2", c2: "#7C3AED", rating: 4.9, users: "15K", icon: "M16 18l6-6-6-6M8 6l-6 6 6 6" },
  { title: "Voice Control", category: "Voice", c1: "#10B981", c2: "#06B6D4", rating: 4.7, users: "6K", icon: "M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3z" },
  { title: "Knowledge DB", category: "Docs", c1: "#F59E0B", c2: "#EF4444", rating: 4.8, users: "9K", icon: "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" },
  { title: "Task Runner", category: "Workflow", c1: "#8B5CF6", c2: "#EC4899", rating: 4.6, users: "5K", icon: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" },
  { title: "Calendar AI", category: "Calendar", c1: "#3B82F6", c2: "#06B6D4", rating: 4.7, users: "7K", icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" },
  { title: "Analytics", category: "Data", c1: "#10B981", c2: "#84CC16", rating: 4.5, users: "4K", icon: "M18 20V10M12 20V4M6 20v-6" },
];

const testimonials = [
  { name: "Marcus Johnson", role: "Product Designer", avatar: "MJ", avatarColor: "#5865F2", text: "Alternus completely changed how I work. I just describe what I need and the AI handles the rest. It's like having a senior assistant that never sleeps." },
  { name: "Priya Sharma", role: "Software Engineer", avatar: "PS", avatarColor: "#EB459E", text: "The Code Studio with AI integration is phenomenal. It understands my entire codebase and suggests contextually relevant solutions every time." },
  { name: "David Chen", role: "Startup Founder", avatar: "DC", avatarColor: "#57F287", text: "I replaced 4 different tools with Alternus. Mail, files, code, and knowledge — all in one place with one AI that understands context across all of them." },
  { name: "Elena Voss", role: "Content Creator", avatar: "EV", avatarColor: "#FEE75C", text: "The voice mode is a game changer. I dictate my ideas and Alternus drafts emails, creates files, and organizes everything automatically." },
  { name: "James Carter", role: "Freelance Developer", avatar: "JC", avatarColor: "#ED4245", text: "Being able to ask the AI to find last month's invoices across my files and emails at the same time — that alone saves me hours every week." },
  { name: "Lena Spencer", role: "UX Researcher", avatar: "LS", avatarColor: "#5865F2", text: "The knowledge base feature is what sold me. I indexed all my research docs and now the AI cites them directly. Incredibly powerful." },
];

/* ─── Theme tokens ─── */
const BLURPLE = "#5865F2";
const BLURPLE_DARK_HEX = "#4752C4";
const GREEN = "#23A559";

const DARK = { BG: "#1E1F22", SURFACE: "#2B2D31", RAISED: "#313338", OVERLAY: "#383A40", CHROME: "#111214", TEXT: "#F2F3F5", MUTED: "#B5BAC1", DIM: "#80848E", BORDER: "rgba(255,255,255,0.06)", STRONG: "rgba(255,255,255,0.1)", BSOFT: "rgba(88,101,242,0.15)" };
const LIGHT = { BG: "#FFFFFF", SURFACE: "#F2F3F5", RAISED: "#FFFFFF", OVERLAY: "#E3E5E8", CHROME: "#E3E5E8", TEXT: "#060607", MUTED: "#4E5058", DIM: "#80848E", BORDER: "rgba(0,0,0,0.08)", STRONG: "rgba(0,0,0,0.12)", BSOFT: "rgba(88,101,242,0.08)" };

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const T = isDark ? DARK : LIGHT;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const goToChat = (q?: string) => {
    const t = (q ?? prompt).trim();
    router.push(t ? `/os?prompt=${encodeURIComponent(t)}` : "/os");
  };

  return (
    <div style={{ minHeight: "100vh", background: T.BG, color: T.TEXT, fontFamily: "var(--font-geist-sans),-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif", transition: "background 0.3s,color 0.3s" }}>

      {/* ── Keyframe animations ── */}
      <style>{`
        @keyframes floatA { 0%,100%{transform:translateY(0px) rotate(-2deg)} 50%{transform:translateY(-14px) rotate(-2deg)} }
        @keyframes floatB { 0%,100%{transform:translateY(0px) rotate(3deg)} 50%{transform:translateY(-10px) rotate(3deg)} }
        @keyframes floatC { 0%,100%{transform:translateY(-6px) rotate(-1deg)} 50%{transform:translateY(8px) rotate(-1deg)} }
        @keyframes pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(0.96)} }
        @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes gradX  { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0} }
        .float-a{animation:floatA 4s ease-in-out infinite}
        .float-b{animation:floatB 5s ease-in-out infinite}
        .float-c{animation:floatC 6s ease-in-out infinite}
        .pulse-dot{animation:pulse 2s ease-in-out infinite}
        .cursor-blink::after{content:'|';animation:blink 1s step-end infinite;margin-left:1px}
      `}</style>

      {/* ─── Nav ─── */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, width: "100%", transition: "background 0.25s,border-color 0.25s", backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none", WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none", background: scrolled ? (isDark ? "rgba(30,31,34,0.92)" : "rgba(255,255,255,0.92)") : "transparent", borderBottom: `1px solid ${scrolled ? T.STRONG : "transparent"}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, background: `linear-gradient(135deg,${BLURPLE} 0%,${BLURPLE_DARK_HEX} 100%)`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(88,101,242,0.45)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -6, left: -6, width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
              <span style={{ color: "#FFF", fontSize: 15, fontWeight: 800, position: "relative" }}>A</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.025em", color: T.TEXT }}>Alternus</span>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 40 }} className="hidden md:flex">
            {[{ label: "Features", href: "#features" }, { label: "Explore", href: "#explore" }, { label: "Gallery", href: "/gallery" }, { label: "Pricing", href: "/pricing" }].map((l) => (
              <Link key={l.label} href={l.href} style={{ fontSize: 14, color: T.MUTED, fontWeight: 500, textDecoration: "none", padding: "0 12px", height: 36, display: "flex", alignItems: "center", borderRadius: 6, transition: "color 0.15s,background 0.15s" }} className={isDark ? "hover:bg-white/[0.07] hover:!text-white" : "hover:bg-black/[0.05] hover:!text-black"}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setIsDark(!isDark)} style={{ width: 36, height: 36, borderRadius: 6, border: `1px solid ${T.STRONG}`, background: T.SURFACE, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", color: T.MUTED }} title={isDark ? "Light mode" : "Dark mode"}>
              {isDark
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              }
            </button>
            <Link href="/login" style={{ display: "none", alignItems: "center", height: 36, padding: "0 14px", borderRadius: 6, fontSize: 14, fontWeight: 500, color: T.MUTED, textDecoration: "none" }} className="sm:!inline-flex">Log in</Link>
            <Link href="/os" style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 16px", background: BLURPLE, color: "#FFF", borderRadius: 6, fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", textDecoration: "none", transition: "background 0.15s", boxShadow: "0 2px 8px rgba(88,101,242,0.4)" }} className="hover:bg-[#4752C4]">
              Try in Chat
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero (Discord-promo style) ─── */}
      <section style={{ position: "relative", paddingTop: 80, paddingBottom: 80, overflow: "hidden", background: isDark ? "linear-gradient(180deg,#0b0f3d 0%,#1a1f7a 50%,#1e2a9e 100%)" : "linear-gradient(180deg,#1e2a9e 0%,#3b4fe0 50%,#5865F2 100%)" }} className="md:pt-[120px] md:pb-[120px]">
        {/* Starry background */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.35) 1px,transparent 1px), radial-gradient(rgba(255,255,255,0.2) 1px,transparent 1px)", backgroundSize: "120px 120px, 60px 60px", backgroundPosition: "0 0, 30px 30px", opacity: 0.7 }} />
          {/* Glow orbs */}
          <div style={{ position: "absolute", left: "-10%", top: "20%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(closest-side,rgba(120,140,255,0.35),transparent 70%)", filter: "blur(40px)" }} />
          <div style={{ position: "absolute", right: "-10%", bottom: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(closest-side,rgba(88,101,242,0.4),transparent 70%)", filter: "blur(40px)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left: rounded card with OS mockup */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "relative", borderRadius: 28, overflow: "hidden", background: "linear-gradient(135deg,#2336c9 0%,#4456e8 50%,#6074ff 100%)", aspectRatio: "1 / 0.82", boxShadow: "0 40px 80px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
                {/* Card inner glow */}
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%,rgba(255,255,255,0.12),transparent 60%)" }} />
                {/* Decorative stars inside card */}
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.3) 1px,transparent 1px)", backgroundSize: "40px 40px", opacity: 0.5 }} />

                {/* Floating OS window mockup */}
                <div className="float-a" style={{ position: "absolute", left: "8%", top: "10%", width: "78%", background: "#FFFFFF", borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.35)" }}>
                  {/* Window header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid #E3E5E8" }}>
                    <button aria-label="back" style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4E5058" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    </button>
                    <span style={{ fontSize: 14, color: "#4E5058", fontWeight: 600 }}>#</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#060607" }}>main-chat</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4E5058" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
                    <div style={{ flex: 1 }} />
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4E5058" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
                  </div>

                  {/* Chat messages */}
                  <div style={{ padding: "16px 16px 8px" }}>
                    <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#EB459E)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13 }}>A</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#5865F2" }}>Alternus</span>
                          <span style={{ fontSize: 10.5, color: "#80848E" }}>Today at 2:12 PM</span>
                        </div>
                        <div style={{ fontSize: 13, color: "#2E3035", lineHeight: 1.5 }}>drafted your email and organized files</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#EB459E22", border: "1px solid #EB459E44", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EB459E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6"/></svg>
                          </div>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#5865F222", border: "1px solid #5865F244", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5865F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#57F287,#06B6D4)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13 }}>Y</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#57F287" }}>You</span>
                          <span style={{ fontSize: 10.5, color: "#80848E" }}>Today at 2:13 PM</span>
                        </div>
                        <div style={{ fontSize: 13, color: "#2E3035", lineHeight: 1.5 }}>now summarize today&apos;s unread mail</div>
                      </div>
                    </div>
                  </div>

                  {/* Input area */}
                  <div style={{ padding: "10px 16px 14px", borderTop: "1px solid #E3E5E8" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, height: 38, padding: "0 12px", borderRadius: 10, background: "#F2F3F5" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#80848E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                      <span style={{ fontSize: 12.5, color: "#80848E", flex: 1 }}>Ask Alternus anything…</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5865F2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Decorative floating badge */}
                <div className="float-b" style={{ position: "absolute", right: "6%", bottom: "10%", padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 12px 30px rgba(0,0,0,0.25)" }}>
                  <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN }} />
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#060607" }}>47 tasks automated</span>
                </div>
              </div>
            </div>

            {/* Right: headline + copy + CTA */}
            <div style={{ color: "#FFFFFF" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 32, padding: "0 14px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, marginBottom: 28, backdropFilter: "blur(8px)" }}>
                <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, display: "block", boxShadow: "0 0 0 2px rgba(35,165,89,0.3)" }} />
                <span style={{ fontSize: 12.5, fontWeight: 500, color: "#FFFFFF" }}>Claude Opus 4.6 · Online</span>
              </div>

              <h1 style={{ fontSize: "clamp(40px, 6vw, 76px)", lineHeight: 0.98, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 28, color: "#FFFFFF", textTransform: "uppercase", fontFamily: "var(--font-geist-sans),-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif" }}>
                Run your<br />
                digital life<br />
                with one AI
              </h1>

              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.85)", lineHeight: 1.65, fontWeight: 400, marginBottom: 36, maxWidth: 520 }}>
                Use AI agents, smart files, voice commands, and a built-in code studio to automate anything. Set up your workspace, write emails, open apps, and organize everything — your way.
              </p>

              {/* Input */}
              <form onSubmit={(e) => { e.preventDefault(); goToChat(); }} style={{ maxWidth: 560 }}>
                <div style={{ position: "relative", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 14, overflow: "hidden", backdropFilter: "blur(12px)", boxShadow: "0 12px 40px rgba(0,0,0,0.3)" }}>
                  <input ref={inputRef} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask Alternus anything — try 'draft an email to my team'" style={{ width: "100%", padding: "16px 20px 10px", fontSize: 15, background: "transparent", border: "none", outline: "none", color: "#FFFFFF", boxSizing: "border-box" }} className="placeholder:text-white/50" />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px 10px" }}>
                    <div style={{ display: "flex", gap: 2, color: "rgba(255,255,255,0.6)" }}>
                      {[{ d: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3", t: "Upload" }, { d: "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20", t: "Research" }, { d: "M16 18l6-6-6-6M8 6l-6 6 6 6", t: "Code" }, { d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z", t: "Chat" }].map((b, i) => (
                        <button key={i} type="button" title={b.t} style={{ width: 32, height: 32, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", transition: "background 0.15s,color 0.15s", color: "inherit" }} className="hover:bg-white/[0.12] hover:!text-white">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={b.d}/></svg>
                        </button>
                      ))}
                    </div>
                    <button type="submit" style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 38, padding: "0 20px", background: "#FFFFFF", color: "#1a1f7a", borderRadius: 8, fontSize: 13.5, fontWeight: 800, border: "none", cursor: "pointer", transition: "all 0.15s", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }} className="hover:bg-white/90">
                      Try in Chat
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                  {suggestions.map((s) => (
                    <button key={s} type="button" onClick={() => goToChat(s)} style={{ fontSize: 12.5, color: "rgba(255,255,255,0.85)", padding: "0 14px", height: 30, borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", cursor: "pointer", fontWeight: 450, transition: "all 0.15s", backdropFilter: "blur(8px)" }} className="hover:bg-white/15 hover:border-white/40">
                      {s}
                    </button>
                  ))}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section style={{ borderTop: `1px solid ${T.BORDER}`, borderBottom: `1px solid ${T.BORDER}`, background: T.SURFACE }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { value: "50+", label: "AI Modules", color: BLURPLE, icon: "M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.936A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.963 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.582a.5.5 0 010 .963L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.963 0z" },
              { value: "10K+", label: "Active Users", color: "#EB459E", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" },
              { value: "99.9%", label: "Uptime SLA", color: "#57F287", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
              { value: "4.9★", label: "Avg Rating", color: "#FEE75C", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "28px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 14, borderRight: i < 3 ? `1px solid ${T.BORDER}` : "none" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, border: `1px solid ${s.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon}/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.04em", color: T.TEXT, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: T.MUTED, marginTop: 3 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OS Preview ─── */}
      <section style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <Link href="/os" className="group block hover:border-[#5865F2]/50" style={{ borderRadius: 18, overflow: "hidden", border: `1px solid ${T.STRONG}`, boxShadow: isDark ? "0 24px 64px -12px rgba(0,0,0,0.65),0 0 0 1px rgba(255,255,255,0.04)" : "0 24px 64px -12px rgba(0,0,0,0.14)", display: "block", textDecoration: "none", transition: "border-color 0.25s,box-shadow 0.25s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "0 16px", height: 38, background: T.CHROME, borderBottom: `1px solid ${T.BORDER}` }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ED4245" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FEE75C" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#57F287" }} />
              <div style={{ marginLeft: 16, height: 22, padding: "0 12px", borderRadius: 4, background: T.SURFACE, display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: T.DIM }}>alternus.art/os</span>
              </div>
              <span style={{ marginLeft: "auto", fontSize: 10.5, color: T.DIM, transition: "color 0.15s" }} className="group-hover:!text-[#5865F2]">Click to open →</span>
            </div>
            <div style={{ height: 440, background: T.BG, display: "flex" }} className="md:h-[520px]">
              {/* Server sidebar */}
              <div style={{ width: 72, background: T.CHROME, padding: "12px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: `linear-gradient(135deg,${BLURPLE},#7289DA)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4, boxShadow: "0 4px 12px rgba(88,101,242,0.4)" }}>
                  <span style={{ color: "#FFF", fontSize: 18, fontWeight: 800 }}>A</span>
                </div>
                <div style={{ width: 32, height: 1, background: T.OVERLAY, borderRadius: 1 }} />
                {[{ icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", active: false }, { icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z", active: true }, { icon: "M16 18l6-6-6-6M8 6l-6 6 6 6", active: false }, { icon: "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z", active: false }].map((app, ai) => (
                  <div key={ai} style={{ position: "relative" }}>
                    {app.active && <div style={{ position: "absolute", left: -12, top: "50%", transform: "translateY(-50%)", width: 4, height: 32, background: isDark ? "white" : BLURPLE, borderRadius: "0 4px 4px 0" }} />}
                    <div style={{ width: 48, height: 48, borderRadius: app.active ? 16 : 24, background: app.active ? BLURPLE : T.RAISED, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", cursor: "pointer" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={app.active ? "#fff" : T.DIM} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={app.icon}/></svg>
                    </div>
                  </div>
                ))}
              </div>
              {/* Channel list */}
              <div style={{ width: 240, background: T.SURFACE, borderRight: `1px solid ${T.BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
                <div style={{ padding: "16px 12px 10px", borderBottom: `1px solid ${T.BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.TEXT }}>Smart Files</span>
                </div>
                <div style={{ padding: "8px", flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.DIM, padding: "4px 8px", marginBottom: 2 }}>Folders</div>
                  {[{ name: "Projects", u: 0 }, { name: "Invoices", u: 2 }, { name: "Design Assets", u: 0 }, { name: "Contracts", u: 0 }, { name: "Archive", u: 0 }].map((ch) => (
                    <div key={ch.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 8px", borderRadius: 4, cursor: "pointer", background: ch.name === "Invoices" ? T.OVERLAY : "transparent" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14, color: T.DIM }}>#</span>
                        <span style={{ fontSize: 13, color: ch.u > 0 ? T.TEXT : T.MUTED, fontWeight: ch.u > 0 ? 600 : 400 }}>{ch.name}</span>
                      </div>
                      {ch.u > 0 && <div style={{ minWidth: 18, height: 18, borderRadius: 9, background: BLURPLE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#FFF", padding: "0 5px" }}>{ch.u}</div>}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: T.CHROME, borderTop: `1px solid ${T.BORDER}` }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${BLURPLE},#7289DA)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#FFF" }}>A</div>
                    <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: GREEN, border: `2px solid ${T.CHROME}` }} />
                  </div>
                  <div><div style={{ fontSize: 12, fontWeight: 600, color: T.TEXT }}>You</div><div style={{ fontSize: 10, color: GREEN }}>● Online</div></div>
                </div>
              </div>
              {/* Main */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "0 20px", height: 48, borderBottom: `1px solid ${T.BORDER}`, display: "flex", alignItems: "center", gap: 8, background: T.RAISED }}>
                  <span style={{ fontSize: 14, color: T.DIM }}>#</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.TEXT }}>Invoices</span>
                  <div style={{ width: 1, height: 16, background: T.STRONG, margin: "0 4px" }} />
                  <span style={{ fontSize: 12, color: T.DIM }}>12 files · AI indexed</span>
                </div>
                <div style={{ flex: 1, padding: 20, overflow: "hidden" }}>
                  <div style={{ display: "flex", gap: 12, padding: "12px 16px", borderRadius: 10, background: isDark ? "rgba(88,101,242,0.12)" : "rgba(88,101,242,0.06)", border: `1px solid rgba(88,101,242,0.2)`, marginBottom: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${BLURPLE},#7289DA)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 800, color: "#FFF" }}>AI</div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><span style={{ fontSize: 12, fontWeight: 700, color: BLURPLE }}>Alternus AI</span><span style={{ fontSize: 10.5, color: T.DIM }}>Today at 10:42</span></div>
                      <p style={{ fontSize: 12.5, color: T.MUTED, lineHeight: 1.6, margin: 0 }}>Found <strong style={{ color: T.TEXT }}>2 invoices from last month</strong> — Total: <strong style={{ color: T.TEXT }}>$4,820</strong>. Want me to export a summary?</p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                    {[{ name: "Invoice_March_2026.pdf", size: "128 KB", color: "#ED4245" }, { name: "Design_Contract_Q2.pdf", size: "84 KB", color: BLURPLE }, { name: "Stripe_Receipt.pdf", size: "32 KB", color: "#57F287" }].map((f) => (
                      <div key={f.name} style={{ padding: "10px 12px", borderRadius: 8, background: T.RAISED, border: `1px solid ${T.BORDER}`, cursor: "pointer" }}>
                        <div style={{ width: 28, height: 32, borderRadius: 4, background: `${f.color}22`, border: `1px solid ${f.color}44`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, fontSize: 8, fontWeight: 800, color: f.color }}>PDF</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: T.TEXT, lineHeight: 1.3, marginBottom: 2 }}>{f.name}</div>
                        <div style={{ fontSize: 10, color: T.DIM }}>{f.size}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: "10px 16px 16px", background: T.RAISED, borderTop: `1px solid ${T.BORDER}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 14px", height: 40, borderRadius: 8, background: T.OVERLAY }}>
                    <span style={{ fontSize: 12, color: T.DIM }}>Ask AI about these files...</span>
                    <div style={{ flex: 1 }} />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={BLURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ─── Transform Split Section ─── */}
      <section style={{ paddingTop: 96, paddingBottom: 96, borderTop: `1px solid ${T.BORDER}`, background: T.SURFACE, overflow: "hidden" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left text */}
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 10px", background: isDark ? "rgba(88,101,242,0.15)" : "rgba(88,101,242,0.08)", border: `1px solid rgba(88,101,242,0.3)`, borderRadius: 4, marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: BLURPLE }}>Transform your workflow</span>
              </div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.06, color: T.TEXT, marginBottom: 18 }}>
                Digital Resources to<br />
                <span style={{ background: "linear-gradient(90deg,#5865F2,#EB459E)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Transform Your Ideas
                </span>
              </h2>
              <p style={{ fontSize: 15.5, color: T.MUTED, lineHeight: 1.7, marginBottom: 32 }}>
                One AI-native OS that connects your mail, files, code, and knowledge. Stop switching between apps — let the agent work across all of them simultaneously.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
                {[
                  { label: "Fully Customizable", desc: "Adapt every module to your workflow and preferences.", color: BLURPLE },
                  { label: "Cross-Platform Ready", desc: "Works in any browser, on any device, without installs.", color: "#EB459E" },
                  { label: "Privacy First", desc: "Your data stays in your private knowledge layer.", color: "#57F287" },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: `${item.color}20`, border: `1px solid ${item.color}35`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.TEXT }}>{item.label} </span>
                      <span style={{ fontSize: 13.5, color: T.MUTED }}>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/os" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 44, padding: "0 24px", background: BLURPLE, color: "#FFF", borderRadius: 8, fontSize: 14.5, fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 20px rgba(88,101,242,0.4)", transition: "background 0.15s" }} className="hover:bg-[#4752C4]">
                Start for Free
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </Link>
            </div>

            {/* Right illustration */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", inset: -40, background: isDark ? "radial-gradient(ellipse at 60% 40%,rgba(88,101,242,0.18),transparent 65%)" : "radial-gradient(ellipse at 60% 40%,rgba(88,101,242,0.1),transparent 65%)", pointerEvents: "none" }} />
              <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", border: `1px solid ${T.STRONG}`, boxShadow: isDark ? "0 32px 72px rgba(0,0,0,0.5)" : "0 32px 72px rgba(0,0,0,0.12)" }}>
                {/* Illustration header */}
                <div style={{ height: 44, background: isDark ? "#0d0e10" : "#1a1b1e", display: "flex", alignItems: "center", padding: "0 16px", gap: 6, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ED4245" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEE75C" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#57F287" }} />
                  <div style={{ flex: 1, marginLeft: 12, height: 24, borderRadius: 4, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", padding: "0 10px" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>alternus.art/os · AI workspace</span>
                  </div>
                </div>
                {/* Illustration body */}
                <div style={{ background: isDark ? "#16181c" : "#1E1F22", padding: 20, minHeight: 360 }}>
                  {/* Fake command input */}
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: BLURPLE }} />
                      <span className="cursor-blink" style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-geist-mono),monospace" }}>Organize all files by date and generate a summary report</span>
                    </div>
                  </div>
                  {/* AI response stream */}
                  <div style={{ background: "rgba(88,101,242,0.1)", border: "1px solid rgba(88,101,242,0.2)", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: BLURPLE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, fontWeight: 800, color: "#fff" }}>AI</div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: BLURPLE, marginBottom: 4 }}>Alternus · Processing</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>Scanning 47 files across 3 folders... Found <strong style={{ color: "#fff" }}>12 documents</strong> from March. Grouping by category and generating summary...</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[["📁", "12 Files", BLURPLE], ["📧", "3 Emails", "#EB459E"], ["📝", "Summary", "#57F287"]].map(([icon, label, color], i) => (
                        <div key={i} style={{ flex: 1, padding: "8px 0", borderRadius: 6, background: `${color}18`, border: `1px solid ${color}30`, textAlign: "center" }}>
                          <div style={{ fontSize: 14 }}>{icon}</div>
                          <div style={{ fontSize: 10, color: color, fontWeight: 600 }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Fake progress bars */}
                  {[{ label: "Files organized", pct: 100, color: "#57F287" }, { label: "Summary generated", pct: 72, color: BLURPLE }].map((p) => (
                    <div key={p.label} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{p.label}</span>
                        <span style={{ fontSize: 11, color: p.color, fontWeight: 700 }}>{p.pct}%</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${p.pct}%`, borderRadius: 4, background: `linear-gradient(90deg,${p.color},${p.color}88)` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorative floating mini badge */}
              <div className="float-a" style={{ position: "absolute", top: -16, right: -16, padding: "8px 14px", borderRadius: 10, background: isDark ? DARK.RAISED : LIGHT.RAISED, border: `1px solid ${T.STRONG}`, boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#57F287", boxShadow: "0 0 0 3px rgba(87,242,135,0.25)" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: T.TEXT }}>47 tasks automated today</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Apps ─── */}
      <section style={{ paddingTop: 96, paddingBottom: 96, borderTop: `1px solid ${T.BORDER}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 44, flexWrap: "wrap", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 900, letterSpacing: "-0.04em", color: T.TEXT, marginBottom: 8 }}>New Featured Apps</h2>
              <p style={{ fontSize: 14, color: T.MUTED }}>Check out the latest AI-powered modules. Let&apos;s start your journey from here.</p>
            </div>
            <Link href="/gallery" style={{ fontSize: 13.5, fontWeight: 600, color: BLURPLE, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
              View All <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredApps.map((app) => (
              <div key={app.title} style={{ borderRadius: 16, overflow: "hidden", background: T.RAISED, border: `1px solid ${T.BORDER}`, boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.07)", transition: "transform 0.2s,box-shadow 0.2s" }} className="hover:-translate-y-1">
                <div style={{ height: 168, background: app.gradient, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 12, left: 12, height: 22, padding: "0 10px", borderRadius: 4, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: app.tagColor }}>{app.tag}</span>
                  </div>
                  <div style={{ position: "absolute", right: -24, bottom: -24, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                  <div style={{ position: "absolute", right: 28, top: 24, width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                  <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={features.find(f => f.title.includes(app.tag === "Mail" ? "Mail" : app.tag === "Files" ? "Files" : "Code"))?.icon || ""}/></svg>
                  </div>
                </div>
                <div style={{ padding: "20px 20px 18px" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", color: T.TEXT, marginBottom: 6, lineHeight: 1.3 }}>{app.title}</h3>
                  <p style={{ fontSize: 13, color: T.MUTED, lineHeight: 1.6, marginBottom: 16 }}>{app.desc}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 11.5, color: T.DIM }}>{app.funds} Raised</span>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: T.TEXT }}>{app.raised}%</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 4, background: T.OVERLAY, marginBottom: 16, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 4, width: `${app.raised}%`, background: `linear-gradient(90deg,${BLURPLE},#7289DA)` }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11.5, color: T.DIM }}><strong style={{ color: T.MUTED }}>{app.backers.toLocaleString()}</strong> Backers</span>
                    <button style={{ height: 32, padding: "0 16px", borderRadius: 6, border: `1px solid ${BLURPLE}40`, background: isDark ? "rgba(88,101,242,0.12)" : "rgba(88,101,242,0.08)", color: BLURPLE, fontSize: 12.5, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }} className="hover:bg-[#5865F2] hover:!text-white hover:border-[#5865F2]">
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
      <section id="features" style={{ paddingTop: 96, paddingBottom: 96, borderTop: `1px solid ${T.BORDER}`, background: T.SURFACE }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ maxWidth: 560, marginBottom: 52 }}>
            <div style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 10px", background: isDark ? "rgba(88,101,242,0.15)" : "rgba(88,101,242,0.08)", border: `1px solid rgba(88,101,242,0.3)`, borderRadius: 4, marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: BLURPLE }}>Built-in capabilities</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.08, color: T.TEXT, marginBottom: 16 }}>Every app, one intelligence.</h2>
            <p style={{ fontSize: 15, color: T.MUTED, lineHeight: 1.65 }}>Mail, Files, Code, Voice, Knowledge — they all share the same agent and memory. Delegate anything, across any app.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${T.BORDER}`, transition: "transform 0.2s,border-color 0.2s", background: T.RAISED }} className="hover:border-[#5865F2]/40 hover:-translate-y-[2px]">
                <div style={{ height: 80, background: f.bg, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "absolute", right: -20, top: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon}/></svg>
                  </div>
                </div>
                <div style={{ padding: "18px 20px 20px" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.015em", color: T.TEXT, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 13.5, color: T.MUTED, lineHeight: 1.62 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Explore Digital Creations ─── */}
      <section id="explore" style={{ paddingTop: 96, paddingBottom: 96, borderTop: `1px solid ${T.BORDER}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 10px", background: isDark ? "rgba(88,101,242,0.15)" : "rgba(88,101,242,0.08)", border: `1px solid rgba(88,101,242,0.3)`, borderRadius: 4, marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: BLURPLE }}>Explore</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.04em", color: T.TEXT, marginBottom: 12 }}>
              Explore Unique Digital Creations<br />
              <span style={{ background: "linear-gradient(90deg,#5865F2,#EB459E)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Built for You</span>
            </h2>
            <p style={{ fontSize: 15, color: T.MUTED, maxWidth: 500, margin: "0 auto" }}>Every module is designed to work seamlessly with the AI agent and with each other.</p>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 32, padding: "4px", background: T.SURFACE, borderRadius: 10, border: `1px solid ${T.BORDER}` }} className="w-fit mx-auto">
            {["All", "Mail", "Files", "Code", "Voice", "Docs", "Workflow", "Data"].map((tab, i) => (
              <div key={tab} style={{ padding: "6px 14px", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", background: i === 0 ? T.RAISED : "transparent", color: i === 0 ? T.TEXT : T.DIM, boxShadow: i === 0 ? isDark ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
                {tab}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {exploreItems.map((item) => (
              <div key={item.title} style={{ borderRadius: 14, overflow: "hidden", background: T.RAISED, border: `1px solid ${T.BORDER}`, boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.25)" : "0 2px 12px rgba(0,0,0,0.06)", transition: "transform 0.2s,box-shadow 0.2s", cursor: "pointer" }} className="hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(88,101,242,0.15)]">
                {/* Card illustration */}
                <div style={{ height: 130, background: `linear-gradient(135deg,${item.c1},${item.c2})`, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", right: -16, bottom: -16, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                  <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}/></svg>
                  </div>
                  <div style={{ position: "absolute", top: 10, right: 10, padding: "3px 8px", borderRadius: 4, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{item.category}</span>
                  </div>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: T.TEXT, marginBottom: 10 }}>{item.title}</h4>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill={BLURPLE} stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.TEXT }}>{item.rating}</span>
                    </div>
                    <span style={{ fontSize: 11, color: T.DIM }}>{item.users} users</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how" style={{ paddingTop: 96, paddingBottom: 96, borderTop: `1px solid ${T.BORDER}`, background: T.SURFACE }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ maxWidth: 560, marginBottom: 52 }}>
            <div style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 10px", background: isDark ? "rgba(88,101,242,0.15)" : "rgba(88,101,242,0.08)", border: `1px solid rgba(88,101,242,0.3)`, borderRadius: 4, marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: BLURPLE }}>How it works</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.08, color: T.TEXT }}>Three steps to a smarter desktop.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { n: "01", t: "Describe what you want", d: "Type or speak a goal. The agent plans and confirms before taking action.", color: BLURPLE },
              { n: "02", t: "Agent runs your apps", d: "It opens Mail, Files, Code, Calendar — whatever's needed — and runs the steps.", color: "#EB459E" },
              { n: "03", t: "You review & ship", d: "Every change is visible in-app. Approve, tweak, or redo with one command.", color: "#57F287" },
            ].map((s) => (
              <div key={s.n} style={{ position: "relative", padding: "28px 28px 32px", borderRadius: 14, background: T.RAISED, border: `1px solid ${T.BORDER}`, overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${s.color} 0%,transparent 100%)` }} />
                <div style={{ position: "absolute", right: 20, top: 24, fontSize: 64, fontWeight: 900, color: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)", lineHeight: 1, userSelect: "none", fontFamily: "var(--font-geist-mono),monospace" }}>{s.n}</div>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: `${s.color}18`, border: `1px solid ${s.color}30`, marginBottom: 18 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, fontFamily: "var(--font-geist-mono),monospace", color: s.color }}>{s.n}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 10, color: T.TEXT, lineHeight: 1.3 }}>{s.t}</h3>
                <p style={{ fontSize: 14, color: T.MUTED, lineHeight: 1.64 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section style={{ paddingTop: 96, paddingBottom: 96, borderTop: `1px solid ${T.BORDER}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 10px", background: isDark ? "rgba(88,101,242,0.15)" : "rgba(88,101,242,0.08)", border: `1px solid rgba(88,101,242,0.3)`, borderRadius: 4, marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: BLURPLE }}>Testimonials</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.08, color: T.TEXT, marginBottom: 12 }}>
              Hear How We&apos;ve Made a Difference
            </h2>
            <p style={{ fontSize: 15, color: T.MUTED, maxWidth: 460, margin: "0 auto" }}>Real users sharing how Alternus transformed their daily workflow.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <div key={i} style={{ padding: "24px", borderRadius: 14, background: T.RAISED, border: `1px solid ${T.BORDER}`, boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.2)" : "0 2px 12px rgba(0,0,0,0.05)", transition: "transform 0.2s,border-color 0.2s" }} className="hover:-translate-y-[2px] hover:border-[#5865F2]/30">
                <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                  {[...Array(5)].map((_, si) => (
                    <svg key={si} width="14" height="14" viewBox="0 0 24 24" fill={BLURPLE} stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                </div>
                <p style={{ fontSize: 14, color: T.MUTED, lineHeight: 1.72, marginBottom: 20 }}>&ldquo;{t.text}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 16, borderTop: `1px solid ${T.BORDER}` }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${t.avatarColor}20`, border: `2px solid ${t.avatarColor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: t.avatarColor, flexShrink: 0 }}>{t.avatar}</div>
                  <div><div style={{ fontSize: 13.5, fontWeight: 700, color: T.TEXT }}>{t.name}</div><div style={{ fontSize: 12, color: T.DIM }}>{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ position: "relative", paddingTop: 120, paddingBottom: 120, borderTop: `1px solid ${T.BORDER}`, overflow: "hidden", background: T.SURFACE }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 900, height: 560, borderRadius: "50%", background: isDark ? "radial-gradient(closest-side,rgba(88,101,242,0.18),transparent 70%)" : "radial-gradient(closest-side,rgba(88,101,242,0.1),transparent 70%)" }} />
          <div style={{ position: "absolute", left: "15%", bottom: "20%", width: 240, height: 240, borderRadius: "50%", background: isDark ? "radial-gradient(closest-side,rgba(235,69,158,0.1),transparent 70%)" : "radial-gradient(closest-side,rgba(235,69,158,0.06),transparent 70%)" }} />
          <div style={{ position: "absolute", right: "10%", top: "15%", width: 200, height: 200, borderRadius: "50%", background: isDark ? "radial-gradient(closest-side,rgba(87,242,135,0.08),transparent 70%)" : "radial-gradient(closest-side,rgba(87,242,135,0.05),transparent 70%)" }} />
          {/* Decorative dots */}
          <svg style={{ position: "absolute", left: "5%", top: "10%", opacity: isDark ? 0.15 : 0.08 }} width="120" height="120" viewBox="0 0 120 120">
            {[...Array(25)].map((_, i) => <circle key={i} cx={(i % 5) * 24 + 12} cy={Math.floor(i / 5) * 24 + 12} r="2" fill={BLURPLE} />)}
          </svg>
          <svg style={{ position: "absolute", right: "5%", bottom: "10%", opacity: isDark ? 0.15 : 0.08 }} width="120" height="120" viewBox="0 0 120 120">
            {[...Array(25)].map((_, i) => <circle key={i} cx={(i % 5) * 24 + 12} cy={Math.floor(i / 5) * 24 + 12} r="2" fill="#EB459E" />)}
          </svg>
        </div>
        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(38px,5.8vw,64px)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.02, marginBottom: 22, color: T.TEXT }}>
            Stop clicking.
            <br />
            <span style={{ background: "linear-gradient(100deg,#5865F2 0%,#7289DA 40%,#EB459E 80%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", animation: "gradX 4s ease infinite" }}>
              Start asking.
            </span>
          </h2>
          <p style={{ fontSize: 17, color: T.MUTED, lineHeight: 1.68, maxWidth: 480, margin: "0 auto", marginBottom: 48 }}>
            Alternus is free to try. Launch the chat and explore a complete AI-native OS in your browser.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <Link href="/os" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 52, padding: "0 32px", background: BLURPLE, color: "#FFF", borderRadius: 10, fontSize: 16, fontWeight: 700, letterSpacing: "-0.015em", textDecoration: "none", transition: "background 0.15s", boxShadow: "0 10px 28px rgba(88,101,242,0.45)" }} className="hover:bg-[#4752C4]">
              Try in Chat — it&apos;s free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
            <Link href="/gallery" style={{ display: "inline-flex", alignItems: "center", height: 52, padding: "0 28px", borderRadius: 10, fontSize: 16, fontWeight: 600, color: T.MUTED, border: `1px solid ${T.STRONG}`, background: T.RAISED, textDecoration: "none", transition: "all 0.15s" }} className="hover:border-[#5865F2]/60 hover:!text-[#5865F2]">
              Browse Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: `1px solid ${T.BORDER}`, padding: "36px 0", background: T.CHROME }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px 32px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${BLURPLE},${BLURPLE_DARK_HEX})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 8px rgba(88,101,242,0.35)" }}>
              <span style={{ color: "#FFF", fontSize: 13, fontWeight: 700 }}>A</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", color: T.TEXT }}>Alternus</span>
          </Link>
          <nav style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {[{ label: "About", href: "/about" }, { label: "Gallery", href: "/gallery" }, { label: "Artists", href: "/artists" }, { label: "Pricing", href: "/pricing" }, { label: "Contact", href: "/contact" }, { label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }].map(({ label, href }) => (
              <Link key={label} href={href} style={{ fontSize: 13, color: T.DIM, textDecoration: "none", padding: "4px 10px", borderRadius: 4, transition: "color 0.15s,background 0.15s" }} className={isDark ? "hover:!text-white hover:bg-white/[0.07]" : "hover:!text-black hover:bg-black/[0.06]"}>
                {label}
              </Link>
            ))}
          </nav>
          <span style={{ fontSize: 12, color: T.DIM, marginLeft: "auto" }}>© {new Date().getFullYear()} Alternus Art Gallery</span>
        </div>
      </footer>
    </div>
  );
}
