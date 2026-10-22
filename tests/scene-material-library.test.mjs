import test from 'node:test';
import assert from 'node:assert/strict';
import {makeDocument,makeObject,MATERIALS} from '../src/lib/scene/document.mjs';
import {applyLibraryMaterial} from '../src/lib/scene/material-library.mjs';

test('library material applies to a complete multi-selection as one new document',()=>{
  const doc=makeDocument();doc.objects=[makeObject('box'),makeObject('sphere')];
  const material={...MATERIALS.wood,map:'data:image/png;base64,iVBORw0KGgo=',uvScale:[2,2]};
  const next=applyLibraryMaterial(doc,doc.objects.map(o=>o.id),material);
  assert.equal(next.objects[0].material.map,material.map);assert.equal(next.objects[1].material.color,MATERIALS.wood.color);assert.equal(doc.objects[0].material.map,undefined);
});
test('group materials reach mesh descendants but skip lights and respect locked descendants',()=>{
  const doc=makeDocument(),group=makeObject('group'),child=makeObject('box',{parentId:group.id}),light=makeObject('pointLight',{parentId:group.id});doc.objects=[group,child,light];
  const next=applyLibraryMaterial(doc,[group.id],MATERIALS.marble);assert.equal(next.objects[1].material.roughness,.18);assert.deepEqual(next.objects[2].material,light.material);
  doc.objects[1].locked=true;assert.throws(()=>applyLibraryMaterial(doc,[group.id],MATERIALS.metal),/locked/i);assert.notEqual(doc.objects[1].material.metalness,.95);
});
test('empty selection, locked parents, invalid maps and stale IDs fail without mutation',()=>{
  const doc=makeDocument(),parent=makeObject('group',{locked:true}),child=makeObject('box',{parentId:parent.id});doc.objects=[parent,child];
  assert.throws(()=>applyLibraryMaterial(doc,[],MATERIALS.wood),/Select/);assert.throws(()=>applyLibraryMaterial(doc,[child.id],MATERIALS.wood),/Unlock/i);
  assert.throws(()=>applyLibraryMaterial(doc,['missing'],MATERIALS.wood),/missing/i);
  doc.objects[0].locked=false;assert.throws(()=>applyLibraryMaterial(doc,[child.id],{...MATERIALS.wood,map:'https://external.invalid/texture.png'}),/embedded/i);
});
