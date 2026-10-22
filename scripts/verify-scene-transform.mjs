// Opt-in browser regression check: start Next on port 3003, then run this script.
// Uses installed Chrome and Node 22's WebSocket; no browser package is required.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Box3,PerspectiveCamera,Vector3} from 'three';
import {makeDocument,makeObject} from '../src/lib/scene/document.mjs';
import {buildScene,disposeScene} from '../src/lib/scene/geometry.mjs';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const baseUrl = process.env.STUDIO_QA_URL || 'http://localhost:3003';
assert.ok(['localhost','127.0.0.1'].includes(new URL(baseUrl).hostname), 'QA must target a local server');
const out = path.resolve('.tmp/scene-transform-'+Date.now());
fs.mkdirSync(out, { recursive: true });
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=9353', `--user-data-dir=${out}/profile`,
  '--no-first-run', '--no-default-browser-check', '--window-size=1440,1000', 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
chrome.on('error', error => { console.error(error.message); process.exitCode=1; });
let socket;
async function run() {
  let tabs;
  for (let i=0;i<40;i++) { try { tabs = await (await fetch('http://localhost:9353/json')).json(); if(tabs.length) break; } catch {} await wait(250); }
  assert.ok(tabs?.length, 'Chrome remote debugger started');
  socket = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, {once:true}); socket.addEventListener('error', reject, {once:true}); });
  let id=0; const pending = new Map(); const errors=[]; let authSession=null;
  socket.addEventListener('message', event => {
    const msg=JSON.parse(event.data);
    if (msg.id) { const p=pending.get(msg.id); if(p) {pending.delete(msg.id); clearTimeout(p.timer); if(msg.error) p.reject(new Error(JSON.stringify(msg.error))); else p.resolve(msg.result); } }
    if (msg.method==='Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
    if (msg.method==='Fetch.requestPaused') void send('Fetch.fulfillRequest',{requestId:msg.params.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(authSession)).toString('base64')});
  });
  const send = (method, params={}) => new Promise((resolve,reject) => {
    const n=++id; const timer=setTimeout(()=>{pending.delete(n);reject(new Error(`CDP timeout: ${method}`));},60000);
    pending.set(n,{resolve,reject,timer});socket.send(JSON.stringify({id:n,method,params}));
  });
  const evaluate = async expression => {
    const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    return result.result.value;
  };
  const ready = async selector => {
    for(let i=0;i<120;i++) { if(await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return; await wait(500); }
    throw new Error(`Page did not render ${selector}: ${await evaluate('document.body.innerText.slice(0,1200)')}`);
  };
  await send('Page.enable'); await send('Runtime.enable');await send('Emulation.setFocusEmulationEnabled',{enabled:true});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('cookiePreference','necessary');localStorage.setItem('cedium_signin_popup_dismissed','1');`});


  await send('Fetch.enable',{patterns:[{urlPattern:'*/api/auth/session'}]});
  const fixture=makeDocument();fixture.objects=[makeObject('box',{name:'Move target',position:[0,1,0],dimensions:[2,2,2]})];
  const target=fixture.objects[0].id;
  const root=buildScene(fixture),box=new Box3().setFromObject(root),center=box.getCenter(new Vector3()),radius=Math.max(2,box.getSize(new Vector3()).length()*.65);
  const camera=new PerspectiveCamera(45,1440/900,.05,20000);camera.position.copy(center).add(new Vector3(1,.75,1).normalize().multiplyScalar(radius*2));camera.lookAt(center);camera.updateMatrixWorld();disposeScene(root);
  const point=v=>{const p=v.clone().project(camera);return{x:(p.x+1)*720,y:(1-p.y)*450}};
  const mouse=async(type,p,extra={})=>send('Input.dispatchMouseEvent',{type,...p,...extra});
  const click=async p=>{await mouse('mouseMoved',p);await mouse('mousePressed',p,{button:'left',buttons:1,clickCount:1});await mouse('mouseReleased',p,{button:'left',buttons:0,clickCount:1});await wait(250)};
  const key=async(key,modifiers=0)=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key,modifiers});await send('Input.dispatchKeyEvent',{type:'keyUp',key,modifiers});await wait(250)};
  const position=()=>evaluate(`['X','Y','Z'].map(axis=>Number(document.querySelector('[aria-label="position '+axis+'"]').value))`);
  for(const route of ['/casynus','/infrastructure','/interior?workspace=3d']) {
    await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
    await send('Page.navigate',{url:baseUrl+route});await ready('.scene-canvas canvas');await wait(600);
    await evaluate(`(()=>{const input=document.querySelector('input[aria-label="Import scene file"]'),d=new DataTransfer();d.items.add(new File([${JSON.stringify(JSON.stringify(fixture))}],'transform.json',{type:'application/json'}));input.files=d.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    await ready('[data-scene-object-id="'+target+'"]');await wait(250);
    await evaluate(`document.querySelector('button[aria-label="Minimize AI assistant"]')?.click();document.querySelector('button[aria-label="Fit entire scene"]').click()`);await wait(300);
    await click(point(center));await ready('[data-selection="primary"]');await key('w');
    const factor=camera.position.distanceTo(center)*Math.min(1.9*Math.tan(Math.PI/8),7)*1.2/7;
    for(let axis=0;axis<3;axis++) {
      const vector=new Vector3().setComponent(axis,1),start=point(center.clone().addScaledVector(vector,factor*.88));
      const end=point(center.clone().addScaledVector(vector,factor*1.65));
      await mouse('mouseMoved',start);await wait(100);
      await mouse('mousePressed',start,{button:'left',buttons:1,clickCount:1});
      for(let step=1;step<=10;step++){await mouse('mouseMoved',{x:start.x+(end.x-start.x)*step/10,y:start.y+(end.y-start.y)*step/10},{button:'left',buttons:1});await wait(25)}
      await mouse('mouseReleased',end,{button:'left',buttons:0,clickCount:1});await wait(350);
      assert.equal(await evaluate('document.querySelector("[data-selection=primary]")?.dataset.sceneObjectId'),target,'Gizmo drag retains selection');
      const moved=await position();assert.ok(Math.abs(moved[axis]-fixture.objects[0].position[axis])>.05,`Axis ${axis} moved: ${moved}`);
      for(let other=0;other<3;other++)if(other!==axis)assert.ok(Math.abs(moved[other]-fixture.objects[0].position[other])<.001,'Other axes stay fixed');
      await key('z',2);assert.deepEqual(await position(),[0,1,0],'One Undo restores entire drag');
      await key('z',10);assert.deepEqual(await position(),moved,'Redo restores final position');
      await key('z',2);
      console.log('PASS axis drag/selection/undo/redo',route,'XYZ'[axis],moved);
    }
    const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out+'/'+route.replaceAll(/[^a-z0-9]/gi,'_')+'.png',Buffer.from(shot.data,'base64'));
    await key('q');await click({x:400,y:180});assert.equal(await evaluate('document.querySelectorAll("[data-selection]").length'),0,'Empty surface clears selection');
  }
  assert.equal(errors.length,0,JSON.stringify(errors));console.log('Artifacts',out);await send('Browser.close');
}
run().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify({id:999999,method:'Browser.close'}));socket?.close();chrome.kill();});
