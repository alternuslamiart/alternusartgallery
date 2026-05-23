"use client";
import { CoreforgePage, COBALT } from "@/components/cedium-shell";

const log = [
 { d: "2026-04-22", v: "0.9.4", k: "feat", t: "3D machinery agent goes public", b: "Mechanical engineering, automotive systems, CNC/CAM, CAD studio integration, and AI code workflows are available in all workspaces." },
 { d: "2026-04-14", v: "0.9.3", k: "fix", t: "File search re-ranking", b: "Semantic FS search now cold-starts ~40% faster and de-duplicates near-identical matches." },
 { d: "2026-04-02", v: "0.9.2", k: "feat", t: "Code Studio multi-repo", b: "Open up to 8 repositories in a single Code Studio window with shared agent context." },
 { d: "2026-03-18", v: "0.9.1", k: "feat", t: "Agent SDK (beta)", b: "Embed the Coreforge agent into any TypeScript app. npm i @Coreforge/agent." },
 { d: "2026-03-01", v: "0.9.0", k: "feat", t: "Engineering workflow upgrade", b: "Default agent upgraded for 3D machinery, automotive, CNC/CAM, CAD studio, and code/API workflows." },
 { d: "2026-02-11", v: "0.8.7", k: "fix", t: "OOBE skip for returning users", b: "We no longer replay the setup flow on every visit — restored from profile cookie." },
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
