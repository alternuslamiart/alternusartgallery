import assert from "node:assert/strict";
import test from "node:test";
import {
  loadInfrastructure,
  saveInfrastructure,
} from "../src/app/infrastructure/infrastructure-storage.mjs";

const storage = (initial = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
    values,
  };
};

const road = {
  id: 1,
  type: "road",
  name: "Main road",
  x: 3,
  y: 0,
  z: -2,
  rotation: 0.25,
  width: 8,
  depth: 24,
  height: 1,
  color: "#343a40",
  visible: true,
  locked: false,
  lanes: 2,
  path: [[-12, 0], [0, 2], [12, 0]],
};

test("loads an empty local site without inventing saved objects", () => {
  assert.deepEqual(loadInfrastructure(storage()), { status: "empty" });
});

test("saves and reloads versioned scene data", () => {
  const target = storage();
  assert.deepEqual(saveInfrastructure(target, [road]), { ok: true });
  const loaded = loadInfrastructure(target);
  assert.equal(loaded.status, "loaded");
  assert.deepEqual(loaded.objects, [road]);
});

test("rejects corrupt or unsupported saved site data", () => {
  const target = storage({ "crystal.infrastructure.scene.v1": "{broken" });
  assert.equal(loadInfrastructure(target).status, "invalid");
  target.setItem("crystal.infrastructure.scene.v1", JSON.stringify({ version: 2, objects: [road] }));
  assert.equal(loadInfrastructure(target).status, "invalid");
});

test("rejects scene objects with unsafe dimensions or duplicate ids", () => {
  const invalid = { ...road, width: Number.NaN };
  const target = storage({
    "crystal.infrastructure.scene.v1": JSON.stringify({ version: 1, objects: [road, invalid] }),
  });
  assert.equal(loadInfrastructure(target).status, "invalid");
  target.setItem("crystal.infrastructure.scene.v1", JSON.stringify({ version: 1, objects: [road, road] }));
  assert.equal(loadInfrastructure(target).status, "invalid");
});

test("reports browser storage read and write failures", () => {
  const blocked = {
    getItem() { throw new Error("access denied"); },
    setItem() { throw new Error("quota exceeded"); },
    removeItem() {},
  };
  assert.equal(loadInfrastructure(blocked).status, "error");
  assert.equal(saveInfrastructure(blocked, [road]).ok, false);
});
