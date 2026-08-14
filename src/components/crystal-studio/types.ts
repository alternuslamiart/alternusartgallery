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
  rotation: number;
  scale: number;
};

export type StudioTool = "orbit" | "focus" | "move" | "rotate" | "scale" | "select" | "brush" | "tools" | "model" | "viewport";

export type RenderSettings = {
  resolution: string;
  sampleCount: number;
  exposure: number;
};
