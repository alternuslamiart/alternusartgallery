// Opt-in browser regression check: start Next on port 3003, then run this script.
// Uses installed Chrome and Node 22's WebSocket; no browser package is required.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const baseUrl = process.env.STUDIO_QA_URL || 'http://localhost:3003';
assert.ok(['localhost','127.0.0.1'].includes(new URL(baseUrl).hostname), 'QA must target a local server');
const out = path.resolve('.tmp/studio-actions-'+Date.now());
fs.mkdirSync(out, { recursive: true });
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=9360', `--user-data-dir=${out}/profile`,
  '--no-first-run', '--no-default-browser-check', '--window-size=1440,1000', 'about:blank',
  '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream',
], { windowsHide: true, stdio: 'ignore' });
chrome.on('error', error => { console.error(error.message); process.exitCode=1; });
let socket;
async function run() {
  let tabs;
  for (let i=0;i<40;i++) { try { tabs = await (await fetch('http://localhost:9360/json')).json(); if(tabs.length) break; } catch {} await wait(250); }
  assert.ok(tabs?.length, 'Chrome remote debugger started');
  socket = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, {once:true}); socket.addEventListener('error', reject, {once:true}); });
  let id=0; const pending = new Map(); const errors=[],network=[];
  socket.addEventListener('message', event => {
    const msg=JSON.parse(event.data);
    if (msg.id) { const p=pending.get(msg.id); if(p) {pending.delete(msg.id); clearTimeout(p.timer); if(msg.error) p.reject(new Error(JSON.stringify(msg.error))); else p.resolve(msg.result); } }
    if (msg.method==='Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
    if(msg.method==='Network.responseReceived'&&msg.params.response.status>=400){const url=new URL(msg.params.response.url);network.push({url:url.origin+url.pathname,status:msg.params.response.status});}
    if(msg.method==='Network.loadingFailed')network.push({error:msg.params.errorText,reason:msg.params.blockedReason});
    if(msg.method==='Fetch.requestPaused')void mockRequest(msg.params).catch(error=>{if(!error.message.includes('Invalid InterceptionId'))errors.push(error.message);});
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
    fs.writeFileSync(out+'/diagnostics.json',JSON.stringify({errors,network},null,2));throw new Error(`Page did not render ${selector}: ${await evaluate('document.body.innerText.slice(0,1200)')} Errors: ${JSON.stringify(errors)} Network: ${JSON.stringify(network)} `);
  };
  await send('Page.enable'); await send('Runtime.enable');await send('Emulation.setFocusEmulationEnabled',{enabled:true});
  await send('Network.enable');
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('cookiePreference','necessary');localStorage.setItem('cedium_signin_popup_dismissed','1');`});


  const requests=[];
  async function mockRequest({requestId,request}) {
    const url=new URL(request.url);if(url.pathname!=='/api/auth/session')requests.push({path:url.pathname,method:request.method,body:url.pathname.includes('/transcribe')?null:JSON.parse(request.postData||'{}')});
    const body=url.pathname.includes('/geocode')?{places:[{label:'London, United Kingdom',latitude:51.5074,longitude:-.1278,zoom:12}]}:url.pathname.includes('/transcribe')?(request.method==='GET'?{available:true}:{text:'Transcribed audio task'}):url.pathname==='/api/auth/session'?null:url.pathname==='/api/ai-scene'?{provider:'gemini',model:'mock',commands:[{type:'create',kind:'box',name:'Voice cube'}]}:{provider:'gemini',model:'mock',message:'Voice task received.'};
    await send('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(body)).toString('base64')});
  }
  await send('Fetch.enable',{patterns:[{urlPattern:'*/api/auth/session'},{urlPattern:'*/api/ai-chat'},{urlPattern:'*/api/ai-scene'},{urlPattern:'*/api/studio-voice/transcribe'},{urlPattern:'*/api/infrastructure/geocode*'}]});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`
    window.__speech=[];
    window.__streams=[];window.__spoken=[];
    const originalCapture=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia=async options=>{if(window.__denyCapture)throw new DOMException('blocked','NotAllowedError');const stream=await originalCapture(options);window.__streams.push(stream);return stream;};
    window.SpeechSynthesisUtterance=class {constructor(text){this.text=text}};
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[{lang:'en-US'},{lang:'sq-AL'}],speak(utterance){window.__spoken.push(utterance.text);window.__speaking=utterance;setTimeout(()=>utterance.onend?.(),300)},cancel(){window.__speaking?.onend?.();window.__speaking=null;}}});
    window.SpeechRecognition=class {
      constructor(){window.__speech.push(this)}
      start(){this.onstart?.()}
      abort(){this.aborted=true;this.onend?.()}
      result(text){this.onresult?.({resultIndex:0,results:[Object.assign([{transcript:text}],{isFinal:true})]})}
    };
  `});
  const click=async label=>{await evaluate(`[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')===${JSON.stringify(label)}||b.textContent.trim()===${JSON.stringify(label)}).click()`);await wait(100);};
  const say=async text=>{await evaluate(`window.__speech.at(-1).result(${JSON.stringify(text)})`);await wait(100);};
  const shortcut=async()=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key:'q',code:'KeyQ',modifiers:2});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'q',code:'KeyQ'});};
  const until=async(expression,message='Expected application state',timeout=20000)=>{
    const end=Date.now()+timeout;do{if(await evaluate(expression))return;await wait(100);}while(Date.now()<end);
    throw new Error(message+': '+await evaluate('document.body.innerText.slice(-1600)'));
  };
  const draft=async text=>{await until(`Object.keys(document.querySelector('.studio-ai-textarea')??{}).some(k=>k.startsWith('__reactProps'))`,'Controlled composer hydration');await evaluate(`(()=>{const t=document.querySelector('.studio-ai-textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(t,${JSON.stringify(text)});t.dispatchEvent(new Event('input',{bubbles:true}));})()`);await wait(150);await until(`!document.querySelector('[aria-label="Send AI request"]')?.disabled`,'Composer accepts the command');};
  const command=async text=>{
    await draft(text);await click('Send AI request');
    await until(`Boolean(document.querySelector('.studio-ai-error'))||(document.querySelector('.studio-ai-message:last-child')?.classList.contains('is-assistant')&&document.querySelector('.studio-ai-message.is-user')?.textContent.includes(${JSON.stringify(text)}))`,'Command result: '+text);
    return await evaluate(`document.querySelector('.studio-ai-error')?.textContent??document.querySelector('.studio-ai-message.is-assistant:last-child')?.textContent??''`);
  };
  const count=()=>evaluate(`Number(document.querySelector('.scene-canvas')?.dataset.objectCount)`);
  const tracksEnded=()=>evaluate(`window.__streams.every(s=>s.getTracks().every(t=>t.readyState==='ended'))`);
  const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out+'/'+name+'.png',Buffer.from(r.data,'base64'));};
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:baseUrl+'/'});await ready('a[href="/casynus"]');
  await until(`Object.keys(document.querySelector('a[href="/casynus"]')).some(k=>k.startsWith('__reactProps'))`,'Homepage hydration');
  await wait(1000);
  await evaluate(`window.__voiceEntryDocument=true;document.querySelector('a[href="/casynus"]').click()`);
  await ready('.scene-canvas canvas');await ready('.studio-ai-controls');await wait(1000);
  assert.equal(await evaluate('window.__voiceEntryDocument'),true,'Studio entry uses client navigation and retains the homepage document');
  assert.equal(await evaluate(`(document.permissionsPolicy??document.featurePolicy).allowsFeature('microphone')`),true,'Homepage policy must allow studio microphone after client navigation');
  const fixture={version:1,id:'voice-command-fixture',name:'Voice command fixture',units:'m',objects:[],environment:{quality:'balanced',exposure:1,sunIntensity:3,sunAzimuth:40,sunElevation:45,shadows:true},camera:{position:[14,11,14],target:[0,1,0],projection:'perspective'}};
  await evaluate(`(()=>{const input=document.querySelector('[aria-label="Import scene file"]'),d=new DataTransfer();d.items.add(new File([${JSON.stringify(JSON.stringify(fixture))}],'commands.json',{type:'application/json'}));input.files=d.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await until(`Number(document.querySelector('.scene-canvas')?.dataset.objectCount)===0`);
  await draft('Keep these design notes');await click('Start voice dictation');await ready('dialog[aria-label="Voice Speech"][open]');
  const dimensions=await evaluate(`(()=>{const d=document.querySelector('.voice-speech-modal'),s=d.querySelector('.voice-speech-start'),c=d.querySelector('header button');return {width:d.getBoundingClientRect().width,height:d.getBoundingClientRect().height,button:[s.offsetWidth,s.offsetHeight],close:[c.offsetWidth,c.offsetHeight],background:getComputedStyle(d).backgroundColor}})()`);
  assert.deepEqual(dimensions,{width:271,height:138,button:[254,32],close:[24,24],background:'rgb(34, 34, 34)'});
  assert.equal(await evaluate('window.__streams.length'),0,'Opening modal never opens the microphone');
  const idle=await evaluate(`Array.from(document.querySelectorAll('.voice-speech-wave i'),e=>e.style.height)`);await wait(400);assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('.voice-speech-wave i'),e=>e.style.height)`),idle,'Idle waveform is static');
  await shot('modal-idle');await click('Close Voice Speech');await shortcut();await ready('.voice-speech-modal[open]');assert.equal(await evaluate('window.__streams.length'),0);await click('Start');await ready('.voice-speech-wave[data-listening="true"]');
  await until(`Number(document.querySelector('.voice-speech-wave').dataset.level)>0`,'Real synthetic-device audio reaches the waveform',7000);
  await shot('modal-listening');await say('Add a cube');await until(`Number(document.querySelector('.scene-canvas')?.dataset.objectCount)===1`);
  await until(`document.querySelector('.voice-speech-start')?.textContent==='Start'`);
  assert.equal(await evaluate(`document.querySelector('.studio-ai-textarea').value`),'Keep these design notes');assert.equal(await tracksEnded(),true);await shot('modal-completed');await click('Close Voice Speech');
  const beforeVoice=await evaluate('window.__streams.length');await click('Start voice conversation');await ready('.voice-speech-modal[open]');assert.equal(await evaluate('window.__streams.length'),beforeVoice);
  await click('Start');await ready('.voice-speech-wave[data-listening="true"]');await say('Rotate the selected object 90 degrees');
  await until(`Math.abs(Number(document.querySelector('[aria-label="rotation Y"]')?.value)-90)<.001`);await until(`document.querySelector('.voice-speech-start')?.textContent==='Start'`);
  assert.ok((await evaluate('window.__spoken')).some(t=>t.includes('Scene change confirmed')));await click('Close Voice Speech');
  assert.match(await command('Move selected object 200 cm left'),/Scene change confirmed/);assert.equal(await evaluate(`Number(document.querySelector('[aria-label="position X"]').value)`),-2);
  await command('Increase the height to 3 meters');assert.equal(await evaluate(`Number(document.querySelector('[aria-label="dimensions Y"]').value)`),3);
  await command('Change the material to wood');assert.equal(await evaluate(`document.querySelector('[aria-label="Base color"]').value`),'#966642');
  await command('Duplicate selected object');assert.equal(await count(),2);
  assert.match(await command('Delete all objects'),/Confirm/);assert.equal(await count(),2,'Bulk delete waits for confirmation');
  await command('Undo');assert.equal(await count(),1);assert.match(await command('Confirm'),/No matching confirmation/);assert.equal(await count(),1,'Changed state invalidates pending deletion');
  await command('Redo');assert.equal(await count(),2);await command('Delete all objects');await command('Confirm');assert.equal(await count(),0);await command('Undo');assert.equal(await count(),2);
  assert.match(await command('Select the object'),/Which object/);
  await command('Activate the Move tool');assert.equal(await evaluate(`document.querySelector('button[aria-label="Move · W"]').getAttribute('aria-pressed')`),'true');
  await command('Open Properties');assert.ok(await evaluate(`Boolean(document.querySelector('.scene-inspector'))`));
  await command('Open material library');await ready('.casynus-material-library');await click('Close texture library');
  await command('Export');await ready('dialog[aria-label="Export scene"][open]');await click('Close export');
  await command('Add a building');assert.ok((await count())>2);await command('Undo');assert.equal(await count(),2);await command('Save my project');
  const saved=()=>evaluate(`new Promise((resolve,reject)=>{const r=indexedDB.open('casynus-scene-recovery',1);r.onsuccess=()=>{const db=r.result,q=db.transaction('documents').objectStore('documents').get('guest:'+new URL(location.href).searchParams.get('project'));q.onsuccess=()=>{db.close();resolve(q.result.document)};q.onerror=()=>reject(q.error)};r.onerror=()=>reject(r.error)})`);
  const savedBefore=await saved();await command('Zoom in');await command('Save project');const savedAfter=await saved();assert.notDeepEqual(savedAfter.camera.position,savedBefore.camera.position,'Zoom changes and saves the actual perspective camera');
  const retainedId=await evaluate(`new URL(location.href).searchParams.get('project')`);
  console.log('PASS exact modal, audio, 3D actions/history/confirmation and actual browser save');
  await send('Page.reload');await ready('.scene-canvas canvas');await until(`Number(document.querySelector('.scene-canvas')?.dataset.objectCount)===2`);assert.equal(await evaluate('window.__streams.length'),0,'Refresh never starts recording');
  // Real navigation retains the prior scene before leaving.
  await draft('Open Infrastructure Studio');await click('Send AI request');await until(`location.pathname==='/infrastructure'`);await ready('.scene-canvas canvas');await ready('.studio-ai-controls');
  await command('Activate World Map');await ready('.infrastructure-world-map[data-ready="true"]');
  const camera=()=>evaluate(`JSON.parse(document.querySelector('.infrastructure-map-canvas').dataset.camera)`);
  await command('Zoom in');const zoom=await camera();await command('Zoom out');assert.ok((await camera()).zoom<zoom.zoom);
  await command('Search for London');assert.ok((await evaluate(`document.querySelector('.infrastructure-map-selection').textContent`)).includes('London'));
  await command('Switch to 3D');assert.ok((await camera()).pitch>50);
  const locationBefore=await camera();await command('Move east');const locationAfter=await camera();assert.ok(locationAfter.center[0]>locationBefore.center[0]);assert.ok(Math.abs(locationAfter.center[1]-locationBefore.center[1])<1e-6);
  await command('Rotate the map');assert.ok(Math.abs((await camera()).bearing)>1);
  await command('Switch to 2D');assert.equal((await camera()).pitch,0);
  assert.match(await command('Focus on selected building'),/Select a geographic feature/);
  await command('Close World Map');assert.equal(await evaluate(`Boolean(document.querySelector('.scene-workbench[data-world-map="true"]'))`),false);
  console.log('PASS real map activation after navigation and camera/search commands');
  await draft('Open Floor Plan');await click('Send AI request');await until(`location.pathname==='/casynus'&&new URL(location.href).searchParams.get('mode')==='floor-plan'`);await ready('.studio-ai-controls');await ready('svg [data-floor-plan-object-id]');await wait(500);
  const floorCount=()=>evaluate(`document.querySelectorAll('svg [data-floor-plan-object-id]').length`);
  const floorBefore=await floorCount();assert.match(await command('Create a wall'),/Floor-plan change confirmed/);assert.equal(await floorCount(),floorBefore+1);
  await command('Rotate selected object 90 degrees');await command('Undo');await command('Redo');
  assert.match(await command('Add a cube'),/2D editor/);assert.equal(await floorCount(),floorBefore+1,'Unsupported 3D geometry never appears in 2D');
  await command('Save project');assert.ok(await evaluate(`Boolean(localStorage.getItem('casynus:floor-plan-recovery:guest'))`));
  await send('Page.reload');await ready('.studio-ai-controls');await until(`document.querySelectorAll('svg [data-floor-plan-object-id]').length===${floorBefore+1}`,'Floor-plan reload restores saved geometry');
  await draft('Switch to Interior Studio');await click('Send AI request');await until(`location.pathname==='/interior'`);await ready('.studio-ai-controls');assert.equal(await floorCount(),floorBefore+1);
  await click('Start voice dictation');await ready('.voice-speech-modal[open]');await click('Start');await ready('.voice-speech-wave[data-listening="true"]');await say('Zmadho pamjen');await until(`document.querySelector('.voice-speech-start')?.textContent==='Start'`);await click('Close Voice Speech');
  // Actual MediaRecorder fallback and cancellation still work behind the shared modal.
  await click('Start voice dictation');await click('Start');await ready('.voice-speech-wave[data-listening="true"]');await evaluate(`window.__speech.at(-1).onerror({error:'not-allowed'})`);await until(`document.querySelector('.voice-speech-start')?.textContent==='Stop'`);await wait(700);await click('Stop');await until(`document.querySelector('.studio-ai-textarea').value.includes('Transcribed audio task')`);await click('Close Voice Speech');assert.equal(await tracksEnded(),true);
  await click('Start voice dictation');await click('Start');await ready('.voice-speech-wave[data-listening="true"]');await click('Close Voice Speech');assert.equal(await tracksEnded(),true,'Close releases every capture track');
  for(const width of [390,1440]){await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await wait(200);if(width===390){await evaluate(`[...document.querySelectorAll('.crystal-mobile-workspace-tabs button')].find(b=>b.textContent==='Interior')?.click()`);await wait(200);}await click('Start voice dictation');await ready('.voice-speech-modal[open]');assert.equal(await evaluate(`document.querySelector('.voice-speech-modal').getBoundingClientRect().width`),271);await shot('modal-'+width);await click('Close Voice Speech');}
  await draft('Open Architecture Studio');await click('Send AI request');await until(`location.pathname==='/casynus'&&!new URL(location.href).searchParams.has('mode')`);await ready('.scene-canvas canvas');await until(`Number(document.querySelector('.scene-canvas')?.dataset.objectCount)===2`);assert.equal(await evaluate(`new URL(location.href).searchParams.get('project')`),retainedId,'Architecture scene survives studio navigation');
  assert.equal(requests.filter(r=>r.path==='/api/ai-scene'||r.path==='/api/ai-chat').length,0,'Known local commands never simulate provider tool execution');
  assert.equal(errors.length,0,JSON.stringify(errors));console.log('PASS exact shared modal, real synthetic microphone/waveform/recorder cleanup, English/Albanian actions, editable scene transforms/material/history, confirmation/stale-confirmation, actual saves/reloads/navigation, real map camera controls, mocked geocoding and unsupported-action safety.');console.log('Artifacts',out);await send('Browser.close');
}
run().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify({id:999999,method:'Browser.close'}));socket?.close();chrome.kill();});
