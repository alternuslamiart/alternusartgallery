import {createClient} from '@supabase/supabase-js';

export function hunyuanObjectStorage() {
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,bucket=process.env.HUNYUAN_STORAGE_BUCKET;
  if(!url||!key||!bucket)return null;
  const origin=new URL(url);
  if(origin.protocol!=='https:'||origin.username||origin.password||origin.search||origin.hash||origin.pathname!=='/'||!/^[a-z0-9][a-z0-9._-]{1,62}$/.test(bucket))throw new Error('Invalid private Hunyuan object storage configuration.');
  const client=createClient(origin.origin,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,redirect:'error',signal:AbortSignal.timeout(25_000)})}});
  return{client,bucket};
}

export async function signedHunyuanAsset(reference:string) {
  if(!reference.startsWith('supabase://'))return null;
  const storage=hunyuanObjectStorage();if(!storage)throw new Error('Private object storage is unavailable.');
  const parsed=new URL(reference),key=parsed.pathname.slice(1);
  if(parsed.hostname!==storage.bucket||!key||key.includes('..'))throw new Error('Invalid private asset reference.');
  const {data:bucket,error:bucketError}=await storage.client.storage.getBucket(storage.bucket);
  if(bucketError||!bucket||bucket.public)throw new Error('Hunyuan requires an existing private object-storage bucket.');
  const {data,error}=await storage.client.storage.from(storage.bucket).createSignedUrl(key,120,{download:'Casynus_Hunyuan.glb'});
  if(error||!data?.signedUrl)throw new Error('Private generated model is unavailable.');
  return data.signedUrl;
}

export async function putHunyuanObject(key:string,bytes:ArrayBuffer) {
  const storage=hunyuanObjectStorage();if(!storage)throw new Error('Private object storage is unavailable.');
  // The configured bucket must be private. Never silently publish generated data.
  const {data:bucket,error:bucketError}=await storage.client.storage.getBucket(storage.bucket);
  if(bucketError||!bucket||bucket.public)throw new Error('Hunyuan requires an existing private object-storage bucket.');
  const {error}=await storage.client.storage.from(storage.bucket).upload(key,bytes,{contentType:'model/gltf-binary',upsert:true});
  if(error)throw new Error('Private generated model could not be stored.');
  return `supabase://${storage.bucket}/${key}`;
}
