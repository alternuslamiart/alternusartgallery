// Opt-in browser regression check: start Next on port 3003, then run this script.
// Uses installed Chrome and Node 22's WebSocket; no browser package is required.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

import {makeDocument,makeObject} from '../src/lib/scene/document.mjs';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const baseUrl = process.env.STUDIO_QA_URL || 'http://localhost:3003';
assert.ok(['localhost','127.0.0.1'].includes(new URL(baseUrl).hostname), 'QA must target a local server');
const out = path.resolve('.tmp/world-map-'+Date.now());
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
  let id=0; const pending = new Map(); const errors=[]; const network=[]; let authSession=null; let geocodePlaces=[];
  const mapFixture = { version: 8, sources: { buildings: { type: 'geojson', data: { type: 'FeatureCollection', features: [{ type: 'Feature', properties: { name: 'QA measured building', building: 'yes', height: 18 }, geometry: { type: 'Polygon', coordinates: [[[13.4048,52.5198],[13.4052,52.5198],[13.4052,52.5202],[13.4048,52.5202],[13.4048,52.5198]]] } }] } } }, layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#18232a' } }, { id: 'building', type: 'fill', source: 'buildings', paint: { 'fill-color': '#aaa' } }] };
  socket.addEventListener('message', event => {
    const msg=JSON.parse(event.data);
    if (msg.id) { const p=pending.get(msg.id); if(p) {pending.delete(msg.id); clearTimeout(p.timer); if(msg.error) p.reject(new Error(JSON.stringify(msg.error))); else p.resolve(msg.result); } }
    if (msg.method==='Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
    if (msg.method==='Runtime.consoleAPICalled' && msg.params.type==='error') console.error('Browser:',msg.params.args.map(a=>a.description??a.value).join(' '));
    if (msg.method==='Network.responseReceived' && msg.params.response.status>=400) network.push({url:msg.params.response.url,status:msg.params.response.status});
    if (msg.method==='Network.loadingFailed') network.push(msg.params);
    if (msg.method==='Log.entryAdded' && msg.params.entry.level==='error') network.push(msg.params.entry);
    if (msg.method==='Fetch.requestPaused') void send('Fetch.fulfillRequest',{requestId:msg.params.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:'*'}],body:Buffer.from(JSON.stringify(msg.params.request.url.includes('tiles.openfreemap.org/styles/')?mapFixture:msg.params.request.url.includes('/geocode')?{places:geocodePlaces}:authSession)).toString('base64')});
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
    fs.writeFileSync(out+'/diagnostics.json',JSON.stringify({errors,network},null,2));
    throw new Error(`Page did not render ${selector}: ${await evaluate('document.body.innerText.slice(0,1200)')} ${JSON.stringify(errors)}. Diagnostics: ${out}`);
  };
  await send('Page.enable'); await send('Runtime.enable');await send('Emulation.setFocusEmulationEnabled',{enabled:true});
  await send('Network.enable'); await send('Log.enable');
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('cookiePreference','necessary');localStorage.setItem('cedium_signin_popup_dismissed','1');`});


  await send('Fetch.enable',{patterns:[{urlPattern:'*/api/auth/session'}]});

  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:baseUrl+'/infrastructure'});await ready('.scene-canvas canvas');
  const fixture=makeDocument('infrastructure');fixture.objects=[makeObject('box',{name:'Preserved model',position:[2,1,3]})];
  await evaluate(`(()=>{const input=document.querySelector('input[aria-label="Import scene file"]'),d=new DataTransfer();d.items.add(new File([${JSON.stringify(JSON.stringify(fixture))}],'map-fixture.json',{type:'application/json'}));input.files=d.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await ready('[data-scene-object-id="'+fixture.objects[0].id+'"]');
  await evaluate(`document.querySelector('[data-scene-object-id] .scene-tree-name').click();document.querySelector('[aria-label="Minimize AI assistant"]')?.click();window.originalSceneCanvas=document.querySelector('.scene-canvas canvas');void 0`);
  await ready('[aria-label="position X"]');
  await evaluate(`(()=>{const input=document.querySelector('[aria-label="position X"]');input.focus();input.value='4';input.blur()})()`);await wait(200);
  await evaluate(`document.querySelector('button[aria-label="World Map"]').click()`);
  if(process.argv.includes('--expect-missing-style')) {
    await ready('.infrastructure-map-search [role="alert"]');
    assert.ok((await evaluate('document.querySelector(".infrastructure-map-search").textContent')).includes('NEXT_PUBLIC_INFRASTRUCTURE_MAP_STYLE'),'Production requires configured style');
    assert.equal(await evaluate('performance.getEntriesByType("resource").some(r=>r.name.includes("demotiles.maplibre.org"))'),false,'Production never requests demo tiles');
    await evaluate(`document.querySelector('button[aria-label="3D Editor"]').click()`);
    assert.equal(await evaluate('window.originalSceneCanvas===document.querySelector(".scene-canvas canvas")'),true);
    assert.equal(await evaluate(`document.querySelector('[aria-label="position X"]').value`),'4');
    for(const route of ['/casynus','/interior?workspace=3d']) {
      await send('Page.navigate',{url:baseUrl+route});await ready('.scene-canvas canvas');
      assert.equal(await evaluate(`Boolean(document.querySelector('button[aria-label="World Map"]'))`),false,'Other studios unchanged');
    }
    assert.equal(errors.length,0,JSON.stringify(errors));console.log('PASS production Infrastructure rendering, style gating, preserved editor and other studio rendering');await send('Browser.close');return;
  }
  await ready('.infrastructure-world-map[data-ready="true"]');await wait(1200);
  const initial=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out+'/globe.png',Buffer.from(initial.data,'base64'));
  const click=async(x,y,button='left')=>{await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button,clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button,clickCount:1});await wait(300)};
  await click(720,450);await ready('.infrastructure-map-marker');
  const selectText=await evaluate(`document.querySelector('[aria-label="Selected geographic coordinates"]').textContent`);assert.ok(selectText);
  await evaluate(`document.querySelector('[aria-label="Zoom in (+)"]').click()`);await wait(700);
  const camera=()=>evaluate('JSON.parse(document.querySelector(".infrastructure-map-canvas").dataset.camera)');
  const zoomed=await camera();assert.ok(zoomed.zoom>1,'Toolbar zoom controls map');
  await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:720,y:450,deltaX:0,deltaY:-160});await wait(900);assert.ok((await camera()).zoom>zoomed.zoom,'Mouse wheel zoom works');
  const fullscreen=await evaluate(`(()=>{const r=document.querySelector('.maplibregl-ctrl-fullscreen').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await click(fullscreen.x,fullscreen.y);assert.equal(await evaluate(`Boolean(document.fullscreenElement)`),true,'Map fullscreen works');
  await evaluate(`document.exitFullscreen()`);await wait(300);
  await evaluate(`const el=document.querySelector('[aria-label="Camera view"]');el.value='Pitched';el.dispatchEvent(new Event('change',{bubbles:true}))`);await wait(700);assert.ok((await camera()).pitch>40,'Pitch camera works');
  await evaluate(`document.querySelector('[aria-label="Reset camera"]').click()`);await wait(600);
  for(const button of ['left','right']) {
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:720,y:450});
    await send('Input.dispatchMouseEvent',{type:'mousePressed',x:720,y:450,button,buttons:button==='left'?1:2,clickCount:1});
    for(let i=1;i<=8;i++)await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:720+i*12,y:450+i*5,button,buttons:button==='left'?1:2});
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:816,y:490,button,clickCount:1});await wait(700);
    const moved=await camera();if(button==='left')assert.ok(Math.abs(moved.center[0])>1,'Pan works');else assert.ok(Math.abs(moved.bearing)>1||moved.pitch>1,'Rotation works');
  }
  const search=async value=>{await evaluate(`(()=>{const el=document.querySelector('[aria-label="Country, city or coordinates"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}));})()`);await evaluate('document.querySelector(".infrastructure-map-search form").requestSubmit()');};
  await search('52.52, 13.405');await wait(1800);assert.ok((await evaluate('document.querySelector(".infrastructure-map-selection").textContent')).includes('52.520000'));
  await search('Berlin');await ready('.infrastructure-map-search [role="alert"], [aria-label="Location results"]');
  await evaluate(`window.originalMapCanvas=document.querySelector('.maplibregl-canvas');document.querySelector('[aria-label="3D Editor"]').click()`);await wait(300);
  assert.equal(await evaluate('window.originalSceneCanvas===document.querySelector(".scene-canvas canvas")'),true,'Scene stays mounted');
  assert.equal(await evaluate(`document.querySelector('[aria-label="position X"]').value`),'4','Unsaved model preserved');
  const key=async(modifiers)=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key:'z',modifiers});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'z',modifiers});await wait(200)};
  await key(2);assert.equal(await evaluate(`document.querySelector('[aria-label="position X"]').value`),'2','Undo history survives map mode');
  await key(10);assert.equal(await evaluate(`document.querySelector('[aria-label="position X"]').value`),'4','Redo survives map mode');
  await evaluate(`document.querySelector('button[aria-label="World Map"]').click()`);await wait(300);
  assert.equal(await evaluate('window.originalMapCanvas===document.querySelector(".maplibregl-canvas")'),true,'Map stays mounted');
  assert.ok((await evaluate('document.querySelector(".infrastructure-map-selection").textContent')).includes('52.520000'),'Marker survives switching');
  // Provider success UI is deterministic; no paid geocoding request is claimed.
  await send('Fetch.enable',{patterns:[{urlPattern:'*/api/auth/session'},{urlPattern:'*/api/infrastructure/geocode*'}]});
  for(const place of [{label:'London, United Kingdom',latitude:51.507,longitude:-.128,zoom:11},{label:'Germany',latitude:51,longitude:10,zoom:4}]) {
    geocodePlaces=[place];await search(place.label);await ready('[aria-label="Location results"] button');
    await evaluate(`document.querySelector('[aria-label="Location results"] button').click()`);await wait(300);
    assert.ok((await evaluate('document.querySelector(".infrastructure-map-selection").textContent')).includes(place.label));
  }
  await evaluate(`document.querySelector('[aria-label="Reset camera"]').click()`);await wait(700);
  // Actual MapLibre rendering/picking/mesh import, with a deterministic measured footprint.
  await send('Fetch.enable',{patterns:[{urlPattern:'*/api/auth/session'},{urlPattern:'*/api/infrastructure/geocode*'},{urlPattern:'https://tiles.openfreemap.org/styles/*'}]});
  // Trigger a real context retry through the component's existing recovery action.
  await evaluate(`document.querySelector('.maplibregl-canvas').dispatchEvent(new Event('webglcontextlost'))`);
  await ready('.infrastructure-map-search [role="alert"] button');
  await evaluate(`document.querySelector('.infrastructure-map-search [role="alert"] button').click()`);
  await ready('.infrastructure-world-map[data-ready="true"]');
  geocodePlaces=[{label:'QA footprint',latitude:52.52,longitude:13.405,zoom:18}];
  await search('QA footprint');await ready('[aria-label="Location results"] button');
  await evaluate(`document.querySelector('[aria-label="Location results"] button').click()`);await wait(2400);
  await click(720,450);await ready('.infrastructure-map-feature');
  assert.ok((await evaluate(`document.querySelector('.infrastructure-map-feature').textContent`)).includes('QA measured building'));
  await evaluate(`document.querySelector('.infrastructure-map-actions button:nth-child(4)').click()`);await wait(700);
  assert.ok(Math.abs((await camera()).center[0]-13.405)<.001,'Fit selection frames the selected footprint');
  await evaluate(`document.querySelector('.infrastructure-map-actions button:nth-child(2)').click()`);await wait(700);assert.ok((await camera()).pitch>40);
  await evaluate(`document.querySelector('.infrastructure-map-feature button').click()`);await wait(600);
  assert.equal(await evaluate(`document.querySelector('.scene-workbench').dataset.worldMap`),undefined,'Import returns to 3D');
  assert.equal(await evaluate(`document.querySelectorAll('[data-scene-object-id]').length`),2,'Measured footprint creates one editable mesh');
  assert.equal(await evaluate('window.originalSceneCanvas===document.querySelector(".scene-canvas canvas")'),true);
  await key(2);assert.equal(await evaluate(`document.querySelectorAll('[data-scene-object-id]').length`),1,'Import undo is atomic');
  await key(10);assert.equal(await evaluate(`document.querySelectorAll('[data-scene-object-id]').length`),2,'Import redo restores mesh');
  await evaluate(`document.querySelector('button[aria-label="World Map"]').click()`);await wait(300);
  for(const width of [1440,390]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await wait(500);
    if(width===390) { await evaluate(`document.querySelector('[aria-label="Collapse panel"]')?.click();document.querySelector('[aria-label="Collapse inspector"]')?.click()`);await wait(300); }
    const size=await evaluate('({width:document.querySelector(".maplibregl-canvas").clientWidth,overflow:document.documentElement.scrollWidth>innerWidth})');assert.equal(size.width,width);assert.equal(size.overflow,false);
    if(width===390) assert.equal(await evaluate(`(()=>{const a=document.querySelector('.infrastructure-map-search').getBoundingClientRect(),b=document.querySelector('.maplibregl-ctrl-top-right').getBoundingClientRect();return a.right<=b.left})()`),true,'Mobile metadata does not overlap navigation controls');
    const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out+'/'+width+'.png',Buffer.from(shot.data,'base64'));
  }
  console.log('PASS real map tiles/navigation, wheel, fullscreen, pitch, coordinates/search feedback, mocked geocoding, canvas/state retention, GeoJSON selection/fit, graphics retry, building mesh import, atomic undo/redo and responsive control spacing');
  assert.equal(errors.length,0,JSON.stringify(errors));console.log('Artifacts',out);await send('Browser.close');
}
run().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify({id:999999,method:'Browser.close'}));socket?.close();chrome.kill();});
