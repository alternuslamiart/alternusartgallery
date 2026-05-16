"use client";

import Link from "next/link";
import { Box, Gamepad2 } from "lucide-react";
import { CediumPage, COBALT } from "@/components/Cedium-shell";

const bridges = [
  {
    app: "AutoCAD",
    slug: "autocad",
    v: "Latest",
    kind: "Design bridge",
    blurb:
      "Plan website screens, design systems, components, variants, and responsive states with the coding agent ready beside the design.",
    verbs: ["build frames", "sync tokens", "create components", "prepare code"],
    install: "AutoCAD Community plugin",
  },
  {
    app: "Blender",
    slug: "blender",
    v: "4.0+",
    kind: "Python add-on",
    blurb:
      "Drive website hero scenes, 3D assets, geometry nodes, materials, lighting, and render queues through a signed Blender add-on.",
    verbs: ["build scene", "geometry nodes", "materials", "render assets"],
    install: "Cedium.ai/bridges/blender.zip",
  },
];

const upcomingEngines = [
  {
    app: "Unreal Engine",
    Icon: Box,
    description: "Create, prototype, and assist with next-generation 3D experiences powered by Cedium AI.",
    tags: ["real-time 3D", "prototyping", "worldbuilding"],
  },
  {
    app: "Unity",
    Icon: Gamepad2,
    description: "Build smarter interactive apps, games, simulations, and real-time experiences with AI-assisted workflows.",
    tags: ["interactive apps", "games", "simulation"],
  },
];

export default function Bridges() {
  return (
    <CediumPage>
      {(t) => (
        <>
          <section style={{ padding: "120px 0 60px", position: "relative", overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                right: "-10%",
                top: "-10%",
                width: 700,
                height: 700,
                borderRadius: "50%",
                background: `radial-gradient(closest-side,${COBALT}28,transparent 70%)`,
                filter: "blur(40px)",
                pointerEvents: "none",
              }}
            />
            <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px", position: "relative" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 22 }}>
                PLATFORM / BRIDGES
              </div>
              <h1 style={{ fontSize: "clamp(48px,8vw,128px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.88, margin: 0, fontStretch: "82%", maxWidth: 1100 }}>
                Design in <span style={{ color: COBALT, fontStyle: "italic" }}>AutoCAD</span>.<br />
                Build in Blender.
              </h1>
              <p style={{ marginTop: 32, fontSize: 18, color: t.muted, maxWidth: 640, lineHeight: 1.55 }}>
                Cedium connects the coding agent with AutoCAD for website design systems and Blender for 3D scenes, product visuals, and render-ready assets.
              </p>
            </div>
          </section>

          <section style={{ padding: "60px 0", borderTop: `1px solid ${t.faint}`, background: t.surface }}>
            <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {bridges.map((b) => (
                  <div
                    key={b.slug}
                    style={{
                      padding: "28px 28px",
                      border: `1px solid ${t.faint}`,
                      borderRadius: 12,
                      background: t.raised,
                      boxShadow: t.isDark ? "0 1px 3px rgba(0,0,0,0.25)" : "0 1px 4px rgba(5,8,15,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: `${COBALT}14`, display: "flex", alignItems: "center", justifyContent: "center", color: COBALT, fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em" }}>
                        {b.app.slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>{b.app}</div>
                        <div style={{ fontSize: 11, color: t.muted, marginTop: 2, fontFamily: "var(--font-geist-mono),monospace" }}>
                          {b.v} / {b.kind}
                        </div>
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", color: COBALT, background: `${COBALT}14`, padding: "4px 8px", borderRadius: 4 }}>
                        LIVE
                      </span>
                    </div>

                    <p style={{ fontSize: 13.5, color: t.muted, lineHeight: 1.6, margin: 0, marginBottom: 18 }}>{b.blurb}</p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                      {b.verbs.map((v) => (
                        <code key={v} style={{ fontSize: 10.5, fontFamily: "var(--font-geist-mono),monospace", color: COBALT, background: `${COBALT}10`, padding: "3px 8px", borderRadius: 4 }}>
                          {v}
                        </code>
                      ))}
                    </div>

                    <div style={{ paddingTop: 14, borderTop: `1px solid ${t.faint}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: t.muted }}>{b.install}</span>
                      <Link href="#" style={{ fontSize: 12.5, fontWeight: 700, color: COBALT, textDecoration: "none" }}>
                        Install
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ padding: "84px 0", borderTop: `1px solid ${t.faint}`, background: t.isDark ? "#1B1B1B" : t.bg }}>
            <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
              <div style={{ maxWidth: 720, marginBottom: 34 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 18 }}>
                  ROADMAP / GAME ENGINES
                </div>
                <h2 style={{ fontSize: "clamp(34px,5vw,64px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.96, margin: 0, fontStretch: "86%" }}>
                  Game Engine Workflows - Coming Soon
                </h2>
                <p style={{ marginTop: 18, fontSize: 15.5, color: t.muted, maxWidth: 680, lineHeight: 1.65 }}>
                  Cedium AI is preparing support for advanced real-time creation workflows across Unreal Engine and Unity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {upcomingEngines.map(({ app, Icon, description, tags }) => (
                  <article
                    key={app}
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      minHeight: 286,
                      padding: "30px 30px 26px",
                      border: `1px solid ${t.isDark ? "rgba(66,132,255,0.22)" : "rgba(66,132,255,0.18)"}`,
                      borderRadius: 18,
                      background: t.isDark
                        ? "linear-gradient(135deg,#262626 0%,#1B1B1B 58%,rgba(66,132,255,0.13) 100%)"
                        : "linear-gradient(135deg,#ffffff 0%,#F4F6FB 58%,rgba(66,132,255,0.12) 100%)",
                      boxShadow: t.isDark ? "0 18px 54px rgba(0,0,0,0.24)" : "0 18px 54px rgba(30,64,175,0.08)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        right: -70,
                        top: -80,
                        width: 230,
                        height: 230,
                        borderRadius: "50%",
                        background: `radial-gradient(closest-side,${COBALT}25,transparent 72%)`,
                        pointerEvents: "none",
                      }}
                    />
                    <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            background: `${COBALT}16`,
                            border: `1px solid ${COBALT}30`,
                            color: COBALT,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon size={22} strokeWidth={1.9} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", margin: 0 }}>{app}</h3>
                          <p style={{ margin: "4px 0 0", fontSize: 11, color: t.muted, fontFamily: "var(--font-geist-mono),monospace" }}>
                            planned platform capability
                          </p>
                        </div>
                      </div>
                      <span
                        style={{
                          flexShrink: 0,
                          fontSize: 9,
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          color: COBALT,
                          background: `${COBALT}14`,
                          border: `1px solid ${COBALT}22`,
                          padding: "5px 8px",
                          borderRadius: 999,
                          textTransform: "uppercase",
                        }}
                      >
                        Coming Soon
                      </span>
                    </div>

                    <p style={{ position: "relative", margin: "26px 0 0", maxWidth: 560, fontSize: 14.5, color: t.muted, lineHeight: 1.65 }}>
                      {description}
                    </p>

                    <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 7, marginTop: 22 }}>
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: t.muted,
                            background: t.isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.72)",
                            border: `1px solid ${t.faint}`,
                            padding: "5px 10px",
                            borderRadius: 999,
                            letterSpacing: "0.02em",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div style={{ position: "relative", marginTop: 28, paddingTop: 18, borderTop: `1px solid ${t.faint}` }}>
                      <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        style={{
                          height: 40,
                          padding: "0 16px",
                          borderRadius: 10,
                          border: `1px solid ${t.faint}`,
                          background: t.isDark ? "rgba(255,255,255,0.04)" : "rgba(5,8,15,0.035)",
                          color: t.muted,
                          fontSize: 12.5,
                          fontWeight: 800,
                          cursor: "not-allowed",
                          opacity: 0.78,
                        }}
                      >
                        Coming Soon
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section style={{ padding: "96px 0", borderTop: `1px solid ${t.faint}` }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 20 }}>
                HOW IT CONNECTS
              </div>
              <h2 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1, margin: 0, marginBottom: 48, fontStretch: "88%" }}>
                AutoCAD for website design. Blender for 3D.
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0" style={{ border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden" }}>
                {[
                  {
                    n: "01",
                    title: "AutoCAD to code",
                    d: "The agent reads website structure, components, tokens, and layout intent from AutoCAD, then prepares responsive code sections.",
                    tags: ["AutoCAD", "Code", "Website"],
                  },
                  {
                    n: "02",
                    title: "Blender to website",
                    d: "The agent builds Blender scenes, materials, lighting, and render assets that can be used in hero sections and product pages.",
                    tags: ["Blender", "3D", "Render"],
                  },
                ].map((step, i) => (
                  <div key={step.n} style={{ padding: "40px 36px", background: t.raised, borderLeft: i === 1 ? `1px solid ${t.faint}` : "none" }}>
                    <div style={{ fontSize: 12, color: COBALT, fontFamily: "var(--font-geist-mono),monospace", fontWeight: 700, marginBottom: 14 }}>{step.n}</div>
                    <h3 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: 0, marginBottom: 12 }}>{step.title}</h3>
                    <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.6, margin: 0, marginBottom: 18 }}>{step.d}</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {step.tags.map((tag) => (
                        <span key={tag} style={{ fontSize: 10, fontWeight: 700, color: t.muted, background: t.surface, border: `1px solid ${t.faint}`, padding: "4px 10px", borderRadius: 999, letterSpacing: "0.04em" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 64, padding: 28, border: `1px solid ${t.faint}`, borderRadius: 12, background: t.raised, boxShadow: t.isDark ? "0 1px 3px rgba(0,0,0,0.25)" : "0 1px 4px rgba(5,8,15,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
                  <span style={{ fontSize: 11, color: t.muted, fontFamily: "var(--font-geist-mono),monospace", letterSpacing: "0.06em" }}>
                    Cedium.autocad.code - v0.9.4
                  </span>
                </div>
                <pre style={{ margin: 0, fontSize: 12.5, fontFamily: "var(--font-geist-mono),monospace", lineHeight: 1.7, color: t.fg }}>
                  <span style={{ color: COBALT }}>&gt;</span> Cedium.autocad.code({"{"}
                  {"\n"}  goal:   <span style={{ color: "#22C55E" }}>&quot;build a clean responsive pricing section&quot;</span>,
                  {"\n"}  frame:  <span style={{ color: "#22C55E" }}>&quot;Website / Pricing&quot;</span>,
                  {"\n"}  output: <span style={{ color: "#22C55E" }}>&quot;React + Tailwind&quot;</span>,
                  {"\n"}
                  {"}"}){"\n"}
                  <span style={{ color: t.muted }}>{"// read AutoCAD frame - mapped tokens - wrote responsive code - 200ms"}</span>
                </pre>
              </div>
            </div>
          </section>

          <section style={{ padding: "96px 0", borderTop: `1px solid ${t.faint}` }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", textAlign: "center" }}>
              <h2 style={{ fontSize: "clamp(40px,6vw,80px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, margin: 0, fontStretch: "86%" }}>
                AutoCAD and Blender.<br />
                <span style={{ color: COBALT, fontStyle: "italic" }}>One agent.</span>
              </h2>
              <div style={{ marginTop: 40, display: "inline-flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
                <Link href="/main" style={{ height: 48, padding: "0 22px", background: COBALT, color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  Launch Cedium OS
                </Link>
                <Link href="/platform/agent-sdk" style={{ height: 48, padding: "0 22px", background: "transparent", color: t.fg, fontSize: 14, fontWeight: 700, borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center", border: `1px solid ${t.faint}` }}>
                  Build the bridge
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </CediumPage>
  );
}
