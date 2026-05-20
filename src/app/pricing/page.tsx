"use client";

import { useState } from "react";
import Link from "next/link";
import { CediumPage, COBALT } from "@/components/cedium-shell";

type PricingTier = {
 n: string;
 pm: number;
 py: number;
 yearlyUnit?: "/mo" | "/yr";
 yearlyNote?: string;
 d: string;
 cta: string;
 featured?: boolean;
 feat: string[];
};

const tiers: PricingTier[] = [
 {
 n: "Basic Plan",
 pm: 10,
 py: 5,
 d: "For starting with Cedium and running a single workspace.",
 cta: "Start Basic",
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
 d: "For individuals who live in Cedium every day.",
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
 {
 n: "Studio",
 pm: 120,
 py: 100,
 yearlyUnit: "/yr",
 yearlyNote: "billed yearly",
 d: "For game and movie creators building with code and Unity.",
 cta: "Upgrade to Studio",
 feat: [
 "5x / 20x code capacity",
 "Unity for games",
 "Movie pipeline support",
 "Game + film asset workflows",
 "Build and prototype tools",
 "Priority studio support",
 ],
 },
];

const getBillingUnit = (tier: PricingTier, yearly: boolean) => (yearly && tier.yearlyUnit ? tier.yearlyUnit : "/mo");

const getBillingNote = (tier: PricingTier, yearly: boolean) => {
 if (!yearly || tier.pm === 0) {
 return "";
 }

 return tier.yearlyNote ?? "billed yearly";
};

const compare = [
 {
 cat: "Agent",
 rows: [
 { f: "Default model", v: ["Claude Haiku", "Claude Opus 4.6", "Claude Opus 4.6", "Claude Opus 4.6 + Unity"] },
 { f: "Monthly agent runs", v: ["200", "Unlimited", "Unlimited", "Unlimited"] },
 { f: "Parallel tool calls", v: ["-", "Yes", "Yes", "Yes"] },
 { f: "Long-running background jobs", v: ["-", "Yes", "Yes", "Yes"] },
 { f: "Code capacity", v: ["1x", "1x", "Team scale", "5x / 20x"] },
 ],
 },
 {
 cat: "Workspace",
 rows: [
 { f: "Workspaces", v: ["1", "Unlimited", "Unlimited", "Unlimited"] },
 { f: "Knowledge layer", v: ["5 GB", "100 GB", "500 GB", "1 TB"] },
 { f: "Voice mode", v: ["-", "Yes", "Yes", "Yes"] },
 { f: "Code Studio", v: ["Read-only", "Yes", "Yes", "5x / 20x"] },
 { f: "Unity game and movie tools", v: ["-", "-", "-", "Yes"] },
 { f: "Shared knowledge across members", v: ["-", "-", "Yes", "Yes"] },
 ],
 },
 {
 cat: "Admin & security",
 rows: [
 { f: "SSO / SCIM", v: ["-", "-", "Yes", "Optional"] },
 { f: "Audit logs", v: ["7 days", "30 days", "1 year · export", "1 year · export"] },
 { f: "Role-based permissions", v: ["-", "-", "Yes", "Yes"] },
 { f: "SOC 2 Type II report", v: ["-", "On request", "Included", "Included"] },
 ],
 },
 {
 cat: "Support",
 rows: [
 { f: "Community forum", v: ["Yes", "Yes", "Yes", "Yes"] },
 { f: "Email support", v: ["-", "Priority", "Priority", "Priority"] },
 { f: "Shared Slack channel", v: ["-", "-", "Yes", "Yes"] },
 { f: "SLA", v: ["-", "-", "99.9% uptime", "99.9% uptime"] },
 ],
 },
];

const faq = [
 {
 q: "Can I cancel anytime?",
 a: "Yes. Cancel in one click and keep access until the end of the period you already paid for.",
 },
 {
 q: "Do you offer annual billing?",
 a: "Yes. Toggle above the pricing cards to see yearly prices and annual billing details.",
 },
 {
 q: "What about taxes and VAT?",
 a: "Prices shown exclude VAT or sales tax. We collect it automatically based on your billing address at checkout.",
 },
 {
 q: "What counts as an agent run?",
 a: "One goal to one run, even if the agent chains multiple tool calls to finish it. Basic Plan gets 200 runs per month; Pro, Team, and Studio are unlimited.",
 },
 {
 q: "Can I switch plans mid-cycle?",
 a: "Yes. Upgrades are prorated and billed immediately; downgrades take effect at the next renewal.",
 },
 {
 q: "Do you offer student discounts?",
 a: "Yes. Pro is free for verified students. Email hello@Cedium.ai from a .edu address for a code.",
 },
];

export default function Pricing() {
 const [yearly, setYearly] = useState(true);
 const [openFaq, setOpenFaq] = useState<number | null>(0);
 const [checkoutTier, setCheckoutTier] = useState<PricingTier | null>(null);
 const [paymentStatus, setPaymentStatus] = useState("");

 const openCheckout = (tier: PricingTier) => {
 setCheckoutTier(tier);
 setPaymentStatus("");
 };

 return (
 <CediumPage>
 {(t) => (
 <>
 <section style={{ padding: "120px 0 60px", position: "relative", overflow: "hidden" }}>
 <div
 style={{
 position: "absolute",
 left: "50%",
 top: "-10%",
 transform: "translateX(-50%)",
 width: 900,
 height: 600,
 borderRadius: "50%",
 background: `radial-gradient(closest-side,${COBALT}25,transparent 70%)`,
 filter: "blur(40px)",
 pointerEvents: "none",
 }}
 />
 <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", textAlign: "center", position: "relative" }}>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 22 }}>
 PRICING · v2.1
 </div>
 <h1
 style={{
 fontSize: "clamp(52px,8vw,128px)",
 fontWeight: 900,
 letterSpacing: "-0.05em",
 lineHeight: 0.9,
 margin: 0,
 fontStretch: "82%",
 }}
 >
 Pay for the work.
 <br />
 <span style={{ color: COBALT, fontStyle: "italic" }}>Not the seats.</span>
 </h1>
 <p style={{ margin: "28px auto 0", fontSize: 18, color: t.muted, maxWidth: 620, lineHeight: 1.55 }}>
 One workspace, one agent, one bill. Start with Basic, scale when you&apos;re ready. No hidden tiers, no per-API-call surprises.
 </p>

 <div
 style={{
 marginTop: 48,
 display: "inline-flex",
 padding: 4,
 border: `1px solid ${t.faint}`,
 borderRadius: 999,
 background: t.raised,
 }}
 >
 {[{ l: "Monthly", v: false }, { l: "Yearly", v: true }].map((o) => (
 <button
 key={o.l}
 onClick={() => setYearly(o.v)}
 style={{
 padding: "10px 22px",
 fontSize: 13,
 fontWeight: 700,
 borderRadius: 999,
 border: "none",
 cursor: "pointer",
 background: yearly === o.v ? COBALT : "transparent",
 color: yearly === o.v ? "#fff" : t.fg,
 letterSpacing: "-0.01em",
 transition: "all 0.15s",
 display: "inline-flex",
 alignItems: "center",
 gap: 8,
 }}
 >
 {o.l}
 {o.v ? (
 <span
 style={{
 fontSize: 10,
 fontWeight: 800,
 padding: "2px 7px",
 borderRadius: 999,
 background: yearly === o.v ? "rgba(255,255,255,0.22)" : `${COBALT}22`,
 color: yearly === o.v ? "#fff" : COBALT,
 letterSpacing: "0.04em",
 }}
 >
 SAVE
 </span>
 ) : null}
 </button>
 ))}
 </div>
 </div>
 </section>

 <section style={{ padding: "40px 0 100px" }}>
 <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 32px" }}>
 <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-4">
 {tiers.map((tier) => (
 <div
 key={tier.n}
 style={{
 position: "relative",
 padding: 32,
 border: `1px solid ${tier.featured ? COBALT : t.faint}`,
 borderRadius: 12,
 background: t.raised,
 boxShadow: tier.featured ? `12px 12px 0 0 ${COBALT}` : "none",
 display: "flex",
 flexDirection: "column",
 }}
 >
 {tier.featured ? (
 <div
 style={{
 position: "absolute",
 top: -12,
 left: 24,
 fontSize: 10,
 fontWeight: 800,
 color: "#fff",
 background: COBALT,
 padding: "4px 10px",
 borderRadius: 999,
 letterSpacing: "0.08em",
 }}
 >
 MOST POPULAR
 </div>
 ) : null}
 <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>{tier.n}</div>
 <div style={{ fontSize: 13, color: t.muted, marginTop: 6, minHeight: 36 }}>{tier.d}</div>
 <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 28 }}>
 <span style={{ fontSize: 20, fontWeight: 700, color: t.muted }}>$</span>
 <span style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-0.045em", fontStretch: "85%", lineHeight: 1 }}>
 {yearly ? tier.py : tier.pm}
 </span>
 <span style={{ fontSize: 14, color: t.muted, marginLeft: 4 }}>
 {getBillingUnit(tier, yearly)}
 {getBillingNote(tier, yearly) ? `, ${getBillingNote(tier, yearly)}` : ""}
 </span>
 </div>
 {tier.pm === 0 ? (
 <Link
 href="/main"
 style={{
 marginTop: 24,
 height: 46,
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 background: "transparent",
 color: t.fg,
 fontSize: 14,
 fontWeight: 700,
 borderRadius: 8,
 border: `1px solid ${t.faint}`,
 textDecoration: "none",
 transition: "all 0.15s",
 }}
 >
 {tier.cta}
 </Link>
 ) : (
 <button
 type="button"
 onClick={() => openCheckout(tier)}
 style={{
 marginTop: 24,
 height: 46,
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 background: tier.featured ? COBALT : "transparent",
 color: tier.featured ? "#fff" : t.fg,
 fontSize: 14,
 fontWeight: 700,
 borderRadius: 8,
 border: `1px solid ${tier.featured ? COBALT : t.faint}`,
 transition: "all 0.15s",
 cursor: "pointer",
 fontFamily: "inherit",
 width: "100%",
 }}
 >
 {tier.cta}
 </button>
 )}
 <div style={{ marginTop: 28, height: 1, background: t.faint }} />
 <ul style={{ marginTop: 24, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
 {tier.feat.map((f) => (
 <li key={f} style={{ display: "flex", gap: 12, fontSize: 14, color: t.fg, alignItems: "flex-start" }}>
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COBALT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
 <path d="M20 6L9 17l-5-5" />
 </svg>
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

 <section style={{ padding: "100px 0 100px", borderTop: `1px solid ${t.faint}`, background: t.surface }}>
 <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 40 }}>
 <div>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 14 }}>COMPARE</div>
 <h2 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1, margin: 0, fontStretch: "88%" }}>
 Everything, side by side.
 </h2>
 </div>
 <p style={{ fontSize: 14, color: t.muted, maxWidth: 360, lineHeight: 1.5, margin: 0 }}>
 The full feature matrix. If you need something not listed here, talk to sales.
 </p>
 </div>

 <div style={{ overflowX: "auto" }}>
 <div style={{ minWidth: 900, border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden", background: t.raised }}>
 <div style={{ display: "grid", gridTemplateColumns: `2fr repeat(${tiers.length}, 1fr)`, padding: "18px 28px", borderBottom: `1px solid ${t.faint}`, background: t.surface }}>
 <span style={{ fontSize: 11, fontWeight: 700, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Feature</span>
 {tiers.map((tier) => (
 <div key={tier.n} style={{ textAlign: "center" }}>
 <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.01em", color: tier.featured ? COBALT : t.fg }}>{tier.n}</div>
 <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>${yearly ? tier.py : tier.pm}{getBillingUnit(tier, yearly)}</div>
 </div>
 ))}
 </div>

 {compare.map((section) => (
 <div key={section.cat}>
 <div style={{ padding: "14px 28px", borderTop: `1px solid ${t.faint}`, background: t.surface, fontSize: 10, fontWeight: 700, color: COBALT, letterSpacing: "0.14em", textTransform: "uppercase" }}>
 {section.cat}
 </div>
 {section.rows.map((row, i) => (
 <div key={row.f} style={{ display: "grid", gridTemplateColumns: `2fr repeat(${tiers.length}, 1fr)`, alignItems: "center", padding: "16px 28px", borderTop: i > 0 ? `1px solid ${t.faint}` : "none" }}>
 <span style={{ fontSize: 13.5, color: t.fg, fontWeight: 500 }}>{row.f}</span>
 {row.v.map((val, j) => (
 <div key={j} style={{ textAlign: "center", fontSize: 13, color: val === "Yes" ? COBALT : val === "-" ? t.muted : t.fg, fontWeight: val === "Yes" ? 700 : 500 }}>
 {val === "Yes" ? (
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COBALT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
 <path d="M20 6L9 17l-5-5" />
 </svg>
 ) : (
 val
 )}
 </div>
 ))}
 </div>
 ))}
 </div>
 ))}
 </div>
 </div>
 </div>
 </section>

 <section style={{ padding: "100px 0", borderTop: `1px solid ${t.faint}` }}>
 <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ padding: "48px 48px", border: `1px solid ${t.faint}`, borderRadius: 12, background: t.raised, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", boxShadow: `12px 12px 0 0 ${COBALT}` }} className="!grid-cols-1 md:!grid-cols-2">
 <div>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 14 }}>ENTERPRISE</div>
 <h2 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1, margin: 0, marginBottom: 16, fontStretch: "88%" }}>
 Running Cedium at scale?
 </h2>
 <p style={{ fontSize: 15.5, color: t.muted, lineHeight: 1.6, margin: 0, maxWidth: 480 }}>
 Custom knowledge volume, dedicated throughput, SOC 2 artifacts on request, and a named account engineer.
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
 <Link href="/contact" style={{ height: 46, padding: "0 22px", background: COBALT, color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
 Talk to sales →
 </Link>
 <a href="mailto:sales@Cedium.ai" style={{ height: 46, padding: "0 22px", background: "transparent", color: t.fg, fontSize: 14, fontWeight: 700, borderRadius: 8, border: `1px solid ${t.faint}`, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
 Email sales@
 </a>
 </div>
 </div>
 </div>
 </div>
 </section>

 <section style={{ padding: "100px 0", borderTop: `1px solid ${t.faint}` }}>
 <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 16 }}>FAQ</div>
 <h2 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1, margin: 0, marginBottom: 40, fontStretch: "88%" }}>
 Questions about pricing.
 </h2>
 <div style={{ border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden" }}>
 {faq.map((f, i) => (
 <div key={i} style={{ borderTop: i > 0 ? `1px solid ${t.faint}` : "none" }}>
 <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", padding: "22px 26px", background: openFaq === i ? `${COBALT}0A` : "transparent", border: "none", color: t.fg, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", transition: "background 0.2s" }}>
 <span style={{ display: "flex", alignItems: "center", gap: 18 }}>
 <span style={{ fontSize: 11, color: COBALT, fontFamily: "var(--font-geist-mono),monospace", fontWeight: 700 }}>
 0{i + 1}
 </span>
 <span style={{ fontSize: 16.5, fontWeight: 700, letterSpacing: "-0.015em" }}>{f.q}</span>
 </span>
 <span style={{ fontSize: 20, color: COBALT, fontWeight: 300, transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0)" }}>
 +
 </span>
 </button>
 {openFaq === i ? (
 <div style={{ padding: "0 26px 24px 64px", fontSize: 14.5, color: t.muted, lineHeight: 1.65 }}>{f.a}</div>
 ) : null}
 </div>
 ))}
 </div>
 </div>
 </section>

 <section style={{ padding: "120px 0", background: t.bg, position: "relative" }}>
 <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ padding: "0 20px" }}>
 <div style={{ maxWidth: 980, margin: "0 auto", position: "relative", overflow: "hidden", borderRadius: 34, background: "linear-gradient(180deg,#4B87FF 0%, #2E69E2 100%)", padding: "70px 32px", textAlign: "center", boxShadow: "0 34px 90px rgba(42,103,255,0.18), 0 0 140px rgba(66,132,255,0.18)" }}>
 <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.16) 1px,transparent 1px)", backgroundSize: "32px 32px", opacity: 0.38, pointerEvents: "none" }} />
 <div style={{ position: "relative", maxWidth: 760, margin: "0 auto" }}>
 <div style={{ marginBottom: 18, fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(15,23,42,0.72)" }}>
 Section 06 / Begin
 </div>
 <h2 style={{ fontSize: "clamp(44px,7vw,92px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9, color: "#fff", margin: 0, fontStretch: "84%" }}>
 Start with Basic.
 <br />
 <span style={{ fontStyle: "italic" }}>Upgrade when it pays for itself.</span>
 </h2>
 <p style={{ margin: "26px auto 0", maxWidth: 560, fontSize: 18, lineHeight: 1.7, color: "rgba(255,255,255,0.84)" }}>
 Cedium starts with Basic. Move into larger plans only when the workflow starts returning real value.
 </p>
 <div style={{ marginTop: 36, display: "inline-flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
 <Link href="/main" style={{ height: 48, padding: "0 24px", background: "#fff", color: COBALT, fontSize: 15, fontWeight: 800, borderRadius: 18, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10, boxShadow: "0 16px 28px rgba(18,46,120,0.18)" }}>
 Launch Cedium OS <span style={{ fontSize: 13 }}>↗</span>
 </Link>
 <Link href="/contact" style={{ height: 48, padding: "0 24px", background: "transparent", color: "#fff", fontSize: 15, fontWeight: 700, borderRadius: 18, textDecoration: "none", display: "inline-flex", alignItems: "center", border: "1px solid rgba(255,255,255,0.28)" }}>
 Talk to sales
 </Link>
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>

 {checkoutTier ? (
 <div
 role="dialog"
 aria-modal="true"
 aria-label={`${checkoutTier.n} payment frame`}
 onClick={() => setCheckoutTier(null)}
 style={{
 position: "fixed",
 inset: 0,
 zIndex: 80,
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 padding: 24,
 background: "rgba(15,23,42,0.42)",
 backdropFilter: "blur(12px)",
 }}
 >
 <div
 onClick={(event) => event.stopPropagation()}
 style={{
 width: "min(940px, 100%)",
 maxHeight: "calc(100vh - 48px)",
 overflowY: "auto",
 borderRadius: 28,
 border: `1px solid ${t.faint}`,
 background: t.raised,
 boxShadow: "0 34px 120px rgba(15,23,42,0.28)",
 position: "relative",
 }}
 >
 <div
 style={{
 display: "flex",
 alignItems: "center",
 justifyContent: "space-between",
 gap: 18,
 padding: "24px 84px 24px 28px",
 borderBottom: `1px solid ${t.faint}`,
 }}
 >
 <div>
 <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", color: COBALT, textTransform: "uppercase" }}>
 Secure checkout
 </div>
 <h2 style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", color: t.fg }}>
 {checkoutTier.cta}
 </h2>
 </div>
 <button
 type="button"
 onClick={() => setCheckoutTier(null)}
 aria-label="Close payment frame"
 style={{
 position: "absolute",
 top: 20,
 right: 20,
 height: 44,
 width: 44,
 borderRadius: 14,
 border: `1px solid ${t.faint}`,
 background: t.isDark ? "rgba(255,255,255,0.08)" : "#F8FAFC",
 color: t.fg,
 cursor: "pointer",
 boxShadow: t.isDark ? "inset 0 1px 0 rgba(255,255,255,0.08)" : "0 8px 18px rgba(15,23,42,0.06)",
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 transition: "background 0.18s ease, transform 0.18s ease",
 }}
 >
 <span
 aria-hidden="true"
 style={{
 position: "absolute",
 width: "42%",
 height: 2,
 borderRadius: 999,
 background: t.fg,
 transform: "rotate(45deg)",
 }}
 />
 <span
 aria-hidden="true"
 style={{
 position: "absolute",
 width: "42%",
 height: 2,
 borderRadius: 999,
 background: t.fg,
 transform: "rotate(-45deg)",
 }}
 />
 </button>
 </div>

 <div className="grid grid-cols-1 gap-0 md:grid-cols-[0.9fr_1.1fr]">
 <aside style={{ padding: 26, borderRight: `1px solid ${t.faint}`, background: t.surface }}>
 <div style={{ border: `1px solid ${t.faint}`, borderRadius: 20, padding: 22, background: t.raised }}>
 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 }}>
 <div>
 <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em", color: t.fg }}>{checkoutTier.n}</div>
 <p style={{ margin: "8px 0 0", fontSize: 13, color: t.muted, lineHeight: 1.55 }}>{checkoutTier.d}</p>
 </div>
 <span style={{ borderRadius: 999, padding: "6px 10px", background: `${COBALT}18`, color: COBALT, fontSize: 11, fontWeight: 800 }}>
 {yearly ? "Yearly" : "Monthly"}
 </span>
 </div>
 <div style={{ marginTop: 28, display: "flex", alignItems: "baseline", gap: 5 }}>
 <span style={{ fontSize: 16, fontWeight: 800, color: t.muted }}>$</span>
 <span style={{ fontSize: 56, fontWeight: 900, letterSpacing: "-0.05em", color: t.fg }}>
 {yearly ? checkoutTier.py : checkoutTier.pm}
 </span>
 <span style={{ fontSize: 13, color: t.muted }}>
 {getBillingUnit(checkoutTier, yearly)}
 {getBillingNote(checkoutTier, yearly) ? `, ${getBillingNote(checkoutTier, yearly)}` : ""}
 </span>
 </div>
 <div style={{ marginTop: 18, height: 1, background: t.faint }} />
 <ul style={{ margin: "18px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
 {checkoutTier.feat.slice(0, 4).map((feature) => (
 <li key={feature} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13, color: t.fg }}>
 <span style={{ height: 7, width: 7, borderRadius: "50%", background: COBALT, flexShrink: 0 }} />
 {feature}
 </li>
 ))}
 </ul>
 </div>
 <p style={{ margin: "18px 0 0", fontSize: 12, color: t.muted, lineHeight: 1.6 }}>
 {checkoutTier.n === "Team"
 ? "Team trial starts after payment method verification. You can cancel before billing begins."
 : `Your ${checkoutTier.n} access starts immediately after checkout confirmation.`}
 </p>
 </aside>

 <form
 onSubmit={(event) => {
 event.preventDefault();
 setPaymentStatus("Payment frame submitted. Connect Stripe or another gateway to process live charges.");
 }}
 style={{ padding: 26 }}
 >
 <div style={{ display: "grid", gap: 14 }}>
 <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 800, color: t.fg }}>
 Email
 <input
 required
 type="email"
 placeholder="you@company.com"
 style={{ height: 46, borderRadius: 12, border: `1px solid ${t.faint}`, background: t.surface, color: t.fg, padding: "0 14px", outline: "none" }}
 />
 </label>
 <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 800, color: t.fg }}>
 Card number
 <input
 required
 inputMode="numeric"
 placeholder="4242 4242 4242 4242"
 style={{ height: 46, borderRadius: 12, border: `1px solid ${t.faint}`, background: t.surface, color: t.fg, padding: "0 14px", outline: "none" }}
 />
 </label>
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
 <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 800, color: t.fg }}>
 Expiry
 <input
 required
 placeholder="MM / YY"
 style={{ height: 46, borderRadius: 12, border: `1px solid ${t.faint}`, background: t.surface, color: t.fg, padding: "0 14px", outline: "none" }}
 />
 </label>
 <label style={{ display: "grid", gap: 8, fontSize: 12, fontWeight: 800, color: t.fg }}>
 CVC
 <input
 required
 inputMode="numeric"
 placeholder="123"
 style={{ height: 46, borderRadius: 12, border: `1px solid ${t.faint}`, background: t.surface, color: t.fg, padding: "0 14px", outline: "none" }}
 />
 </label>
 </div>
 </div>

 <button
 type="submit"
 style={{
 marginTop: 20,
 width: "100%",
 height: 50,
 border: "none",
 borderRadius: 14,
 background: COBALT,
 color: "#fff",
 fontSize: 14,
 fontWeight: 900,
 cursor: "pointer",
 boxShadow: `0 18px 36px ${COBALT}30`,
 }}
 >
 {checkoutTier.n === "Team" ? "Start trial with payment method" : "Continue payment"}
 </button>
 {paymentStatus ? (
 <div style={{ marginTop: 14, borderRadius: 12, background: `${COBALT}12`, color: COBALT, padding: "12px 14px", fontSize: 12, fontWeight: 700, lineHeight: 1.5 }}>
 {paymentStatus}
 </div>
 ) : null}
 <p style={{ margin: "14px 0 0", fontSize: 11.5, color: t.muted, lineHeight: 1.6 }}>
 Demo checkout frame. Live charging requires connecting a billing provider endpoint.
 </p>
 </form>
 </div>
 </div>
 </div>
 ) : null}
 </>
 )}
 </CediumPage>
 );
}
