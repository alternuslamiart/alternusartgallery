// Bounded GeoJSON boundary shared by picking, persistence and scene conversion.
export function geographicFeature(value) {
  if (!value || value.type !== 'Feature' || JSON.stringify(value).length > 200000) throw new Error('Invalid or oversized geographic feature.');
  const geometry = value.geometry;
  if (!geometry || !['Polygon', 'MultiPolygon', 'LineString', 'MultiLineString', 'Point'].includes(geometry.type)) throw new Error('Unsupported geographic geometry.');
  let count = 0;
  const depths = { Point: 0, LineString: 1, MultiLineString: 2, Polygon: 2, MultiPolygon: 3 };
  const visit = (coordinates, depth) => {
    if (!Array.isArray(coordinates) || !coordinates.length) throw new Error('Empty geographic geometry.');
    if (depth === 0) {
      if (++count > 10000 || coordinates.length < 2 || !coordinates.every(Number.isFinite) || Math.abs(coordinates[0]) > 180 || Math.abs(coordinates[1]) > 85) throw new Error('Geographic geometry must lie within ±85° latitude and valid longitude.');
      return coordinates.slice(0, 2);
    }
    if (typeof coordinates[0] === 'number') throw new Error('Invalid geographic coordinate nesting.');
    return coordinates.map(child => visit(child, depth - 1));
  };
  const coordinates = visit(geometry.coordinates, depths[geometry.type]);
  const properties = Object.fromEntries(Object.entries(value.properties ?? {}).filter(([, v]) => ['string', 'number', 'boolean'].includes(typeof v) && String(v).length < 1000).slice(0, 50));
  return { type: 'Feature', properties, geometry: { type: geometry.type, coordinates } };
}

export function featureBounds(feature) {
  const bounds = [Infinity, Infinity, -Infinity, -Infinity];
  const visit = c => { if (typeof c[0] === 'number') { bounds[0] = Math.min(bounds[0], c[0]); bounds[1] = Math.min(bounds[1], c[1]); bounds[2] = Math.max(bounds[2], c[0]); bounds[3] = Math.max(bounds[3], c[1]); } else c.forEach(visit); };
  visit(feature.geometry.coordinates);
  return bounds;
}

export function validateGeographic(value) {
  if (!value || !Array.isArray(value.origin) || value.origin.length !== 2 || !value.origin.every(Number.isFinite) || Math.abs(value.origin[0]) > 180 || Math.abs(value.origin[1]) > 85) throw new Error('Invalid WGS84 project origin.');
  return { origin: [...value.origin], feature: geographicFeature(value.feature) };
}

export function localMeters(coordinate, origin) {
  // WGS84 ellipsoid -> ECEF -> local east/north tangent plane at zero altitude.
  const radians = Math.PI / 180, radius = 6378137, eccentricitySquared = 6.6943799901413165e-3;
  const ecef = ([longitude, latitude]) => {
    const lon = longitude * radians, lat = latitude * radians;
    const n = radius / Math.sqrt(1 - eccentricitySquared * Math.sin(lat) ** 2);
    return [n * Math.cos(lat) * Math.cos(lon), n * Math.cos(lat) * Math.sin(lon), n * (1 - eccentricitySquared) * Math.sin(lat)];
  };
  const start = ecef(origin), delta = ecef(coordinate).map((n, i) => n - start[i]);
  const lon = origin[0] * radians, lat = origin[1] * radians;
  const east = -Math.sin(lon) * delta[0] + Math.cos(lon) * delta[1];
  const north = -Math.sin(lat) * Math.cos(lon) * delta[0] - Math.sin(lat) * Math.sin(lon) * delta[1] + Math.cos(lat) * delta[2];
  if (Math.hypot(...delta) > 2000) throw new Error('Import is limited to 2 km from the project geographic origin. Use a smaller area or a new project.');
  return [east, -north];
}
