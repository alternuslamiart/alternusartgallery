// Opt-in browser regression check: start Next on port 3003, then run this script.
// Uses installed Chrome and Node 22's WebSocket; no browser package is required.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const baseUrl = process.env.STUDIO_QA_URL || 'http://localhost:3003';
assert.ok(['localhost','127.0.0.1'].includes(new URL(baseUrl).hostname), 'QA must target a local server');
const out = path.resolve('.tmp/scene-workflow-'+Date.now());
fs.mkdirSync(out, { recursive: true });
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=9343', `--user-data-dir=${out}/profile`,
  '--no-first-run', '--no-default-browser-check', '--window-size=1440,1000', 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
chrome.on('error', error => { console.error(error.message); process.exitCode=1; });
let socket;
async function run() {
  let tabs;
  for (let i=0;i<40;i++) { try { tabs = await (await fetch('http://localhost:9343/json')).json(); if(tabs.length) break; } catch {} await wait(250); }
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

  await send('Emulation.setFocusEmulationEnabled',{enabled:true});
  const downloads=path.join(out,'downloads');fs.mkdirSync(downloads,{recursive:true});
  await send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads});
  const click=async label=>{await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(label)}).click()`);await wait(120);};
  const menu=async label=>{await evaluate(`[...document.querySelectorAll('.scene-menu summary')].find(e=>e.textContent===${JSON.stringify(label)}).click()`);await wait(50);};
  const aria=async label=>{await evaluate(`[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')===${JSON.stringify(label)}).click()`);await wait(140);};
  const number=async(label,value)=>{await evaluate(`(()=>{const e=[...document.querySelectorAll('input')].find(i=>i.getAttribute('aria-label')===${JSON.stringify(label)});e.focus();e.value=${JSON.stringify(String(value))};e.blur()})()`);await wait(150);};
  const value=async label=>evaluate(`[...document.querySelectorAll('input')].find(i=>i.getAttribute('aria-label')===${JSON.stringify(label)}).value`);
  const exportFile=async format=>{for(const f of fs.readdirSync(downloads).filter(f=>f.endsWith('.'+format)))fs.unlinkSync(path.join(downloads,f));await menu('Export');await click(format.toUpperCase());for(let i=0;i<100;i++){const file=fs.readdirSync(downloads).find(f=>f.endsWith('.'+format));if(file)return path.join(downloads,file);await wait(150)}throw Error('Export not downloaded: '+format)};
  await send('Page.navigate',{url:baseUrl+'/casynus'});await ready('.scene-canvas canvas');await wait(1400);
  assert.ok(await evaluate("Boolean(document.querySelector('canvas[data-engine]'))"));
  await menu('File');await click('New project');await wait(250);await click('Box');await wait(400);
  await number('position X',3);await number('rotation Y',45);await number('scale X',2);
  assert.equal(await value('position X'),'3');assert.equal(await value('rotation Y'),'45');assert.equal(await value('scale X'),'2');
  await aria('Undo');assert.equal(await value('scale X'),'1');await aria('Redo');assert.equal(await value('scale X'),'2');
  await aria('Focus selected');await wait(300);
  const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out+'/transformed-cube.png',Buffer.from(shot.data,'base64'));
  const json=JSON.parse(fs.readFileSync(await exportFile('json'),'utf8'));assert.deepEqual(json.objects[0].position,[3,.5,0]);assert.equal(json.objects[0].scale[0],2);
  for(const format of ['glb','gltf','obj','stl','png','jpeg']) {const file=await exportFile(format);assert.ok(fs.statSync(file).size>100);console.log('EXPORT',format,file)}
  await send('Page.reload');await ready('.scene-canvas canvas');await wait(500);assert.equal(await evaluate("document.querySelector('.scene-canvas').dataset.objectCount"),'1');
  // The same recovered project must survive navigation through all three routes.
  for (const studio of ['Interior','Infra','Architecture']) {
    await click(studio);await ready('.scene-canvas canvas');await wait(600);
    assert.equal(await evaluate("document.querySelector('.scene-canvas').dataset.objectCount"),'1');
    const reopened=JSON.parse(fs.readFileSync(await exportFile('json'),'utf8'));
    assert.equal(reopened.id,json.id);assert.deepEqual(reopened.objects,json.objects);
  }
  // Studio-specific templates are actual selectable objects, not canvas images.
  await menu('File');await click('New project');await click('Add building');await wait(500);
  assert.ok(Number(await evaluate("document.querySelector('.scene-canvas').dataset.objectCount"))>30);
  await menu('File');await click('New project');await click('Add furnished room');await wait(500);
  assert.ok(Number(await evaluate("document.querySelector('.scene-canvas').dataset.objectCount"))>10);
  await menu('File');await click('New project');await click('Add intersection');await wait(500);
  assert.ok(Number(await evaluate("document.querySelector('.scene-canvas').dataset.objectCount"))>30);
  const bounds=await evaluate("(()=>{const a=document.querySelector('.scene-view').getBoundingClientRect(),b=document.querySelector('.scene-inspector').getBoundingClientRect();return {right:a.right,inspector:b.left,overflow:document.documentElement.scrollWidth>innerWidth}})()");
  assert.ok(bounds.right<=bounds.inspector+1,'viewport must not extend behind inspector');assert.equal(bounds.overflow,false);
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send('Page.reload');await ready('.scene-canvas canvas');await wait(600);
  assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'),false);
  console.log('PASS: real WebGL, object transforms, undo/redo, exports and IndexedDB reload',out);
  console.log('Exceptions',errors.map(e=>e.split('\n')[0]));assert.equal(errors.length,0);
  await send('Browser.close');
}
run().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{socket?.close();chrome.kill();});
