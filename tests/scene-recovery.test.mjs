import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import * as document from '../src/lib/scene/document.mjs';

test('latest recovery is isolated by identity and studio and skips corrupt records without deletion',async()=>{
  const scene=document.makeDocument('architecture');
  const rows=[
    ['user:old',{document:scene,studio:'architecture',updatedAt:1}],
    ['other:foreign',{document:scene,studio:'architecture',updatedAt:99}],
    ['user:interior',{document:scene,studio:'interior',updatedAt:100}],
    ['user:new',{document:scene,studio:'architecture',updatedAt:2}],
    ['user:broken',{document:{},studio:'architecture',updatedAt:200}],
    ['user:legacy',{document:scene,updatedAt:300}],
  ];
  let closed=0;
  const indexedDB={open(){const request={};queueMicrotask(()=>{request.result={close(){closed++;},transaction(){return {objectStore(){return {openCursor(){const cursorRequest={};let index=0;const next=()=>queueMicrotask(()=>{const row=rows[index++];cursorRequest.result=row?{key:row[0],value:row[1],continue:next}:null;cursorRequest.onsuccess();});next();return cursorRequest;}};}};}};request.onsuccess();});return request;}};
  const exports={};
  const code=ts.transpileModule(fs.readFileSync('src/lib/scene/recovery.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  new Function('require','exports','indexedDB',code)(()=>document,exports,indexedDB);
  const recovered=await exports.latestRecovery('user','architecture');
  assert.equal(recovered.updatedAt,2);
  assert.deepEqual(recovered.document,scene);
  assert.equal(await exports.latestRecovery('missing','architecture'),null);
  assert.equal(closed,2);
  assert.equal(rows.length,6);
});
