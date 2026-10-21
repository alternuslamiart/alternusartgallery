import type { Group } from "three";
import type { SceneDocument, SceneObject } from "./document.mjs";
export function buildScene(document: SceneDocument, options?: { textures?: boolean; helpers?: boolean; onTextureLoad?: () => void }): Group;
export function disposeScene(root: import("three").Object3D): void;
export function exportScene(document: SceneDocument, format: string): Promise<Blob>;
export function importModel(buffer: ArrayBuffer, filename: string): Promise<SceneObject[]>;
export function duplicateObjects(document: SceneDocument, selectedIds: string[]): { document: SceneDocument; ids: string[] };
export function regroupObjects(document: SceneDocument, selectedIds: string[], ungroup?: boolean): SceneDocument;
