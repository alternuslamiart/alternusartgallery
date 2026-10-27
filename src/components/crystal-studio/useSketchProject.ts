"use client";
import {useEffect,useRef,useState} from 'react';
import {parseFloorPlanRecovery,type SketchProject} from '@/lib/floor-plan-recovery.mjs';
import {createSketch,normalizeSketch} from '@/lib/sketch.mjs';
import {floorPlanPaper} from './floor-plan-export';
import {canonicalSketch,reconcileSketch} from '@/lib/sketch-project.mjs';
type Snapshot=SketchProject & {id:string};
type Entry={id:string;name:string;local?:boolean};
const hash=canonicalSketch;
const freshId=()=>`sketch-${crypto.randomUUID()}`;
const clean=(value:SketchProject):Snapshot=>{
  const sketch=value.sketch?normalizeSketch(value.sketch):createSketch();
  if(!value.sketch){const b=floorPlanPaper(value.objects,value.settings).bounds,x=Math.min(-1,b.minX-.5),y=Math.min(-1,b.minY-.5);sketch.sheet={x,y,width:Math.max(10,b.maxX+.5-x),height:Math.max(8,b.maxY+.5-y)};}
  return{version:1,id:value.id||freshId(),name:value.name,objects:value.objects,settings:value.settings,sketch};
};
async function request(path:string,init?:RequestInit){const response=await fetch(path,{cache:'no-store',...init});const body=await response.json();if(!response.ok)throw Object.assign(Error(typeof body.error==='string'?body.error:body.error?.message||'Sketch request failed.'),{status:response.status});return body;}
export function useSketchProject(identity:string,enabled:boolean,signedIn:boolean,value:Omit<SketchProject,'id'>,onLoad:(value:SketchProject)=>void){
  const [ready,setReady]=useState(false),[projectId,setProjectId]=useState(''),[status,setStatus]=useState('Loading drawing…'),[error,setError]=useState(''),[projects,setProjects]=useState<Entry[]>([]);
  const owner=useRef(identity);owner.current=identity;const loaded=useRef(''),callback=useRef(onLoad);callback.current=onLoad;
  const key=`casynus:floor-plan-recovery:${identity}`,revision=useRef(0),cloudHash=useRef(''),safe=useRef(false),busy=useRef(false),controller=useRef<AbortController|null>(null),readSequence=useRef(0);
  const current=useRef<Snapshot|null>(null),initial=useRef(value),saveRef=useRef<()=>Promise<string>>();
  if(ready&&loaded.current===identity&&projectId)current.current={...value,id:projectId};
  const persist=()=>{
    if(loaded.current!==identity||owner.current!==identity||!current.current)throw Error('Wait for this project to finish opening.');
    const raw=JSON.stringify({...current.current,revision:revision.current,cloudHash:cloudHash.current});parseFloorPlanRecovery(raw);
    localStorage.setItem(`${key}:project:${current.current.id}`,raw);localStorage.setItem(key,raw);
    if(localStorage.getItem(key)!==raw)throw Error('Browser recovery could not be confirmed. Export JSON before leaving.');
  };
  const list=async()=>{
    const local:Entry[]=[];
    for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith(`${key}:project:`)){try{const d=parseFloorPlanRecovery(localStorage.getItem(k)!);if(d.id)local.push({id:d.id,name:d.name,local:true});}catch{/* Preserve invalid records for recovery. */}}}
    if(owner.current!==identity)return;
    if(signedIn){try{const data=await request('/api/sketch-projects',{signal:controller.current?.signal});if(owner.current!==identity)return;setProjects([...data.projects,...local.filter(l=>!data.projects.some((p:Entry)=>p.id===l.id))]);return;}catch{/* Local project list remains usable offline. */}}
    setProjects(local);
  };
  const adopt=(doc:Snapshot,rev:number,ack:string)=>{current.current=doc;revision.current=rev;cloudHash.current=ack;setProjectId(doc.id);callback.current(doc);};
  const verify=async()=>{
    const doc=current.current;if(!doc||owner.current!==identity)return;const sequence=++readSequence.current;safe.current=false;
    try{
      const result=await request(`/api/sketch-projects?id=${encodeURIComponent(doc.id)}`,{signal:controller.current?.signal});if(owner.current!==identity||current.current?.id!==doc.id||sequence!==readSequence.current)return;
      const cloud=clean(parseFloorPlanRecovery(JSON.stringify(result.document))),remoteHash=hash(cloud),local=current.current;
      const decision=reconcileSketch(local,revision.current,cloudHash.current,cloud,result.revision);
      if(decision==='same'){revision.current=result.revision;cloudHash.current=remoteHash;}
      else if(decision==='adopt')adopt(cloud,result.revision,remoteHash);
      safe.current=true;
      setError('');persist();
    }catch(caught){if(owner.current!==identity||sequence!==readSequence.current)return;if(caught instanceof Error&&'status'in caught&&caught.status===404&&revision.current===0){safe.current=true;setError('');}else throw caught;}
  };
  const save=async()=>{
    persist();if(!signedIn){setStatus('Saved in this browser · sign in for cloud saving');void list();return 'Drawing saved in this browser.';}
    if(busy.current)throw Error('A save is in progress. Please wait.');busy.current=true;setStatus('Saving…');
    try{
      if(!safe.current)await verify();if(!safe.current||!current.current)throw Error('Cloud read must succeed before saving.');
      const sent=current.current,body=await request('/api/sketch-projects',{method:'PUT',signal:controller.current?.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({document:sent,revision:revision.current})});
      if(owner.current!==identity||current.current?.id!==sent.id)throw Error('Project changed during save.');
      if(body.saved!==true||body.id!==sent.id||body.revision!==revision.current+1)throw Error('The server did not confirm this save.');
      revision.current=body.revision;cloudHash.current=hash(sent);persist();setError('');setStatus('Saved to workspace');void list();return 'Sketch saved to your workspace.';
    }catch(caught){safe.current=false;if(owner.current===identity){setStatus('Local recovery retained');setError(caught instanceof Error?caught.message:'Sketch save failed.');}throw caught;}finally{
      busy.current=false;
      // Edits made while a slow save was in flight still need their own save,
      // even if their debounce timer expired before the first response arrived.
      if(owner.current===identity&&safe.current&&current.current&&hash(current.current)!==cloudHash.current){const documentId=current.current.id;setTimeout(()=>{if(owner.current===identity&&current.current?.id===documentId)void saveRef.current?.().catch(()=>{});},200);}
    }
  };saveRef.current=save;
  useEffect(()=>{
    if(!enabled||identity==='loading')return;loaded.current='';setReady(false);setError('');setProjects([]);safe.current=false;controller.current?.abort();controller.current=new AbortController();let cancelled=false;
    const run=async()=>{
      try{
        const raw=localStorage.getItem(key),stored=raw?JSON.parse(raw):null,doc=clean(raw?parseFloorPlanRecovery(raw):initial.current);
        if(cancelled)return;loaded.current=identity;revision.current=Number.isSafeInteger(stored?.revision)&&stored.revision>=0?stored.revision:0;cloudHash.current=typeof stored?.cloudHash==='string'?stored.cloudHash:'';
        adopt(doc,revision.current,cloudHash.current);setReady(true);setStatus('Browser recovery restored');
        if(signedIn){try{await verify();if(!cancelled)setStatus('Workspace connected');}catch(caught){if(!cancelled)setError(caught instanceof Error?caught.message:'Cloud read failed.');}}
        if(!cancelled)void list();
      }catch(caught){if(!cancelled){setError(caught instanceof Error?caught.message:'Recovery could not be opened.');setStatus('Recovery unavailable · export your existing file before replacing it');}}
    };void run();return()=>{cancelled=true;controller.current?.abort();};
    // Each identity gets an independent document and recovery namespace.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[identity,enabled,signedIn]);
  const serialized=hash({...value,id:projectId});
  useEffect(()=>{
    if(!ready||!enabled||loaded.current!==identity||owner.current!==identity)return;
    try{persist();}catch(caught){setError(caught instanceof Error?caught.message:'Browser recovery failed.');return;}
    if(signedIn&&hash(current.current!)!==cloudHash.current){const timer=setTimeout(()=>void saveRef.current?.().catch(()=>{}),1600);return()=>clearTimeout(timer);}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[serialized,ready,identity,enabled,signedIn]);
  useEffect(()=>{
    if(!ready||!enabled)return;const retain=()=>{try{persist();}catch{/* Explicit status already identifies storage problems. */}};window.addEventListener('pagehide',retain);return()=>window.removeEventListener('pagehide',retain);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[serialized,ready,identity,enabled]);
  const open=async(id:string)=>{
    if(busy.current)throw Error('Wait for the current save before changing projects.');persist();setError('');safe.current=false;
    const raw=localStorage.getItem(`${key}:project:${id}`);if(raw){const stored=JSON.parse(raw),doc=clean(parseFloorPlanRecovery(raw));adopt(doc,stored.revision||0,stored.cloudHash||'');}
    else{const result=await request(`/api/sketch-projects?id=${encodeURIComponent(id)}`,{signal:controller.current?.signal});if(owner.current!==identity)return;const doc=clean(parseFloorPlanRecovery(JSON.stringify(result.document)));adopt(doc,result.revision,hash(doc));}
    if(signedIn)await verify();persist();setStatus(signedIn?'Workspace project opened':'Local project opened');
  };
  const create=(copy=false)=>{
    if(busy.current)throw Error('Wait for the current save.');persist();const old=current.current!;
    const doc=copy?{...old,id:freshId(),name:`${old.name.slice(0,110)} copy`}:clean({...initial.current,id:freshId(),name:'Untitled project',objects:[],sketch:createSketch()});
    safe.current=false;adopt(doc,0,'');setError('');persist();void list();
  };
  const importProject=(input:SketchProject)=>{persist();const doc=clean({...input,id:freshId()});safe.current=false;adopt(doc,0,'');persist();void list();};
  const reload=async()=>{
    if(!current.current||busy.current)return;persist();if(!window.confirm('Reload the cloud version? Your current drawing will remain in a separate local recovery copy.'))return;
    const local=current.current,archive={...local,id:freshId(),name:`${local.name.slice(0,105)} recovery`};localStorage.setItem(`${key}:project:${archive.id}`,JSON.stringify({...archive,revision:0,cloudHash:''}));
    const result=await request(`/api/sketch-projects?id=${encodeURIComponent(local.id)}`,{signal:controller.current?.signal});if(owner.current!==identity)return;const doc=clean(parseFloorPlanRecovery(JSON.stringify(result.document)));adopt(doc,result.revision,hash(doc));safe.current=true;setError('');persist();void list();
  };
  return{ready,id:projectId,status,error,projects,save,open,create,importProject,reload,persist};
}
