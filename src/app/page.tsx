"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/* ═══ Brand ═══ */
const COBALT = "#4284FF";
const COBALT_DEEP = "#1E5ED4";
const COBALT_LIGHT = "#7DA9FF";
const INK = "#05080F";
const PAPER = "#F4F6FB";
const GREEN = "#2EC272";

/* ═══ Content ═══ */
const marquee = [
  "Claude Opus 4.6",
  "Native agent",
  "File system",
  "Voice mode",
  "Code studio",
  "Mail intelligence",
  "Knowledge base",
  "Task runner",
];

const capabilities = [
  { n: "01", t: "Agent", d: "A resident model that reads your files, drafts messages, opens apps and runs multi-step jobs.", k: "agent.run(goal)" },
  { n: "02", t: "Mail", d: "Threaded inbox with compose, labels, filters — every action can be delegated to the agent.", k: "mail.draft(thread)" },
  { n: "03", t: "Files", d: "Semantic search across a native FS. The assistant understands folders by meaning, not names.", k: "fs.find('invoices q1')" },
  { n: "04", t: "Voice", d: "Speak naturally. Dictate, transcribe, or run full workflows hands-free.", k: "voice.listen()" },
  { n: "05", t: "Code", d: "A VS Code-class editor with an AI pair-programmer that has read your whole project.", k: "code.open(repo)" },
  { n: "06", t: "Knowledge", d: "Private indexed layer. The agent cites your docs inline when it answers.", k: "kb.cite(query)" },
];

const pillars = [
  { k: "Fast", v: "Sub-200ms agent turn-around on warm context." },
  { k: "Private", v: "Your data never leaves the encrypted knowledge layer." },
  { k: "Native", v: "Works in any browser. No install, no sync, no friction." },
  { k: "Open", v: "Scriptable, automatable, embeddable into your own tools." },
];

const quotes = [
  { by: "Marcus Johnson", role: "Product Designer, Remote", q: "The line between asking and doing just disappeared. I describe the outcome, it does the work." },
  { by: "Priya Sharma", role: "Staff Engineer, Berlin", q: "Code Studio reads my whole repo before it suggests anything. It's the first AI tool I haven't turned off." },
  { by: "David Chen", role: "Founder, SF", q: "I replaced four tools with one window. Mail, files, docs, code — one agent, one memory." },
];

const faq = [
  { q: "What exactly is Alternus?", a: "A browser-native OS powered by Claude Opus 4.6 — mail, files, voice, code and a research agent that shares one memory layer." },
  { q: "Do I need to install anything?", a: "No. It runs in any modern browser. Log in, and your workspace is there." },
  { q: "Where is my data stored?", a: "In your private knowledge layer, encrypted at rest. The agent cites it but never trains on it." },
  { q: "Can the agent act on my behalf?", a: "Yes — it can draft, send, organize and open apps within the OS. High-risk actions always require confirmation." },
];

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeCap, setActiveCap] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setActiveCap((c) => (c + 1) % capabilities.length), 3200);
    return () => clearInterval(id);
  }, []);

  const goToChat = (q?: string) => {
    const t = (q ?? prompt).trim();
    router.push(t ? `/os?prompt=${encodeURIComponent(t)}` : "/os");
  };

  const bg = isDark ? INK : PAPER;
  const fg = isDark ? "#FFFFFF" : INK;
  const muted = isDark ? "rgba(255,255,255,0.6)" : "rgba(5,8,15,0.62)";
  const faint = isDark ? "rgba(255,255,255,0.1)" : "rgba(5,8,15,0.1)";
  const surface = isDark ? "rgba(255,255,255,0.04)" : "rgba(5,8,15,0.035)";
  const raised = isDark ? "#0C1220" : "#FFFFFF";

  return (
    <div style={{ minHeight: "100vh", background: bg, color: fg, fontFamily: "var(--font-roboto-flex),-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif", transition: "background 0.3s,color 0.3s", overflowX: "hidden" }}>

      <style>{`
        @keyframes marq { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(.92)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes gridShift { from{background-position:0 0} to{background-position:60px 60px} }
        @keyframes rise { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .marquee-track{animation:marq 32s linear infinite}
        .pulse-dot{animation:pulse 2s ease-in-out infinite}
        .caret::after{content:'▌';color:${COBALT};animation:blink 1.1s step-end infinite;margin-left:2px}
        .grid-bg{animation:gridShift 30s linear infinite}
        .rise{animation:rise .6s ease-out both}
      `}</style>

      {/* ═══ Nav ═══ */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, width: "100%", transition: "all 0.25s", backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none", WebkitBackdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none", background: scrolled ? (isDark ? "rgba(5,8,15,0.78)" : "rgba(244,246,251,0.82)") : "transparent", borderBottom: `1px solid ${scrolled ? faint : "transparent"}` }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px", height: 64, display: "flex", alignItems: "center", gap: 32 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, background: COBALT, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <div style={{ position: "absolute", inset: 4, border: `2px solid ${INK}`, borderRight: 0, borderBottom: 0 }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", color: fg, fontStretch: "90%" }}>ALTERNUS</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: muted, padding: "2px 6px", border: `1px solid ${faint}`, borderRadius: 3, letterSpacing: "0.08em" }}>BETA</span>
          </Link>

          <nav className="hidden md:flex" style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {[{ l: "Capabilities", h: "#caps" }, { l: "Manifesto", h: "#manifesto" }, { l: "Voices", h: "#voices" }, { l: "FAQ", h: "#faq" }].map((i) => (
              <Link key={i.l} href={i.h} style={{ fontSize: 13, color: muted, fontWeight: 500, textDecoration: "none", letterSpacing: "-0.01em" }}>{i.l}</Link>
            ))}
          </nav>

          <div style={{ flex: 1 }} />
          <button onClick={() => setIsDark(!isDark)} style={{ width: 34, height: 34, border: `1px solid ${faint}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: muted, borderRadius: 8 }}>
            {isDark
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            }
          </button>
          <Link href="/os" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 36, padding: "0 18px", background: COBALT, color: "#FFF", fontSize: 13, fontWeight: 700, textDecoration: "none", letterSpacing: "-0.01em", boxShadow: `0 0 0 0 ${COBALT}`, transition: "box-shadow 0.2s", borderRadius: 8 }} className="hover:shadow-[0_0_0_4px_rgba(66,132,255,0.25)]">
            Launch OS
            <span style={{ fontSize: 10, opacity: 0.8 }}>↗</span>
          </Link>
        </div>
      </header>

      {/* ═══ Hero — editorial split ═══ */}
      <section style={{ position: "relative", paddingTop: 40, paddingBottom: 40, borderBottom: `1px solid ${faint}`, overflow: "hidden" }}>
        {/* Blueprint grid background */}
        <div className="grid-bg" style={{ position: "absolute", inset: 0, backgroundImage: isDark
          ? `linear-gradient(${faint} 1px,transparent 1px),linear-gradient(90deg,${faint} 1px,transparent 1px)`
          : `linear-gradient(rgba(66,132,255,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(66,132,255,0.07) 1px,transparent 1px)`,
          backgroundSize: "60px 60px", maskImage: "radial-gradient(ellipse at 70% 30%,black 30%,transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse at 70% 30%,black 30%,transparent 75%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "-20%", top: "-10%", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(closest-side,${COBALT}40,transparent 70%)`, filter: "blur(30px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" style={{ paddingTop: 60, paddingBottom: 60 }}>
            {/* L: oversized type */}
            <div className="lg:col-span-7">
              <div style={{ fontSize: 11, letterSpacing: "0.24em", color: COBALT, fontWeight: 700, marginBottom: 28 }}>
                ALTERNUS · BROWSER OS · v0.9
              </div>
              <h1 style={{ fontSize: "clamp(52px,8vw,120px)", lineHeight: 0.88, letterSpacing: "-0.045em", fontWeight: 900, margin: 0, fontStretch: "85%" }}>
                <span style={{ display: "block", color: fg }}>Describe</span>
                <span style={{ display: "block", color: fg }}>the outcome.</span>
                <span style={{ display: "block", color: COBALT, fontStyle: "italic", fontWeight: 900 }}>Alternus ships it.</span>
              </h1>
              <div style={{ height: 1, background: faint, margin: "40px 0 32px", maxWidth: 520 }} />
              <p style={{ fontSize: 18, color: muted, lineHeight: 1.55, maxWidth: 520, fontWeight: 400 }}>
                Ask Alternus in plain language — it writes mail, opens apps, finds files, ships code, and runs your day across a full browser desktop.
              </p>

              {/* CLI-style input */}
              <form onSubmit={(e) => { e.preventDefault(); goToChat(); }} style={{ marginTop: 36, maxWidth: 640 }}>
                <div style={{ position: "relative", background: raised, border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : faint}`, padding: 0, boxShadow: `8px 8px 0 0 ${COBALT}`, borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", height: 28, padding: "0 12px", borderBottom: `1px solid ${faint}`, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(5,8,15,0.02)", gap: 6 }}>
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#FF5F57" }} />
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#FEBC2E" }} />
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#28C840" }} />
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 10, color: muted, fontFamily: "var(--font-geist-mono),monospace" }}>~/alternus</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: 10 }}>
                    <span style={{ fontFamily: "var(--font-geist-mono),monospace", fontSize: 14, color: COBALT, fontWeight: 700 }}>$</span>
                    <input ref={inputRef} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="ask anything — 'summarize today's unread mail'" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: fg, fontSize: 14.5, fontFamily: "var(--font-geist-mono),monospace" }} className="placeholder:opacity-40" />
                    <button type="submit" style={{ background: COBALT, color: "#FFF", padding: "6px 14px", fontSize: 12, fontWeight: 800, border: "none", cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase", borderRadius: 8 }}>
                      Run →
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 0, marginTop: 18, border: `1px solid ${faint}`, borderRadius: 12, overflow: "hidden" }}>
                  {["Draft an email to my team about Q2", "Find last month's invoices", "Open a new React project", "Summarize today's mail"].map((s, i, arr) => (
                    <button key={s} type="button" onClick={() => goToChat(s)} style={{ flex: "1 1 200px", fontSize: 12, color: muted, padding: "14px 16px", borderRight: i < arr.length - 1 ? `1px solid ${faint}` : "none", background: "transparent", cursor: "pointer", fontWeight: 500, textAlign: "left", transition: "color 0.15s,background 0.15s" }} className="hover:!text-[#4284FF] hover:bg-[#4284FF]/5">
                      <span style={{ color: COBALT, marginRight: 6, fontWeight: 700 }}>/</span>
                      {s}
                    </button>
                  ))}
                </div>
              </form>
            </div>

            {/* R: stacked data panels */}
            <div className="lg:col-span-5" style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 12 }}>
              <div style={{ border: `1px solid ${faint}`, padding: "18px 20px", background: surface, borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 10, letterSpacing: "0.18em", fontWeight: 700, color: muted }}>LIVE STATUS</span>
                  <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN }} />
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: fg, lineHeight: 1 }}>Claude Opus 4.6</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, marginTop: 18, borderTop: `1px solid ${faint}`, paddingTop: 14 }}>
                  {[["200ms", "latency"], ["99.9%", "uptime"], ["10k+", "users"]].map(([v, l]) => (
                    <div key={l}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: fg, letterSpacing: "-0.02em" }}>{v}</div>
                      <div style={{ fontSize: 10, color: muted, letterSpacing: "0.12em", marginTop: 2 }}>{l.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rotating capability card */}
              <div style={{ border: `1px solid ${faint}`, padding: 0, background: raised, position: "relative", overflow: "hidden", borderRadius: 12 }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: `${((activeCap + 1) / capabilities.length) * 100}%`, height: 2, background: COBALT, transition: "width 3s linear" }} />
                <div className="rise" key={activeCap} style={{ padding: "24px 22px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, color: COBALT, fontFamily: "var(--font-geist-mono),monospace", fontWeight: 700 }}>{capabilities[activeCap].n}</span>
                    <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: fg }}>{capabilities[activeCap].t}</span>
                  </div>
                  <p style={{ fontSize: 13.5, color: muted, lineHeight: 1.6, margin: 0, marginBottom: 14 }}>{capabilities[activeCap].d}</p>
                  <div style={{ background: isDark ? "rgba(66,132,255,0.1)" : "rgba(66,132,255,0.07)", border: `1px solid ${COBALT}30`, padding: "8px 12px", fontFamily: "var(--font-geist-mono),monospace", fontSize: 12, color: COBALT, borderRadius: 8 }}>
                    <span style={{ opacity: 0.5 }}>{"> "}</span>
                    <span className="caret">{capabilities[activeCap].k}</span>
                  </div>
                </div>
                <div style={{ display: "flex", borderTop: `1px solid ${faint}` }}>
                  {capabilities.map((_, i) => (
                    <button key={i} onClick={() => setActiveCap(i)} style={{ flex: 1, height: 32, border: "none", borderRight: i < capabilities.length - 1 ? `1px solid ${faint}` : "none", background: i === activeCap ? COBALT : "transparent", color: i === activeCap ? "#FFF" : muted, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-geist-mono),monospace" }}>
                      {capabilities[i].n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Infinite marquee ═══ */}
      <section style={{ borderBottom: `1px solid ${faint}`, padding: "22px 0", overflow: "hidden", background: COBALT }}>
        <div className="marquee-track" style={{ display: "flex", whiteSpace: "nowrap", gap: 48 }}>
          {[...marquee, ...marquee, ...marquee, ...marquee].map((w, i) => (
            <span key={i} style={{ fontSize: 22, fontWeight: 900, color: "#FFF", letterSpacing: "-0.02em", display: "inline-flex", alignItems: "center", gap: 48 }}>
              {w}
              <span style={{ width: 8, height: 8, background: "#FFF", borderRadius: "50%" }} />
            </span>
          ))}
        </div>
      </section>

      {/* ═══ Capabilities grid — asymmetric ═══ */}
      <section id="caps" style={{ padding: "120px 0", borderBottom: `1px solid ${faint}`, position: "relative" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16" style={{ alignItems: "end" }}>
            <div className="lg:col-span-3">
              <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 12 }}>
                §01 / CAPABILITIES
              </div>
            </div>
            <div className="lg:col-span-6">
              <h2 style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1, margin: 0, color: fg, fontStretch: "90%" }}>
                Six modules.<br/>
                <span style={{ color: muted }}>One memory.</span>
              </h2>
            </div>
            <div className="lg:col-span-3">
              <p style={{ fontSize: 13.5, color: muted, lineHeight: 1.65, margin: 0 }}>
                Every module shares the same agent and the same context. Delegate once — it stays delegated.
              </p>
            </div>
          </div>

          <div style={{ border: `1px solid ${faint}`, background: raised, borderRadius: 12, overflow: "hidden" }}>
            {capabilities.map((c, i) => (
              <div key={c.n} style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 120px", gap: 24, alignItems: "center", padding: "28px 28px", borderTop: i > 0 ? `1px solid ${faint}` : "none", cursor: "pointer", transition: "background 0.2s" }} className="hover:bg-[#4284FF]/5 group">
                <span style={{ fontSize: 13, color: COBALT, fontFamily: "var(--font-geist-mono),monospace", fontWeight: 700, letterSpacing: "0.05em" }}>{c.n}</span>
                <h3 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.025em", margin: 0, color: fg, transition: "transform 0.3s" }} className="group-hover:translate-x-2">{c.t}</h3>
                <p style={{ fontSize: 13.5, color: muted, lineHeight: 1.55, margin: 0 }}>{c.d}</p>
                <code style={{ fontSize: 11, fontFamily: "var(--font-geist-mono),monospace", color: COBALT, textAlign: "right" }}>{c.k}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Manifesto — numbered pillars ═══ */}
      <section id="manifesto" style={{ padding: "120px 0", borderBottom: `1px solid ${faint}`, background: isDark ? "rgba(66,132,255,0.04)" : "rgba(66,132,255,0.03)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "-10%", top: "20%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(closest-side,${COBALT}25,transparent 70%)`, filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px", position: "relative" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 24 }}>
            §02 / MANIFESTO
          </div>
          <h2 style={{ fontSize: "clamp(42px,7vw,96px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, maxWidth: 1000, margin: 0, color: fg, fontStretch: "85%" }}>
            Software that <span style={{ color: COBALT, fontStyle: "italic" }}>works for you</span> — not the other way around.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0" style={{ marginTop: 80, border: `1px solid ${faint}`, borderRadius: 12, overflow: "hidden" }}>
            {pillars.map((p, i) => (
              <div key={p.k} style={{ padding: "36px 28px", borderRight: i < pillars.length - 1 ? `1px solid ${faint}` : "none", background: raised, position: "relative", minHeight: 220 }}>
                <div style={{ fontSize: 10, color: muted, fontFamily: "var(--font-geist-mono),monospace", marginBottom: 20, letterSpacing: "0.08em" }}>
                  / 0{i + 1}
                </div>
                <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.04em", color: COBALT, marginBottom: 14, fontStretch: "85%" }}>{p.k}.</div>
                <p style={{ fontSize: 13.5, color: muted, lineHeight: 1.6, margin: 0 }}>{p.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Voices — full-bleed blockquote carousel ═══ */}
      <section id="voices" style={{ padding: "120px 0", borderBottom: `1px solid ${faint}` }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 40 }}>
            §03 / VOICES
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0" style={{ border: `1px solid ${faint}`, borderRadius: 12, overflow: "hidden" }}>
            {quotes.map((q, i) => (
              <figure key={q.by} style={{ margin: 0, padding: "44px 36px", borderRight: i < quotes.length - 1 ? `1px solid ${faint}` : "none", background: raised, display: "flex", flexDirection: "column", gap: 24, minHeight: 360 }}>
                <div style={{ fontSize: 56, fontWeight: 900, color: COBALT, lineHeight: 0.5, fontFamily: "var(--font-playfair),serif" }}>&ldquo;</div>
                <blockquote style={{ margin: 0, fontSize: 20, fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.35, color: fg, flex: 1 }}>
                  {q.q}
                </blockquote>
                <figcaption style={{ borderTop: `1px solid ${faint}`, paddingTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: COBALT, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>
                    {q.by.split(" ").map((w) => w[0]).join("")}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: fg }}>{q.by}</div>
                    <div style={{ fontSize: 11, color: muted, letterSpacing: "0.04em" }}>{q.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ OS preview — single large screen ═══ */}
      <section style={{ padding: "120px 0", borderBottom: `1px solid ${faint}` }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", marginBottom: 48, flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 12 }}>§04 / PREVIEW</div>
              <h2 style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1, margin: 0, color: fg, fontStretch: "90%" }}>The workspace.</h2>
            </div>
            <Link href="/os" style={{ fontSize: 13, fontWeight: 700, color: COBALT, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, borderBottom: `2px solid ${COBALT}`, paddingBottom: 4 }}>
              Open it live →
            </Link>
          </div>

          <div style={{ border: `1px solid ${faint}`, boxShadow: `16px 16px 0 0 ${COBALT}`, background: "#0C1220", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px", height: 40, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5F57" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FEBC2E" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28C840" }} />
              <div style={{ marginLeft: 24, padding: "4px 12px", background: "rgba(255,255,255,0.06)", fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-geist-mono),monospace" }}>
                alternus.art/os
              </div>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-geist-mono),monospace" }}>agent:idle · opus-4.6</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "64px 240px 1fr", minHeight: 520 }}>
              <div style={{ borderRight: "1px solid rgba(255,255,255,0.06)", padding: "14px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, background: COBALT, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontWeight: 900, fontSize: 14 }}>A</div>
                <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.1)" }} />
                {["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z", "M16 18l6-6-6-6M8 6l-6 6 6 6", "M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3z"].map((d, i) => (
                  <div key={i} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: i === 1 ? COBALT : "rgba(255,255,255,0.4)", background: i === 1 ? "rgba(66,132,255,0.1)" : "transparent" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
                  </div>
                ))}
              </div>
              <div style={{ borderRight: "1px solid rgba(255,255,255,0.06)", padding: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", padding: "4px 8px", letterSpacing: "0.1em", marginBottom: 4 }}>FILES</div>
                {["Projects", "Invoices", "Design", "Contracts"].map((n, i) => (
                  <div key={n} style={{ padding: "7px 10px", background: i === 1 ? "rgba(66,132,255,0.15)" : "transparent", fontSize: 13, color: i === 1 ? "#FFF" : "rgba(255,255,255,0.7)", fontWeight: i === 1 ? 600 : 400, display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>▸</span>{n}
                    {i === 1 && <span style={{ marginLeft: "auto", background: COBALT, color: "#FFF", fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>2</span>}
                  </div>
                ))}
              </div>
              <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#FFF", letterSpacing: "-0.02em" }}># invoices</div>
                <div style={{ background: "rgba(66,132,255,0.08)", border: `1px solid ${COBALT}40`, padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, background: COBALT, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontWeight: 800, fontSize: 11 }}>AI</div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: COBALT }}>ALTERNUS</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-geist-mono),monospace" }}>10:42</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
                    Found <strong style={{ color: "#FFF" }}>2 invoices</strong> from March. Total: <strong style={{ color: COBALT }}>$4,820</strong>. Export a summary?
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                  {["Invoice_Mar.pdf", "Receipt_02.pdf", "Contract.pdf"].map((n, i) => (
                    <div key={n} style={{ padding: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
                      <div style={{ width: 28, height: 32, background: `${COBALT}22`, border: `1px solid ${COBALT}55`, marginBottom: 8, fontSize: 8, fontWeight: 800, color: COBALT, display: "flex", alignItems: "center", justifyContent: "center" }}>PDF</div>
                      <div style={{ fontSize: 11, color: "#FFF", fontWeight: 600, marginBottom: 2 }}>{n}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{[128, 84, 32][i]} KB</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "auto", border: "1px solid rgba(255,255,255,0.08)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-geist-mono),monospace", color: COBALT, fontSize: 12 }}>$</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", flex: 1, fontFamily: "var(--font-geist-mono),monospace" }}>ask agent about these files...</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COBALT} strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" style={{ padding: "120px 0", borderBottom: `1px solid ${faint}` }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 24 }}>§05 / QUESTIONS</div>
          <h2 style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1, margin: 0, marginBottom: 48, color: fg, fontStretch: "90%" }}>Frequently asked.</h2>
          <div style={{ border: `1px solid ${faint}`, borderRadius: 12, overflow: "hidden" }}>
            {faq.map((f, i) => (
              <div key={i} style={{ borderTop: i > 0 ? `1px solid ${faint}` : "none" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", padding: "24px 28px", background: openFaq === i ? (isDark ? "rgba(66,132,255,0.06)" : "rgba(66,132,255,0.04)") : "transparent", border: "none", color: fg, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", transition: "background 0.2s" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <span style={{ fontSize: 11, color: COBALT, fontFamily: "var(--font-geist-mono),monospace", fontWeight: 700 }}>0{i + 1}</span>
                    <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.015em" }}>{f.q}</span>
                  </span>
                  <span style={{ fontSize: 20, color: COBALT, fontWeight: 300, transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                </button>
                {openFaq === i && (
                  <div className="rise" style={{ padding: "0 28px 28px 72px", fontSize: 14.5, color: muted, lineHeight: 1.65 }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ padding: "140px 0", background: COBALT, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1px,transparent 1px)", backgroundSize: "32px 32px", opacity: 0.5, pointerEvents: "none" }} />
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px", position: "relative", textAlign: "center" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 28 }}>§06 / BEGIN</div>
          <h2 style={{ fontSize: "clamp(52px,9vw,140px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.85, color: "#FFF", margin: 0, fontStretch: "85%" }}>
            Stop clicking.<br/>
            <span style={{ fontStyle: "italic" }}>Start talking.</span>
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.85)", maxWidth: 540, margin: "36px auto 48px", lineHeight: 1.5 }}>
            Alternus is free to try. Open the OS, say hello, and let the agent do the rest.
          </p>
          <Link href="/os" style={{ display: "inline-flex", alignItems: "center", gap: 12, height: 56, padding: "0 32px", background: "#FFF", color: COBALT, fontSize: 16, fontWeight: 800, textDecoration: "none", letterSpacing: "-0.01em", boxShadow: `8px 8px 0 0 ${INK}`, borderRadius: 8 }}>
            Launch Alternus OS
            <span style={{ fontSize: 14 }}>↗</span>
          </Link>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer style={{ paddingTop: 96, paddingBottom: 40, background: isDark ? INK : PAPER, borderTop: `3px solid ${COBALT}` }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>

          {/* ── 4-col link index ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12" style={{ paddingBottom: 80 }}>
            {[
              { heading: "Platform", links: [
                { l: "Overview",        h: "/platform/overview",   ext: false },
                { l: "Agent SDK",       h: "/platform/agent-sdk",  ext: false },
                { l: "API Reference",   h: "/platform/api",        ext: true  },
                { l: "Changelog",       h: "/platform/changelog",  ext: false },
                { l: "Status",          h: "/platform/status",     ext: false },
              ]},
              { heading: "Workspace", links: [
                { l: "Launch OS",       h: "/os",                  ext: true  },
                { l: "Mail",            h: "/workspace/mail",      ext: false },
                { l: "Files",           h: "/workspace/files",     ext: false },
                { l: "Code Studio",     h: "/workspace/code",      ext: false },
                { l: "Knowledge Base",  h: "/workspace/knowledge", ext: false },
                { l: "Voice Mode",      h: "/workspace/voice",     ext: false },
              ]},
              { heading: "Company", links: [
                { l: "About",           h: "/about",               ext: false },
                { l: "Manifesto",       h: "/manifesto",           ext: false },
                { l: "Careers",         h: "/careers",             ext: true  },
                { l: "Press Kit",       h: "/press",               ext: false },
                { l: "Contact",         h: "/contact",             ext: false },
              ]},
              { heading: "Legal", links: [
                { l: "Privacy Policy",  h: "/privacy",             ext: false },
                { l: "Terms of Use",    h: "/terms",               ext: false },
                { l: "Cookie Notice",   h: "/cookie-notice",       ext: false },
                { l: "Security",        h: "/security",            ext: false },
                { l: "Pricing",         h: "/pricing",             ext: false },
              ]},
            ].map((col) => (
              <div key={col.heading}>
                <div style={{ fontSize: 11, color: muted, fontWeight: 500, marginBottom: 22, letterSpacing: "-0.005em" }}>{col.heading}</div>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                  {col.links.map((item) => (
                    <li key={item.l}>
                      <Link href={item.h} style={{ fontSize: 14.5, color: fg, fontWeight: 500, textDecoration: "none", letterSpacing: "-0.005em", display: "inline-flex", alignItems: "center", gap: 4, transition: "color 0.15s" }} className="hover:!text-[#4284FF]">
                        {item.l}
                        {item.ext && <span style={{ fontSize: 11, opacity: 0.7 }}>↗</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ── Bottom bar: socials / copyright / locale ── */}
          <div style={{ borderTop: `1px solid ${faint}`, paddingTop: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            {/* Socials */}
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {[
                { l: "X",         d: "M18.244 2H21l-6.54 7.47L22 22h-6.828l-5.34-6.99L3.6 22H0.84l7-8L0 2h6.914l4.82 6.38L18.244 2z" },
                { l: "GitHub",    d: "M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.12-1.47-1.12-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.1.39-2 1.03-2.7-.1-.26-.45-1.29.1-2.68 0 0 .84-.27 2.75 1.03a9.57 9.57 0 015 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.39.2 2.42.1 2.68.64.7 1.03 1.6 1.03 2.7 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0012 2z" },
                { l: "LinkedIn",  d: "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43A2.07 2.07 0 113.27 5.36a2.07 2.07 0 012.07 2.07zM7.12 20.45H3.56V9h3.56v11.45z" },
                { l: "YouTube",   d: "M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.75 15.57V8.43L15.82 12l-6.07 3.57z" },
                { l: "Discord",   d: "M20.32 4.37A19.79 19.79 0 0016.55 3c-.16.29-.35.68-.48.99a18.27 18.27 0 00-5.14 0C10.8 3.68 10.6 3.29 10.44 3a19.74 19.74 0 00-3.77 1.37C3.24 9.27 2.45 14.06 2.84 18.77a19.9 19.9 0 005.93 3.01c.48-.65.91-1.34 1.28-2.07-.71-.27-1.4-.6-2.05-1 .17-.13.34-.26.5-.4 3.92 1.82 8.17 1.82 12.04 0 .17.14.33.27.5.4-.65.4-1.34.73-2.05 1 .37.73.8 1.42 1.28 2.07a19.9 19.9 0 005.93-3.01c.46-5.47-.78-10.23-3.88-14.4zM8.52 16c-1.18 0-2.15-1.1-2.15-2.44s.95-2.44 2.15-2.44c1.2 0 2.17 1.1 2.15 2.44 0 1.34-.95 2.44-2.15 2.44zm6.96 0c-1.18 0-2.15-1.1-2.15-2.44s.95-2.44 2.15-2.44c1.2 0 2.17 1.1 2.15 2.44 0 1.34-.94 2.44-2.15 2.44z" },
                { l: "RSS",       d: "M6.18 15.64a2.18 2.18 0 012.18 2.18 2.18 2.18 0 01-2.18 2.18A2.18 2.18 0 014 17.82a2.18 2.18 0 012.18-2.18M4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44m0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93V10.1z" },
              ].map((s) => (
                <Link key={s.l} href="#" aria-label={s.l} style={{ color: muted, display: "flex", transition: "color 0.15s" }} className="hover:!text-[#4284FF]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d={s.d}/></svg>
                </Link>
              ))}
            </div>

            {/* Brand + copy */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 16, height: 16, background: COBALT, borderRadius: 4 }} />
                <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "-0.01em", color: fg, fontStretch: "90%" }}>ALTERNUS</span>
              </div>
              <span style={{ fontSize: 11.5, color: muted }}>© 2015–2026 · Built with Claude</span>
              <Link href="/cookie-notice" style={{ fontSize: 11.5, color: muted, textDecoration: "none", borderBottom: `1px dashed ${faint}`, paddingBottom: 1 }}>Manage Cookies</Link>
            </div>

            {/* Locale pill */}
            <button style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", border: `1px solid ${faint}`, background: "transparent", color: fg, fontSize: 12.5, fontWeight: 500, cursor: "pointer", borderRadius: 999, transition: "border-color 0.15s" }} className="hover:!border-[#4284FF]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/>
              </svg>
              English
              <span style={{ color: muted }}>Albania</span>
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
