import * as THREE from 'three';
import { readModelBytes } from '../ai3d/client.mjs';

// Bounded, per-editor memory cache; documents contain only authenticated job IDs.
const assets = new Map();
const waiting = new Map();
let epoch=0;
const release=source=>source.traverse(node=>{node.geometry?.dispose();for(const m of Array.isArray(node.material)?node.material:node.material?[node.material]:[])m.dispose();});
export function clearGeneratedAssets() {
  epoch++;
  for (const {source} of assets.values()) release(source);
  assets.clear();
  waiting.clear();
}
export function generatedAsset(id) { return assets.get(id); }
export async function cacheGeneratedAsset(buffer, jobId) {
  const started=epoch;
  if(assets.has(jobId))return assets.get(jobId);
  if(assets.size>=8)throw new Error('At most eight generated source models can be loaded per editor session. Reopen this project to release unused assets.');
  if(buffer.byteLength>20_000_000||buffer.byteLength<20)throw new Error('Generated GLB must be under 20 MB.');
  const view=new DataView(buffer),length=view.getUint32(12,true);
  if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==buffer.byteLength||view.getUint32(16,true)!==0x4e4f534a||length>buffer.byteLength-20)throw new Error('Invalid generated GLB.');
  const json=JSON.parse(new TextDecoder().decode(buffer.slice(20,20+length)));
  if((json.images??[]).length||(json.buffers??[]).some(b=>b.uri)||json.extensionsRequired?.length)throw new Error('Shape GLB must contain embedded, uncompressed geometry without textures.');
  const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');
  const gltf=await new GLTFLoader().parseAsync(buffer,'');
  let vertices=0,invalid=Boolean(gltf.animations.length);
  gltf.scene.traverse(node=>{if(node.isSkinnedMesh||node.morphTargetInfluences?.length||node.isLight)invalid=true;if(node.isMesh)vertices+=node.geometry.attributes.position.count;});
  if(invalid||!vertices||vertices>1_000_000){release(gltf.scene);throw new Error('Generated asset must be static mesh geometry under one million vertices.');}
  const bounds=new THREE.Box3().setFromObject(gltf.scene),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  if(!Number.isFinite(size.length())||size.length()===0){release(gltf.scene);throw new Error('Generated model has no finite bounds.');}
  size.max(new THREE.Vector3(.001,.001,.001));
  // Wrappers normalize bounds without changing any source vertex or triangle.
  const source=new THREE.Group(),offset=new THREE.Group();
  offset.position.copy(center).negate();offset.add(gltf.scene);source.add(offset);
  source.scale.set(1/size.x,1/size.y,1/size.z);
  const entry={source,dimensions:size.toArray().map(n=>n/Math.max(...size.toArray())*2),vertices};
  if(epoch!==started){release(source);throw new DOMException('Editor identity changed during asset load.','AbortError');}
  if(assets.size>=8&&!assets.has(jobId)){release(source);throw new Error('Generated source cache capacity reached. Reopen the editor.');}
  assets.set(jobId,entry);return entry;
}
export async function loadGeneratedAssets(document,fetchImpl=fetch) {
  await Promise.all(document.objects.filter(o=>o.kind==='model').map(async o=>{
    const id=o.asset.jobId;if(assets.has(id))return;
    if(!waiting.has(id)){
      const started=epoch;
      const request=(async()=>{
        const response=await fetchImpl(`/api/ai3d/jobs/${encodeURIComponent(id)}/asset`,{cache:'no-store',signal:AbortSignal.timeout(30_000)});
        const buffer=await readModelBytes(response);
        if(epoch!==started)throw new DOMException('Editor identity changed during download.','AbortError');
        await cacheGeneratedAsset(buffer,id);
      })();
      waiting.set(id,request);
    }
    const request=waiting.get(id);
    try{await request;}finally{if(waiting.get(id)===request)waiting.delete(id);}
  }));
}
