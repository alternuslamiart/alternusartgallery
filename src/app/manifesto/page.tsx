"use client";
import { CediumPage, COBALT } from "@/components/cedium-shell";

const principles = [
 { n: "01", t: "Intent over interface.", d: "The user&apos;s goal matters. The buttons are an implementation detail. If the agent can do it, the user shouldn&apos;t have to." },
 { n: "02", t: "Memory is a right.", d: "Your workspace remembers what you did yesterday, last week, last year. That memory is yours. We don&apos;t mine it, sell it, or train on it." },
 { n: "03", t: "Cite, don&apos;t guess.", d: "When the agent pulls a fact, it shows the source. No hallucinations. No polite-sounding wrong answers." },
 { n: "04", t: "One agent, every surface.", d: "The same agent handles your mail, your files, your code, and your voice. Context is continuous. Nothing is re-explained." },
 { n: "05", t: "Small things, fast.", d: "Sub-200ms first token. Instant search. No loading spinners. If it&apos;s slow, it&apos;s broken." },
 { n: "06", t: "The browser is enough.", d: "No installs. No sync. No accounts-manager-for-your-accounts-manager. Log in, it&apos;s there." },
];

export default function Manifesto() {
 return (
 <CediumPage>
 {(t) => (
 <>
 <section style={{ padding: "120px 0 60px", borderBottom: `1px solid ${t.faint}` }}>
 <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 20 }}>§ MANIFESTO</div>
 <h1 style={{ fontSize: "clamp(56px,10vw,180px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.85, margin: 0, fontStretch: "78%" }}>
 What we<br/>believe in.
 </h1>
 </div>
 </section>

 <section style={{ padding: "0" }}>
 {principles.map((p, i) => (
 <div key={p.n} style={{ borderBottom: `1px solid ${t.faint}`, background: i % 2 ? t.surface : "transparent" }}>
 <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 32px" }}>
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
 <div className="lg:col-span-3">
 <div style={{ fontSize: 120, fontWeight: 900, letterSpacing: "-0.06em", color: COBALT, lineHeight: 1, fontStretch: "80%" }}>{p.n}</div>
 </div>
 <div className="lg:col-span-9">
 <h2 style={{ fontSize: "clamp(32px,5vw,60px)", fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1, margin: 0, marginBottom: 20, fontStretch: "88%" }} dangerouslySetInnerHTML={{ __html: p.t }} />
 <p style={{ fontSize: 17, color: t.muted, lineHeight: 1.65, margin: 0, maxWidth: 720 }} dangerouslySetInnerHTML={{ __html: p.d }} />
 </div>
 </div>
 </div>
 </div>
 ))}
 </section>
 </>
 )}
 </CediumPage>
 );
}
