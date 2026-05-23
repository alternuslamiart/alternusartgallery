"use client";
import Link from "next/link";
import { CoreforgePage, COBALT } from "@/components/cedium-shell";

export default function Voice() {
 const bars = [5, 12, 8, 18, 22, 14, 28, 36, 22, 14, 9, 16, 24, 32, 40, 28, 20, 14, 8, 6, 12, 20, 30, 36, 44, 34, 22, 14, 10, 6];

 return (
 <CoreforgePage>
 {(t) => (
 <section style={{ padding: "0 0 120px" }}>
 {/* Voice hero with waveform */}
 <div style={{ padding: "120px 0 80px", background: `linear-gradient(180deg,${COBALT}18,transparent 80%)`, borderBottom: `1px solid ${t.faint}`, position: "relative", overflow: "hidden" }}>
 <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", textAlign: "center" }}>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 20 }}>WORKSPACE / VOICE</div>
 <h1 style={{ fontSize: "clamp(48px,9vw,140px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.88, margin: 0, fontStretch: "82%" }}>
 Hold the mic.<br/><span style={{ color: COBALT, fontStyle: "italic" }}>Say the thing.</span>
 </h1>

 {/* Waveform */}
 <div style={{ marginTop: 56, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, height: 80 }}>
 {bars.map((h, i) => (
 <div key={i} style={{ width: 5, height: `${h}%`, minHeight: 4, background: COBALT, borderRadius: 3, opacity: 0.3 + (Math.sin(i) + 1) * 0.35 }} />
 ))}
 </div>

 <div style={{ marginTop: 32, display: "inline-flex", alignItems: "center", gap: 12, padding: "12px 22px", border: `1px solid ${COBALT}40`, borderRadius: 999, background: `${COBALT}12` }}>
 <span style={{ width: 10, height: 10, borderRadius: "50%", background: COBALT, boxShadow: `0 0 0 4px ${COBALT}40`, animation: "pulse 1.4s infinite" }} />
 <span style={{ fontSize: 13, fontWeight: 600, color: COBALT, fontFamily: "var(--font-geist-mono),monospace" }}>&ldquo;Summarize my unread mail.&rdquo;</span>
 </div>
 </div>
 </div>

 <div style={{ maxWidth: 1100, margin: "80px auto 0", padding: "0 32px" }}>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {[
 { n: "01", t: "Real-time", d: "Sub-200ms first token. Interruptible. Full-duplex." },
 { n: "02", t: "Multilingual", d: "Dictate in 30+ languages. Auto-detects inflection." },
 { n: "03", t: "Private", d: "Audio is never stored. Transcripts live in your workspace only." },
 ].map((x) => (
 <div key={x.n} style={{ padding: "32px 28px", border: `1px solid ${t.faint}`, borderRadius: 12, background: t.raised }}>
 <div style={{ fontSize: 10, color: COBALT, fontFamily: "var(--font-geist-mono),monospace", fontWeight: 700, marginBottom: 14 }}>{x.n}</div>
 <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 10 }}>{x.t}</div>
 <p style={{ fontSize: 13.5, color: t.muted, lineHeight: 1.6, margin: 0 }}>{x.d}</p>
 </div>
 ))}
 </div>
 <div style={{ marginTop: 56, textAlign: "center" }}>
 <Link href="/main" style={{ height: 48, padding: "0 24px", background: COBALT, color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>Start talking →</Link>
 </div>
 </div>

 <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }`}</style>
 </section>
 )}
 </CoreforgePage>
 );
}
