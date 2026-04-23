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

const BG = "#1E1F22";
const SURFACE = "#2B2D31";
const SURFACE_RAISED = "#313338";
const SURFACE_OVERLAY = "#383A40";
const BLURPLE = "#5865F2";
const BLURPLE_DARK = "#4752C4";
const BLURPLE_SOFT = "rgba(88,101,242,0.15)";
const TEXT = "#F2F3F5";
const TEXT_MUTED = "#B5BAC1";
const TEXT_DIMMER = "#80848E";
const BORDER = "rgba(255,255,255,0.06)";
const BORDER_STRONG = "rgba(255,255,255,0.1)";
const GREEN = "#23A559";

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
        background: BG,
        color: TEXT,
        fontFamily:
          "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
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
          background: scrolled ? "rgba(30,31,34,0.92)" : "transparent",
          borderBottom: `1px solid ${scrolled ? BORDER_STRONG : "transparent"}`,
        }}
      >
        <div
          style={{
            maxWidth: 1160,
            margin: "0 auto",
            padding: "0 24px",
            height: 60,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: `linear-gradient(135deg, ${BLURPLE} 0%, ${BLURPLE_DARK} 100%)`,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(88,101,242,0.4)",
              }}
            >
              <span style={{ color: "#FFFFFF", fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>A</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 650, letterSpacing: "-0.025em", color: TEXT }}>Alternus</span>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 40 }} className="hidden md:flex">
            {[
              { label: "Features", href: "#features" },
              { label: "How it works", href: "#how" },
              { label: "Gallery", href: "/gallery" },
              { label: "Pricing", href: "/pricing" },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                style={{
                  fontSize: 14,
                  color: TEXT_MUTED,
                  fontWeight: 500,
                  textDecoration: "none",
                  padding: "0 12px",
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 6,
                  transition: "color 0.15s, background 0.15s",
                }}
                className="hover:bg-white/[0.07] hover:!text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div style={{ flex: 1 }} />

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link
              href="/login"
              style={{
                display: "none",
                alignItems: "center",
                height: 36,
                padding: "0 14px",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                color: TEXT_MUTED,
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
              }}
              className="sm:!inline-flex hover:bg-white/[0.07] hover:!text-white"
            >
              Log in
            </Link>
            <Link
              href="/os"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                height: 36,
                padding: "0 16px",
                background: BLURPLE,
                color: "#FFFFFF",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                textDecoration: "none",
                transition: "background 0.15s",
                boxShadow: "0 2px 8px rgba(88,101,242,0.4)",
              }}
              className="hover:bg-[#4752C4]"
            >
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
            position: "absolute",
            left: "50%",
            top: "-20%",
            transform: "translateX(-50%)",
            width: 900,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(88,101,242,0.18), rgba(88,101,242,0.06) 55%, transparent 74%)",
            filter: "blur(1px)",
          }} />
          <div style={{
            position: "absolute",
            right: -80,
            top: 40,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(235,69,158,0.08), transparent 70%)",
          }} />
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse at 50% 30%, black 25%, transparent 65%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 25%, transparent 65%)",
          }} />
        </div>

        <div style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 900,
          margin: "0 auto",
          padding: "0 24px",
          textAlign: "center",
        }}>
          {/* Status badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            height: 32,
            padding: "0 14px",
            background: SURFACE,
            border: `1px solid ${BORDER_STRONG}`,
            borderRadius: 6,
            marginBottom: 32,
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: GREEN,
              display: "block",
              boxShadow: "0 0 0 2px rgba(35,165,89,0.3)",
            }} />
            <span style={{ fontSize: 12.5, fontWeight: 500, color: TEXT_MUTED }}>Claude Opus 4.6 · Online</span>
          </div>

          <h1 style={{
            fontSize: "clamp(40px, 6.4vw, 70px)",
            lineHeight: 1.04,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            marginBottom: 20,
          }}>
            <span style={{ color: TEXT, display: "block" }}>The operating system</span>
            <span style={{
              display: "block",
              background: `linear-gradient(90deg, ${BLURPLE} 0%, #7289DA 50%, #EB459E 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}>
              that thinks with you.
            </span>
          </h1>

          <p style={{
            fontSize: 17,
            color: TEXT_MUTED,
            maxWidth: 520,
            margin: "0 auto",
            lineHeight: 1.68,
            fontWeight: 400,
            marginBottom: 44,
          }}>
            Alternus is an AI-native desktop. Ask it in plain language — it drafts
            emails, opens apps, finds files, and runs your workflows across a fully
            functional OS in your browser.
          </p>

          <form onSubmit={onSubmit} style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{
              position: "relative",
              background: SURFACE_RAISED,
              border: `1px solid ${BORDER_STRONG}`,
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
            }}>
              <input
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask Alternus anything — try 'draft an email to my team'"
                style={{
                  width: "100%",
                  padding: "18px 20px 10px",
                  fontSize: 14.5,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: TEXT,
                  boxSizing: "border-box",
                }}
                className="placeholder:text-[#4E5058]"
              />
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 10px 10px",
              }}>
                <div style={{ display: "flex", gap: 2, color: TEXT_DIMMER }}>
                  {[
                    { d: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3", title: "Upload" },
                    { d: "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10A15 15 0 0112 2z", title: "Research" },
                    { d: "M16 18l6-6-6-6M8 6l-6 6 6 6", title: "Code" },
                    { d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z", title: "Chat" },
                  ].map((b, i) => (
                    <button
                      key={i}
                      type="button"
                      title={b.title}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        transition: "background 0.15s, color 0.15s",
                        color: "inherit",
                      }}
                      className="hover:bg-white/[0.07] hover:!text-white"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={b.d} />
                      </svg>
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    height: 34,
                    padding: "0 16px",
                    background: BLURPLE,
                    color: "#FFFFFF",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    letterSpacing: "-0.01em",
                    transition: "background 0.15s",
                    boxShadow: "0 2px 8px rgba(88,101,242,0.4)",
                  }}
                  className="hover:bg-[#4752C4]"
                >
                  Try in Chat
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <div style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 8,
              marginTop: 14,
            }}>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => goToChat(s)}
                  style={{
                    fontSize: 12.5,
                    color: TEXT_MUTED,
                    padding: "0 14px",
                    height: 30,
                    borderRadius: 6,
                    border: `1px solid ${BORDER_STRONG}`,
                    background: SURFACE,
                    cursor: "pointer",
                    fontWeight: 450,
                    transition: "all 0.15s",
                  }}
                  className="hover:border-[#5865F2]/60 hover:!text-white hover:bg-[#5865F2]/10"
                >
                  {s}
                </button>
              ))}
            </div>
          </form>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
            marginTop: 44,
            flexWrap: "wrap",
            rowGap: 10,
          }}>
            <span style={{
              fontSize: 10.5,
              color: TEXT_DIMMER,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
              marginRight: 18,
            }}>
              Powered by
            </span>
            {[
              { label: "Claude Opus 4.6" },
              { label: "Next.js 15" },
              { label: "Prisma · PostgreSQL" },
            ].map((item, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && (
                  <span style={{
                    display: "inline-block",
                    width: 1,
                    height: 12,
                    background: BORDER_STRONG,
                    margin: "0 16px",
                  }} />
                )}
                <span style={{ fontSize: 13.5, color: TEXT_MUTED, fontWeight: 600 }}>{item.label}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OS Preview ─── */}
      <section style={{ paddingBottom: 80 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <Link
            href="/os"
            className="group block"
            style={{
              borderRadius: 16,
              overflow: "hidden",
              border: `1px solid ${BORDER_STRONG}`,
              boxShadow: "0 20px 60px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
              display: "block",
              textDecoration: "none",
              transition: "border-color 0.25s, box-shadow 0.25s",
            }}
            className="hover:border-[#5865F2]/50 hover:shadow-[0_24px_80px_rgba(88,101,242,0.18)]"
          >
            {/* Browser chrome */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "0 16px",
              height: 38,
              background: "#111214",
              borderBottom: `1px solid ${BORDER}`,
            }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ED4245" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FEE75C" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#57F287" }} />
              <div style={{
                marginLeft: 16,
                height: 22,
                padding: "0 12px",
                borderRadius: 4,
                background: SURFACE,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={TEXT_DIMMER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <span style={{ fontSize: 11, color: TEXT_DIMMER }}>alternus.art/os</span>
              </div>
              <span
                style={{ marginLeft: "auto", fontSize: 10.5, color: TEXT_DIMMER, transition: "color 0.15s" }}
                className="group-hover:!text-[#5865F2]"
              >
                Click to open →
              </span>
            </div>

            {/* App body */}
            <div style={{ position: "relative", height: 440, background: BG, display: "flex" }} className="md:h-[520px]">

              {/* Server sidebar (Discord style) */}
              <div style={{
                width: 72,
                background: "#111214",
                padding: "12px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${BLURPLE} 0%, #7289DA 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 4,
                  boxShadow: "0 4px 12px rgba(88,101,242,0.4)",
                }}>
                  <span style={{ color: "#FFF", fontSize: 18, fontWeight: 800 }}>A</span>
                </div>
                <div style={{ width: 32, height: 1, background: SURFACE_OVERLAY, borderRadius: 1 }} />
                {[
                  { icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", label: "Mail", active: false },
                  { icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z", label: "Files", active: true },
                  { icon: "M16 18l6-6-6-6M8 6l-6 6 6 6", label: "Code", active: false },
                  { icon: "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z", label: "Docs", active: false },
                ].map((app) => (
                  <div key={app.label} style={{ position: "relative" }}>
                    {app.active && (
                      <div style={{
                        position: "absolute",
                        left: -12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 4,
                        height: 32,
                        background: "white",
                        borderRadius: "0 4px 4px 0",
                      }} />
                    )}
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: app.active ? 16 : 24,
                      background: app.active ? BLURPLE : SURFACE_RAISED,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "border-radius 0.2s, background 0.2s",
                      cursor: "pointer",
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={app.active ? "#fff" : TEXT_DIMMER} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d={app.icon} />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {/* Channel list */}
              <div style={{
                width: 240,
                background: SURFACE,
                borderRight: `1px solid ${BORDER}`,
                display: "flex",
                flexDirection: "column",
                flexShrink: 0,
              }}>
                <div style={{
                  padding: "16px 12px 10px",
                  borderBottom: `1px solid ${BORDER}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Smart Files</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_DIMMER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <div style={{ padding: "8px 8px", flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: TEXT_DIMMER, padding: "4px 8px", marginBottom: 2 }}>
                    Folders
                  </div>
                  {[
                    { name: "Projects", unread: 0 },
                    { name: "Invoices", unread: 2 },
                    { name: "Design Assets", unread: 0 },
                    { name: "Contracts", unread: 0 },
                    { name: "Archive", unread: 0 },
                  ].map((ch) => (
                    <div key={ch.name} style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "5px 8px",
                      borderRadius: 4,
                      cursor: "pointer",
                      background: ch.name === "Invoices" ? SURFACE_OVERLAY : "transparent",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14, color: TEXT_DIMMER }}>#</span>
                        <span style={{ fontSize: 13, color: ch.unread > 0 ? TEXT : TEXT_MUTED, fontWeight: ch.unread > 0 ? 600 : 400 }}>{ch.name}</span>
                      </div>
                      {ch.unread > 0 && (
                        <div style={{
                          minWidth: 18,
                          height: 18,
                          borderRadius: 9,
                          background: BLURPLE,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#FFF",
                          padding: "0 5px",
                        }}>
                          {ch.unread}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* User bar */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  background: "#1E2124",
                  borderTop: `1px solid ${BORDER}`,
                }}>
                  <div style={{ position: "relative" }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${BLURPLE} 0%, #7289DA 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#FFF",
                    }}>A</div>
                    <div style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: GREEN,
                      border: "2px solid #1E2124",
                    }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>You</div>
                    <div style={{ fontSize: 10, color: GREEN }}>● Online</div>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{
                  padding: "0 20px",
                  height: 48,
                  borderBottom: `1px solid ${BORDER}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: SURFACE_RAISED,
                }}>
                  <span style={{ fontSize: 14, color: TEXT_DIMMER }}>#</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Invoices</span>
                  <div style={{ width: 1, height: 16, background: BORDER_STRONG, margin: "0 4px" }} />
                  <span style={{ fontSize: 12, color: TEXT_DIMMER }}>12 files · AI indexed</span>
                </div>

                <div style={{ flex: 1, padding: 20, overflow: "hidden" }}>
                  {/* AI message */}
                  <div style={{
                    display: "flex",
                    gap: 12,
                    padding: "12px 16px",
                    borderRadius: 8,
                    background: BLURPLE_SOFT,
                    border: `1px solid rgba(88,101,242,0.2)`,
                    marginBottom: 16,
                  }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${BLURPLE} 0%, #7289DA 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#FFF",
                    }}>AI</div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: BLURPLE }}>Alternus AI</span>
                        <span style={{ fontSize: 10.5, color: TEXT_DIMMER }}>Today at 10:42</span>
                      </div>
                      <p style={{ fontSize: 12.5, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>
                        Found <strong style={{ color: TEXT }}>2 invoices from last month</strong> — Total: <strong style={{ color: TEXT }}>$4,820</strong>.
                        Stripe receipt for $2,400 and a design contract for $2,420. Want me to export a summary?
                      </p>
                    </div>
                  </div>

                  {/* File cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {[
                      { name: "Invoice_March_2026.pdf", size: "128 KB", color: "#ED4245" },
                      { name: "Design_Contract_Q2.pdf", size: "84 KB", color: BLURPLE },
                      { name: "Stripe_Receipt.pdf", size: "32 KB", color: "#57F287" },
                    ].map((f) => (
                      <div key={f.name} style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        background: SURFACE_RAISED,
                        border: `1px solid ${BORDER}`,
                        cursor: "pointer",
                      }}>
                        <div style={{
                          width: 28,
                          height: 32,
                          borderRadius: 4,
                          background: `${f.color}22`,
                          border: `1px solid ${f.color}44`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 8,
                          fontSize: 8,
                          fontWeight: 800,
                          color: f.color,
                          letterSpacing: "0.05em",
                        }}>PDF</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: TEXT, lineHeight: 1.3, marginBottom: 2 }}>{f.name}</div>
                        <div style={{ fontSize: 10, color: TEXT_DIMMER }}>{f.size}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Input bar */}
                <div style={{ padding: "10px 16px 16px", background: SURFACE_RAISED, borderTop: `1px solid ${BORDER}` }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "0 14px",
                    height: 40,
                    borderRadius: 8,
                    background: SURFACE_OVERLAY,
                  }}>
                    <span style={{ fontSize: 12, color: TEXT_DIMMER }}>Ask AI about these files...</span>
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

      {/* ─── Features ─── */}
      <section
        id="features"
        style={{
          paddingTop: 96,
          paddingBottom: 96,
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ maxWidth: 560, marginBottom: 52 }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              height: 26,
              padding: "0 10px",
              background: BLURPLE_SOFT,
              border: `1px solid rgba(88,101,242,0.3)`,
              borderRadius: 4,
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: BLURPLE }}>
                Built-in capabilities
              </span>
            </div>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
              lineHeight: 1.08,
              color: TEXT,
              marginBottom: 16,
            }}>
              Every app, one intelligence.
            </h2>
            <p style={{ fontSize: 15, color: TEXT_MUTED, lineHeight: 1.65 }}>
              Mail, Files, Code, Voice, Knowledge — they all share the same agent and memory. Delegate anything, across any app.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((f) => (
              <div
                key={f.title}
                style={{
                  padding: 24,
                  borderRadius: 12,
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  transition: "border-color 0.2s, transform 0.2s, background 0.2s",
                }}
                className="hover:border-[#5865F2]/40 hover:-translate-y-[2px] hover:bg-[#313338]"
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${f.color}18`,
                  border: `1px solid ${f.color}35`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={f.color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d={f.icon} />
                  </svg>
                </div>
                <h3 style={{
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "-0.015em",
                  color: TEXT,
                  marginBottom: 8,
                }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 13.5, color: TEXT_MUTED, lineHeight: 1.62 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section
        id="how"
        style={{
          paddingTop: 96,
          paddingBottom: 96,
          borderTop: `1px solid ${BORDER}`,
          background: SURFACE,
        }}
      >
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ maxWidth: 560, marginBottom: 52 }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              height: 26,
              padding: "0 10px",
              background: BLURPLE_SOFT,
              border: `1px solid rgba(88,101,242,0.3)`,
              borderRadius: 4,
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: BLURPLE }}>
                How it works
              </span>
            </div>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
              lineHeight: 1.08,
              color: TEXT,
            }}>
              Three steps to a smarter desktop.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { n: "01", t: "Describe what you want", d: "Type or speak a goal. The agent plans and confirms before taking action." },
              { n: "02", t: "Agent runs your apps", d: "It opens Mail, Files, Code, Calendar — whatever's needed — and runs the steps." },
              { n: "03", t: "You review & ship", d: "Every change is visible in-app. Approve, tweak, or redo with one command." },
            ].map((s) => (
              <div
                key={s.n}
                style={{
                  position: "relative",
                  padding: 28,
                  borderRadius: 12,
                  background: SURFACE_RAISED,
                  border: `1px solid ${BORDER}`,
                  overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, ${BLURPLE} 0%, transparent 100%)`,
                }} />
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: BLURPLE_SOFT,
                  border: `1px solid rgba(88,101,242,0.25)`,
                  marginBottom: 16,
                }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    fontFamily: "var(--font-geist-mono), monospace",
                    color: BLURPLE,
                  }}>
                    {s.n}
                  </span>
                </div>
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginBottom: 10,
                  color: TEXT,
                  lineHeight: 1.3,
                }}>
                  {s.t}
                </h3>
                <p style={{ fontSize: 13.5, color: TEXT_MUTED, lineHeight: 1.64 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{
        position: "relative",
        paddingTop: 112,
        paddingBottom: 112,
        borderTop: `1px solid ${BORDER}`,
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(88,101,242,0.14), transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <h2 style={{
            fontSize: "clamp(36px, 5.5vw, 60px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.04,
            marginBottom: 20,
            color: TEXT,
          }}>
            Stop clicking.
            <br />
            <span style={{
              background: `linear-gradient(90deg, ${BLURPLE} 0%, #7289DA 50%, #EB459E 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}>
              Start asking.
            </span>
          </h2>
          <p style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 1.68, maxWidth: 460, margin: "0 auto", marginBottom: 44 }}>
            Alternus is free to try. Launch the chat and explore a complete AI-native OS in your browser.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/os"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 48,
                padding: "0 28px",
                background: BLURPLE,
                color: "#FFFFFF",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: "-0.015em",
                textDecoration: "none",
                transition: "background 0.15s",
                boxShadow: "0 8px 24px rgba(88,101,242,0.4)",
              }}
              className="hover:bg-[#4752C4]"
            >
              Try in Chat
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/gallery"
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 48,
                padding: "0 24px",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                color: TEXT_MUTED,
                border: `1px solid ${BORDER_STRONG}`,
                background: SURFACE,
                textDecoration: "none",
                transition: "all 0.15s",
              }}
              className="hover:border-[#5865F2]/60 hover:!text-white hover:bg-[#5865F2]/10"
            >
              Browse Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: "32px 0", background: "#111214" }}>
        <div style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "16px 32px",
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${BLURPLE} 0%, ${BLURPLE_DARK} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 3px 8px rgba(88,101,242,0.35)",
            }}>
              <span style={{ color: "#FFFFFF", fontSize: 13, fontWeight: 700 }}>A</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", color: TEXT }}>Alternus</span>
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
              <Link
                key={label}
                href={href}
                style={{
                  fontSize: 13,
                  color: TEXT_DIMMER,
                  textDecoration: "none",
                  padding: "4px 10px",
                  borderRadius: 4,
                  transition: "color 0.15s, background 0.15s",
                }}
                className="hover:!text-white hover:bg-white/[0.07]"
              >
                {label}
              </Link>
            ))}
          </nav>
          <span style={{ fontSize: 12, color: TEXT_DIMMER, marginLeft: "auto" }}>
            © {new Date().getFullYear()} Alternus Art Gallery
          </span>
        </div>
      </footer>
    </div>
  );
}
