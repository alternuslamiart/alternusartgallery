import test from 'node:test';
import assert from 'node:assert/strict';
import {makeDocument,createTemplate,makeObject,applyCommands,commitHistory,undoHistory,redoHistory,validateDocument} from '../src/lib/scene/document.mjs';
import {selectionContext,planContextEdit,validateEditScope} from '../src/lib/scene/editing.mjs';

test('component context resolves exact roof ID/path and flat black roof is one undoable transaction',()=>{
 const doc=makeDocument();doc.objects=createTemplate('building');const roof=doc.objects.find(o=>o.name==='Flat roof');
 const context=selectionContext(doc,[roof.id]);assert.match(context.label,/Parametric residence \/ Flat roof/);assert.equal(context.objects[0].id,roof.id);
 const commands=planContextEdit(doc,[roof.id],'Make this roof flat, black, and modern.');
 validateEditScope(doc,[roof.id],commands);const next=applyCommands(doc,commands);
 assert.equal(next.objects.find(o=>o.id===roof.id).material.color,'#111111');assert.equal(next.objects.find(o=>o.id===roof.id).dimensions[1],.25);
 assert.deepEqual(next.objects.filter(o=>o.id!==roof.id),doc.objects.filter(o=>o.id!==roof.id));
 const h=commitHistory({past:[],present:doc,future:[]},next);assert.deepEqual(undoHistory(h).present,doc);assert.deepEqual(redoHistory(undoHistory(h)).present,next);
});
test('wall windows are actual glass components and wall openings, retaining host transforms and stable ID',()=>{
 const doc=makeDocument();const wall=makeObject('box',{name:'Wall',dimensions:[8,3,.3],rotation:[0,.7,0]});doc.objects=[wall];
 const next=applyCommands(doc,planContextEdit(doc,[wall.id],'Add three large glass windows to this wall.'));
 assert.equal(next.objects[0].kind,'group');assert.equal(next.objects.filter(o=>o.name.includes('Window glass')).length,3);
 assert.deepEqual(next.objects[0].rotation,wall.rotation);assert.ok(next.objects.slice(1).every(o=>o.parentId===wall.id));
 assert.deepEqual(validateDocument(JSON.parse(JSON.stringify(next))),next);assert.equal(doc.objects.length,1);
 const marble=applyCommands(next,[{type:'material',id:wall.id,material:'marble',color:'#ffffff'}]);assert.ok(marble.objects.filter(o=>o.name.startsWith('Window glass')).every(o=>o.material.transmission===.9));
 assert.throws(()=>applyCommands(doc,[{type:'windows',id:wall.id,count:20}]),/window|range/i);
});
test('contextual marble affects only selected wall, building height maintains descendants through group scale',()=>{
 const doc=makeDocument();doc.objects=createTemplate('building');const root=doc.objects[0],wall=doc.objects.find(o=>o.name.includes('west wall'));
 const next=applyCommands(doc,planContextEdit(doc,[wall.id],'Change this wall to white marble.'));
 assert.equal(next.objects.find(o=>o.id===wall.id).material.color,'#ffffff');assert.deepEqual(next.objects.filter(o=>o.id!==wall.id),doc.objects.filter(o=>o.id!==wall.id));
 const resized=applyCommands(doc,planContextEdit(doc,[root.id],'Increase the building height by 2 meters.'));
 assert.ok(resized.objects[0].scale[1]>1);assert.deepEqual(resized.objects.slice(1),doc.objects.slice(1));
});
test('ambiguous targets, out-of-scope provider IDs, unknown fields, locked parents and partial failures never mutate scene',()=>{
 const doc=makeDocument();doc.objects=createTemplate('building');const roof=doc.objects.find(o=>o.name==='Flat roof');
 assert.throws(()=>planContextEdit(doc,[],'Change this wall to white marble.'),/select/i);
 assert.throws(()=>planContextEdit(doc,[roof.id,doc.objects[1].id],'Change this wall to white marble.'),/one object/i);
 assert.throws(()=>validateEditScope(doc,[roof.id],[{type:'delete',id:doc.objects[1].id}]),/selected|target/i);
 assert.throws(()=>applyCommands(doc,[{type:'material',id:roof.id,color:'#ffffff',execute:'anything'}]),/field/i);
 const before=JSON.stringify(doc);assert.throws(()=>applyCommands(doc,[{type:'material',id:roof.id,color:'#ffffff'},{type:'transform',id:roof.id,dimensions:[0,1,1]}]));assert.equal(JSON.stringify(doc),before);
 doc.objects[0].locked=true;assert.throws(()=>applyCommands(doc,[{type:'roof',id:roof.id,style:'flat'}]),/locked/i);
});
