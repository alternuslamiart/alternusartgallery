import type { InfrastructureObject } from "./infrastructure-types";

export type InfrastructureStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export type InfrastructureLoadResult =
  | { status: "empty" }
  | { status: "loaded"; objects: InfrastructureObject[] }
  | { status: "invalid" | "error"; message: string };

export type InfrastructureSaveResult =
  | { ok: true }
  | { ok: false; message: string };

export function loadInfrastructure(storage: InfrastructureStorage): InfrastructureLoadResult;
export function saveInfrastructure(storage: InfrastructureStorage, objects: InfrastructureObject[]): InfrastructureSaveResult;
