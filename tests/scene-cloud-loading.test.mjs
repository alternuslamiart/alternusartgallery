import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import * as scene from '../src/lib/scene/document.mjs';

const code=ts.transpileModule(fs.readFileSync('src/components/scene-studio/useSceneDocument.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function harness({recovery,load,preferCloud=false}){
  const states=[],refs=[],effects=[],writes=[],puts=[];let stateIndex=0,refIndex=0,reads=0;
  const react={useState(initial){const i=stateIndex++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return [states[i],value=>{states[i]=typeof value==='function'?value(states[i]):value;}];},useRef(value){const i=refIndex++;return refs[i]??(refs[i]={current:value});},useEffect(fn){effects.push(fn);},useCallback:fn=>fn};
  const document=recovery.document;
  const modules={react,'@/lib/scene/document.mjs':scene,'@/lib/scene/recovery':{readRecovery:async()=>structuredClone(recovery),writeRecovery:async(identity,value)=>writes.push({identity,value:structuredClone(value)})},'@/lib/scene/workspace-save.mjs':{loadWorkspaceDocument:async()=>load(++reads),saveWorkspaceDocument:async(_fetch,document,revision)=>{puts.push({document,revision});return {revision:revision+1};}}};
  const window={location:{href:`http://localhost/casynus?project=${document.id}${preferCloud?'&cloud=1':''}`},history:{replaceState(){}},addEventListener(){},removeEventListener(){}};
  const exports={};new Function('require','exports','window','sessionStorage','fetch','setTimeout','clearTimeout',code)(id=>modules[id],exports,window,{getItem:()=>null,setItem(){}},()=>{},()=>1,()=>{});
  const render=()=>{stateIndex=refIndex=0;effects.length=0;return exports.useSceneDocument('architecture','user',true,document.id);};
  return {states,writes,puts,render,get reads(){return reads;},async start(){render();effects[0]();for(let i=0;i<20&&!states[1];i++)await tick();return render();}};
}
const unavailable=()=>{throw Object.assign(new Error('Database connection temporarily unavailable.'),{status:503});};
const recovery=(dirty=true)=>({document:scene.makeDocument(),revision:2,dirty,updatedAt:1,studio:'architecture'});

test('failed cloud reload preserves the actual error and cannot PUT recovery',async()=>{
  const h=harness({recovery:recovery(),load:unavailable});const store=await h.start();
  assert.match(store.failure,/Database connection temporarily unavailable/);
  await store.save();assert.equal(h.puts.length,0);assert.equal(h.reads,2);
  assert.ok(h.writes.length);assert.equal(h.writes[0].value.document.id,store.document.id);
});

test('a clean cached scene cannot claim verified cloud storage while reload is failing',async()=>{
  const h=harness({recovery:recovery(false),load:unavailable});const store=await h.start();
  await assert.rejects(store.saveVerified(),/Database connection temporarily unavailable/);
  assert.equal(h.puts.length,0);
});

test('authentication, permission and corrupt-scene failures preserve recovery without uploads',async()=>{
  for(const status of [401,403,422]){
    const h=harness({recovery:recovery(),load:()=>{throw Object.assign(new Error(`Cloud status ${status}`),{status});}});
    const store=await h.start();await store.save();assert.equal(h.puts.length,0);assert.match(h.render().failure,new RegExp(String(status)));
  }
});

test('clean recovery reconnects to a newer cloud scene without overwriting it',async()=>{
  const local=recovery(false),cloud={...local.document,name:'Latest cloud'};
  const h=harness({recovery:local,load:count=>count===1?unavailable():{document:cloud,revision:3}});
  const store=await h.start();await store.save();const restored=h.render();
  assert.deepEqual(restored.document,cloud);assert.equal(restored.failure,null);assert.equal(h.puts.length,0);
  assert.equal(h.writes.at(-1).value.revision,3);assert.equal(h.writes.at(-1).value.dirty,false);
});

test('dirty recovery conflicts with a newer cloud revision and stays recoverable',async()=>{
  const local=recovery(),cloud={...local.document,name:'Other device'};
  const h=harness({recovery:local,load:count=>count===1?unavailable():{document:cloud,revision:3}});
  const store=await h.start();await store.save();const restored=h.render();
  assert.equal(restored.conflict,true);assert.deepEqual(restored.document,local.document);assert.equal(h.puts.length,0);
  assert.equal(h.writes.at(-1).value.dirty,true);
});

test('verified current revision permits saving unsaved recovery changes',async()=>{
  const local=recovery(),cloud={...local.document,name:'Old cloud'};
  const h=harness({recovery:local,load:count=>count===1?unavailable():{document:cloud,revision:2}});
  const store=await h.start();await store.save();
  assert.equal(h.puts.length,1);assert.equal(h.puts[0].revision,2);assert.deepEqual(h.puts[0].document,local.document);assert.equal(h.render().failure,null);
});

test('404 distinguishes never-uploaded local projects from missing saved projects',async()=>{
  for(const revision of [0,2]){
    const local={...recovery(),revision};
    const h=harness({recovery:local,load:()=>{throw Object.assign(new Error('Project not found.'),{status:404});}});
    const store=await h.start();await store.save();
    assert.equal(h.puts.length,revision===0?1:0);
    if(revision)assert.match(h.render().failure,/not found/);else assert.equal(h.render().failure,null);
  }
});

test('an unsaved local project can upload after an outage followed by a verified 404',async()=>{
  const local={...recovery(),revision:0};
  const h=harness({recovery:local,load:count=>{if(count===1)return unavailable();throw Object.assign(new Error('Project not found.'),{status:404});}});
  const store=await h.start();await store.save();
  assert.equal(h.puts.length,1);assert.equal(h.puts[0].revision,0);assert.equal(h.render().failure,null);
});

test('explicit cloud selection archives dirty recovery before replacing its normal slot',async()=>{
  const local=recovery(),cloud={...local.document,name:'Chosen cloud'};
  const h=harness({recovery:local,preferCloud:true,load:()=>({document:cloud,revision:3})});
  const store=await h.start();assert.deepEqual(store.document,cloud);
  assert.equal(h.writes.length,1);assert.notEqual(h.writes[0].value.document.id,local.document.id);
  assert.equal(h.writes[0].value.revision,0);assert.equal(h.writes[0].value.dirty,true);
});

test('edits made during reconnection are never replaced by the delayed cloud response',async()=>{
  const local=recovery(false);let finish;
  const h=harness({recovery:local,load:count=>count===1?unavailable():new Promise(resolve=>{finish=resolve;})});
  const store=await h.start();const pending=store.save();while(!finish)await tick();
  const edited={...local.document,name:'Edited while reconnecting'};store.commit(edited);h.render();
  finish({document:local.document,revision:2});await pending;
  assert.deepEqual(h.render().document,edited);assert.equal(h.puts.length,0);
});

test('studio opens immediately without requestedId and falls back to template on missing project',async()=>{
  const local=recovery();
  const h=harness({recovery:local,load:()=>{throw Object.assign(new Error('Project not found.'),{status:404});}});
  // Without requestedId, ready is true immediately
  let stateIndex=0,refIndex=0;
  const exports={};
  new Function('require','exports','window','sessionStorage','fetch','setTimeout','clearTimeout',code)(id=>({
    react:{useState:initial=>[typeof initial==='function'?initial():initial,()=>{}],useRef:val=>({current:val}),useEffect:()=>{},useCallback:fn=>fn},
    '@/lib/scene/document.mjs':scene,
    '@/lib/scene/recovery':{readRecovery:async()=>null,writeRecovery:async()=>{}},
    '@/lib/scene/workspace-save.mjs':{}
  }[id]),exports,{location:{href:'http://localhost/casynus'},history:{replaceState(){}},addEventListener(){},removeEventListener(){}},{getItem:()=>null,setItem(){}},()=>{},()=>1,()=>{});
  const unconstrainedStore=exports.useSceneDocument('architecture','guest',false,undefined);
  assert.equal(unconstrainedStore.ready,true);
  assert.ok(unconstrainedStore.document.objects.length>0);
});
