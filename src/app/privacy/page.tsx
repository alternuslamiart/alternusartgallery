"use client";
import { CoreforgePage, COBALT } from "@/components/cedium-shell";

const sections = [
 { id: "overview", t: "Overview", b: "Coreforge treats your data as yours. We process it only to deliver the product, we do not sell it, and we do not train shared models on it." },
 { id: "what", t: "What we collect", b: "Account information (email, workspace name), workspace content that you explicitly store (files, mail, notes), and operational telemetry for reliability." },
 { id: "how", t: "How we use it", b: "To run your workspace, answer your agent queries, send you essential notifications, and detect abuse. That is the complete list." },
 { id: "training", t: "Model training", b: "We do not train any model on your workspace content. The Claude agent reads your data at query time only, over encrypted channels." },
 { id: "storage", t: "Storage", b: "Data is encrypted at rest (AES-256) and in transit (TLS 1.3). Workspaces are isolated per-tenant with row-level access controls." },
 { id: "rights", t: "Your rights", b: "You can export everything at any time, delete your workspace in one action, and request a report of every query the agent ran on your behalf." },
 { id: "contact", t: "Contact", b: "privacy@Coreforge.ai — we respond within 72 hours, every time." },
];

export default function Privacy() {
 return (
 <CoreforgePage>
 {(t) => (
 <section style={{ padding: "80px 0 120px" }}>
 <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
 {/* TOC */}
 <aside className="lg:col-span-3" style={{ position: "sticky", top: 96, alignSelf: "start" }}>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 18 }}>PRIVACY POLICY</div>
 <div style={{ fontSize: 11, color: t.muted, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, marginBottom: 14 }}>On this page</div>
 <nav style={{ display: "flex", flexDirection: "column", gap: 8, borderLeft: `1px solid ${t.faint}`, paddingLeft: 14 }}>
 {sections.map((s) => (
 <a key={s.id} href={`#${s.id}`} style={{ fontSize: 13, color: t.muted, textDecoration: "none", fontWeight: 500 }} className="hover:!text-[#4284FF]">{s.t}</a>
 ))}
 </nav>
 <div style={{ marginTop: 40, padding: 14, border: `1px solid ${t.faint}`, borderRadius: 8, fontSize: 11, color: t.muted, fontFamily: "var(--font-geist-mono),monospace" }}>
 <div style={{ color: COBALT, fontWeight: 700, marginBottom: 4 }}>v2.1 · Apr 2026</div>
 Last reviewed by legal.
 </div>
 </aside>

 {/* Prose */}
 <article className="lg:col-span-9">
 <h1 style={{ fontSize: "clamp(44px,6vw,80px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, margin: 0, marginBottom: 60, fontStretch: "86%" }}>Privacy Policy</h1>
 {sections.map((s, i) => (
 <div key={s.id} id={s.id} style={{ marginBottom: 48, paddingTop: 24, borderTop: i > 0 ? `1px solid ${t.faint}` : "none" }}>
 <h2 style={{ display: "flex", alignItems: "baseline", gap: 14, fontSize: 24, fontWeight: 800, letterSpacing: "-0.025em", margin: 0, marginBottom: 14 }}>
 <span style={{ fontSize: 11, color: COBALT, fontFamily: "var(--font-geist-mono),monospace", fontWeight: 700 }}>§ {String(i + 1).padStart(2, "0")}</span>
 {s.t}
 </h2>
 <p style={{ fontSize: 15.5, color: t.muted, lineHeight: 1.75, margin: 0, maxWidth: 740 }}>{s.b}</p>
 </div>
 ))}
 </article>
 </div>
 </div>
 </section>
 )}
 </CoreforgePage>
 );
}
