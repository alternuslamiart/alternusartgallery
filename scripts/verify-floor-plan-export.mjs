// Interior export regression: start Next on port 3003, then run this script.
// Uses installed Chrome and Node 22's WebSocket; no browser package is required.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const baseUrl = process.env.STUDIO_QA_URL || 'http://localhost:3003';
assert.ok(['localhost','127.0.0.1'].includes(new URL(baseUrl).hostname), 'QA must target a local server');
const out = path.resolve('.tmp/floor-plan-export-'+Date.now());
fs.mkdirSync(out, { recursive: true });
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=9356', `--user-data-dir=${out}/profile`,
  '--no-first-run', '--no-default-browser-check', '--window-size=1440,1000', 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
chrome.on('error', error => { console.error(error.message); process.exitCode=1; });
let socket;
async function run() {
  let tabs;
  for (let i=0;i<40;i++) { try { tabs = await (await fetch('http://localhost:9356/json')).json(); if(tabs.length) break; } catch {} await wait(250); }
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

  await send('Page.navigate',{url:baseUrl+'/interior'});
  await ready('.interior-scene-inspector .studio-export-btn');
  await wait(800);
  await evaluate('window.__exports=[];window.__originalURL=URL.createObjectURL;URL.createObjectURL=function(blob){window.__exports.push(blob);return window.__originalURL.call(this,blob)}');
  for(const format of ['SVG','PDF','PNG']) {
    await evaluate('window.__exports=[]');
    await evaluate('[...document.querySelectorAll(".interior-scene-inspector .studio-export-btn")].find(b=>b.textContent==='+JSON.stringify(format)+').click()');
    for(let i=0;i<100;i++){if(await evaluate('window.__exports.length>0'))break;await wait(100);}
    const file=await evaluate('(async()=>{const blob=window.__exports[0];return {type:blob.type,data:Array.from(new Uint8Array(await blob.arrayBuffer()))}})()');
    fs.writeFileSync(out+'/plan.'+format.toLowerCase(),Buffer.from(file.data));
    if(format==='SVG'||format==='PDF')assert.match(Buffer.from(file.data).toString(),/Fit to page/);
    if(format==='PNG') {
      const pixels=await evaluate(`(async()=>{const image=new Image();image.src=window.__originalURL.call(URL,window.__exports[0]);await image.decode();const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=Math.round(1000*image.height/image.width);const c=canvas.getContext('2d');c.drawImage(image,0,0,canvas.width,canvas.height);const p=c.getImageData(0,0,canvas.width,canvas.height).data;let minX=1000,minY=1000,maxX=0,maxY=0;for(let y=0;y<canvas.height-30;y++)for(let x=0;x<1000;x++){const i=(y*1000+x)*4;if(p[i]<100&&p[i+1]<120&&p[i+2]<140){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y)}}return{minX,minY,maxX,maxY,height:canvas.height}})()`);
      assert.ok(pixels.maxX-pixels.minX>800,JSON.stringify(pixels));
      assert.ok(pixels.maxY-pixels.minY>pixels.height*.8,JSON.stringify(pixels));
      assert.ok(pixels.minX>10&&pixels.minY>10&&pixels.maxX<990&&pixels.maxY<pixels.height-10,JSON.stringify(pixels));
      console.log('PASS raster bounds',pixels);
    }
    console.log('PASS actual download',format,file.type,file.data.length);
  }
  await send('Page.navigate',{url:'file:///'+out.replaceAll('\\','/')+'/plan.svg'});
  await wait(500);const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out+'/fitted-sheet.png',Buffer.from(shot.data,'base64'));
  assert.equal(errors.length,0,JSON.stringify(errors));console.log('Artifacts',out);await send('Browser.close');
}
run().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify({id:999999,method:'Browser.close'}));socket?.close();chrome.kill();});
