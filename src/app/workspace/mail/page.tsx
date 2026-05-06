"use client";
import Link from "next/link";
import { CerevixPage, COBALT } from "@/components/cerevix-shell";

export default function Mail() {
  return (
    <CerevixPage>
      {(t) => (
        <section style={{ padding: "80px 0 120px" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 18 }}>WORKSPACE / MAIL</div>
                <h1 style={{ fontSize: "clamp(44px,7vw,96px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.92, margin: 0, fontStretch: "86%" }}>
                  Inbox that<br/><span style={{ color: COBALT, fontStyle: "italic" }}>answers itself.</span>
                </h1>
                <p style={{ marginTop: 28, fontSize: 17, color: t.muted, lineHeight: 1.55, maxWidth: 480 }}>
                  Compose, thread, label, send — or just describe the email. The agent drafts, re-reads the thread, and checks tone.
                </p>
                <ul style={{ marginTop: 32, padding: 0, listStyle: "none", display: "grid", gap: 14 }}>
                  {["Natural-language drafting with thread context", "Smart filters that organize themselves", "Voice-to-send from any input", "Summaries before you open the thread"].map((l) => (
                    <li key={l} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ width: 18, height: 18, borderRadius: "50%", background: COBALT, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      </span>
                      <span style={{ fontSize: 14.5, color: t.fg, lineHeight: 1.5 }}>{l}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/main" style={{ marginTop: 36, height: 48, padding: "0 24px", background: COBALT, color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>Open in OS →</Link>
              </div>

              {/* Mail mockup */}
              <div style={{ border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden", boxShadow: `16px 16px 0 0 ${COBALT}`, background: t.raised }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t.faint}`, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#FF5F57" }}/>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#FEBC2E" }}/>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#28C840" }}/>
                  <span style={{ marginLeft: 16, fontSize: 12, fontWeight: 600 }}>Mail — inbox</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "200px 1fr" }}>
                  <div style={{ borderRight: `1px solid ${t.faint}`, padding: 10 }}>
                    {["Inbox", "Sent", "Drafts", "Q2 Launch", "Clients"].map((l, i) => (
                      <div key={l} style={{ padding: "8px 10px", fontSize: 13, fontWeight: i === 0 ? 700 : 500, background: i === 0 ? `${COBALT}18` : "transparent", color: i === 0 ? COBALT : t.fg, borderRadius: 6, marginBottom: 2 }}>{l}</div>
                    ))}
                  </div>
                  <div>
                    {[
                      { from: "Agent draft", sub: "Q2 launch announcement", p: "Team — here's the draft you asked for, with thread context pulled from…", ai: true },
                      { from: "Maya · design", sub: "Re: onboarding flow", p: "Final spec attached. Can you review and merge before Friday?" },
                      { from: "Stripe", sub: "Invoice #A-2201 paid", p: "Thanks — your payment of $2,400 has been received." },
                    ].map((m, i) => (
                      <div key={i} style={{ padding: "14px 18px", borderTop: i > 0 ? `1px solid ${t.faint}` : "none", background: m.ai ? `${COBALT}10` : "transparent" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: m.ai ? COBALT : t.fg }}>{m.from}</span>
                          {m.ai && <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", background: COBALT, padding: "1px 6px", borderRadius: 4 }}>AI</span>}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{m.sub}</div>
                        <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.5 }}>{m.p}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </CerevixPage>
  );
}
