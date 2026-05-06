export type CodeBuilderPhase = "idle" | "generatingPlan" | "planReady" | "error";

export type CodeBuilderSectionId =
  | "header"
  | "hero"
  | "features"
  | "pricing"
  | "testimonials"
  | "cta"
  | "footer"
  | "faq";

export interface CodeBuilderLayer {
  id: CodeBuilderSectionId;
  label: string;
  description: string;
  canvasLabel: string;
}

export interface CodeBuilderPlan {
  id: string;
  prompt: string;
  projectName: string;
  websiteType: string;
  designDirection: string;
  pages: string[];
  summary: string;
  notes: string[];
  layers: CodeBuilderLayer[];
  source: "local_stub" | "backend";
  generatedAt: string;
}

function normalizePrompt(prompt: string) {
  return prompt.trim().replace(/\s+/g, " ");
}

function titleCase(value: string) {
  return value
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function inferWebsiteType(prompt: string) {
  const lower = prompt.toLowerCase();
  if (/(shop|store|ecommerce|commerce|product catalog)/.test(lower)) return "E-commerce storefront";
  if (/(portfolio|artist|designer|photographer|creative director)/.test(lower)) return "Creative portfolio";
  if (/(agency|studio|branding|marketing)/.test(lower)) return "Agency website";
  if (/(saas|software|platform|dashboard|app)/.test(lower)) return "SaaS landing page";
  if (/(restaurant|cafe|bar|hotel|hospitality)/.test(lower)) return "Hospitality website";
  if (/(course|school|education|academy|training)/.test(lower)) return "Education landing page";
  return "Marketing website";
}

function inferDesignDirection(prompt: string) {
  const lower = prompt.toLowerCase();
  if (lower.includes("minimal")) return "Minimal, airy layout with strong spacing and quiet typography.";
  if (lower.includes("bold")) return "Bold editorial layout with high contrast sections and confident CTAs.";
  if (lower.includes("luxury")) return "Refined luxury presentation with soft contrast and premium spacing.";
  if (lower.includes("playful")) return "Friendly, approachable layout with rounded cards and lighter rhythm.";
  if (lower.includes("dark")) return "Dark canvas with crisp surfaces and a high-contrast product feel.";
  return "Neutral product-grade layout with layered sections and focused conversion flow.";
}

function inferPages(prompt: string, websiteType: string) {
  const lower = `${prompt} ${websiteType}`.toLowerCase();
  if (/(e-commerce|storefront|store|shop)/.test(lower)) return ["Home", "Collections", "Product", "About", "Contact"];
  if (/(saas|landing page|platform|software|dashboard)/.test(lower)) return ["Home", "Pricing", "Features", "Docs", "Contact"];
  if (/(portfolio|creative|agency)/.test(lower)) return ["Home", "Work", "About", "Services", "Contact"];
  if (/(hospitality|restaurant|cafe|hotel)/.test(lower)) return ["Home", "Menu", "Reservations", "Gallery", "Contact"];
  return ["Home", "About", "Services", "Contact"];
}

function inferNotes(prompt: string, websiteType: string) {
  const lower = `${prompt} ${websiteType}`.toLowerCase();
  const notes = [
    "Keep the hero section compact and conversion-focused.",
    "Use a restrained neutral palette with one clear action color.",
    "Make the preview feel like a production canvas, not a chat screen.",
  ];

  if (/(e-commerce|store|shop)/.test(lower)) {
    notes.push("Surface product cards and a strong buy-now path.");
  } else if (/(saas|platform|software)/.test(lower)) {
    notes.push("Lead with feature clarity and a pricing comparison block.");
  } else if (/(portfolio|creative|agency)/.test(lower)) {
    notes.push("Make the work samples visually prominent and easy to scan.");
  } else {
    notes.push("Bias the layout toward trust signals and a visible CTA.");
  }

  return notes.slice(0, 4);
}

function buildLayers(websiteType: string): CodeBuilderLayer[] {
  const commonLayers: CodeBuilderLayer[] = [
    { id: "header", label: "Header", description: "Logo, navigation, and primary action.", canvasLabel: "Navbar" },
    { id: "hero", label: "Hero Section", description: "Headline, support copy, and CTA.", canvasLabel: "Hero" },
    { id: "features", label: "Features Section", description: "Core benefits and proof points.", canvasLabel: "Feature cards" },
    { id: "testimonials", label: "Testimonials", description: "Social proof and trust signals.", canvasLabel: "Testimonials" },
    { id: "cta", label: "CTA Area", description: "Conversion prompt and final action.", canvasLabel: "CTA" },
    { id: "footer", label: "Footer", description: "Utility links and closing details.", canvasLabel: "Footer" },
  ];

  if (/(e-commerce|store|shop)/.test(websiteType.toLowerCase())) {
    return [
      commonLayers[0],
      commonLayers[1],
      { id: "features", label: "Product Highlights", description: "Best sellers, collections, and merchandising.", canvasLabel: "Product cards" },
      { id: "pricing", label: "Offers Section", description: "Bundles, offers, or price anchors.", canvasLabel: "Offers" },
      commonLayers[3],
      commonLayers[4],
      commonLayers[5],
    ];
  }

  if (/(saas|landing page|platform|software)/.test(websiteType.toLowerCase())) {
    return [
      commonLayers[0],
      commonLayers[1],
      commonLayers[2],
      { id: "pricing", label: "Pricing Section", description: "Plans, comparison, and upgrade path.", canvasLabel: "Pricing table" },
      commonLayers[3],
      { id: "faq", label: "FAQ Section", description: "Common questions and objections.", canvasLabel: "FAQ" },
      commonLayers[5],
    ];
  }

  return commonLayers;
}

function projectNameFromPrompt(prompt: string) {
  const normalized = normalizePrompt(prompt);
  if (!normalized) return "Website Building Template";

  const forMatch = normalized.match(/\bfor\s+([^.,;:!?]+)(?:[.,;:!?]|$)/i);
  if (forMatch?.[1]) {
    const candidate = titleCase(forMatch[1].trim());
    if (candidate.length >= 3) return candidate;
  }

  const firstSegment = normalized.split(/[.,;:!?]/)[0]?.trim() ?? "";
  const firstWords = firstSegment.split(/\s+/).slice(0, 5).join(" ");
  const candidate = titleCase(firstWords);
  return candidate || "Website Building Template";
}

export function generateWebsitePlanFromPrompt(prompt: string): CodeBuilderPlan {
  const cleanPrompt = normalizePrompt(prompt);
  const websiteType = inferWebsiteType(cleanPrompt);
  const designDirection = inferDesignDirection(cleanPrompt);
  const pages = inferPages(cleanPrompt, websiteType);
  const layers = buildLayers(websiteType);

  return {
    id: `code-plan-${Date.now()}`,
    prompt: cleanPrompt,
    projectName: projectNameFromPrompt(cleanPrompt),
    websiteType,
    designDirection,
    pages,
    summary: `A ${websiteType.toLowerCase()} with a clean builder canvas, strong section hierarchy, and a focused conversion path.`,
    notes: inferNotes(cleanPrompt, websiteType),
    layers,
    source: "local_stub",
    generatedAt: new Date().toISOString(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function normalizeCodeBuilderPlan(value: unknown, prompt: string): CodeBuilderPlan | null {
  if (!isRecord(value)) return null;

  const source = value.source === "backend" ? "backend" : "local_stub";
  const websiteType = typeof value.websiteType === "string" ? value.websiteType : inferWebsiteType(prompt);
  const layersValue = Array.isArray(value.layers) ? value.layers : [];
  const layers = layersValue
    .map((layer) => {
      if (!isRecord(layer)) return null;
      const id = layer.id;
      const label = layer.label;
      const description = layer.description;
      const canvasLabel = layer.canvasLabel;
      if (
        (id !== "header" &&
          id !== "hero" &&
          id !== "features" &&
          id !== "pricing" &&
          id !== "testimonials" &&
          id !== "cta" &&
          id !== "footer" &&
          id !== "faq") ||
        typeof label !== "string" ||
        typeof description !== "string" ||
        typeof canvasLabel !== "string"
      ) {
        return null;
      }
      return { id, label, description, canvasLabel } satisfies CodeBuilderLayer;
    })
    .filter((item): item is CodeBuilderLayer => Boolean(item));

  if (!layers.length) return null;

  return {
    id: typeof value.id === "string" ? value.id : `code-plan-${Date.now()}`,
    prompt: typeof value.prompt === "string" ? value.prompt : normalizePrompt(prompt),
    projectName: typeof value.projectName === "string" ? value.projectName : projectNameFromPrompt(prompt),
    websiteType,
    designDirection: typeof value.designDirection === "string" ? value.designDirection : inferDesignDirection(prompt),
    pages: isStringArray(value.pages) && value.pages.length ? value.pages : inferPages(prompt, websiteType),
    summary: typeof value.summary === "string" ? value.summary : `A ${websiteType.toLowerCase()} with a clean builder canvas, strong section hierarchy, and a focused conversion path.`,
    notes: isStringArray(value.notes) && value.notes.length ? value.notes : inferNotes(prompt, websiteType),
    layers,
    source,
    generatedAt: typeof value.generatedAt === "string" ? value.generatedAt : new Date().toISOString(),
  };
}
