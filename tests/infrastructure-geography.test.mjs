import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCoordinates, normalizePlaces, mapStyle } from '../src/lib/infrastructure/geography.mjs';

test('coordinates use explicit latitude, longitude order and include zero and poles', () => {
  assert.deepEqual(parseCoordinates(' 0, -180 '), { latitude: 0, longitude: -180, label: '0, -180' });
  assert.equal(parseCoordinates('90, 180').latitude, 90);
  assert.equal(parseCoordinates('Berlin'), null);
  assert.throws(() => parseCoordinates('91, 0'));
  assert.throws(() => parseCoordinates('0, -181'));
});
test('provider places reject invalid geometry and retain country framing', () => {
  const places = normalizePlaces({features: [{center:[13.4,52.5],place_name:'Berlin'}, {center:[10,51],text:'Germany',place_type:['country']}, {center:[0,200]}]});
  assert.equal(places.length,2);
  assert.equal(places[0].latitude,52.5);
  assert.equal(places[1].zoom,4);
  assert.throws(() => normalizePlaces({}));
});
test('official globe demo cannot be used in production', () => {
  assert.equal(mapStyle('development'),'https://tiles.openfreemap.org/styles/liberty');
  assert.equal(mapStyle('production'),'https://tiles.openfreemap.org/styles/liberty');
  assert.throws(() => mapStyle('production','https://demotiles.maplibre.org/globe.json'));
  assert.throws(() => mapStyle('production','http://tiles.example/style.json'));
  assert.equal(mapStyle('production','https://tiles.example/style.json'),'https://tiles.example/style.json');
});
