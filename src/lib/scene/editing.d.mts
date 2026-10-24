import type {SceneDocument,SceneCommand,SceneObject} from './document.mjs';
export function selectionContext(doc:SceneDocument,selected:string[]):{label:string;objects:Array<Omit<SceneObject,'geometry'>&{path:string;geometry:{vertices:number;triangles:number}|null;operations:string[]}>};
export function editTargets(doc:SceneDocument,selected:string[]):string[];
export function validateEditScope(doc:SceneDocument,selected:string[],commands:SceneCommand[]):SceneDocument;
export function planContextEdit(doc:SceneDocument,selected:string[],prompt:string):SceneCommand[]|null;
