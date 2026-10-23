import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';
const exports = {};
new Function('exports', ts.transpileModule(fs.readFileSync('src/components/crystal-studio/floor-plan-geometry.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(exports);
const { floorDoorSymbol, floorPlaceOpening, floorTranslateObject, DEFAULT_FLOOR_PLAN_SETTINGS: settings } = exports;
const wall = { id: 'wall', type: 'wall', start: { x: 0, y: 0 }, end: { x: 8, y: 0 }, thickness: .24 };
test('restoring another identity or drawing clears the previous undo history',()=>{
 const previous={past:[[wall]],present:[wall],future:[[wall]]};
 const replaced=exports.floorPlanHistoryReducer(previous,{type:'replace',next:[]});
 assert.deepEqual(replaced,{past:[],present:[],future:[]});
 assert.deepEqual(exports.floorPlanHistoryReducer(replaced,{type:'undo'}).present,[]);
});

test('unit formatting retains millimeter precision in meters and centimeters', () => {
  assert.equal(exports.formatFloorLength(1.001, { ...settings, unit: 'm' }), '1.001 m');
  assert.equal(exports.formatFloorLength(1.001, { ...settings, unit: 'cm' }), '100.1 cm');
});

test('all four door handedness/swing combinations produce a real quarter circle and hinged leaf', () => {
  for (const side of ['left', 'right']) for (const swing of ['in', 'out']) {
    const d = floorDoorSymbol({ width: 1, side, swing });
    assert.equal(d.hinge.x, side === 'left' ? -.5 : .5);
    assert.equal(d.open.y, swing === 'in' ? 1 : -1);
    assert.equal(d.open.x, d.hinge.x);
    assert.equal(Math.hypot(d.closed.x - d.hinge.x, d.closed.y - d.hinge.y), 1);
    assert.match(d.arc, /^M /);
  }
});

test('openings align with a wall, respect its thickness and cannot extend beyond endpoints', () => {
  const p = floorPlaceOpening({ x: 0, y: .1 }, 1, [wall], 72);
  assert.equal(p.point.x, .5); assert.equal(p.point.y, 0); assert.equal(p.rotation, 0); assert.equal(p.thickness, .24);
  assert.equal(floorPlaceOpening({ x: 4, y: 2 }, 1, [wall], 72), null);
  assert.equal(floorPlaceOpening({ x: 0, y: 0 }, 10, [wall], 72), null);
  const vertical = { ...wall, end: { x: 0, y: 8 } };
  assert.equal(floorPlaceOpening({ x: .1, y: 3 }, 1, [vertical], 72).rotation, 90);
});

test('drag preserves dimensions and wall vector, snaps the anchor and never mutates the source', () => {
  const original = structuredClone(wall);
  const moved = floorTranslateObject(wall, { x: 1.234, y: 2.345 }, [], settings, 72);
  assert.equal(moved.start.x, 1.2); assert.equal(moved.start.y, 2.3);
  assert.ok(Math.abs(moved.end.x - moved.start.x - 8) < 1e-9);
  assert.deepEqual(wall, original);
  const room = { id: 'r', type: 'room', x: -2, y: 1, width: 4.2, height: 3.1, label: 'Room' };
  const next = floorTranslateObject(room, { x: .234, y: .345 }, [], { ...settings, snapToGrid: false, snapToPoints: false }, 72);
  assert.equal(next.x, -1.766); assert.equal(next.y, 1.345); assert.equal(next.width, room.width);
});

test('history records one drag commit, supports undo/redo, clears future on a new edit and bounds memory', () => {
  const reduce = exports.floorPlanHistoryReducer;
  const initial = { past: [], present: [wall], future: [] };
  assert.equal(reduce(initial, { type: 'commit', next: structuredClone(initial.present) }), initial);
  const moved = floorTranslateObject(wall, { x: 1, y: 1 }, [], settings, 72);
  const edited = reduce(initial, { type: 'commit', next: [moved] });
  const undone = reduce(edited, { type: 'undo' });
  assert.deepEqual(undone.present, [wall]);
  assert.deepEqual(reduce(undone, { type: 'redo' }).present, [moved]);
  assert.equal(reduce(undone, { type: 'commit', next: [moved, { ...moved, id: 'new' }] }).future.length, 0);
  let history = initial;
  for (let i = 0; i < 110; i++) history = reduce(history, { type: 'commit', next: [{ ...wall, thickness: i }] });
  assert.equal(history.past.length, 100);
});
