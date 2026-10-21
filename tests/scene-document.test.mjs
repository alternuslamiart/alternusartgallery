import assert from "node:assert/strict";
import test from "node:test";
import { makeDocument, makeObject, validateDocument, createTemplate, applyCommands, commitHistory, undoHistory, redoHistory } from "../src/lib/scene/document.mjs";

test("all studio templates create independent editable objects in a valid metric document", () => {
  for (const template of ["building", "room", "intersection"]) {
    const doc = makeDocument(); doc.objects = createTemplate(template);
    const parsed = validateDocument(JSON.parse(JSON.stringify(doc)));
    assert.ok(parsed.objects.length > 15);
    assert.equal(new Set(parsed.objects.map(o => o.id)).size, parsed.objects.length);
    assert.ok(parsed.objects.some(o => o.parentId));
    assert.deepEqual(parsed, doc);
  }
});

test("scene validation rejects cycles, invalid parents, duplicate IDs and invalid geometry", () => {
  const doc = makeDocument(); const group = makeObject("group"); doc.objects = [group];
  group.parentId = group.id; assert.throws(() => validateDocument(doc), /Cyclic/);
  group.parentId = "missing"; assert.throws(() => validateDocument(doc), /parent/);
  group.parentId = null; doc.objects.push({ ...group }); assert.throws(() => validateDocument(doc), /Duplicate/);
  doc.objects = [makeObject()]; doc.objects[0].position[0] = Infinity; assert.throws(() => validateDocument(doc), /number/);
  assert.throws(() => makeObject("mesh", { geometry: { positions: [0, 0, 0], indices: [0, 1, 2] } }), /range/);
});

test("undo and redo restore complete transforms and material changes, branching clears redo", () => {
  const doc = makeDocument(); doc.objects = [makeObject()];
  let history = { past: [], present: doc, future: [] };
  history = commitHistory(history, applyCommands(doc, [{ type: "move", id: doc.objects[0].id, position: [2, 3, 4] }]));
  const moved = history.present;
  history = commitHistory(history, applyCommands(moved, [{ type: "material", id: moved.objects[0].id, material: "marble" }]));
  assert.deepEqual(undoHistory(history).present, moved);
  assert.deepEqual(redoHistory(undoHistory(history)).present, history.present);
  const branch = commitHistory(undoHistory(history), applyCommands(moved, [{ type: "environment", exposure: 1.5 }]));
  assert.equal(branch.future.length, 0);
  assert.deepEqual(doc.objects[0].position, [0, .5, 0]);
});

test("AI commands are transactional, limited, and cannot change locked or missing objects", () => {
  const doc = makeDocument(); doc.objects = [makeObject()];
  assert.throws(() => applyCommands(doc, [{ type: "move", id: doc.objects[0].id, position: [2, 0, 0] }, { type: "execute", code: "alert(1)" }]), /Unsupported/);
  assert.deepEqual(doc.objects[0].position, [0, .5, 0]);
  doc.objects[0].locked = true;
  assert.throws(() => applyCommands(doc, [{ type: "delete", id: doc.objects[0].id }]), /locked/);
  assert.throws(() => applyCommands(doc, [{ type: "move", id: "missing", position: [1, 1, 1] }]), /missing/);
  assert.throws(() => applyCommands(doc, Array(31).fill({ type: "create", kind: "box" })), /30/);
});
