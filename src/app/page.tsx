"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { ArrowRight, Code2, Cuboid, Download, Gauge, HardDrive, Layers3, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { CoreforgePage, COBALT, useCoreforgeLanguage } from "@/components/cedium-shell";

const homeTranslations: Record<string, Record<string, string>> = {
 en: {
  eyebrow: "Design spaces. Visualize ideas. Build intelligent environments.", hero: "Design the way people live.", heroCopy: "Crystal combines AI, architecture, interior design, and advanced 3D visualization to turn a home brief into thoughtful spaces, beautiful interiors, and intelligent environments.", launch: "Launch Studio", download: "Download App", architecture: "Architecture", interior: "Interior Design", furniture: "Furniture Planner", visualization: "3D Visualization", robotics: "Home Robotics", infrastructure: "Infrastructure", planarch: "Planarch 3: Turn Plans into Places", planarchCopy: "Transform architectural ideas into complete living spaces with detailed floor plans, room layouts, materials, and 3D visualizations designed around everyday life.", infra: "Infra: Build Smarter Systems", infraCopy: "Design the infrastructure that keeps communities moving, connecting buildings, utilities, transport, clean energy, and resilient public spaces in one intelligent plan.", explore: "Explore",
 },
 de: {
  eyebrow: "Räume gestalten. Ideen visualisieren. Intelligente Umgebungen entwickeln.", hero: "Gestalte die Art, wie Menschen leben.", heroCopy: "Crystal verbindet KI, Architektur, Innenarchitektur und fortschrittliche 3D-Visualisierung, um aus einem Wohnbrief durchdachte Räume und intelligente Umgebungen zu machen.", launch: "Studio starten", download: "App herunterladen", architecture: "Architektur", interior: "Innenarchitektur", furniture: "Möbelplanung", visualization: "3D-Visualisierung", robotics: "Hausrobotik", infrastructure: "Infrastruktur", planarch: "Planarch 3: Pläne werden zu Orten", planarchCopy: "Verwandle architektonische Ideen mit Grundrissen, Raumaufteilungen, Materialien und 3D-Visualisierungen in vollständige Wohnräume.", infra: "Infra: Intelligentere Systeme bauen", infraCopy: "Plane Infrastruktur für Gebäude, Versorgung, Verkehr, saubere Energie und widerstandsfähige öffentliche Räume in einem intelligenten Konzept.", explore: "Entdecken",
 },
 fr: {
  eyebrow: "Concevez des espaces. Visualisez vos idées. Créez des environnements intelligents.", hero: "Concevez la façon dont les gens vivent.", heroCopy: "Crystal réunit IA, architecture, design intérieur et visualisation 3D avancée pour transformer une intention en espaces réfléchis et environnements intelligents.", launch: "Lancer le studio", download: "Télécharger l’app", architecture: "Architecture", interior: "Design intérieur", furniture: "Planificateur mobilier", visualization: "Visualisation 3D", robotics: "Robotique domestique", infrastructure: "Infrastructure", planarch: "Planarch 3 : des plans aux espaces", planarchCopy: "Transformez vos idées architecturales en espaces de vie complets grâce aux plans, agencements, matériaux et visualisations 3D.", infra: "Infra : construire des systèmes plus intelligents", infraCopy: "Concevez les infrastructures reliant bâtiments, réseaux, transports, énergie propre et espaces publics résilients.", explore: "Explorer",
 },
 it: {
  eyebrow: "Progetta gli spazi. Visualizza le idee. Crea ambienti intelligenti.", hero: "Progetta il modo in cui le persone vivono.", heroCopy: "Crystal unisce IA, architettura, interior design e visualizzazione 3D avanzata per trasformare un’idea in spazi curati e ambienti intelligenti.", launch: "Avvia Studio", download: "Scarica l’app", architecture: "Architettura", interior: "Interior design", furniture: "Planner arredi", visualization: "Visualizzazione 3D", robotics: "Robotica domestica", infrastructure: "Infrastrutture", planarch: "Planarch 3: dai piani agli spazi", planarchCopy: "Trasforma le idee architettoniche in spazi abitativi completi con planimetrie, layout, materiali e visualizzazioni 3D.", infra: "Infra: sistemi più intelligenti", infraCopy: "Progetta infrastrutture che collegano edifici, servizi, trasporti, energia pulita e spazi pubblici resilienti.", explore: "Esplora",
 },
 zh: {
  eyebrow: "设计空间。可视化创意。构建智能环境。", hero: "设计人们生活的方式。", heroCopy: "Crystal 将 AI、建筑、室内设计和先进的 3D 可视化结合，把住宅需求转化为经过思考的空间、美丽的室内和智能环境。", launch: "启动工作室", download: "下载应用", architecture: "建筑", interior: "室内设计", furniture: "家具规划", visualization: "3D 可视化", robotics: "家庭机器人", infrastructure: "基础设施", planarch: "Planarch 3：从平面图到空间", planarchCopy: "通过详细的平面图、空间布局、材料和 3D 可视化，将建筑创意转化为完整的生活空间。", infra: "Infra：构建更智能的系统", infraCopy: "在一个智能方案中连接建筑、公共设施、交通、清洁能源和韧性公共空间。", explore: "探索",
 },
 ja: {
  eyebrow: "空間をデザイン。アイデアを可視化。インテリジェントな環境を構築。", hero: "人々の暮らし方をデザインする。", heroCopy: "Crystal は AI、建築、インテリアデザイン、高度な 3D ビジュアルを組み合わせ、住まいの要望を美しく知的な空間へ変えます。", launch: "スタジオを起動", download: "アプリをダウンロード", architecture: "建築", interior: "インテリアデザイン", furniture: "家具プランナー", visualization: "3D ビジュアル", robotics: "ホームロボティクス", infrastructure: "インフラ", planarch: "Planarch 3：図面を空間へ", planarchCopy: "詳細な平面図、レイアウト、素材、3D ビジュアルで建築アイデアを暮らしの空間へ変えます。", infra: "Infra：よりスマートなシステム", infraCopy: "建物、設備、交通、クリーンエネルギー、強い公共空間を一つの計画でつなぎます。", explore: "探索",
 },
 ar: {
  eyebrow: "صمّم المساحات. تصوّر الأفكار. ابنِ بيئات ذكية.", hero: "صمّم طريقة عيش الناس.", heroCopy: "يجمع Crystal بين الذكاء الاصطناعي والهندسة المعمارية والتصميم الداخلي والتصور ثلاثي الأبعاد لتحويل فكرة المنزل إلى مساحات جميلة وبيئات ذكية.", launch: "فتح الاستوديو", download: "تنزيل التطبيق", architecture: "الهندسة المعمارية", interior: "التصميم الداخلي", furniture: "مخطط الأثاث", visualization: "التصور ثلاثي الأبعاد", robotics: "روبوتات المنزل", infrastructure: "البنية التحتية", planarch: "Planarch 3: من المخططات إلى المساحات", planarchCopy: "حوّل الأفكار المعمارية إلى مساحات معيشة كاملة مع المخططات وتوزيع الغرف والمواد والتصور ثلاثي الأبعاد.", infra: "Infra: بناء أنظمة أكثر ذكاءً", infraCopy: "صمّم بنية تحتية تربط المباني والخدمات والنقل والطاقة النظيفة والمساحات العامة المرنة.", explore: "استكشف",
 },
};

const surfaces = [
 {
 n: "01",
 title: "Architecture & Floor Plans",
 description: "Create house plans, building layouts, room configurations, and precise architectural documentation in one focused studio.",
 Icon: Layers3,
 href: "/crystal",
 cta: "Launch Studio",
 },
 {
 n: "02",
 title: "AI Design Assistant",
 description: "Turn a brief into floor plans, interior concepts, furniture layouts, and presentation-ready 3D designs.",
 Icon: Code2,
 href: "/workspace/code",
 cta: "Open Assistant",
 },
 {
 n: "03",
 title: "Home Robotics",
 description: "Design and visualize helpful household robots in the rooms and environments where they will live.",
 Icon: Cuboid,
 href: "/platform/bridges",
 cta: "View Studios",
 },
];

const metrics = [
 { label: "Core focus", value: "3D", detail: "architecture, interiors, furniture, and intelligent homes" },
 { label: "Design areas", value: "05", detail: "architecture, interiors, furniture, visualization, and home robotics" },
 { label: "Design coverage", value: "All", detail: "floor plans, 3D models, materials, layouts, and documentation" },
];

const workflow = [
 {
 title: "Start with a design brief",
 copy: "Describe the home, apartment, room, furniture layout, or household robot you want to create.",
 },
 {
 title: "Shape the design plan",
 copy: "Crystal Studio keeps rooms, dimensions, materials, furnishings, and next actions organized across the project.",
 },
 {
 title: "Visualize and share",
 copy: "Move from floor plans to 3D views, renderings, architectural drawings, exports, and project status without losing context.",
 },
];

const controls = [
 { title: "Architecture", copy: "Walls, doors, windows, stairs, roofs, dimensions, and building elements stay organized by space." },
 { title: "Interior design", copy: "Furniture, lighting, materials, finishes, and decoration remain tied to each room and layout." },
 { title: "Home planning", copy: "Space optimization, furniture placement, floor-plan generation, and exports remain easy to track." },
 { title: "Design workflow", copy: "3D models, floor plans, visualizations, design libraries, and documentation fit the same flow." },
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
 className={`crystal-action-link ${variant === "secondary" ? "crystal-action-link-secondary" : ""}`}
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

function FeatureShowcase({ title, copy, image, reverse = false }: { title: string; copy: string; image: string; reverse?: boolean }) {
 return <section data-crystal-reveal className={`crystal-feature-showcase${reverse ? " reverse" : ""}`}><div className="crystal-feature-visual"><Image src={image} alt={title} fill sizes="(max-width: 700px) 100vw, 55vw" /></div><div className="crystal-feature-copy"><h2>{title}</h2><p>{copy}</p><ActionLink href="/crystal">Explore <ArrowRight size={15} /></ActionLink></div></section>;
}

export default function HomePage() {
 const { language } = useCoreforgeLanguage();
 const tr = homeTranslations[language] ?? homeTranslations.en;
 useEffect(() => {
  const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-crystal-reveal]"));
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("crystal-revealed"); observer.unobserve(entry.target); } }), { threshold: 0.14, rootMargin: "0px 0px -40px" });
  elements.forEach((element) => observer.observe(element));
  return () => observer.disconnect();
 }, []);
 return (
 <CoreforgePage>
 {(t) => (
 <>
 <section className="crystal-first-sector">
 <p>{tr.eyebrow}</p>
 <div className="crystal-first-card"><div><h1>{tr.hero}</h1><p>{tr.heroCopy}</p> <div><ActionLink href="/project">{tr.launch} <ArrowRight size={15} /></ActionLink><ActionLink href="/download" variant="secondary">{tr.download}</ActionLink></div></div><div className="crystal-first-image"><Image src="/Section/architectresectionone.png" alt={tr.architecture} fill priority sizes="(max-width: 700px) 100vw, 55vw" /></div></div>
 <div className="crystal-first-chips">{[tr.architecture, tr.interior, tr.furniture, tr.visualization, tr.robotics, tr.infrastructure].map((item) => <span key={item}>{item}</span>)}</div>
 </section>

 <section data-crystal-reveal style={{ padding: "42px 0 92px" }}>
 <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 32px" }}>
 <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
 {metrics.map((metric) => (
 <article
 key={metric.label}
 className={`crystal-core-metric crystal-core-metric-${metric.value.toLowerCase()}`}
 style={{
 padding: 28,
 border: "0",
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

 <FeatureShowcase title={tr.planarch} image="/Section/Planarch.png" copy={tr.planarchCopy} />

 <section data-crystal-reveal style={{ padding: "94px 0", borderTop: `1px solid ${t.faint}`, borderBottom: `1px solid ${t.faint}`, background: t.surface }}>
 <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 24, flexWrap: "wrap", marginBottom: 42 }}>
 <div>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 800, color: COBALT, marginBottom: 18 }}>
 WHAT CRYSTAL STUDIO DOES
 </div>
 <h2 style={{ fontSize: "clamp(38px,6vw,72px)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 0.94, margin: 0, fontStretch: "84%" }}>
 Design spaces for<br />
 <span style={{ color: COBALT, fontStyle: "italic" }}>the way people live.</span>
 </h2>
 </div>
 <p style={{ margin: 0, maxWidth: 410, color: t.muted, fontSize: 15, lineHeight: 1.65 }}>
 Built for architecture, interior design, furniture and space planning, 3D visualization, and home robotics.
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
 border: "0",
 borderRadius: 12,
 background: t.raised,
 color: t.fg,
 textDecoration: "none",
 overflow: "hidden",
 }}
 className="group crystal-home-surface"
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

 <FeatureShowcase reverse title={tr.infra} image="/Section/Infra.png" copy={tr.infraCopy} />

 <section data-crystal-reveal style={{ padding: "96px 0" }}>
 <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 800, color: COBALT, marginBottom: 20 }}>
 HOW IT WORKS
 </div>
 <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr]" style={{ alignItems: "start" }}>
 <div>
 <h2 style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.96, margin: 0, fontStretch: "86%" }}>
 From concept to engineered output.
 </h2>
 <p style={{ marginTop: 22, fontSize: 15.5, color: t.muted, maxWidth: 480, lineHeight: 1.65 }}>
 Keep design goals, floor plans, 3D design models, generated assets, and review paths tied to the same workspace from first prompt to final output.
 </p>
 </div>
 <div style={{ border: 0, borderRadius: 12, overflow: "hidden", background: t.raised }}>
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
 Design clarity, visual context,<br />
 <span style={{ color: COBALT, fontStyle: "italic" }}>better living spaces.</span>
 </h2>
 <div className="grid grid-cols-1 gap-0 md:grid-cols-2" style={{ border: 0, borderRadius: 12, overflow: "hidden" }}>
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

 <section style={{ padding: "100px 0", borderTop: `1px solid ${t.faint}`, background: t.surface }}>
 <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 56, alignItems: "center" }}>
 <div>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 800, color: COBALT, marginBottom: 18 }}>DESKTOP EDITION / PROFESSIONAL WORKFLOW</div>
 <h2 style={{ margin: 0, fontSize: "clamp(42px,6vw,76px)", lineHeight: 0.94, letterSpacing: "-0.045em", fontWeight: 900 }}>
 Take Crystal Studio<br /><span style={{ color: COBALT, fontStyle: "italic" }}>beyond the browser.</span>
 </h2>
 <p style={{ margin: "24px 0 0", maxWidth: 620, color: t.muted, fontSize: 17, lineHeight: 1.65 }}>
 The website provides AI-assisted design generation and concept exploration. Crystal Studio Desktop adds advanced local project workflows, larger files, offline processing, automation tools, and deeper design-documentation controls.
 </p>
 <p style={{ margin: "16px 0 0", maxWidth: 620, color: t.muted, fontSize: 13, lineHeight: 1.6 }}>
 Construction-ready documents and regulated building decisions must be reviewed and approved by a qualified professional in the relevant jurisdiction.
 </p>
 <div style={{ marginTop: 30, display: "flex", gap: 12, flexWrap: "wrap", color: t.fg }}>
 <ActionLink href="/download">Download App <Download size={15} /></ActionLink>
 <ActionLink href="/pricing" variant="secondary">View all plans</ActionLink>
 </div>
 </div>
 <div style={{ border: 0, borderRadius: 24, background: t.raised, padding: 28 }}>
 <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, paddingBottom: 24, borderBottom: `1px solid ${t.faint}` }}>
 <div><div style={{ fontSize: 12, color: t.muted }}>Crystal Studio Desktop</div><div style={{ marginTop: 8, fontSize: 26, fontWeight: 900 }}>Professional License</div></div>
 <div style={{ textAlign: "right" }}><div style={{ fontSize: 42, lineHeight: 1, fontWeight: 900, color: COBALT }}>$79</div><div style={{ marginTop: 5, fontSize: 11, color: t.muted }}>one-time</div></div>
 </div>
 <div style={{ display: "grid", gap: 16, paddingTop: 24 }}>
 {[{ Icon: Gauge, title: "Advanced desktop studio", description: "Local processing, larger projects, and extended design workflows." }, { Icon: HardDrive, title: "Offline project control", description: "Keep project files and design references on your workstation." }, { Icon: ShieldCheck, title: "Professional review required", description: "Construction-ready outputs remain subject to qualified professional review and applicable standards." }].map(({ Icon, title, description }) => (
 <div key={title} style={{ display: "flex", gap: 14 }}><span style={{ width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", color: COBALT, background: `${COBALT}14` }}><Icon size={18} /></span><div><div style={{ fontSize: 14, fontWeight: 800 }}>{title}</div><div style={{ marginTop: 4, fontSize: 12.5, lineHeight: 1.5, color: t.muted }}>{description}</div></div></div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </section>

 <section style={{ padding: "108px 0" }}>
 <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 32px", textAlign: "center" }}>
 <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, color: COBALT, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 20 }}>
 <Sparkles size={15} /> Begin
 </div>
 <h2 style={{ fontSize: "clamp(44px,7vw,88px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9, margin: 0, fontStretch: "84%" }}>
 Start in Crystal Studio.<br />
 <span style={{ color: COBALT, fontStyle: "italic" }}>Keep machines moving.</span>
 </h2>
 <p style={{ margin: "26px auto 0", maxWidth: 610, color: t.muted, fontSize: 16, lineHeight: 1.65 }}>
 Open the design workspace, compare floor plans, or review architecture, interiors, furniture layouts, and home-robotics concepts before sharing.
 </p>
 <div style={{ marginTop: 36, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", color: t.fg }}>
 <ActionLink href="/design-studio">
 Open Studio <Workflow size={15} />
 </ActionLink>
 <ActionLink href="/aichat" variant="secondary">
 Try AI Chat <ArrowRight size={15} />
 </ActionLink>
 <ActionLink href="/pricing" variant="secondary">
 See Pricing
 </ActionLink>
 </div>
 </div>
 </section>

 <section data-crystal-reveal style={{ padding: "92px 0 108px", borderTop: `1px solid ${t.faint}`, background: t.surface }}>
 <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px", textAlign: "center" }}>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 800, color: COBALT, marginBottom: 18 }}>CRYSTAL STUDIO / AVAILABLE EVERYWHERE</div>
 <h2 style={{ margin: 0, fontSize: "clamp(38px,6vw,72px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.94 }}>
 Design wherever ideas take you.
 </h2>
 <p style={{ margin: "22px auto 0", maxWidth: 560, color: t.muted, fontSize: 16, lineHeight: 1.65 }}>
 Keep your projects close, move from inspiration to execution, and continue designing across the tools and devices you use every day.
 </p>
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" style={{ marginTop: 38 }}>
 {[
 { label: "App Store", detail: "For iPhone and iPad", mark: "A" },
 { label: "Google Play", detail: "For Android devices", mark: "▶" },
 { label: "Crystal Store", detail: "Desktop for professionals", mark: "C" },
 ].map((store) => (
 <Link key={store.label} href="/download" style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 82, padding: "16px 20px", border: `1px solid ${t.faint}`, borderRadius: 14, background: t.raised, color: t.fg, textAlign: "left", textDecoration: "none" }} className="transition hover:border-[#4284FF]">
 <span style={{ display: "grid", placeItems: "center", width: 40, height: 40, flexShrink: 0, borderRadius: 10, background: `${COBALT}16`, color: COBALT, fontSize: 16, fontWeight: 900 }}>{store.mark}</span>
 <span><strong style={{ display: "block", fontSize: 15, fontWeight: 800 }}>{store.label}</strong><span style={{ display: "block", marginTop: 4, color: t.muted, fontSize: 12 }}>{store.detail}</span></span>
 </Link>
 ))}
 </div>
 </div>
 </section>
 </>
 )}
 </CoreforgePage>
 );
}
