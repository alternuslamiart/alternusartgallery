import test from 'node:test';
import assert from 'node:assert/strict';
import { createStudioVoice } from '../src/lib/studio-voice.mjs';
import { parseStudioCommand } from '../src/lib/studio-actions.mjs';

class Recognition {
  static instances=[];
  constructor(){Recognition.instances.push(this);}
  start(){this.onstart?.();}
  abort(){this.aborted=true;this.onend?.();}
  result(text,final=true){this.onresult?.({resultIndex:0,results:[Object.assign([{transcript:text}],{isFinal:final})]});}
}
test('known voice commands execute as isolated turns and preserve unrelated typed drafts',()=>{
 let draft='Unsaved design notes',command;const states=[];
 const voice=createStudioVoice({Recognition,getDraft:()=>draft,onDraft:text=>draft=text,onOpen:()=>{},onSend:text=>command=text,onState:s=>states.push(s),isCommand:text=>Boolean(parseStudioCommand(text))});
 voice.start('dictation','en-US');Recognition.instances.at(-1).result('Add a cube');
 assert.equal(draft,'Unsaved design notes');assert.equal(command,'Add a cube');assert.equal(states.at(-1).phase,'processing');voice.destroy();
});
test('Stop finishes browser recognition while Close/cancel aborts without committing interim speech',async()=>{
 class FinishingRecognition extends Recognition {stop(){this.result('final dictated text');this.onend?.();}}
 let draft='';const voice=createStudioVoice({Recognition:FinishingRecognition,getDraft:()=>draft,onDraft:t=>draft=t,onOpen:()=>{},onSend:()=>{},onState:()=>{}});
 voice.start('dictation');await voice.finish();assert.equal(draft,'final dictated text');
 voice.start('dictation');const r=Recognition.instances.at(-1);r.result('unfinished',false);voice.stop();assert.equal(draft,'final dictated text');assert.equal(r.aborted,true);voice.destroy();
});
function setup(ctor=Recognition){
  let draft='Existing idea';let opened=0,sent=0;const states=[];
  const voice=createStudioVoice({Recognition:ctor,getDraft:()=>draft,onDraft:value=>{draft=value;},onOpen:()=>opened++,onSend:()=>sent++,onState:s=>states.push(s)});
  return {voice,get draft(){return draft;},get opened(){return opened;},get sent(){return sent;},states,get recognition(){return Recognition.instances.at(-1);}};
}
test('wake mode ignores ambient speech, opens minimized chat and appends only the task',()=>{
  const s=setup();s.voice.start('wake','sq-AL');const r=s.recognition;
  assert.equal(r.lang,'sq-AL');r.result('background conversation');assert.equal(s.opened,0);assert.equal(s.draft,'Existing idea');
  r.result('Hey, Casynus! Create a marble room');assert.equal(s.opened,1);assert.equal(s.draft,'Existing idea Create a marble room');
  r.result('Dërgo');assert.equal(s.sent,1);assert.equal(s.states.at(-1).mode,'wake');s.voice.destroy();
});
test('dictation ignores interim results, sends only on explicit command and supports cancellation',()=>{
  const s=setup();s.voice.start('dictation','en-US');const r=s.recognition;assert.equal(s.opened,1);
  r.result('Move wall',false);assert.equal(s.draft,'Existing idea');r.result('Move wall two meters');assert.equal(s.draft,'Existing idea Move wall two meters');assert.equal(s.sent,0);
  r.result('cancel');assert.equal(s.sent,0);assert.equal(r.aborted,true);assert.equal(s.states.at(-1).mode,'off');
});
test('wake recognition tolerates common phonetic spellings but not unrelated names',()=>{
  for(const name of ['Casinus','Kasynus','Kasinus']){
    const s=setup();s.voice.start('wake','sq-AL');s.recognition.result('Hey another assistant');assert.equal(s.opened,0);
    s.recognition.result(`Hej ${name}`);assert.equal(s.opened,1);s.voice.destroy();
  }
});
test('permission/network/language failures stop listening without restart',()=>{
  for(const error of ['not-allowed','network','language-not-supported']){
    const s=setup();s.voice.start('wake','sq-AL');const r=s.recognition;r.onerror({error});r.onend?.();assert.equal(s.states.at(-1).mode,'off');assert.ok(s.states.at(-1).error);assert.equal(r.aborted,true);s.voice.destroy();
  }
});
test('unsupported browsers report an honest error and do not request a microphone',()=>{
  const s=setup(null);s.voice.start('dictation','sq-AL');assert.equal(s.opened,1);assert.match(s.states.at(-1).error,/not supported/i);
});
test('late recognition results cannot cross stopped sessions or destroyed account identities',()=>{
  const s=setup();s.voice.start('wake','en-US');const old=s.recognition;s.voice.stop();old.result('Hey Casynus delete everything');assert.equal(s.draft,'Existing idea');
  s.voice.start('dictation','en-US');const current=s.recognition;s.voice.destroy();current.result('stale account command');assert.equal(s.draft,'Existing idea');assert.equal(s.sent,0);
});
test('a new capture aborts the old microphone and synchronous start failures are surfaced',()=>{
  const s=setup();s.voice.start('wake','en-US');const old=s.recognition;s.voice.start('dictation','sq-AL');assert.equal(old.aborted,true);assert.equal(s.recognition.lang,'sq-AL');s.voice.destroy();
  const broken=setup(class extends Recognition {start(){throw new Error('Microphone unavailable');}});broken.voice.start('dictation','en-US');assert.equal(broken.states.at(-1).mode,'off');assert.match(broken.states.at(-1).error,/Speech recognition could not initialize/);
});
test('dictation times out and wake sessions return to wake-only listening without submitting',t=>{
  t.mock.timers.enable({apis:['setTimeout']});
  const s=setup();s.voice.start('dictation','en-US');t.mock.timers.tick(30_000);assert.equal(s.states.at(-1).mode,'off');assert.equal(s.sent,0);
  s.voice.start('wake','en-US');s.recognition.result('Hey Casynus');t.mock.timers.tick(30_000);assert.equal(s.states.at(-1).mode,'wake');assert.equal(s.sent,0);s.voice.destroy();
});
test('repeated speech-service endings have bounded retries instead of a restart loop',t=>{
  t.mock.timers.enable({apis:['setTimeout']});const s=setup();s.voice.start('wake','en-US');
  for(let i=0;i<4;i++){s.recognition.onend();t.mock.timers.tick(400);}
  assert.equal(s.states.at(-1).mode,'off');assert.match(s.states.at(-1).error,/repeatedly/);s.voice.destroy();
});
