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
const BRAND = "#3272EA";
const BRAND_DARK = "#1E5BD1";
const BRAND_SOFT = "rgba(50,114,234,0.08)";
const BRAND_RING = "rgba(50,114,234,0.28)";

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
                background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(50,114,234,0.28), inset 0 1px 0 rgba(255,255,255,0.22)",
              }}
            >
              <span style={{ color: "#FFFFFF", fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em" }}>A</span>
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
                background: `linear-gradient(180deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
                color: "#FFFFFF",
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                textDecoration: "none",
                transition: "transform 0.15s, box-shadow 0.2s, filter 0.15s",
                boxShadow:
                  "0 6px 16px rgba(50,114,234,0.32), 0 1px 2px rgba(50,114,234,0.22), inset 0 1px 0 rgba(255,255,255,0.22)",
              }}
              className="hover:brightness-[1.06] hover:-translate-y-[1px]"
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
              top: "-28%",
              transform: "translateX(-50%)",
              width: 1040,
              height: 800,
              borderRadius: "50%",
              background:
                "radial-gradient(closest-side, rgba(50,114,234,0.13), rgba(50,114,234,0.05) 55%, transparent 74%)",
              filter: "blur(2px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: -100,
              top: 20,
              width: 540,
              height: 540,
              borderRadius: "50%",
              background:
                "radial-gradient(closest-side, rgba(110,140,255,0.09), transparent 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -80,
              bottom: -60,
              width: 460,
              height: 460,
              borderRadius: "50%",
              background:
                "radial-gradient(closest-side, rgba(50,114,234,0.07), transparent 70%)",
            }}
          />
          {/* Subtle grid */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(13,12,10,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(13,12,10,0.035) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage:
                "radial-gradient(ellipse at 50% 30%, black 30%, transparent 72%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at 50% 30%, black 30%, transparent 72%)",
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
              gap: 8,
              height: 30,
              padding: "0 14px",
              background: "rgba(255,255,255,0.78)",
              border: `1px solid ${BORDER}`,
              borderRadius: 30,
              marginBottom: 32,
              backdropFilter: "blur(8px)",
              boxShadow: "0 1px 2px rgba(13,12,10,0.04)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: BRAND,
                display: "block",
                boxShadow: `0 0 0 3px ${BRAND_RING}`,
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
            <span
              style={{
                display: "block",
                background: `linear-gradient(90deg, ${BRAND} 0%, #6E92F5 60%, #9AB6FF 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              that thinks with you.
            </span>
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
                position: "relative",
                background: CARD,
                border: `1px solid rgba(0,0,0,0.07)`,
                borderRadius: 18,
                boxShadow:
                  "0 10px 40px rgba(50,114,234,0.10), 0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
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
                      className="hover:bg-[#3272EA]/[0.08] hover:!text-[#3272EA]"
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
                    background: `linear-gradient(180deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
                    color: "#FFFFFF",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    letterSpacing: "-0.01em",
                    transition: "transform 0.15s, filter 0.15s",
                    boxShadow:
                      "0 6px 14px rgba(50,114,234,0.34), 0 1px 2px rgba(50,114,234,0.22), inset 0 1px 0 rgba(255,255,255,0.22)",
                  }}
                  className="hover:brightness-[1.06] hover:-translate-y-[1px]"
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
                  className="hover:border-[#3272EA]/40 hover:text-[#3272EA] hover:bg-white"
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
                "0 30px 80px -18px rgba(50,114,234,0.22), 0 2px 8px rgba(0,0,0,0.04)",
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
                className="group-hover:text-[#3272EA]"
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
                    <div key={f} style={{ display: "flex", justifyContent: "space-between", padding: "4px 6px", borderRadius: 6, background: f === "Inbox" ? BRAND_SOFT : "transparent" }}>
                      <span style={{ fontSize: 11, color: f === "Inbox" ? BRAND : MUTED, fontWeight: f === "Inbox" ? 600 : 400 }}>{f}</span>
                      {f === "Inbox" && <span style={{ fontSize: 10, color: BRAND, fontWeight: 700 }}>2</span>}
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
                        background: i === 0 ? BRAND_SOFT : "transparent",
                        borderLeft: i === 0 ? `2px solid ${BRAND}` : "2px solid transparent",
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
                        background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#FFFFFF",
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
                        background: `linear-gradient(180deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
                        color: "#FFFFFF",
                        fontSize: 11.5, fontWeight: 600, border: "none", cursor: "pointer",
                        boxShadow: "0 4px 10px rgba(50,114,234,0.3), inset 0 1px 0 rgba(255,255,255,0.22)",
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
                color: BRAND,
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
                  transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
                }}
                className="hover:shadow-[0_10px_30px_rgba(50,114,234,0.14)] hover:-translate-y-[2px] hover:border-[#3272EA]/25"
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 11,
                    background: `linear-gradient(135deg, ${BRAND_SOFT} 0%, rgba(50,114,234,0.14) 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 18,
                    border: `1px solid rgba(50,114,234,0.14)`,
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={BRAND}
                    strokeWidth="1.9"
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
                color: BRAND,
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
                  position: "relative",
                  padding: 30,
                  borderRadius: 14,
                  background: CARD,
                  border: `1px solid rgba(0,0,0,0.055)`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 48,
                    height: 3,
                    background: `linear-gradient(90deg, ${BRAND} 0%, transparent 100%)`,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "var(--font-geist-mono), monospace",
                    color: BRAND,
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
          position: "relative",
          paddingTop: 112,
          paddingBottom: 112,
          borderTop: `1px solid rgba(0,0,0,0.05)`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 900,
            height: 540,
            borderRadius: "50%",
            background:
              "radial-gradient(closest-side, rgba(50,114,234,0.10), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
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
            <span
              style={{
                background: `linear-gradient(90deg, ${BRAND} 0%, #6E92F5 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              Start asking.
            </span>
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
                height: 50,
                padding: "0 28px",
                background: `linear-gradient(180deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
                color: "#FFFFFF",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 650,
                letterSpacing: "-0.015em",
                textDecoration: "none",
                transition: "transform 0.15s, filter 0.15s",
                boxShadow:
                  "0 12px 28px rgba(50,114,234,0.38), 0 2px 4px rgba(50,114,234,0.22), inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
              className="hover:brightness-[1.06] hover:-translate-y-[1px]"
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
                height: 50,
                padding: "0 24px",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 550,
                color: BRAND,
                border: `1px solid ${BRAND_RING}`,
                background: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                transition: "all 0.15s",
                backdropFilter: "blur(6px)",
              }}
              className="hover:border-[#3272EA] hover:bg-white"
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
                background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 8px rgba(50,114,234,0.25)",
              }}
            >
              <span style={{ color: "#FFFFFF", fontSize: 12, fontWeight: 700, letterSpacing: "-0.02em" }}>A</span>
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
                className="hover:text-[#3272EA]"
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
