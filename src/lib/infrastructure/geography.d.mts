export type GeographicLocation = { latitude: number; longitude: number; label: string; zoom?: number };
export function parseCoordinates(query: string): GeographicLocation | null;
export function normalizePlaces(data: unknown): GeographicLocation[];
export function mapStyle(environment: string, configured?: string): string;
