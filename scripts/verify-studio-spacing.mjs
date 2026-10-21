// Opt-in browser regression check: start Next on port 3003, then run this script.
// Uses installed Chrome and Node 22's WebSocket; no browser package is required.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const baseUrl = process.env.STUDIO_QA_URL || 'http://localhost:3003';
assert.ok(['localhost','127.0.0.1'].includes(new URL(baseUrl).hostname), 'QA must target a local server');
const out = path.resolve('.tmp/studio-spacing-'+Date.now());
fs.mkdirSync(out, { recursive: true });
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=9344', `--user-data-dir=${out}/profile`,
  '--no-first-run', '--no-default-browser-check', '--window-size=1440,1000', 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
chrome.on('error', error => { console.error(error.message); process.exitCode=1; });
let socket;
async function run() {
  let tabs;
  for (let i=0;i<40;i++) { try { tabs = await (await fetch('http://localhost:9344/json')).json(); if(tabs.length) break; } catch {} await wait(250); }
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
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('cookiePreference','necessary');localStorage.setItem('cedium_signin_popup_dismissed','1');`});

  for(const width of [1440,390]) for(const theme of ['dark','light']) for(const route of ['/casynus','/interior','/infrastructure']) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===390});
    await send('Page.addScriptToEvaluateOnNewDocument',{source:'localStorage.setItem("crystal_studio_theme",'+JSON.stringify(theme)+');'});
    await send('Page.navigate',{url:baseUrl+route});
    await ready(route==='/interior'?'.floor-plan-canvas svg':'.scene-canvas canvas');await wait(600);
    if(route==='/interior'&&width===390) {
      await evaluate('[...document.querySelectorAll(".crystal-mobile-workspace-tabs button")].find(b=>b.textContent==="Interior").click()');await wait(200);
    }
    const state=await evaluate(`(()=>{const box=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,radius:getComputedStyle(e).borderRadius}};return{bar:!!document.querySelector('.scene-menubar'),overflow:document.documentElement.scrollWidth>innerWidth,svg:!!document.querySelector('.floor-plan-canvas svg'),panels:[...document.querySelectorAll('.scene-sidebar,.crystal-left-panel,.crystal-right-panel')].filter(e=>e.getBoundingClientRect().width&&getComputedStyle(e).display!=='none').map(box),canvas:document.querySelector('.scene-canvas')?box(document.querySelector('.scene-canvas')):null}})()`);
    assert.equal(state.bar,false);assert.equal(state.overflow,false);
    assert.equal(await evaluate('document.documentElement.dataset.crystalTheme'),theme);
    if(route==='/interior')assert.equal(state.svg,true);
    if(route==='/interior'&&width===1440) {
      const before=await evaluate('document.querySelectorAll(".ref-tree-row").length');
      await evaluate('[...document.querySelectorAll("button")].find(b=>b.getAttribute("aria-label")==="Add room to floor plan").click()');await wait(150);
      assert.ok(await evaluate('document.querySelectorAll(".ref-tree-row").length')>before,'Original drafting toolbar creates a room');
      await evaluate('[...document.querySelectorAll("button")].find(b=>b.getAttribute("aria-label")==="Delete selected element (Del)").click()');await wait(150);
      assert.equal(await evaluate('document.querySelectorAll(".ref-tree-row").length'),before);
    }
    if(width===1440)for(const p of state.panels){assert.equal(p.y,12);assert.equal(p.height,876);assert.equal(p.radius,'12px');assert.ok(p.x>=12);assert.ok(p.x+p.width<=1428);}
    if(route!=='/interior'&&width===1440){assert.equal(state.panels.length,2);assert.equal(state.canvas.y,12);assert.equal(state.canvas.height,876);}
    if(route!=='/interior'&&width===390){
      await evaluate('[...document.querySelectorAll("button")].find(b=>b.getAttribute("aria-label")==="Show scene sidebar").click()');await wait(100);
      assert.equal(await evaluate('document.querySelector(".scene-left").getBoundingClientRect().y'),12);
    }
    const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out+'/'+route.slice(1)+'-'+width+'-'+theme+'.png',Buffer.from(shot.data,'base64'));
    console.log('PASS',route,width,theme,JSON.stringify(state));
  }
  assert.equal(errors.length,0,JSON.stringify(errors));console.log('Artifacts',out);await send('Browser.close');
}
run().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{socket?.close();chrome.kill();});
