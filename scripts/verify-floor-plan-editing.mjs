// Interior editing regression: start Next on port 3003, then run this script.
// Uses installed Chrome and Node 22's WebSocket; no browser package is required.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const baseUrl = process.env.STUDIO_QA_URL || 'http://localhost:3003';
assert.ok(['localhost','127.0.0.1'].includes(new URL(baseUrl).hostname), 'QA must target a local server');
const out = path.resolve('.tmp/floor-plan-editing-'+Date.now());
fs.mkdirSync(out, { recursive: true });
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=9358', `--user-data-dir=${out}/profile`,
  '--no-first-run', '--no-default-browser-check', '--window-size=1440,1000', 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
chrome.on('error', error => { console.error(error.message); process.exitCode=1; });
let socket;
async function run() {
  let tabs;
  for (let i=0;i<40;i++) { try { tabs = await (await fetch('http://localhost:9358/json')).json(); if(tabs.length) break; } catch {} await wait(250); }
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

  const theme = process.argv.includes('--light') ? 'light' : 'dark';
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('crystal_studio_theme',${JSON.stringify(theme)})`});
  await send('Page.navigate',{url:baseUrl+'/interior'});
  await ready('.interior-scene-inspector .studio-export-btn');await wait(500);
  await evaluate(`document.querySelector('button[aria-label="Minimize AI assistant"]')?.click()`);
  const walls = [
    { id:'top',type:'wall',start:{x:-3,y:-2},end:{x:3,y:-2},thickness:.18 },
    { id:'right',type:'wall',start:{x:3,y:-2},end:{x:3,y:2},thickness:.18 },
    { id:'bottom',type:'wall',start:{x:3,y:2},end:{x:-3,y:2},thickness:.18 },
    { id:'left',type:'wall',start:{x:-3,y:2},end:{x:-3,y:-2},thickness:.18 },
  ];
  const fixture={objects:[...walls,
    {id:'room',type:'room',x:-2.7,y:-1.7,width:2,height:1.5,label:'Test room'},
    {id:'furniture',type:'furniture',x:-1,y:.4,width:.9,height:.6,label:'Desk'},
    {id:'door',type:'door',x:0,y:2,width:.9,height:.18,rotation:0,side:'left',swing:'in'},
    {id:'window',type:'window',x:3,y:0,width:1.2,height:.18,rotation:90,windowType:'double'},
  ]};
  await evaluate(`(()=>{const input=document.querySelector('input[type="file"][accept="application/json,.json"]');const t=new DataTransfer();t.items.add(new File([${JSON.stringify(JSON.stringify(fixture))}],'editing.json',{type:'application/json'}));input.files=t.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);await wait(200);
  const point=async(x,y)=>evaluate(`(()=>{const m=document.querySelector('.floor-plan-svg-surface>g').getScreenCTM();return {x:m.a*${x}+m.e,y:m.d*${y}+m.f}})()`);
  const mouse=async(type,p,buttons=0)=>send('Input.dispatchMouseEvent',{type,x:p.x,y:p.y,button:type==='mouseMoved'?'none':'left',buttons,clickCount:type==='mouseMoved'?0:1});
  const click=async(x,y)=>{const p=await point(x,y);await mouse('mousePressed',p,1);await mouse('mouseReleased',p);await wait(100);};
  const drag=async(x,y,dx,dy,cancel=false)=>{
    const a=await point(x,y),b=await point(x+dx,y+dy);
    await mouse('mousePressed',a,1);await wait(50);await mouse('mouseMoved',b,1);await wait(100);
    if(cancel)await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});
    await mouse('mouseReleased',b);await wait(100);
  };
  const tool=async label=>{await evaluate(`[...document.querySelectorAll('button')].find(button=>button.getAttribute('aria-label')===${JSON.stringify(label)}).click()`);await wait(100);};
  const save=()=>evaluate(`(async()=>{let blob;const original=URL.createObjectURL;URL.createObjectURL=function(value){blob=value;return original.call(this,value)};try{[...document.querySelectorAll('.interior-scene-inspector .studio-export-btn')].find(b=>b.textContent==='JSON Scene').click();return JSON.parse(await blob.text())}finally{URL.createObjectURL=original}})()`);
  const near=(a,b)=>assert.ok(Math.abs(a-b)<.002,a+' != '+b);
  await tool('Select & Move (V)');await drag(-1.7,-.95,1,.5);
  let saved=await save(),room=saved.objects.find(o=>o.id==='room');near(room.x,-1.7);near(room.y,-1.2);near(room.width,2);
  await evaluate('document.activeElement.blur()');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'z',code:'KeyZ',modifiers:2});await wait(150);
  near((await save()).objects.find(o=>o.id==='room').x,-2.7);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Z',code:'KeyZ',modifiers:10});await wait(150);
  near((await save()).objects.find(o=>o.id==='room').x,-1.7);
  await drag(-.7,-.45,.5,.5,true);near((await save()).objects.find(o=>o.id==='room').x,-1.7);
  await drag(-.55,.7,.5,.5);near((await save()).objects.find(o=>o.id==='furniture').x,-.5);
  await drag(0,-2,0,-.3);saved=await save();const top=saved.objects.find(o=>o.id==='top');near(top.start.y,-2.3);near(top.end.y,-2.3);near(top.end.x-top.start.x,6);
  await click(0,2);
  const initialPath=await evaluate('document.querySelector(".floor-plan-svg-surface [data-floor-plan-object-id=door] path").getAttribute("d")');
  await evaluate(`(()=>{const e=document.querySelector('select[aria-label="Door hinge side"]');e.value="right";e.dispatchEvent(new Event("change",{bubbles:true}))})()`);await wait(100);
  const changedPath=await evaluate('document.querySelector(".floor-plan-svg-surface [data-floor-plan-object-id=door] path").getAttribute("d")');assert.notEqual(initialPath,changedPath);
  await evaluate(`(()=>{const e=document.querySelector('select[aria-label="Door swing"]');e.value="out";e.dispatchEvent(new Event("change",{bubbles:true}))})()`);await wait(100);
  assert.match(await evaluate('document.querySelector(".floor-plan-svg-surface [data-floor-plan-object-id=door] path").getAttribute("d")'),/-0.9/);
  saved=await save();assert.equal(saved.objects.find(o=>o.id==='door').side,'right');assert.equal(saved.objects.find(o=>o.id==='door').swing,'out');
  await drag(0,2,.5,0);near((await save()).objects.find(o=>o.id==='door').x,.5);
  await drag(3,0,0,.6);saved=await save();near(saved.objects.find(o=>o.id==='window').y,.6);near(saved.objects.find(o=>o.id==='window').rotation,90);
  // Start new walls over existing room geometry, then draw a second wall without reselecting the tool.
  await tool('Wall (W)');let count=(await save()).objects.filter(o=>o.type==='wall').length;
  await drag(-1.5,-1,1,0);await drag(-1.5,-.7,1,0);
  saved=await save();assert.equal(saved.objects.filter(o=>o.type==='wall').length,count+2);
  await tool('Door (D)');await click(0,-2.3);saved=await save();assert.equal(saved.objects.filter(o=>o.type==='door').length,2);near(saved.objects.at(-1).height,.18);
  await tool('Window (N)');await click(-3,.5);saved=await save();assert.equal(saved.objects.filter(o=>o.type==='window').length,2);near(saved.objects.at(-1).rotation,-90);
  await tool('Furniture (F)');await click(1,1);saved=await save();near(saved.objects.at(-1).x,1);near(saved.objects.at(-1).y,1);
  await tool('Select & Move (V)');await click(1.4,1.3);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight'});await wait(100);
  near((await save()).objects.at(-1).x,1.001);
  await evaluate(`(()=>{const input=document.querySelector('input[aria-label="position X"]');input.focus();input.select()})()`);
  for(const char of '-1200') await send('Input.insertText',{text:char});
  await evaluate('document.activeElement.blur()');await wait(100);
  near((await save()).objects.at(-1).x,-1.2);
  await tool('Select & Move (V)');await click(2,-2.3);
  await evaluate(`(()=>{const input=document.querySelector('input[aria-label="length"]');input.focus();input.select()})()`);
  await send('Input.insertText',{text:'4.5m'});await evaluate('document.activeElement.blur()');await wait(100);
  const preciseWall=(await save()).objects.find(o=>o.id==='top');near(Math.hypot(preciseWall.end.x-preciseWall.start.x,preciseWall.end.y-preciseWall.start.y),4.5);
  await evaluate(`(()=>{const input=document.querySelector('input[aria-label="thickness"]');input.focus();input.select()})()`);
  await send('Input.insertText',{text:'250'});
  await drag(1,-2.3,0,-.2);
  const afterBlurDrag=(await save()).objects.find(o=>o.id==='top');near(afterBlurDrag.thickness,.25);near(afterBlurDrag.start.y,-2.5);
  assert.equal(await evaluate('document.documentElement.dataset.crystalTheme'),theme);
  assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'),false);
  saved=await save();const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out+'/editing.png',Buffer.from(shot.data,'base64'));fs.writeFileSync(out+'/edited-plan.json',JSON.stringify(saved,null,2));
  assert.equal(errors.length,0,JSON.stringify(errors));console.log('PASS real mouse drag, cancel, wall-over-room drawing, continuous walls, openings, hand/swing, precision, history and JSON export');console.log('Artifacts',out);await send('Browser.close');
}
run().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify({id:999999,method:'Browser.close'}));socket?.close();chrome.kill();});
