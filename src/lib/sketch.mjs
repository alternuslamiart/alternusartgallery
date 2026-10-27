export const MAX_SKETCH_BYTES = 3_000_000;
const kinds = ['pencil','brush','eraser','highlighter','line','rectangle','ellipse','text','fill'];
const blends = ['normal','multiply','screen','overlay','darken','lighten'];
const number = n => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= 10000;
const unit = n => number(n) && n >= 0 && n <= 1;
const color = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
const id = s => typeof s === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(s);
export function createSketch() { return {version:1,sheet:{x:-1,y:-1,width:10,height:8},activeLayerId:'layer-1',layers:[{id:'layer-1',name:'Sketch 1',visible:true,locked:false,opacity:1,blend:'normal',items:[]}]}; }
export function normalizeSketch(doc){validateSketch(doc);return JSON.parse(JSON.stringify(doc,(_key,value)=>typeof value==='number'?Number(value.toFixed(8)):value));}
export function validateSketch(doc) {
  if (!doc || doc.version !== 1 || !doc.sheet || ![doc.sheet.x,doc.sheet.y,doc.sheet.width,doc.sheet.height].every(n=>typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=50000) || doc.sheet.width<.1 || doc.sheet.height<.1 || !Array.isArray(doc.layers) || !doc.layers.length || doc.layers.length>32) throw Error('Invalid sketch canvas or layers.');
  const ids=new Set();let points=0,items=0;
  for(const layer of doc.layers){
    if(!id(layer.id)||ids.has(layer.id)||typeof layer.name!=='string'||!layer.name.trim()||layer.name.length>120||typeof layer.visible!=='boolean'||typeof layer.locked!=='boolean'||!unit(layer.opacity)||!blends.includes(layer.blend)||!Array.isArray(layer.items))throw Error('Invalid sketch layer.');ids.add(layer.id);
    for(const item of layer.items){
      if(!id(item.id)||ids.has(item.id)||!kinds.includes(item.kind)||!color(item.color)||!number(item.width)||item.width<=0||item.width>10||!unit(item.opacity)||!Array.isArray(item.points)||!item.points.length||!item.points.every(p=>number(p.x)&&number(p.y)))throw Error('Invalid sketch stroke.');ids.add(item.id);points+=item.points.length;items++;
      if(item.kind==='text'&&(typeof item.text!=='string'||item.text.length>2000))throw Error('Invalid sketch text.');
      if(item.kind==='fill'&&(!Array.isArray(item.runs)||item.runs.length>20000||!item.runs.every(r=>[r.x,r.y,r.width,r.height].every(number)&&r.width>0&&r.height>0)))throw Error('Invalid sketch fill.');
    }
  }
  if(!doc.layers.some(l=>l.id===doc.activeLayerId)||points>150000||items>4000||JSON.stringify(doc).length>MAX_SKETCH_BYTES)throw Error('Sketch exceeds the supported document size.');
  return doc;
}
export function sketchHistory(state,action){
  if(action.type==='replace')return{past:[],present:action.next,future:[]};
  if(action.type==='undo')return state.past.length?{past:state.past.slice(0,-1),present:state.past.at(-1),future:[state.present,...state.future].slice(0,50)}:state;
  if(action.type==='redo')return state.future.length?{past:[...state.past,state.present].slice(-50),present:state.future[0],future:state.future.slice(1)}:state;
  validateSketch(action.next);return JSON.stringify(action.next)===JSON.stringify(state.present)?state:{past:[...state.past,state.present].slice(-50),present:action.next,future:[]};
}
const esc = s => String(s).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
const n = v => Number(v.toFixed(5));
export function sketchPath(points){
  const a=points[0];if(!a)return '';if(points.length===1)return `M${n(a.x)} ${n(a.y)}l0.0001 0`;
  if(points.length===2)return `M${n(a.x)} ${n(a.y)}L${n(points[1].x)} ${n(points[1].y)}`;
  let path=`M${n(a.x)} ${n(a.y)}`;
  for(let i=1;i<points.length-1;i++){const p=points[i],q=points[i+1];path+=`Q${n(p.x)} ${n(p.y)} ${n((p.x+q.x)/2)} ${n((p.y+q.y)/2)}`;}
  const b=points.at(-1);return `${path}L${n(b.x)} ${n(b.y)}`;
}
export function itemSvg(item, overrideColor){
  const a=item.points[0],b=item.points.at(-1),c=overrideColor||item.color;
  const style=`stroke="${c}" stroke-width="${item.width}" opacity="${item.opacity}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  if(item.kind==='fill')return `<path d="${item.runs.map(r=>`M${n(r.x)} ${n(r.y)}h${n(r.width)}v${n(r.height)}h${n(-r.width)}Z`).join('')}" fill="${c}" opacity="${item.opacity}"/>`;
  if(item.kind==='text')return `<text x="${a.x}" y="${a.y}" style="font:${Math.max(.12,item.width*6)}px Arial;fill:${c};stroke:none;text-anchor:start" opacity="${item.opacity}">${esc(item.text)}</text>`;
  if(item.kind==='rectangle')return `<rect x="${Math.min(a.x,b.x)}" y="${Math.min(a.y,b.y)}" width="${Math.abs(b.x-a.x)}" height="${Math.abs(b.y-a.y)}" ${style}/>`;
  if(item.kind==='ellipse')return `<ellipse cx="${(a.x+b.x)/2}" cy="${(a.y+b.y)/2}" rx="${Math.abs(b.x-a.x)/2}" ry="${Math.abs(b.y-a.y)/2}" ${style}/>`;
  return `<path d="${item.kind==='line'?`M${a.x} ${a.y}L${b.x} ${b.y}`:sketchPath(item.points)}" ${style}/>`;
}
export function sketchSvg(doc,prefix='sketch'){
  return doc.layers.filter(l=>l.visible).map(layer=>{
    let content='',defs='';
    for(const item of layer.items){
      if(item.kind==='eraser'){
        const mask=`${prefix}-${layer.id}-${item.id}`;const s=doc.sheet;
        defs+=`<mask id="${mask}" maskUnits="userSpaceOnUse" x="${s.x}" y="${s.y}" width="${s.width}" height="${s.height}"><rect x="${s.x}" y="${s.y}" width="${s.width}" height="${s.height}" fill="white"/>${itemSvg(item,'black')}</mask>`;
        content=`<g mask="url(#${mask})">${content}</g>`;
      }else content+=`<g data-sketch-item="${item.id}">${itemSvg(item)}</g>`;
    }
    return `<g data-sketch-layer="${layer.id}" opacity="${layer.opacity}" style="mix-blend-mode:${layer.blend}"><defs>${defs}</defs>${content}</g>`;
  }).join('');
}
export function translateItem(item,dx,dy){return{...item,points:item.points.map(p=>({...p,x:p.x+dx,y:p.y+dy})),...(item.runs?{runs:item.runs.map(r=>({...r,x:r.x+dx,y:r.y+dy}))}:{})};}
export function itemBounds(item){
  const points=item.kind==='fill'?item.runs.flatMap(r=>[{x:r.x,y:r.y},{x:r.x+r.width,y:r.y+r.height}]):item.points;
  const b=points.reduce((b,p)=>({minX:Math.min(b.minX,p.x),maxX:Math.max(b.maxX,p.x),minY:Math.min(b.minY,p.y),maxY:Math.max(b.maxY,p.y)}),{minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity}),pad=item.width/2;
  return{x:b.minX-pad,y:b.minY-pad,width:b.maxX-b.minX+pad*2+(item.kind==='text'?(item.text?.length||1)*Math.max(.12,item.width*6)*.6:0),height:b.maxY-b.minY+pad*2+(item.kind==='text'?Math.max(.12,item.width*6):0)};
}
export function hitSketchItem(item,p,tolerance){
  const a=item.points[0],b=item.points.at(-1),t=tolerance+item.width/2;
  if(item.kind==='fill')return item.runs.some(r=>p.x>=r.x&&p.x<=r.x+r.width&&p.y>=r.y&&p.y<=r.y+r.height);
  if(item.kind==='rectangle'||item.kind==='text'){const r=itemBounds(item);return p.x>=r.x-t&&p.x<=r.x+r.width+t&&p.y>=r.y-t&&p.y<=r.y+r.height+t;}
  if(item.kind==='ellipse'){const rx=Math.abs(a.x-b.x)/2,ry=Math.abs(a.y-b.y)/2;return rx>0&&ry>0&&((p.x-(a.x+b.x)/2)/(rx+t))**2+((p.y-(a.y+b.y)/2)/(ry+t))**2<=1;}
  return item.points.some((q,i)=>{const r=item.points[Math.min(i+1,item.points.length-1)],dx=r.x-q.x,dy=r.y-q.y,v=Math.max(0,Math.min(1,((p.x-q.x)*dx+(p.y-q.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-q.x-v*dx,p.y-q.y-v*dy)<=t;});
}
export function inPolygon(point,polygon){let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a.y>point.y)!==(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside;}
// Scanline flood fill with compact vertically merged runs. Never mutates source pixels.
export function floodRegion(image,x,y,tolerance=28){
  const{width,height,data}=image;x=Math.floor(x);y=Math.floor(y);if(x<0||y<0||x>=width||y>=height)return[];
  const seed=(y*width+x)*4,target=Array.from(data.slice(seed,seed+4)),seen=new Uint8Array(width*height),queue=[y*width+x],runs=[];
  const match=(px,py)=>{const i=py*width+px;if(px<0||px>=width||py<0||py>=height||seen[i])return false;const k=i*4;return target.every((v,c)=>Math.abs(v-data[k+c])<=tolerance);};
  while(queue.length){const q=queue.pop(),py=Math.floor(q/width),px=q%width;if(!match(px,py))continue;let left=px,right=px;while(match(left-1,py))left--;while(match(right+1,py))right++;
    for(let k=left;k<=right;k++){seen[py*width+k]=1;if(match(k,py-1))queue.push((py-1)*width+k);if(match(k,py+1))queue.push((py+1)*width+k);}runs.push({x:left,y:py,width:right-left+1,height:1});
    if(runs.length>20000)throw Error('This fill is too detailed. Use a smaller canvas or a simpler boundary.');
  }
  runs.sort((a,b)=>a.y-b.y||a.x-b.x);const merged=[],ends=new Map();for(const r of runs){const key=`${r.x}:${r.width}`,last=ends.get(key);if(last&&last.y+last.height===r.y)last.height++;else{merged.push(r);ends.set(key,r);}}return merged;
}
export function hsvToHex(h,s,v){h=((h%360)+360)%360;const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c,parts=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return '#'+parts.map(p=>Math.round((p+m)*255).toString(16).padStart(2,'0')).join('');}
export function hexToHsv(hex){const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255),max=Math.max(...rgb),min=Math.min(...rgb),d=max-min;let h=d===0?0:max===rgb[0]?60*((rgb[1]-rgb[2])/d%6):max===rgb[1]?60*((rgb[2]-rgb[0])/d+2):60*((rgb[0]-rgb[1])/d+4);if(h<0)h+=360;return[h,max?d/max:0,max];}
