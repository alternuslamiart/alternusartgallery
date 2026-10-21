"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createStudioVoice, type VoiceRecognition, type VoiceState } from "@/lib/studio-voice.mjs";

type Options={identity:string;getDraft:()=>string;onDraft:(text:string)=>void;onOpen:()=>void;onSend:()=>void};
const OFF:VoiceState={mode:"off",wakeEnabled:false,listening:false,error:null};

export function useStudioVoice(options:Options) {
  const callbacks=useRef(options);callbacks.current=options;
  const controller=useRef<ReturnType<typeof createStudioVoice>|null>(null);
  const [state,setState]=useState<VoiceState>(OFF);
  const [language,setLanguage]=useState("sq-AL");
  const stateRef=useRef(state);stateRef.current=state;
  const languageRef=useRef(language);languageRef.current=language;

  useEffect(()=>{
    let disposed=false;let sendTimer:ReturnType<typeof setTimeout>|undefined;
    const identity=options.identity;
    const speechWindow=window as typeof window & {SpeechRecognition?:new()=>VoiceRecognition;webkitSpeechRecognition?:new()=>VoiceRecognition};
    const voice=createStudioVoice({
      Recognition:speechWindow.SpeechRecognition??speechWindow.webkitSpeechRecognition??null,
      getDraft:()=>callbacks.current.identity===identity?callbacks.current.getDraft():"",
      onDraft:text=>{if(callbacks.current.identity===identity)callbacks.current.onDraft(text);},
      onOpen:()=>{if(callbacks.current.identity===identity)callbacks.current.onOpen();},
      onSend:()=>{
        // Let the controlled composer commit before invoking legacy local tools.
        clearTimeout(sendTimer);sendTimer=setTimeout(()=>{if(!disposed&&callbacks.current.identity===identity)callbacks.current.onSend();},0);
      },
      onState:next=>{if(!disposed&&callbacks.current.identity===identity){stateRef.current=next;setState(next);}},
    });
    controller.current=voice;setState(OFF);
    const visibility=()=>{if(document.hidden)voice.stop();};
    const key=(event:KeyboardEvent)=>{
      if(event.ctrlKey&&!event.altKey&&!event.metaKey&&event.key.toLowerCase()==="q"){
        event.preventDefault();event.stopImmediatePropagation();if(event.repeat||document.hidden)return;
        callbacks.current.onOpen();
        if(stateRef.current.mode==="dictation")voice.stop();else voice.start("dictation",languageRef.current);
      }else if(event.key==="Escape"&&stateRef.current.mode!=="off"){
        event.preventDefault();event.stopImmediatePropagation();voice.stop();
      }
    };
    window.addEventListener("keydown",key,true);document.addEventListener("visibilitychange",visibility);
    return ()=>{disposed=true;clearTimeout(sendTimer);voice.destroy();if(controller.current===voice)controller.current=null;window.removeEventListener("keydown",key,true);document.removeEventListener("visibilitychange",visibility);};
  },[options.identity]);

  const toggleDictation=useCallback(()=>{
    if(stateRef.current.mode==="dictation")controller.current?.stop();
    else controller.current?.start("dictation",languageRef.current);
  },[]);
  const toggleWake=useCallback(()=>{
    if(stateRef.current.wakeEnabled)controller.current?.stop();
    else controller.current?.start("wake",languageRef.current);
  },[]);
  const stop=useCallback(()=>controller.current?.stop(),[]);
  const changeLanguage=useCallback((value:string)=>{controller.current?.stop();setLanguage(value);},[]);
  return {...state,language,changeLanguage,toggleDictation,toggleWake,stop};
}
