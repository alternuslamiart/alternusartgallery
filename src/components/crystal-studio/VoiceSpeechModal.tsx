"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import "./voice-speech.css";

type Props={open:boolean;listening:boolean;busy:boolean;level:number;phase:string;feedback:string|null;error:string|null;onStart:()=>void;onStop:()=>void;onClose:()=>void};
export function VoiceSpeechModal(p:Props){
  const dialog=useRef<HTMLDialogElement>(null),previousFocus=useRef<HTMLElement|null>(null);
  useEffect(()=>{
    if(!p.open)return;
    previousFocus.current=document.activeElement as HTMLElement;
    const element=dialog.current;element?.showModal();
    return()=>{element?.close();previousFocus.current?.focus();};
  },[p.open]);
  if(!p.open)return null;
  const status=p.error??p.feedback??(p.busy?'Processing...':p.listening?'Listening…':null);
  const state=p.error?'error':p.busy?(p.phase==='executing'?'executing':'processing'):p.listening?'listening':p.feedback?'completed':'idle';
  return createPortal(<dialog ref={dialog} className="voice-speech-modal" data-state={state} aria-label="Voice Speech" aria-describedby={status?'voice-speech-feedback':undefined} onCancel={event=>{event.preventDefault();p.onClose();}}>
    <header><strong>Voice Speech</strong><button type="button" aria-label="Close Voice Speech" onClick={p.onClose}><X size={13}/></button></header>
    <div className="voice-speech-wave" aria-label={p.listening?'Active microphone':'Microphone inactive'} data-listening={p.listening} data-level={p.listening?p.level:0}>
      {Array.from({length:17},(_,i)=><i key={i} style={{height:`${p.listening?3+Math.min(1,p.level)*(8+(8-Math.abs(8-i))*3):[3,6,15,10,24,29,16,37,25,15,21,11,17,22,10,7,3][i]}px`}}/>)}
    </div>
    {status&&<output id="voice-speech-feedback" title={status} className={`voice-speech-feedback ${p.error?'is-error':''}`} role={p.error?'alert':'status'}>{status}</output>}
    <button type="button" className="voice-speech-start" disabled={p.busy} onClick={p.listening?p.onStop:p.onStart}>{p.busy?p.phase==='executing'?'Executing…':'Processing...':p.listening?'Stop':p.error?'Retry':'Start'}</button>
  </dialog>,document.body);
}
