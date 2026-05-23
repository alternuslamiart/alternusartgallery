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
 if (/(fea|finite|stress|simulation)/.test(lower)) return "FEA simulation helper";
 if (/(cfd|flow|aero|aerodynamic|fluid)/.test(lower)) return "CFD automation";
 if (/(cnc|cam|g-code|gcode|toolpath|milling|turning)/.test(lower)) return "CNC / CAM automation";
 if (/(api|integration|endpoint|webhook)/.test(lower)) return "CAD API integration";
 if (/(parametric|macro|script|cad)/.test(lower)) return "CAD scripting workflow";
 return "Engineering automation";
}

function inferDesignDirection(prompt: string) {
 const lower = prompt.toLowerCase();
 if (lower.includes("minimal")) return "Minimal engineering script with clear inputs, outputs, and comments.";
 if (lower.includes("bold")) return "Direct automation plan with explicit constraints and validation steps.";
 if (lower.includes("premium")) return "Production-grade automation with metadata, exports, and review notes.";
 if (lower.includes("dark")) return "Simulation-first workflow with strict units, checks, and logged outputs.";
 return "Neutral engineering workflow with structured steps and clear production handoff.";
}

function inferPages(prompt: string, websiteType: string) {
 const lower = `${prompt} ${websiteType}`.toLowerCase();
 if (/(cnc|cam|g-code|gcode|toolpath)/.test(lower)) return ["Inputs", "Toolpath", "Machine Setup", "Validation", "Export"];
 if (/(fea|cfd|simulation)/.test(lower)) return ["Inputs", "Mesh", "Boundary Conditions", "Solver", "Results"];
 if (/(api|integration|endpoint)/.test(lower)) return ["Schema", "Routes", "Auth", "Payloads", "Tests"];
 return ["Inputs", "Parameters", "Automation", "Validation", "Export"];
}

function inferNotes(prompt: string, websiteType: string) {
 const lower = `${prompt} ${websiteType}`.toLowerCase();
 const notes = [
 "Keep units, inputs, outputs, and constraints explicit.",
 "Use deterministic parameter names and clear validation steps.",
 "Make the preview read like an engineering production plan.",
 ];

 if (/(cnc|cam|g-code|gcode|toolpath)/.test(lower)) {
 notes.push("Include feed, speed, tool, operation, and post-processor assumptions.");
 } else if (/(fea|cfd|simulation)/.test(lower)) {
 notes.push("Define mesh, boundary conditions, solver settings, and result checks.");
 } else if (/(api|integration|endpoint)/.test(lower)) {
 notes.push("Define payload schemas, authentication, retries, and test fixtures.");
 } else {
 notes.push("Bias the workflow toward reusable CAD parameters and export-ready outputs.");
 }

 return notes.slice(0, 4);
}

function buildLayers(websiteType: string): CodeBuilderLayer[] {
 const commonLayers: CodeBuilderLayer[] = [
 { id: "header", label: "Input Schema", description: "Parameters, units, source files, and required fields.", canvasLabel: "Inputs" },
 { id: "hero", label: "Automation Core", description: "Main CAD, simulation, CAM, or API logic.", canvasLabel: "Core" },
 { id: "features", label: "Validation", description: "Geometry checks, solver checks, and output guards.", canvasLabel: "Checks" },
 { id: "testimonials", label: "Review Notes", description: "Assumptions, risks, and engineering review items.", canvasLabel: "Review" },
 { id: "cta", label: "Export Step", description: "Generated files, formats, and handoff instructions.", canvasLabel: "Export" },
 { id: "footer", label: "Documentation", description: "Usage notes and repeatable workflow details.", canvasLabel: "Docs" },
 ];

 if (/(cnc|cam)/.test(websiteType.toLowerCase())) {
 return [
 commonLayers[0],
 commonLayers[1],
 { id: "features", label: "Toolpath Logic", description: "Operations, tooling, feeds, speeds, and path checks.", canvasLabel: "Toolpaths" },
 { id: "pricing", label: "Machine Setup", description: "Workholding, coordinate system, and post-processor notes.", canvasLabel: "Machine" },
 commonLayers[3],
 commonLayers[4],
 commonLayers[5],
 ];
 }

 if (/(fea|cfd|simulation)/.test(websiteType.toLowerCase())) {
 return [
 commonLayers[0],
 commonLayers[1],
 commonLayers[2],
 { id: "pricing", label: "Solver Setup", description: "Solver options, convergence checks, and run settings.", canvasLabel: "Solver" },
 commonLayers[3],
 { id: "faq", label: "Result Checks", description: "Post-processing, plots, tolerances, and quality gates.", canvasLabel: "Results" },
 commonLayers[5],
 ];
 }

 return commonLayers;
}

function projectNameFromPrompt(prompt: string) {
 const normalized = normalizePrompt(prompt);
 if (!normalized) return "Engineering Automation Template";

 const forMatch = normalized.match(/\bfor\s+([^.,;:!?]+)(?:[.,;:!?]|$)/i);
 if (forMatch?.[1]) {
 const candidate = titleCase(forMatch[1].trim());
 if (candidate.length >= 3) return candidate;
 }

 const firstSegment = normalized.split(/[.,;:!?]/)[0]?.trim() ?? "";
 const firstWords = firstSegment.split(/\s+/).slice(0, 5).join(" ");
 const candidate = titleCase(firstWords);
 return candidate || "Engineering Automation Template";
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
 summary: `A ${websiteType.toLowerCase()} with clear inputs, automation layers, validation steps, and export-ready outputs.`,
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
 summary: typeof value.summary === "string" ? value.summary : `A ${websiteType.toLowerCase()} with clear inputs, automation layers, validation steps, and export-ready outputs.`,
 notes: isStringArray(value.notes) && value.notes.length ? value.notes : inferNotes(prompt, websiteType),
 layers,
 source,
 generatedAt: typeof value.generatedAt === "string" ? value.generatedAt : new Date().toISOString(),
 };
}
