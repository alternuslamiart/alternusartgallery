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
const out = path.resolve('.tmp/scene-selection-'+Date.now());
fs.mkdirSync(out, { recursive: true });
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=9352', `--user-data-dir=${out}/profile`,
  '--no-first-run', '--no-default-browser-check', '--window-size=1440,1000', 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
chrome.on('error', error => { console.error(error.message); process.exitCode=1; });
let socket;
async function run() {
  let tabs;
  for (let i=0;i<40;i++) { try { tabs = await (await fetch('http://localhost:9352/json')).json(); if(tabs.length) break; } catch {} await wait(250); }
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
  const fixture=makeDocument();fixture.objects=[...Array.from({length:30},(_,i)=>makeObject('group',{name:'Group '+i})),makeObject('box',{name:'Primary cube',position:[-3,1,0],dimensions:[2,2,2]}),makeObject('box',{name:'Secondary cube',position:[3,1,0],dimensions:[2,2,2]})];
  const first=fixture.objects.at(-2).id,second=fixture.objects.at(-1).id;
  const root=buildScene(fixture);const box=new Box3().setFromObject(root),center=box.getCenter(new Vector3()),radius=Math.max(2,box.getSize(new Vector3()).length()*.65);
  const camera=new PerspectiveCamera(45,1440/900,.05,20000);camera.position.copy(center).add(new Vector3(1,.75,1).normalize().multiplyScalar(radius*2));camera.lookAt(center);camera.updateMatrixWorld();
  const point=position=>{const v=new Vector3(...position).project(camera);return{x:(v.x+1)*720,y:(1-v.y)*450}};
  const a=point([-3,1,0]),b=point([3,1,0]);disposeScene(root);
  const move=async p=>{await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x,y:p.y});await wait(120)};
  const clickPoint=async(p,modifiers=0)=>{await move(p);await send('Input.dispatchMouseEvent',{type:'mousePressed',x:p.x,y:p.y,button:'left',buttons:1,clickCount:1,modifiers});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:p.x,y:p.y,button:'left',buttons:0,clickCount:1,modifiers});await wait(150);};
  const click=async label=>{await evaluate(`document.querySelector('button[aria-label="${label}"]').click()`);await wait(150)};
  const pixels=()=>evaluate(`(async()=>{const source=document.querySelector('.scene-canvas canvas'),image=new Image();image.src=source.toDataURL();await image.decode();const c=document.createElement('canvas');c.width=source.width;c.height=source.height;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);const data=ctx.getImageData(0,0,c.width,c.height).data;let blue=0,green=0;for(let i=0;i<data.length;i+=4){if(data[i]<110&&data[i+1]>80&&data[i+1]<170&&data[i+2]>210)blue++;if(data[i]<90&&data[i+1]>170&&data[i+2]<150)green++;}return{blue,green}})()`);
  for(const theme of ['dark','light'])for(const route of ['/casynus','/infrastructure','/interior?workspace=3d']){
    await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
    await send('Page.addScriptToEvaluateOnNewDocument',{source:'localStorage.setItem("crystal_studio_theme",'+JSON.stringify(theme)+');'});
    await send('Page.navigate',{url:baseUrl+route});await ready('.scene-canvas canvas');await wait(600);
    await evaluate(`(()=>{const input=document.querySelector('input[aria-label="Import scene file"]'),d=new DataTransfer();d.items.add(new File([${JSON.stringify(JSON.stringify(fixture))}],'selection.json',{type:'application/json'}));input.files=d.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    await ready('[data-scene-object-id="'+first+'"]');await wait(200);await click('Fit entire scene');
    await evaluate(`document.querySelector('.casynus-viewport-toolbar button[aria-label="Select"]')?.click()`);
    await evaluate(`document.querySelector('button[aria-label="Minimize AI assistant"]')?.click()`);
    await move(b);assert.equal(await evaluate(`document.querySelector('[data-scene-object-id="${second}"]').dataset.hovered`),'true');
    assert.ok(await evaluate(`(()=>{const r=document.querySelector('[data-scene-object-id="${second}"]').getBoundingClientRect(),p=document.querySelector('.scene-hierarchy').getBoundingClientRect();return r.top>=p.top&&r.bottom<=p.bottom;})()`),'Hovered object scrolls into hierarchy view');
    await clickPoint(a);await ready('[data-selection="primary"]');assert.equal(await evaluate('document.querySelector("[data-selection=primary]").dataset.sceneObjectId'),first);
    await clickPoint(b,8);assert.equal(await evaluate('document.querySelector("[data-selection=secondary]").dataset.sceneObjectId'),second);
    assert.equal(await evaluate('document.querySelectorAll(".scene-tree-name[aria-pressed=true]").length'),2);
    assert.equal(await evaluate('getComputedStyle(document.querySelector("[data-selection=secondary] .scene-tree-name")).color'),'rgb(34, 197, 94)','Secondary hierarchy rows use green instead of the global active blue');
    const colors=await pixels();assert.ok(colors.blue>30&&colors.green>30,'Real canvas draws both outline colors: '+JSON.stringify(colors));
    const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out+'/'+route.replaceAll(/[^a-z0-9]/gi,'_')+'-'+theme+'.png',Buffer.from(shot.data,'base64'));
    await clickPoint(a,2);assert.equal(await evaluate('document.querySelectorAll("[data-selection=secondary]").length'),0);assert.equal(await evaluate('document.querySelector("[data-selection=primary]").dataset.sceneObjectId'),second);
    const promoted=await pixels();assert.ok(promoted.blue>30);assert.equal(promoted.green,0,'Removing primary promotes remaining selection to blue');
    await clickPoint({x:720,y:700});assert.equal(await evaluate('document.querySelectorAll("[data-selection]").length'),0);
    await evaluate(`document.querySelector('[data-scene-object-id="${first}"] .scene-tree-name').click()`);
    await evaluate(`document.querySelector('[data-scene-object-id="${second}"] .scene-tree-name').dispatchEvent(new MouseEvent('click',{bubbles:true,ctrlKey:true}))`);await wait(100);
    assert.equal(await evaluate('document.querySelectorAll(".scene-tree-name[aria-pressed=true]").length'),2,'Hierarchy also supports additive selection');
    console.log('PASS multiselect',route,theme,colors);
  }
  await send('Page.navigate',{url:baseUrl+'/interior'});await ready('.floor-plan-canvas svg');await wait(500);await evaluate(`document.querySelector('button[aria-label="Minimize AI assistant"]')?.click()`);
  const room=await evaluate(`(()=>{const r=document.querySelector('.floor-plan-canvas [data-floor-plan-object-id="room-living"] rect').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await move(room);assert.equal(await evaluate(`document.querySelector('.interior-scene-object[data-floor-plan-object-id="room-living"]').dataset.hovered`),'true');
  await clickPoint(room);assert.equal(await evaluate(`document.querySelector('.interior-scene-object[data-floor-plan-object-id="room-living"]').getAttribute("aria-pressed")`),'true');
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".interior-scene-object.is-selected")).color'),'rgb(66, 132, 255)');
  console.log('PASS Interior sketch hover/selection hierarchy sync');assert.equal(errors.length,0,JSON.stringify(errors));console.log('Artifacts',out);await send('Browser.close');
}
run().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify({id:999999,method:'Browser.close'}));socket?.close();chrome.kill();});
