// Opt-in real NextAuth/database acceptance. Creates and cleans only an
// isolated QA principal/workspace. No email, provider request or GPU submission.
import assert from 'node:assert/strict';
import {createHunyuanLiveContext} from './hunyuan-live-test-context.mjs';
import {makeDocument,makeObject} from '../src/lib/scene/document.mjs';
const production=process.argv.includes('--production');
const base=process.env.STUDIO_QA_URL||(production?'https://alternusartgallery.vercel.app':'http://127.0.0.1:3000');
let qa;
try{
  qa=await createHunyuanLiveContext(base,false,{allowProduction:production});
  const document=makeDocument('architecture');document.name='Isolated storage acceptance';document.objects=[makeObject('box')];
  const save=(context,doc,revision)=>context.request('/api/studio-projects',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({document:doc,revision})});
  const first=await save(qa,document,0);assert.equal(first.status,200);assert.equal((await first.json()).revision,1);
  assert.deepEqual((await qa.json('/api/studio-projects?id='+document.id)).document,document);
  const outcomes=await Promise.all(['first','second'].map(name=>save(qa,{...document,name},1)));
  assert.deepEqual(outcomes.map(response=>response.status).sort(),[200,409]);
  const persisted=await qa.json('/api/studio-projects?id='+document.id);assert.equal(persisted.revision,2);
  await qa.logout();assert.equal((await qa.request('/api/studio-projects?id='+document.id)).status,401);
  await qa.login();assert.deepEqual(await qa.json('/api/studio-projects?id='+document.id),persisted);
  console.log('PASS real workspace initialization, save/read, concurrent conflict and sign-out/sign-in/reopen; no GPU submissions');
}catch(error){console.error('Storage acceptance failed:',error instanceof assert.AssertionError||/^(Live API |Credentials sign-in failed|Real NextAuth)/.test(error.message)?error.message:`${error.name}: ${error.message} (${error.cause?.code||error.code||'no code'})`);process.exitCode=1;}
finally{await qa?.cleanup();}
