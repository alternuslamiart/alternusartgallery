import test from 'node:test';import assert from 'node:assert/strict';
import {parseFloorPlanRecovery} from '../src/lib/floor-plan-recovery.mjs';
const plan={version:1,name:'Drawing',objects:[{id:'wall',type:'wall',start:{x:0,y:0},end:{x:4,y:0},thickness:.18}],settings:{unit:'mm',scale:100,precision:1,gridStepMm:100,snapToGrid:true,snapToPoints:true,orthogonal:true}};
test('floor-plan recovery round trips metric geometry and rejects corrupt or unbounded snapshots',()=>{
 assert.deepEqual(parseFloorPlanRecovery(JSON.stringify(plan)),plan);
 assert.throws(()=>parseFloorPlanRecovery(JSON.stringify({...plan,objects:[{...plan.objects[0],end:{x:100000,y:0}}]})));
 assert.throws(()=>parseFloorPlanRecovery(JSON.stringify({...plan,objects:[plan.objects[0],plan.objects[0]]})));
 assert.throws(()=>parseFloorPlanRecovery(JSON.stringify({...plan,settings:{...plan.settings,unit:'degrees'}})));
 assert.throws(()=>parseFloorPlanRecovery('bad json'));
});
