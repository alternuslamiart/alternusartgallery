"use client";
import Link from "next/link";
import { CediumPage, COBALT } from "@/components/cedium-shell";

const cards = [
 { t: "Meeting notes", n: 128, c: "notes.json" },
 { t: "Research papers", n: 47, c: "papers.idx" },
 { t: "Customer tickets", n: 892, c: "tickets.db" },
 { t: "Design docs", n: 34, c: "specs.md" },
 { t: "Recordings", n: 62, c: "audio.vec" },
 { t: "Legal & policy", n: 21, c: "policy.pdf" },
];

export default function Knowledge() {
 return (
 <CediumPage>
 {(t) => (
 <>
 <section style={{ padding: "80px 0 40px", borderBottom: `1px solid ${t.faint}`, position: "relative", overflow: "hidden" }}>
 <div style={{ position: "absolute", right: "-10%", top: "-20%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(closest-side,${COBALT}30,transparent 70%)`, filter: "blur(40px)", pointerEvents: "none" }} />
 <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", position: "relative" }}>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 18 }}>WORKSPACE / KNOWLEDGE</div>
 <h1 style={{ fontSize: "clamp(44px,7vw,96px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.92, margin: 0, fontStretch: "86%" }}>
 Your private <span style={{ color: COBALT, fontStyle: "italic" }}>second brain.</span>
 </h1>
 <p style={{ marginTop: 28, fontSize: 17, color: t.muted, maxWidth: 560, lineHeight: 1.55 }}>
 Index everything you own. Your agent cites it inline. It never leaves your workspace, and it never trains anyone else&apos;s model.
 </p>
 </div>
 </section>

 <section style={{ padding: "80px 0 120px" }}>
 <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
 {cards.map((c) => (
 <div key={c.t} style={{ position: "relative", padding: "26px 24px", border: `1px solid ${t.faint}`, borderRadius: 12, background: t.raised, overflow: "hidden" }}>
 <div style={{ position: "absolute", top: -1, right: -1, width: 70, height: 70, background: `linear-gradient(135deg,${COBALT}40,transparent)`, borderBottomLeftRadius: 12 }} />
 <div style={{ fontSize: 10, color: t.muted, fontFamily: "var(--font-geist-mono),monospace", marginBottom: 20 }}>{c.c}</div>
 <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-0.04em", color: COBALT, marginBottom: 8, fontStretch: "85%" }}>{c.n}</div>
 <div style={{ fontSize: 14, fontWeight: 600, color: t.fg }}>{c.t}</div>
 <div style={{ marginTop: 16, height: 4, background: t.faint, borderRadius: 2, overflow: "hidden" }}>
 <div style={{ height: "100%", width: `${Math.min(100, c.n)}%`, background: COBALT }} />
 </div>
 </div>
 ))}
 </div>
 <div style={{ marginTop: 56, textAlign: "center" }}>
 <Link href="/main" style={{ height: 48, padding: "0 24px", background: COBALT, color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>Open Knowledge →</Link>
 </div>
 </div>
 </section>
 </>
 )}
 </CediumPage>
 );
}
