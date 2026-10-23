// Geographic coordinates are WGS84 degrees; scene coordinates remain local meters.
export function parseCoordinates(query) {
  const match = query.trim().match(/^([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const latitude = Number(match[1]), longitude = Number(match[2]);
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) throw new Error('Use latitude -90…90, longitude -180…180.');
  return { latitude, longitude, label: `${latitude}, ${longitude}` };
}

export function normalizePlaces(data) {
  if (!Array.isArray(data?.features)) throw new Error('Invalid geocoding response.');
  return data.features.flatMap(feature => {
    const [longitude, latitude] = feature.center ?? feature.geometry?.coordinates ?? [];
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return [];
    return [{ latitude, longitude, label: String(feature.place_name ?? feature.text ?? `${latitude}, ${longitude}`).slice(0, 300), zoom: feature.place_type?.includes('country') ? 4 : 11 }];
  }).slice(0, 5);
}

export function mapStyle(environment, configured) {
  if (configured) {
    const url = new URL(configured);
    if (url.protocol !== 'https:') throw new Error('Map style must use HTTPS.');
    if (environment !== 'development' && url.hostname === 'demotiles.maplibre.org') throw new Error('Demo tiles are development-only. Configure a production map style.');
    return url.href;
  }
  return 'https://tiles.openfreemap.org/styles/liberty';
}
