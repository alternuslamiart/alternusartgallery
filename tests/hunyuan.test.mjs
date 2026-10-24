import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {Box3,PerspectiveCamera,Vector3} from 'three';
import {hunyuanConfig,validateImageData} from '../src/lib/ai3d/hunyuan.mjs';
import {configured3DProviders,submit3DTask,inspect3DTask} from '../src/lib/ai3d/providers.mjs';
import {cacheGeneratedAsset,clearGeneratedAssets,loadGeneratedAssets,generatedAsset} from '../src/lib/scene/generated-assets.mjs';
import {makeDocument,makeObject,validateDocument,commitHistory,undoHistory,redoHistory} from '../src/lib/scene/document.mjs';
import {buildScene,disposeScene,duplicateObjects} from '../src/lib/scene/geometry.mjs';
import {pickScene} from '../src/lib/scene/picking.mjs';
const id='a0000000-0000-4000-8000-000000000001';
test('Hunyuan config prevents production localhost and unauthenticated remote workers',()=>{
  assert.throws(()=>hunyuanConfig({NODE_ENV:'production',HUNYUAN_API_URL:'http://127.0.0.1:8081'}),/development-only/);
  assert.throws(()=>hunyuanConfig({HUNYUAN_API_URL:'https://gpu.example.test'}),/authentication/);
  assert.throws(()=>hunyuanConfig({HUNYUAN_API_URL:'http://gpu.example.test',HUNYUAN_API_TOKEN:'secret'}));
  assert.deepEqual(configured3DProviders({NODE_ENV:'production',HUNYUAN_API_URL:'http://localhost:8081'}),[]);
  const providers=configured3DProviders({HUNYUAN_API_URL:'http://127.0.0.1:8081',HUNYUAN_API_TOKEN:'secret'});
  assert.equal(providers[0].id,'hunyuan');assert.ok(!JSON.stringify(providers).includes('secret'));
});
test('Hunyuan only submits images, disables texture and maps real states without invented progress',async()=>{
  assert.throws(()=>validateImageData(undefined));assert.throws(()=>validateImageData('data:image/svg+xml;base64,AAAA'));
  assert.throws(()=>validateImageData('data:image/png;base64,'+'A'.repeat(4_000_200)));
  const requests=[],env={HUNYUAN_API_URL:'http://127.0.0.1:8081',HUNYUAN_API_TOKEN:'private'};
  await assert.rejects(submit3DTask('hunyuan','text only',{env}),/Attach/);
  const header=Buffer.alloc(32);Buffer.from([137,80,78,71,13,10,26,10]).copy(header);header.write('IHDR',12);header.writeUInt32BE(32,16);header.writeUInt32BE(32,20);
  const image='data:image/png;base64,'+header.toString('base64');
  assert.equal(validateImageData(image),image);header.writeUInt32BE(4097,16);assert.throws(()=>validateImageData('data:image/png;base64,'+header.toString('base64')),/32–4096/);
  await submit3DTask('hunyuan','a chair',{env,image,fetchImpl:async(url,init)=>{requests.push({url,...init});return Response.json({uid:id});}});
  assert.equal(requests[0].url,'http://127.0.0.1:8081/send');assert.equal(JSON.parse(requests[0].body).texture,false);
  assert.equal(requests[0].headers.Authorization,'Bearer private');
  for(const [status,expected] of Object.entries({queued:'QUEUED',processing:'RUNNING',completed:'SUCCEEDED',failed:'FAILED'})){
    const result=await inspect3DTask('hunyuan',id,{env,fetchImpl:async()=>Response.json({status,error:status==='failed'?'CUDA out of memory':undefined})});
    assert.equal(result.status,expected);assert.equal(result.progress,status==='completed'?100:0);assert.equal(result.modelURL,undefined);
  }
  await assert.rejects(inspect3DTask('hunyuan',id,{env,fetchImpl:async()=>{throw new TypeError('connection refused');}}),/unavailable/);
  assert.equal((await inspect3DTask('hunyuan',id,{env,fetchImpl:async()=>new Response('',{status:404})})).status,'FAILED');
});

// Opt-in actual artifact; excluded from Git. No inference or fabricated mesh.
const demo=process.env.HUNYUAN_TEST_GLB||'ai-services/Hunyuan3D-2.1/demo_shape.glb';
test('verified demo GLB retains every source vertex in a selectable, transformable, durable scene reference',{skip:!existsSync(demo)},async()=>{
  globalThis.ProgressEvent??=class extends Event{};
  const bytes=readFileSync(demo),buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
  const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
  const expected=json.meshes.flatMap(m=>m.primitives).reduce((sum,p)=>sum+json.accessors[p.attributes.POSITION].count,0);
  const asset=await cacheGeneratedAsset(buffer,id);assert.equal(asset.vertices,expected);
  const object=makeObject('model',{name:'Generated shape',asset:{jobId:id,provider:'hunyuan'},dimensions:asset.dimensions,position:[0,asset.dimensions[1]/2,0]});
  const doc=makeDocument(),next=validateDocument({...doc,objects:[object]});
  assert.ok(JSON.stringify(next).length<3000);assert.equal(next.objects[0].asset.jobId,id);
  const restored=validateDocument(JSON.parse(JSON.stringify(next)));
  const history=commitHistory({past:[],present:doc,future:[]},restored);assert.equal(undoHistory(history).present.id,doc.id);assert.equal(redoHistory(undoHistory(history)).present.objects[0].asset.jobId,id);
  const root=buildScene(restored,{textures:false});let count=0;root.traverse(n=>{if(n.isMesh)count+=n.geometry.attributes.position.count;});assert.equal(count,expected);
  const bounds=new Box3().setFromObject(root);assert.ok(Math.abs(Math.max(...bounds.getSize(new Vector3()).toArray())-2)<.001);
  const camera=new PerspectiveCamera(45,1,.01,100);camera.position.set(0,asset.dimensions[1]/2,5);camera.lookAt(0,asset.dimensions[1]/2,0);camera.updateProjectionMatrix();
  assert.equal(pickScene(root,camera,{left:0,top:0,width:500,height:500},250,250)?.node.userData.sceneId,object.id);
  const duplicated=duplicateObjects(restored,[object.id]);assert.equal(duplicated.document.objects.length,2);assert.equal(duplicated.document.objects[1].asset.jobId,id);
  const transformed=validateDocument({...restored,objects:[{...object,position:[3,2,1],rotation:[.1,.2,.3],scale:[2,1,1]}]});
  const moved=buildScene(transformed,{textures:false});assert.deepEqual(moved.children[0].position.toArray(),[3,2,1]);assert.equal(moved.children[0].rotation.y,.2);assert.equal(moved.children[0].scale.x,2);
  disposeScene(root);disposeScene(moved);clearGeneratedAssets();
  let downloads=0;await loadGeneratedAssets(restored,async url=>{assert.match(url,/\/api\/ai3d\/jobs\/.+\/asset$/);downloads++;return new Response(bytes);});assert.equal(downloads,1);clearGeneratedAssets();
  let release;const gate=new Promise(resolve=>{release=resolve;});
  const late=loadGeneratedAssets(restored,async()=>{await gate;return new Response(bytes);});
  clearGeneratedAssets();release();await assert.rejects(late,{name:'AbortError'});assert.equal(generatedAsset(id),undefined);
});
