// Opt-in real NextAuth/database acceptance. Creates and cleans only an
// isolated QA principal/workspace. No email, provider request or GPU submission.
import assert from 'node:assert/strict';
import {createHunyuanLiveContext} from './hunyuan-live-test-context.mjs';
import {makeDocument,makeObject} from '../src/lib/scene/document.mjs';
const production=process.argv.includes('--production');
const base=process.env.STUDIO_QA_URL||(production?'https://alternusartgallery.vercel.app':'http://127.0.0.1:3000');
let qa, other;
try{
  qa=await createHunyuanLiveContext(base,false,{allowProduction:production});
  const document=makeDocument('architecture');document.name='Isolated storage acceptance';document.objects=[makeObject('box')];
  const save=(context,doc,revision)=>context.request('/api/studio-projects',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({document:doc,revision})});
  const first=await save(qa,document,0);assert.equal(first.status,200);assert.equal((await first.json()).revision,1);
  assert.deepEqual((await qa.json('/api/studio-projects?id='+document.id)).document,document);
  const outcomes=await Promise.all(['first','second'].map(name=>save(qa,{...document,name},1)));
  assert.deepEqual(outcomes.map(response=>response.status).sort(),[200,409]);
  const persisted=await qa.json('/api/studio-projects?id='+document.id);assert.equal(persisted.revision,2);
  const scenes=[persisted];
  for(const studio of ['interior','infrastructure']){
    const scene=makeDocument(studio);scene.name=`Isolated ${studio} storage acceptance`;
    const group=makeObject('group');
    scene.objects=[group,makeObject('box',{parentId:group.id}),makeObject('pointLight',{parentId:group.id,intensity:75})];
    scene.objects[1].material.map='data:image/png;base64,iVBORw0KGgo=';
    const result=await save(qa,scene,0);assert.equal(result.status,200);
    assert.deepEqual((await qa.json('/api/studio-projects?id='+scene.id)).document,scene);
    scenes.push({document:scene,revision:1});
  }
  other=await createHunyuanLiveContext(base,false,{allowProduction:production});
  for(const scene of scenes){
    assert.equal((await other.request('/api/studio-projects?id='+scene.document.id)).status,404);
    assert.equal((await save(other,scene.document,0)).status,409);
    assert.deepEqual(await qa.json('/api/studio-projects?id='+scene.document.id),scene);
  }
  assert.deepEqual((await other.json('/api/studio-projects')).projects,[]);
  // Real auth middleware permits eight requests per minute per IP. Two
  // account logins plus logout/login must span windows; never bypass it.
  console.log('Waiting for the auth rate-limit window before logout/login acceptance.');
  await new Promise(resolve=>setTimeout(resolve,61_000));
  await qa.logout();assert.equal((await qa.request('/api/studio-projects?id='+document.id)).status,401);
  await qa.login();for(const scene of scenes)assert.deepEqual(await qa.json('/api/studio-projects?id='+scene.document.id),scene);
  console.log('PASS real three-studio save/read, hierarchy/material/light/camera round-trip, concurrent conflict, two-account isolation and sign-out/sign-in/reopen; no GPU submissions');
}catch(error){console.error('Storage acceptance failed:',error instanceof assert.AssertionError||/^(Live API |Credentials sign-in failed|Real NextAuth)/.test(error.message)?error.message:`${error.name}: ${error.message} (${error.cause?.code||error.code||'no code'})`);process.exitCode=1;}
finally{try{await other?.cleanup();}finally{await qa?.cleanup();}}
