import type { FloorPlanObject, FloorPlanSettings } from "./types";
import { floorOpeningSegments, formatFloorLength } from "./floor-plan-geometry";

type Bounds = { minX: number; minY: number; maxX: number; maxY: number };
const marginMm = 10;
const paperSizes: Record<number, [number, number]> = { 20: [297, 210], 50: [297, 210], 100: [297, 210], 200: [420, 297] };

function boundsOf(objects: FloorPlanObject[]): Bounds {
  const points: Array<{ x: number; y: number }> = [];
  objects.forEach(object => {
    if (object.type === "wall" || object.type === "dimension") {
      const radius = object.type === "wall" ? object.thickness / 2 : 0;
      for (const p of [object.start, object.end]) points.push({ x: p.x - radius, y: p.y - radius }, { x: p.x + radius, y: p.y + radius });
    }
    else if (object.type === "door" || object.type === "window") points.push(...floorOpeningSegments(object).flat());
    else if ("width" in object && "height" in object) points.push({ x: object.x, y: object.y }, { x: object.x + object.width, y: object.y + object.height });
    else if (object.type === "text") points.push({ x: object.x, y: object.y });
  });
  if (!points.length) points.push({ x: 0, y: 0 }, { x: 1, y: 1 });
  return { minX: Math.min(...points.map(p => p.x)), minY: Math.min(...points.map(p => p.y)), maxX: Math.max(...points.map(p => p.x)), maxY: Math.max(...points.map(p => p.y)) };
}

export function floorPlanPaper(objects: FloorPlanObject[], settings: FloorPlanSettings) {
  const [longSide, shortSide] = paperSizes[settings.scale] ?? paperSizes[100];
  const bounds = boundsOf(objects);
  const extentX = Math.max(.001, bounds.maxX - bounds.minX);
  const extentY = Math.max(.001, bounds.maxY - bounds.minY);
  const [width, height] = extentX >= extentY ? [longSide, shortSide] : [shortSide, longSide];
  // One uniform fit for vector and raster exports, independent of viewport pan/zoom.
  const mmPerMeter = Math.min((width - marginMm * 2) / extentX, (height - marginMm * 2) / extentY);
  return { width, height, bounds, scale: 1000 / mmPerMeter,
    offsetX: (width - (bounds.maxX - bounds.minX) * mmPerMeter) / 2,
    offsetY: (height - (bounds.maxY - bounds.minY) * mmPerMeter) / 2 };
}

function point(value: number, origin: number, scale: number, offset: number) {
  return offset + (value - origin) * 1000 / scale;
}

export function floorPlanSvg(objects: FloorPlanObject[], settings: FloorPlanSettings) {
  const paper = floorPlanPaper(objects, settings);
  const sx = (value: number) => point(value, paper.bounds.minX, paper.scale, paper.offsetX);
  const sy = (value: number) => point(value, paper.bounds.minY, paper.scale, paper.offsetY);
  const line = (content: string, className = "secondary") => `<g class="${className}">${content}</g>`;
  const content = objects.map(object => {
    if (object.type === "wall") return line(`<line x1="${sx(object.start.x)}" y1="${sy(object.start.y)}" x2="${sx(object.end.x)}" y2="${sy(object.end.y)}" stroke-width="${Math.max(.15, object.thickness * 1000 / paper.scale)}"/>`, object.exterior ? "primary" : "wall");
    if (object.type === "room") return line(`<rect x="${sx(object.x)}" y="${sy(object.y)}" width="${object.width * 1000 / paper.scale}" height="${object.height * 1000 / paper.scale}"/><text x="${sx(object.x + object.width / 2)}" y="${sy(object.y + object.height / 2)}">${escapeXml(object.label)}</text>`, "room");
    if (object.type === "door" || object.type === "window") return `<rect x="${-object.width * 500 / paper.scale}" y="${-object.height * 500 / paper.scale}" width="${object.width * 1000 / paper.scale}" height="${object.height * 1000 / paper.scale}" fill="#fafaf7" transform="translate(${sx(object.x)} ${sy(object.y)}) rotate(${object.rotation})"/>${line(floorOpeningSegments(object).map(segment => `<polyline points="${segment.map(point => `${sx(point.x)},${sy(point.y)}`).join(" ")}" fill="none"/>`).join(""), object.type)}`;
    if (object.type === "furniture" || object.type === "column") return line(`<rect x="${sx(object.x)}" y="${sy(object.y)}" width="${object.width * 1000 / paper.scale}" height="${object.height * 1000 / paper.scale}"/>${object.type === "furniture" ? `<text x="${sx(object.x + object.width / 2)}" y="${sy(object.y + object.height / 2)}">${escapeXml(object.label)}</text>` : ""}`, object.type);
    if (object.type === "stairs") return line(`<rect x="${sx(object.x)}" y="${sy(object.y)}" width="${object.width * 1000 / paper.scale}" height="${object.height * 1000 / paper.scale}"/>${Array.from({ length: object.steps }, (_, i) => `<line x1="${sx(object.x)}" y1="${sy(object.y + object.height * (i + 1) / object.steps)}" x2="${sx(object.x + object.width)}" y2="${sy(object.y + object.height * (i + 1) / object.steps)}"/>`).join("")}`, "stairs");
    if (object.type === "dimension") return line(`<line x1="${sx(object.start.x)}" y1="${sy(object.start.y)}" x2="${sx(object.end.x)}" y2="${sy(object.end.y)}"/><text x="${(sx(object.start.x) + sx(object.end.x)) / 2}" y="${(sy(object.start.y) + sy(object.end.y)) / 2 - 2}">${escapeXml(object.label ?? formatFloorLength(Math.hypot(object.end.x - object.start.x, object.end.y - object.start.y), settings))}</text>`, "dimension");
    return line(`<text x="${sx(object.x)}" y="${sy(object.y)}">${escapeXml(object.text)}</text>`, "annotation");
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${paper.width}mm" height="${paper.height}mm" viewBox="0 0 ${paper.width} ${paper.height}"><rect width="100%" height="100%" fill="#fafaf7"/><style>line{fill:none;stroke:#26313b;stroke-linecap:round}.primary{stroke-width:0.8}.wall{stroke-width:0.45}.secondary{stroke:#64748b;stroke-width:0.25}.room{stroke:#b6c2c5;stroke-width:0.2;fill:#eef2f0}.door{stroke:#475569;stroke-width:0.3;fill:#fafaf7}.window{stroke:#0891b2;stroke-width:0.35;fill:#e0f2fe}.furniture{stroke:#64748b;stroke-width:0.25;fill:#d7dee5}.column{stroke:#334155;stroke-width:0.35;fill:#cbd5e1}.stairs{stroke:#475569;stroke-width:0.25;fill:none}.dimension{stroke:#a16207;stroke-width:0.25;stroke-dasharray:2 1;fill:none}.annotation{stroke:none;fill:#334155}text{font:3px Arial;fill:#334155;text-anchor:middle}</style>${content}<text x="${paper.width - marginMm}" y="${paper.height - 5}" style="text-anchor:end;font-size:2.5px">Fit to page · ${settings.unit}</text></svg>`;
}

function escapeXml(value: string) { return value.replace(/[<>&'"]/g, character => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[character] ?? character)); }

export function svgToPdf(objects: FloorPlanObject[], settings: FloorPlanSettings) {
  const paper = floorPlanPaper(objects, settings);
  const sx = (value: number) => paper.offsetX + (value - paper.bounds.minX) * 1000 / paper.scale;
  const sy = (value: number) => paper.height - paper.offsetY - (value - paper.bounds.minY) * 1000 / paper.scale;
  const commands = objects.map(object => {
    if (object.type === "wall" || object.type === "dimension") return `${object.type === "wall" ? Math.max(.15, object.thickness * 1000 / paper.scale) * 2.83465 : .8} w ${sx(object.start.x) * 2.83465} ${sy(object.start.y) * 2.83465} m ${sx(object.end.x) * 2.83465} ${sy(object.end.y) * 2.83465} l S`;
    if (object.type === "door" || object.type === "window") {
      const radians = object.rotation * Math.PI / 180, c = Math.cos(radians), s = Math.sin(radians);
      const corners = [[-.5, -.5], [.5, -.5], [.5, .5], [-.5, .5]].map(([x, y]) => ({ x: object.x + x * object.width * c - y * object.height * s, y: object.y + x * object.width * s + y * object.height * c }));
      const path = (points: Array<{ x: number; y: number }>) => points.map((point, index) => `${sx(point.x) * 2.83465} ${sy(point.y) * 2.83465} ${index ? "l" : "m"}`).join(" ");
      return `q 1 1 1 rg ${path(corners)} h f Q\n0.8 w ${floorOpeningSegments(object).map(segment => `${path(segment)} S`).join("\n")}`;
    }
    if ("width" in object && "height" in object) {
      const x = object.x;
      const y = object.y;
      const rectangle = `${sx(x) * 2.83465} ${sy(y + object.height) * 2.83465} ${object.width * 1000 / paper.scale * 2.83465} ${object.height * 1000 / paper.scale * 2.83465} re S`;
      const label = object.type === "room" || object.type === "furniture" ? `BT /F1 8 Tf ${sx(object.x + object.width / 2) * 2.83465} ${sy(object.y + object.height / 2) * 2.83465} Td (${escapePdf(object.label)}) Tj ET` : "";
      return `0.8 w ${rectangle}\n${label}`;
    }
    if (object.type === "text") return `BT /F1 8 Tf ${sx(object.x) * 2.83465} ${sy(object.y) * 2.83465} Td (${escapePdf(object.text)}) Tj ET`;
    return "";
  }).join("\n");
  const stream = `0.15 0.19 0.23 RG 0.8 w\n${commands}\nBT /F1 8 Tf 20 20 Td (Casynus Floor Plan - Fit to page) Tj ET\n`;
  const pdfObjects = [`<< /Type /Catalog /Pages 2 0 R >>`, `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${paper.width * 2.83465} ${paper.height * 2.83465}] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>`, `<< /Length ${stream.length} >>\nstream\n${stream}endstream`, `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  pdfObjects.forEach((object, index) => { offsets[index + 1] = pdf.length; pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length; pdf += `xref\n0 ${pdfObjects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size ${pdfObjects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

function escapePdf(value: string) { return value.replace(/[\\()]/g, character => `\\${character}`); }
