"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Box,
  Building2,
  CheckCircle2,
  Compass,
  Copy,
  Cpu,
  Download,
  Home,
  Info,
  Layers,
  Lightbulb,
  Lock,
  Move3d,
  Palette,
  Plus,
  Route,
  Ruler,
  Search,
  Settings,
  ShieldCheck,
  Sliders,
  Sofa,
  Sparkles,
  SunMedium,
  Trash2,
  Upload,
  Wand2,
  XCircle,
} from "lucide-react";
import {
  Alert,
  Badge,
  Breadcrumbs,
  Button,
  ButtonLink,
  Card,
  Checkbox,
  Field,
  IconTile,
  Input,
  Modal,
  Progress,
  ProgressRing,
  Radio,
  Select,
  SoftIcon,
  SoftRoot,
  Spinner,
  Tabs,
  Textarea,
  Toast,
  Toggle,
  Tooltip,
  TypingDots,
} from "@/components/soft-ui/primitives";
import { SoftFooter, SoftNav } from "@/components/soft-ui/site-chrome";

const COLOR_SWATCHES = [
  { name: "Canvas Deep", hex: "#0F0F0F", role: "Primary Background" },
  { name: "Charcoal Elevate", hex: "#161616", role: "Secondary Surface" },
  { name: "Graphite Card", hex: "#1A1A1A", role: "Card / Panel Surface" },
  { name: "Soft Periwinkle", hex: "#A5B1FF", role: "Primary Accent" },
  { name: "Architectural Sage", hex: "#A9CDBD", role: "Secondary Accent" },
  { name: "Warm Limestone", hex: "#E2C9A6", role: "Tertiary Sand" },
  { name: "Calm Emerald", hex: "#94D3B4", role: "Success Tone" },
  { name: "Soft Amber", hex: "#EBC98F", role: "Warning Tone" },
  { name: "Muted Coral", hex: "#F0A8A8", role: "Error / Destructive" },
];

export default function SoftUIKitPage() {
  const [pillTab, setPillTab] = useState<"architecture" | "interior" | "infrastructure">("architecture");
  const [lineTab, setLineTab] = useState<"overview" | "tokens" | "accessibility">("overview");
  const [activeSide, setActiveSide] = useState("massing");
  const [snapToggle, setSnapToggle] = useState(true);
  const [daylightToggle, setDaylightToggle] = useState(true);
  const [orthoToggle, setOrthoToggle] = useState(false);
  const [unitRadio, setUnitRadio] = useState("m");
  const [gridCheck, setGridCheck] = useState(true);
  const [autosaveCheck, setAutosaveCheck] = useState(true);
  const [exposure, setExposure] = useState(68);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(true);

  return (
    <SoftRoot>
      <div className="relative overflow-hidden">
        <div className="sui-ambient" aria-hidden />
        <SoftNav active="UI Kit" />

        {/* Header */}
        <section className="sui-section pb-14 pt-16">
          <div className="sui-container">
            <Breadcrumbs
              items={[
                { label: "Casynus", href: "/studio-ai" },
                { label: "Design System", href: "/ui-kit" },
                { label: "Soft Dark UI Kit" },
              ]}
            />
            <div className="mt-6 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <Badge tone="primary" dot>
                  Casynus Soft UI · v4.0
                </Badge>
                <h1 className="sui-h1 mt-4">
                  A calm, tactile component library for spatial design software.
                </h1>
                <p className="sui-body-lg mt-4">
                  Crafted on deep `#0F0F0F` and `#161616` charcoal surfaces with 16–24px radii,
                  gentle glassmorphism, 1.6px rounded line icons, and soothing micro-interactions.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/studio-ai" variant="secondary" leadingIcon={Home}>
                  Platform Landing
                </ButtonLink>
                <ButtonLink href="/casynus" variant="primary" trailingIcon={ArrowRight}>
                  Open 3D Studio
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>

        <hr className="sui-divider" />

        {/* ================================================================
            7. TYPOGRAPHY & COLOR SYSTEM
            ================================================================ */}
        <section className="sui-section">
          <div className="sui-container">
            <div className="sui-overline mb-2">01 · Foundations</div>
            <h2 className="sui-h2">Typography & Soft Dark Color System</h2>
            <p className="sui-body mt-2 max-w-2xl">
              High-contrast warm ivory text (`#F2F2F0`) paired with desaturated periwinkle,
              architectural sage, and limestone accents that never glare against dark surfaces.
            </p>

            <div className="mt-10 grid gap-6 lg:grid-cols-12">
              {/* Type Scale */}
              <Card className="space-y-5 lg:col-span-6">
                <div className="sui-overline">Geometric Sans Type Scale</div>
                <div>
                  <span className="sui-small block">Display · clamp(2.6rem, 6vw, 4.75rem)</span>
                  <div className="sui-h1 mt-1">Spatial Calm</div>
                </div>
                <div>
                  <span className="sui-small block">Heading 1 · 3rem / -0.03em</span>
                  <div className="sui-h2 mt-1">Architectural Massing</div>
                </div>
                <div>
                  <span className="sui-small block">Heading 2 · 2.25rem / -0.025em</span>
                  <div className="sui-h3 mt-1">Interior Floor Planning</div>
                </div>
                <div>
                  <span className="sui-small block">Body Large · 1.125rem / 1.65</span>
                  <p className="sui-body-lg mt-1">
                    Designed for extended studio sessions with generous breathing room and zero visual fatigue.
                  </p>
                </div>
                <div>
                  <span className="sui-small block">Monospace · Coordinates & Tokens</span>
                  <code className="sui-mono mt-1 block text-[var(--sui-primary)]">
                    X: 14.20m · Y: 8.60m · Z: 3.40m · Scale 1:100
                  </code>
                </div>
              </Card>

              {/* Color Swatches */}
              <Card className="lg:col-span-6">
                <div className="sui-overline mb-4">Surface & Semantic Palette</div>
                <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
                  {COLOR_SWATCHES.map((swatch) => (
                    <div
                      key={swatch.name}
                      className="rounded-2xl border border-[var(--sui-line)] bg-[var(--sui-bg-2)] p-2.5"
                    >
                      <div
                        className="sui-swatch h-16"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <div className="mt-2.5 text-xs font-medium text-[var(--sui-text)]">
                        {swatch.name}
                      </div>
                      <div className="sui-mono text-[11px] text-[var(--sui-text-3)]">
                        {swatch.hex}
                      </div>
                      <div className="sui-small text-[11px]">{swatch.role}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        <hr className="sui-divider" />

        {/* ================================================================
            1. BUTTONS
            ================================================================ */}
        <section className="sui-section">
          <div className="sui-container">
            <div className="sui-overline mb-2">02 · Actions</div>
            <h2 className="sui-h2">Buttons & Micro-Interactions</h2>
            <p className="sui-body mt-2 max-w-2xl">
              Pill-shaped and softly rounded rectangles (`16px` radius) with subtle top highlights,
              gentle `-1px` hover lift, and soft outer glow.
            </p>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <Card className="space-y-6">
                <div>
                  <div className="sui-overline mb-3">Variants (Pill Shape)</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary" leadingIcon={Sparkles}>
                      Primary Action
                    </Button>
                    <Button variant="secondary" leadingIcon={Layers}>
                      Secondary
                    </Button>
                    <Button variant="tertiary" leadingIcon={Wand2}>
                      Tertiary Soft
                    </Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive" leadingIcon={Trash2}>
                      Destructive
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="sui-overline mb-3">Generously Rounded Rectangles (16px)</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary" rounded leadingIcon={Download}>
                      Export STEP AP214
                    </Button>
                    <Button variant="secondary" rounded leadingIcon={Upload}>
                      Import IFC / glTF
                    </Button>
                    <Button variant="tertiary" rounded leadingIcon={Compass}>
                      Align to Site North
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="space-y-6">
                <div>
                  <div className="sui-overline mb-3">Sizes & States</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary" size="sm">
                      Small (36px)
                    </Button>
                    <Button variant="primary" size="md">
                      Default (44px)
                    </Button>
                    <Button variant="primary" size="lg" trailingIcon={ArrowRight}>
                      Large (52px)
                    </Button>
                    <Button variant="secondary" loading>
                      Rendering
                    </Button>
                    <Button variant="secondary" disabled>
                      Disabled
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="sui-overline mb-3">Icon-Only Controls with Tooltips</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Tooltip content="3D Massing Tool">
                      <Button variant="secondary" iconOnly aria-label="3D Massing Tool" leadingIcon={Box} />
                    </Tooltip>
                    <Tooltip content="Dimension Ruler">
                      <Button variant="secondary" iconOnly aria-label="Dimension Ruler" leadingIcon={Ruler} />
                    </Tooltip>
                    <Tooltip content="Daylight Rig">
                      <Button variant="tertiary" iconOnly aria-label="Daylight Rig" leadingIcon={SunMedium} />
                    </Tooltip>
                    <Tooltip content="Duplicate Object">
                      <Button variant="ghost" iconOnly aria-label="Duplicate Object" leadingIcon={Copy} />
                    </Tooltip>
                    <Tooltip content="Add Layer">
                      <Button variant="primary" iconOnly aria-label="Add Layer" leadingIcon={Plus} />
                    </Tooltip>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <hr className="sui-divider" />

        {/* ================================================================
            2. ICONS
            ================================================================ */}
        <section className="sui-section">
          <div className="sui-container">
            <div className="sui-overline mb-2">03 · Iconography</div>
            <h2 className="sui-h2">Soft Minimal Line Icons</h2>
            <p className="sui-body mt-2 max-w-2xl">
              Consistent `1.6px` stroke weight with organic proportions across five sizes (`xs` 14px to `xl` 28px)
              and four interactive states (`default`, `hover`, `active`, `disabled`).
            </p>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <Card>
                <div className="sui-overline mb-4">Interactive States & Tones</div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--sui-line)] bg-[var(--sui-bg-2)] p-4">
                    <IconTile icon={Building2} />
                    <span className="sui-small">Default</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--sui-line)] bg-[var(--sui-bg-2)] p-4">
                    <IconTile icon={Sofa} state="hover" />
                    <span className="sui-small">Hover</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--sui-line)] bg-[var(--sui-bg-2)] p-4">
                    <IconTile icon={Route} state="active" />
                    <span className="sui-small">Active</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--sui-line)] bg-[var(--sui-bg-2)] p-4">
                    <IconTile icon={Lock} state="disabled" />
                    <span className="sui-small">Disabled</span>
                  </div>
                </div>

                <div className="sui-overline mb-3 mt-6">Domain Accent Tiles</div>
                <div className="flex flex-wrap items-center gap-4">
                  <IconTile icon={Move3d} size="lg" tone="accent" />
                  <IconTile icon={Compass} size="lg" tone="sage" />
                  <IconTile icon={Lightbulb} size="lg" tone="sand" />
                  <IconTile icon={ShieldCheck} size="md" tone="accent" />
                  <IconTile icon={Cpu} size="sm" tone="sage" />
                </div>
              </Card>

              <Card>
                <div className="sui-overline mb-4">Size Scale (14px → 28px)</div>
                <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-[var(--sui-line)] bg-[var(--sui-bg-2)] p-6">
                  {(["xs", "sm", "md", "lg", "xl"] as const).map((sz) => (
                    <div key={sz} className="flex flex-col items-center gap-2.5">
                      <SoftIcon icon={Compass} size={sz} className="text-[var(--sui-primary)]" />
                      <span className="sui-mono text-xs text-[var(--sui-text-3)]">{sz}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        <hr className="sui-divider" />

        {/* ================================================================
            3. CARDS & FRAMES
            ================================================================ */}
        <section className="sui-section">
          <div className="sui-container">
            <div className="sui-overline mb-2">04 · Surfaces & Elevation</div>
            <h2 className="sui-h2">Cards, Floating Panels & Frames</h2>
            <p className="sui-body mt-2 max-w-2xl">
              Generous 20–32px corner radii, soft inner top highlights, and translucent glassmorphism.
            </p>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <Card hover>
                <Badge>Surface Card</Badge>
                <h3 className="sui-h3 mt-4">Interactive Hover Lift</h3>
                <p className="sui-body mt-2 text-sm">
                  Rises gently by `-3px` with a diffused shadow and subtle border brightening on hover.
                </p>
              </Card>

              <Card glass hover>
                <Badge tone="primary" dot>
                  Glassmorphic Panel
                </Badge>
                <h3 className="sui-h3 mt-4">Translucent Studio HUD</h3>
                <p className="sui-body mt-2 text-sm">
                  Uses `backdrop-filter: blur(22px)` over 3D viewports and architectural canvases.
                </p>
              </Card>

              <Card outline>
                <Badge tone="success">Quiet Outline Frame</Badge>
                <h3 className="sui-h3 mt-4">Zero-Fill Boundary</h3>
                <p className="sui-body mt-2 text-sm">
                  Ideal for secondary grouping, specification tables, and non-intrusive metadata blocks.
                </p>
              </Card>
            </div>

            <div className="sui-divider-label my-10">Soft Section Divider with Label</div>
          </div>
        </section>

        {/* ================================================================
            4. FORM ELEMENTS
            ================================================================ */}
        <section className="sui-section pt-4">
          <div className="sui-container">
            <div className="sui-overline mb-2">05 · Inputs & Controls</div>
            <h2 className="sui-h2">Soft Form Elements</h2>
            <p className="sui-body mt-2 max-w-2xl">
              Calm focus rings (`4px` periwinkle halo), refined validation states, and tactile switches.
            </p>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <Card className="space-y-5">
                <Field label="Project Name" htmlFor="kit-project" hint="Used on exported PDF sheets and glTF metadata.">
                  <Input id="kit-project" icon={Search} defaultValue="Nordic Courtyard Residence" />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Validated Scale"
                    htmlFor="kit-ok"
                    status="success"
                    hint="Calibrated to metric standard."
                  >
                    <Input id="kit-ok" status="success" defaultValue="1 : 100 (Meters)" />
                  </Field>

                  <Field
                    label="Structural Span"
                    htmlFor="kit-err"
                    status="error"
                    hint="Exceeds 18.0m clear-span limit."
                  >
                    <Input id="kit-err" status="error" defaultValue="24.50 m" />
                  </Field>
                </div>

                <Field label="Primary Discipline" htmlFor="kit-select">
                  <Select id="kit-select" defaultValue="arch">
                    <option value="arch">3D Architecture & Massing</option>
                    <option value="int">Interior Design & 2D Floor Plan</option>
                    <option value="infra">Urban Infrastructure & Roads</option>
                  </Select>
                </Field>

                <Field label="Generative Design Brief" htmlFor="kit-brief">
                  <Textarea
                    id="kit-brief"
                    defaultValue="Create a two-story timber and board-formed concrete pavilion with a south-facing cantilevered canopy and recessed courtyard."
                  />
                </Field>
              </Card>

              <Card className="flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="sui-overline">Toggles & Switches</div>
                  {[
                    {
                      label: "Endpoint & Orthogonal Snapping",
                      desc: "Snap walls and road segments to 90° and 45° increments",
                      checked: snapToggle,
                      onChange: setSnapToggle,
                    },
                    {
                      label: "Physical Daylight Simulation",
                      desc: "Soft sun-path shadows and ambient sky dome",
                      checked: daylightToggle,
                      onChange: setDaylightToggle,
                    },
                    {
                      label: "Orthographic Elevation Lock",
                      desc: "Lock camera to true parallel projection",
                      checked: orthoToggle,
                      onChange: setOrthoToggle,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--sui-line)] bg-[var(--sui-bg-2)] px-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-medium text-[var(--sui-text)]">{item.label}</div>
                        <div className="sui-small text-xs">{item.desc}</div>
                      </div>
                      <Toggle checked={item.checked} onChange={item.onChange} label={item.label} />
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="sui-overline">Checkboxes</div>
                    <div className="flex flex-col gap-2.5">
                      <Checkbox
                        label="Show metric grid"
                        checked={gridCheck}
                        onChange={(e) => setGridCheck(e.target.checked)}
                      />
                      <Checkbox
                        label="Versioned local autosave"
                        checked={autosaveCheck}
                        onChange={(e) => setAutosaveCheck(e.target.checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="sui-overline">Drawing Units (Radio)</div>
                    <div className="flex flex-col gap-2.5">
                      {[
                        { id: "m", label: "Meters (m)" },
                        { id: "mm", label: "Millimeters (mm)" },
                        { id: "ft", label: "Feet & Inches (ft)" },
                      ].map((u) => (
                        <Radio
                          key={u.id}
                          name="drawing-units"
                          label={u.label}
                          checked={unitRadio === u.id}
                          onChange={() => setUnitRadio(u.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="sui-label">Sky Dome Exposure</span>
                    <span className="sui-mono text-xs text-[var(--sui-primary)]">{exposure}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={exposure}
                    onChange={(e) => setExposure(Number(e.target.value))}
                    style={{ "--val": `${exposure}%` } as React.CSSProperties}
                    className="sui-range"
                    aria-label="Sky Dome Exposure"
                  />
                </div>
              </Card>
            </div>
          </div>
        </section>

        <hr className="sui-divider" />

        {/* ================================================================
            5. NAVIGATION
            ================================================================ */}
        <section className="sui-section">
          <div className="sui-container">
            <div className="sui-overline mb-2">06 · Wayfinding</div>
            <h2 className="sui-h2">Navigation, Tabs, Sidebar & Breadcrumbs</h2>

            <div className="mt-10 grid gap-6 lg:grid-cols-12">
              {/* Studio Sidebar */}
              <Card padded={false} className="sui-sidebar lg:col-span-4">
                <div className="sui-overline px-3 py-2">Studio Workspace Sidebar</div>
                {[
                  { id: "massing", label: "3D Massing & Envelope", icon: Building2, count: "12" },
                  { id: "floorplan", label: "2D Floor Plan & Rooms", icon: Sofa, count: "8" },
                  { id: "site", label: "Infrastructure & Roads", icon: Route, count: "5" },
                  { id: "materials", label: "Material Library", icon: Palette, count: "24" },
                  { id: "settings", label: "Studio Preferences", icon: Settings },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={activeSide === item.id ? "page" : undefined}
                    onClick={() => setActiveSide(item.id)}
                    className="sui-side-item"
                  >
                    <SoftIcon icon={item.icon} size="sm" />
                    <span>{item.label}</span>
                    {item.count && <span className="sui-side-count">{item.count}</span>}
                  </button>
                ))}
              </Card>

              {/* Segmented Tabs + Line Tabs + Breadcrumbs */}
              <Card className="space-y-8 lg:col-span-8">
                <div>
                  <div className="sui-overline mb-3">Segmented Pill Tabs</div>
                  <Tabs
                    label="Studio mode tabs"
                    value={pillTab}
                    onChange={setPillTab}
                    items={[
                      { id: "architecture", label: "Architecture", icon: Building2 },
                      { id: "interior", label: "Interior Plan", icon: Sofa },
                      { id: "infrastructure", label: "Infrastructure", icon: Route },
                    ]}
                  />
                </div>

                <div>
                  <div className="sui-overline mb-3">Underline Specification Tabs</div>
                  <Tabs
                    label="Specification tabs"
                    variant="line"
                    value={lineTab}
                    onChange={setLineTab}
                    items={[
                      { id: "overview", label: "Spatial Overview" },
                      { id: "tokens", label: "Design Tokens" },
                      { id: "accessibility", label: "WCAG Contrast" },
                    ]}
                  />
                  <p className="sui-body mt-4 text-sm">
                    {lineTab === "overview" &&
                      "All navigation surfaces share consistent 13–999px radii and gentle hover illumination."}
                    {lineTab === "tokens" &&
                      "Scoped under .sui with CSS custom properties (--sui-bg, --sui-surface, --sui-primary)."}
                    {lineTab === "accessibility" &&
                      "Keyboard focusable with :focus-visible rings, ARIA tablist/switch roles, and reduced-motion support."}
                  </p>
                </div>

                <div>
                  <div className="sui-overline mb-3">Breadcrumb Trail</div>
                  <Breadcrumbs
                    items={[
                      { label: "Workspace", href: "/workspace" },
                      { label: "Nordic Pavilion", href: "/casynus" },
                      { label: "Level 02 · Floor Plan" },
                    ]}
                  />
                </div>
              </Card>
            </div>
          </div>
        </section>

        <hr className="sui-divider" />

        {/* ================================================================
            6. FEEDBACK COMPONENTS
            ================================================================ */}
        <section className="sui-section">
          <div className="sui-container">
            <div className="sui-overline mb-2">07 · System Feedback</div>
            <h2 className="sui-h2">Alerts, Toasts, Modals & Progress Indicators</h2>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <Alert tone="info" icon={Info} title="Daylight simulation ready">
                  Solar altitude and soft shadow maps have been precomputed for 59.3° N latitude.
                </Alert>
                <Alert tone="success" icon={CheckCircle2} title="Scene snapshot saved">
                  Versioned floor-plan and 3D massing state synced to browser storage.
                </Alert>
                <Alert tone="warning" icon={AlertTriangle} title="Cantilever deflection notice">
                  South slab overhang exceeds 3.2m; review structural reinforcement with a licensed engineer.
                </Alert>
                <Alert tone="error" icon={XCircle} title="Export interrupted">
                  STEP AP214 solid conversion requires closed manifold geometry on Layer 04.
                </Alert>
              </div>

              <Card className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-[var(--sui-text-2)]">Path-Traced Light Baking</span>
                    <span className="sui-mono text-[var(--sui-primary)]">74%</span>
                  </div>
                  <Progress value={74} label="Light baking progress" />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-[var(--sui-text-2)]">AI Geometry Synthesis (Indeterminate)</span>
                    <TypingDots />
                  </div>
                  <Progress label="Indeterminate synthesis progress" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--sui-line)] bg-[var(--sui-bg-2)] p-4">
                  <div className="flex items-center gap-4">
                    <ProgressRing value={82} label="Site coverage score" />
                    <div>
                      <div className="text-sm font-medium text-[var(--sui-text)]">
                        Site Efficiency Score
                      </div>
                      <div className="sui-small">Green ratio & solar envelope</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Spinner />
                    <div className="sui-skeleton h-8 w-24" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button variant="primary" leadingIcon={Sliders} onClick={() => setModalOpen(true)}>
                    Open Soft Modal
                  </Button>
                  <Button
                    variant="secondary"
                    leadingIcon={Bell}
                    onClick={() => setToastVisible(true)}
                  >
                    Trigger Floating Toast
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Interactive Modal */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Export Architectural Package"
          footer={
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                leadingIcon={Download}
                onClick={() => {
                  setModalOpen(false);
                  setToastVisible(true);
                }}
              >
                Export glTF + PDF
              </Button>
            </>
          }
        >
          <p>
            Prepare a calibrated deliverable bundle containing 3D glTF 2.0 geometry,
            1:100 vector floor-plan sheets, and site infrastructure coordinates.
          </p>
        </Modal>

        {/* Floating Toast Notification */}
        {toastVisible && (
          <div className="sui-toast-stack">
            <Toast
              icon={Sparkles}
              tone="primary"
              title="Casynus Soft UI Active"
              description="All 7 component families are interactive and ready."
              onDismiss={() => setToastVisible(false)}
            />
          </div>
        )}

        <SoftFooter />
      </div>
    </SoftRoot>
  );
}
