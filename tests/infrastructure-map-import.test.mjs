import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importGeographicFeature } from '../src/lib/infrastructure/map-import.mjs';
import { localMeters } from '../src/lib/infrastructure/map-features.mjs';
import { makeDocument, validateDocument, commitHistory, undoHistory, redoHistory } from '../src/lib/scene/document.mjs';
const polygon = properties => ({ type: 'Feature', properties, geometry: { type: 'Polygon', coordinates: [[[13,52],[13.0001,52],[13.0001,52.0001],[13,52.0001],[13,52]]] } });
test('building import uses actual footprint and meter heights with preserved source and undo/redo', () => {
  const document = makeDocument(), objects = importGeographicFeature(polygon({ building: 'yes', height: 18, min_height: 3 }));
  const mesh = objects[0], positions = mesh.geometry.positions;
  assert.ok(Math.abs(Math.min(...positions.filter((_, i) => i % 3 === 1))) < 1e-8);
  assert.equal(Math.max(...positions.filter((_, i) => i % 3 === 1)), 15);
  assert.equal(mesh.position[1], 3);
  let history = commitHistory({ past: [], present: document, future: [] }, { ...document, objects });
  assert.deepEqual(validateDocument(JSON.parse(JSON.stringify(history.present))).objects[0].geographic, mesh.geographic);
  history = undoHistory(history); assert.equal(history.present.objects.length, 0);
  history = redoHistory(history); assert.deepEqual(history.present.objects, objects);
});
test('conversion rejects missing height, road centerlines, distant and malformed geometry', () => {
  assert.throws(() => importGeographicFeature(polygon({ building: 'yes' })), /height/);
  assert.throws(() => importGeographicFeature(polygon({ building: 'yes', height: 4, min_height: 5 })), /height/);
  assert.throws(() => importGeographicFeature({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[13,52],[13.1,52]] } }), /centerlines/);
  assert.throws(() => importGeographicFeature(polygon({}), [0, 0]), /2 km/);
  const invalid = polygon({}); invalid.geometry.coordinates[0].pop();
  assert.throws(() => importGeographicFeature(invalid), /closed/);
});
test('local meter axes and shared origin maintain relative placement; land stays flat', () => {
  assert.ok(Math.abs(localMeters([0.001, 0], [0,0])[0] - 111.31949) < .001);
  assert.ok(localMeters([0, .001], [0,0])[1] < 0);
  const first = importGeographicFeature(polygon({}))[0];
  const second = importGeographicFeature(polygon({}), first.geographic.origin)[0];
  assert.deepEqual(first.geometry.positions, second.geometry.positions);
  assert.ok(first.geometry.positions.filter((_, i) => i % 3 === 1).every(y => Math.abs(y) < 1e-8));
});
test('courtyard holes survive import and malformed geographic metadata is rejected on restore', () => {
  const source = polygon({ building: 'yes', height: 10 });
  source.geometry.coordinates.push([[13.00002,52.00002],[13.00002,52.00008],[13.00008,52.00008],[13.00008,52.00002],[13.00002,52.00002]]);
  const objects = importGeographicFeature(source);
  assert.equal(objects[0].geographic.feature.geometry.coordinates.length, 2);
  const d = { ...makeDocument(), objects };
  d.objects[0].geographic.origin = [0, 100];
  assert.throws(() => validateDocument(d), /origin/);
  assert.throws(() => importGeographicFeature({ ...source, geometry: { type: 'Polygon', coordinates: [0, 0] } }), /nesting/);
});
