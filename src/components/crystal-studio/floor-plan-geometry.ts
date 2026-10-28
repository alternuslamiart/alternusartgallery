import type { FloorPlanObject, FloorPlanPoint, FloorPlanSettings } from "./types";

export const DEFAULT_FLOOR_PLAN_SETTINGS: FloorPlanSettings = {
  unit: "mm",
  scale: 100,
  precision: 1,
  gridStepMm: 100,
  snapToGrid: true,
  snapToPoints: true,
  orthogonal: true,
};

export function roundFloorValue(value: number, precision: number) {
  const step = Math.max(1, precision) / 1000;
  return Number((Math.round(value / step) * step).toFixed(12));
}

export function parseFloorLength(value: string, fallbackUnit: FloorPlanSettings["unit"] = "m") {
  const match = value.trim().match(/^(-?\d+(?:[.,]\d+)?)\s*(mm|millimet(?:er|re)s?|cm|centimet(?:er|re)s?|m|met(?:er|re)s?)?$/i);
  if (!match) return null;
  const amount = Number(match[1].replace(",", "."));
  if (!Number.isFinite(amount)) return null;
  const unit = (match[2] ?? fallbackUnit).toLowerCase();
  const meters = unit.startsWith("mm") || unit.startsWith("mill") ? amount / 1000 : unit.startsWith("cm") || unit.startsWith("cent") ? amount / 100 : amount;
  return meters;
}

export function formatFloorLength(meters: number, settings: FloorPlanSettings) {
  const value = settings.unit === "mm" ? meters * 1000 : settings.unit === "cm" ? meters * 100 : meters;
  const suffix = settings.unit;
  const unitFactor = settings.unit === "mm" ? 1000 : settings.unit === "cm" ? 100 : 1;
  const decimals = Math.min(6, Math.max(0, Math.ceil(-Math.log10(Math.max(1, settings.precision) / 1000 * unitFactor))));
  return `${value.toFixed(decimals)} ${suffix}`;
}

export function floorSnapPoint(point: FloorPlanPoint, objects: FloorPlanObject[], settings: FloorPlanSettings, zoom: number) {
  const candidates: Array<{ point: FloorPlanPoint; priority: number }> = [];
  const tolerance = Math.max(0.06, 10 / zoom);
  const grid = Math.max(0.001, settings.gridStepMm / 1000);
  if (settings.snapToGrid) {
    candidates.push({ point: { x: Math.round(point.x / grid) * grid, y: Math.round(point.y / grid) * grid }, priority: 4 });
  }
  if (settings.snapToPoints) {
    const walls = objects.filter((item): item is Extract<FloorPlanObject, { type: "wall" | "arc-wall" }> => item.type === "wall" || item.type === "arc-wall");
    walls.forEach((wall) => {
      candidates.push({ point: wall.start, priority: 0 }, { point: wall.end, priority: 0 });
      candidates.push({ point: { x: (wall.start.x + wall.end.x) / 2, y: (wall.start.y + wall.end.y) / 2 }, priority: 1 });
      const dx = wall.end.x - wall.start.x, dy = wall.end.y - wall.start.y;
      const lengthSquared = dx * dx + dy * dy;
      if (lengthSquared > 0) {
        const t = Math.max(0, Math.min(1, ((point.x - wall.start.x) * dx + (point.y - wall.start.y) * dy) / lengthSquared));
        candidates.push({ point: { x: wall.start.x + dx * t, y: wall.start.y + dy * t }, priority: 2 });
      }
    });
    const intersections: FloorPlanPoint[] = [];
    const intersectionWalls = objects.filter((item): item is Extract<FloorPlanObject, { type: "wall" }> => item.type === "wall");
    for (let i = 0; i < intersectionWalls.length; i += 1) for (let j = i + 1; j < intersectionWalls.length; j += 1) {
      const a = intersectionWalls[i], b = intersectionWalls[j];
      const denominator = (a.end.x - a.start.x) * (b.end.y - b.start.y) - (a.end.y - a.start.y) * (b.end.x - b.start.x);
      if (Math.abs(denominator) < 1e-9) continue;
      const ua = ((b.start.x - a.start.x) * (b.end.y - b.start.y) - (b.start.y - a.start.y) * (b.end.x - b.start.x)) / denominator;
      const ub = ((b.start.x - a.start.x) * (a.end.y - a.start.y) - (b.start.y - a.start.y) * (a.end.x - a.start.x)) / denominator;
      if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) intersections.push({ x: a.start.x + ua * (a.end.x - a.start.x), y: a.start.y + ua * (a.end.y - a.start.y) });
    }
    intersections.forEach(candidate => candidates.push({ point: candidate, priority: 0 }));
  }
  return candidates
    .map(candidate => ({ ...candidate, distance: Math.hypot(candidate.point.x - point.x, candidate.point.y - point.y) }))
    .filter(candidate => candidate.distance <= tolerance)
    .sort((a, b) => a.priority - b.priority || a.distance - b.distance)[0]?.point ?? point;
}

export function floorDoorSymbol(door: { width: number; side?: "left" | "right"; swing?: "in" | "out" }) {
  const left = door.side === "left", inward = door.swing !== "out";
  const hinge = { x: (left ? -1 : 1) * door.width / 2, y: 0 };
  const closed = { x: -hinge.x, y: 0 };
  const open = { x: hinge.x, y: (inward ? 1 : -1) * door.width };
  const sweep = left === inward ? 1 : 0;
  return { hinge, closed, open, arc: `M ${closed.x} 0 A ${door.width} ${door.width} 0 0 ${sweep} ${open.x} ${open.y}` };
}

export function floorPlaceOpening(point: FloorPlanPoint, width: number, objects: FloorPlanObject[], zoom: number) {
  let best: { point: FloorPlanPoint; rotation: number; thickness: number; distance: number } | null = null;
  for (const wall of objects) {
    if (wall.type !== "wall") continue;
    const dx = wall.end.x - wall.start.x, dy = wall.end.y - wall.start.y, length = Math.hypot(dx, dy);
    if (length < width || length < .001) continue;
    const clearance = width / (2 * length);
    const t = Math.max(clearance, Math.min(1 - clearance, ((point.x - wall.start.x) * dx + (point.y - wall.start.y) * dy) / (length * length)));
    const projected = { x: wall.start.x + t * dx, y: wall.start.y + t * dy };
    // Test proximity to the segment before endpoint clearance, so its ends remain usable.
    const rawT = Math.max(0, Math.min(1, ((point.x - wall.start.x) * dx + (point.y - wall.start.y) * dy) / (length * length)));
    const distance = Math.hypot(point.x - wall.start.x - rawT * dx, point.y - wall.start.y - rawT * dy);
    if (distance <= Math.max(wall.thickness / 2 + .08, 12 / zoom) && (!best || distance < best.distance))
      best = { point: projected, rotation: Math.atan2(dy, dx) * 180 / Math.PI, thickness: wall.thickness, distance };
  }
  return best;
}

export function floorTranslateObject(object: FloorPlanObject, delta: FloorPlanPoint, objects: FloorPlanObject[], settings: FloorPlanSettings, zoom: number): FloorPlanObject {
  const anchor = "start" in object ? object.start : { x: object.x, y: object.y };
  const others = objects.filter(item => item.id !== object.id);
  const desired = { x: anchor.x + delta.x, y: anchor.y + delta.y };
  if (object.type === "door" || object.type === "window") {
    const placed = floorPlaceOpening(desired, object.width, others, zoom);
    if (placed) return { ...object, x: placed.point.x, y: placed.point.y, rotation: placed.rotation, height: placed.thickness };
    // Keep openings on their original wall when the pointer leaves all valid walls.
    return object;
  }
  const snapped = floorSnapPoint(desired, others, settings, zoom);
  const x = roundFloorValue(snapped.x, settings.precision), y = roundFloorValue(snapped.y, settings.precision);
  if ("start" in object) return { ...object, start: { x, y }, end: { x: roundFloorValue(object.end.x + x - anchor.x, settings.precision), y: roundFloorValue(object.end.y + y - anchor.y, settings.precision) } };
  return { ...object, x, y };
}

export type FloorPlanHistory = { past: FloorPlanObject[][]; present: FloorPlanObject[]; future: FloorPlanObject[][] };
export function floorPlanHistoryReducer(state: FloorPlanHistory, action: { type: "undo" } | { type: "redo" } | {type:"replace";next:FloorPlanObject[]} | { type: "commit"; next: FloorPlanObject[] | ((previous: FloorPlanObject[]) => FloorPlanObject[]) }): FloorPlanHistory {
  if(action.type==='replace')return{past:[],future:[],present:action.next};
  if (action.type === "undo") {
    if (!state.past.length) return state;
    return { past: state.past.slice(0, -1), present: state.past[state.past.length - 1], future: [state.present, ...state.future].slice(0, 100) };
  }
  if (action.type === "redo") {
    if (!state.future.length) return state;
    return { past: [...state.past, state.present].slice(-100), present: state.future[0], future: state.future.slice(1) };
  }
  const next = typeof action.next === "function" ? action.next(state.present) : action.next;
  if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
  return { past: [...state.past, state.present].slice(-100), present: next, future: [] };
}

// The same detailed symbol geometry is used by vector exports and their bounds.
export function floorOpeningSegments(opening: Extract<FloorPlanObject, { type: "door" | "window" }>): FloorPlanPoint[][] {
  const w = opening.width / 2, h = opening.height / 2;
  const segments: FloorPlanPoint[][] = [
    [{ x: -w, y: -h }, { x: -w, y: h }], [{ x: w, y: -h }, { x: w, y: h }],
  ];
  if (opening.type === "door") {
    const symbol = floorDoorSymbol(opening), direction = opening.side === "left" ? 1 : -1, sign = opening.swing === "out" ? -1 : 1;
    segments.push([symbol.hinge, symbol.open], Array.from({ length: 33 }, (_, i) => {
      const angle = i / 32 * Math.PI / 2;
      return { x: symbol.hinge.x + direction * opening.width * Math.cos(angle), y: sign * opening.width * Math.sin(angle) };
    }));
  } else {
    for (const y of [-h, 0, h]) segments.push([{ x: -w, y }, { x: w, y }]);
    if (opening.windowType !== "single") segments.push([{ x: 0, y: -h }, { x: 0, y: h }]);
  }
  const radians = opening.rotation * Math.PI / 180, c = Math.cos(radians), s = Math.sin(radians);
  return segments.map(segment => segment.map(point => ({ x: opening.x + point.x * c - point.y * s, y: opening.y + point.x * s + point.y * c })));
}
