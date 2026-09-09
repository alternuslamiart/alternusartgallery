export type MaterialName = "Titanium" | "Aluminum" | "Steel" | "Carbon Fiber" | "Plastic" | "Glass" | "Rubber";

export type StudioAsset = {
  id: string;
  name: string;
  prompt: string;
  category: string;
  thumbnail: string;
  createdAt: string;
  status: "ready" | "generating" | "error";
};

export type Transform = {
  x: number;
  y: number;
  z?: number;
  rotation: number;
  scale: number;
};

export type StudioTool = "orbit" | "focus" | "move" | "rotate" | "scale" | "ai" | "select" | "brush" | "tools" | "model" | "viewport";

export type StudioMode = "floor-plan" | "modeling" | "images";

export type FloorPlanObject =
  | { id: string; type: "wall"; start: { x: number; y: number }; end: { x: number; y: number }; thickness: number; exterior?: boolean }
  | { id: string; type: "door"; x: number; y: number; width: number; height: number; rotation: number; swing?: "in" | "out"; side?: "left" | "right" }
  | { id: string; type: "window"; x: number; y: number; width: number; height: number; rotation: number; sillHeight?: number; windowType?: "single" | "double" }
  | { id: string; type: "room"; x: number; y: number; width: number; height: number; label: string }
  | { id: string; type: "dimension"; start: { x: number; y: number }; end: { x: number; y: number }; label?: string }
  | { id: string; type: "text"; x: number; y: number; text: string }
  | { id: string; type: "furniture"; x: number; y: number; width: number; height: number; label: string }
  | { id: string; type: "column"; x: number; y: number; width: number; height: number }
  | { id: string; type: "stairs"; x: number; y: number; width: number; height: number; steps: number };

export type FloorPlanPoint = { x: number; y: number };

export type FloorPlanSettings = {
  unit: "mm" | "cm" | "m";
  scale: number;
  precision: number;
  gridStepMm: number;
  snapToGrid: boolean;
  snapToPoints: boolean;
  orthogonal: boolean;
};

export type RenderSettings = {
  resolution: string;
  sampleCount: number;
  exposure: number;
};
