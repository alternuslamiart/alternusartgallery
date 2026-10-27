import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import ts from 'typescript';
import {parseFloorPlanRecovery} from '../src/lib/floor-plan-recovery.mjs';import {createSketch} from '../src/lib/sketch.mjs';
const compiled=ts.transpileModule(fs.readFileSync(new URL('../src/app/api/sketch-projects/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const doc=()=>({version:1,id:'sketch-test',name:'Drawing',objects:[{id:'wall',type:'wall',start:{x:0,y:0},end:{x:4,y:0},thickness:.18}],settings:{unit:'mm',scale:100,precision:1,gridStepMm:100,snapToGrid:true,snapToPoints:true,orthogonal:true},sketch:createSketch()});
function harness({guest=false,foreign=false}={}){
  let row=null,writes=0;
  class Response{constructor(body,status=200){this.body=body;this.status=status;}static json(body,init){return new Response(body,init?.status);}}
  class KnownError extends Error{}
  const blender={findFirst:async({where})=>{assert.equal(where.workspaceId,'workspace-a');assert.equal(where.userId,'user-a');return foreign?null:row;},findUnique:async()=>foreign?{id:'sketch-test'}:row,create:async({data})=>{writes++;row=data;},updateMany:async({where,data})=>{if(row?.settings.revision!==where.settings.equals)return{count:0};writes++;row={...row,...data};return{count:1};},findMany:async()=>row?[row]:[]};
  const prisma={blenderProject:blender,project:{findUnique:async()=>foreign?{id:'sketch-test'}:null,create:async()=>{},updateMany:async()=>({count:1})},$transaction:async fn=>fn(prisma)};
  const adapters={'next/server':{NextResponse:Response},'@prisma/client':{Prisma:{PrismaClientKnownRequestError:KnownError}},'@/lib/prisma':{prisma},'@/lib/platform/api':{requirePlatformContext:async()=>guest?new Response({},401):{workspaceId:'workspace-a',userId:'user-a'},isApiResponse:value=>value instanceof Response},'@/lib/floor-plan-recovery.mjs':{parseFloorPlanRecovery}};
  const exports={};new Function('require','exports',compiled)(id=>{assert.ok(id in adapters,id);return adapters[id];},exports);
  return{put:(document,revision=0)=>exports.PUT({headers:new Headers(),text:async()=>JSON.stringify({document,revision})}),get:(id='sketch-test')=>exports.GET({nextUrl:new URL(`https://example.test/api/sketch-projects?id=${id}`)}),row:()=>row,writes:()=>writes};
}
test('authenticated Sketch API round-trips editable CAD and multiple sketch layers with revision protection',async()=>{
  const h=harness(),d=doc();d.sketch.layers.push({...d.sketch.layers[0],id:'layer2',name:'Paint'});
  assert.equal((await h.put(d)).status,200);assert.deepEqual((await h.get()).body.document,d);
  const next={...d,name:'Renamed'};assert.equal((await h.put(next,1)).body.revision,2);assert.equal((await h.put(d,1)).status,409);assert.equal(h.row().name,'Renamed');
});
test('foreign IDs and signed-out callers cannot read or replace Sketch projects',async()=>{
  const foreign=harness({foreign:true});assert.equal((await foreign.get()).status,404);assert.equal((await foreign.put(doc())).status,409);assert.equal(foreign.writes(),0);
  const guest=harness({guest:true});assert.equal((await guest.put(doc())).status,401);assert.equal((await guest.get()).status,401);
});
test('Sketch API validates drawing payloads and rejects invalid revisions before writes',async()=>{
  const h=harness();for(const change of [d=>d.sketch.layers[0].opacity=3,d=>d.objects[0].end.x=100000,d=>d.id='foreign-format']){const d=doc();change(d);assert.equal((await h.put(d)).status,400);}assert.equal((await h.put(doc(),-1)).status,400);assert.equal(h.writes(),0);
});
test('legacy floor-plan recovery remains compatible and Sketch validation preserves CAD',()=>{const d=doc();delete d.sketch;delete d.id;assert.deepEqual(parseFloorPlanRecovery(JSON.stringify(d)),d);const s=doc();assert.deepEqual(parseFloorPlanRecovery(JSON.stringify(s)).objects,s.objects);});
