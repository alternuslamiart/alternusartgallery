import test from "node:test";
import assert from "node:assert/strict";
import { Box3 } from "three";
import { makeDocument, makeObject, createTemplate, validateDocument } from "../src/lib/scene/document.mjs";
import { buildScene, disposeScene, exportScene, importModel, duplicateObjects, regroupObjects } from "../src/lib/scene/geometry.mjs";

globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(value => { this.result = value; this.onloadend?.(); }); }
  readAsDataURL(blob) { blob.arrayBuffer().then(value => { this.result = `data:${blob.type};base64,${Buffer.from(value).toString("base64")}`; this.onloadend?.(); }); }
};
globalThis.ProgressEvent ??= class extends Event {};

test("real geometry has metric dimensions and PBR materials", () => {
  const doc = makeDocument(); doc.objects = [makeObject("box", { dimensions: [4, 3, 2], position: [2, 1.5, 0] })];
  const root = buildScene(doc);
  const mesh = root.children[0];
  assert.ok(mesh.isMesh && mesh.geometry.attributes.position.count > 0);
  assert.ok(mesh.material.isMeshPhysicalMaterial);
  assert.deepEqual(new Box3().setFromObject(root).min.toArray(), [0, 0, -1]);
  disposeScene(root);
});

test("GLB export can be reopened with matching geometry bounds and hierarchy", async () => {
  const doc = makeDocument(); doc.objects = createTemplate("room");
  doc.objects[0].position = [4, 2, -3]; doc.objects[0].rotation = [0, .7, 0];
  const blob = await exportScene(doc, "glb");
  const buffer = await blob.arrayBuffer();
  assert.equal(new DataView(buffer).getUint32(0, true), 0x46546c67);
  const imported = await importModel(buffer, "roundtrip.glb");
  const reopened = validateDocument({ ...makeDocument(), objects: imported });
  const before = buildScene(doc), after = buildScene(reopened);
  const a = new Box3().setFromObject(before), b = new Box3().setFromObject(after);
  assert.ok(a.min.distanceTo(b.min) < .001 && a.max.distanceTo(b.max) < .001);
  let meshes = 0; after.traverse(o => { if (o.isMesh) meshes++; });
  assert.equal(meshes, doc.objects.filter(o => o.kind === "box").length);
  assert.ok(imported.some(o => o.parentId));
  assert.equal(imported.filter(o => o.kind.endsWith("Light")).length, doc.objects.filter(o => o.kind.endsWith("Light")).length);
  disposeScene(before); disposeScene(after);
});

test("OBJ and STL contain actual triangles and reopen as editable meshes", async () => {
  const doc = makeDocument(); doc.objects = [makeObject()];
  for (const format of ["obj", "stl"]) {
    const data = await (await exportScene(doc, format)).arrayBuffer();
    if (format === "obj") assert.match(new TextDecoder().decode(data), /^v /m);
    else assert.equal(data.byteLength, 84 + new DataView(data).getUint32(80, true) * 50);
    const objects = await importModel(data, `cube.${format}`);
    assert.ok(objects.some(o => o.kind === "mesh" && o.geometry.positions.length >= 24));
  }
});

test("imports cannot fetch external resources", async () => {
  const data = new TextEncoder().encode(JSON.stringify({ asset: { version: "2.0" }, buffers: [{ uri: "https://example.com/secret.bin", byteLength: 10 }] }));
  await assert.rejects(importModel(data.buffer, "external.gltf"), /External URLs/);
});

test("blender .blend files advise exporting to supported 3D formats", async () => {
  const dummy = new Uint8Array([66, 76, 69, 78, 68, 69, 82]); // "BLENDER"
  await assert.rejects(importModel(dummy.buffer, "project.blend"), /Blender \.blend files need to be exported/);
});

test("duplicating groups remaps child IDs without changing originals", () => {
  const doc = makeDocument(); doc.objects = createTemplate("building");
  const result = duplicateObjects(doc, [doc.objects[0].id]);
  assert.equal(result.document.objects.length, doc.objects.length * 2);
  assert.equal(result.ids.length, 1);
  assert.notEqual(result.ids[0], doc.objects[0].id);
  assert.deepEqual(doc.objects[0].position, [0, 0, 0]);
});

test("group and ungroup preserve world transforms and respect locked ancestors", () => {
  const doc = makeDocument();
  const parent = makeObject("group", { position: [3, 2, -4], rotation: [0, .6, 0], scale: [2, 2, 2] });
  const child = makeObject("box", { parentId: parent.id, position: [1, 2, 3], rotation: [.2, .1, 0] });
  const other = makeObject("sphere", { position: [-4, 1, 2] });
  doc.objects = [parent, child, other];
  const matrices = document => { const root = buildScene(document, { textures: false }); const values = new Map(); root.updateMatrixWorld(true); root.traverse(o => { if (o.userData.sceneId) values.set(o.userData.sceneId, o.matrixWorld.elements.slice()); }); disposeScene(root); return values; };
  const before = matrices(doc);
  const grouped = regroupObjects(doc, [child.id, other.id]);
  const newGroup = grouped.objects.find(o => !doc.objects.some(old => old.id === o.id));
  const ungrouped = regroupObjects(grouped, [newGroup.id], true);
  for (const result of [grouped, ungrouped]) {
    const after = matrices(result);
    for (const id of [child.id, other.id]) before.get(id).forEach((value, i) => assert.ok(Math.abs(after.get(id)[i] - value) < .0001));
  }
  parent.locked = true;
  assert.throws(() => regroupObjects(doc, [child.id, other.id]), /Unlock/);
});
