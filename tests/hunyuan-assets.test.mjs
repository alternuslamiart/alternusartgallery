import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import * as crypto from 'node:crypto';
import path from 'node:path';
import ts from 'typescript';
import {readModelBytes} from '../src/lib/ai3d/client.mjs';
const load=(file,modules)=>{const exports={};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;new Function('require','exports',code)(name=>{assert.ok(modules[name],name);return modules[name];},exports);return exports;};
const glb=()=>{const bytes=new Uint8Array(12);const view=new DataView(bytes.buffer);view.setUint32(0,0x46546c67,true);view.setUint32(4,2,true);view.setUint32(8,12,true);return bytes;};

test('GPU completion copies GLB to deterministic private storage once and does not depend on worker retention',async()=>{
  const root=await fsp.mkdtemp(path.resolve('.tmp/hunyuan-storage-test-'));let downloads=0;
  const id=crypto.randomUUID(),task=crypto.randomUUID();
  const api=load('src/lib/ai3d/hunyuan-assets.ts',{
    'fs/promises':fsp,'path':path,'crypto':crypto,
    '@/lib/platform/storage':{resolveStorageKey:key=>path.join(root,key),readStoredFile:key=>fsp.readFile(path.join(root,key))},
    './hunyuan.mjs':{workerTaskId:value=>value,hunyuanRequest:async url=>{assert.equal(url,`/asset/${task}`);downloads++;return new Response(glb());}},
    './client.mjs':{readModelBytes},
  });
  const key=await api.persistHunyuanAsset('workspace',id,task);assert.equal(key,`workspace/hunyuan/${id}.glb`);assert.deepEqual(new Uint8Array(await fsp.readFile(path.join(root,key))),glb());
  assert.equal(await api.persistHunyuanAsset('workspace',id,task),key);assert.equal(downloads,1);
  assert.deepEqual(await fsp.readdir(path.dirname(path.join(root,key))),[`${id}.glb`]);
});

test('private Hunyuan asset route checks auth and user/workspace ownership before reading stored bytes',async()=>{
  class NextResponse extends Response {static json(data,init){return Response.json(data,init);}}
  const context={userId:'owner',workspaceId:'workspace'};let authenticated=true,visible=true,reads=0,missingFile=false;
  const api=load('src/app/api/ai3d/jobs/[id]/asset/route.ts',{
    'next/server':{NextResponse},'@/lib/prisma':{prisma:{aIProviderJob:{findFirst:async({where})=>{assert.equal(where.userId,context.userId);assert.equal(where.workspaceId,context.workspaceId);return visible?{provider:'hunyuan',status:'SUCCEEDED',output:{storageKey:'private/key.glb'}}:null;}}}},
    '@/lib/platform/api':{requirePlatformContext:async()=>authenticated?context:Response.json({error:'Sign in'},{status:401}),isApiResponse:value=>value instanceof Response},
    '@/lib/ai3d/jobs':{owned3D:(ctx,id)=>({...ctx,id}),fail3D:(error,status)=>Response.json({error},{status})},
    '@/lib/ai3d/providers.mjs':{safeModelURL:()=>{throw Error('Private assets must not use external worker URLs');}},
    '@/lib/ai3d/client.mjs':{readModelBytes},
    '@/lib/platform/storage':{readStoredFile:async key=>{assert.equal(key,'private/key.glb');reads++;if(missingFile)throw Error('missing');return glb();}},
  });
  const request=new Request('http://localhost/api/ai3d/jobs/job/asset'),params={params:{id:'job'}};
  authenticated=false;assert.equal((await api.GET(request,params)).status,401);assert.equal(reads,0);
  authenticated=true;visible=false;assert.equal((await api.GET(request,params)).status,404);assert.equal(reads,0);
  visible=true;const response=await api.GET(request,params);assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal((await response.arrayBuffer()).byteLength,12);assert.equal(reads,1);
  missingFile=true;const missing=await api.GET(request,params);assert.equal(missing.status,503);assert.match((await missing.json()).error,/private asset volume/);
});
