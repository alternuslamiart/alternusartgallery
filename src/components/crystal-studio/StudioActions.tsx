"use client";
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { parseStudioCommand, validateStudioAction, type ActionResult, type StudioAction } from "@/lib/studio-actions.mjs";

export type StudioActionAdapter={
  name:string;
  execute:(action:StudioAction,signal:AbortSignal)=>Promise<string>;
  confirmation:(action:StudioAction)=>{key:string;message:string}|null;
};
type Registry={register:(adapter:StudioActionAdapter)=>()=>void;run:(text:string,signal:AbortSignal)=>Promise<ActionResult|null>};
const Context=createContext<Registry|null>(null);
export const nextStudioFrame=()=>new Promise<void>(resolve=>setTimeout(resolve,16));
export function navigateStudioRoute(href:string,push:(href:string)=>void){
  const target=new URL(href,location.origin);
  if(target.origin!==location.origin)throw new Error('Only same-origin studio navigation is supported.');
  const mapDocument=(path:string)=>path==='/infrastructure'||path==='/infrastructur';
  // Response CSP belongs to the document, not the SPA route. Crossing this
  // boundary must load the scoped map policy (or restore the non-map policy).
  if(mapDocument(location.pathname)!==mapDocument(target.pathname))location.assign(href);else push(href);
}
export async function verifyStudioState(check:()=>boolean,signal:AbortSignal,timeout=2500){
  const until=Date.now()+timeout;
  do{signal.throwIfAborted();await nextStudioFrame();if(check())return;}while(Date.now()<until);
  throw new Error('The studio did not confirm the change. Check the current scene and retry.');
}
export function StudioActionsProvider({children}:{children:ReactNode}){
  const active=useRef<StudioActionAdapter|null>(null),busy=useRef(false);
  const pending=useRef<{action:StudioAction;adapter:StudioActionAdapter;key:string;expires:number}|null>(null);
  const register=useCallback((adapter:StudioActionAdapter)=>{active.current=adapter;pending.current=null;return()=>{if(active.current===adapter){active.current=null;pending.current=null;}};},[]);
  const run=useCallback(async(text:string,signal:AbortSignal):Promise<ActionResult|null>=>{
    let action:StudioAction|null;
    try{action=parseStudioCommand(text);}catch(error){return{status:'error',message:error instanceof Error?error.message:'Clarify your command.'};}
    if(!action)return null;
    if(busy.current)return{status:'error',message:'Wait for the current studio action to finish.'};
    const adapter=active.current;
    if(!adapter)return{status:'error',message:'Studio controls are still loading or unavailable in this workspace.'};
    busy.current=true;
    try{
      signal.throwIfAborted();action=validateStudioAction(action);
      if(action.intent==='command.cancel'){pending.current=null;return{status:'completed',message:'Pending command canceled.'};}
      if(action.intent==='command.confirm'){
        const request=pending.current;pending.current=null;
        if(!request||request.adapter!==adapter||request.expires<Date.now()||adapter.confirmation(request.action)?.key!==request.key)throw new Error('No matching confirmation remains. Repeat the original command with the current selection.');
        action=request.action;
      }else{
        const confirmation=adapter.confirmation(action);
        if(confirmation){pending.current={action,adapter,key:confirmation.key,expires:Date.now()+30_000};return{status:'confirmation',message:`${confirmation.message} Say or type “Confirm” within 30 seconds, or “Cancel”.`};}
        pending.current=null;
      }
      const message=await adapter.execute(action,signal);
      signal.throwIfAborted();
      return{status:'completed',message};
    }catch(error){return{status:'error',message:signal.aborted?'Command canceled. Changes already applied remain in the studio.':error instanceof Error?error.message:'The studio action failed.'};}
    finally{busy.current=false;}
  },[]);
  return <Context.Provider value={{register,run}}>{children}</Context.Provider>;
}
export function useStudioActions(){const context=useContext(Context);if(!context)throw new Error('Studio action provider is missing.');return context;}
export function useStudioActionAdapter(adapter:StudioActionAdapter){
  const {register}=useStudioActions(),latest=useRef(adapter);latest.current=adapter;
  useEffect(()=>register({name:adapter.name,execute:(...args)=>latest.current.execute(...args),confirmation:action=>latest.current.confirmation(action)}),[register,adapter.name]);
}
