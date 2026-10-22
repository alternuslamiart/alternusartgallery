import { Box3, BoxHelper } from 'three';

export function nextSelection(current,id,additive=false) {
  if(!id)return [];
  if(!additive)return [id];
  return current.includes(id)?current.filter(value=>value!==id):[...current,id];
}
export function createSelectionHelpers(root,ids) {
  const nodes=new Map();root.updateMatrixWorld(true);
  root.traverse(node=>{if(node.userData.sceneId)nodes.set(node.userData.sceneId,node);});
  return ids.flatMap((id,index)=>{
    const node=nodes.get(id);if(!node)return [];
    for(let parent=node;parent;parent=parent.parent)if(!parent.visible)return [];
    if(new Box3().setFromObject(node).isEmpty())return [];
    const helper=new BoxHelper(node,index===0?0x4284ff:0x22c55e);
    helper.material.depthTest=false;helper.material.depthWrite=false;helper.material.toneMapped=false;
    helper.renderOrder=1000;helper.raycast=()=>{};
    helper.userData.selectionId=id;
    return [helper];
  });
}
export function disposeSelectionHelpers(helpers) {
  for(const helper of helpers){helper.geometry.dispose();helper.material.dispose();}
}
