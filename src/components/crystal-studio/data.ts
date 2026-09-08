import type { MaterialName, StudioAsset, StudioTool } from "./types";
import type { ComponentType } from "react";
import { CubeFilled, DrawFilled, EditFaceFilled, FocusFilled, MeasureFilled, MoveFilled, NavigationFilled, PlayFilled, PointerFilled, RotateFilled, SparkleFilled } from "./filled-icons";

export const materials: MaterialName[] = ["Titanium", "Aluminum", "Steel", "Carbon Fiber", "Plastic", "Glass", "Rubber"];

export const initialAssets: StudioAsset[] = [
  { id: "industrial-desk", name: "Industrial Desk", prompt: "Industrial desk", category: "Furniture", thumbnail: "from-zinc-700 via-zinc-500 to-zinc-800", createdAt: "2026-08-14T10:00:00.000Z", status: "ready" },
  { id: "gaming-mouse", name: "Gaming Mouse", prompt: "Gaming mouse", category: "Product", thumbnail: "from-blue-950 via-blue-600 to-cyan-400", createdAt: "2026-08-14T10:00:00.000Z", status: "ready" },
  { id: "robot-arm", name: "Robot Arm", prompt: "Robot arm", category: "Machinery", thumbnail: "from-orange-900 via-zinc-500 to-zinc-800", createdAt: "2026-08-14T10:00:00.000Z", status: "ready" },
  { id: "drone", name: "Drone", prompt: "Industrial drone", category: "Aerospace", thumbnail: "from-slate-800 via-sky-800 to-slate-500", createdAt: "2026-08-14T10:00:00.000Z", status: "ready" },
];

export const modelingTools: Array<{ id: StudioTool; label: string; icon: ComponentType<{ size?: number | string; strokeWidth?: number | string; className?: string }> }> = [
  { id: "orbit", label: "Realtime — Play / Pause", icon: PlayFilled },
  { id: "focus", label: "Focus Selected", icon: FocusFilled },
  { id: "move", label: "Move — W", icon: MoveFilled },
  { id: "rotate", label: "Rotate — E", icon: RotateFilled },
  { id: "scale", label: "Edit Object", icon: EditFaceFilled },
  { id: "select", label: "Select — Q", icon: PointerFilled },
  { id: "brush", label: "Draw", icon: DrawFilled },
  { id: "tools", label: "Measure / Tools", icon: MeasureFilled },
  { id: "model", label: "Object / Asset", icon: CubeFilled },
  { id: "viewport", label: "Viewport Navigation", icon: NavigationFilled },
];
