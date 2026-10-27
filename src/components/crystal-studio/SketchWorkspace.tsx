"use client";
import {useEffect,useMemo,useRef,useState,type RefObject,type PointerEvent as ReactPointerEvent} from 'react';
import {Pencil,Paintbrush,Eraser,MousePointer2,Shapes,Type,PaintBucket,ZoomIn,Minus,RectangleHorizontal,Circle,Palette,Highlighter,Lasso,Undo2,Redo2,Trash2,Plus,Eye,EyeOff,Lock,Unlock,ArrowUp,ArrowDown,Layers,RotateCw,Grid2X2,Focus,Home,Save,FolderOpen,Copy,X,ChevronDown,ChevronUp, type LucideIcon} from 'lucide-react';
import {createSketch,sketchSvg,hitSketchItem,translateItem,itemBounds,inPolygon,floodRegion,hexToHsv,hsvToHex,type SketchDocument,type SketchItem,type SketchKind,type SketchLayer,type SketchPoint} from '@/lib/sketch.mjs';
import {rasterSketch,sketchSheetSvg} from './sketch-export';
import type {FloorPlanObject,FloorPlanSettings} from './types';
import './sketch.css';
type Tool=SketchKind|'select'|'lasso'|'picker'|'zoom';
type View={zoom:number;panX:number;panY:number};
type Projects={ready:boolean;id:string;status:string;error:string;projects:{id:string;name:string}[];save:()=>Promise<string>;open:(id:string)=>Promise<void>;create:(copy?:boolean)=>void;reload:()=>Promise<void>};
type Props={doc:SketchDocument;onChange:(doc:SketchDocument)=>void;undo:()=>void;redo:()=>void;canUndo:boolean;canRedo:boolean;worldRef:RefObject<SVGGElement>;objects:FloorPlanObject[];settings:FloorPlanSettings;view:View;setView:(view:View|((view:View)=>View))=>void;project?:Projects;onExport?:(format:string)=>void;onActivate?:()=>void};
type Gesture={pointerId:number;start:SketchPoint;moved?:boolean;item?:SketchItem;move?:{ids:string[];original:SketchDocument};lasso?:SketchPoint[]};
const primary:[Tool|'shape',string,LucideIcon][]=[['select','Select / Move sketch',MousePointer2],['pencil','Pencil',Pencil],['brush','Brush',Paintbrush],['eraser','Eraser',Eraser],['shape','Shape tools',Shapes],['text','Sketch text',Type],['fill','Fill / Paint bucket',PaintBucket],['zoom','Zoom / Pan',ZoomIn]];
const secondary:[Tool,string,LucideIcon][]=[['line','Sketch line',Minus],['rectangle','Sketch rectangle',RectangleHorizontal],['ellipse','Sketch ellipse',Circle],['picker','Color Picker',Palette],['highlighter','Highlighter',Highlighter],['lasso','Freehand selection',Lasso]];
const colors=['#141414','#ffffff','#ff6b6b','#f59e0b','#facc15','#22c55e','#06b6d4','#4284ff','#a855f7','#ec4899'];
export function useSketchEditor(p:Props){
  const [active,setActive]=useState(false),[tool,setTool]=useState<Tool>('pencil'),[color,setColor]=useState('#141414'),[width,setWidth]=useState(3),[opacity,setOpacity]=useState(1),[secondaryOpen,setSecondaryOpen]=useState(false),[colorOpen,setColorOpen]=useState(false),[layersOpen,setLayersOpen]=useState(false),[controlsOpen,setControlsOpen]=useState(true),[projectsOpen,setProjectsOpen]=useState(false),[grid,setGrid]=useState(true),[rotation,setRotation]=useState(0),[snap,setSnap]=useState(false),[selected,setSelected]=useState<string[]>([]),[preview,setPreview]=useState<SketchDocument|null>(null),[message,setMessage]=useState(''),[fillBusy,setFillBusy]=useState(false),[offsets,setOffsets]=useState({left:12,right:12,bottom:160});
  const gesture=useRef<Gesture|null>(null),frame=useRef(0),previewRef=useRef<SketchDocument|null>(null),current=useRef(p);current.current=p;
  const doc=p.doc,layer=doc.layers.find(l=>l.id===doc.activeLayerId)!,sheet=doc.sheet;
  const layerEditable=layer.visible&&!layer.locked;
  useEffect(()=>{setSelected([]);setPreview(null);gesture.current=null;},[p.project?.id]);
  useEffect(()=>()=>cancelAnimationFrame(frame.current),[]);
  useEffect(()=>{
    const root=p.worldRef.current?.closest('.crystal-studio'),workspace=p.worldRef.current?.closest('section');if(!root||!workspace)return;
    const update=()=>{const r=workspace.getBoundingClientRect(),left=root.querySelector('.crystal-left-panel')?.getBoundingClientRect(),right=root.querySelector('.crystal-right-panel')?.getBoundingClientRect(),chat=root.querySelector('.studio-ai-floating-floorplan')?.getBoundingClientRect();setOffsets({left:left&&left.width>0?Math.max(12,left.right-r.left+12):12,right:right&&right.width>0?Math.max(12,r.right-right.left+12):12,bottom:chat&&chat.height>60?Math.max(70,r.bottom-chat.top+12):70});};
    update();const resize=new ResizeObserver(update);resize.observe(workspace);root.querySelectorAll('.crystal-left-panel,.crystal-right-panel,.studio-ai-floating-floorplan').forEach(node=>resize.observe(node));const mutation=new MutationObserver(update);mutation.observe(root,{childList:true});window.addEventListener('resize',update);return()=>{resize.disconnect();mutation.disconnect();window.removeEventListener('resize',update);};
  },[p.worldRef,active]);
  const commit=(next:SketchDocument)=>{try{p.onChange(next);setMessage('');}catch(error){setMessage(error instanceof Error?error.message:'Drawing edit failed.');}};
  const editLayer=(patch:Partial<SketchLayer>)=>commit({...doc,layers:doc.layers.map(l=>l.id===layer.id?{...l,...patch}:l)});
  const editSelected=(patch:Partial<SketchItem>)=>{if(!layerEditable)return;editLayer({items:layer.items.map(item=>selected.includes(item.id)?{...item,...patch}:item)});};
  const changeColor=(next:string)=>{setColor(next);if(selected.length)editSelected({color:next});};
  const activate=(next:Tool)=>{gesture.current=null;setPreview(null);setTool(next);setActive(true);p.onActivate?.();if(next==='picker')setColorOpen(true);if(next!=='select'&&next!=='lasso')setSelected([]);};
  const toggle=()=>{setActive(v=>!v);gesture.current=null;setPreview(null);p.onActivate?.();};
  const fit=()=>{const node=p.worldRef.current?.ownerSVGElement;if(!node)return;const z=Math.max(.01,Math.min(600,Math.min((node.clientWidth-offsets.left-offsets.right-(active?140:40))/sheet.width,(node.clientHeight-100-offsets.bottom)/sheet.height)));p.setView({zoom:z,panX:(offsets.left-offsets.right)/2-(sheet.x+sheet.width/2)*z,panY:(80-offsets.bottom)/2-(sheet.y+sheet.height/2)*z});setRotation(0);};
  const point=(event:{clientX:number;clientY:number},useSnap=false)=>{const matrix=p.worldRef.current?.getScreenCTM();if(!matrix)throw Error('Sketch viewport is not ready.');const result=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());const step=p.settings.gridStepMm/1000;return{x:useSnap&&snap?Math.round(result.x/step)*step:result.x,y:useSnap&&snap?Math.round(result.y/step)*step:result.y};};
  const schedule=(next:SketchDocument)=>{previewRef.current=next;if(!frame.current)frame.current=requestAnimationFrame(()=>{frame.current=0;setPreview(previewRef.current);});};
  const withItem=(item:SketchItem)=>({...doc,layers:doc.layers.map(l=>l.id===layer.id?{...l,items:[...l.items,item]}:l)});
  const sample=async(at:SketchPoint,picker:boolean)=>{
    if(fillBusy)return;const original=doc,projectId=p.project?.id;setFillBusy(true);
    try{
      const scale=Math.min(128,1536/Math.max(sheet.width,sheet.height)),w=Math.max(1,Math.round(sheet.width*scale)),h=Math.max(1,Math.round(sheet.height*scale));
      const{context}=await rasterSketch(sketchSheetSvg(p.objects,p.settings,doc),w,h);
      if(current.current.doc!==original||current.current.project?.id!==projectId)throw Error('The drawing changed. Please try again.');
      const x=Math.floor((at.x-sheet.x)/sheet.width*w),y=Math.floor((at.y-sheet.y)/sheet.height*h);if(x<0||y<0||x>=w||y>=h)return;
      if(picker){const rgba=context.getImageData(x,y,1,1).data;changeColor('#'+Array.from(rgba.slice(0,3)).map(c=>c.toString(16).padStart(2,'0')).join(''));setColorOpen(true);setTool('pencil');return;}
      const runs=floodRegion(context.getImageData(0,0,w,h),x,y).map(r=>({x:sheet.x+r.x/w*sheet.width,y:sheet.y+r.y/h*sheet.height,width:r.width/w*sheet.width,height:r.height/h*sheet.height}));
      if(runs.length)commit(withItem({id:crypto.randomUUID(),kind:'fill',points:[at],color,width:width/100,opacity,runs}));
    }catch(error){setMessage(error instanceof Error?error.message:'Fill failed.');}finally{setFillBusy(false);}
  };
  const down=(event:ReactPointerEvent<SVGRectElement>)=>{
    if(event.button===1||event.shiftKey)return;
    event.stopPropagation();event.preventDefault();event.currentTarget.ownerSVGElement?.focus();
    if(event.button!==0||!event.isPrimary||fillBusy)return;
    if(p.project&&!p.project.ready){setMessage('Wait for this project to finish opening.');return;}
    const at=point(event,['line','rectangle','ellipse','text'].includes(tool));
    if(tool==='zoom'){gesture.current={pointerId:event.pointerId,start:{x:event.clientX,y:event.clientY},move:{ids:[],original:doc}};event.currentTarget.setPointerCapture(event.pointerId);return;}
    if(!layerEditable){setMessage('Choose an unlocked, visible layer to draw or edit.');return;}
    if(tool==='fill'||tool==='picker'){void sample(at,tool==='picker');return;}
    if(tool==='select'){
      const hit=[...doc.layers].reverse().filter(l=>l.visible&&!l.locked).flatMap(l=>[...l.items].reverse().map(item=>({item,layer:l}))).find(({item})=>item.kind!=='eraser'&&hitSketchItem(item,at,6/p.view.zoom));
      if(!hit){setSelected([]);return;}
      const ids=selected.includes(hit.item.id)?selected:[hit.item.id];setSelected(ids);if(hit.layer.id!==layer.id)commit({...doc,activeLayerId:hit.layer.id});
      gesture.current={pointerId:event.pointerId,start:at,move:{ids,original:{...doc,activeLayerId:hit.layer.id}}};
    }else if(tool==='lasso'){setSelected([]);gesture.current={pointerId:event.pointerId,start:at,lasso:[at]};}
    else if(tool==='text'){
      const text=window.prompt('Sketch text','Note')?.trim();if(text)commit(withItem({id:crypto.randomUUID(),kind:'text',points:[at],text:text.slice(0,2000),color,width:width/100,opacity}));return;
    }else{
      const pressure=event.pointerType==='pen'?Math.max(.2,event.pressure):1;
      const item:SketchItem={id:crypto.randomUUID(),kind:tool,points:[at],color,width:width/100*(tool==='highlighter'?5:tool==='brush'?1.6:tool==='eraser'?3:1)*pressure,opacity:tool==='highlighter'?opacity*.28:opacity};
      gesture.current={pointerId:event.pointerId,start:at,item};schedule(withItem(item));
    }
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move=(event:ReactPointerEvent<SVGRectElement>)=>{
    const g=gesture.current;if(!g||g.pointerId!==event.pointerId)return;event.stopPropagation();
    if(tool==='zoom'){const dx=event.clientX-g.start.x,dy=event.clientY-g.start.y;if(Math.hypot(dx,dy)>2)g.moved=true;p.setView(v=>({...v,panX:v.panX+dx,panY:v.panY+dy}));g.start={x:event.clientX,y:event.clientY};return;}
    const at=point(event,['line','rectangle','ellipse'].includes(tool));
    if(g.move){const dx=at.x-g.start.x,dy=at.y-g.start.y;schedule({...g.move.original,layers:g.move.original.layers.map(l=>({...l,items:l.items.map(item=>g.move!.ids.includes(item.id)?translateItem(item,dx,dy):item)}))});}
    else if(g.lasso){g.lasso.push(at);setMessage(`Selecting ${g.lasso.length} points…`);}
    else if(g.item){
      const straight=['line','rectangle','ellipse'].includes(g.item.kind);let points:SketchPoint[];
      if(straight)points=[g.start,at];else{const samples=event.nativeEvent.getCoalescedEvents?.()||[event.nativeEvent];points=[...g.item.points];for(const sample of samples.length?samples:[event.nativeEvent]){const q=point(sample),last=points.at(-1)!;if(Math.hypot(q.x-last.x,q.y-last.y)*p.view.zoom>=.7)points.push(q);}}
      g.item={...g.item,points};schedule(withItem(g.item));
    }
  };
  const cancel=()=>{gesture.current=null;cancelAnimationFrame(frame.current);frame.current=0;setPreview(null);previewRef.current=null;};
  const up=(event:ReactPointerEvent<SVGRectElement>)=>{
    const g=gesture.current;if(!g||g.pointerId!==event.pointerId)return;event.stopPropagation();
    if(tool==='zoom'&&!g.moved)p.setView(v=>({...v,zoom:Math.min(600,v.zoom*1.25)}));
    if(g.item)commit(withItem(g.item));else if(g.move&&tool!=='zoom'&&previewRef.current)commit(previewRef.current);
    else if(g.lasso){setSelected(layer.items.filter(item=>item.points.some(q=>inPolygon(q,g.lasso!))).map(item=>item.id));setTool('select');setMessage('Sketch selection ready. Drag a selected stroke to move it.');}
    cancel();if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const removeSelected=()=>{if(!layerEditable)return;editLayer({items:layer.items.filter(item=>!selected.includes(item.id))});setSelected([]);};
  useEffect(()=>{
    if(!active)return;const handler=(event:KeyboardEvent)=>{
      if((event.target as HTMLElement).closest('input,textarea,select,[contenteditable=true]'))return;
      if((event.ctrlKey||event.metaKey)&&['z','y'].includes(event.key.toLowerCase())){event.preventDefault();event.stopImmediatePropagation();cancel();if(event.shiftKey||event.key.toLowerCase()==='y')p.redo();else p.undo();}
      else if(['Delete','Backspace'].includes(event.key)){event.preventDefault();event.stopImmediatePropagation();removeSelected();}
      else if(event.key==='Escape'){cancel();setSelected([]);}
    };window.addEventListener('keydown',handler,true);return()=>window.removeEventListener('keydown',handler,true);
  });
  const displayed=preview||doc,rendered=useMemo(()=>sketchSvg(displayed),[displayed]);
  const overlay=<g data-sketch-overlay="true" style={{isolation:'isolate'}}>
    <g pointerEvents="none" dangerouslySetInnerHTML={{__html:rendered}}/>
    {active&&<rect data-sketch-input="true" {...sheet} fill="transparent" style={{cursor:tool==='select'?'move':tool==='zoom'?'grab':'crosshair'}} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel} onLostPointerCapture={()=>{if(gesture.current)cancel();}}/>}
    {active&&displayed.layers.flatMap(l=>l.visible?l.items.filter(item=>selected.includes(item.id)).map(item=>{const b=itemBounds(item);return <rect key={item.id} {...b} fill="none" stroke="var(--studio-accent)" strokeWidth={1.5/p.view.zoom} strokeDasharray={`${4/p.view.zoom} ${3/p.view.zoom}`} pointerEvents="none"/>;}):[])}
    {active&&gesture.current?.lasso&&<polyline points={gesture.current.lasso.map(q=>`${q.x},${q.y}`).join(' ')} fill="none" stroke="var(--studio-accent)" strokeWidth={1.5/p.view.zoom} strokeDasharray={`${4/p.view.zoom} ${3/p.view.zoom}`} pointerEvents="none"/>}
  </g>;
  const attempt=(fn:()=>void|Promise<unknown>)=>{try{const result=fn();if(result instanceof Promise)void result.catch(error=>setMessage(error instanceof Error?error.message:'Action failed.'));}catch(error){setMessage(error instanceof Error?error.message:'Action failed.');}};
  const iconButton=(label:string,Icon:LucideIcon,fn:()=>void,disabled=false)=><button type="button" title={label} aria-label={label} disabled={disabled} onClick={fn}><Icon size={18}/></button>;
  const toolButton=([id,label,Icon]:[Tool|'shape',string,LucideIcon])=><button key={id} type="button" className="sketch-tool" title={label} aria-label={label} aria-pressed={id==='shape'?secondaryOpen:tool===id} onClick={()=>id==='shape'?setSecondaryOpen(v=>!v):activate(id)}><span><Icon size={19}/></span></button>;
  const changeLayer=(next:SketchLayer[])=>{commit({...doc,layers:next,activeLayerId:next.some(l=>l.id===layer.id)?layer.id:next.at(-1)!.id});setSelected([]);};
  const shiftLayer=(direction:number)=>{const index=doc.layers.indexOf(layer),next=[...doc.layers],target=index+direction;if(target<0||target>=next.length)return;[next[index],next[target]]=[next[target],next[index]];changeLayer(next);};
  const selectedItem=layer.items.find(item=>selected.includes(item.id));
  const panels=<div className="sketch-ui" style={{left:offsets.left,right:offsets.right,bottom:offsets.bottom}}>
    <div className="sketch-project-strip">
      {iconButton('Save Sketch project',Save,()=>attempt(()=>p.project?.save()),!p.project?.ready)}
      {iconButton('Sketch projects',FolderOpen,()=>setProjectsOpen(v=>!v))}
      <span role="status">{p.project?.status||'Sketch Studio'}</span>
      {p.project?.error&&<details><summary>Save needs attention</summary><p role="alert">{p.project.error}</p><button onClick={()=>attempt(()=>p.project?.save())}>Retry save</button><button onClick={()=>attempt(()=>p.project?.reload())}>Reload cloud</button><button onClick={()=>attempt(()=>p.project?.create(true))}>Save a copy</button></details>}
      {projectsOpen&&<section className="sketch-project-menu" aria-label="Sketch projects"><button onClick={()=>attempt(()=>{p.project?.create();setProjectsOpen(false);})}>New sketch project</button><button onClick={()=>attempt(()=>{p.project?.create(true);setProjectsOpen(false);})}>Save a copy</button>{p.project?.projects.map(project=><button key={project.id} onClick={()=>attempt(async()=>{await p.project?.open(project.id);setProjectsOpen(false);})}>{project.name}{project.id===p.project?.id?' ✓':''}</button>)}</section>}
    </div>
    {active&&<>
      <div role="toolbar" aria-label="Sketch drawing tools" className="sketch-primary sketch-tool-frame">{primary.map(toolButton)}</div>
      {secondaryOpen&&<div role="toolbar" aria-label="Secondary sketch tools" className="sketch-secondary sketch-tool-frame">{secondary.map(toolButton)}</div>}
      <section className={`sketch-settings sketch-panel ${secondaryOpen?'with-secondary':''}`} aria-label="Drawing controls">
        <header><strong>{tool==='brush'?'Paint':tool==='select'?'Selection':'Sketch Drawing'}</strong>{iconButton(controlsOpen?'Collapse drawing controls':'Expand drawing controls',controlsOpen?ChevronUp:ChevronDown,()=>setControlsOpen(v=>!v))}</header>
        {controlsOpen&&<><label>Brush size <output>{width}px</output><input aria-label="Brush size" type="range" min="1" max="80" value={width} onChange={e=>{setWidth(Number(e.target.value));if(selected.length)editSelected({width:Number(e.target.value)/100});}}/></label>
        <label>Opacity <output>{Math.round(opacity*100)}%</output><input aria-label="Drawing opacity" type="range" min="1" max="100" value={Math.round(opacity*100)} onChange={e=>{const value=Number(e.target.value)/100;setOpacity(value);if(selected.length)editSelected({opacity:value});}}/></label>
        <div className="sketch-action-row"><button aria-label="Open color selection" onClick={()=>setColorOpen(v=>!v)}><span className="sketch-color-preview" style={{background:color}}/>{color}</button><label><input type="checkbox" checked={snap} onChange={e=>setSnap(e.target.checked)}/>Snap</label></div>
        <div className="sketch-action-row">{iconButton('Undo drawing',Undo2,()=>{cancel();p.undo();},!p.canUndo)}{iconButton('Redo drawing',Redo2,()=>{cancel();p.redo();},!p.canRedo)}{iconButton('Sketch layers',Layers,()=>setLayersOpen(v=>!v))}{iconButton('Clear drawing',Trash2,()=>{if(window.confirm('Clear drawing from all unlocked sketch layers? CAD geometry will be preserved.')){commit({...doc,layers:doc.layers.map(l=>l.locked?l:{...l,items:[]})});setSelected([]);}},!doc.layers.some(l=>!l.locked&&l.items.length>0))}</div>
        {selected.length>0&&<div className="sketch-selection-controls"><small>{selected.length} selected</small>{iconButton('Delete selected strokes',Trash2,removeSelected,!layerEditable)}{iconButton('Duplicate selected strokes',Copy,()=>editLayer({items:[...layer.items,...layer.items.filter(item=>selected.includes(item.id)).map(item=>({...translateItem(item,.1,.1),id:crypto.randomUUID()}))]}),!layerEditable)}{selectedItem?.kind==='text'&&<input aria-label="Edit sketch text" value={selectedItem.text} maxLength={2000} onChange={e=>editSelected({text:e.target.value})}/>}</div>}
        <details><summary>Canvas dimensions</summary><label>Width (m)<input aria-label="Canvas width" type="number" min="0.1" max="50000" step="0.1" value={sheet.width} onChange={e=>{const w=Number(e.target.value);if(w>=.1&&w<=50000)commit({...doc,sheet:{...sheet,width:w}});}}/></label><label>Height (m)<input aria-label="Canvas height" type="number" min="0.1" max="50000" step="0.1" value={sheet.height} onChange={e=>{const h=Number(e.target.value);if(h>=.1&&h<=50000)commit({...doc,sheet:{...sheet,height:h}});}}/></label></details>
        <button className="sketch-cad-return" onClick={()=>{cancel();setActive(false);}}>Return to CAD Drafting</button></>}
      </section>
      {colorOpen&&<SketchColorPicker value={color} opacity={opacity} onChange={changeColor} onOpacity={next=>{setOpacity(next);if(selected.length)editSelected({opacity:next});}} onClose={()=>setColorOpen(false)}/>}
    </>}
    {active&&layersOpen&&<section className="sketch-layers sketch-panel" aria-label="Sketch layers"><header><strong>Layers</strong>{iconButton('Add sketch layer',Plus,()=>{const next={...createSketch().layers[0],id:crypto.randomUUID(),name:`Sketch ${doc.layers.length+1}`};commit({...doc,layers:[...doc.layers,next],activeLayerId:next.id});setSelected([]);},doc.layers.length>=32)}{iconButton('Close layers',X,()=>setLayersOpen(false))}</header>
      {[...doc.layers].reverse().map(l=><div key={l.id} className={`sketch-layer-row ${l.id===layer.id?'is-active':''}`}><button title="Select active layer" aria-label={`Select layer ${l.name}`} onClick={()=>{commit({...doc,activeLayerId:l.id});setSelected([]);}}>{l.name}</button>{iconButton(l.visible?`Hide ${l.name}`:`Show ${l.name}`,l.visible?Eye:EyeOff,()=>changeLayer(doc.layers.map(item=>item.id===l.id?{...item,visible:!item.visible}:item)))}{iconButton(l.locked?`Unlock ${l.name}`:`Lock ${l.name}`,l.locked?Lock:Unlock,()=>changeLayer(doc.layers.map(item=>item.id===l.id?{...item,locked:!item.locked}:item)))}</div>)}
      <label>Layer name<input aria-label="Layer name" value={layer.name} maxLength={120} onChange={e=>{if(e.target.value.trim())editLayer({name:e.target.value});}}/></label>
      <label>Layer opacity<output>{Math.round(layer.opacity*100)}%</output><input aria-label="Layer opacity" type="range" min="0" max="100" value={layer.opacity*100} onChange={e=>editLayer({opacity:Number(e.target.value)/100})}/></label>
      <label>Blend mode<select aria-label="Layer blend mode" value={layer.blend} onChange={e=>editLayer({blend:e.target.value as SketchLayer['blend']})}>{['normal','multiply','screen','overlay','darken','lighten'].map(v=><option key={v}>{v}</option>)}</select></label>
      <div className="sketch-action-row">{iconButton('Move layer up',ArrowUp,()=>shiftLayer(1),doc.layers.at(-1)?.id===layer.id)}{iconButton('Move layer down',ArrowDown,()=>shiftLayer(-1),doc.layers[0].id===layer.id)}{iconButton('Delete sketch layer',Trash2,()=>{if(window.confirm(`Delete layer “${layer.name}” and its strokes?`))changeLayer(doc.layers.filter(l=>l.id!==layer.id));},doc.layers.length===1||layer.locked)}</div>
    </section>}
    <section className="sketch-navigation sketch-panel" aria-label="Sketch canvas navigation"><output>{Math.round(p.view.zoom/72*100)}%</output><input aria-label="Sketch zoom" type="range" min="4" max="400" value={p.view.zoom} onChange={e=>p.setView(v=>({...v,zoom:Number(e.target.value)}))}/>{iconButton('Reset Sketch view',Home,()=>{p.setView({zoom:72,panX:0,panY:0});setRotation(0);})}{iconButton('Rotate canvas 15 degrees',RotateCw,()=>setRotation(v=>(v+15)%360))}{iconButton('Toggle Sketch grid',Grid2X2,()=>setGrid(v=>!v))}{iconButton('Fit Sketch canvas',Focus,fit)}<button onClick={()=>p.setView(v=>({...v,zoom:Math.min(600,v.zoom*1.25)}))} title="Zoom in" aria-label="Sketch zoom in"><ZoomIn size={18}/></button></section>
    {(message||fillBusy)&&<div role="status" className="sketch-message">{fillBusy?'Processing drawing…':message}{message&&<button aria-label="Dismiss drawing message" onClick={()=>setMessage('')}>×</button>}</div>}
  </div>;
  return{active,toggle,deactivate:()=>{cancel();setActive(false);},overlay,panels,grid,rotation,fit,drawing:Boolean(gesture.current)};
}

function SketchColorPicker({value,opacity,onChange,onOpacity,onClose}:{value:string;opacity:number;onChange:(color:string)=>void;onOpacity:(value:number)=>void;onClose:()=>void}){
  const [hex,setHex]=useState(value),[collapsed,setCollapsed]=useState(false),[position,setPosition]=useState({x:0,y:0});const drag=useRef<{x:number;y:number;startX:number;startY:number}|null>(null);
  const[h,s,v]=hexToHsv(value);useEffect(()=>setHex(value),[value]);
  const chooseHue=(event:ReactPointerEvent<HTMLDivElement>)=>{const r=event.currentTarget.getBoundingClientRect(),angle=Math.atan2(event.clientY-r.top-r.height/2,event.clientX-r.left-r.width/2)*180/Math.PI+90;onChange(hsvToHex(angle,s||1,v||1));};
  const chooseSquare=(event:ReactPointerEvent<HTMLDivElement>)=>{const r=event.currentTarget.getBoundingClientRect();onChange(hsvToHex(h,Math.max(0,Math.min(1,(event.clientX-r.left)/r.width)),1-Math.max(0,Math.min(1,(event.clientY-r.top)/r.height))));};
  return <section className="sketch-color-panel sketch-panel" aria-label="Floating color picker" style={{transform:`translate(${position.x}px,${position.y}px)`}}><header onPointerDown={e=>{if((e.target as HTMLElement).closest('button'))return;drag.current={x:e.clientX,y:e.clientY,startX:position.x,startY:position.y};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(drag.current)setPosition({x:Math.max(-160,Math.min(400,drag.current.startX+e.clientX-drag.current.x)),y:Math.max(-150,Math.min(300,drag.current.startY+e.clientY-drag.current.y))});}} onPointerUp={()=>{drag.current=null;}}><strong>Color</strong><button aria-label="Collapse color picker" onClick={()=>setCollapsed(x=>!x)}><ChevronDown size={16}/></button><button aria-label="Close color picker" onClick={onClose}><X size={16}/></button></header>
    {!collapsed&&<><div className="sketch-hue" role="slider" tabIndex={0} aria-label="Hue" aria-valuemin={0} aria-valuemax={360} aria-valuenow={Math.round(h)} onKeyDown={e=>{if(['ArrowLeft','ArrowDown','ArrowRight','ArrowUp'].includes(e.key)){e.preventDefault();onChange(hsvToHex(h+(['ArrowLeft','ArrowDown'].includes(e.key)?-2:2),s,v));}}} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);chooseHue(e);}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))chooseHue(e);}}><span className="sketch-hue-thumb" style={{transform:`rotate(${h}deg) translateY(-83px)`}}/><div className="sketch-saturation" style={{backgroundColor:hsvToHex(h,1,1)}} onPointerDown={e=>{e.stopPropagation();e.currentTarget.setPointerCapture(e.pointerId);chooseSquare(e);}} onPointerMove={e=>{e.stopPropagation();if(e.currentTarget.hasPointerCapture(e.pointerId))chooseSquare(e);}}><span style={{left:`${s*100}%`,top:`${(1-v)*100}%`}}/></div></div>
      <label>HEX<input aria-label="HEX color" value={hex} maxLength={7} onChange={e=>{setHex(e.target.value);if(/^#[0-9a-f]{6}$/i.test(e.target.value))onChange(e.target.value);}} onBlur={()=>setHex(value)}/><span className="sketch-color-preview" style={{background:value}}/></label>
      <label>Opacity<output>{Math.round(opacity*100)}%</output><input aria-label="Color opacity" type="range" min="1" max="100" value={opacity*100} onChange={e=>onOpacity(Number(e.target.value)/100)}/></label>
      <div className="sketch-swatches">{colors.map(c=><button key={c} aria-label={`Choose ${c}`} title={c} style={{background:c}} onClick={()=>onChange(c)}/>)}</div><label>Custom color<input aria-label="Custom drawing color" type="color" value={value} onChange={e=>onChange(e.target.value)}/></label>
    </>}
  </section>;
}
