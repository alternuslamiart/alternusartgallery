"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    title: "AI Agent",
    desc: "A native agent that reads files, drafts emails, opens apps, and runs commands on its own OS.",
    icon: "M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.936A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.963 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.582a.5.5 0 010 .963L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.963 0z",
  },
  {
    title: "Native Mail",
    desc: "A minimalist inbox with compose, threading, labels, and inline reply — all controllable by the agent.",
    icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  },
  {
    title: "Smart Files",
    desc: "Semantic search, drag-and-drop, and an AI assistant that understands your folder structure.",
    icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
  },
  {
    title: "Voice Mode",
    desc: "Talk to the OS naturally. Dictate, transcribe, run workflows, or have a conversation.",
    icon: "M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3zM19 10v1a7 7 0 01-14 0v-1M12 19v4",
  },
  {
    title: "Code Studio",
    desc: "A full VS Code–style editor with an integrated AI pair-programmer on top of your project.",
    icon: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  },
  {
    title: "Knowledge Base",
    desc: "Build a private, indexed knowledge layer. The agent cites your docs when it answers.",
    icon: "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
  },
];

const suggestions = [
  "Draft an email to my team about the Q2 launch",
  "Find last month's invoices in Files",
  "Open the Code editor with a new React project",
  "Summarize today's unread mail",
];

const BG = "#F6F5F2";
const BLACK = "#0D0C0A";
const GRAY = "#6A6762";
const MUTED = "#9D9A96";
const DIM = "#C0BCB7";
const CARD = "#FFFFFF";
const BORDER = "rgba(0,0,0,0.06)";

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
        color: BLACK,
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
          background: scrolled ? "rgba(246,245,242,0.88)" : "transparent",
          borderBottom: `1px solid ${scrolled ? BORDER : "transparent"}`,
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
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div
              style={{
                width: 30,
                height: 30,
                background: BLACK,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: BG, fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em" }}>A</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 650, letterSpacing: "-0.025em", color: BLACK }}>
              Alternus
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 32, marginLeft: 40 }} className="hidden md:flex">
            {[
              { label: "Features", href: "#features" },
              { label: "How it works", href: "#how" },
              { label: "Gallery", href: "/gallery" },
              { label: "Pricing", href: "/pricing" },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                style={{ fontSize: 14, color: GRAY, fontWeight: 500, textDecoration: "none", transition: "color 0.15s" }}
                className="hover:text-[#0D0C0A]"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div style={{ flex: 1 }} />

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Link
              href="/login"
              style={{
                display: "none",
                alignItems: "center",
                height: 36,
                padding: "0 12px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                color: GRAY,
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
              }}
              className="sm:!inline-flex hover:bg-black/[0.04] hover:text-[#0D0C0A]"
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
                background: BLACK,
                color: BG,
                borderRadius: 9,
                fontSize: 13.5,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                textDecoration: "none",
                transition: "opacity 0.15s",
              }}
              className="hover:opacity-90"
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
        {/* Soft ambient gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "-30%",
              transform: "translateX(-50%)",
              width: 960,
              height: 760,
              borderRadius: "50%",
              background:
                "radial-gradient(closest-side, rgba(110,90,200,0.065), rgba(110,90,200,0.025) 55%, transparent 74%)",
              filter: "blur(2px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: -80,
              top: 40,
              width: 520,
              height: 520,
              borderRadius: "50%",
              background:
                "radial-gradient(closest-side, rgba(50,130,220,0.055), transparent 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -60,
              bottom: 0,
              width: 420,
              height: 420,
              borderRadius: "50%",
              background:
                "radial-gradient(closest-side, rgba(200,170,90,0.04), transparent 70%)",
            }}
          />
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1000,
            margin: "0 auto",
            padding: "0 24px",
            textAlign: "center",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              height: 30,
              padding: "0 14px",
              background: "rgba(255,255,255,0.72)",
              border: `1px solid ${BORDER}`,
              borderRadius: 30,
              marginBottom: 32,
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22C55E",
                display: "block",
                boxShadow: "0 0 0 2px rgba(34,197,94,0.2)",
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 500, color: GRAY, letterSpacing: "0.01em" }}>
              Claude Opus 4.6 · Live
            </span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: "clamp(44px, 6.8vw, 74px)",
              lineHeight: 1.02,
              fontWeight: 720,
              letterSpacing: "-0.04em",
              marginBottom: 22,
            }}
          >
            <span style={{ color: BLACK, display: "block" }}>The operating system</span>
            <span style={{ color: DIM, display: "block" }}>that thinks with you.</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 17,
              color: GRAY,
              maxWidth: 560,
              margin: "0 auto",
              lineHeight: 1.68,
              fontWeight: 400,
              marginBottom: 44,
            }}
          >
            Alternus is an AI-native desktop. Ask it in plain language — it drafts
            emails, opens apps, finds files, and runs your workflows across a fully
            functional OS in your browser.
          </p>

          {/* Input */}
          <form onSubmit={onSubmit} style={{ maxWidth: 660, margin: "0 auto" }}>
            <div
              style={{
                background: CARD,
                border: `1px solid rgba(0,0,0,0.07)`,
                borderRadius: 18,
                boxShadow:
                  "0 6px 28px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
                overflow: "hidden",
              }}
            >
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
                  color: BLACK,
                  boxSizing: "border-box",
                }}
                className="placeholder:text-[#C0BCB7]"
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 10px 10px",
                }}
              >
                <div style={{ display: "flex", gap: 2, color: DIM }}>
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
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        transition: "background 0.15s, color 0.15s",
                        color: "inherit",
                      }}
                      className="hover:bg-black/[0.04] hover:!text-[#6A6762]"
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
                    height: 36,
                    padding: "0 18px",
                    background: BLACK,
                    color: BG,
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    letterSpacing: "-0.01em",
                    transition: "opacity 0.15s",
                  }}
                  className="hover:opacity-90"
                >
                  Try in Chat
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chips */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 8,
                marginTop: 14,
              }}
            >
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => goToChat(s)}
                  style={{
                    fontSize: 12.5,
                    color: GRAY,
                    padding: "0 14px",
                    height: 32,
                    borderRadius: 30,
                    border: `1px solid rgba(0,0,0,0.08)`,
                    background: "rgba(255,255,255,0.55)",
                    cursor: "pointer",
                    backdropFilter: "blur(4px)",
                    fontWeight: 450,
                    transition: "all 0.15s",
                  }}
                  className="hover:border-black/[0.18] hover:text-[#0D0C0A] hover:bg-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </form>

          {/* Trust line */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0,
              marginTop: 44,
              flexWrap: "wrap",
              rowGap: 10,
            }}
          >
            <span
              style={{
                fontSize: 10.5,
                color: MUTED,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 600,
                marginRight: 18,
              }}
            >
              Powered by
            </span>
            {[
              { label: "Claude Opus 4.6" },
              { label: "Next.js 15" },
              { label: "Prisma · PostgreSQL" },
            ].map((item, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 1,
                      height: 12,
                      background: "rgba(0,0,0,0.12)",
                      margin: "0 16px",
                    }}
                  />
                )}
                <span style={{ fontSize: 13.5, color: "#3D3B38", fontWeight: 650 }}>
                  {item.label}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OS Preview ─── */}
      <section style={{ paddingBottom: 88 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <Link
            href="/os"
            className="group block"
            style={{
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid ${BORDER}`,
              boxShadow:
                "0 24px 80px -16px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.04)",
              display: "block",
              textDecoration: "none",
              transition: "box-shadow 0.25s",
            }}
          >
            {/* Browser chrome */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "0 16px",
                height: 38,
                background: "#EEECEA",
                borderBottom: `1px solid rgba(0,0,0,0.05)`,
              }}
            >
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF6058" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FFBD2E" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28C840" }} />
              <span style={{ marginLeft: 12, fontSize: 11, color: MUTED }}>alternus.art/os</span>
              <span
                style={{ marginLeft: "auto", fontSize: 10.5, color: DIM, transition: "color 0.15s" }}
                className="group-hover:text-[#6A6762]"
              >
                Click to open →
              </span>
            </div>

            {/* Mockup body */}
            <div
              style={{
                position: "relative",
                height: 420,
                background: "linear-gradient(180deg, #F2F1EE 0%, #EAEAE6 100%)",
              }}
              className="md:h-[520px]"
            >
              <div
                style={{
                  position: "absolute",
                  inset: 20,
                  borderRadius: 12,
                  background: CARD,
                  border: `1px solid rgba(0,0,0,0.06)`,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  display: "flex",
                  overflow: "hidden",
                }}
              >
                {/* Sidebar */}
                <div
                  style={{
                    width: 200,
                    background: "#F9F8F5",
                    borderRight: `1px solid rgba(0,0,0,0.05)`,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div style={{ height: 22, width: 110, background: "#E8E6E1", borderRadius: 4 }} />
                  <div style={{ height: 11, width: 76, background: "#EDEBE6", borderRadius: 4, marginTop: 14, marginBottom: 4 }} />
                  {["Inbox", "Starred", "Sent", "Drafts", "Archive"].map((f) => (
                    <div key={f} style={{ display: "flex", justifyContent: "space-between", padding: "4px 6px", borderRadius: 6, background: f === "Inbox" ? "rgba(0,0,0,0.04)" : "transparent" }}>
                      <span style={{ fontSize: 11, color: f === "Inbox" ? BLACK : MUTED, fontWeight: f === "Inbox" ? 500 : 400 }}>{f}</span>
                      {f === "Inbox" && <span style={{ fontSize: 10, color: MUTED, fontWeight: 600 }}>2</span>}
                    </div>
                  ))}
                </div>

                {/* Email list */}
                <div style={{ width: 280, borderRight: `1px solid rgba(0,0,0,0.05)`, overflow: "hidden" }}>
                  <div
                    style={{
                      padding: "0 20px",
                      height: 52,
                      borderBottom: `1px solid rgba(0,0,0,0.05)`,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 650, color: BLACK }}>Inbox</span>
                    <span style={{ fontSize: 10, color: MUTED }}>8 messages · 2 unread</span>
                  </div>
                  {[
                    { f: "Sophia Martinez", s: "Q2 Gallery exhibition proposal", u: true },
                    { f: "David Chen", s: "Press feature — interview request", u: true },
                    { f: "Stripe", s: "Receipt from Alternus — $2,400", u: false },
                    { f: "Elena Voss", s: "Re: Commission update", u: false },
                  ].map((e, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "10px 20px",
                        borderBottom: `1px solid rgba(0,0,0,0.04)`,
                        opacity: e.u ? 1 : 0.6,
                        background: i === 0 ? "rgba(0,0,0,0.015)" : "transparent",
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: e.u ? 650 : 500, color: BLACK }}>{e.f}</div>
                      <div style={{ fontSize: 11.5, color: GRAY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.s}</div>
                    </div>
                  ))}
                </div>

                {/* Email detail */}
                <div style={{ flex: 1, padding: 28 }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: MUTED, marginBottom: 10 }}>
                    Work · Today · 10:42
                  </div>
                  <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.3, color: BLACK }}>
                    Q2 Gallery exhibition — ready for review
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 18,
                      paddingBottom: 16,
                      borderBottom: `1px solid rgba(0,0,0,0.06)`,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "#EDEAE5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 650,
                        color: GRAY,
                      }}
                    >
                      SM
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 650, color: BLACK }}>Sophia Martinez</div>
                      <div style={{ fontSize: 10.5, color: MUTED }}>sophia@alternus.art · to me</div>
                    </div>
                  </div>
                  <p style={{ marginTop: 18, fontSize: 12.5, lineHeight: 1.72, color: "#3D3B38" }}>
                    I've attached the finalized proposal for the Q2 exhibition featuring emerging digital artists. The curator meeting is scheduled for next Tuesday at 2:00 PM.
                  </p>
                  <p style={{ marginTop: 10, fontSize: 12.5, lineHeight: 1.72, color: "#3D3B38" }}>
                    Please review the attached deck and let me know if you have any questions.
                  </p>
                  <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                    <button
                      style={{
                        height: 32, padding: "0 16px", borderRadius: 8,
                        background: BLACK, color: BG,
                        fontSize: 11.5, fontWeight: 600, border: "none", cursor: "pointer",
                      }}
                    >
                      Reply
                    </button>
                    <button
                      style={{
                        height: 32, padding: "0 14px", borderRadius: 8,
                        border: `1px solid rgba(0,0,0,0.08)`,
                        fontSize: 11.5, fontWeight: 500, color: GRAY,
                        background: "transparent", cursor: "pointer",
                      }}
                    >
                      Forward
                    </button>
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
          borderTop: `1px solid rgba(0,0,0,0.05)`,
        }}
      >
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ maxWidth: 560, marginBottom: 52 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: MUTED,
                marginBottom: 14,
              }}
            >
              Built-in capabilities
            </p>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 720,
                letterSpacing: "-0.035em",
                lineHeight: 1.08,
                color: BLACK,
                marginBottom: 16,
              }}
            >
              Every app, one intelligence.
            </h2>
            <p style={{ fontSize: 15, color: GRAY, lineHeight: 1.65 }}>
              Mail, Files, Code, Voice, Knowledge — they all share the same agent and memory. Delegate anything, across any app.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                style={{
                  padding: 26,
                  borderRadius: 14,
                  background: CARD,
                  border: `1px solid rgba(0,0,0,0.055)`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03), 0 0 0 0.5px rgba(0,0,0,0.03)",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
                className="hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-[1px]"
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "#F2F1EE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 18,
                  }}
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4A4845"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={f.icon} />
                  </svg>
                </div>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 650,
                    letterSpacing: "-0.015em",
                    color: BLACK,
                    marginBottom: 8,
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: 13.5, color: GRAY, lineHeight: 1.62 }}>{f.desc}</p>
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
          borderTop: `1px solid rgba(0,0,0,0.05)`,
          background: "rgba(255,255,255,0.42)",
        }}
      >
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ maxWidth: 560, marginBottom: 52 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: MUTED,
                marginBottom: 14,
              }}
            >
              How it works
            </p>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 720,
                letterSpacing: "-0.035em",
                lineHeight: 1.08,
                color: BLACK,
              }}
            >
              Three steps to a smarter desktop.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { n: "01", t: "Describe what you want", d: "Type or speak a goal. The agent plans and confirms before taking action." },
              { n: "02", t: "Agent runs your apps", d: "It opens Mail, Files, Code, Calendar — whatever's needed — and runs the steps." },
              { n: "03", t: "You review & ship", d: "Every change is visible in-app. Approve, tweak, or redo with one command." },
            ].map((s) => (
              <div
                key={s.n}
                style={{
                  padding: 30,
                  borderRadius: 14,
                  background: CARD,
                  border: `1px solid rgba(0,0,0,0.055)`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "var(--font-geist-mono), monospace",
                    color: DIM,
                    letterSpacing: "0.06em",
                  }}
                >
                  {s.n}
                </span>
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 650,
                    letterSpacing: "-0.025em",
                    marginTop: 16,
                    marginBottom: 10,
                    color: BLACK,
                    lineHeight: 1.3,
                  }}
                >
                  {s.t}
                </h3>
                <p style={{ fontSize: 14, color: GRAY, lineHeight: 1.64 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section
        style={{
          paddingTop: 112,
          paddingBottom: 112,
          borderTop: `1px solid rgba(0,0,0,0.05)`,
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "clamp(36px, 5.5vw, 62px)",
              fontWeight: 720,
              letterSpacing: "-0.04em",
              lineHeight: 1.04,
              marginBottom: 20,
              color: BLACK,
            }}
          >
            Stop clicking.
            <br />
            <span style={{ color: DIM }}>Start asking.</span>
          </h2>
          <p style={{ fontSize: 16, color: GRAY, lineHeight: 1.68, maxWidth: 460, margin: "0 auto", marginBottom: 44 }}>
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
                padding: "0 26px",
                background: BLACK,
                color: BG,
                borderRadius: 12,
                fontSize: 14.5,
                fontWeight: 650,
                letterSpacing: "-0.015em",
                textDecoration: "none",
                transition: "opacity 0.15s",
              }}
              className="hover:opacity-90"
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
                padding: "0 22px",
                borderRadius: 12,
                fontSize: 14.5,
                fontWeight: 500,
                color: GRAY,
                border: `1px solid rgba(0,0,0,0.1)`,
                background: "transparent",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
              className="hover:border-black/[0.22] hover:text-[#0D0C0A]"
            >
              Browse Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: `1px solid rgba(0,0,0,0.06)`, padding: "36px 0" }}>
        <div
          style={{
            maxWidth: 1160,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "16px 32px",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 7,
                background: BLACK,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: BG, fontSize: 12, fontWeight: 700, letterSpacing: "-0.02em" }}>A</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 650, letterSpacing: "-0.02em", color: BLACK }}>Alternus</span>
          </Link>
          <nav style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px" }}>
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
                style={{ fontSize: 13, color: MUTED, textDecoration: "none", transition: "color 0.15s" }}
                className="hover:text-[#0D0C0A]"
              >
                {label}
              </Link>
            ))}
          </nav>
          <span style={{ fontSize: 12, color: DIM, marginLeft: "auto" }}>
            © {new Date().getFullYear()} Alternus Art Gallery
          </span>
        </div>
      </footer>
    </div>
  );
}
