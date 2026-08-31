"use client";
import { CoreforgePage, COBALT } from "@/components/cedium-shell";

const clauses = [
 { t: "Acceptance", b: "By creating a Crystal Studio workspace, you agree to these terms. If you do not agree, do not use the service." },
 { t: "Your account", b: "You're responsible for securing your credentials. One workspace per person unless you're on an Enterprise plan." },
 { t: "Acceptable use", b: "Do not use Crystal Studio to harm others, break laws, bypass safety requirements, or generate harmful content. We reserve the right to terminate workspaces that do." },
 { t: "Your content", b: "You retain full ownership of everything you put into Crystal Studio. We need a minimal license to process and display it back to you — nothing more." },
 { t: "Engineering responsibility", b: "Crystal Studio does not replace professional engineering judgment. Any design used for construction, manufacturing, safety-critical systems, certification, or regulatory submission must be independently reviewed and approved by a licensed engineer qualified in the relevant jurisdiction." },
 { t: "Website and desktop products", b: "The Crystal Studio website provides AI-generated concepts, models, scripts, and workflow assistance only. Crystal Studio Desktop is a more advanced application with local project, file, automation, and CAD handoff capabilities. Neither product guarantees that an output is accurate, manufacturable, compliant, or fit for a particular purpose." },
 { t: "Output verification", b: "You are responsible for validating dimensions, materials, tolerances, loads, simulations, toolpaths, code, exports, and safety assumptions before relying on or distributing any output." },
 { t: "Agent behavior", b: "The agent is powerful but not infallible. High-risk actions (sending mail, deleting files, paying invoices) always require your confirmation." },
 { t: "Availability", b: "We target 99.9% uptime for hosted services. Desktop features, third-party CAD integrations, and AI providers may have separate availability limits." },
 { t: "Pricing & billing",b: "Prices in USD. We bill monthly in advance. Cancel anytime — you keep the rest of the period." },
 { t: "Liability", b: "Our aggregate liability is capped at the fees you paid in the preceding 12 months. Some jurisdictions may not allow this; those carve-outs apply." },
 { t: "Changes", b: "If we materially change these terms, we email every workspace owner 30 days before they take effect." },
];

export default function Terms() {
 return (
 <CoreforgePage>
 {(t) => (
 <section style={{ padding: "100px 0 120px" }}>
 <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 20 }}>TERMS OF USE</div>
 <h1 style={{ fontSize: "clamp(44px,6vw,80px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, margin: 0, fontStretch: "86%" }}>Terms of Use</h1>
 <p style={{ marginTop: 20, fontSize: 15, color: t.muted, lineHeight: 1.6 }}>Effective 2026-04-01 · v2.0 · plain-English version below</p>

 <div style={{ marginTop: 64, counterReset: "clause" }}>
 {clauses.map((c, i) => (
 <section key={c.t} style={{ padding: "32px 0", borderTop: `1px solid ${t.faint}` }}>
 <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 24, alignItems: "start" }}>
 <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-0.03em", color: COBALT, lineHeight: 0.9, fontStretch: "85%" }}>{String(i + 1).padStart(2, "0")}</div>
 <div>
 <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", margin: 0, marginBottom: 10 }}>{c.t}</h2>
 <p style={{ fontSize: 15.5, color: t.muted, lineHeight: 1.7, margin: 0 }}>{c.b}</p>
 </div>
 </div>
 </section>
 ))}
 </div>
 </div>
 </section>
 )}
 </CoreforgePage>
 );
}
