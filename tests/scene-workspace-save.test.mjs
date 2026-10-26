import test from 'node:test';
import assert from 'node:assert/strict';
import {loadWorkspaceDocument,readWorkspaceSave,saveWorkspaceDocument} from '../src/lib/scene/workspace-save.mjs';
import {createHunyuanLiveContext} from '../scripts/hunyuan-live-test-context.mjs';
import {makeDocument} from '../src/lib/scene/document.mjs';

test('cloud opening retries transient outages and preserves authentication/not-found errors',async()=>{
  let calls=0;
  const document={...makeDocument(),id:'project'};
  assert.deepEqual(await loadWorkspaceDocument(async()=>++calls<3?Response.json({error:'Unavailable'},{status:503}):Response.json({document,revision:2}),'project',{wait:async()=>{}}),{document,revision:2});
  assert.equal(calls,3);
  for(const status of [401,403,404]){
    calls=0;
    await assert.rejects(loadWorkspaceDocument(async()=>{calls++;return Response.json({error:{message:'Cannot open'}},{status});},'project'),error=>error.status===status&&error.message==='Cannot open');
    assert.equal(calls,1);
  }
});

test('cloud opening propagates cancellation without retrying',async()=>{
  const controller=new AbortController();controller.abort();
  let calls=0;
  await assert.rejects(loadWorkspaceDocument(async(_url,options)=>{calls++;options.signal.throwIfAborted();},'project',{signal:controller.signal}),{name:'AbortError'});
  assert.equal(calls,1);
});

test('storage acceptance refuses arbitrary remote origins and requires production opt-in',async()=>{
  await assert.rejects(createHunyuanLiveContext('https://alternusartgallery.vercel.app'),/explicitly opted-in/);
  for(const base of ['https://another.example','http://alternusartgallery.vercel.app','https://alternusartgallery.vercel.app/other']){
    await assert.rejects(createHunyuanLiveContext(base,false,{allowProduction:true}),/explicitly opted-in/);
  }
});

test('workspace save preserves storage, authentication and revision errors',async()=>{
  for(const [status,error]of [[503,'Workspace storage is unavailable. Keep your recovery copy or download JSON.'],[409,'A newer version already exists.'],[401,{message:'Sign in again.'}]]){
    await assert.rejects(readWorkspaceSave(Response.json({error},{status}),'project',1),caught=>caught.status===status&&caught.message===(typeof error==='string'?error:error.message));
  }
});
test('workspace save confirms only the expected persisted project and revision',async()=>{
  assert.equal((await readWorkspaceSave(Response.json({id:'project',revision:2,saved:true}),'project',2)).revision,2);
  for(const data of [{},{id:'foreign',revision:2,saved:true},{id:'project',revision:1,saved:true},{id:'project',revision:2,saved:false}]){
    await assert.rejects(readWorkspaceSave(Response.json(data),'project',2),/not confirmed/);
  }
  await assert.rejects(readWorkspaceSave(new Response('Unavailable',{status:503}),'project',2),caught=>caught.status===503&&/recovery/.test(caught.message));
});

test('lost save response is reconciled against the exact cloud document',async()=>{
  const document={id:'project',name:'Edited'};
  const calls=[];
  const fetcher=async(url)=>{calls.push(url);if(calls.length===1)throw new TypeError('network lost');return Response.json({document,revision:2});};
  assert.deepEqual(await saveWorkspaceDocument(fetcher,document,1),{revision:2});
  assert.equal(calls.length,2);
});

test('temporary storage outage retries and never overwrites a newer revision',async()=>{
  const document={id:'project',name:'Edited'};
  let puts=0;
  const fetcher=async(url)=>url.includes('?id=')?Response.json({document:{id:'project',name:'Old'},revision:1}):(puts++<2?Response.json({error:'Unavailable'},{status:503}):Response.json({saved:true,id:'project',revision:2}));
  assert.deepEqual(await saveWorkspaceDocument(fetcher,document,1,{wait:async()=>{}}),{revision:2});
  assert.equal(puts,3);
  const stale=async(url)=>url.includes('?id=')?Response.json({document:{id:'project',name:'Newer'},revision:3}):Response.json({error:'Conflict'},{status:409});
  await assert.rejects(saveWorkspaceDocument(stale,document,1),error=>error.status===409);
});

test('lost response reconciliation tolerates PostgreSQL JSON object key ordering',async()=>{
  const document={id:'project',camera:{position:[1,2,3],target:[0,0,0]},objects:[{id:'box',material:{color:'#ffffff',roughness:0.5}}]};
  const cloud={objects:[{material:{roughness:0.5,color:'#ffffff'},id:'box'}],camera:{target:[0,0,0],position:[1,2,3]},id:'project'};
  let puts=0;
  const fetcher=async url=>{if(url.includes('?id='))return Response.json({document:cloud,revision:2});puts++;throw new TypeError('Response lost');};
  assert.deepEqual(await saveWorkspaceDocument(fetcher,document,1,{wait:async()=>{}}),{revision:2});
  assert.equal(puts,1);
  cloud.camera.position.reverse();
  await assert.rejects(saveWorkspaceDocument(fetcher,document,1,{wait:async()=>{}}),error=>error.status===409);
});

test('cloud loads validate IDs, revisions and scenes before use',async()=>{
  const {makeDocument}=await import('../src/lib/scene/document.mjs');
  const document=makeDocument();
  assert.deepEqual(await loadWorkspaceDocument(async()=>Response.json({document,revision:1}),document.id),{document,revision:1});
  for(const data of [{document,revision:-1},{document,revision:'1'},{document:{...document,id:'other'},revision:1},{document:{...document,objects:[{}]},revision:1}]){
    await assert.rejects(loadWorkspaceDocument(async()=>Response.json(data),document.id,{wait:async()=>{}}),error=>error.code==='INVALID_PROJECT_DATA');
  }
});

test('cloud loads preserve HTTP status and classify non-JSON failures',async()=>{
  for(const status of [401,403,404,422,503]){
    let calls=0;
    await assert.rejects(loadWorkspaceDocument(async()=>{calls++;return new Response('<html>Unavailable</html>',{status});},'project',{wait:async()=>{}}),error=>error.status===status);
    assert.equal(calls,status===503?3:1);
  }
});

test('cloud loading recovers from temporary browser network failures',async()=>{
  const document=makeDocument();let calls=0;
  const loaded=await loadWorkspaceDocument(async()=>{
    if(++calls<3)throw new TypeError('Failed to fetch');
    return Response.json({document,revision:2});
  },document.id,{wait:async()=>{}});
  assert.equal(calls,3);assert.deepEqual(loaded,{document,revision:2});
});
