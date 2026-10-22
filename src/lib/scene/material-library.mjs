import {validateDocument} from './document.mjs';

export function applyLibraryMaterial(document,selection,material) {
  if(!selection.length)throw new Error('Select a 3D object to apply a texture.');
  const byId=new Map(document.objects.map(o=>[o.id,o]));const ids=new Set(selection);
  for(const id of selection){
    let object=byId.get(id);if(!object)throw new Error('Selected object is missing.');
    while(object){if(object.locked)throw new Error('Unlock selected objects and their parents before applying a texture.');object=byId.get(object.parentId);}
  }
  for(let depth=0;depth<32;depth++)for(const object of document.objects)if(ids.has(object.parentId))ids.add(object.id);
  const targets=document.objects.filter(o=>ids.has(o.id)&&o.kind!=='group'&&!o.kind.endsWith('Light'));
  if(!targets.length)throw new Error('Select a mesh or a group containing geometry.');
  if(document.objects.some(o=>ids.has(o.id)&&o.locked))throw new Error('A selected descendant is locked.');
  const meshes=new Set(targets.map(o=>o.id));
  return validateDocument({...document,objects:document.objects.map(o=>meshes.has(o.id)?{...o,material:{...material}}:o)});
}
