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
  return Math.round(value / step) * step;
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
  return `${value.toFixed(settings.unit === "m" ? Math.max(2, settings.precision) : 0)} ${suffix}`;
}

export function floorSnapPoint(point: FloorPlanPoint, objects: FloorPlanObject[], settings: FloorPlanSettings, zoom: number) {
  const candidates: Array<{ point: FloorPlanPoint; priority: number }> = [];
  const tolerance = Math.max(0.06, 10 / zoom);
  const grid = Math.max(0.001, settings.gridStepMm / 1000);
  if (settings.snapToGrid) {
    candidates.push({ point: { x: Math.round(point.x / grid) * grid, y: Math.round(point.y / grid) * grid }, priority: 4 });
  }
  if (settings.snapToPoints) {
    const walls = objects.filter((item): item is Extract<FloorPlanObject, { type: "wall" }> => item.type === "wall");
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
