"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Code2, Cuboid, Layers3, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { CediumPage, COBALT } from "@/components/cedium-shell";

const surfaces = [
 {
 n: "01",
 title: "Studio workspace",
 description: "Chat, project context, files, assets, and checkpoints stay in one readable production surface.",
 Icon: Layers3,
 href: "/ai-assistant",
 cta: "Launch Studio",
 },
 {
 n: "02",
 title: "Agent-ready code",
 description: "Turn prompts, page structure, design notes, and implementation tasks into focused code workflows.",
 Icon: Code2,
 href: "/workspace/code",
 cta: "Open Code",
 },
 {
 n: "03",
 title: "3D and CAD flow",
 description: "Move from AutoCAD website layouts to Blender scenes, product visuals, and render-ready assets.",
 Icon: Cuboid,
 href: "/platform/bridges",
 cta: "View Bridges",
 },
];

const metrics = [
 { label: "One workspace", value: "01", detail: "for design, code, assets, and production memory" },
 { label: "Agent surfaces", value: "06", detail: "studio, mail, files, code, knowledge, voice" },
 { label: "Production paths", value: "3D", detail: "website builds, CAD support, and Blender output" },
];

const workflow = [
 {
 title: "Start with the brief",
 copy: "Describe the page, product, CAD frame, 3D scene, or operational workflow.",
 },
 {
 title: "Shape the work",
 copy: "Cedium keeps context, assets, decisions, and next actions organized across the build.",
 },
 {
 title: "Ship from Studio",
 copy: "Move into code, files, community feedback, pricing, or project status without losing state.",
 },
];

const controls = [
 { title: "Clean access", copy: "Roles, workspace limits, account state, and plan gates remain visible." },
 { title: "Project memory", copy: "Files, prompts, exports, and activity stay tied to the work instead of scattered tabs." },
 { title: "Readable status", copy: "Production flow, platform health, and support links are easy to find." },
 { title: "Security posture", copy: "Security, privacy, terms, and cookie controls live in the same system shell." },
];

function ActionLink({
 href,
 children,
 variant = "primary",
}: {
 href: string;
 children: ReactNode;
 variant?: "primary" | "secondary";
}) {
 return (
 <Link
 href={href}
 style={{
 height: 46,
 padding: "0 20px",
 borderRadius: 8,
 display: "inline-flex",
 alignItems: "center",
 justifyContent: "center",
 gap: 9,
 textDecoration: "none",
 fontSize: 14,
 fontWeight: 800,
 letterSpacing: "-0.01em",
 background: variant === "primary" ? COBALT : "transparent",
 color: variant === "primary" ? "#fff" : "inherit",
 border: variant === "primary" ? `1px solid ${COBALT}` : "1px solid currentColor",
 }}
 >
 {children}
 </Link>
 );
}

export default function HomePage() {
 return (
 <CediumPage>
 {(t) => (
 <>
 <section style={{ padding: "112px 0 72px", position: "relative", overflow: "hidden" }}>
 <div
 style={{
 position: "absolute",
 left: "50%",
 top: "-26%",
 transform: "translateX(-50%)",
 width: 960,
 height: 660,
 borderRadius: "50%",
 background: `radial-gradient(closest-side,${COBALT}24,transparent 72%)`,
 filter: "blur(38px)",
 pointerEvents: "none",
 }}
 />
 <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 32px", textAlign: "center", position: "relative" }}>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 800, color: COBALT, marginBottom: 22 }}>
 AI PRODUCTION / v2.2
 </div>
 <h1
 style={{
 margin: 0,
 fontSize: "clamp(56px,10vw,132px)",
 fontWeight: 900,
 letterSpacing: "-0.055em",
 lineHeight: 0.88,
 fontStretch: "82%",
 }}
 >
 Build the work.
 <br />
 <span style={{ color: COBALT, fontStyle: "italic" }}>Not the tabs.</span>
 </h1>
 <p style={{ margin: "30px auto 0", maxWidth: 690, fontSize: 18, color: t.muted, lineHeight: 1.62 }}>
 One calm AI workspace for design, code, 3D, CAD, assets, and automation. Start with a brief, keep context, and move projects toward production without changing tools.
 </p>
 <div style={{ marginTop: 36, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", color: t.fg }}>
 <ActionLink href="/ai-assistant">
 Launch Studio <ArrowRight size={15} />
 </ActionLink>
 <ActionLink href="/platform/overview" variant="secondary">
 Explore Platform
 </ActionLink>
 </div>
 <div
 style={{
 margin: "44px auto 0",
 display: "inline-flex",
 gap: 8,
 flexWrap: "wrap",
 justifyContent: "center",
 color: t.muted,
 }}
 >
 {["Design systems", "Code agent", "Blender 3D", "AutoCAD bridge", "Project memory"].map((item) => (
 <span
 key={item}
 style={{
 fontSize: 11,
 fontWeight: 800,
 letterSpacing: "0.08em",
 textTransform: "uppercase",
 padding: "7px 11px",
 borderRadius: 999,
 border: `1px solid ${t.faint}`,
 background: t.raised,
 }}
 >
 {item}
 </span>
 ))}
 </div>
 </div>
 </section>

 <section style={{ padding: "42px 0 92px" }}>
 <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 32px" }}>
 <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
 {metrics.map((metric) => (
 <article
 key={metric.label}
 style={{
 padding: 28,
 border: `1px solid ${t.faint}`,
 borderRadius: 12,
 background: t.raised,
 minHeight: 210,
 display: "flex",
 flexDirection: "column",
 justifyContent: "space-between",
 }}
 >
 <div style={{ fontSize: 11, color: t.muted, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" }}>{metric.label}</div>
 <div>
 <div style={{ fontSize: 76, fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 0.9, color: COBALT, fontStretch: "82%" }}>
 {metric.value}
 </div>
 <p style={{ margin: "16px 0 0", fontSize: 14, color: t.muted, lineHeight: 1.55 }}>{metric.detail}</p>
 </div>
 </article>
 ))}
 </div>
 </div>
 </section>

 <section style={{ padding: "94px 0", borderTop: `1px solid ${t.faint}`, borderBottom: `1px solid ${t.faint}`, background: t.surface }}>
 <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 24, flexWrap: "wrap", marginBottom: 42 }}>
 <div>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 800, color: COBALT, marginBottom: 18 }}>
 WHAT CEDIUM DOES
 </div>
 <h2 style={{ fontSize: "clamp(38px,6vw,72px)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 0.94, margin: 0, fontStretch: "84%" }}>
 A quieter way to run<br />
 <span style={{ color: COBALT, fontStyle: "italic" }}>AI-assisted production.</span>
 </h2>
 </div>
 <p style={{ margin: 0, maxWidth: 410, color: t.muted, fontSize: 15, lineHeight: 1.65 }}>
 Built for useful outputs, clear project state, and a workspace that stays readable while the work gets more complex.
 </p>
 </div>

 <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
 {surfaces.map(({ n, title, description, Icon, href, cta }) => (
 <Link
 key={title}
 href={href}
 style={{
 position: "relative",
 minHeight: 310,
 padding: 30,
 border: `1px solid ${t.faint}`,
 borderRadius: 12,
 background: t.raised,
 color: t.fg,
 textDecoration: "none",
 overflow: "hidden",
 }}
 className="group"
 >
 <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18 }}>
 <div
 style={{
 width: 46,
 height: 46,
 borderRadius: 10,
 background: `${COBALT}16`,
 border: `1px solid ${COBALT}34`,
 color: COBALT,
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 }}
 >
 <Icon size={21} strokeWidth={1.9} />
 </div>
 <span style={{ fontSize: 12, fontFamily: "var(--font-geist-mono),monospace", fontWeight: 800, color: COBALT }}>/ {n}</span>
 </div>
 <div style={{ position: "absolute", left: 30, right: 30, bottom: 28 }}>
 <h3 style={{ fontSize: 27, fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1.02, margin: 0 }}>{title}</h3>
 <p style={{ margin: "14px 0 24px", fontSize: 14, color: t.muted, lineHeight: 1.62 }}>{description}</p>
 <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: COBALT, fontSize: 13, fontWeight: 800 }}>
 {cta} <ArrowRight size={14} />
 </span>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </section>

 <section style={{ padding: "96px 0" }}>
 <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 800, color: COBALT, marginBottom: 20 }}>
 HOW IT WORKS
 </div>
 <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr]" style={{ alignItems: "start" }}>
 <div>
 <h2 style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.96, margin: 0, fontStretch: "86%" }}>
 From idea to output without losing context.
 </h2>
 <p style={{ marginTop: 22, fontSize: 15.5, color: t.muted, maxWidth: 480, lineHeight: 1.65 }}>
 Keep the goal, source files, generated assets, and review path tied to the same workspace from first prompt to final output.
 </p>
 </div>
 <div style={{ border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden", background: t.raised }}>
 {workflow.map((item, index) => (
 <div
 key={item.title}
 style={{
 padding: "30px 32px",
 borderTop: index > 0 ? `1px solid ${t.faint}` : "none",
 display: "grid",
 gridTemplateColumns: "48px 1fr",
 gap: 22,
 }}
 >
 <div style={{ fontSize: 12, color: COBALT, fontFamily: "var(--font-geist-mono),monospace", fontWeight: 800 }}>
 0{index + 1}
 </div>
 <div>
 <h3 style={{ margin: 0, fontSize: 21, fontWeight: 900, letterSpacing: "-0.025em" }}>{item.title}</h3>
 <p style={{ margin: "9px 0 0", fontSize: 14, color: t.muted, lineHeight: 1.6 }}>{item.copy}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </section>

 <section style={{ padding: "96px 0", borderTop: `1px solid ${t.faint}`, background: t.surface }}>
 <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
 <div
 style={{
 width: 42,
 height: 42,
 borderRadius: 10,
 background: `${COBALT}16`,
 border: `1px solid ${COBALT}34`,
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 color: COBALT,
 }}
 >
 <ShieldCheck size={20} />
 </div>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 800, color: COBALT }}>WORKSPACE CONTROL</div>
 </div>
 <h2 style={{ fontSize: "clamp(36px,5vw,62px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.96, margin: 0, marginBottom: 42, fontStretch: "86%" }}>
 Useful production, clear state,<br />
 <span style={{ color: COBALT, fontStyle: "italic" }}>less interface noise.</span>
 </h2>
 <div className="grid grid-cols-1 gap-0 md:grid-cols-2" style={{ border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden" }}>
 {controls.map((item, index) => (
 <div
 key={item.title}
 style={{
 padding: "30px 32px",
 borderTop: index >= 2 ? `1px solid ${t.faint}` : "none",
 borderLeft: index % 2 === 1 ? `1px solid ${t.faint}` : "none",
 background: t.raised,
 }}
 >
 <div style={{ fontSize: 11, color: COBALT, fontFamily: "var(--font-geist-mono),monospace", fontWeight: 800, marginBottom: 12 }}>
 / {String(index + 1).padStart(2, "0")}
 </div>
 <h3 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.025em", margin: "0 0 9px" }}>{item.title}</h3>
 <p style={{ fontSize: 13.5, color: t.muted, lineHeight: 1.62, margin: 0 }}>{item.copy}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 <section style={{ padding: "108px 0" }}>
 <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 32px", textAlign: "center" }}>
 <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, color: COBALT, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 20 }}>
 <Sparkles size={15} /> Begin
 </div>
 <h2 style={{ fontSize: "clamp(44px,7vw,88px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9, margin: 0, fontStretch: "84%" }}>
 Start in Studio.<br />
 <span style={{ color: COBALT, fontStyle: "italic" }}>Keep the work moving.</span>
 </h2>
 <p style={{ margin: "26px auto 0", maxWidth: 610, color: t.muted, fontSize: 16, lineHeight: 1.65 }}>
 Open the AI workspace, compare plans, or review the platform before moving a project into production.
 </p>
 <div style={{ marginTop: 36, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", color: t.fg }}>
 <ActionLink href="/main">
 Open Studio <Workflow size={15} />
 </ActionLink>
 <ActionLink href="/pricing" variant="secondary">
 See Pricing
 </ActionLink>
 </div>
 </div>
 </section>
 </>
 )}
 </CediumPage>
 );
}
