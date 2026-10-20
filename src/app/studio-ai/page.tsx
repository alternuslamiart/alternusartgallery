import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Compass,
  Download,
  Eye,
  FileCheck2,
  Grid,
  Layers,
  Maximize2,
  Move3d,
  Palette,
  Route,
  Ruler,
  ShieldCheck,
  Sliders,
  Sofa,
  Sparkles,
  SunMedium,
  Wand2,
} from "lucide-react";
import {
  Badge,
  ButtonLink,
  Card,
  IconTile,
  ProgressRing,
  SoftIcon,
  SoftRoot,
} from "@/components/soft-ui/primitives";
import {
  ArchitectureArt,
  InfrastructureArt,
  InteriorArt,
} from "@/components/soft-ui/showcase-art";
import { SoftFooter, SoftNav } from "@/components/soft-ui/site-chrome";
import { Showcase } from "./showcase";

export const metadata: Metadata = {
  title: "Casynus — Generative AI Platform for Architecture, Interior Design & Infrastructure",
  description:
    "A calm, ultra-modern spatial design workspace uniting 3D architectural massing, 2D interior floor planning, and urban infrastructure site planning.",
};

const STUDIO_PILLARS = [
  {
    id: "3d-studio",
    badge: "01 · 3D Architecture Studio",
    tone: "accent" as const,
    icon: Building2,
    title: "Sculpt architectural massing with calm precision.",
    description:
      "Generate and refine volumetric studies, facade rhythms, daylighting envelopes, and structural grids inside an responsive 3D viewport.",
    href: "/casynus",
    cta: "Launch 3D Studio",
    specs: [
      { label: "Viewport", value: "Perspective & Ortho" },
      { label: "Exports", value: "glTF 2.0 · STEP · OBJ" },
      { label: "Lighting", value: "Soft HDRI & Sun Path" },
    ],
    art: "architecture" as const,
  },
  {
    id: "interior-studio",
    badge: "02 · Interior & Floor Planning",
    tone: "sand" as const,
    icon: Sofa,
    title: "Draft calibrated floor plans and serene interiors.",
    description:
      "Move fluidly from orthogonal 2D wall drafting, doors, windows, and room schedules to warm interior zoning and curated material palettes.",
    href: "/interior",
    cta: "Open Floor Plan Studio",
    specs: [
      { label: "Drafting Scale", value: "1:50 · 1:100 · 1:200" },
      { label: "Precision", value: "Millimeter & Meter Snap" },
      { label: "Deliverables", value: "PDF Sheet · SVG · PNG" },
    ],
    art: "interior" as const,
  },
  {
    id: "infrastructure-studio",
    badge: "03 · Infrastructure & Site Planning",
    tone: "sage" as const,
    icon: Route,
    title: "Plan road networks, bridges, and resilient terrain.",
    description:
      "Lay out arterial corridors, roundabouts, transit nodes, utility easements, and green buffer zones with real-time spatial inspection.",
    href: "/infrastructure",
    cta: "Open Infrastructure Studio",
    specs: [
      { label: "Elements", value: "Roads · Bridges · Parcels" },
      { label: "Persistence", value: "Versioned Local Autosave" },
      { label: "Analysis", value: "Clearance & Elevation" },
    ],
    art: "infrastructure" as const,
  },
];

const FLOATING_TOOLS = [
  {
    icon: Wand2,
    tone: "accent" as const,
    title: "Generative Spatial Co-Pilot",
    description:
      "Describe massing, circulation, or site constraints in natural language and iterate with Gemini & Groq assistance.",
  },
  {
    icon: Ruler,
    tone: "sand" as const,
    title: "Calibrated Metric Drafting",
    description:
      "Orthogonal 90° constraints, endpoint snapping, wall thickness controls, and live dimension annotations.",
  },
  {
    icon: SunMedium,
    tone: "sage" as const,
    title: "Atmospheric Daylight Studies",
    description:
      "Evaluate soft shadows, solar orientation, and material reflectance across dusk, dawn, and studio lighting.",
  },
  {
    icon: Layers,
    tone: "accent" as const,
    title: "Unified Scene Hierarchy",
    description:
      "Organize structural cores, furniture families, and civil corridors in a clean, collapsible object tree.",
  },
  {
    icon: Download,
    tone: "sand" as const,
    title: "Production Deliverables",
    description:
      "Export clean glTF 2.0, STEP AP214, OBJ meshes, SVG vector sheets, and architectural PDF spec packages.",
  },
  {
    icon: ShieldCheck,
    tone: "sage" as const,
    title: "Cyber-Shield Protected",
    description:
      "Guarded by multi-pass WAF inspection, CSRF origin verification, and workspace-scoped data isolation.",
  },
];

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Frame the Brief",
    description:
      "Start with a site boundary, a floor-plan sketch, or a natural-language architectural prompt in the AI composer.",
    icon: Sparkles,
  },
  {
    step: "02",
    title: "Refine in 2D & 3D",
    description:
      "Adjust wall spans, structural bays, road alignments, and material finishes with tactile, non-destructive controls.",
    icon: Sliders,
  },
  {
    step: "03",
    title: "Validate & Export",
    description:
      "Review dimensions, clearances, and lighting before exporting CAD-ready geometry or presentation sheets.",
    icon: FileCheck2,
  },
];

export default function StudioAIPage() {
  return (
    <SoftRoot>
      <div className="relative overflow-hidden">
        <div className="sui-ambient" aria-hidden />
        <SoftNav active="Studios" />

        {/* ================================================================
            HERO SECTION
            ================================================================ */}
        <section className="sui-section pb-20 pt-16 md:pt-24">
          <div className="sui-container">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[var(--sui-line-2)] bg-[var(--sui-bg-2)] px-4 py-1.5 shadow-[var(--sui-shadow-1)]">
                <Badge tone="primary" dot>
                  Casynus Studio 4.0
                </Badge>
                <span className="sui-small text-[var(--sui-text-2)]">
                  Architecture · Interior Design · Infrastructure
                </span>
              </div>

              <h1 className="sui-display">
                Spatial intelligence,{" "}
                <span className="sui-gradient-text">crafted in calm depth.</span>
              </h1>

              <p className="sui-body-lg mx-auto mt-6 max-w-2xl">
                A serene, studio-grade generative platform uniting 3D architectural massing,
                metric floor-plan drafting, and urban infrastructure planning in one cohesive dark workspace.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
                <ButtonLink href="/casynus" variant="primary" size="lg" trailingIcon={ArrowRight}>
                  Open 3D Studio
                </ButtonLink>
                <ButtonLink href="/interior" variant="secondary" size="lg" leadingIcon={Grid}>
                  Floor Plan Studio
                </ButtonLink>
                <ButtonLink href="/infrastructure" variant="outline" size="lg" leadingIcon={Compass}>
                  Infrastructure
                </ButtonLink>
                <ButtonLink href="/ui-kit" variant="ghost" size="lg" leadingIcon={Palette}>
                  Explore UI Kit
                </ButtonLink>
              </div>
            </div>

            {/* Interactive-Style Floating Studio Preview Frame */}
            <div className="sui-frame mt-16">
              <div className="sui-frame-inner p-4 md:p-6">
                {/* Top Studio Chrome Bar */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--sui-line)] bg-[var(--sui-surface)] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5" aria-hidden>
                      <span className="h-2.5 w-2.5 rounded-full bg-[#e69a9a]/60" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ebc98f]/60" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#94d3b4]/60" />
                    </div>
                    <span className="sui-small text-[var(--sui-text-2)]">
                      Cantilever_Pavilion_v4.casynus
                    </span>
                    <Badge tone="success" dot>
                      Synced
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full border border-[var(--sui-line)] bg-[var(--sui-bg-2)] p-1">
                    <Link
                      href="/casynus"
                      className="rounded-full bg-[var(--sui-surface-3)] px-3.5 py-1 text-xs font-medium text-[var(--sui-text)] no-underline"
                    >
                      3D Massing
                    </Link>
                    <Link
                      href="/interior"
                      className="rounded-full px-3.5 py-1 text-xs text-[var(--sui-text-3)] no-underline transition hover:text-[var(--sui-text)]"
                    >
                      2D Floor Plan
                    </Link>
                    <Link
                      href="/infrastructure"
                      className="rounded-full px-3.5 py-1 text-xs text-[var(--sui-text-3)] no-underline transition hover:text-[var(--sui-text)]"
                    >
                      Site & Roads
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge>Scale 1:100</Badge>
                    <Badge tone="primary">AI Co-Pilot Ready</Badge>
                  </div>
                </div>

                {/* 3-Column Studio Workspace Preview */}
                <div className="grid gap-4 lg:grid-cols-[240px_1fr_260px]">
                  {/* Left Scene Hierarchy Card */}
                  <Card padded={false} className="p-4">
                    <div className="sui-overline mb-3">Scene Hierarchy</div>
                    <div className="flex flex-col gap-1.5 text-xs">
                      {[
                        { name: "Site Topography", tag: "Mesh", active: false },
                        { name: "Cantilever Roof Slab", tag: "3D Solid", active: true },
                        { name: "Curtain Wall South", tag: "Glazing", active: false },
                        { name: "Living Zone · 68 m²", tag: "Room", active: false },
                        { name: "North Access Road", tag: "Corridor", active: false },
                        { name: "Solar Study Rig", tag: "Light", active: false },
                      ].map((item) => (
                        <div
                          key={item.name}
                          className={`flex items-center justify-between rounded-xl px-3 py-2 transition ${
                            item.active
                              ? "border border-[#a5b1ff]/25 bg-[#a5b1ff]/12 text-[var(--sui-text)]"
                              : "text-[var(--sui-text-2)] hover:bg-white/[0.03]"
                          }`}
                        >
                          <span className="truncate">{item.name}</span>
                          <span className="sui-mono text-[11px] text-[var(--sui-text-3)]">
                            {item.tag}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Center Viewport Canvas Preview */}
                  <div className="relative overflow-hidden rounded-[22px] border border-[var(--sui-line)] bg-[#121212]">
                    <div className="h-[360px] w-full">
                      <ArchitectureArt hue="dusk" className="h-full w-full" />
                    </div>

                    {/* Floating Bottom AI Composer Bar */}
                    <div className="sui-glass absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <IconTile icon={Sparkles} size="sm" tone="accent" />
                        <div>
                          <div className="text-xs font-medium text-[var(--sui-text)]">
                            “Extend the south roof overhang by 1.8m and soften the courtyard glazing…”
                          </div>
                          <div className="sui-small text-[11px]">
                            Precision Mode · Structural & Daylight Constraints Active
                          </div>
                        </div>
                      </div>
                      <ButtonLink href="/aichat" variant="primary" size="sm" trailingIcon={ArrowRight}>
                        Ask AI
                      </ButtonLink>
                    </div>
                  </div>

                  {/* Right Inspector Card */}
                  <Card padded={false} className="flex flex-col justify-between p-4">
                    <div>
                      <div className="sui-overline mb-3">Inspector</div>
                      <div className="space-y-3">
                        <div className="rounded-xl border border-[var(--sui-line)] bg-[var(--sui-bg-2)] p-3">
                          <div className="sui-small">Selected Element</div>
                          <div className="mt-0.5 text-sm font-medium text-[var(--sui-text)]">
                            Cantilever Roof Slab
                          </div>
                          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="rounded-lg bg-[var(--sui-surface)] py-1.5">
                              <span className="block text-[10px] text-[var(--sui-text-3)]">W</span>
                              14.2m
                            </div>
                            <div className="rounded-lg bg-[var(--sui-surface)] py-1.5">
                              <span className="block text-[10px] text-[var(--sui-text-3)]">D</span>
                              8.6m
                            </div>
                            <div className="rounded-lg bg-[var(--sui-surface)] py-1.5">
                              <span className="block text-[10px] text-[var(--sui-text-3)]">H</span>
                              0.42m
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-[var(--sui-line)] bg-[var(--sui-bg-2)] p-3">
                          <div>
                            <div className="text-xs font-medium text-[var(--sui-text)]">
                              Daylight Factor
                            </div>
                            <div className="sui-small text-[11px]">Optimal south exposure</div>
                          </div>
                          <ProgressRing value={86} size={52} label="Daylight factor" />
                        </div>
                      </div>
                    </div>

                    <ButtonLink
                      href="/casynus"
                      variant="tertiary"
                      size="sm"
                      className="mt-4 w-full"
                      trailingIcon={Maximize2}
                    >
                      Open Full Workspace
                    </ButtonLink>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="sui-divider" />

        {/* ================================================================
            THREE STUDIO PILLARS (3D, INTERIOR, INFRASTRUCTURE)
            ================================================================ */}
        <section id="studios" className="sui-section">
          <div className="sui-container">
            <div className="max-w-2xl">
              <div className="sui-overline mb-3">Three Unified Studios</div>
              <h2 className="sui-h1">
                Every scale of the built environment, one serene interface.
              </h2>
              <p className="sui-body-lg mt-4">
                Switch effortlessly between volumetric 3D massing, calibrated 2D floor plans,
                and macro-scale site infrastructure without leaving your creative flow.
              </p>
            </div>

            <div className="mt-14 flex flex-col gap-10">
              {STUDIO_PILLARS.map((studio, index) => (
                <Card
                  key={studio.id}
                  hover
                  className="grid items-center gap-8 lg:grid-cols-12"
                >
                  <div
                    className={`lg:col-span-6 ${
                      index % 2 === 1 ? "lg:order-2" : ""
                    }`}
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <IconTile icon={studio.icon} tone={studio.tone} />
                      <span className="sui-overline">{studio.badge}</span>
                    </div>
                    <h3 className="sui-h2">{studio.title}</h3>
                    <p className="sui-body mt-4">{studio.description}</p>

                    <div className="mt-6 grid grid-cols-3 gap-3">
                      {studio.specs.map((spec) => (
                        <div
                          key={spec.label}
                          className="rounded-2xl border border-[var(--sui-line)] bg-[var(--sui-bg-2)] p-3.5"
                        >
                          <div className="sui-small text-[11px]">{spec.label}</div>
                          <div className="mt-1 text-xs font-medium text-[var(--sui-text)]">
                            {spec.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <ButtonLink
                        href={studio.href}
                        variant="primary"
                        trailingIcon={ArrowRight}
                      >
                        {studio.cta}
                      </ButtonLink>
                      <ButtonLink href="/aichat" variant="ghost" leadingIcon={Sparkles}>
                        Generate with AI
                      </ButtonLink>
                    </div>
                  </div>

                  <div
                    className={`lg:col-span-6 ${
                      index % 2 === 1 ? "lg:order-1" : ""
                    }`}
                  >
                    <div className="sui-art h-[300px] md:h-[340px]">
                      {studio.art === "architecture" && <ArchitectureArt hue="dusk" />}
                      {studio.art === "interior" && <InteriorArt hue="dawn" />}
                      {studio.art === "infrastructure" && <InfrastructureArt hue="sage" />}
                      <div className="sui-art-caption flex items-center justify-between">
                        <span className="sui-small text-[var(--sui-text)]">
                          {studio.badge}
                        </span>
                        <Badge tone="primary">Interactive Workspace</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <hr className="sui-divider" />

        {/* ================================================================
            SOFT FLOATING TOOL CARDS
            ================================================================ */}
        <section className="sui-section">
          <div className="sui-container">
            <div className="mx-auto max-w-2xl text-center">
              <div className="sui-overline mb-3">Precision Capabilities</div>
              <h2 className="sui-h2">
                Gentle on the eyes. Rigorous under the hood.
              </h2>
              <p className="sui-body mt-4">
                Every tool is designed with soft rounded geometry, calm contrast, and
                predictable engineering controls for extended studio sessions.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FLOATING_TOOLS.map((tool) => (
                <Card key={tool.title} hover className="flex flex-col justify-between">
                  <div>
                    <IconTile icon={tool.icon} tone={tool.tone} size="lg" />
                    <h3 className="sui-h4 mt-5 text-[var(--sui-text)]">{tool.title}</h3>
                    <p className="sui-body mt-2.5 text-sm">{tool.description}</p>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-xs text-[var(--sui-text-3)]">
                    <SoftIcon icon={Eye} size="xs" />
                    <span>Available across all studio modes</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <hr className="sui-divider" />

        {/* ================================================================
            SHOWCASE GALLERY
            ================================================================ */}
        <section id="showcase" className="sui-section">
          <div className="sui-container">
            <Showcase />
          </div>
        </section>

        <hr className="sui-divider" />

        {/* ================================================================
            WORKFLOW & DESIGN SYSTEM CTA
            ================================================================ */}
        <section id="workflow" className="sui-section">
          <div className="sui-container">
            <div className="grid gap-6 md:grid-cols-3">
              {WORKFLOW_STEPS.map((item) => (
                <Card key={item.step} hover>
                  <div className="flex items-center justify-between">
                    <span className="sui-mono text-xs text-[var(--sui-primary)]">
                      STEP {item.step}
                    </span>
                    <IconTile icon={item.icon} size="sm" tone="accent" />
                  </div>
                  <h3 className="sui-h3 mt-5">{item.title}</h3>
                  <p className="sui-body mt-2.5 text-sm">{item.description}</p>
                </Card>
              ))}
            </div>

            {/* Soft CTA Banner */}
            <Card
              elevated
              className="mt-16 flex flex-col items-start justify-between gap-8 bg-gradient-to-br from-[#1d1f2b] via-[#181818] to-[#17211d] p-8 md:flex-row md:items-center md:p-12"
            >
              <div className="max-w-xl">
                <Badge tone="primary" dot>
                  Complete Design System Included
                </Badge>
                <h2 className="sui-h2 mt-4">
                  Explore the full Soft Dark UI Kit & live studio workspaces.
                </h2>
                <p className="sui-body mt-3">
                  Inspect every button, icon state, floating frame, form input, navigation bar,
                  toast, modal, and color token on our dedicated UI Kit page.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/ui-kit" variant="primary" size="lg" trailingIcon={ArrowRight}>
                  Open Complete UI Kit
                </ButtonLink>
                <ButtonLink href="/casynus" variant="secondary" size="lg" leadingIcon={Move3d}>
                  Launch 3D Studio
                </ButtonLink>
              </div>
            </Card>
          </div>
        </section>

        <SoftFooter />
      </div>
    </SoftRoot>
  );
}
