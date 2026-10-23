// Browser speech stays separate from AI execution: only reviewed text or an
// explicit spoken Send command enters the existing studio submit pipeline.
const WAKE=/\b(?:hey|hej)\s*[,.:!]?\s*(?:casynus|casinus|kasynus|kasinus)\b[\s,.:!–-]*/i;
const SEND=/^(?:send|submit|d[eë]rgo)(?:\s+(?:it|request|k[eë]rkes[eë]n))?[.!?]*$/i;
const CANCEL=/^(?:cancel|stop|anulo|ndalo)[.!?]*$/i;
const ERRORS={
  'not-allowed':'The browser speech recognition service refused to start. This is separate from microphone device permission; try server transcription or another browser.',
  'service-not-allowed':'Speech recognition is unavailable in this browser or is disabled by its settings.',
  'audio-capture':'The browser speech service could not capture microphone audio. Check the input device or try server transcription.',
  'network':'The browser speech service could not connect. Check your connection and try again.',
  'language-not-supported':'This voice language is unavailable. Choose another language and try again.',
};

export function createStudioVoice({Recognition,getDraft,onDraft,onOpen,onSend,onState,openMicrophone,checkTranscription,transcribe}) {
  let current=null,epoch=0,destroyed=false,wake=false,capturing=false,restarts=0,listening=false;
  let captureTimer=null,restartTimer=null,language='sq-AL';
  let microphone=null,phase='idle',backend='browser',conversation=false,fallbackUsed=false,upload=null,interim='';
  const emit=(mode,error=null)=>{if(!destroyed)onState({mode,wakeEnabled:wake,listening,error,phase,backend,interim});};
  function clearTimers(){clearTimeout(captureTimer);clearTimeout(restartTimer);captureTimer=restartTimer=null;}
  function stop(error=null,turnComplete=false,silent=false){
    epoch++;clearTimers();wake=false;capturing=false;listening=false;conversation=false;phase=turnComplete?'processing':'idle';interim='';
    upload?.abort();upload=null;microphone?.close();microphone=null;
    const old=current;current=null;try{old?.abort();}catch{/* Already stopped. */}
    if(!silent)emit('off',error);
  }
  function armTimeout(){
    clearTimeout(captureTimer);
    captureTimer=setTimeout(()=>{if(backend==='server')void finish();else if(wake){capturing=false;emit('wake');}else stop();},30_000);
  }
  function capture(text){
    const task=text.trim();if(!task)return;
    if(CANCEL.test(task)){stop();return;}
    if(SEND.test(task)){
      const send=Boolean(getDraft().trim());
      clearTimeout(captureTimer);
      if(wake){capturing=false;emit('wake');}else stop(null,send);
      if(send)onSend();
      return;
    }
    onDraft([getDraft().trim(),task].filter(Boolean).join(' ').slice(0,12_000));
    if(conversation){stop(null,true);onSend();return;}
    armTimeout();
  }
  async function fallback(reason) {
    if(fallbackUsed||!microphone||!checkTranscription||!transcribe){stop(reason);return;}
    fallbackUsed=true;const token=++epoch;
    const old=current;current=null;try{old?.abort();}catch{}
    clearTimers();listening=false;phase='preparing';emit(conversation?'conversation':'dictation');
    upload=new AbortController();
    try {
      await checkTranscription(upload.signal);
      if(destroyed||epoch!==token)return;
      microphone.record();backend='server';wake=false;capturing=true;listening=true;phase='recording';
      emit(conversation?'conversation':'dictation');armTimeout();
    }catch(error){if(epoch===token)stop(`${reason} ${error instanceof Error?error.message:'Server transcription is unavailable.'}`);}
  }
  async function finish() {
    if(backend!=='server'||!microphone||phase!=='recording'){stop();return;}
    const token=epoch,session=microphone,send=conversation;clearTimers();listening=false;phase='transcribing';emit(send?'conversation':'dictation');
    try {
      const blob=await session.finish();
      session.close();
      if(epoch!==token||destroyed)return;
      microphone=null;
      const text=await transcribe(blob,language,upload.signal);
      if(epoch!==token||destroyed)return;
      onDraft([getDraft().trim(),text.trim()].filter(Boolean).join(' ').slice(0,12_000));
      stop(null,send&&Boolean(text.trim()));if(send&&text.trim())onSend();
    }catch(error){if(epoch===token)stop(error instanceof Error?error.message:'Audio transcription failed. Retry recording.');}
  }
  function launch(){
    const token=++epoch;
    try {
      const recognition=new Recognition();current=recognition;
      recognition.lang=language;recognition.continuous=true;recognition.interimResults=true;recognition.maxAlternatives=1;
      const valid=()=>!destroyed&&epoch===token&&current===recognition;
      recognition.onstart=()=>{if(valid()){listening=true;phase='recording';emit(conversation?'conversation':capturing?'dictation':'wake');}};
      recognition.onresult=event=>{
        if(!valid())return;
        for(let i=event.resultIndex;i<event.results.length;i++){
          if(!valid())break;
          const result=event.results[i];
          if(!result.isFinal){interim=result[0]?.transcript?.slice(0,500)??'';emit(conversation?'conversation':capturing?'dictation':'wake');continue;}
          interim='';
          const text=result[0]?.transcript?.trim();if(!text)continue;restarts=0;
          if(!capturing){
            const match=WAKE.exec(text);if(!match)continue;
            capturing=true;onOpen();emit('dictation');armTimeout();
            capture(text.slice(match.index+match[0].length));
          }else capture(text.replace(WAKE,''));
          if(valid())emit(conversation?'conversation':capturing?'dictation':'wake');
        }
      };
      recognition.onerror=event=>{
        if(!valid()||event.error==='no-speech')return;
        const message=ERRORS[event.error]??`Speech recognition stopped (${event.error || 'unknown error'}). Try again.`;
        if(typeof process!=='undefined'&&process.env.NODE_ENV==='development')console.debug('Studio speech service failure',{error:event.error});
        if(['not-allowed','service-not-allowed','network','language-not-supported','audio-capture'].includes(event.error)&&microphone)void fallback(message);
        else stop(message);
      };
      recognition.onend=()=>{
        if(!valid())return;current=null;listening=false;
        if(!wake){stop(conversation?'No speech was recognized. Start voice conversation again.':null);return;}
        if(++restarts>3){stop('Voice listening stopped repeatedly. Click Hey Casynus to enable it again.');return;}
        emit(capturing?'dictation':'wake');
        restartTimer=setTimeout(()=>{if(!destroyed&&epoch===token&&wake)launch();},400);
      };
      const audioTrack=microphone?.stream?.getAudioTracks?.()[0];
      if(audioTrack)recognition.start(audioTrack);else recognition.start();
    } catch(error){void fallback(`Speech recognition could not initialize (${error?.name??'unknown error'}).`);}
  }
  return {
    start(mode,lang='sq-AL'){
      if(destroyed)return;
      stop(null,false,true);language=lang;wake=mode==='wake';capturing=!wake;conversation=mode==='conversation';restarts=0;fallbackUsed=false;backend='browser';phase='requesting';
      if(capturing)onOpen();
      emit(conversation?'conversation':capturing?'dictation':'wake');
      const begin=()=>{if(!Recognition){void fallback('Browser speech recognition is not supported.');return;}if(capturing)armTimeout();launch();};
      if(openMicrophone){const token=epoch;void openMicrophone().then(session=>{if(destroyed||epoch!==token){session.close();return;}microphone=session;begin();}).catch(error=>{if(epoch===token)stop(error instanceof Error?error.message:'Microphone initialization failed.');});}
      else if(!Recognition)stop('Voice input is not supported by this browser. Try a browser with speech recognition.');
      else begin();
    },
    stop:()=>stop(),
    finish:()=>finish(),
    destroy(){stop();destroyed=true;},
  };
}
