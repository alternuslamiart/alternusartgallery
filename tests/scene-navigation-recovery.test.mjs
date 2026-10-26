import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import * as scene from '../src/lib/scene/document.mjs';

test('navigation and page hiding preserve the rendered project under its original identity',async()=>{
  const effects=[],refs=[],writes=[],listeners=new Map();let state=0;
  const window={addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name),document:{visibilityState:'hidden',addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)}};
  const react={useState(initial){const value=state++===1?true:typeof initial==='function'?initial():initial;return [value,()=>{}];},useRef(value){const ref={current:value};refs.push(ref);return ref;},useEffect(fn){effects.push(fn);},useCallback:fn=>fn};
  const modules={react,'@/lib/scene/document.mjs':scene,'@/lib/scene/recovery':{writeRecovery:async(identity,value)=>writes.push({identity,value})},'@/lib/scene/workspace-save.mjs':{}};
  const code=ts.transpileModule(fs.readFileSync('src/components/scene-studio/useSceneDocument.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports={};new Function('require','exports','window',code)(id=>modules[id],exports,window);
  const store=exports.useSceneDocument('architecture','original-user',true);
  // A render during account initialization cannot write the previous scene
  // into the incoming identity's recovery store.
  assert.equal(effects[3](),undefined);
  assert.equal(writes.length,0);
  refs.at(-1).current='casynus:scene-active:original-user:architecture';
  const cleanup=effects[3]();
  listeners.get('visibilitychange')();
  listeners.get('pagehide')();
  // A navigation render can already point current at the next project.
  const current=refs.find(ref=>ref.current===store.document);current.current=scene.makeDocument('interior');
  cleanup();await Promise.resolve();
  assert.equal(writes.length,3);
  for(const {identity,value}of writes){assert.equal(identity,'original-user');assert.equal(value.document.id,store.document.id);assert.equal(value.studio,'architecture');assert.equal(value.dirty,true);}
  assert.equal(listeners.size,0);
});
