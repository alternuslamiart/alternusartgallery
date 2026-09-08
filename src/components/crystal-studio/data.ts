import type { MaterialName, StudioAsset, StudioTool } from "./types";
import { Box, Brush, CirclePlay, Crosshair, Cuboid, Focus, MousePointer2, Move3d, Rotate3d, Scaling, Wrench } from "lucide-react";

export const materials: MaterialName[] = ["Titanium", "Aluminum", "Steel", "Carbon Fiber", "Plastic", "Glass", "Rubber"];

export const initialAssets: StudioAsset[] = [
  { id: "industrial-desk", name: "Industrial Desk", prompt: "Industrial desk", category: "Furniture", thumbnail: "from-zinc-700 via-zinc-500 to-zinc-800", createdAt: "2026-08-14T10:00:00.000Z", status: "ready" },
  { id: "gaming-mouse", name: "Gaming Mouse", prompt: "Gaming mouse", category: "Product", thumbnail: "from-blue-950 via-blue-600 to-cyan-400", createdAt: "2026-08-14T10:00:00.000Z", status: "ready" },
  { id: "robot-arm", name: "Robot Arm", prompt: "Robot arm", category: "Machinery", thumbnail: "from-orange-900 via-zinc-500 to-zinc-800", createdAt: "2026-08-14T10:00:00.000Z", status: "ready" },
  { id: "drone", name: "Drone", prompt: "Industrial drone", category: "Aerospace", thumbnail: "from-slate-800 via-sky-800 to-slate-500", createdAt: "2026-08-14T10:00:00.000Z", status: "ready" },
];

export const modelingTools: Array<{ id: StudioTool; label: string; icon: typeof Box }> = [
  { id: "orbit", label: "Realtime — Play / Pause", icon: CirclePlay },
  { id: "focus", label: "Focus selection", icon: Focus },
  { id: "move", label: "Move — W", icon: Move3d },
  { id: "rotate", label: "Rotate — E", icon: Rotate3d },
  { id: "scale", label: "Edit Object", icon: Scaling },
  { id: "select", label: "Select — Q", icon: MousePointer2 },
  { id: "brush", label: "Draw", icon: Brush },
  { id: "tools", label: "Measure / Tools", icon: Wrench },
  { id: "model", label: "Add Object / Asset", icon: Cuboid },
  { id: "viewport", label: "Viewport Navigation", icon: Crosshair },
];
