import type {SceneDocument,Vec3} from './document.mjs';
type Asset={source:import('three').Group;dimensions:Vec3;vertices:number};
export function generatedAsset(id:string):Asset|undefined;
export function cacheGeneratedAsset(buffer:ArrayBuffer,jobId:string):Promise<Asset>;
export function loadGeneratedAssets(document:SceneDocument,fetchImpl?:typeof fetch):Promise<void>;
export function clearGeneratedAssets():void;
