// Local Chrome integration regression. Auth, DB and job HTTP are test adapters;
// the image and GLB are real local artifacts. Never calls an inference provider.
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const base=process.env.STUDIO_QA_URL||'http://localhost:3033';
assert.ok(['localhost','127.0.0.1'].includes(new URL(base).hostname));
const source=process.env.HUNYUAN_TEST_GLB||'ai-services/Hunyuan3D-2.1/demo_shape.glb';
const glb=fs.readFileSync(source),image=path.resolve('ai-services/Hunyuan3D-2.1/assets/demo.png');
const out=path.resolve('.tmp/hunyuan-browser-'+Date.now());fs.mkdirSync(out,{recursive:true});
const chrome=spawn(process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',[
  '--headless=new','--remote-debugging-port=9361',`--user-data-dir=${out}/profile`,'--no-first-run','--no-default-browser-check','--window-size=1440,1000','about:blank',
],{windowsHide:true,stdio:'ignore'});
let socket;
async function run(){
  let tabs;
  for(let i=0;i<40;i++){try{tabs=await(await fetch('http://localhost:9361/json')).json();if(tabs.length)break;}catch{}await wait(250);}
  assert.ok(tabs?.length,'Chrome started');
  socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  let sequence=0,submissions=0,downloads=0;const pending=new Map(),errors=[],jobs=new Map(),projects=new Map();
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},60_000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}));});
  socket.addEventListener('message',event=>{const message=JSON.parse(event.data);
    if(message.id){const p=pending.get(message.id);if(p){pending.delete(message.id);clearTimeout(p.timer);if(message.error)p.reject(Error(JSON.stringify(message.error)));else p.resolve(message.result);}}
    if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);
    if(message.method==='Fetch.requestPaused')void intercept(message.params).catch(error=>errors.push(error.message));
  });
  async function intercept({requestId,request}){
    const url=new URL(request.url);let body,mime='application/json';
    if(url.pathname==='/api/auth/session')body={user:{id:'hunyuan-browser-user',email:'qa@example.invalid',name:'Local UI test'},expires:'2099-01-01T00:00:00.000Z'};
    else if(url.pathname==='/api/studio-projects'){
      if(request.method==='PUT'){const input=JSON.parse(request.postData);projects.set(input.document.id,{document:input.document,revision:input.revision+1});body={id:input.document.id,revision:input.revision+1,saved:true};}
      else body=url.searchParams.has('id')?projects.get(url.searchParams.get('id')):{projects:[]};
    }else if(url.pathname.endsWith('/providers'))body={providers:[{id:'hunyuan',label:'Hunyuan3D · Image to 3D',model:'Hunyuan3D-2.1 shape'}]};
    else if(url.pathname.endsWith('/asset')){downloads++;mime='model/gltf-binary';body=glb;}
    else if(url.pathname==='/api/ai3d/jobs'&&request.method==='POST'){
      const input=JSON.parse(request.postData);assert.equal(input.provider,'hunyuan');assert.ok(input.image.startsWith('data:image/png;base64,'));assert.ok(projects.has(input.projectId),'Project saved before generation');submissions++;
      body={id:input.requestId,projectId:input.projectId,provider:'hunyuan',model:'Hunyuan3D-2.1 shape',prompt:input.prompt,status:'RUNNING',progress:0};jobs.set(body.id,body);
    }else if(url.pathname==='/api/ai3d/jobs')body={jobs:[...jobs.values()]};
    else {const job=jobs.get(url.pathname.split('/').at(-1));assert.ok(job,'Known job');body={...job,status:'SUCCEEDED',progress:100,assetPath:`/api/ai3d/jobs/${job.id}/asset`};jobs.set(job.id,body);}
    await send('Fetch.fulfillRequest',{requestId,responseCode:body?200:404,responseHeaders:[{name:'Content-Type',value:mime}],body:Buffer.isBuffer(body)?body.toString('base64'):Buffer.from(JSON.stringify(body||{error:'Project not found'})).toString('base64')});
  }
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
  const until=async(expression,label)=>{for(let i=0;i<100;i++){if(await evaluate(expression))return;await wait(200);}throw Error(label+': '+await evaluate('document.body.innerText.slice(-1600)'));};
  const ready=selector=>until(`Boolean(document.querySelector(${JSON.stringify(selector)}))`,selector);
  const button=async label=>{await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')===${JSON.stringify(label)}||b.textContent.trim()===${JSON.stringify(label)});if(!b||b.disabled)throw Error('Button unavailable: '+${JSON.stringify(label)});b.click();})()`);await wait(150);};
  const menu=async label=>{await evaluate(`(()=>{const a=document.querySelector('.scene-project-actions');if(!a.open)a.querySelector('summary').click();const s=[...document.querySelectorAll('.scene-menu summary')].find(s=>s.textContent===${JSON.stringify(label)});if(!s.parentElement.open)s.click();})()`);};
  const count=()=>evaluate("Number(document.querySelector('.scene-canvas').dataset.objectCount)");
  const field=async(label,value)=>{await evaluate(`(()=>{const e=document.querySelector('input[aria-label="${label}"]');e.focus();e.select();})()`);await send('Input.insertText',{text:String(value)});await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await wait(250);assert.equal(await evaluate(`document.querySelector('input[aria-label="${label}"]').value`),String(value));};
  await send('Page.enable');await send('Runtime.enable');await send('DOM.enable');
  await send('Emulation.setFocusEmulationEnabled',{enabled:true});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:"localStorage.setItem('cookiePreference','necessary');localStorage.setItem('cedium_signin_popup_dismissed','1');"});
  await send('Fetch.enable',{patterns:[{urlPattern:'*/api/auth/session'},{urlPattern:'*/api/studio-projects*'},{urlPattern:'*/api/ai3d/*'}]});
  for(const route of ['/casynus','/infrastructure','/interior?workspace=3d']){
    await send('Page.navigate',{url:base+route});await ready('.scene-canvas canvas');
    if(await evaluate("Boolean(document.querySelector('[aria-label=\"Show AI chat\"]'))"))await button('Show AI chat');
    await ready('option[value="hunyuan"]');
    await menu('File');await button('New project');await until("document.querySelector('.scene-canvas').dataset.objectCount==='0'",'Empty new project');
    await button('New studio conversation');
    await evaluate("(()=>{const s=document.querySelector('select[aria-label=\"AI mode\"]');s.value='hunyuan';s.dispatchEvent(new Event('change',{bubbles:true}));})()");
    const dom=await send('DOM.getDocument'),file=await send('DOM.querySelector',{nodeId:dom.root.nodeId,selector:'input[aria-label="Attach reference image"]'});
    await send('DOM.setFileInputFiles',{nodeId:file.nodeId,files:[image]});await ready('.studio-ai-attachment');
    await button('Send AI request');await until("[...document.querySelectorAll('button')].some(b=>b.textContent==='Insert into Studio'&&!b.disabled)",'Generated asset in chat');
    assert.equal(await count(),0,'Generation does not insert until requested');
    await button('Insert into Studio');await until("document.querySelector('.scene-canvas').dataset.objectCount==='1'",'Inserted model');
    await ready('input[aria-label="position X"]');assert.match(await evaluate("document.querySelector('.cs-chat-selection').textContent"),/Hunyuan/);
    await field('position X',3);await field('rotation Y',45);await field('scale Z',1.5);
    await menu('Edit');await button('Duplicate · Ctrl D');assert.equal(await count(),2);
    await menu('Edit');await button('Undo · Ctrl Z');assert.equal(await count(),1);
    await menu('Edit');await button('Redo · Ctrl Shift Z');assert.equal(await count(),2);
    await evaluate("[...document.querySelectorAll('.scene-tree-name')].filter(b=>b.textContent.includes('Hunyuan')).at(-1).click()");await wait(150);
    await menu('Edit');await button('Delete selected');assert.equal(await count(),1);
    await menu('Edit');await button('Undo · Ctrl Z');assert.equal(await count(),2);
    await wait(2300);
    const saved=[...projects.values()].reverse().find(p=>p.document.objects.some(o=>o.kind==='model'));
    assert.ok(saved);const object=saved.document.objects.find(o=>o.kind==='model');assert.equal(object.position[0],3);assert.ok(Math.abs(object.rotation[1]-Math.PI/4)<1e-6);assert.equal(object.scale[2],1.5);assert.ok(object.asset.jobId);assert.equal(object.geometry,undefined);
    const projectId=saved.document.id,before=downloads;
    await send('Page.navigate',{url:base+route+(route.includes('?')?'&':'?')+'project='+projectId});await ready('.scene-canvas canvas');await until("document.querySelector('.scene-canvas').dataset.objectCount==='2'",'Project restored');await wait(2000);assert.ok(downloads>before,'GLB restored through private asset endpoint');
    await evaluate("document.querySelector('.scene-tree-name').click()");await button('Fit entire scene');await wait(300);
    await button('Minimize AI assistant');
    for(const theme of ['dark','light']){
      await evaluate(`localStorage.setItem('crystal_studio_theme','${theme}');window.dispatchEvent(new Event('storage'));`);await wait(300);
      const screenshot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,route.split('?')[0].slice(1)+'-'+theme+'.png'),Buffer.from(screenshot.data,'base64'));
    }
    console.log('PASS',route,'image → chat asset → insert, selection, transforms, duplicate, delete, Undo/Redo, save/reopen, light/dark WebGL');
  }
  assert.equal(submissions,3);assert.deepEqual(errors,[]);console.log('PASS real GLB, mocked auth/database/job HTTP; artifacts:',out);await send('Browser.close');
}
run().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{socket?.close();chrome.kill();});
