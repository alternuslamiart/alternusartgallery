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
  '--headless=new', '--remote-debugging-port=9348', `--user-data-dir=${out}/profile`,
  '--no-first-run', '--no-default-browser-check', '--window-size=1440,1000', 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
chrome.on('error', error => { console.error(error.message); process.exitCode=1; });
let socket;
async function run() {
  let tabs;
  for (let i=0;i<40;i++) { try { tabs = await (await fetch('http://localhost:9348/json')).json(); if(tabs.length) break; } catch {} await wait(250); }
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

  let referenceInspectorHeaderHeight=58;
  const routes=process.argv.includes('--interior-only')?['/interior']:['/casynus','/interior','/infrastructure'];
  for(const width of [1440,390]) for(const theme of ['dark','light']) for(const route of routes) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===390});
    await send('Page.addScriptToEvaluateOnNewDocument',{source:'localStorage.setItem("crystal_studio_theme",'+JSON.stringify(theme)+');'});
    await send('Page.navigate',{url:baseUrl+route});
    await ready(route==='/interior'?'.floor-plan-canvas svg':'.scene-canvas canvas');await wait(600);
    if(route==='/interior'&&width===390) {
      await evaluate('[...document.querySelectorAll(".crystal-mobile-workspace-tabs button")].find(b=>b.textContent==="Interior").click()');await wait(200);
    }
    const state=await evaluate(`(()=>{const box=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,radius:getComputedStyle(e).borderRadius}};return{bar:!!document.querySelector('.scene-menubar'),overflow:document.documentElement.scrollWidth>innerWidth,svg:!!document.querySelector('.floor-plan-canvas svg'),panels:[...document.querySelectorAll('.scene-sidebar,.crystal-left-panel,.crystal-right-panel')].filter(e=>e.getBoundingClientRect().width&&getComputedStyle(e).display!=='none').map(box),canvas:document.querySelector('.scene-canvas')?box(document.querySelector('.scene-canvas')):null}})()`);
    assert.equal(state.bar,false);assert.equal(state.overflow,false);
    assert.equal(await evaluate('document.querySelectorAll(".casynus-viewport-toolbar").length'),1);
    await evaluate('[...document.querySelectorAll("button")].find(b=>b.getAttribute("aria-label")==="Export viewport").click()');
    assert.equal(await evaluate('document.querySelector(".casynus-toolbar-export").open'),true);
    await evaluate('[...document.querySelectorAll("button")].find(b=>b.getAttribute("aria-label")==="Close export").click()');
    if(width===1440){
      if(route==='/casynus') referenceInspectorHeaderHeight=await evaluate('document.querySelector(".scene-inspector>header").getBoundingClientRect().height');
      const bar=await evaluate('(()=>{const r=document.querySelector(".casynus-viewport-toolbar").getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,height:r.height}})()');
      assert.equal(bar.height,54);assert.equal(bar.top,12,'Toolbar aligns with sidebar tops');assert.ok(bar.left>=280&&bar.right<=1148,'Toolbar stays between panels');
      await evaluate(`document.querySelector('button[aria-label="Show AI chat"]')?.click()`);await ready('.studio-ai-panel');
      assert.equal(await evaluate('document.querySelector(".studio-ai-panel").getBoundingClientRect().bottom'),888,'AI dock aligns with sidebar bottoms');
      await evaluate(`document.querySelector('button[aria-label="Minimize AI assistant"]').click()`);await ready('.studio-ai-reopen-btn');
      assert.equal(await evaluate('document.querySelector(".studio-ai-reopen-btn").getBoundingClientRect().bottom'),888,'Minimized AI aligns with sidebar bottoms');
      await evaluate(`document.querySelector('button[aria-label="Show AI chat"]').click()`);
    }
    if(route!=='/interior')assert.equal(await evaluate('Boolean(document.querySelector(".scene-classic-link"))'),false);
    assert.equal(await evaluate('document.documentElement.dataset.crystalTheme'),theme);
    if(route==='/interior')assert.equal(state.svg,true);
    if(route==='/interior'&&width===1440) {
      assert.equal(await evaluate('document.querySelector(".interior-scene-sidebar .cs-header-title").textContent'),'Interior');
      assert.equal(await evaluate('document.querySelectorAll(".interior-scene-sidebar .interior-scene-nav a").length'),3);
      assert.equal(await evaluate('Boolean(document.querySelector(".interior-scene-sidebar").textContent.match(/Object library|Building levels|Add building|Add furnished room|Drafting setup/))'),false);
      const before=await evaluate('document.querySelectorAll(".interior-scene-object").length');
      await evaluate('[...document.querySelectorAll("button")].find(b=>b.getAttribute("aria-label")==="Add room to floor plan").click()');await wait(150);
      assert.ok(await evaluate('document.querySelectorAll(".interior-scene-object").length')>before,'Original drafting toolbar creates a room');
      assert.equal(await evaluate('document.querySelector(".interior-inspector-header strong").textContent'),'Properties');
      assert.equal(await evaluate('document.querySelector(".interior-inspector-header").getBoundingClientRect().height'),referenceInspectorHeaderHeight,'Inspector header matches Architecture');
      assert.equal(await evaluate('Boolean(document.querySelector(".interior-scene-inspector .ref-collab-header"))'),false);
      assert.ok(await evaluate(`(()=>{const panel=document.querySelector('.interior-scene-inspector').getBoundingClientRect();return [...document.querySelectorAll('.interior-scene-inspector input,.interior-scene-inspector select')].every(e=>{const r=e.getBoundingClientRect();return r.left>=panel.left&&r.right<=panel.right});})()`),'Selected room dimensions stay inside the inspector');
      await evaluate('[...document.querySelectorAll("button")].find(b=>b.getAttribute("aria-label")==="Delete selected element (Del)").click()');await wait(150);
      assert.equal(await evaluate('document.querySelectorAll(".interior-scene-object").length'),before);
      await evaluate('document.querySelector(".interior-scene-object").click()');
      assert.equal(await evaluate('document.querySelector(".interior-scene-object").getAttribute("aria-pressed")'),'true','Hierarchy selects actual plan objects');
      if(theme==='dark') {
        await evaluate(`(()=>{const e=document.querySelector('.interior-scene-inspector input[aria-label="thickness"]');e.focus();e.select();})()`);
        await send('Input.insertText',{text:'250'});
        await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});await wait(100);
        const saved=await evaluate(`(async()=>{
          const original=URL.createObjectURL;let captured;
          URL.createObjectURL=function(blob){captured=blob;return original.call(this,blob)};
          try {
            [...document.querySelectorAll('.interior-scene-inspector .studio-export-btn')].find(b=>b.textContent==='JSON Scene').click();
            return JSON.parse(await captured.text());
          } finally { URL.createObjectURL=original; }
        })()`);
        assert.equal(saved.objects.length,before);assert.equal(saved.name,'Untitled project');
        assert.equal(saved.objects[0].thickness,.25,'Inspector edits real geometry and exports it');
        await evaluate('[...document.querySelectorAll("button")].find(b=>b.getAttribute("aria-label")==="Add room to floor plan").click()');await wait(100);
        await evaluate(`(()=>{const input=document.querySelector('input[type="file"][accept="application/json,.json"]');const transfer=new DataTransfer();transfer.items.add(new File([${JSON.stringify(JSON.stringify(saved))}],'plan.json',{type:'application/json'}));input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);await wait(150);
        assert.equal(await evaluate('document.querySelectorAll(".interior-scene-object").length'),before,'Saved JSON reopens real plan geometry');
      }
    }
    if(width===1440)for(const p of state.panels){assert.equal(p.y,12);assert.equal(p.height,876);assert.equal(p.radius,'12px');assert.ok(p.x>=12);assert.ok(p.x+p.width<=1428);}
    if(route!=='/interior'){
      assert.equal(await evaluate('getComputedStyle(document.querySelector(".scene-view")).backgroundColor'),'rgba(0, 0, 0, 0)');
      assert.equal(state.canvas.x,0);assert.equal(state.canvas.y,0);assert.equal(state.canvas.width,width);assert.equal(state.canvas.height,900);
      assert.equal(await evaluate('document.elementFromPoint(6,450).tagName'),'CANVAS','The scene is visible and interactive through the panel padding');
      if(width===1440){assert.equal(state.panels.length,2);assert.ok(await evaluate('Boolean(document.elementFromPoint(30,180).closest(".scene-sidebar"))'),'Panels stay above the canvas');}
    }
    if(route!=='/interior'&&width===390){
      await evaluate('[...document.querySelectorAll("button")].find(b=>b.getAttribute("aria-label")==="Show scene sidebar").click()');await wait(100);
      assert.equal(await evaluate('document.querySelector(".scene-left").getBoundingClientRect().y'),12);
    }
    const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out+'/'+route.slice(1)+'-'+width+'-'+theme+'.png',Buffer.from(shot.data,'base64'));
    console.log('PASS',route,width,theme,JSON.stringify(state));
  }
  assert.equal(errors.length,0,JSON.stringify(errors));console.log('Artifacts',out);await send('Browser.close');
}
run().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify({id:999999,method:'Browser.close'}));socket?.close();chrome.kill();});
