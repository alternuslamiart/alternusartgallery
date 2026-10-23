import test from 'node:test';
import assert from 'node:assert/strict';
import { openStudioMicrophone, microphoneError } from '../src/lib/studio-microphone.mjs';
import { createStudioVoice } from '../src/lib/studio-voice.mjs';

function environment() {
  const track={stops:0,stop(){this.stops++;}},stream={getTracks:()=>[track]};
  const calls=[];
  const env={isSecureContext:true,navigator:{mediaDevices:{getUserMedia:async options=>{calls.push(options);return stream;}}}};
  return {env,track,calls};
}
test('capture requests audio only, retries after denial, and releases tracks idempotently', async()=>{
  const s=environment();let denied=true;
  s.env.navigator.mediaDevices.getUserMedia=async options=>{s.calls.push(options);if(denied)throw {name:'NotAllowedError'};return {getTracks:()=>[s.track]};};
  await assert.rejects(openStudioMicrophone({environment:s.env}),/denied or restricted/);
  denied=false;const microphone=await openStudioMicrophone({environment:s.env});
  assert.deepEqual(s.calls,[{audio:true},{audio:true}]);microphone.close();microphone.close();assert.equal(s.track.stops,1);
});
test('secure context, policy, and unsupported API errors are distinct and never request access', async()=>{
  const s=environment();s.env.isSecureContext=false;
  await assert.rejects(openStudioMicrophone({environment:s.env}),/HTTPS/);s.env.isSecureContext=true;
  s.env.document={permissionsPolicy:{allowsFeature:()=>false}};
  await assert.rejects(openStudioMicrophone({environment:s.env}),/Permissions Policy/);delete s.env.document;
  s.env.navigator={};await assert.rejects(openStudioMicrophone({environment:s.env}),/does not support/);assert.equal(s.calls.length,0);
});
test('device and security errors are never presented as permission denial',()=>{
  for(const name of ['NotFoundError','NotReadableError','OverconstrainedError','SecurityError','AbortError'])assert.doesNotMatch(microphoneError({name}),/permission was denied/);
  assert.match(microphoneError({name:'NotFoundError'}),/No audio input/);
  assert.match(microphoneError({name:'NotReadableError'}),/could not be opened/);
});
test('recording uses a supported MIME format, returns actual chunks, stops tracks and discards cancellation', async()=>{
  const s=environment();
  class Recorder {
    static isTypeSupported(type){return type==='audio/webm;codecs=opus';}
    constructor(stream,options){this.mimeType=options.mimeType;}
    start(){this.state='recording';}
    stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['actual chunk'])});this.onstop?.();}
  }
  s.env.MediaRecorder=Recorder;
  const microphone=await openStudioMicrophone({environment:s.env});microphone.record();
  const blob=await microphone.finish();assert.equal(await blob.text(),'actual chunk');assert.ok(s.track.stops>=1);
  const canceled=await openStudioMicrophone({environment:s.env});canceled.record();canceled.close();await assert.rejects(canceled.finish(),/canceled/);
});
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('allowed microphone plus refused speech service falls back without claiming microphone denial',async()=>{
  let recognition,closeCount=0,recorded=0,uploads=0,draft='Existing',sent=0;const states=[];
  class Recognition {constructor(){recognition=this;}start(){this.onstart();}abort(){this.onend?.();}}
  const voice=createStudioVoice({Recognition,openMicrophone:async()=>({close:()=>closeCount++,record:()=>recorded++,finish:async()=>new Blob(['speech'])}),
    checkTranscription:async()=>{},transcribe:async()=>{uploads++;return 'përshëndetje';},getDraft:()=>draft,onDraft:text=>draft=text,onOpen:()=>{},onSend:()=>sent++,onState:s=>states.push(s)});
  voice.start('dictation','sq-AL');await flush();recognition.onerror({error:'not-allowed'});await flush();
  assert.equal(states.at(-1).backend,'server');assert.equal(states.at(-1).error,null);assert.equal(recorded,1);
  await voice.finish();assert.equal(draft,'Existing përshëndetje');assert.equal(uploads,1);assert.equal(sent,0);voice.destroy();assert.ok(closeCount>=1);
});
test('stop during pending permission releases late streams and prevents recognition',async()=>{
  let resolve,closed=0,constructed=0;
  const voice=createStudioVoice({Recognition:class {constructor(){constructed++;}},openMicrophone:()=>new Promise(r=>resolve=r),getDraft:()=>'',onDraft:()=>{},onOpen:()=>{},onSend:()=>{},onState:()=>{}});
  voice.start('dictation');voice.stop();resolve({close:()=>closed++});await flush();
  assert.equal(closed,1);assert.equal(constructed,0);voice.destroy();
});
test('conversation sends one finalized utterance and aborts recognition before AI processing',()=>{
  let recognition,aborted=false,sent=0,draft='';const states=[];
  class Recognition {constructor(){recognition=this;}start(){this.onstart();}abort(){aborted=true;this.onend?.();}}
  const voice=createStudioVoice({Recognition,getDraft:()=>draft,onDraft:t=>draft=t,onOpen:()=>{},onSend:()=>{assert.equal(aborted,true);sent++;},onState:s=>states.push(s)});
  voice.start('conversation','en-US');const event={resultIndex:0,results:[Object.assign([{transcript:'Plan a street'}],{isFinal:true})]};
  recognition.onresult(event);recognition.onresult(event);assert.equal(sent,1);assert.equal(draft,'Plan a street');assert.equal(states.at(-1).phase,'processing');
  voice.start('conversation','en-US');recognition.onresult({resultIndex:0,results:[Object.assign([{transcript:'cancel'}],{isFinal:true})]});
  assert.equal(states.at(-1).phase,'idle');assert.equal(sent,1);voice.destroy();
});
