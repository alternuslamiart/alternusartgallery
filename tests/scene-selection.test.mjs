import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Vector3 } from 'three';
import { makeDocument, makeObject } from '../src/lib/scene/document.mjs';
import { buildScene, disposeScene } from '../src/lib/scene/geometry.mjs';
import { nextSelection, createSelectionHelpers, disposeSelectionHelpers } from '../src/lib/scene/selection.mjs';

test('modifier selection keeps the first object primary and toggles later objects',()=>{
  const first=nextSelection([], 'a');const multi=nextSelection(first,'b',true);
  assert.deepEqual(multi,['a','b']);assert.deepEqual(first,['a']);
  assert.deepEqual(nextSelection(multi,'a',true),['b']);
  assert.deepEqual(nextSelection(multi,'c'),['c']);assert.deepEqual(nextSelection(multi,null),[]);
});
test('every selected object gets a real non-pickable outline: blue first, green additional',()=>{
  const doc=makeDocument();doc.objects=[makeObject('box',{position:[-3,1,0]}),makeObject('sphere',{position:[3,1,0]})];
  const root=buildScene(doc);const helpers=createSelectionHelpers(root,doc.objects.map(o=>o.id));
  assert.equal(helpers.length,2);assert.equal(helpers[0].material.color.getHexString(),'4284ff');assert.equal(helpers[1].material.color.getHexString(),'22c55e');
  for(const h of helpers){assert.equal(h.material.depthTest,false);assert.equal(h.material.toneMapped,false);const hits=[];h.raycast(null,hits);assert.equal(hits.length,0);assert.ok(h.geometry.getAttribute('position').count>0);}
  const before=new Box3().setFromBufferAttribute(helpers[1].geometry.getAttribute('position')).getCenter(new Vector3());
  root.children[1].position.x+=2;root.updateMatrixWorld(true);helpers[1].update();
  const after=new Box3().setFromBufferAttribute(helpers[1].geometry.getAttribute('position')).getCenter(new Vector3());assert.ok(Math.abs(after.x-before.x-2)<1e-6);
  assert.equal(root.children.length,2,'Outlines never enter the editable/exported scene root');
  let disposed=0;helpers.forEach(h=>h.geometry.addEventListener('dispose',()=>disposed++));disposeSelectionHelpers(helpers);assert.equal(disposed,2);disposeScene(root);
});
test('hidden parents and missing IDs do not show outlines; remaining primary follows selection order',()=>{
  const doc=makeDocument();const group=makeObject('group',{visible:false});const child=makeObject('box',{parentId:group.id});const other=makeObject('box');doc.objects=[group,child,other];
  const root=buildScene(doc);const helpers=createSelectionHelpers(root,[child.id,'missing',other.id]);
  assert.equal(helpers.length,1);assert.equal(helpers[0].material.color.getHexString(),'22c55e');disposeSelectionHelpers(helpers);
  const primary=createSelectionHelpers(root,[other.id]);assert.equal(primary[0].material.color.getHexString(),'4284ff');disposeSelectionHelpers(primary);disposeScene(root);
});
