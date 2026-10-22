// Opt-in browser regression check: start Next on port 3003, then run this script.
// Uses installed Chrome and Node 22's WebSocket; no browser package is required.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {makeDocument,makeObject} from '../src/lib/scene/document.mjs';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const baseUrl = process.env.STUDIO_QA_URL || 'http://localhost:3003';
assert.ok(['localhost','127.0.0.1'].includes(new URL(baseUrl).hostname), 'QA must target a local server');
const out = path.resolve('.tmp/material-library-'+Date.now());
fs.mkdirSync(out, { recursive: true });
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=9354', `--user-data-dir=${out}/profile`,
  '--no-first-run', '--no-default-browser-check', '--window-size=1440,1000', 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
chrome.on('error', error => { console.error(error.message); process.exitCode=1; });
let socket;
async function run() {
  let tabs;
  for (let i=0;i<40;i++) { try { tabs = await (await fetch('http://localhost:9354/json')).json(); if(tabs.length) break; } catch {} await wait(250); }
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
  const fixture=makeDocument();fixture.objects=[...Array.from({length:40},(_,i)=>makeObject('group',{name:'Group '+i})),makeObject('box',{name:'Texture A',position:[-2,1,0]}),makeObject('box',{name:'Texture B',position:[2,1,0]})];
  const ids=fixture.objects.slice(-2).map(o=>o.id);
  const click=async label=>{await evaluate(`[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')===${JSON.stringify(label)}||b.textContent.trim()===${JSON.stringify(label)}).click()`);await wait(120);};
  const menu=async label=>{await evaluate(`(()=>{const a=document.querySelector('.scene-project-actions');if(!a.open)a.querySelector('summary').click();[...document.querySelectorAll('.scene-menu summary')].find(s=>s.textContent===${JSON.stringify(label)}).click()})()`);await wait(50);};
  const exportJSON=async()=>{
    await evaluate(`(()=>{window.__lastExport=null;if(!window.__originalObjectURL){window.__originalObjectURL=URL.createObjectURL;URL.createObjectURL=function(blob){window.__lastExport=blob;return window.__originalObjectURL.call(this,blob)}}})()`);
    await click('Export viewport');await evaluate(`[...document.querySelectorAll('.casynus-toolbar-export[open] button')].find(b=>b.textContent==='JSON').click()`);assert.equal(await evaluate('document.querySelector(".casynus-toolbar-export").open'),false);
    for(let i=0;i<30;i++){if(await evaluate('Boolean(window.__lastExport)'))return evaluate('window.__lastExport.text().then(JSON.parse)');await wait(100)}throw Error('No JSON export');
  };
  const footer=()=>evaluate(`(()=>{const f=document.querySelector('.cs-sidebar-footer').getBoundingClientRect(),p=document.querySelector('.scene-left,.interior-scene-sidebar').getBoundingClientRect();return{bottom:f.bottom,top:f.top,panelBottom:p.bottom}})()`);
  for(const theme of ['dark','light'])for(const route of ['/casynus','/infrastructure','/interior?workspace=3d']){
    await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
    await send('Page.addScriptToEvaluateOnNewDocument',{source:'localStorage.setItem("crystal_studio_theme",'+JSON.stringify(theme)+');'});
    await send('Page.navigate',{url:baseUrl+route});await ready('.scene-canvas canvas');await wait(500);
    await evaluate(`(()=>{const input=document.querySelector('input[aria-label="Import scene file"]'),d=new DataTransfer();d.items.add(new File([${JSON.stringify(JSON.stringify(fixture))}],'materials.json',{type:'application/json'}));input.files=d.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);await ready('[data-scene-object-id="'+ids[0]+'"]');
    const before=await footer();await evaluate(`document.querySelector('.scene-hierarchy').scrollTop=10000;document.querySelector('.scene-sidebar-content').scrollTop=10000;`);assert.deepEqual(await footer(),before);assert.ok(Math.abs(before.bottom-before.panelBottom)<2,'Footer remains at the panel bottom');
    await click('Texture material library');await ready('.cs-material-tile');
    let count=await evaluate('document.querySelectorAll(".cs-material-tile").length');assert.equal(count,8);assert.equal(await evaluate('document.querySelector(".scene-canvas").dataset.objectCount'),'42','Plus opens assets without adding geometry');
    assert.equal(await evaluate('document.querySelector(".cs-material-tile").disabled'),true);
    await evaluate(`document.querySelector('[data-scene-object-id="${ids[0]}"] .scene-tree-name').click();document.querySelector('[data-scene-object-id="${ids[1]}"] .scene-tree-name').dispatchEvent(new MouseEvent('click',{bubbles:true,shiftKey:true}));`);await wait(150);
    await click('Natural textures');assert.equal(await evaluate('document.querySelectorAll(".cs-material-tile").length'),3);await click('All textures');
    await click('Apply Marble');const saved=await exportJSON();for(const object of saved.objects.slice(-2)){assert.ok(object.material.map.startsWith('data:image/png;base64,'));assert.equal(object.material.roughness,.18);}
    await menu('Edit');await click('Undo · Ctrl Z');const undone=await exportJSON();assert.equal(undone.objects.at(-1).material.map,undefined,'Texture application is one undoable action');
    const image=await evaluate(`(()=>{const c=document.createElement('canvas');c.width=c.height=2;c.getContext('2d').fillRect(0,0,2,2);return c.toDataURL('image/png')})()`);
    await evaluate(`(()=>{const bytes=Uint8Array.from(atob(${JSON.stringify(image)}.split(',')[1]),c=>c.charCodeAt(0)),d=new DataTransfer();d.items.add(new File([bytes],'uploaded-texture.png',{type:'image/png'}));const input=document.querySelector('input[aria-label="Texture asset file"]');input.files=d.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);await ready('[aria-label="Apply uploaded-texture.png"]');await click('Apply uploaded-texture.png');const uploaded=await exportJSON();assert.equal(uploaded.objects.at(-1).material.map,image);
    const bounds=await evaluate(`(()=>{const a=document.querySelector('.casynus-viewport-toolbar').getBoundingClientRect(),b=document.querySelector('.casynus-material-library').getBoundingClientRect();return{barWidth:a.width,libraryWidth:b.width,gap:b.top-a.bottom}})()`);assert.equal(bounds.barWidth,bounds.libraryWidth);assert.equal(bounds.gap,12);
    await click('Collapse inspector');await click('Studio settings');await ready('.scene-inspector');
    const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out+'/'+route.replaceAll(/[^a-z0-9]/gi,'_')+'-'+theme+'.png',Buffer.from(shot.data,'base64'));
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await wait(100);assert.equal(await evaluate('Boolean(document.querySelector(".casynus-material-library"))'),false);assert.equal(await evaluate('document.querySelectorAll("[data-selection]").length'),2,'Closing assets retains selection');
    await click('Texture material library');await ready('[aria-label="Apply uploaded-texture.png"]');await click('Close texture library');
    console.log('PASS material library/footer',route,theme);
  }
  await send('Page.navigate',{url:baseUrl+'/interior'});await ready('.floor-plan-canvas svg');await wait(500);await click('Texture material library');await ready('.cs-material-tile');assert.equal(await evaluate('document.querySelector(".cs-material-tile").disabled'),true);assert.equal(await evaluate('document.querySelector(".cs-material-notice").getAttribute("href")'),'/interior?workspace=3d');
  const before=await footer();await evaluate(`document.querySelector('.interior-scene-hierarchy').scrollTop=10000`);assert.deepEqual(await footer(),before);
  await click('Studio settings');assert.ok(await evaluate('Boolean(document.querySelector(".interior-scene-inspector"))'));
  await evaluate('window.open=(url)=>{window.__profileURL=url;return null}');await click('Your profile');assert.equal(await evaluate('window.__profileURL'),'/account');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:true});await wait(100);await evaluate(`[...document.querySelectorAll('.crystal-mobile-workspace-tabs button')].find(b=>b.textContent==='Interior').click()`);await wait(100);assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'),false);
  console.log('PASS Interior browse/footer/profile and mobile bounds');assert.equal(errors.length,0,JSON.stringify(errors));console.log('Artifacts',out);await send('Browser.close');
}
run().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify({id:999999,method:'Browser.close'}));socket?.close();chrome.kill();});
