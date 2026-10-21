export const SCENE_VERSION = 1;
export const MAX_SCENE_BYTES = 8_000_000;
export const KINDS = ["box", "sphere", "cylinder", "mesh", "group", "pointLight", "spotLight"];
export const MATERIALS = {
  concrete: { color: "#c9c6bf", roughness: .85, metalness: 0, opacity: 1, transmission: 0 },
  wood: { color: "#966642", roughness: .55, metalness: 0, opacity: 1, transmission: 0 },
  marble: { color: "#e6e3da", roughness: .18, metalness: 0, opacity: 1, transmission: 0 },
  ceramic: { color: "#d7d3c8", roughness: .3, metalness: 0, opacity: 1, transmission: 0 },
  glass: { color: "#cce5ed", roughness: .08, metalness: 0, opacity: .5, transmission: .9 },
  metal: { color: "#8c969d", roughness: .25, metalness: .95, opacity: 1, transmission: 0 },
  fabric: { color: "#bdaf9d", roughness: .95, metalness: 0, opacity: 1, transmission: 0 },
};
const fail = message => { throw new Error(message); };
const number = (v, min, max) => typeof v === "number" && Number.isFinite(v) && v >= min && v <= max ? v : fail("Scene number is outside its allowed range.");
const text = (v, max = 120) => typeof v === "string" && v.length > 0 && v.length <= max ? v : fail("Invalid scene text.");
const id = v => typeof v === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(v) ? v : fail("Invalid object ID.");
const vector = (v, min = -10000, max = 10000) => Array.isArray(v) && v.length === 3 ? v.map(n => number(n, min, max)) : fail("Expected a three component vector.");
const bool = v => typeof v === "boolean" ? v : fail("Expected a boolean.");
const color = v => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v : fail("Expected a hex color.");

export function validateMaterial(value) {
  if (!value || typeof value !== "object") fail("Material is required.");
  const result = {
    color: color(value.color), roughness: number(value.roughness, 0, 1), metalness: number(value.metalness, 0, 1),
    opacity: number(value.opacity, 0, 1), transmission: number(value.transmission ?? 0, 0, 1),
  };
  for (const key of ["map", "normalMap", "roughnessMap", "metalnessMap", "aoMap"]) {
    if (value[key] !== undefined) {
      if (typeof value[key] !== "string" || value[key].length > 2_000_000 || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value[key])) fail("Textures must be embedded PNG, JPEG or WebP images under 1.5 MB.");
      result[key] = value[key];
    }
  }
  if (value.uvScale) result.uvScale = value.uvScale.length === 2 ? value.uvScale.map(n => number(n, .01, 1000)) : fail("Invalid UV scale.");
  if (value.flipY !== undefined) result.flipY = bool(value.flipY);
  return result;
}

export function validateObject(value) {
  if (!value || !KINDS.includes(value.kind)) fail("Unsupported scene object.");
  const result = {
    id: id(value.id), name: text(value.name), kind: value.kind, parentId: value.parentId == null ? null : id(value.parentId),
    position: vector(value.position), rotation: vector(value.rotation, -1000, 1000), scale: vector(value.scale, .001, 1000),
    dimensions: vector(value.dimensions, .001, 1000), material: validateMaterial(value.material),
    visible: bool(value.visible), locked: bool(value.locked),
  };
  if (value.kind.endsWith("Light")) result.intensity = number(value.intensity ?? 50, 0, 10000);
  if (value.kind === "mesh") {
    const g = value.geometry;
    if (!g || !Array.isArray(g.positions) || !g.positions.length || g.positions.length % 3 || g.positions.length > 300_000) fail("Invalid or oversized mesh geometry.");
    result.geometry = { positions: g.positions.map(n => number(n, -10000, 10000)) };
    for (const key of ["normals", "uvs", "uvs1"]) {
      if (g[key] !== undefined) {
        if (!Array.isArray(g[key]) || g[key].length !== g.positions.length * (key.startsWith("uvs") ? 2 / 3 : 1)) fail("Invalid mesh attribute length.");
        result.geometry[key] = g[key].map(n => number(n, -10000, 10000));
      }
    }
    if (g.indices !== undefined) {
      if (!Array.isArray(g.indices) || g.indices.length % 3 || g.indices.length > 600_000) fail("Invalid mesh indices.");
      result.geometry.indices = g.indices.map(n => Number.isInteger(n) ? number(n, 0, g.positions.length / 3 - 1) : fail("Invalid vertex index."));
    } else if (g.positions.length % 9) fail("Non-indexed meshes must contain triangles.");
  }
  return result;
}

export function validateDocument(value) {
  if (!value || value.version !== SCENE_VERSION || value.units !== "m") fail("Unsupported scene version or units.");
  if (JSON.stringify(value).length > MAX_SCENE_BYTES) fail("Project exceeds the 8 MB document limit.");
  if (!Array.isArray(value.objects) || value.objects.length > 1000) fail("A project supports up to 1000 objects.");
  const objects = value.objects.map(validateObject);
  const nodes = new Map(objects.map(o => [o.id, o]));
  if (nodes.size !== objects.length) fail("Duplicate object IDs.");
  let vertexCount = 0;
  for (const object of objects) {
    vertexCount += (object.geometry?.positions.length ?? 0) / 3;
    const seen = new Set([object.id]);
    let parent = object.parentId;
    while (parent) {
      if (seen.has(parent) || seen.size > 32) fail("Cyclic or excessively deep scene hierarchy.");
      seen.add(parent);
      const node = nodes.get(parent);
      if (!node || node.kind !== "group") fail("Object parent must be an existing group.");
      parent = node.parentId;
    }
  }
  if (vertexCount > 200_000) fail("Imported geometry exceeds the 200,000 vertex project budget.");
  const e = value.environment;
  if (!e || !["performance", "balanced", "ultra"].includes(e.quality)) fail("Invalid environment preset.");
  const camera = value.camera;
  if (!camera || !["perspective", "orthographic"].includes(camera.projection)) fail("Invalid camera.");
  return {
    version: 1, id: id(value.id), name: text(value.name), units: "m", objects,
    environment: { quality: e.quality, exposure: number(e.exposure, .1, 4), sunIntensity: number(e.sunIntensity, 0, 10),
      sunAzimuth: number(e.sunAzimuth, -360, 360), sunElevation: number(e.sunElevation, -5, 90), shadows: bool(e.shadows) },
    camera: { position: vector(camera.position), target: vector(camera.target), projection: camera.projection },
  };
}

export function makeObject(kind = "box", overrides = {}) {
  return validateObject({ id: crypto.randomUUID(), name: kind === "box" ? "Box" : kind, kind, parentId: null,
    position: [0, .5, 0], rotation: [0, 0, 0], scale: [1, 1, 1], dimensions: [1, 1, 1],
    material: MATERIALS.concrete, visible: true, locked: false, ...overrides });
}

export function makeDocument(studio = "architecture") {
  return validateDocument({ version: 1, id: crypto.randomUUID(), name: "Untitled project", units: "m", objects: [],
    environment: { quality: "balanced", exposure: 1, sunIntensity: 3, sunAzimuth: 40, sunElevation: 45, shadows: true },
    camera: { position: studio === "infrastructure" ? [36, 30, 36] : [14, 11, 14], target: [0, 1, 0], projection: "perspective" } });
}

export function createTemplate(template, stories = 2) {
  if (!["building", "room", "intersection"].includes(template)) fail("Unsupported template.");
  stories = Math.round(number(stories, 1, 8));
  const root = makeObject("group", { name: { building: "Parametric residence", room: "Furnished living room", intersection: "Urban intersection" }[template], position: [0, 0, 0] });
  const objects = [root];
  let parentId = root.id, offsetY = 0;
  const box = (name, position, dimensions, preset = "concrete", extra = {}) => {
    const o = makeObject("box", { name, position: [position[0], position[1] - offsetY, position[2]], dimensions, parentId, material: MATERIALS[preset] ?? MATERIALS.concrete, ...extra });
    objects.push(o); return o;
  };
  const lamp = (x, y, z) => {
    box("Light fixture", [x, y, z], [.35, .1, .35], "metal");
    objects.push(makeObject("pointLight", { name: "Warm light", parentId, position: [x, y - offsetY - .15, z], intensity: 45, material: { ...MATERIALS.concrete, color: "#ffd4a0" } }));
  };
  if (template === "building") {
    for (let floor = 0; floor < stories; floor++) {
      const y = floor * 3.2;
      const level = makeObject("group", { name: `Level ${floor + 1}`, parentId: root.id, position: [0, y, 0] });
      objects.push(level); parentId = level.id; offsetY = y;
      box(`Level ${floor + 1} slab`, [0, y, 0], [10, .25, 8]);
      box(`Level ${floor + 1} west wall`, [-4.85, y + 1.65, 0], [.3, 3.05, 8]);
      box(`Level ${floor + 1} east wall`, [4.85, y + 1.65, 0], [.3, 3.05, 8]);
      box(`Level ${floor + 1} rear wall`, [0, y + 1.65, -3.85], [9.4, 3.05, .3]);
      // Separate jambs, sill and lintel create real openings, not decals.
      for (const x of [-3.4, 0, 3.4]) {
        const openingWidth = x === 0 ? 1.4 : 2;
        const sill = x === 0 && floor === 0 ? 0 : .85;
        const height = 2.3 - sill;
        box(`L${floor + 1} glazing`, [x, y + sill + height / 2, 3.85], [openingWidth, height, .06], "glass");
        box(`L${floor + 1} lintel`, [x, y + 2.75, 3.85], [openingWidth, .9, .3]);
        if (sill) box(`L${floor + 1} sill`, [x, y + sill / 2, 3.85], [openingWidth, sill, .3]);
      }
      for (const [x, width] of [[-4.65, .4], [-1.9, 1], [1.9, 1], [4.65, .4]]) box(`L${floor + 1} facade pier`, [x, y + 1.6, 3.85], [width, 3.2, .3]);
      lamp(0, y + 2.8, 2.8);
    }
    parentId = root.id; offsetY = 0;
    box("Flat roof", [0, stories * 3.2, 0], [10.6, .3, 8.6], "metal");
  } else if (template === "room") {
    box("Marble floor", [0, 0, 0], [8, .2, 6], "marble");
    box("Back wall", [0, 1.6, -3], [8, 3.2, .2]);
    box("Wood wall panel", [-4, 1.6, 0], [.2, 3.2, 6], "wood");
    box("Window sill", [4, .5, 0], [.2, 1, 6]);
    box("Window header", [4, 2.95, 0], [.2, .5, 6]);
    box("Window glass", [4, 1.85, 0], [.04, 1.7, 5.8], "glass");
    box("Sofa seat", [-1, .48, -1.7], [3, .55, 1.1], "fabric");
    box("Sofa back", [-1, .95, -2.15], [3, .8, .25], "fabric");
    for (const x of [-2.55, .55]) box("Sofa arm", [x, .75, -1.7], [.25, .85, 1.1], "fabric");
    box("Coffee table top", [-1, .52, .2], [1.7, .12, .85], "wood");
    for (const x of [-1.65, -.35]) for (const z of [-.1, .5]) box("Table leg", [x, .25, z], [.07, .5, .07], "metal");
    box("Cabinet", [2.5, .65, -2.3], [1.6, 1.3, .6], "wood");
    box("Rug", [-1, .115, .2], [3.5, .025, 2.5], "fabric");
    lamp(-1, 2.8, .2); lamp(2, 2.8, -1.5);
  } else {
    box("Terrain", [0, -.25, 0], [48, .3, 48], "concrete", { material: { ...MATERIALS.concrete, color: "#6a7b58" } });
    const asphalt = { ...MATERIALS.concrete, color: "#33383f" };
    box("Intersection center", [0, 0, 0], [8, .2, 8], "concrete", { material: asphalt });
    for (const sign of [-1, 1]) {
      box("North-south road", [0, 0, sign * 12], [8, .2, 16], "concrete", { material: asphalt });
      box("East-west road", [sign * 12, 0, 0], [16, .2, 8], "concrete", { material: asphalt });
      for (let i = 0; i < 7; i++) {
        box("Crossing stripe", [-3 + i, .12, sign * 6], [.5, .02, 2.8], "ceramic");
        box("Crossing stripe", [sign * 6, .12, -3 + i], [2.8, .02, .5], "ceramic");
      }
      for (const other of [-1, 1]) {
        box("Sidewalk", [sign * 12, .15, other * 12], [14, .3, 14]);
        box("Urban building", [sign * 13, 3.3, other * 13], [7, 6, 7]);
        box("Streetlight pole", [sign * 5, 2.4, other * 5], [.15, 4.8, .15], "metal");
        lamp(sign * 5, 4.8, other * 5);
      }
      for (let d = 9; d <= 18; d += 3) {
        box("Lane marking", [0, .12, sign * d], [.12, .02, 1.5], "ceramic");
        box("Lane marking", [sign * d, .12, 0], [1.5, .02, .12], "ceramic");
      }
    }
  }
  return objects;
}

export function commitHistory(history, document) {
  const next = validateDocument(document);
  if (JSON.stringify(history.present) === JSON.stringify(next)) return history;
  return { past: [...history.past, history.present].slice(-30), present: next, future: [] };
}
export function undoHistory(h) { return h.past.length ? { past: h.past.slice(0, -1), present: h.past.at(-1), future: [h.present, ...h.future].slice(0, 30) } : h; }
export function redoHistory(h) { return h.future.length ? { past: [...h.past, h.present].slice(-30), present: h.future[0], future: h.future.slice(1) } : h; }

export function applyCommands(document, commands) {
  if (!Array.isArray(commands) || !commands.length || commands.length > 30) fail("Expected between 1 and 30 scene commands.");
  let next = validateDocument(document);
  for (const c of commands) {
    if (!c || typeof c !== "object") fail("Invalid scene command.");
    if (c.type === "template") next = { ...next, objects: [...next.objects, ...createTemplate(c.template, c.stories ?? 2)] };
    else if (c.type === "create") {
      if (!["box", "sphere", "cylinder", "pointLight", "spotLight"].includes(c.kind)) fail("Unsupported primitive.");
      next.objects.push(makeObject(c.kind, { name: c.name ?? c.kind, position: c.position ?? [0, .5, 0], dimensions: c.dimensions ?? [1, 1, 1], material: MATERIALS[c.material] ?? MATERIALS.concrete }));
    } else if (["move", "material", "delete"].includes(c.type)) {
      const target = next.objects.find(o => o.id === c.id);
      if (!target || target.locked) fail("Object is missing or locked.");
      let parent = target.parentId;
      while (parent) { const node = next.objects.find(o => o.id === parent); if (node?.locked) fail("Parent group is locked."); parent = node?.parentId; }
      if (c.type === "move") target.position = vector(c.position);
      if (c.type === "material") {
        if (c.material && !MATERIALS[c.material]) fail("Unsupported material preset.");
        target.material = { ...(MATERIALS[c.material] ?? target.material), ...(c.color ? { color: color(c.color) } : {}) };
      }
      if (c.type === "delete") {
        const ids = new Set([target.id]);
        for (let i = 0; i < 32; i++) next.objects.forEach(o => { if (ids.has(o.parentId)) ids.add(o.id); });
        if (next.objects.some(o => ids.has(o.id) && o.locked)) fail("A child object is locked.");
        next.objects = next.objects.filter(o => !ids.has(o.id));
      }
    } else if (c.type === "environment") {
      next.environment = { ...next.environment, ...(c.sunElevation !== undefined ? { sunElevation: c.sunElevation } : {}), ...(c.exposure !== undefined ? { exposure: c.exposure } : {}), ...(c.shadows !== undefined ? { shadows: c.shadows } : {}) };
    } else fail("Unsupported scene command. Generated code is never executed.");
    next = validateDocument(next);
  }
  return next;
}
