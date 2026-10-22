import type { Object3D, BoxHelper } from 'three';
export function nextSelection(current:string[],id:string|null,additive?:boolean):string[];
export function createSelectionHelpers(root:Object3D,ids:string[]):BoxHelper[];
export function disposeSelectionHelpers(helpers:BoxHelper[]):void;
