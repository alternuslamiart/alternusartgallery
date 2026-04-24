"use client";
import { useState } from "react";
import { AlternusPage, COBALT } from "@/components/alternus-shell";

export default function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <AlternusPage>
      {(t) => (
        <section style={{ padding: "120px 0 120px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* L: heading + contacts list */}
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 20 }}>CONTACT</div>
                <h1 style={{ fontSize: "clamp(44px,7vw,96px)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 0.9, margin: 0, fontStretch: "84%" }}>
                  Let&apos;s<br/><span style={{ color: COBALT, fontStyle: "italic" }}>talk.</span>
                </h1>
                <p style={{ marginTop: 28, fontSize: 16, color: t.muted, lineHeight: 1.6, maxWidth: 440 }}>
                  For anything else — sales, partnerships, security disclosures — pick the right inbox below.
                </p>
                <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 0, border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden" }}>
                  {[
                    { l: "General",  e: "hello@alternus.ai" },
                    { l: "Sales",    e: "sales@alternus.ai" },
                    { l: "Security", e: "security@alternus.ai" },
                    { l: "Press",    e: "press@alternus.ai" },
                  ].map((c, i, a) => (
                    <a key={c.l} href={`mailto:${c.e}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderTop: i > 0 ? `1px solid ${t.faint}` : "none", textDecoration: "none", color: t.fg }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: t.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{c.l}</span>
                      <span style={{ fontSize: 14, color: COBALT, fontFamily: "var(--font-geist-mono),monospace" }}>{c.e}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* R: form */}
              <div>
                <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ border: `1px solid ${t.faint}`, borderRadius: 12, padding: 32, background: t.raised, boxShadow: `12px 12px 0 0 ${COBALT}` }}>
                  {sent ? (
                    <div style={{ padding: "40px 20px", textAlign: "center" }}>
                      <div style={{ width: 56, height: 56, borderRadius: "50%", background: COBALT, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Message received.</div>
                      <p style={{ fontSize: 14, color: t.muted, marginTop: 8 }}>We&apos;ll reply within 24 hours.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                      {[{ l: "Name", t: "text" }, { l: "Email", t: "email" }, { l: "Company (optional)", t: "text" }].map((f) => (
                        <label key={f.l} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <span style={{ fontSize: 11, color: t.muted, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>{f.l}</span>
                          <input required={!f.l.includes("optional")} type={f.t} style={{ height: 44, padding: "0 14px", border: `1px solid ${t.faint}`, borderRadius: 8, background: t.surface, color: t.fg, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
                        </label>
                      ))}
                      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ fontSize: 11, color: t.muted, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>Message</span>
                        <textarea required rows={5} style={{ padding: "12px 14px", border: `1px solid ${t.faint}`, borderRadius: 8, background: t.surface, color: t.fg, fontSize: 14, outline: "none", fontFamily: "inherit", resize: "vertical" }} />
                      </label>
                      <button type="submit" style={{ height: 48, padding: "0 22px", background: COBALT, color: "#fff", fontSize: 14, fontWeight: 800, borderRadius: 8, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                        Send message →
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      )}
    </AlternusPage>
  );
}
