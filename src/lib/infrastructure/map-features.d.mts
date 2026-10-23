import type { Feature, Geometry } from 'geojson';
export type GeographicReference = { origin: [number, number]; feature: Feature<Geometry> };
export function geographicFeature(value: unknown): Feature<Geometry>;
export function featureBounds(feature: Feature<Geometry>): [number, number, number, number];
export function validateGeographic(value: unknown): GeographicReference;
export function localMeters(coordinate: number[], origin: number[]): [number, number];
