import type {FloorPlanObject,FloorPlanSettings} from '../components/crystal-studio/types';
import type {SketchDocument} from './sketch.mjs';
export type SketchProject={version:1;id?:string;name:string;objects:FloorPlanObject[];settings:FloorPlanSettings;sketch?:SketchDocument};
export function parseFloorPlanRecovery(raw:string):SketchProject;
