"use client";
import { CoreforgePage, COBALT } from "@/components/cedium-shell";

const log = [
 { d: "2026-09-17", v: "1.0.0", k: "feat", t: "Crystal platform launch", b: "Crystal now brings AI Chat, AI Code, Architecture Studio, image generation, PDF documentation, and connected project workflows into one platform." },
 { d: "2026-09-12", v: "0.9.9", k: "feat", t: "GPT Astra joins the workspace", b: "GPT Astra, powered by OpenAI technology, provides structured assistance for architectural research, design decisions, project planning, and technical workflows." },
 { d: "2026-09-08", v: "0.9.8", k: "feat", t: "Architecture Studio workflows", b: "Create and organize architectural concepts with project context, spatial studies, floor-plan generation, statistics, and design documentation." },
 { d: "2026-09-03", v: "0.9.7", k: "feat", t: "Modeling and infrastructure tools", b: "Crystal adds connected workflows for 3D modeling, floor plans, infrastructure systems, visual studies, and professional project handoff." },
 { d: "2026-08-27", v: "0.9.6", k: "feat", t: "Claude AI and Codex workflows", b: "Use Claude AI for research and design reasoning, and OpenAI Codex for code generation, automation, and technical project tools." },
 { d: "2026-08-19", v: "0.9.5", k: "feat", t: "Desktop workflows for Windows and Mac", b: "Crystal Studio Desktop now supports local project files, offline access, automation, and documentation workflows on Windows and Apple MacBook devices." },
];

const tagColor: Record<string, string> = { feat: COBALT, fix: "#F59E0B", chore: "#64748B" };

export default function Changelog() {
 return (
 <CoreforgePage>
 {(t) => (
 <>
 <section style={{ padding: "80px 0 40px", borderBottom: `1px solid ${t.faint}` }}>
 <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 16 }}>CHANGELOG</div>
 <h1 style={{ fontSize: "clamp(40px,6vw,72px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, margin: 0, fontStretch: "88%" }}>
 Everything we ship.
 </h1>
 </div>
 </section>

 <section style={{ padding: "60px 0 120px" }}>
 <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px", position: "relative" }}>
 <div style={{ position: "absolute", left: 152, top: 0, bottom: 0, width: 1, background: t.faint }} />
 {log.map((e, i) => (
 <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 60px 1fr", gap: 16, paddingBottom: 36, alignItems: "flex-start", position: "relative" }}>
 <div>
 <div style={{ fontSize: 12, fontFamily: "var(--font-geist-mono),monospace", color: t.muted, letterSpacing: "0.04em" }}>{e.d}</div>
 <div style={{ fontSize: 11, color: COBALT, fontWeight: 700, marginTop: 4 }}>v{e.v}</div>
 </div>
 <div style={{ position: "relative", paddingTop: 4 }}>
 <div style={{ width: 12, height: 12, borderRadius: "50%", background: t.bg, border: `2px solid ${COBALT}`, position: "absolute", left: 12 }} />
 </div>
 <div style={{ paddingLeft: 8 }}>
 <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
 <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "#fff", background: tagColor[e.k], padding: "2px 8px", borderRadius: 4 }}>{e.k.toUpperCase()}</span>
 <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: t.fg }}>{e.t}</span>
 </div>
 <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.6, margin: 0 }}>{e.b}</p>
 </div>
 </div>
 ))}
 </div>
 </section>
 </>
 )}
 </CoreforgePage>
 );
}
