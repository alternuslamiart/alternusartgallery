import { mkdir, rename, writeFile, readdir, stat, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { resolveStorageKey, readStoredFile } from '@/lib/platform/storage';
import { hunyuanRequest, workerTaskId } from './hunyuan.mjs';
import { readModelBytes } from './client.mjs';
import {hunyuanObjectStorage,putHunyuanObject,signedHunyuanAsset} from './hunyuan-object-storage';

export async function persistHunyuanAsset(workspaceId: string, jobId: string, taskId: string) {
  const storageKey = `${workspaceId}/hunyuan/${workerTaskId(jobId)}.glb`;
  const cloud=hunyuanObjectStorage();
  if(cloud){
    const reference=`supabase://${cloud.bucket}/${storageKey}`;
    try{await signedHunyuanAsset(reference);return reference;}catch{ /* First upload; upload verifies the private bucket. */ }
    const bytes=await readModelBytes(await hunyuanRequest(`/asset/${workerTaskId(taskId)}`));
    return putHunyuanObject(storageKey,bytes);
  }
  if(process.env.NODE_ENV==='production'&&process.env.HUNYUAN_LOCAL_DEVELOPMENT!=='1')throw new Error('Hunyuan production requires private object storage.');
  // Deterministic destination makes concurrent status polls idempotent.
  try { const existing = await readStoredFile(storageKey); if (existing.length) return storageKey; } catch { /* first copy */ }
  const bytes = await readModelBytes(await hunyuanRequest(`/asset/${workerTaskId(taskId)}`));
  const destination = resolveStorageKey(storageKey);
  await mkdir(path.dirname(destination), {recursive:true});
  const files=await readdir(path.dirname(destination));
  const used=(await Promise.all(files.map(async name=>(await stat(path.join(path.dirname(destination),name))).size))).reduce((a,b)=>a+b,0);
  if(used+bytes.byteLength>1_000_000_000)throw new Error('GPU asset storage is full for this workspace. Archive unused source files before resuming.');
  const temporary = `${destination}.${randomUUID()}.tmp`;
  try{await writeFile(temporary, new Uint8Array(bytes));await rename(temporary, destination);}
  finally{await unlink(temporary).catch(()=>{});}
  return storageKey;
}
