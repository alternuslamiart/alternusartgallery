"use client";
import Link from "next/link";
import { CoreforgePage, COBALT } from "@/components/cedium-shell";

export default function PlatformOverview() {
 return (
 <CoreforgePage>
 {(t) => (
 <>
 <section style={{ padding: "96px 0 64px", borderBottom: `1px solid ${t.faint}` }}>
 <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 20 }}>PLATFORM / OVERVIEW</div>
 <h1 style={{ fontSize: "clamp(48px,7vw,104px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.9, margin: 0, fontStretch: "85%" }}>
 One platform.<br/><span style={{ color: COBALT, fontStyle: "italic" }}>Every machine.</span>
 </h1>
 <p style={{ marginTop: 32, fontSize: 18, color: t.muted, maxWidth: 640, lineHeight: 1.55 }}>
 Coreforge is an AI engineering workspace for 3D machinery, engines, automotive systems, CNC machining, aerospace parts, industrial CAD, and engineering code automation.
 </p>
 </div>
 </section>

 <section style={{ padding: "96px 0", borderBottom: `1px solid ${t.faint}` }}>
 <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-0" style={{ border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden" }}>
 {[
 { t: "3D Machinery", d: "Design engines, transmissions, hydraulic and pneumatic systems across major CAD studios." },
 { t: "Automotive & Motorcycles", d: "Create body, chassis, suspension, braking systems, cars, trucks, motorcycles, and EV components." },
 { t: "CNC / CAM + Code", d: "Generate G-code, optimize toolpaths, and build FEA/CFD, CAD scripting, and API automation." },
 ].map((c, i, a) => (
 <div key={c.t} style={{ padding: "40px 32px", borderRight: i < a.length - 1 ? `1px solid ${t.faint}` : "none", background: t.raised, minHeight: 260 }}>
 <div style={{ width: 36, height: 36, background: COBALT, color: "#fff", fontWeight: 900, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, borderRadius: 8 }}>0{i + 1}</div>
 <h3 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 12 }}>{c.t}</h3>
 <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.6, margin: 0 }}>{c.d}</p>
 </div>
 ))}
 </div>
 <div style={{ marginTop: 48, display: "flex", gap: 14, flexWrap: "wrap" }}>
 <Link href="/platform/agent-sdk" style={{ height: 48, padding: "0 22px", background: COBALT, color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>Explore SDK →</Link>
 <Link href="/platform/api" style={{ height: 48, padding: "0 22px", background: "transparent", color: t.fg, fontSize: 14, fontWeight: 700, borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center", border: `1px solid ${t.faint}` }}>Read API docs</Link>
 </div>
 </div>
 </section>
 </>
 )}
 </CoreforgePage>
 );
}
