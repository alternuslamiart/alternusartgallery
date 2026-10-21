// Opt-in browser regression check: start Next on port 3003, then run this script.
// Uses installed Chrome and Node 22's WebSocket; no browser package is required.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { makeDocument, makeObject } from '../src/lib/scene/document.mjs';
import { exportScene } from '../src/lib/scene/geometry.mjs';
globalThis.FileReader ??= class { readAsArrayBuffer(blob) { blob.arrayBuffer().then(value => { this.result=value;this.onloadend?.(); }); } readAsDataURL(blob) { blob.arrayBuffer().then(value=>{this.result=`data:${blob.type};base64,${Buffer.from(value).toString('base64')}`;this.onloadend?.();}); } };
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const baseUrl = process.env.STUDIO_QA_URL || 'http://localhost:3003';
assert.ok(['localhost','127.0.0.1'].includes(new URL(baseUrl).hostname), 'QA must target a local server');
const out = path.resolve('.tmp/ai3d-browser-'+Date.now());
fs.mkdirSync(out, { recursive: true });
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=9345', `--user-data-dir=${out}/profile`,
  '--no-first-run', '--no-default-browser-check', '--window-size=1440,1000', 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
chrome.on('error', error => { console.error(error.message); process.exitCode=1; });
let socket;
async function run() {
  let tabs;
  for (let i=0;i<40;i++) { try { tabs = await (await fetch('http://localhost:9345/json')).json(); if(tabs.length) break; } catch {} await wait(250); }
  assert.ok(tabs?.length, 'Chrome remote debugger started');
  socket = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, {once:true}); socket.addEventListener('error', reject, {once:true}); });
  let id=0; const pending = new Map(); const errors=[]; let authSession=null;
  socket.addEventListener('message', event => {
    const msg=JSON.parse(event.data);
    if (msg.id) { const p=pending.get(msg.id); if(p) {pending.delete(msg.id); clearTimeout(p.timer); if(msg.error) p.reject(new Error(JSON.stringify(msg.error))); else p.resolve(msg.result); } }
    if (msg.method==='Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
    if (msg.method==='Fetch.requestPaused') void mockRequest(msg.params).catch(error=>{if(!error.message.includes('Invalid InterceptionId'))errors.push(error.message);});
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
  const generatedDocument=makeDocument();generatedDocument.objects=[makeObject('box',{dimensions:[2,1,1]})];
  const fixture=Buffer.from(await(await exportScene(generatedDocument,'glb')).arrayBuffer());
  const jobs=new Map();let submissions=0;
  async function mockRequest({requestId,request}) {
    let body=null, mime='application/json';const url=new URL(request.url);
    if(url.pathname.includes('/providers'))body={providers:[{id:'meshy',label:'Meshy · 3D model',model:'mock-meshy'}]};
    else if(url.hostname==='assets.meshy.ai'||url.pathname.endsWith('/asset')){mime='model/gltf-binary';body=fixture;}
    else if(url.pathname==='/api/ai-scene')body={provider:'gemini',model:'mock-scene-planner',commands:[{type:'template',template:'building',stories:2}]};
    else if(url.pathname==='/api/ai3d/jobs'&&request.method==='POST') {
      const input=JSON.parse(request.postData);submissions++;body={id:input.requestId,projectId:input.projectId,provider:input.provider,model:'mock-meshy',prompt:input.prompt,status:'RUNNING',progress:25};jobs.set(body.id,body);
    } else if(url.pathname==='/api/ai3d/jobs')body={jobs:[...jobs.values()].filter(j=>j.projectId===url.searchParams.get('project'))};
    else {const id=url.pathname.split('/').at(-1);const job=jobs.get(id);body={...job,status:'SUCCEEDED',progress:100,modelURL:'https://assets.meshy.ai/mock.glb',assetPath:'/api/ai3d/jobs/'+id+'/asset'};jobs.set(id,body);}
    console.log('HTTP',request.method,url.pathname,mime);
    await send('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:mime},{name:'Access-Control-Allow-Origin',value:'*'}],body:Buffer.isBuffer(body)?body.toString('base64'):Buffer.from(JSON.stringify(body)).toString('base64')});
  }
  await send('Fetch.enable',{patterns:[{urlPattern:'*/api/ai3d/*'},{urlPattern:'*assets.meshy.ai/*'},{urlPattern:'*/api/ai-scene'}]});
  const button=async label=>{await evaluate(`[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')===${JSON.stringify(label)}||b.textContent.trim()===${JSON.stringify(label)}).click()`);await wait(120);};
  const menu=async label=>{await evaluate(`(()=>{const a=document.querySelector('.scene-project-actions');if(!a.open)a.querySelector('summary').click();[...document.querySelectorAll('.scene-menu summary')].find(s=>s.textContent===${JSON.stringify(label)}).click()})()`);await wait(50);};
  const prompt=async(provider,text)=>{await evaluate(`(()=>{const s=document.querySelector('select[aria-label="AI mode"]');s.value=${JSON.stringify(provider)};s.dispatchEvent(new Event('change',{bubbles:true}));const t=document.querySelector('.studio-ai-textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(t,${JSON.stringify(text)});t.dispatchEvent(new Event('input',{bubbles:true}));})()`);await wait(100);await button('Send AI request');};
  for(const route of ['/casynus','/infrastructure','/interior?workspace=3d']) {
    await send('Page.navigate',{url:baseUrl+route});await ready('.scene-canvas canvas');await ready('select[aria-label="AI mode"] option[value="meshy"]');
    await menu('File');await button('New project');await wait(300);
    assert.equal(await evaluate("document.querySelector('.scene-canvas').dataset.objectCount"),'0');
    await prompt('meshy','Generate a modern furniture model');await ready('.scene-proposal');
    assert.ok(Number(await evaluate("document.querySelector('.scene-canvas').dataset.objectCount"))>0);
    await button('Apply scene proposal');await wait(150);assert.equal(await evaluate('Boolean(document.querySelector(".scene-proposal"))'),false);
    await menu('Edit');await button('Undo · Ctrl Z');assert.equal(await evaluate("document.querySelector('.scene-canvas').dataset.objectCount"),'0');
    const before=submissions;await menu('File');await button('AI generation jobs');await ready('[aria-label="AI generation jobs"]');await button('Resume / preview');await ready('.scene-proposal');assert.equal(submissions,before,'Resume must not submit another paid task');await button('Discard proposal');
    assert.equal(await evaluate("document.querySelector('.scene-canvas').dataset.objectCount"),'0');
    await prompt('gemini','Create an editable building');await ready('.scene-proposal');assert.ok(Number(await evaluate("document.querySelector('.scene-canvas').dataset.objectCount"))>30);await button('Discard proposal');
    const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out+'/'+route.split('?')[0].slice(1)+'.png',Buffer.from(shot.data,'base64'));
    console.log('PASS',route,'real GLB preview/apply/undo/resume/discard and structured AI scene proposal');
  }
  assert.equal(errors.length,0,JSON.stringify(errors));console.log('PASS mocked provider/job HTTP with real GLB parsing/WebGL',out);await send('Browser.close');
}
run().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{socket?.close();chrome.kill();});
