import { Raycaster, Vector2 } from 'three';

export function selectableNode(object) {
  let target = null;
  for (let node = object; node; node = node.parent) {
    if (!node.visible || node.userData.locked) return null;
    if (!target && node.userData.sceneId) target = node;
  }
  return target;
}

/** Exact surface hits win. A small screen-space halo helps with thin geometry. */
export function pickScene(root, camera, bounds, x, y, tolerance = 5) {
  if (!bounds.width || !bounds.height) return null;
  root.updateMatrixWorld(true); camera.updateMatrixWorld();
  const ray = new Raycaster();
  const cast = (dx, dy) => {
    ray.setFromCamera(new Vector2((x + dx - bounds.left) / bounds.width * 2 - 1, -(y + dy - bounds.top) / bounds.height * 2 + 1), camera);
    for (const hit of ray.intersectObject(root, true)) {
      const node = selectableNode(hit.object);
      if (node) return { node, point: hit.point, distance: hit.distance };
    }
    return null;
  };
  const exact = cast(0, 0);
  if (exact) return exact;
  for (const radius of [tolerance / 2, tolerance]) {
    if (!radius) continue;
    const hits = [[1,0],[-1,0],[0,1],[0,-1],[.707,.707],[-.707,.707],[.707,-.707],[-.707,-.707]]
      .map(([dx,dy]) => cast(dx * radius, dy * radius)).filter(Boolean);
    if (hits.length) return hits.sort((a,b) => a.distance - b.distance)[0];
  }
  return null;
}

export function isSelectionClick(start, end, transformed = false) {
  return Boolean(start && start.button === 0 && end.button === 0 && !transformed &&
    Math.hypot(end.clientX - start.clientX, end.clientY - start.clientY) <= 5);
}
