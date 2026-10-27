import test from 'node:test';
import assert from 'node:assert/strict';
import { createSketch, normalizeSketch, validateSketch, sketchSvg, sketchPath, floodRegion, hitSketchItem, translateItem, sketchHistory, hsvToHex, hexToHsv } from '../src/lib/sketch.mjs';
import {canonicalSketch,reconcileSketch} from '../src/lib/sketch-project.mjs';
const item = { id:'stroke', kind:'pencil', points:[{x:0,y:0},{x:1,y:1}], color:'#ff0000', width:.03, opacity:.6 };
test('sketch documents preserve editable layers and reject corrupt or unsafe payloads', () => {
  const doc=createSketch();doc.layers[0].items.push(item);assert.deepEqual(validateSketch(JSON.parse(JSON.stringify(doc))),doc);
  for(const change of [d=>d.layers[0].items[0].color='url(javascript:bad)',d=>d.layers[0].opacity=2,d=>d.sheet.width=-1,d=>d.layers[0].items[0].points[0].x=NaN,d=>d.layers.push({...d.layers[0]})]){const d=structuredClone(doc);change(d);assert.throws(()=>validateSketch(d));}
});
test('SVG retains colors, opacity, layer order, text escaping and chronological non-destructive erasing', () => {
  const d=createSketch();d.layers[0].items=[item,{...item,id:'erase',kind:'eraser'},{...item,id:'after',kind:'text',text:'<hello & world>'}];
  const svg=sketchSvg(d);assert.match(svg,/mask=/);assert.match(svg,/#ff0000/);assert.match(svg,/&lt;hello &amp; world&gt;/);assert.ok(svg.indexOf('mask=')<svg.indexOf('&lt;hello'));
  d.layers[0].visible=false;assert.equal(sketchSvg(d),'');
});
test('freehand smoothing, world hit testing and translation retain geometry',()=>{
  assert.match(sketchPath([{x:0,y:0},{x:1,y:1},{x:2,y:0}]),/Q/);
  assert.ok(hitSketchItem(item,{x:.5,y:.5},.05));assert.ok(!hitSketchItem(item,{x:3,y:3},.05));
  assert.deepEqual(translateItem(item,2,-1).points,[{x:2,y:-1},{x:3,y:0}]);assert.equal(item.points[0].x,0);
});
test('paint bucket fills a closed raster region without crossing its boundary',()=>{
  const width=7,height=7,data=new Uint8ClampedArray(width*height*4).fill(255);
  for(let y=1;y<6;y++)for(let x=1;x<6;x++)if(x===1||x===5||y===1||y===5){const i=(y*width+x)*4;data[i]=data[i+1]=data[i+2]=0;}
  const runs=floodRegion({width,height,data},3,3);assert.equal(runs.reduce((sum,r)=>sum+r.width*r.height,0),9);
  assert.ok(runs.every(r=>r.x>=2&&r.y>=2&&r.x+r.width<=5&&r.y+r.height<=5));
});
test('drawing undo/redo and new edit branches are independent of CAD data',()=>{
  const present=createSketch(),next=structuredClone(present);next.layers[0].items.push(item);
  let h=sketchHistory({past:[],present,future:[]},{type:'commit',next});h=sketchHistory(h,{type:'undo'});assert.equal(h.present.layers[0].items.length,0);
  h=sketchHistory(h,{type:'redo'});assert.equal(h.present.layers[0].items.length,1);h=sketchHistory(h,{type:'undo'});h=sketchHistory(h,{type:'commit',next:{...present,sheet:{...present.sheet,width:12}}});assert.equal(h.future.length,0);
});
test('custom color HSV conversions round-trip primary and arbitrary colors',()=>{for(const hex of ['#ff0000','#00ff00','#0000ff','#ffffff','#000000','#4a90d9'])assert.equal(hsvToHex(...hexToHsv(hex)),hex);});
test('JSONB key order cannot produce false conflicts or overwrite dirty recovery',()=>{
  const original={version:1,id:'sketch-test',name:'Plan',objects:[],settings:{unit:'mm',scale:100},sketch:createSketch()};
  const reordered=JSON.parse(JSON.stringify(original),(_key,value)=>value&&!Array.isArray(value)&&typeof value==='object'?Object.fromEntries(Object.entries(value).reverse()):value);
  assert.equal(canonicalSketch(original),canonicalSketch(reordered));assert.equal(reconcileSketch(original,1,canonicalSketch(original),reordered,1),'same');
  const edited={...original,name:'Edited'};assert.equal(reconcileSketch(edited,1,canonicalSketch(original),reordered,1),'keep');
  assert.throws(()=>reconcileSketch(edited,1,canonicalSketch(original),{...original,name:'Other tab'},2),/Cloud conflict/);
  assert.equal(reconcileSketch(original,1,canonicalSketch(original),{...original,name:'New cloud'},2),'adopt');
});
test('drawing coordinates normalize below drafting precision and tolerate JSONB floating-point round trips',()=>{
  const sketch=createSketch();sketch.layers[0].items=[{...item,points:[{x:3.2999998302783027,y:3.8499998019913524}]}];
  const normalized=normalizeSketch(sketch);assert.deepEqual(normalized.layers[0].items[0].points,[{x:3.29999983,y:3.8499998}]);assert.notDeepEqual(normalized,sketch);
  const doc={version:1,name:'Plan',id:'sketch-test',objects:[{x:1.2345678901234567}],sketch:normalized},roundTrip={...doc,objects:[{x:1.234567890123457}]};assert.equal(canonicalSketch(doc),canonicalSketch(roundTrip));
});
