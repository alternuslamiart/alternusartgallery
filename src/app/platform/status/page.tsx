"use client";
import { CediumPage, COBALT } from "@/components/cedium-shell";

const services = [
 { n: "Agent runtime", u: "100.00%", s: "operational" },
 { n: "File indexing", u: "99.98%", s: "operational" },
 { n: "Voice streaming", u: "99.95%", s: "operational" },
 { n: "Code Studio", u: "99.99%", s: "operational" },
 { n: "Mail relay", u: "99.92%", s: "degraded" },
 { n: "Knowledge DB", u: "100.00%", s: "operational" },
];

const bars = Array.from({ length: 90 }, (_, i) => (i === 42 || i === 66 ? "degraded" : "ok"));
const dotColor = { operational: "#22C55E", degraded: "#F59E0B", down: "#EF4444" } as const;

export default function Status() {
 const allGood = services.every((s) => s.s === "operational");
 return (
 <CediumPage>
 {(t) => (
 <>
 <section style={{ padding: "80px 0 40px" }}>
 <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 16 }}>SYSTEM STATUS</div>
 <div style={{ padding: "28px 32px", borderRadius: 12, background: allGood ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.08)", border: `1px solid ${allGood ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}`, display: "flex", alignItems: "center", gap: 16 }}>
 <div style={{ width: 12, height: 12, borderRadius: "50%", background: allGood ? "#22C55E" : "#F59E0B" }} />
 <div>
 <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>{allGood ? "All systems operational" : "Minor incident in progress"}</div>
 <div style={{ fontSize: 13, color: t.muted, marginTop: 2 }}>Last updated just now · Auto-refreshing every 60s</div>
 </div>
 </div>
 </div>
 </section>

 <section style={{ padding: "40px 0 120px" }}>
 <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden", background: t.raised }}>
 {services.map((svc, i) => (
 <div key={svc.n} style={{ padding: "24px 28px", borderTop: i > 0 ? `1px solid ${t.faint}` : "none" }}>
 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
 <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
 <span style={{ width: 10, height: 10, borderRadius: "50%", background: dotColor[svc.s as keyof typeof dotColor] }} />
 <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.015em" }}>{svc.n}</span>
 </div>
 <div style={{ fontSize: 12, color: t.muted, fontFamily: "var(--font-geist-mono),monospace" }}>{svc.u} uptime · 90d</div>
 </div>
 <div style={{ display: "flex", gap: 2, height: 24 }}>
 {bars.map((b, j) => (
 <div key={j} style={{ flex: 1, background: svc.s === "degraded" && j > 80 ? "#F59E0B" : b === "degraded" ? "#F59E0B" : "#22C55E", opacity: j < 3 ? 0.3 : 1, borderRadius: 2 }} />
 ))}
 </div>
 </div>
 ))}
 </div>
 </div>
 </section>
 </>
 )}
 </CediumPage>
 );
}
