// Browser speech stays separate from AI execution: only reviewed text or an
// explicit spoken Send command enters the existing studio submit pipeline.
const WAKE=/\b(?:hey|hej)\s*[,.:!]?\s*(?:casynus|casinus|kasynus|kasinus)\b[\s,.:!–-]*/i;
const SEND=/^(?:send|submit|d[eë]rgo)(?:\s+(?:it|request|k[eë]rkes[eë]n))?[.!?]*$/i;
const CANCEL=/^(?:cancel|stop|anulo|ndalo)[.!?]*$/i;
const ERRORS={
  'not-allowed':'Microphone permission was denied. Allow microphone access in your browser, then try again.',
  'service-not-allowed':'Speech recognition is unavailable in this browser or is disabled by its settings.',
  'audio-capture':'No microphone is available. Connect a microphone and try again.',
  'network':'The browser speech service could not connect. Check your connection and try again.',
  'language-not-supported':'This voice language is unavailable. Choose another language and try again.',
};

export function createStudioVoice({Recognition,getDraft,onDraft,onOpen,onSend,onState}) {
  let current=null,epoch=0,destroyed=false,wake=false,capturing=false,restarts=0,listening=false;
  let captureTimer=null,restartTimer=null,language='sq-AL';
  const emit=(mode,error=null)=>{if(!destroyed)onState({mode,wakeEnabled:wake,listening,error});};
  function clearTimers(){clearTimeout(captureTimer);clearTimeout(restartTimer);captureTimer=restartTimer=null;}
  function stop(error=null){
    epoch++;clearTimers();wake=false;capturing=false;listening=false;
    const old=current;current=null;try{old?.abort();}catch{/* Already stopped. */}
    emit('off',error);
  }
  function armTimeout(){
    clearTimeout(captureTimer);
    captureTimer=setTimeout(()=>{if(wake){capturing=false;emit('wake');}else stop();},30_000);
  }
  function capture(text){
    const task=text.trim();if(!task)return;
    if(CANCEL.test(task)){stop();return;}
    if(SEND.test(task)){
      if(getDraft().trim())onSend();
      clearTimeout(captureTimer);
      if(wake){capturing=false;emit('wake');}else stop();
      return;
    }
    onDraft([getDraft().trim(),task].filter(Boolean).join(' ').slice(0,12_000));
    armTimeout();
  }
  function launch(){
    const token=++epoch;
    try {
      const recognition=new Recognition();current=recognition;
      recognition.lang=language;recognition.continuous=true;recognition.interimResults=false;recognition.maxAlternatives=1;
      const valid=()=>!destroyed&&epoch===token&&current===recognition;
      recognition.onstart=()=>{if(valid()){listening=true;emit(capturing?'dictation':'wake');}};
      recognition.onresult=event=>{
        if(!valid())return;
        for(let i=event.resultIndex;i<event.results.length;i++){
          if(!valid())break;
          const result=event.results[i];if(!result.isFinal)continue;
          const text=result[0]?.transcript?.trim();if(!text)continue;restarts=0;
          if(!capturing){
            const match=WAKE.exec(text);if(!match)continue;
            capturing=true;onOpen();emit('dictation');armTimeout();
            capture(text.slice(match.index+match[0].length));
          }else capture(text.replace(WAKE,''));
        }
      };
      recognition.onerror=event=>{
        if(!valid()||event.error==='no-speech')return;
        stop(ERRORS[event.error]??`Voice input stopped (${event.error || 'unknown error'}). Try again.`);
      };
      recognition.onend=()=>{
        if(!valid())return;current=null;listening=false;
        if(!wake){stop();return;}
        if(++restarts>3){stop('Voice listening stopped repeatedly. Click Hey Casynus to enable it again.');return;}
        emit(capturing?'dictation':'wake');
        restartTimer=setTimeout(()=>{if(!destroyed&&epoch===token&&wake)launch();},400);
      };
      recognition.start();
    } catch(error){stop(error instanceof Error?error.message:'Could not start voice input.');}
  }
  return {
    start(mode,lang='sq-AL'){
      if(destroyed)return;
      stop();language=lang;wake=mode==='wake';capturing=!wake;restarts=0;
      if(capturing)onOpen();
      if(!Recognition){stop('Voice input is not supported by this browser. Try a browser with speech recognition.');return;}
      emit(capturing?'dictation':'wake');if(capturing)armTimeout();launch();
    },
    stop:()=>stop(),
    destroy(){stop();destroyed=true;},
  };
}
