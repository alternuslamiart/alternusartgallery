import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';

function load(name) {
  const code = ts.transpileModule(fs.readFileSync(new URL(`../src/components/crystal-studio/${name}.ts`, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function('require', 'exports', code)(id => {
    assert.equal(id, './floor-plan-geometry');
    return load('floor-plan-geometry');
  }, exports);
  return exports;
}
const { floorPlanPaper, floorPlanSvg, svgToPdf } = load('floor-plan-export');
const { DEFAULT_FLOOR_PLAN_SETTINGS: settings } = load('floor-plan-geometry');
const room = (x, y, width, height) => ({ id: 'room', type: 'room', x, y, width, height, label: 'Living room' });
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);

test('small and large imported plans fill and center on a standard sheet without distortion', () => {
  for (const size of [0.08, 8, 800]) {
    const p = floorPlanPaper([room(-12, 27, size, size * .75)], settings);
    const width = size * 1000 / p.scale, height = size * .75 * 1000 / p.scale;
    near(p.offsetX, (p.width - width) / 2);
    near(p.offsetY, (p.height - height) / 2);
    near(Math.min(p.offsetX, p.offsetY), 10);
    assert.ok(width / p.width > .8 && height / p.height > .8);
    assert.equal(p.width, 297);
    assert.equal(p.height, 210);
  }
});

test('portrait plans rotate the sheet, not the geometry; degenerate documents stay finite', () => {
  const p = floorPlanPaper([room(0, 0, 6, 8)], settings);
  assert.equal(p.width, 210); assert.equal(p.height, 297);
  for (const objects of [[], [{ id: 't', type: 'text', x: 2, y: -5, text: 'Note' }]]) {
    const paper = floorPlanPaper(objects, settings);
    for (const key of ['width', 'height', 'scale', 'offsetX', 'offsetY']) assert.ok(Number.isFinite(paper[key]));
  }
});

test('fit includes wall thickness and centered door/window extents', () => {
  const p = floorPlanPaper([
    { id: 'w', type: 'wall', start: { x: 0, y: 0 }, end: { x: 8, y: 6 }, thickness: .2 },
    { id: 'd', type: 'door', x: 0, y: 3, width: 1, height: .2, rotation: 0 },
  ], settings);
  assert.deepEqual(p.bounds, { minX: -.5, minY: -.1, maxX: 8.1, maxY: 6.1 });
});

test('SVG and PDF share fit coordinates and explicitly label fitted output', () => {
  const objects = [room(-2, -3, 8, 6)];
  const p = floorPlanPaper(objects, settings), svg = floorPlanSvg(objects, settings), pdf = svgToPdf(objects, settings);
  assert.ok(svg.includes(`x="${p.offsetX}" y="${p.offsetY}"`));
  assert.ok(svg.includes(`width="${8 * 1000 / p.scale}"`));
  assert.ok(pdf.includes(`${p.offsetX * 2.83465} ${(p.height - p.offsetY - 6 * 1000 / p.scale) * 2.83465}`));
  assert.match(svg, /Fit to page/); assert.match(pdf, /Fit to page/);
  assert.doesNotMatch(svg, /Scale 1:100/); assert.doesNotMatch(pdf, /Scale 1:100/);
});

test('rotated door leaf and arc stay within fitted bounds and export with the chosen hand/swing', () => {
  const door = { id: 'door', type: 'door', x: -2, y: 4, width: 1, height: .2, rotation: 90, side: 'left', swing: 'out' };
  const paper = floorPlanPaper([door], settings), svg = floorPlanSvg([door], settings), pdf = svgToPdf([door], settings);
  assert.ok(paper.bounds.maxX >= -1); assert.ok(paper.bounds.minY <= 3.5); assert.ok(paper.bounds.maxY >= 4.5);
  assert.match(svg, /rotate\(90\)/); assert.match(svg, /polyline points=/);
  assert.notEqual(svg, floorPlanSvg([{ ...door, side: 'right' }], settings));
  assert.notEqual(pdf, svgToPdf([{ ...door, swing: 'in' }], settings));
});
