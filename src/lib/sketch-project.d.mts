import type {SketchProject} from './floor-plan-recovery.mjs';
export function canonicalSketch(value:SketchProject):string;
export function reconcileSketch(local:SketchProject,revision:number,acknowledged:string,cloud:SketchProject,cloudRevision:number):'same'|'adopt'|'keep';
