import test from 'node:test';
import assert from 'node:assert/strict';
import {makeDocument,makeObject} from '../src/lib/scene/document.mjs';
import {buildScene,disposeScene} from '../src/lib/scene/geometry.mjs';
import {createEditOverlay,disposeEditOverlay} from '../src/lib/scene/edit-overlay.mjs';
test('GPU feedback targets only selected subtree, borrows geometry and releases owned shaders',()=>{
 const doc=makeDocument(),group=makeObject('group'),wall=makeObject('box',{parentId:group.id}),other=makeObject('box');doc.objects=[group,wall,other];
 const root=buildScene(doc,{textures:false}),overlay=createEditOverlay(root,[group.id]);
 assert.equal(overlay.children.length,1);const mesh=overlay.children[0];assert.equal(mesh.geometry,root.children[0].children[0].geometry);
 assert.equal(mesh.material.depthWrite,false);assert.equal(mesh.material.transparent,true);const hits=[];mesh.raycast(null,hits);assert.equal(hits.length,0);
 let geometryDisposals=0,shaderDisposals=0;mesh.geometry.addEventListener('dispose',()=>geometryDisposals++);mesh.material.addEventListener('dispose',()=>shaderDisposals++);
 disposeEditOverlay(overlay);assert.equal(shaderDisposals,1);assert.equal(geometryDisposals,0);assert.equal(root.children.length,2);disposeScene(root);
});
