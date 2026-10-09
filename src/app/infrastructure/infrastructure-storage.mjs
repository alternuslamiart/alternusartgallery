const STORAGE_KEY = "crystal.infrastructure.scene.v1";
const SUPPORTED_TYPES = new Set([
  "road",
  "building",
  "pavilion",
  "tree",
  "lamp",
  "water",
  "bridge",
  "parking",
  "plaza",
  "vehicle",
  "fountain",
  "roundabout",
  "path",
  "crosswalk",
  "barrier",
  "bench",
  "shrub",
  "sidewalk",
  "bikeLane",
  "busStop",
  "trafficLight",
  "roadSign",
]);
const HEX_COLOR = /^#[\da-f]{6}$/i;
const MAX_OBJECTS = 2000;
const MAX_ABS_POSITION = 100000;
const MAX_DIMENSION = 10000;

function validObject(object, ids) {
  if (!object || typeof object !== "object" || Array.isArray(object)) return false;
  if (!Number.isSafeInteger(object.id) || object.id < 1 || ids.has(object.id)) return false;
  if (!SUPPORTED_TYPES.has(object.type) || typeof object.name !== "string" || object.name.length > 200) return false;
  if (!["x", "y", "z", "rotation"].every((key) => Number.isFinite(object[key]))) return false;
  if (["x", "y", "z"].some((key) => Math.abs(object[key]) > MAX_ABS_POSITION)) return false;
  if (!["width", "depth", "height"].every((key) => Number.isFinite(object[key]) && object[key] > 0 && object[key] <= MAX_DIMENSION)) return false;
  if (typeof object.color !== "string" || !HEX_COLOR.test(object.color)) return false;
  if (typeof object.visible !== "boolean" || typeof object.locked !== "boolean") return false;
  if (object.lanes !== undefined && (!Number.isInteger(object.lanes) || object.lanes < 1 || object.lanes > 8)) return false;
  if (object.path !== undefined && (
    !Array.isArray(object.path)
    || object.path.length < 2
    || object.path.length > 1000
    || object.path.some((point) => !Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite))
  )) return false;
  ids.add(object.id);
  return true;
}

function validationError(error) {
  return error instanceof Error ? error.message : "Unknown browser storage error.";
}

export function loadInfrastructure(storage) {
  let serialized;
  try {
    serialized = storage.getItem(STORAGE_KEY);
  } catch (error) {
    return { status: "error", message: `Could not read the saved site: ${validationError(error)}` };
  }
  if (serialized === null) return { status: "empty" };

  let snapshot;
  try {
    snapshot = JSON.parse(serialized);
  } catch {
    return { status: "invalid", message: "Saved site data is unreadable. Edit the site to replace it." };
  }
  if (!snapshot || snapshot.version !== 1 || !Array.isArray(snapshot.objects) || snapshot.objects.length > MAX_OBJECTS) {
    return { status: "invalid", message: "Saved site data has an unsupported format. Edit the site to replace it." };
  }

  const ids = new Set();
  if (!snapshot.objects.every((object) => validObject(object, ids))) {
    return { status: "invalid", message: "Saved site data failed validation. Edit the site to replace it." };
  }
  return { status: "loaded", objects: snapshot.objects };
}

export function saveInfrastructure(storage, objects) {
  if (!Array.isArray(objects) || objects.length > MAX_OBJECTS) {
    return { ok: false, message: "The site is too large to save locally." };
  }
  const ids = new Set();
  if (!objects.every((object) => validObject(object, ids))) {
    return { ok: false, message: "The site contains invalid object data and was not saved." };
  }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, objects }));
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Could not save the site locally: ${validationError(error)}` };
  }
}
