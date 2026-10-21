import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const out=path.resolve('.tmp/auth-reference-'+Date.now());fs.mkdirSync(out,{recursive:true});
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=9337',`--user-data-dir=${out}/profile`,'--no-first-run','--window-size=1440,900','about:blank'],{windowsHide:true,stdio:'ignore'});
let socket;let pausedMode='error';const errors=[];
async function run(){
 let tabs;
 for(let i=0;i<50;i++){try{tabs=await(await fetch('http://localhost:9337/json')).json();if(tabs.length)break;}catch{}await wait(200)}
 assert.ok(tabs?.length,'Chrome started');socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
 let id=0;const pending=new Map();
 socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result)}}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description??m.params.exceptionDetails.text);if(m.method==='Fetch.requestPaused'){const status=pausedMode==='error'?401:200;void send('Fetch.fulfillRequest',{requestId:m.params.requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(status===401?{error:'Email or password is incorrect.'}:{success:true})).toString('base64')})}});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;const timer=setTimeout(()=>{pending.delete(n);reject(new Error('CDP timeout: '+method))},60000);pending.set(n,{resolve,reject,timer});socket.send(JSON.stringify({id:n,method,params}))});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text);return r.result.value};
 const ready=async selector=>{for(let i=0;i<120;i++){if(await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`))return;await wait(300)}throw new Error('Missing '+selector)};
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setFocusEmulationEnabled',{enabled:true});await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('cookiePreference','necessary');localStorage.setItem('cedium_signin_popup_dismissed','1');`});

 for(const route of ['/login','/signup']) for(const width of [1440,900,390]) for(const theme of ['dark','light']) {
  await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:'localStorage.setItem("Coreforge_auth_theme",'+JSON.stringify(theme)+');'});
  await send('Page.navigate',{url:'http://localhost:3003'+route});await ready('.auth-reference.auth-'+theme);await wait(350);
  const state=await evaluate(`(()=>{const q=s=>document.querySelector(s),box=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}};return{overflow:document.documentElement.scrollWidth>innerWidth,shell:box(q('.auth-reference-shell')),visual:box(q('.auth-reference-visual')),form:box(q('.auth-reference-form')),inputs:[...document.querySelectorAll('input')].map(e=>e.id),social:document.querySelectorAll('.auth-social-button').length,title:q('h1').textContent}})()`);
  assert.equal(state.overflow,false);assert.ok(state.shell.width<=1181);assert.equal(state.social,3);assert.ok(state.inputs.includes('email')&&state.inputs.includes('password'));
  if(width>640){assert.ok(state.visual.x<state.form.x);assert.equal(state.visual.y,state.form.y);if(width===1440)assert.equal(state.shell.width,1181);}else assert.ok(state.visual.y<state.form.y);
  const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});fs.writeFileSync(out+'/'+route.slice(1)+'-'+width+'-'+theme+'.png',Buffer.from(shot.data,'base64'));console.log('PASS',route,width,theme,JSON.stringify(state));
 }
 const fill=async(selector,value)=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);await send('Input.insertText',{text:value});};
 await send('Page.navigate',{url:'http://localhost:3003/login?callbackUrl=%2Fcasynus'});await ready('#email');await wait(700);
 await fill('#email','qa@example.test');await fill('#password','wrong password');
 await send('Fetch.enable',{patterns:[{urlPattern:'*api/auth/request-login-code*'},{urlPattern:'*api/auth/register*'}]});
 await evaluate(`document.querySelector('button[type="submit"]').click()`);await ready('[role="alert"]');
 assert.ok(await evaluate(`document.querySelector('[role="alert"]').textContent.includes('incorrect')`));
 pausedMode='success';await evaluate(`document.querySelector('button[type="submit"]').click()`);await ready('#verificationCode');
 assert.ok(await evaluate(`document.querySelector('button[type="submit"]').disabled`));
 await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Change email')).click()`);await ready('#password');
 assert.equal(await evaluate(`document.querySelector('#email').value`),'qa@example.test');
 await send('Page.navigate',{url:'http://localhost:3003/signup'});await ready('#firstName');await wait(700);
 await fill('#firstName','QA');await fill('#lastName','Test');await fill('#email','qa@example.test');await fill('#password','short');
 await evaluate(`document.querySelector('button[type="submit"]').click()`);await ready('[role="alert"]');assert.ok(await evaluate(`document.querySelector('[role="alert"]').textContent.includes('8 characters')`));
 pausedMode='error';await evaluate(`document.querySelector('#password').select()`);await send('Input.insertText',{text:'qa-password-123'});await evaluate(`document.querySelector('button[type="submit"]').click()`);await wait(300);assert.ok(await evaluate(`document.querySelector('[role="alert"]').textContent.includes('incorrect')`));
 await evaluate(`document.querySelector('.auth-reference-theme').click()`);await ready('.auth-reference.auth-dark');await send('Page.reload');await ready('.auth-reference.auth-dark');
 assert.equal(errors.length,0,JSON.stringify(errors));console.log('PASS: code step/back, mocked API errors, signup validation, theme persistence');console.log('Artifacts',out);
 await send('Fetch.disable');await send('Browser.close');
}
run().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify({id:999999,method:'Browser.close'}));socket?.close();chrome.kill()});
