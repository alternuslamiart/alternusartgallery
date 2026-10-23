"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createStudioVoice, type VoiceRecognition, type VoiceState } from "@/lib/studio-voice.mjs";
import { openStudioMicrophone } from "@/lib/studio-microphone.mjs";

type Options={identity:string;getDraft:()=>string;onDraft:(text:string)=>void;onOpen:()=>void;onSend:()=>Promise<string|void>;onCancel:()=>void;canConverse:boolean};
const OFF:VoiceState={mode:"off",wakeEnabled:false,listening:false,error:null,phase:"idle",backend:"browser",interim:""};

export function useStudioVoice(options:Options) {
  const callbacks=useRef(options);callbacks.current=options;
  const controller=useRef<ReturnType<typeof createStudioVoice>|null>(null);
  const [state,setState]=useState<VoiceState>(OFF), [level,setLevel]=useState(0), [conversation,setConversation]=useState(false);
  const [language,setLanguage]=useState("sq-AL");
  const stateRef=useRef(state);stateRef.current=state;
  const languageRef=useRef(language);languageRef.current=language;
  const session=useRef(0), conversationRef=useRef(false), cancelSpeech=useRef<(()=>void)|null>(null), stopSession=useRef<()=>void>(()=>{});

  useEffect(()=>{
    let disposed=false, sendTimer:ReturnType<typeof setTimeout>|undefined;
    const identity=options.identity;
    const valid=()=>!disposed&&callbacks.current.identity===identity;
    const update=(next:VoiceState)=>{if(valid()){stateRef.current=next;setState(next);}};
    const speechWindow=window as typeof window & {SpeechRecognition?:new()=>VoiceRecognition;webkitSpeechRecognition?:new()=>VoiceRecognition};
    const stop=()=>{
      session.current++;conversationRef.current=false;setConversation(false);
      if(stateRef.current.phase==="processing")callbacks.current.onCancel();
      clearTimeout(sendTimer);cancelSpeech.current?.();cancelSpeech.current=null;
      controller.current?.stop();setLevel(0);
    };
    stopSession.current=stop;
    const speak=(text:string)=>new Promise<void>((resolve,reject)=>{
      if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){reject(new Error("Spoken replies are unavailable in this browser. Use dictation and read the reply."));return;}
      const utterance=new SpeechSynthesisUtterance(text.slice(0,12_000));utterance.lang=languageRef.current;
      const voices=window.speechSynthesis.getVoices(),match=voices.find(v=>v.lang.toLowerCase()===languageRef.current.toLowerCase())??voices.find(v=>v.lang.split('-')[0]===languageRef.current.split('-')[0]);
      if(voices.length&&!match){reject(new Error(`No ${languageRef.current} speech voice is installed. Select a supported voice language; the AI reply remains in chat.`));return;}
      if(match)utterance.voice=match;
      const timeout=setTimeout(()=>{window.speechSynthesis.cancel();reject(new Error("Spoken reply timed out. The response remains in chat."));},120_000);
      const done=()=>{clearTimeout(timeout);cancelSpeech.current=null;};
      utterance.onend=()=>{done();resolve();};utterance.onerror=event=>{done();reject(new Error(`Speech playback failed (${event.error}). The response remains in chat.`));};
      cancelSpeech.current=()=>{done();window.speechSynthesis.cancel();resolve();};
      window.speechSynthesis.speak(utterance);
    });
    const voice=createStudioVoice({
      Recognition:speechWindow.SpeechRecognition??speechWindow.webkitSpeechRecognition??null,
      openMicrophone:()=>openStudioMicrophone({onLevel:value=>{if(valid())setLevel(value);},onFailure:message=>{if(valid()){stop();update({...OFF,error:message});}}}),
      checkTranscription:async signal=>{
        const response=await fetch('/api/studio-voice/transcribe',{signal:AbortSignal.any([signal,AbortSignal.timeout(10_000)]),cache:'no-store'});
        const data=await response.json();if(!response.ok)throw new Error(data.error??'Server transcription is unavailable.');
      },
      transcribe:async(blob,lang,signal)=>{
        const form=new FormData();form.set('file',blob,'voice');form.set('language',lang.split('-')[0]);
        const response=await fetch('/api/studio-voice/transcribe',{method:'POST',body:form,signal:AbortSignal.any([signal,AbortSignal.timeout(25_000)])});
        const data=await response.json();if(!response.ok)throw new Error(data.error??'Audio transcription failed.');
        if(typeof data.text!=='string')throw new Error('The transcription service returned no text.');return data.text;
      },
      getDraft:()=>valid()?callbacks.current.getDraft():"",
      onDraft:text=>{if(valid())callbacks.current.onDraft(text);},
      onOpen:()=>{if(valid())callbacks.current.onOpen();},
      onSend:()=>{
        clearTimeout(sendTimer);const token=session.current;
        sendTimer=setTimeout(()=>{void(async()=>{
          if(!valid()||session.current!==token)return;
          const conversational=conversationRef.current;
          if(conversational)update({...OFF,mode:'conversation',phase:'processing'});
          try {
            const response=await callbacks.current.onSend();
            if(!valid()||session.current!==token||!conversational)return;
            if(!response){stop();return;}
            update({...OFF,mode:'conversation',phase:'speaking'});await speak(response);
            if(valid()&&session.current===token&&conversationRef.current)voice.start('conversation',languageRef.current);
          }catch(error){if(valid()&&session.current===token){stop();update({...OFF,error:error instanceof Error?error.message:'Voice conversation failed. Try again.'});}}
        })();},0);
      },
      onState:next=>{if(valid()){
        update(next);
        if(next.error||(next.mode==='off'&&next.phase==='idle'&&conversationRef.current)){session.current++;conversationRef.current=false;setConversation(false);}
      }},
    });
    controller.current=voice;update(OFF);
    const visibility=()=>{if(document.hidden)stop();};
    const key=(event:KeyboardEvent)=>{
      if(event.ctrlKey&&!event.altKey&&!event.metaKey&&event.key.toLowerCase()==="q"){
        event.preventDefault();event.stopImmediatePropagation();if(event.repeat||document.hidden)return;
        callbacks.current.onOpen();
        if(stateRef.current.mode!=="off"||conversationRef.current){if(stateRef.current.backend==='server'&&stateRef.current.phase==='recording')void voice.finish();else stop();}
        else voice.start("dictation",languageRef.current);
      }else if(event.key==="Escape"&&(stateRef.current.mode!=="off"||conversationRef.current)){
        event.preventDefault();event.stopImmediatePropagation();stop();
      }
    };
    window.addEventListener("keydown",key,true);document.addEventListener("visibilitychange",visibility);
    return ()=>{stop();disposed=true;voice.destroy();if(controller.current===voice)controller.current=null;window.removeEventListener("keydown",key,true);document.removeEventListener("visibilitychange",visibility);};
  },[options.identity]);

  const toggleDictation=useCallback(()=>{
    if(stateRef.current.backend==='server'&&stateRef.current.phase==='recording'){void controller.current?.finish();return;}
    if(stateRef.current.mode!=="off"||conversationRef.current)stopSession.current();
    else controller.current?.start("dictation",languageRef.current);
  },[]);
  const toggleConversation=useCallback(()=>{
    if(conversationRef.current){stopSession.current();return;}
    if(!callbacks.current.canConverse){setState({...OFF,error:'Select an AI text provider such as Gemini, Groq, or You for voice conversation. Local scene tools remain available through dictation.'});return;}
    if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){setState({...OFF,error:'Voice conversation needs browser speech playback. You can still use microphone dictation.'});return;}
    stopSession.current();conversationRef.current=true;setConversation(true);controller.current?.start('conversation',languageRef.current);
  },[]);
  const stop=useCallback(()=>stopSession.current(),[]);
  const finish=useCallback(()=>{void controller.current?.finish();},[]);
  const changeLanguage=useCallback((value:string)=>{stopSession.current();setLanguage(value);},[]);
  return {...state,level,conversation,language,changeLanguage,toggleDictation,toggleConversation,stop,finish};
}
