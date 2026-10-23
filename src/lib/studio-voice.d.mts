import type { MicrophoneSession } from './studio-microphone.mjs';
export type VoiceState={mode:'off'|'wake'|'dictation'|'conversation';wakeEnabled:boolean;listening:boolean;error:string|null;phase:'idle'|'requesting'|'preparing'|'recording'|'transcribing'|'processing'|'speaking';backend:'browser'|'server';interim:string};
export type VoiceRecognition={
  lang:string;continuous:boolean;interimResults:boolean;maxAlternatives:number;
  onstart:(()=>void)|null;onend:(()=>void)|null;
  onerror:((event:{error:string})=>void)|null;
  onresult:((event:{resultIndex:number;results:ArrayLike<{isFinal:boolean;[index:number]:{transcript:string}}>})=>void)|null;
  start:(audioTrack?:MediaStreamTrack)=>void;abort:()=>void;
};
export function createStudioVoice(options:{Recognition:(new()=>VoiceRecognition)|null;getDraft:()=>string;onDraft:(text:string)=>void;onOpen:()=>void;onSend:()=>void;onState:(state:VoiceState)=>void;openMicrophone?:()=>Promise<MicrophoneSession>;checkTranscription?:(signal:AbortSignal)=>Promise<void>;transcribe?:(blob:Blob,language:string,signal:AbortSignal)=>Promise<string>}):{
  start:(mode:'wake'|'dictation'|'conversation',language?:string)=>void;stop:()=>void;finish:()=>Promise<void>;destroy:()=>void;
};
