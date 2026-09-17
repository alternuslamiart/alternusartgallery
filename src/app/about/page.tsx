"use client";
import Link from "next/link";
import { CoreforgePage, COBALT } from "@/components/cedium-shell";

export default function About() {
 return (
 <CoreforgePage>
 {(t) => (
 <>
 <section style={{ padding: "120px 0 80px" }}>
 <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 20 }}>ABOUT</div>
 <h1 style={{ fontSize: "clamp(48px,8vw,128px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.88, margin: 0, fontStretch: "82%" }}>
 A platform for<br/>
 <span style={{ color: COBALT, fontStyle: "italic" }}>intelligent spaces.</span>
 </h1>
 </div>
 </section>

 <section style={{ padding: "40px 0 120px", borderTop: `1px solid ${t.faint}` }}>
 <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 32px 0" }}>
 <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
 <div className="md:col-span-4">
 <div style={{ fontSize: 11, letterSpacing: "0.2em", fontWeight: 700, color: t.muted, position: "sticky", top: 100 }}>§ ORIGIN</div>
 </div>
 <div className="md:col-span-8" style={{ fontSize: 18, lineHeight: 1.75, color: t.fg, fontWeight: 400 }}>
<p>Crystal is an AI-native platform for architecture, interior design, 3D visualization, infrastructure, and intelligent environments. It brings research, spatial planning, image generation, code, modeling, and project documentation into one connected workspace.</p>
 <p style={{ marginTop: 24 }}>Founded in 2026, Crystal was created around a simple idea — <em style={{ color: COBALT, fontStyle: "italic" }}>professional design work should have an intelligent layer.</em> GPT Astra, built with OpenAI technology, helps transform briefs into structured ideas, visual studies, technical workflows, and clearer decisions.</p>
 </div>
 </div>

 <div style={{ height: 1, background: t.faint, margin: "80px 0" }} />

 <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
 <div className="md:col-span-4">
 <div style={{ fontSize: 11, letterSpacing: "0.2em", fontWeight: 700, color: t.muted, position: "sticky", top: 100 }}>§ TODAY</div>
 </div>
 <div className="md:col-span-8" style={{ fontSize: 18, lineHeight: 1.75, color: t.fg }}>
<p>Today the platform connects AI Chat, AI Code, Architecture Studio, floor-plan generation, infrastructure planning, image creation, PDF documentation, and desktop workflows. Users can move from an early concept to analysis, visualization, modeling, and professional project handoff without losing context.</p>
 </div>
 </div>

 <div className="grid grid-cols-3 gap-6" style={{ marginTop: 80 }}>
 {[["2026", "founded"], ["0", "active users"], ["GPT Astra", "AI agent · OpenAI"]].map(([v, l]) => (
 <div key={l} style={{ padding: "32px 24px", border: `1px solid ${t.faint}`, borderRadius: 12, background: t.raised }}>
 <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.04em", color: COBALT, fontStretch: "85%" }}>{v}</div>
 <div style={{ fontSize: 12, color: t.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6 }}>{l}</div>
 </div>
 ))}
 </div>

 <div style={{ marginTop: 56 }}>
 <Link href="/manifesto" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: COBALT, borderBottom: `2px solid ${COBALT}`, paddingBottom: 4, textDecoration: "none" }}>Read the manifesto →</Link>
 </div>
 </div>
 </section>
 </>
 )}
 </CoreforgePage>
 );
}
