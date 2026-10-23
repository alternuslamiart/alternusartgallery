// Opt-in browser regression check: start Next on port 3003, then run this script.
// Uses installed Chrome and Node 22's WebSocket; no browser package is required.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const baseUrl = process.env.STUDIO_QA_URL || 'http://localhost:3003';
assert.ok(['localhost','127.0.0.1'].includes(new URL(baseUrl).hostname), 'QA must target a local server');
const out = path.resolve('.tmp/studio-voice-'+Date.now());
fs.mkdirSync(out, { recursive: true });
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=9350', `--user-data-dir=${out}/profile`,
  '--no-first-run', '--no-default-browser-check', '--window-size=1440,1000', 'about:blank',
  '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream',
], { windowsHide: true, stdio: 'ignore' });
chrome.on('error', error => { console.error(error.message); process.exitCode=1; });
let socket;
async function run() {
  let tabs;
  for (let i=0;i<40;i++) { try { tabs = await (await fetch('http://localhost:9350/json')).json(); if(tabs.length) break; } catch {} await wait(250); }
  assert.ok(tabs?.length, 'Chrome remote debugger started');
  socket = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, {once:true}); socket.addEventListener('error', reject, {once:true}); });
  let id=0; const pending = new Map(); const errors=[]; let authSession=null;
  socket.addEventListener('message', event => {
    const msg=JSON.parse(event.data);
    if (msg.id) { const p=pending.get(msg.id); if(p) {pending.delete(msg.id); clearTimeout(p.timer); if(msg.error) p.reject(new Error(JSON.stringify(msg.error))); else p.resolve(msg.result); } }
    if (msg.method==='Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
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
    throw new Error(`Page did not render ${selector}: ${await evaluate('document.body.innerText.slice(0,1200)')} Errors: ${JSON.stringify(errors)}`);
  };
  await send('Page.enable'); await send('Runtime.enable');await send('Emulation.setFocusEmulationEnabled',{enabled:true});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('cookiePreference','necessary');localStorage.setItem('cedium_signin_popup_dismissed','1');`});


  const requests=[];
  async function mockRequest({requestId,request}) {
    const url=new URL(request.url);if(url.pathname!=='/api/auth/session')requests.push({path:url.pathname,method:request.method,body:url.pathname.includes('/transcribe')?null:JSON.parse(request.postData||'{}')});
    const body=url.pathname.includes('/transcribe')?(request.method==='GET'?{available:true}:{text:'Transcribed audio task'}):url.pathname==='/api/auth/session'?null:url.pathname==='/api/ai-scene'?{provider:'gemini',model:'mock',commands:[{type:'create',kind:'box',name:'Voice cube'}]}:{provider:'gemini',model:'mock',message:'Voice task received.'};
    await send('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(body)).toString('base64')});
  }
  await send('Fetch.enable',{patterns:[{urlPattern:'*/api/auth/session'},{urlPattern:'*/api/ai-chat'},{urlPattern:'*/api/ai-scene'},{urlPattern:'*/api/studio-voice/transcribe'}]});
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
  for(const route of ['/interior','/casynus','/infrastructure','/interior?workspace=3d']) {
    await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
    await send('Page.navigate',{url:baseUrl+route});await ready('.studio-ai-controls');await wait(2000);
    assert.equal(await evaluate('window.__speech.length'),0,'Microphone is never started on page load');
    assert.equal(await evaluate(`document.featurePolicy?.allowsFeature('microphone')??true`),true,'Actual document policy permits microphone');
    assert.equal(await evaluate('window.__streams.length'),0,'No capture starts on load');
    await click('Minimize AI assistant');await ready('.studio-ai-reopen-btn');await shortcut();await ready('.cs-voice-level');
    await say('Create a blue cube');assert.equal(await evaluate('document.querySelector(".studio-ai-textarea").value'),'Create a blue cube');
    await click('Stop voice dictation');
    await evaluate(`(()=>{const t=document.querySelector('.studio-ai-textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(t,'');t.dispatchEvent(new Event('input',{bubbles:true}));})()`);await wait(100);
    assert.equal(await evaluate(`window.__streams.every(s=>s.getTracks().every(t=>t.readyState==='ended'))`),true,'Stop releases actual media tracks');
    // Select a text provider; dictation itself also works in the existing local scene mode.
    await evaluate(`(()=>{const el=document.querySelector('[aria-label="AI mode"]');el.value='gemini';el.dispatchEvent(new Event('change',{bubbles:true}));const lang=document.querySelector('[aria-label="Voice language"]');lang.value='en-US';lang.dispatchEvent(new Event('change',{bubbles:true}));})()`);await wait(150);
    await evaluate(`(()=>{const mode=document.querySelector('.scene-chat-mode input');if(mode?.checked)mode.click()})()`);await wait(150);
    await click('Start voice conversation');await ready('.cs-voice-level');
    const before=requests.length;await say('Create a blue cube');await ready('.studio-ai-message.is-assistant');
    assert.equal(requests.length,before+1,'Spoken Send submits once through the real studio adapter');
    assert.equal(requests.at(-1).body.message??requests.at(-1).body.prompt,'Create a blue cube');
    assert.equal(await evaluate(`window.__streams.every(s=>s.getTracks().every(t=>t.readyState==='ended'))`),true,'Capture is released while the response is spoken');
    assert.ok((await evaluate('window.__spoken')).includes('Voice task received.'),'AI response reaches speech playback');
    await wait(500);await ready('.cs-voice-level');await click('End voice conversation');
    await click('Start voice conversation');await ready('.cs-voice-level');await say('cancel');await ready('[aria-label="Start voice conversation"]');
    assert.equal(await evaluate(`Boolean(document.querySelector('.cs-voice-status'))`),false,'Spoken cancel ends the conversation state');
    // Allowed microphone, refused recognition: use actual MediaRecorder and only mock the transcription HTTP response.
    await shortcut();await ready('.cs-voice-level');await evaluate(`window.__speech.at(-1).onerror({error:'not-allowed'})`);await ready('[aria-label="Finish voice recording"]');await wait(700);
    assert.equal(await evaluate(`Boolean(document.querySelector('.studio-ai-error'))`),false,'Speech-service refusal is not microphone permission denial');
    await click('Finish voice recording');await ready('[aria-label="Start voice dictation"]');
    assert.equal(await evaluate('document.querySelector(".studio-ai-textarea").value'),'Transcribed audio task');
    assert.ok(requests.some(r=>r.path.includes('/transcribe')&&r.method==='POST'),'Actual recorded audio reaches transcription adapter');
    await shortcut();await ready('.cs-voice-level');
    await evaluate(`Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));`);await ready('[aria-label="Start voice dictation"]');
    assert.equal(await evaluate('window.__speech.at(-1).aborted'),true,'Backgrounding aborts recognition');
    assert.equal(await evaluate(`window.__streams.every(s=>s.getTracks().every(t=>t.readyState==='ended'))`),true,'Backgrounding releases actual microphone tracks');
    await evaluate(`delete document.hidden;`);
    await evaluate(`window.__denyCapture=true`);await shortcut();await ready('.studio-ai-error');
    assert.ok((await evaluate(`document.querySelector('.studio-ai-error').textContent`)).includes('denied or restricted'));
    await evaluate(`window.__denyCapture=false`);await click('Dismiss voice error');await shortcut();await ready('.cs-voice-level');await click('Stop voice dictation');
    await evaluate(`(()=>{const t=document.querySelector('.studio-ai-textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(t,'');t.dispatchEvent(new Event('input',{bubbles:true}));})()`);await wait(100);
    if(route==='/interior'){
      await send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:true});await wait(150);
      await evaluate(`[...document.querySelectorAll('.crystal-mobile-workspace-tabs button')].find(b=>b.textContent==='Interior').click()`);await wait(100);
      await click('Start voice dictation');await ready('.cs-voice-level');await say('Add a living room');
      assert.equal(await evaluate('document.querySelector(".studio-ai-textarea").value'),'Add a living room');await click('Stop voice dictation');
      assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'),false);
      assert.ok(await evaluate(`(()=>{const r=document.querySelector('.studio-ai-controls').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;})()`),'Mobile voice controls remain visible inside the dock');
    }
    const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out+'/'+route.replaceAll(/[^a-z0-9]/gi,'_')+'.png',Buffer.from(shot.data,'base64'));
    console.log('PASS voice',route);
  }
  await send('Page.addScriptToEvaluateOnNewDocument',{source:'window.SpeechRecognition=undefined;window.webkitSpeechRecognition=undefined;'});
  await send('Page.navigate',{url:baseUrl+'/interior'});await ready('.studio-ai-controls');await wait(500);await shortcut();await ready('[aria-label="Finish voice recording"]');await wait(700);await click('Finish voice recording');await ready('[aria-label="Start voice dictation"]');
  assert.equal(await evaluate('document.querySelector(".studio-ai-textarea").value'),'Transcribed audio task','Unsupported recognition uses recorded transcription');
  await send('Page.reload');await ready('.studio-ai-controls');assert.equal(await evaluate('window.__streams.length'),0,'Refresh never restarts capture');
  assert.equal(errors.length,0,JSON.stringify(errors));console.log('PASS actual synthetic-device getUserMedia/MediaRecorder/AudioContext, scoped policy, permission recovery, conversation/playback wiring, cancellation and all studio routes. Recognition, AI/transcription HTTP and speech playback mocked; no physical audio/provider accuracy claim.');console.log('Artifacts',out);await send('Browser.close');
}
run().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify({id:999999,method:'Browser.close'}));socket?.close();chrome.kill();});
