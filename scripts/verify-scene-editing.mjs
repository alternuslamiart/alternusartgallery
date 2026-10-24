// Real Chrome interaction regression. No auth, AI, storage or rendering HTTP mocks.
// Finite contextual prompts execute the production local command path. Native AI
// requires a separately authenticated provider/database session.
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Box3,Vector3,PerspectiveCamera} from 'three';
import {makeDocument,makeObject} from '../src/lib/scene/document.mjs';
import {buildScene,disposeScene} from '../src/lib/scene/geometry.mjs';
const base=process.env.STUDIO_QA_URL||'http://localhost:3033';
assert.ok(['localhost','127.0.0.1'].includes(new URL(base).hostname));
const out=path.resolve('.tmp/scene-editing-'+Date.now());fs.mkdirSync(out,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const chrome=spawn(process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=9363',`--user-data-dir=${out}/profile`,'--no-first-run','--window-size=1440,900','about:blank'],{windowsHide:true,stdio:'ignore'});
let socket;
async function run(){
 let tabs;for(let i=0;i<50;i++){try{tabs=await(await fetch('http://localhost:9363/json')).json();if(tabs.length)break;}catch{}await wait(200);}
 assert.ok(tabs?.length);socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
 let id=0;const pending=new Map(),errors=[],requests=[];
 socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error'){const text=m.params.args.map(a=>a.value||a.description||'').join(' ');if(/shader|WebGLProgram/i.test(text))errors.push(text);}if(m.method==='Network.requestWillBeSent'&&m.params.request.url.includes('/api/ai-scene'))requests.push(m.params.request.url);});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
 const until=async(expression,message)=>{for(let i=0;i<160;i++){if(await evaluate(expression))return;await wait(100);}const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out+'/failure.png',Buffer.from(shot.data,'base64'));throw Error((message||expression)+'\n'+await evaluate('document.body.innerText.slice(-2400)'));};
 const ready=s=>until(`Boolean(document.querySelector(${JSON.stringify(s)}))`);
 const key=async(key,modifiers=0)=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key,modifiers});await send('Input.dispatchKeyEvent',{type:'keyUp',key,modifiers});await wait(150);};
 const click=async(x,y)=>{await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',buttons:1,clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',buttons:0,clickCount:1});await wait(150);};
 const doc=makeDocument(),building=makeObject('group',{name:'Building',position:[0,0,0]}),roof=makeObject('box',{name:'Roof',parentId:building.id,position:[0,4,0],dimensions:[6,.6,4]}),wall=makeObject('box',{name:'Wall',parentId:building.id,position:[0,1.5,0],dimensions:[6,3,.2]}),floor=makeObject('box',{name:'Floor',parentId:building.id,position:[0,0,0],dimensions:[6,.2,4]});doc.objects=[building,roof,wall,floor];
 const root=buildScene(doc,{textures:false}),bounds=new Box3().setFromObject(root),center=bounds.getCenter(new Vector3()),radius=Math.max(2,bounds.getSize(new Vector3()).length()*.65),camera=new PerspectiveCamera(45,1440/900,.05,20000);camera.position.copy(center).add(new Vector3(1,.75,1).normalize().multiplyScalar(radius*2));camera.lookAt(center);camera.updateMatrixWorld();disposeScene(root);
 const project=v=>{const p=new Vector3(...v).project(camera);return[(p.x+1)*720,(1-p.y)*450];};
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Emulation.setFocusEmulationEnabled',{enabled:true});await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('cookiePreference','necessary');localStorage.setItem('cedium_signin_popup_dismissed','1');`});
 await send('Page.navigate',{url:base+'/casynus'});await ready('.scene-canvas canvas');await ready('[aria-label="Import scene file"]');await wait(700);
 await evaluate(`(()=>{const input=document.querySelector('[aria-label="Import scene file"]'),d=new DataTransfer();d.items.add(new File([${JSON.stringify(JSON.stringify(doc))}],'editing.json',{type:'application/json'}));input.files=d.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);await ready(`[data-scene-object-id="${roof.id}"]`);await wait(400);
 await evaluate(`document.querySelector('[aria-label="Fit entire scene"]').click();window.__editPhases=[];new MutationObserver(()=>{const phase=document.querySelector('.scene-canvas').dataset.editPhase;if(phase)window.__editPhases.push(phase);}).observe(document.querySelector('.scene-canvas'),{attributes:true});`);await wait(300);
 await click(...project([0,4.3,0]));await until(`document.querySelector('[data-selection="primary"]')?.dataset.sceneObjectId===${JSON.stringify(roof.id)}`,'Raycast selects roof component');
 assert.equal(await evaluate(`document.querySelector('[aria-label="Selected object context"]').textContent`),'Selected: Building / Roof');
 const draft=async text=>{await evaluate(`(()=>{const t=document.querySelector('.studio-ai-textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(t,${JSON.stringify(text)});t.dispatchEvent(new Event('input',{bubbles:true}));})()`);await until(`!document.querySelector('[aria-label="Send AI request"]')?.disabled`);};
 const command=async(text,enter=false)=>{await draft(text);if(enter){await evaluate(`document.querySelector('.studio-ai-textarea').focus()`);await key('Enter');}else await evaluate(`document.querySelector('[aria-label="Send AI request"]').click()`);await until(`(Boolean(document.querySelector('.studio-ai-message:last-child.is-assistant .studio-ai-message-body'))&&document.querySelector('.studio-ai-message.is-user')?.textContent.includes(${JSON.stringify(text)}))||Boolean(document.querySelector('.studio-ai-error'))`,'Command reply');const error=await evaluate(`document.querySelector('.studio-ai-error')?.textContent`);if(error)throw Error(error);await until(`Boolean(document.querySelector('[aria-label="Send AI request"]'))`);};
 const recovered=async()=>{await wait(550);return evaluate(`new Promise((resolve,reject)=>{const q=indexedDB.open('casynus-scene-recovery',1);q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result,r=db.transaction('documents').objectStore('documents').get('guest:'+new URL(location.href).searchParams.get('project'));r.onsuccess=()=>{resolve(r.result?.document);db.close()};r.onerror=()=>reject(r.error);};})`);};
 await command('Make this roof flat, black, and modern.');let saved=await recovered();assert.equal(saved.objects.find(o=>o.id===roof.id).material.color,'#111111');assert.equal(saved.objects.find(o=>o.id===roof.id).dimensions[1],.25);assert.deepEqual(saved.objects.find(o=>o.id===wall.id),wall);
 await evaluate(`document.querySelector('.scene-canvas canvas').focus();document.activeElement.blur()`);await key('z',2);saved=await recovered();assert.equal(saved.objects.find(o=>o.id===roof.id).dimensions[1],.6);await key('z',10);
 // Direct canvas click, independent of hierarchy selection.
 await evaluate(`document.querySelector('[aria-label="Minimize AI assistant"]').click()`);
 await click(...project([0,1.5,.11]));await until(`document.querySelector('[data-selection="primary"]')?.dataset.sceneObjectId===${JSON.stringify(wall.id)}`,'Raycast selects wall component');
 await evaluate(`document.querySelector('[aria-label="Show AI chat"]').click()`);
 await command('Change this wall to white marble.',true);saved=await recovered();assert.equal(saved.objects.find(o=>o.id===wall.id).material.color,'#ffffff');assert.equal(saved.objects.find(o=>o.id===roof.id).material.color,'#111111');
 await command('Add three large glass windows to this wall.');saved=await recovered();assert.equal(saved.objects.filter(o=>o.name.startsWith('Window glass')).length,3);assert.equal(saved.objects.find(o=>o.id===wall.id).kind,'group');
 await evaluate(`document.querySelector('[data-scene-object-id="${building.id}"] .scene-tree-name').click()`);await command('Increase the building height by 2 meters.');saved=await recovered();assert.ok(saved.objects[0].scale[1]>1);
 await until(`!document.querySelector('.scene-canvas').dataset.editPhase`,'Feedback fades after completion');const phases=await evaluate('window.__editPhases');assert.ok(phases.includes('processing')&&phases.includes('updating')&&phases.includes('completed'),JSON.stringify(phases));
 assert.equal(await evaluate(`Boolean(document.querySelector('.cs-chat-status'))`),false);assert.ok(await evaluate(`Math.abs(document.querySelector('.scene-left').getBoundingClientRect().bottom-document.querySelector('.studio-ai-panel').getBoundingClientRect().bottom)<2`));
 assert.equal(requests.length,0,'Finite commands execute locally without mocked or unnecessary AI calls');
 const screenshot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out+'/desktop.png',Buffer.from(screenshot.data,'base64'));
 await send('Page.reload');await ready(`[data-scene-object-id="${wall.id}"]`);assert.equal((await recovered()).objects.filter(o=>o.name.startsWith('Window glass')).length,3);
 await evaluate(`document.querySelector('[data-scene-object-id="${roof.id}"] .scene-tree-name').click()`);await command('Delete selected object');assert.ok(await evaluate(`document.querySelector('.studio-ai-message.is-assistant:last-child').textContent.includes('Confirm')`));assert.ok((await recovered()).objects.some(o=>o.id===roof.id));await command('Cancel');
 await click(330,820);assert.equal(await evaluate(`Boolean(document.querySelector('[aria-label="Selected object context"]'))`),false);
 await draft('Change this wall to white marble.');await evaluate(`document.querySelector('[aria-label="Send AI request"]').click()`);await ready('.studio-ai-error');assert.match(await evaluate(`document.querySelector('.studio-ai-error').textContent`),/select/i);assert.equal((await recovered()).objects.length,saved.objects.length);
 await evaluate(`document.querySelector('[data-scene-object-id="${roof.id}"] .scene-tree-name').click()`);
 await draft('Give this roof a cobalt finish with satin roughness using the scene planner.');await evaluate(`document.querySelector('[aria-label="Send AI request"]').click()`);
 for(let i=0;i<50&&!requests.length;i++)await wait(100);assert.equal(requests.length,1,'Unrecognized instruction reaches the real native planner route');
 await ready('.studio-ai-error');await until(`!document.querySelector('.scene-canvas').dataset.editPhase`);assert.match(await evaluate(`document.querySelector('.studio-ai-error').textContent`),/sign in|authenticat|configured|credit|workspace/i);
 assert.deepEqual((await recovered()).objects,saved.objects,'Real provider/auth failure preserves actual geometry');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await wait(400);await evaluate(`document.querySelector('.scene-left .cs-header button[aria-label*="Collapse"]')?.click();document.querySelector('[aria-label="Collapse inspector"]')?.click()`);
 await until(`document.querySelector('.scene-workbench').classList.contains('scene-left-closed')&&document.querySelector('.scene-workbench').classList.contains('scene-right-closed')`,'Mobile panels collapse before screenshot');
 const mobile=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out+'/mobile.png',Buffer.from(mobile.data,'base64'));
 assert.equal(errors.length,0,JSON.stringify(errors));console.log('PASS real raycasting/context, production roof/windows/material/height commands, GPU states, keyboard submit/undo/redo, IndexedDB reload, confirmation, native planner guest/auth failure integrity and sidebar/chat alignment. No HTTP mocks.');console.log('Artifacts',out);await send('Browser.close');
}
run().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{socket?.close();chrome.kill();});
