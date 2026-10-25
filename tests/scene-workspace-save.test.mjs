import test from 'node:test';
import assert from 'node:assert/strict';
import {readWorkspaceSave,saveWorkspaceDocument} from '../src/lib/scene/workspace-save.mjs';
import {createHunyuanLiveContext} from '../scripts/hunyuan-live-test-context.mjs';

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
