import test from "node:test";
import assert from "node:assert/strict";
import { generate3DModel, readModelBytes, require3DSession, discover3DProviders } from "../src/lib/ai3d/client.mjs";
import { exportScene, importModel } from "../src/lib/scene/geometry.mjs";
import { makeDocument, makeObject, commitHistory, undoHistory } from "../src/lib/scene/document.mjs";
globalThis.FileReader ??= class { readAsArrayBuffer(blob) { blob.arrayBuffer().then(value => { this.result = value; this.onloadend?.(); }); } readAsDataURL(blob) { blob.arrayBuffer().then(value => { this.result = `data:${blob.type};base64,${Buffer.from(value).toString("base64")}`; this.onloadend?.(); }); } };
globalThis.ProgressEvent ??= class extends Event {};

test('generation preflight requires a server-recognized user ID and keeps authentication errors actionable', async () => {
  for (const data of [{}, {user:{email:'guest@example.invalid'}}]) {
    await assert.rejects(require3DSession({fetchImpl:async()=>Response.json(data)}), error=>error.status===401&&/Sign in/.test(error.message));
  }
  await require3DSession({fetchImpl:async(url,init)=>{assert.equal(url,'/api/auth/session');assert.equal(init.cache,'no-store');return Response.json({user:{id:'owner'}});}});
  await assert.rejects(require3DSession({fetchImpl:async()=>Response.json({},{status:401})}),error=>error.status===401);
  await assert.rejects(require3DSession({fetchImpl:async()=>new Response('Unavailable',{status:503})}), /session could not be checked/);
});

test('provider discovery waits for the server and distinguishes discovery failure from missing configuration', async () => {
  const available=await discover3DProviders({fetchImpl:async()=>{await new Promise(resolve=>setTimeout(resolve,15));return Response.json({providers:[{id:'hunyuan',label:'Hunyuan',model:'shape'}]});}});
  assert.equal(available[0].id,'hunyuan');
  assert.deepEqual(await discover3DProviders({fetchImpl:async()=>Response.json({providers:[]})}),[]);
  for(const response of [new Response('Unavailable',{status:503}),Response.json({providers:null})]) {
    await assert.rejects(discover3DProviders({fetchImpl:async()=>response}),/availability could not be checked/);
  }
});

test("provider job → real GLB → editable scene preview → apply and undo", async () => {
  const model = makeDocument(); model.objects = [makeObject("box", { dimensions: [2, 3, 1] })];
  const glb = await (await exportScene(model, "glb")).arrayBuffer();
  const doc = makeDocument(), calls = [], progress = [];
  const job = { id: "job1", projectId: doc.id, provider: "tripo", model: "test-model", prompt: "chair", progress: 100, status: "SUCCEEDED", modelURL: "https://cdn.tripo3d.ai/model.glb", assetPath: "/api/ai3d/jobs/job1/asset" };
  const result = await generate3DModel({ provider: "tripo", projectId: doc.id, studio: "interior", prompt: "chair", pollMs: 0, onProgress: value => progress.push(value.status), fetchImpl: async (url, init) => { calls.push({ url, init }); if (url === '/api/ai3d/jobs') return Response.json({ ...job, status: "RUNNING", progress: 20 }); if (url.startsWith('/api/ai3d/jobs/')) return Response.json(job); return new Response(glb); } });
  assert.deepEqual(progress, ["RUNNING", "SUCCEEDED", "IMPORTING"]);
  const objects = await importModel(result.buffer, "generated.glb");
  assert.ok(objects.some(o => o.kind === "mesh")); assert.equal(doc.objects.length, 0);
  const history = commitHistory({ past: [], present: doc, future: [] }, { ...doc, objects });
  assert.ok(history.present.objects.length); assert.equal(undoHistory(history).present.objects.length, 0);
  assert.equal(calls.filter(c => c.init?.method === 'POST').length, 1);
});
test("resume never submits another paid task, and foreign projects cannot be imported", async () => {
  const calls = [];
  await assert.rejects(generate3DModel({ resumeId: "saved-job", projectId: "current", studio: "architecture", fetchImpl: async (url, init) => { calls.push(init); return Response.json({ projectId: "other", status: "SUCCEEDED" }); } }), /different project/);
  assert.equal(calls.length, 1); assert.ok(!calls.some(c => c.method === 'POST'));
});
test("cancelled, failed, oversized or non-GLB results never become scene data", async () => {
  await assert.rejects(readModelBytes(Response.json({ fake: true })), /valid GLB/);
  await assert.rejects(readModelBytes(new Response('x', { headers: { 'content-length': '9000000' } }), 4_000_000), /too large/);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(generate3DModel({ projectId: "p", studio: "architecture", signal: controller.signal, fetchImpl: async () => Response.json({ projectId: "p", status: "RUNNING" }) }), { name: "AbortError" });
  await assert.rejects(generate3DModel({ projectId: "p", studio: "architecture", fetchImpl: async () => Response.json({ projectId: "p", status: "FAILED", error: "No credits" }) }), /No credits/);
});

test('transient job-status failures reconnect without submitting another inference job',async()=>{
  const source=makeDocument();source.objects=[makeObject('box')];const glb=await(await exportScene(source,'glb')).arrayBuffer();
  const job={id:'retry-job',projectId:source.id,provider:'hunyuan',status:'SUCCEEDED',progress:100,assetPath:'/api/ai3d/jobs/retry-job/asset'};
  let submits=0,polls=0;const updates=[];
  const result=await generate3DModel({provider:'hunyuan',projectId:source.id,studio:'architecture',pollMs:0,timeoutMs:1000,onProgress:value=>updates.push(value),fetchImpl:async(url,init)=>{
    if(init?.method==='POST'){submits++;return Response.json({...job,status:'QUEUED',stage:'queued'});}
    if(url.endsWith('/asset'))return new Response(glb);
    if(++polls===1)return Response.json({error:'Temporarily unavailable'},{status:502});return Response.json(job);
  }});
  assert.equal(submits,1);assert.equal(polls,2);assert.ok(updates.some(j=>j.pollWarning));assert.equal(result.buffer.byteLength,glb.byteLength);
});
