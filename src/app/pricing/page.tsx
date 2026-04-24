"use client";
import { useState } from "react";
import Link from "next/link";
import { AlternusPage, COBALT } from "@/components/alternus-shell";

const tiers = [
  { n: "Free",  pm: 0, py: 0, d: "For trying Alternus",          cta: "Start free",      feat: ["1 workspace", "Claude Haiku", "5 GB knowledge layer", "Community support"] },
  { n: "Pro",   pm: 24, py: 19, d: "For individuals and teams",  cta: "Upgrade to Pro",  feat: ["Unlimited workspaces", "Claude Opus 4.6", "100 GB knowledge layer", "Voice + Code Studio", "Email support"], featured: true },
  { n: "Team",  pm: 48, py: 39, d: "For growing teams",          cta: "Start Team trial", feat: ["Everything in Pro", "SSO + SCIM", "Shared knowledge", "Audit log export", "Priority support"] },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <AlternusPage>
      {(t) => (
        <>
          <section style={{ padding: "100px 0 40px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", textAlign: "center" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 20 }}>PRICING</div>
              <h1 style={{ fontSize: "clamp(44px,7vw,96px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.92, margin: 0, fontStretch: "86%" }}>
                Simple pricing.<br/><span style={{ color: COBALT, fontStyle: "italic" }}>Cancel anytime.</span>
              </h1>

              <div style={{ marginTop: 40, display: "inline-flex", padding: 4, border: `1px solid ${t.faint}`, borderRadius: 999, background: t.raised }}>
                {[["Monthly", false], ["Yearly", true]].map(([l, v]) => (
                  <button key={l as string} onClick={() => setYearly(v as boolean)} style={{ padding: "8px 18px", fontSize: 13, fontWeight: 700, borderRadius: 999, border: "none", cursor: "pointer", background: yearly === v ? COBALT : "transparent", color: yearly === v ? "#fff" : t.fg }}>
                    {l as string}{v ? " · −20%" : ""}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section style={{ padding: "40px 0 80px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {tiers.map((tier) => (
                  <div key={tier.n} style={{ padding: 32, border: `1px solid ${tier.featured ? COBALT : t.faint}`, borderRadius: 12, background: tier.featured ? t.raised : t.raised, position: "relative", boxShadow: tier.featured ? `12px 12px 0 0 ${COBALT}` : "none" }}>
                    {tier.featured && <div style={{ position: "absolute", top: -12, left: 24, fontSize: 10, fontWeight: 800, color: "#fff", background: COBALT, padding: "4px 10px", borderRadius: 999, letterSpacing: "0.08em" }}>MOST POPULAR</div>}
                    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>{tier.n}</div>
                    <div style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>{tier.d}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 28 }}>
                      <span style={{ fontSize: 56, fontWeight: 900, letterSpacing: "-0.04em", fontStretch: "85%" }}>${yearly ? tier.py : tier.pm}</span>
                      <span style={{ fontSize: 14, color: t.muted }}>/mo</span>
                    </div>
                    <Link href="/os" style={{ marginTop: 24, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: tier.featured ? COBALT : "transparent", color: tier.featured ? "#fff" : t.fg, fontSize: 14, fontWeight: 700, borderRadius: 8, border: `1px solid ${tier.featured ? COBALT : t.faint}`, textDecoration: "none" }}>{tier.cta}</Link>
                    <ul style={{ marginTop: 28, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                      {tier.feat.map((f) => (
                        <li key={f} style={{ display: "flex", gap: 10, fontSize: 14, color: t.fg, alignItems: "flex-start" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COBALT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}><path d="M20 6L9 17l-5-5"/></svg>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 48, textAlign: "center", fontSize: 13, color: t.muted }}>
                Need SSO, audit logs, or a higher data limit? <a href="/contact" style={{ color: COBALT, textDecoration: "underline" }}>Talk to sales</a>.
              </div>
            </div>
          </section>
        </>
      )}
    </AlternusPage>
  );
}
