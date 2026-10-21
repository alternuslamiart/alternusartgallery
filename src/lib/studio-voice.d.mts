export type VoiceState={mode:'off'|'wake'|'dictation';wakeEnabled:boolean;listening:boolean;error:string|null};
export type VoiceRecognition={
  lang:string;continuous:boolean;interimResults:boolean;maxAlternatives:number;
  onstart:(()=>void)|null;onend:(()=>void)|null;
  onerror:((event:{error:string})=>void)|null;
  onresult:((event:{resultIndex:number;results:ArrayLike<{isFinal:boolean;[index:number]:{transcript:string}}>})=>void)|null;
  start:()=>void;abort:()=>void;
};
export function createStudioVoice(options:{Recognition:(new()=>VoiceRecognition)|null;getDraft:()=>string;onDraft:(text:string)=>void;onOpen:()=>void;onSend:()=>void;onState:(state:VoiceState)=>void}):{
  start:(mode:'wake'|'dictation',language?:string)=>void;stop:()=>void;destroy:()=>void;
};
