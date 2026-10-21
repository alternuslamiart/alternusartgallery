// Opt-in browser regression check: start Next on port 3002, then run this script.
// Uses installed Chrome and Node 22's WebSocket; no browser package is required.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const baseUrl = process.env.STUDIO_QA_URL || 'http://localhost:3002';
assert.ok(['localhost','127.0.0.1'].includes(new URL(baseUrl).hostname), 'QA must target a local server');
const out = path.resolve('.tmp/studio-browser');
fs.mkdirSync(out, { recursive: true });
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=9335', `--user-data-dir=${out}/profile`,
  '--no-first-run', '--no-default-browser-check', '--window-size=1440,1000', 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
chrome.on('error', error => { console.error(error.message); process.exitCode=1; });
let socket;
async function run() {
  let tabs;
  for (let i=0;i<40;i++) { try { tabs = await (await fetch('http://localhost:9335/json')).json(); if(tabs.length) break; } catch {} await wait(250); }
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
  const results=[];
  for(const route of ['/casynus','/interior','/infrastructure','/aichat']) {
    await send('Page.navigate',{url:`${baseUrl}${route}`});
    await ready(route==='/aichat'?'.aichat-page':'.studio-ai-panel');
    await wait(1800);
    for(const width of [1440,390]) {
      await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
      for(const theme of ['dark','light']) {
        await evaluate(`localStorage.setItem('crystal_studio_theme',${JSON.stringify(theme)});document.documentElement.dataset.crystalTheme=${JSON.stringify(theme)};window.dispatchEvent(new Event('crystal:theme-change'))`);
        await wait(400);
        const state=await evaluate(`(() => {
          const root=document.querySelector('.crystal-studio,.crystal-infrastructure-page,.aichat-page');
          const dock=document.querySelector('.studio-ai-panel');
          const r=dock?.getBoundingClientRect();
          return {theme:document.documentElement.dataset.crystalTheme,background:getComputedStyle(root).backgroundColor,font:getComputedStyle(root).fontFamily,overflow:document.documentElement.scrollWidth>innerWidth,dock:r?{x:r.x,y:r.y,width:r.width,height:r.height}:null,webgl:!!document.querySelector('canvas[data-engine]')};
        })()`);
        const name=`${route.slice(1)}-${width}-${theme}`;
        const screenshot=await send('Page.captureScreenshot',{format:'png'});
        fs.writeFileSync(`${out}/${name}.png`,Buffer.from(screenshot.data,'base64'));
        results.push({route,width,theme,...state});
        assert.equal(state.overflow,false,`${name}: no horizontal page overflow`);
        console.log(JSON.stringify(results.at(-1)));
      }
      if(width===390 && ['/casynus','/interior'].includes(route)) {
        await evaluate(`[...document.querySelectorAll('.crystal-mobile-workspace-tabs button')].find(b=>b.textContent===${JSON.stringify(route==='/casynus'?'Modeling':'Interior')}).click()`);
        await wait(500);
        const dock=await evaluate(`(()=>{const r=document.querySelector('.studio-ai-panel').getBoundingClientRect();return {width:r.width,x:r.x,y:r.y,height:r.height}})()`);
        assert.ok(dock.width>0 && dock.x>=0 && dock.x+dock.width<=390,'Mobile dock visible and within viewport');
        const shot=await send('Page.captureScreenshot',{format:'png'});
        fs.writeFileSync(`${out}/${route.slice(1)}-390-editor.png`,Buffer.from(shot.data,'base64'));
        console.log('Mobile editor',route,JSON.stringify(dock));
      }
      if(width===390 && route==='/infrastructure') {
        const toggle='.infra-mobile-actions button';
        assert.ok(await evaluate(`(()=>{const b=document.querySelector('${toggle}'),r=b.getBoundingClientRect();return b.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))})()`),'Mobile Library toggle is unobstructed');
        await evaluate(`document.querySelector('${toggle}').click()`);await wait(200);
        assert.ok(await evaluate(`document.querySelector('.infra-left-panel.is-open').getBoundingClientRect().width>0`),'Mobile Library panel opens');
        await evaluate(`document.querySelector('${toggle}').click();document.querySelectorAll('${toggle}')[1].click()`);await wait(200);
        assert.ok(await evaluate(`document.querySelector('.infra-inspector.is-open').getBoundingClientRect().width>0`),'Mobile inspector opens');
        await evaluate(`document.querySelectorAll('${toggle}')[1].click()`);
        console.log('PASS: mobile infrastructure panel toggles remain accessible');
      }
    }
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:`${baseUrl}/interior`}); await ready('.studio-ai-panel'); await wait(500);
  const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait(150);};
  await click('.cs-inspector-section summary');
  assert.equal(await evaluate(`document.querySelector('.cs-inspector-section').open`),false,'Inspector section collapses');
  await click('.cs-inspector-section summary');
  await evaluate(`document.querySelector('.cs-toolbar button:not(:disabled)').focus()`);
  const firstTool=await evaluate(`document.activeElement.getAttribute('aria-label')`);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
  assert.notEqual(await evaluate(`document.activeElement.getAttribute('aria-label')`),firstTool,'Toolbar keyboard navigation moves focus');
  await click('.crystal-theme-toggle');
  const selectedTheme=await evaluate('document.documentElement.dataset.crystalTheme');
  await evaluate(`(()=>{const e=document.querySelector('textarea[aria-label="AI floor-plan prompt"]');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(e,'9m x 7m house with kitchen and living room');e.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  await click('button[aria-label="Send AI request"]');
  assert.ok(await evaluate(`document.querySelector('.studio-ai-thread').textContent.includes('9m x 7m house')`));
  await click('button[aria-label="Expand AI assistant"]');
  const expandedWidth=await evaluate(`document.querySelector('.studio-ai-panel').getBoundingClientRect().width`);
  assert.equal(expandedWidth,600,'Expanded dock width');
  await click('button[aria-label="Minimize AI assistant"]');
  await click('button[aria-label="Show AI chat"]');
  assert.ok(await evaluate(`document.querySelector('.studio-ai-thread').textContent.includes('9m x 7m house')`));
  await send('Page.reload'); await ready('.studio-ai-panel.is-expanded');
  assert.ok(await evaluate(`document.querySelector('.studio-ai-thread').textContent.includes('9m x 7m house')`));
  assert.equal(await evaluate('document.documentElement.dataset.crystalTheme'),selectedTheme,'Theme persists on reload');
  await click('nav[aria-label="Switch Casynus studio"] a[href="/infrastructure"]'); await ready('.crystal-infrastructure-page');
  assert.ok(await evaluate(`document.querySelector('.studio-ai-thread').textContent.includes('9m x 7m house')`),'Conversation survives studio navigation');
  await click('button[aria-label="New studio conversation"]');
  assert.ok(!await evaluate(`document.querySelector('.studio-ai-thread').textContent.includes('9m x 7m house')`));
  console.log('PASS: prompt, expand, minimize/reopen, reload, theme toggle, cross-studio navigation, new conversation');

  // Test client identity changes using isolated mock sessions, never real credentials.
  await evaluate(`for(const id of ['qa-a','qa-b'])sessionStorage.setItem('casynus:studio-conversation:'+id,JSON.stringify({version:1,messages:[{id,role:'user',text:id+' private history'}],open:true,expanded:true}))`);
  await send('Fetch.enable',{patterns:[{urlPattern:'*api/auth/session*'}]});
  authSession={user:{id:'qa-a',name:'QA A',email:'qa-a@example.test'},expires:'2099-01-01T00:00:00Z'};
  await send('Page.navigate',{url:`${baseUrl}/interior`}); await ready('.studio-ai-panel.is-expanded'); await wait(500);
  assert.ok(await evaluate(`document.querySelector('.studio-ai-thread').textContent.includes('qa-a private history')`));
  await evaluate(`window.qaCanvas=document.querySelector('.floor-plan-svg-surface');undefined`);
  authSession={user:{id:'qa-b',name:'QA B',email:'qa-b@example.test'},expires:'2099-01-01T00:00:00Z'};
  await evaluate(`(()=>{const ch=new BroadcastChannel('next-auth');ch.postMessage({event:'session'});ch.close()})()`); await wait(700);
  assert.ok(await evaluate(`document.querySelector('.studio-ai-thread').textContent.includes('qa-b private history') && !document.querySelector('.studio-ai-thread').textContent.includes('qa-a private history')`),'Account switch isolates messages');
  assert.ok(await evaluate(`window.qaCanvas===document.querySelector('.floor-plan-svg-surface')`),'Account switch preserves mounted editor');
  assert.ok(await evaluate(`sessionStorage.getItem('casynus:studio-conversation:qa-a').includes('qa-a private history')`),'Prior account storage unchanged');
  authSession=null;
  await evaluate(`(()=>{const ch=new BroadcastChannel('next-auth');ch.postMessage({event:'session'});ch.close()})()`); await wait(500);
  assert.ok(!await evaluate(`document.querySelector('.studio-ai-thread')?.textContent.includes('private history')`),'Signout hides account history');
  console.log('PASS: account switch and signout isolate history without remounting the editor');
  await send('Fetch.disable');
  fs.writeFileSync(`${out}/results.json`,JSON.stringify({results,errors},null,2));
  console.log('Runtime errors:',JSON.stringify(errors.map(e=>e.split('\n')[0])));
  assert.equal(errors.length,0,'No browser runtime errors');
  await send('Browser.close');
}
run().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{socket?.close();chrome.kill();});
