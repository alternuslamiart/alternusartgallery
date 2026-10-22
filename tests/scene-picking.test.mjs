import test from 'node:test';
import assert from 'node:assert/strict';
import { PerspectiveCamera, Vector3 } from 'three';
import { buildScene, disposeScene } from '../src/lib/scene/geometry.mjs';
import { makeDocument, makeObject } from '../src/lib/scene/document.mjs';
import { pickScene, isSelectionClick } from '../src/lib/scene/picking.mjs';

const bounds={left:0,top:0,width:1000,height:1000};
function setup(objects) {
  const doc=makeDocument();doc.objects=objects;const root=buildScene(doc,{textures:false});
  const camera=new PerspectiveCamera(45,1,.1,100);camera.position.set(0,0,10);camera.lookAt(0,0,0);camera.updateMatrixWorld();
  return {root,camera};
}
test('nearest surface wins and invisible/locked ancestry cannot steal a pick',()=>{
  const back=makeObject('box',{position:[0,0,0]}),front=makeObject('box',{position:[0,0,2]});
  const {root,camera}=setup([back,front]);
  assert.equal(pickScene(root,camera,bounds,500,500).node.userData.sceneId,front.id);
  root.children[1].visible=false;
  assert.equal(pickScene(root,camera,bounds,500,500).node.userData.sceneId,back.id);
  root.children[1].visible=true;root.children[1].userData.locked=true;
  assert.equal(pickScene(root,camera,bounds,500,500).node.userData.sceneId,back.id);
  root.visible=false;assert.equal(pickScene(root,camera,bounds,500,500),null);disposeScene(root);
});
test('screen-space tolerance selects a thin object just outside its silhouette, not distant empty space',()=>{
  const thin=makeObject('box',{dimensions:[.02,2,.02],position:[0,0,0]});
  const {root,camera}=setup([thin]);
  const center=new Vector3().project(camera);const x=(center.x+1)*500;
  assert.equal(pickScene(root,camera,bounds,x+4,500,0),null);
  assert.equal(pickScene(root,camera,bounds,x+4,500).node.userData.sceneId,thin.id);
  assert.equal(pickScene(root,camera,bounds,x+15,500),null);disposeScene(root);
});
test('selection tolerates hand jitter but never consumes a gizmo drag or camera gesture',()=>{
  const start={button:0,clientX:100,clientY:100};
  assert.equal(isSelectionClick(start,{button:0,clientX:103,clientY:102}),true);
  assert.equal(isSelectionClick(start,start,true),false);
  assert.equal(isSelectionClick(start,{button:0,clientX:120,clientY:100}),false);
  assert.equal(isSelectionClick({...start,button:2},start),false);
  assert.equal(isSelectionClick(null,start),false);
});
