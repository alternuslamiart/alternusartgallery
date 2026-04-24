"use client";
import { useState } from "react";
import Link from "next/link";
import { AlternusPage, COBALT } from "@/components/alternus-shell";

const tiers = [
  {
    n: "Free",
    pm: 0,
    py: 0,
    d: "For trying Alternus and running a single workspace.",
    cta: "Start free",
    feat: [
      "1 personal workspace",
      "Claude Haiku agent",
      "5 GB knowledge layer",
      "Mail · Files · Notes",
      "Community support",
    ],
  },
  {
    n: "Pro",
    pm: 24,
    py: 19,
    d: "For individuals who live in Alternus every day.",
    cta: "Upgrade to Pro",
    featured: true,
    feat: [
      "Unlimited workspaces",
      "Claude Opus 4.6 (default)",
      "100 GB knowledge layer",
      "Voice mode · Code Studio",
      "Agent SDK access",
      "Priority email support",
    ],
  },
  {
    n: "Team",
    pm: 48,
    py: 39,
    d: "For growing teams that want shared memory.",
    cta: "Start Team trial",
    feat: [
      "Everything in Pro",
      "SSO + SCIM provisioning",
      "Shared knowledge base",
      "Audit log export",
      "Role-based permissions",
      "Slack-channel support",
    ],
  },
];

const compare = [
  { cat: "Agent",
    rows: [
      { f: "Default model",                       v: ["Claude Haiku", "Claude Opus 4.6", "Claude Opus 4.6"] },
      { f: "Monthly agent runs",                  v: ["200",           "Unlimited",        "Unlimited"] },
      { f: "Parallel tool calls",                 v: ["—",             "✓",                "✓"] },
      { f: "Long-running background jobs",        v: ["—",             "✓",                "✓"] },
    ],
  },
  { cat: "Workspace",
    rows: [
      { f: "Workspaces",                          v: ["1",             "Unlimited",        "Unlimited"] },
      { f: "Knowledge layer",                     v: ["5 GB",          "100 GB",           "500 GB"] },
      { f: "Voice mode",                          v: ["—",             "✓",                "✓"] },
      { f: "Code Studio",                         v: ["Read-only",     "✓",                "✓"] },
      { f: "Shared knowledge across members",     v: ["—",             "—",                "✓"] },
    ],
  },
  { cat: "Admin & security",
    rows: [
      { f: "SSO / SCIM",                          v: ["—",             "—",                "✓"] },
      { f: "Audit logs",                          v: ["7 days",        "30 days",          "1 year · export"] },
      { f: "Role-based permissions",              v: ["—",             "—",                "✓"] },
      { f: "SOC 2 Type II report",                v: ["—",             "On request",       "Included"] },
    ],
  },
  { cat: "Support",
    rows: [
      { f: "Community forum",                     v: ["✓",             "✓",                "✓"] },
      { f: "Email support",                       v: ["—",             "Priority",         "Priority"] },
      { f: "Shared Slack channel",                v: ["—",             "—",                "✓"] },
      { f: "SLA",                                 v: ["—",             "—",                "99.9% uptime"] },
    ],
  },
];

const faq = [
  { q: "Can I cancel anytime?",          a: "Yes. Cancel in one click — you keep access until the end of the period you already paid for. No emails, no retention calls." },
  { q: "Do you offer annual billing?",   a: "Yes. Yearly plans are 20% cheaper than monthly. Toggle above the pricing cards to see yearly prices." },
  { q: "What about taxes and VAT?",      a: "Prices shown exclude VAT/sales tax. We collect it automatically based on your billing address at checkout." },
  { q: "What counts as an agent run?",   a: "One goal → one run, even if the agent chains multiple tool calls to finish it. Free plans get 200 runs/month; Pro and Team are unlimited." },
  { q: "Can I switch plans mid-cycle?",  a: "Yes. Upgrades are prorated and billed immediately; downgrades take effect at the next renewal. No penalty either way." },
  { q: "Do you offer student discounts?", a: "Yes — Pro is free for verified students. Email hello@alternus.ai from a .edu address for a code." },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <AlternusPage>
      {(t) => (
        <>
          {/* ── Hero ── */}
          <section style={{ padding: "120px 0 60px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: "50%", top: "-10%", transform: "translateX(-50%)", width: 900, height: 600, borderRadius: "50%", background: `radial-gradient(closest-side,${COBALT}25,transparent 70%)`, filter: "blur(40px)", pointerEvents: "none" }} />
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", textAlign: "center", position: "relative" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 22 }}>PRICING · v2.1</div>
              <h1 style={{ fontSize: "clamp(52px,8vw,128px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9, margin: 0, fontStretch: "82%" }}>
                Pay for the work.<br/>
                <span style={{ color: COBALT, fontStyle: "italic" }}>Not the seats.</span>
              </h1>
              <p style={{ marginTop: 28, fontSize: 18, color: t.muted, maxWidth: 620, margin: "28px auto 0", lineHeight: 1.55 }}>
                One workspace, one agent, one bill. Start free, scale when you&apos;re ready. No hidden tiers, no per-API-call surprises.
              </p>

              {/* Billing toggle */}
              <div style={{ marginTop: 48, display: "inline-flex", padding: 4, border: `1px solid ${t.faint}`, borderRadius: 999, background: t.raised }}>
                {[{ l: "Monthly", v: false }, { l: "Yearly", v: true }].map((o) => (
                  <button key={o.l} onClick={() => setYearly(o.v)} style={{ padding: "10px 22px", fontSize: 13, fontWeight: 700, borderRadius: 999, border: "none", cursor: "pointer", background: yearly === o.v ? COBALT : "transparent", color: yearly === o.v ? "#fff" : t.fg, letterSpacing: "-0.01em", transition: "all 0.15s", display: "inline-flex", alignItems: "center", gap: 8 }}>
                    {o.l}
                    {o.v && <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999, background: yearly === o.v ? "rgba(255,255,255,0.22)" : `${COBALT}22`, color: yearly === o.v ? "#fff" : COBALT, letterSpacing: "0.04em" }}>−20%</span>}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Tier cards ── */}
          <section style={{ padding: "40px 0 100px" }}>
            <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 32px" }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                {tiers.map((tier) => (
                  <div key={tier.n} style={{ position: "relative", padding: 32, border: `1px solid ${tier.featured ? COBALT : t.faint}`, borderRadius: 12, background: t.raised, boxShadow: tier.featured ? `12px 12px 0 0 ${COBALT}` : "none", display: "flex", flexDirection: "column" }}>
                    {tier.featured && (
                      <div style={{ position: "absolute", top: -12, left: 24, fontSize: 10, fontWeight: 800, color: "#fff", background: COBALT, padding: "4px 10px", borderRadius: 999, letterSpacing: "0.08em" }}>MOST POPULAR</div>
                    )}
                    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>{tier.n}</div>
                    <div style={{ fontSize: 13, color: t.muted, marginTop: 6, minHeight: 36 }}>{tier.d}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 28 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: t.muted }}>$</span>
                      <span style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-0.045em", fontStretch: "85%", lineHeight: 1 }}>{yearly ? tier.py : tier.pm}</span>
                      <span style={{ fontSize: 14, color: t.muted, marginLeft: 4 }}>/mo{yearly && tier.pm > 0 ? ", billed yearly" : ""}</span>
                    </div>
                    <Link href="/os" style={{ marginTop: 24, height: 46, display: "flex", alignItems: "center", justifyContent: "center", background: tier.featured ? COBALT : "transparent", color: tier.featured ? "#fff" : t.fg, fontSize: 14, fontWeight: 700, borderRadius: 8, border: `1px solid ${tier.featured ? COBALT : t.faint}`, textDecoration: "none", transition: "all 0.15s" }}>{tier.cta}</Link>
                    <div style={{ marginTop: 28, height: 1, background: t.faint }} />
                    <ul style={{ marginTop: 24, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                      {tier.feat.map((f) => (
                        <li key={f} style={{ display: "flex", gap: 12, fontSize: 14, color: t.fg, alignItems: "flex-start" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COBALT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}><path d="M20 6L9 17l-5-5"/></svg>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 40, textAlign: "center", fontSize: 12, color: t.muted }}>
                All prices in USD · Monthly billing cancels anytime · Student and non-profit discounts available.
              </div>
            </div>
          </section>

          {/* ── Feature comparison ── */}
          <section style={{ padding: "100px 0 100px", borderTop: `1px solid ${t.faint}`, background: t.surface }}>
            <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 32px" }}>
              <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 40 }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 14 }}>§ COMPARE</div>
                  <h2 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1, margin: 0, fontStretch: "88%" }}>Everything, side by side.</h2>
                </div>
                <p style={{ fontSize: 14, color: t.muted, maxWidth: 360, lineHeight: 1.5, margin: 0 }}>
                  The full feature matrix. If you need something not listed here, talk to sales.
                </p>
              </div>

              <div style={{ border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden", background: t.raised }}>
                {/* Header row */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "18px 28px", borderBottom: `1px solid ${t.faint}`, background: t.surface }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Feature</span>
                  {tiers.map((tier) => (
                    <div key={tier.n} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.01em", color: tier.featured ? COBALT : t.fg }}>{tier.n}</div>
                      <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>${yearly ? tier.py : tier.pm}/mo</div>
                    </div>
                  ))}
                </div>

                {/* Category sections */}
                {compare.map((section) => (
                  <div key={section.cat}>
                    <div style={{ padding: "14px 28px", borderTop: `1px solid ${t.faint}`, background: t.surface, fontSize: 10, fontWeight: 700, color: COBALT, letterSpacing: "0.14em", textTransform: "uppercase" }}>§ {section.cat}</div>
                    {section.rows.map((row, i) => (
                      <div key={row.f} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", alignItems: "center", padding: "16px 28px", borderTop: i > 0 ? `1px solid ${t.faint}` : "none" }}>
                        <span style={{ fontSize: 13.5, color: t.fg, fontWeight: 500 }}>{row.f}</span>
                        {row.v.map((val, j) => (
                          <div key={j} style={{ textAlign: "center", fontSize: 13, color: val === "✓" ? COBALT : val === "—" ? t.muted : t.fg, fontWeight: val === "✓" ? 700 : 500 }}>
                            {val === "✓" ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COBALT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}><path d="M20 6L9 17l-5-5"/></svg>
                            ) : val}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Enterprise band ── */}
          <section style={{ padding: "100px 0", borderTop: `1px solid ${t.faint}` }}>
            <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 32px" }}>
              <div style={{ padding: "48px 48px", border: `1px solid ${t.faint}`, borderRadius: 12, background: t.raised, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", boxShadow: `12px 12px 0 0 ${COBALT}` }} className="!grid-cols-1 md:!grid-cols-2">
                <div>
                  <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 14 }}>ENTERPRISE</div>
                  <h2 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1, margin: 0, marginBottom: 16, fontStretch: "88%" }}>
                    Running Alternus at scale?
                  </h2>
                  <p style={{ fontSize: 15.5, color: t.muted, lineHeight: 1.6, margin: 0, maxWidth: 480 }}>
                    Custom knowledge volume, dedicated throughput, SOC 2 artefacts on request, and a named account engineer.
                  </p>
                </div>
                <div>
                  <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {["Dedicated tenancy", "Custom data residency", "HIPAA BAA", "99.99% SLA", "Named engineer", "Quarterly reviews"].map((i) => (
                      <li key={i} style={{ display: "flex", gap: 10, fontSize: 13.5, color: t.fg, alignItems: "center" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: COBALT, flexShrink: 0 }} />
                        {i}
                      </li>
                    ))}
                  </ul>
                  <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
                    <Link href="/contact" style={{ height: 46, padding: "0 22px", background: COBALT, color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>Talk to sales →</Link>
                    <a href="mailto:sales@alternus.ai" style={{ height: 46, padding: "0 22px", background: "transparent", color: t.fg, fontSize: 14, fontWeight: 700, borderRadius: 8, border: `1px solid ${t.faint}`, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Email sales@</a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section style={{ padding: "100px 0", borderTop: `1px solid ${t.faint}` }}>
            <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 32px" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 16 }}>§ FAQ</div>
              <h2 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1, margin: 0, marginBottom: 40, fontStretch: "88%" }}>Questions about pricing.</h2>
              <div style={{ border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden" }}>
                {faq.map((f, i) => (
                  <div key={i} style={{ borderTop: i > 0 ? `1px solid ${t.faint}` : "none" }}>
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", padding: "22px 26px", background: openFaq === i ? `${COBALT}0A` : "transparent", border: "none", color: t.fg, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", transition: "background 0.2s" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 18 }}>
                        <span style={{ fontSize: 11, color: COBALT, fontFamily: "var(--font-geist-mono),monospace", fontWeight: 700 }}>0{i + 1}</span>
                        <span style={{ fontSize: 16.5, fontWeight: 700, letterSpacing: "-0.015em" }}>{f.q}</span>
                      </span>
                      <span style={{ fontSize: 20, color: COBALT, fontWeight: 300, transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                    </button>
                    {openFaq === i && (
                      <div style={{ padding: "0 26px 24px 64px", fontSize: 14.5, color: t.muted, lineHeight: 1.65 }}>{f.a}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Final CTA ── */}
          <section style={{ padding: "120px 0", background: COBALT, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.18) 1px,transparent 1px)", backgroundSize: "32px 32px", opacity: 0.5, pointerEvents: "none" }} />
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", position: "relative", textAlign: "center" }}>
              <h2 style={{ fontSize: "clamp(44px,8vw,120px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.88, color: "#fff", margin: 0, fontStretch: "84%" }}>
                Start free.<br/>
                <span style={{ fontStyle: "italic" }}>Upgrade when it pays for itself.</span>
              </h2>
              <div style={{ marginTop: 44, display: "inline-flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
                <Link href="/os" style={{ height: 52, padding: "0 28px", background: "#fff", color: COBALT, fontSize: 15, fontWeight: 800, borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10, boxShadow: "8px 8px 0 0 rgba(0,0,0,0.3)" }}>
                  Launch Alternus OS <span style={{ fontSize: 13 }}>↗</span>
                </Link>
                <Link href="/contact" style={{ height: 52, padding: "0 28px", background: "transparent", color: "#fff", fontSize: 15, fontWeight: 700, borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center", border: "1px solid rgba(255,255,255,0.4)" }}>
                  Talk to sales
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </AlternusPage>
  );
}
