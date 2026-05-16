"use client";
import Link from "next/link";
import { CediumPage, COBALT } from "@/components/cedium-shell";

const snippet = [
 { n: 1, t: `import { Agent } from "@Cedium/agent";`, k: "kw" },
 { n: 2, t: `` },
 { n: 3, t: `// Agent has read every file in this repo.` , k: "c" },
 { n: 4, t: `const review = await Agent.review({` },
 { n: 5, t: ` branch: "feat/design-flow",` },
 { n: 6, t: ` depth: "full",` },
 { n: 7, t: `});` },
 { n: 8, t: `` },
 { n: 9, t: `console.log(review.risks);` },
];

export default function CodeStudio() {
 return (
 <CediumPage>
 {(t) => (
 <section style={{ padding: "80px 0 120px" }}>
 <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ maxWidth: 720, marginBottom: 48 }}>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 18 }}>WORKSPACE / CODE</div>
 <h1 style={{ fontSize: "clamp(44px,7vw,96px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.92, margin: 0, fontStretch: "86%" }}>
 A pair-programmer who has <span style={{ color: COBALT, fontStyle: "italic" }}>read everything.</span>
 </h1>
 <p style={{ marginTop: 24, fontSize: 17, color: t.muted, lineHeight: 1.55 }}>
 VS Code–class editor. The agent reads the whole project first, cites its sources, and never hallucinates an import.
 </p>
 </div>

 {/* Editor mockup */}
 <div style={{ border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden", background: "#2A2A2A", boxShadow: `16px 16px 0 0 ${COBALT}` }}>
 <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
 <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }}/>
 <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }}/>
 <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }}/>
 <span style={{ marginLeft: 16, fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-geist-mono),monospace" }}>src/review.ts</span>
 <div style={{ flex: 1 }} />
 <span style={{ fontSize: 10, color: COBALT, fontFamily: "var(--font-geist-mono),monospace" }}>● agent:ready</span>
 </div>
 <div style={{ display: "grid", gridTemplateColumns: "200px 1fr" }}>
 <div style={{ borderRight: "1px solid rgba(255,255,255,0.06)", padding: "14px 10px", fontFamily: "var(--font-geist-mono),monospace" }}>
 {[{ n: "src/", f: false }, { n: " review.ts", f: true }, { n: " agent.ts", f: false }, { n: " index.ts", f: false }, { n: "package.json", f: false }, { n: "tsconfig.json", f: false }].map((item, i) => (
 <div key={i} style={{ padding: "4px 10px", fontSize: 11.5, color: item.f ? "#fff" : "rgba(255,255,255,0.55)", background: item.f ? `${COBALT}22` : "transparent", borderRadius: 4 }}>{item.n}</div>
 ))}
 </div>
 <pre style={{ margin: 0, padding: "16px 16px", fontFamily: "var(--font-geist-mono),monospace", fontSize: 13, lineHeight: 1.7 }}>
 {snippet.map((row) => (
 <div key={row.n} style={{ display: "flex" }}>
 <span style={{ width: 32, color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>{row.n}</span>
 <span style={{ color: row.k === "c" ? "rgba(255,255,255,0.35)" : "#E8EBF3" }} dangerouslySetInnerHTML={{ __html: row.t
 .replace(/(import|from|const|await|new|console)/g, `<span style="color:${COBALT}">$1</span>`)
 .replace(/("[^"]*")/g, `<span style="color:#8FD694">$1</span>`)
 }}/>
 </div>
 ))}
 </pre>
 </div>
 <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px", background: "rgba(66,132,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
 <div style={{ width: 22, height: 22, background: COBALT, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 800 }}>AI</div>
 <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>Line 5: <strong style={{ color: "#fff" }}>branch</strong> is already merged into main — did you mean <code style={{ color: COBALT }}>&ldquo;feat/design-flow-v2&rdquo;</code>?</span>
 </div>
 </div>

 <div style={{ marginTop: 48, textAlign: "center" }}>
 <Link href="/main" style={{ height: 48, padding: "0 24px", background: COBALT, color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>Open Code Studio →</Link>
 </div>
 </div>
 </section>
 )}
 </CediumPage>
 );
}
