"use client";
import { useState } from "react";
import { CediumPage, COBALT } from "@/components/cedium-shell";

const categories = [
 { k: "essential", t: "Essential", d: "Keep you signed in, remember your workspace, and secure the session.", required: true, count: 3 },
 { k: "agent", t: "Agent memory", d: "Remember in-progress agent tasks across page reloads.", required: false, count: 2 },
 { k: "analytics", t: "Analytics", d: "Anonymized usage counts so we know which features to keep shipping.", required: false, count: 4 },
 { k: "ads", t: "Advertising", d: "We don't run ads. This row is here so you know we don't run ads.", required: false, count: 0 },
];

export default function CookieNotice() {
 const [prefs, setPrefs] = useState<Record<string, boolean>>({ essential: true, agent: true, analytics: false, ads: false });
 return (
 <CediumPage>
 {(t) => (
 <section style={{ padding: "100px 0 120px" }}>
 <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 20 }}>COOKIE NOTICE</div>
 <h1 style={{ fontSize: "clamp(40px,6vw,72px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, margin: 0, fontStretch: "86%" }}>What we store, why.</h1>
 <p style={{ marginTop: 20, fontSize: 16, color: t.muted, lineHeight: 1.65, maxWidth: 620 }}>
 We keep cookies to the minimum needed. You can turn off anything non-essential below — changes take effect immediately.
 </p>

 <div style={{ marginTop: 48, border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden", background: t.raised }}>
 {categories.map((c, i) => (
 <div key={c.k} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 24, alignItems: "center", padding: "24px 28px", borderTop: i > 0 ? `1px solid ${t.faint}` : "none" }}>
 <div>
 <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
 <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.015em" }}>{c.t}</span>
 <span style={{ fontSize: 10, color: t.muted, fontFamily: "var(--font-geist-mono),monospace" }}>{c.count} cookies</span>
 {c.required && <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", background: COBALT, padding: "2px 8px", borderRadius: 4, letterSpacing: "0.08em" }}>REQUIRED</span>}
 </div>
 <p style={{ fontSize: 13.5, color: t.muted, lineHeight: 1.55, margin: 0 }}>{c.d}</p>
 </div>
 <div />
 <button disabled={c.required} onClick={() => setPrefs((p) => ({ ...p, [c.k]: !p[c.k] }))} style={{ width: 48, height: 26, borderRadius: 999, border: "none", background: prefs[c.k] ? COBALT : t.faint, cursor: c.required ? "not-allowed" : "pointer", position: "relative", opacity: c.required ? 0.6 : 1, transition: "background 0.2s" }}>
 <span style={{ position: "absolute", top: 3, left: prefs[c.k] ? 25 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
 </button>
 </div>
 ))}
 </div>

 <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
 <button onClick={() => setPrefs({ essential: true, agent: true, analytics: true, ads: true })} style={{ height: 44, padding: "0 20px", background: COBALT, color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 8, border: "none", cursor: "pointer" }}>Accept all</button>
 <button onClick={() => setPrefs({ essential: true, agent: false, analytics: false, ads: false })} style={{ height: 44, padding: "0 20px", background: "transparent", color: t.fg, fontSize: 14, fontWeight: 700, borderRadius: 8, border: `1px solid ${t.faint}`, cursor: "pointer" }}>Reject non-essential</button>
 <button style={{ height: 44, padding: "0 20px", background: "transparent", color: t.muted, fontSize: 14, fontWeight: 700, borderRadius: 8, border: `1px solid ${t.faint}`, cursor: "pointer" }}>Save preferences</button>
 </div>
 </div>
 </section>
 )}
 </CediumPage>
 );
}
