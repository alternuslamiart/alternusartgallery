import { Shape, Path, Vector2, ShapeGeometry, ExtrudeGeometry } from 'three';
import { makeObject } from '../scene/document.mjs';
import { geographicFeature, featureBounds, localMeters, validateGeographic } from './map-features.mjs';

export function importGeographicFeature(input, existingOrigin) {
  const feature = geographicFeature(input), bounds = featureBounds(feature);
  const origin = existingOrigin ?? [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2];
  const geographic = validateGeographic({ origin, feature });
  const { type, coordinates } = feature.geometry, p = feature.properties;
  const building = p.building != null && p.building !== false && p.building !== 'no' || /building/i.test(String(p.class ?? p.type ?? ''));
  if (!['Polygon', 'MultiPolygon'].includes(type)) throw new Error('Only polygon footprints can currently be imported. Road centerlines need surveyed width/elevation data; points do not define meshes.');
  const height = Number(p.height ?? p.render_height), base = Number(p.min_height ?? p.render_min_height ?? 0);
  if (building && (!Number.isFinite(height) || height <= base || height > 1000 || base < 0)) throw new Error('This building has no valid measured height in meters. No building volume was invented.');
  const polygons = type === 'Polygon' ? [coordinates] : coordinates;
  return polygons.map(rings => {
    const points = rings.map(ring => {
      if (ring.length < 4 || ring[0][0] !== ring.at(-1)[0] || ring[0][1] !== ring.at(-1)[1]) throw new Error('A closed polygon ring is required.');
      return ring.slice(0, -1).map(c => { const [x, south] = localMeters(c, origin); return new Vector2(x, -south); });
    });
    const shape = new Shape(points[0]); shape.holes = points.slice(1).map(ring => new Path(ring));
    const geometry = building ? new ExtrudeGeometry(shape, { depth: height - base, bevelEnabled: false, steps: 1 }) : new ShapeGeometry(shape);
    try {
      // Three shape XY -> local east/up/south. Flat land has no fabricated elevation.
      geometry.rotateX(-Math.PI / 2);
      return makeObject('mesh', { name: String(p.name ?? (building ? 'Imported building' : 'Imported land footprint')).slice(0, 120), position: [0, building ? base : 0, 0], dimensions: [1, 1, 1], geographic,
        geometry: { positions: Array.from(geometry.attributes.position.array), ...(geometry.index ? { indices: Array.from(geometry.index.array) } : {}) } });
    } finally { geometry.dispose(); }
  });
}
