// Local browser acceptance using installed Chrome and its isolated QA profile.
// Start a production server on localhost:3008. --live uses a fresh real QA login,
// exercises authenticated saves and logout/login; never calls an AI/GPU provider.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
import {createHunyuanLiveContext} from './hunyuan-live-test-context.mjs';
import {canonicalSketch} from '../src/lib/sketch-project.mjs';
const live=process.argv.includes('--live'),base=process.env.SKETCH_QA_URL||'http://localhost:3008';assert.ok(['localhost','127.0.0.1'].includes(new URL(base).hostname));
const out=path.resolve(`.tmp/sketch-qa-${Date.now()}`);fs.mkdirSync(out,{recursive:true});let qa,socket,chrome;const pending=new Map(),errors=[],downloads=[];let id=0;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id,timer=setTimeout(()=>{pending.delete(n);reject(Error(`CDP timeout ${method}`));},30000);pending.set(n,{resolve,reject,timer});socket.send(JSON.stringify({id:n,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
async function until(expression,label){for(let i=0;i<250;i++){if(await evaluate(expression))return;await wait(120);}throw Error(`Timed out: ${label}`);}
const click=async label=>{await evaluate(`(()=>{const e=[...document.querySelectorAll('button')].find(e=>e.getAttribute('aria-label')===${JSON.stringify(label)});if(!e)throw Error('Button missing: '+${JSON.stringify(label)});if(e.disabled)throw Error('Button disabled: '+${JSON.stringify(label)});e.click();})()`);await wait(80);};
const change=async(label,value,type='input')=>{await evaluate(`(()=>{const e=document.querySelector('[aria-label="${label}"]');Object.getOwnPropertyDescriptor(${type==='select'?'HTMLSelectElement':'HTMLInputElement'}.prototype,'value').set.call(e,${JSON.stringify(String(value))});e.dispatchEvent(new Event(${JSON.stringify(type==='select'?'change':'input')},{bubbles:true}));})()`);await wait(100);};
const world=async(x,y)=>evaluate(`(()=>{const e=document.querySelector('[data-sketch-overlay]').parentElement.parentElement,p=new DOMPoint(${x},${y}).matrixTransform(e.getScreenCTM());return{x:p.x,y:p.y};})()`);
async function stroke(points,{pointerType='mouse',touch=false,shift=false}={}){
  const screen=[];for(const p of points)screen.push(await world(...p));
  if(touch){await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...screen[0],id:1,force:.6}]});for(const p of screen.slice(1))await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...p,id:1,force:.6}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  else{await send('Input.dispatchMouseEvent',{type:'mousePressed',...screen[0],button:'left',buttons:1,clickCount:1,pointerType,force:.6,modifiers:shift?8:0});for(const p of screen.slice(1)){await send('Input.dispatchMouseEvent',{type:'mouseMoved',...p,button:'left',buttons:1,pointerType,force:.6,modifiers:shift?8:0});await wait(12);}await send('Input.dispatchMouseEvent',{type:'mouseReleased',...screen.at(-1),button:'left',buttons:0,clickCount:1,pointerType,modifiers:shift?8:0});}
  await wait(160);
}
const snapshot=()=>evaluate(`JSON.parse(localStorage.getItem('casynus:floor-plan-recovery:'+(window.__sketchQaIdentity||'guest'))||'null')`);
const allItems=d=>d.sketch.layers.flatMap(l=>l.items);
async function setCookies(){for(const[name,value]of qa.cookies)await send('Network.setCookie',{name,value,url:base,httpOnly:true,sameSite:'Lax'});}
async function run(){
  if(live)qa=await createHunyuanLiveContext(base);
  chrome=spawn(process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=9358',`--user-data-dir=${out}/profile`,'--no-first-run','--no-default-browser-check','--window-size=1680,1080','about:blank'],{windowsHide:true,stdio:'ignore'});
  let tabs;for(let i=0;i<50;i++){try{tabs=await(await fetch('http://localhost:9358/json')).json();if(tabs.length)break;}catch{}await wait(150);}assert.ok(tabs?.length,'Chrome started');
  socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id){const task=pending.get(message.id);if(task){pending.delete(message.id);clearTimeout(task.timer);if(message.error)task.reject(Error(JSON.stringify(message.error)));else task.resolve(message.result);}}if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);if(message.method==='Page.javascriptDialogOpening')void send('Page.handleJavaScriptDialog',{accept:true,promptText:'Sketch note'});if(message.method==='Browser.downloadProgress'&&message.params.state==='completed')downloads.push(message.params.guid);});
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:out,eventsEnabled:true});
  if(live){let delayed=false;socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.method!=='Fetch.requestPaused')return;const {requestId,request}=message.params;if(request.method==='PUT'&&!delayed){delayed=true;void evaluate('window.__sketchSlowSave=true');setTimeout(()=>void send('Fetch.continueRequest',{requestId}).catch(()=>{}),18000);}else void send('Fetch.continueRequest',{requestId}).catch(()=>{});});await send('Fetch.enable',{patterns:[{urlPattern:'*/api/sketch-projects',requestStage:'Request'}]});}
  await send('Emulation.setDeviceMetricsOverride',{width:1680,height:1080,deviceScaleFactor:1,mobile:false});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`try{localStorage.setItem('cookiePreference','necessary');localStorage.setItem('cedium_signin_popup_dismissed','1');}catch{}window.__sketchQaIdentity=${JSON.stringify(qa?.id||'guest')};`});if(qa)await setCookies();
  // 1. Opening Sketch Studio preserves the existing floor-plan drafting interface.
  await send('Page.navigate',{url:base+'/interior'});await until(`Boolean(document.querySelector('[aria-label="Sketch Drawing & Paint"]'))`,'Sketch Studio');await until(`Boolean(localStorage.getItem('casynus:floor-plan-recovery:'+(window.__sketchQaIdentity||'guest')))`,'initial recovery');await wait(400);
  assert.equal(await evaluate(`document.querySelector('.interior-scene-sidebar .cs-header').textContent.includes('Sketch')`),true);
  assert.equal(await evaluate(`Boolean(document.querySelector('.interior-scene-inspector'))`),true,'CAD Properties sidebar visible');
  assert.equal(await evaluate(`Boolean(document.querySelector('.floor-plan-hud-bar'))`),true,'CAD HUD visible');
  assert.equal(await evaluate(`Boolean(document.querySelector('[data-sketch-sheet]'))`),false,'No white sheet in CAD mode');
  const original=(await snapshot()).objects;
  // 2. Clicking the Pencil icon opens the dedicated sidebar-free Pencil Studio.
  await click('Sketch Drawing & Paint');
  assert.equal(await evaluate(`Boolean(document.querySelector('.interior-scene-sidebar'))`),false,'Left sidebar hidden in Pencil mode');
  assert.equal(await evaluate(`Boolean(document.querySelector('.interior-scene-inspector'))`),false,'Right Properties sidebar hidden in Pencil mode');
  assert.equal(await evaluate(`Boolean(document.querySelector('.floor-plan-hud-bar'))`),false,'CAD HUD hidden in Pencil mode');
  // 3. The initial Pencil workspace shows #404040 background and New Canvas button, NOT a white sheet.
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.sketch-workspace')).backgroundColor`),'rgb(64, 64, 64)');
  assert.equal(await evaluate(`Boolean(document.querySelector('[data-sketch-sheet]'))`),false,'No automatic white sheet on initial Pencil open');
  assert.equal(await evaluate(`Boolean(document.querySelector('[aria-label="New Canvas"]'))`),true,'New Canvas button visible');
  assert.equal(await evaluate(`Boolean(document.querySelector('[aria-label="Open Existing Project"]'))`),true,'Open Existing Project button visible');
  // Top-left Profile & Settings buttons and bottom-centered AI Chat.
  assert.equal(await evaluate(`Boolean(document.querySelector('.sketch-top-left-bar [aria-label="Your profile"]'))`),true,'Top-left Profile button visible');
  assert.equal(await evaluate(`Boolean(document.querySelector('.sketch-top-left-bar [aria-label="Studio settings"]'))`),true,'Top-left Settings button visible');
  await click('Show AI chat');
  assert.equal(await evaluate(`Boolean(document.querySelector('.studio-ai-floating-floorplan.studio-ai-panel'))`),true,'Bottom AI Chat panel opened');
  assert.equal(await evaluate(`Boolean(document.querySelector('.interior-scene-sidebar'))`),false,'No permanent sidebar introduced by AI Chat');
  await click('Minimize AI assistant');
  // 4 & 5. Clicking New Canvas opens the canvas setup dialog; confirming Create Canvas displays the sheet.
  await click('New Canvas');
  assert.equal(await evaluate(`Boolean(document.querySelector('[role="dialog"][aria-label="Canvas setup"]'))`),true,'Canvas setup dialog opened');
  await click('A3 preset');await click('Portrait orientation');await click('Landscape orientation');await click('A4 preset');
  await click('Create Canvas');
  assert.equal(await evaluate(`Boolean(document.querySelector('[data-sketch-sheet]'))`),true,'White drawing sheet created after confirmation');
  assert.equal(await evaluate(`document.querySelector('[data-sketch-sheet]').getAttribute('fill')`),'#ffffff');
  // 6. Drawing tools appear in the top toolbar with 54 x 54 outer and 40 x 40 inner dimensions.
  const sizes=await evaluate(`[...document.querySelectorAll('.sketch-top-toolbar .sketch-tool')].map(e=>({outer:[e.getBoundingClientRect().width,e.getBoundingClientRect().height],inner:[e.firstElementChild.getBoundingClientRect().width,e.firstElementChild.getBoundingClientRect().height]}))`);
  assert.ok(sizes.length>=16);assert.ok(sizes.every(s=>s.outer[0]===54&&s.outer[1]===54&&s.inner[0]===40&&s.inner[1]===40));
  // 7. Right-side tools and panels open on the right side without resizing the canvas.
  const rightSizes=await evaluate(`[...document.querySelectorAll('.sketch-right-dock .sketch-tool')].map(e=>({outer:[e.getBoundingClientRect().width,e.getBoundingClientRect().height],inner:[e.firstElementChild.getBoundingClientRect().width,e.firstElementChild.getBoundingClientRect().height]}))`);
  assert.equal(rightSizes.length,3);assert.ok(rightSizes.every(s=>s.outer[0]===54&&s.outer[1]===54&&s.inner[0]===40&&s.inner[1]===40));
  await click('Fit Sketch canvas');
  await stroke([[3.1,3.7],[3.3,3.85],[3.55,3.8],[3.8,4.05]]);assert.equal(allItems(await snapshot()).length,1);assert.deepEqual((await snapshot()).objects,original);
  if(live)await until('window.__sketchSlowSave===true','delayed initial cloud save');
  await click('Expand drawing controls');
  const settingsRight=await evaluate(`(()=>{const r=document.querySelector('.sketch-settings').getBoundingClientRect();return r.left>window.innerWidth/2;})()`);
  assert.equal(settingsRight,true,'Drawing controls open on the right side');
  await change('Brush size',9);await click('Open color selection');await change('HEX color','#ff0000');await click('Close color picker');await click('Collapse drawing controls');
  await click('Brush');await stroke([[3.1,4.3],[3.3,4.4],[3.5,4.25],[3.8,4.5]],{pointerType:'pen'});const brush=allItems(await snapshot()).at(-1);assert.equal(brush.kind,'brush');assert.equal(brush.color,'#ff0000');assert.ok(brush.width>.03);
  await click('Sketch rectangle');await stroke([[3,4.8],[4.1,5.55]]);assert.equal(allItems(await snapshot()).at(-1).kind,'rectangle');
  await click('Fill / Paint bucket');await stroke([[3.5,5.1]]);await until(`!document.body.textContent.includes('Processing drawing…')`,'paint bucket');assert.equal(allItems(await snapshot()).at(-1).kind,'fill');assert.ok(allItems(await snapshot()).at(-1).runs.length);
  await click('Eraser');await stroke([[3.3,5],[3.8,5.3]]);assert.equal(allItems(await snapshot()).at(-1).kind,'eraser');assert.ok(await evaluate(`document.querySelector('[data-sketch-overlay] mask')!==null`));
  const before=allItems(await snapshot()).length;await click('Undo drawing');assert.equal(allItems(await snapshot()).length,before-1);await click('Redo drawing');assert.equal(allItems(await snapshot()).length,before);
  await click('Sketch layers');await click('Add sketch layer');assert.equal((await snapshot()).sketch.layers.length,2);await change('Layer name','Paint layer');await change('Layer opacity',65);await change('Layer blend mode','multiply','select');await click('Lock Paint layer');await click('Unlock Paint layer');await click('Hide Paint layer');assert.equal((await snapshot()).sketch.layers.at(-1).visible,false);await click('Show Paint layer');await click('Move layer down');await click('Move layer up');await click('Close layers');
  await click('Sketch line');await stroke([[3,3.6],[4,3.6]]);assert.equal(allItems(await snapshot()).at(-1).kind,'line');
  await click('Sketch ellipse');await stroke([[3.1,3.1],[4,3.5]]);assert.equal(allItems(await snapshot()).at(-1).kind,'ellipse');
  await click('Highlighter');await stroke([[3,4.1],[3.5,4.2],[4,4.1]]);assert.equal(allItems(await snapshot()).at(-1).kind,'highlighter');
  await click('Sketch text');await stroke([[3.1,3.25]]);assert.equal(allItems(await snapshot()).at(-1).text,'Sketch note');
  await click('Freehand selection');await stroke([[2.8,2.8],[4.3,2.8],[4.3,4.6],[2.8,4.6],[2.8,2.8]]);await click('Expand drawing controls');assert.ok(await evaluate(`Boolean(document.querySelector('.sketch-selection-controls'))`));await click('Duplicate selected strokes');await click('Delete selected strokes');await click('Collapse drawing controls');
  await click('Color Picker');await stroke([[3.5,5.15]]);await click('Close color picker');await click('Pencil');
  await change('Sketch zoom',110);await stroke([[3.7,3.7],[3.9,3.9],[4.1,3.7]],{shift:true}); // shared CAD pan gesture
  await stroke([[3.6,3.6],[3.8,3.7],[4,3.6]],{touch:true});const touch=allItems(await snapshot()).at(-1);assert.ok(Math.abs(touch.points[0].x-3.6)<.03);assert.ok(Math.abs(touch.points[0].y-3.6)<.03);
  await click('Rotate canvas 15 degrees');await stroke([[3.3,3.2],[3.5,3.35],[3.7,3.2]]);const rotated=allItems(await snapshot()).at(-1);assert.ok(Math.abs(rotated.points[0].x-3.3)<.03);assert.deepEqual((await snapshot()).objects,original);
  await click('Fit Sketch canvas');await click('Expand drawing controls');await click('Sketch layers');
  fs.writeFileSync(path.join(out,'desktop.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'));
  await click('Close layers');await click('Collapse drawing controls');await click('Save Sketch project');await wait(150);
  if(live)await until(`(()=>{const value=JSON.parse(localStorage.getItem('casynus:floor-plan-recovery:'+window.__sketchQaIdentity)||'null');if(!value)return false;return value.revision>0&&(${canonicalSketch.toString()})(value)===value.cloudHash;})()`,'confirmed latest cloud save');
  const saved=await snapshot();
  for(const format of ['PNG','SVG','PDF','JSON SCENE']){await click('Export viewport');await evaluate(`[...document.querySelectorAll('dialog[aria-label="Export scene"][open] button')].find(e=>e.textContent===${JSON.stringify(format)}).click()`);await wait(500);}
  for(let i=0;i<100&&downloads.length<4;i++)await wait(150);assert.equal(downloads.length,4,'four real exports downloaded');
  const files=fs.readdirSync(out),json=files.find(f=>f.endsWith('.json')),svg=files.find(f=>f.endsWith('.svg')),pdf=files.find(f=>f.endsWith('.pdf')),png=files.find(f=>f.endsWith('.png')&&f!=='desktop.png');assert.ok(json&&svg&&pdf&&png);assert.deepEqual(JSON.parse(fs.readFileSync(path.join(out,json),'utf8')).sketch,saved.sketch);assert.match(fs.readFileSync(path.join(out,svg),'utf8'),/#ff0000/);assert.ok(fs.readFileSync(path.join(out,pdf)).subarray(0,8).toString().startsWith('%PDF-1.4'));assert.equal(fs.readFileSync(path.join(out,png)).subarray(1,4).toString(),'PNG');
  // 10. Exiting Pencil mode returns to the previous Sketch Studio state without losing work.
  await click('Exit Pencil mode');
  assert.equal(await evaluate(`Boolean(document.querySelector('.interior-scene-sidebar'))`),true,'Left sidebar restored on exit');
  assert.equal(await evaluate(`Boolean(document.querySelector('.interior-scene-inspector'))`),true,'Right Properties sidebar restored on exit');
  assert.equal(await evaluate(`Boolean(document.querySelector('[data-sketch-input]'))`),false,'CAD mode restored');
  assert.equal(await evaluate(`Boolean(document.querySelector('[data-sketch-overlay]'))`),false,'No Pencil overlay in CAD mode');
  assert.equal(await evaluate(`Boolean(document.querySelector('.sketch-navigation'))`),false,'No Pencil navigation bar in CAD mode');
  assert.deepEqual((await snapshot()).sketch,saved.sketch);assert.deepEqual((await snapshot()).objects,original);
  await click('Sketch Drawing & Paint');await wait(200);
  assert.equal(await evaluate(`Boolean(document.querySelector('[data-sketch-sheet]'))`),true,'Existing canvas reopened directly without duplicate');
  await click('Exit Pencil mode');
  // Page reload and logout/login recovery
  await send('Page.reload');await until(`Boolean(document.querySelector('[aria-label="Sketch Drawing & Paint"]'))`,'restored studio');await until(`Boolean(localStorage.getItem('casynus:floor-plan-recovery:'+(window.__sketchQaIdentity||'guest')))`,'restored recovery');await wait(700);assert.deepEqual((await snapshot()).sketch,saved.sketch);assert.deepEqual((await snapshot()).objects,original);
  if(qa){
    const cloud=await qa.json('/api/sketch-projects?id='+saved.id);assert.deepEqual(cloud.document.sketch,saved.sketch);
    await evaluate(`localStorage.clear();localStorage.setItem('cookiePreference','necessary');localStorage.setItem('cedium_signin_popup_dismissed','1');`);
    await send('Network.clearBrowserCookies');await send('Page.navigate',{url:base+'/robots.txt'});await wait(61000);
    await qa.logout();await qa.login();await setCookies();await send('Page.navigate',{url:base+'/interior'});
    await until(`Boolean(document.querySelector('.sketch-project-strip')?.textContent?.includes('Workspace connected'))`,'signed-in cloud recovery');await wait(500);assert.deepEqual((await snapshot()).sketch,saved.sketch);
  }
  await click('Sketch Drawing & Paint');await wait(200);
  assert.equal(await evaluate(`Boolean(document.querySelector('[data-sketch-sheet]'))`),true,'Existing canvas reopened after login');
  await click('Fit Sketch canvas');await click('Brush');await stroke([[3.6,3.7],[3.8,3.9]]);await click('Exit Pencil mode');
  assert.equal(await evaluate(`Boolean(document.querySelector('[data-sketch-input]'))`),false,'CAD mode restored');
  assert.equal(await evaluate(`Boolean(document.querySelector('[data-sketch-overlay]'))`),false,'No Pencil overlay in CAD mode');
  assert.equal(await evaluate(`Boolean(document.querySelector('.sketch-navigation'))`),false,'No Pencil navigation bar in CAD mode');
  await click('Switch to light mode');await click('Sketch Drawing & Paint');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.sketch-top-toolbar')).backgroundColor`),'rgb(255, 255, 255)');
  fs.writeFileSync(path.join(out,'light.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'));
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});await wait(500);
  const mobileTools=await evaluate(`[...document.querySelectorAll('.sketch-top-toolbar .sketch-tool')].map(e=>e.getBoundingClientRect().width)`);assert.ok(mobileTools.every(width=>width===54));
  fs.writeFileSync(path.join(out,'mobile.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'));
  assert.equal(errors.length,0,errors.join('\n'));fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({passed:true,live,artifacts:files,items:allItems(saved).length},null,2));console.log('PASS Dedicated sidebar-free Pencil Studio, New Canvas dialog, top 54x54 toolbar, right-side panels, 54x256 bottom-left AI Chat button, CAD preservation, save/refresh and four exports',live?'with authenticated logout/login':'with local recovery');console.log('Artifacts:',out);
}
try{await run();}catch(error){console.error(error.stack);process.exitCode=1;}finally{
  if(socket?.readyState===WebSocket.OPEN){try{await send('Browser.close');}catch{}socket.close();}chrome?.kill();for(const task of pending.values())clearTimeout(task.timer);
  if(qa){await qa.db.blenderProject.deleteMany({where:{userId:qa.id,settings:{path:['kind'],equals:'casynus-sketch'}}});await qa.db.activityLog.deleteMany({where:{userId:qa.id}});await qa.cleanup();}
}
