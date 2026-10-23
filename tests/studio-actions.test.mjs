import test from 'node:test';
import assert from 'node:assert/strict';
import {parseStudioCommand as parse,validateStudioAction,STUDIO_ROUTES} from '../src/lib/studio-actions.mjs';
test('English and Albanian commands resolve actual routes and toolbar actions',()=>{
 for(const phrase of ['Open Infrastructure Studio','Hape studion e Infrastrukturës'])assert.deepEqual(parse(phrase),{intent:'studio.navigate',parameters:{studio:'infrastructure'}});
 assert.equal(STUDIO_ROUTES['floor-plan'],'/casynus?mode=floor-plan');
 assert.equal(parse('Open Floor Plan').parameters.studio,'floor-plan');
 assert.equal(parse('Aktivizo hartën botërore').intent,'map.open');
 assert.equal(parse('Zmadho pamjen').parameters.direction,'in');
 assert.equal(parse('Activate the Move tool').parameters.tool,'translate');
 assert.equal(parse('Shto një ndërtesë').parameters.kind,'building');
});
test('transforms preserve units and finite axes without guessing missing dimensions',()=>{
 assert.deepEqual(parse('Move the selected object 200 cm to the left').parameters,{property:'position',axis:'x',value:-2,relative:true});
 assert.equal(parse('Rotate the object 90 degrees').parameters.value,90);
 assert.equal(parse('Increase the height to 3000 mm').parameters.value,3);
 assert.throws(()=>parse('Rotate selected object'),/Specify/);
 assert.throws(()=>parse('Add object'),/Which object/);
 assert.equal(parse('Tell me how to add a cube'),null);
 assert.equal(parse('Go to New York').parameters.query,'New York');
 assert.equal(parse('Move the camera to the left').parameters.direction,'left');
 assert.equal(parse('Rotate the map 90 degrees').parameters.degrees,90);
});
test('action schema rejects unknown actions, extra fields and nonfinite or out-of-range values',()=>{
 assert.throws(()=>validateStudioAction({intent:'eval',parameters:{code:'alert(1)'}}));
 assert.throws(()=>validateStudioAction({intent:'project.save',parameters:{code:'anything'}}));
 assert.throws(()=>validateStudioAction({intent:'viewport.zoom',parameters:{direction:'in',amount:Infinity}}));
 assert.throws(()=>validateStudioAction({intent:'scene.transform',parameters:{property:'position',axis:'x',value:10001,relative:true}}));
 assert.equal(parse('delete all objects').parameters.scope,'all');
 assert.equal(parse('Confirm').intent,'command.confirm');
});
