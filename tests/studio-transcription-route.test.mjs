import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const compiled=ts.transpileModule(fs.readFileSync('src/app/api/studio-voice/transcribe/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function harness({signedIn=true,key='server-secret',allowed=true,status=200,text='Përshëndetje'}={}){
  const calls=[],exports={};
  const adapters={
    'next/server':{NextResponse:{json:(body,init)=>({body,status:init?.status??200,headers:init?.headers})}},
    '@/lib/auth':{auth:async()=>signedIn?{user:{id:'user-a'}}:null},
    '@/lib/ai-provider-config':{getGroqApiKey:()=>key,getGroqBaseUrl:()=> 'https://api.groq.com/openai/v1'},
    '@/lib/persistent-rate-limit':{consumePersistentRateLimit:async(id,config)=>{calls.push({id,config});return {success:allowed};},rateLimitResponse:()=>({status:429,headers:{'Retry-After':'900'}})},
  };
  new Function('require','exports','process','fetch',compiled)(name=>adapters[name],exports,{env:{NODE_ENV:'test'}},async(url,options)=>{calls.push({url,options});return {ok:status===200,status,json:async()=>({text})};});
  return {...exports,calls};
}
function request({language='sq',type='audio/webm',size=20}={}){
  const form=new FormData();form.set('file',new Blob([new Uint8Array(size)],{type}),'private-audio-name.webm');form.set('language',language);
  return new Request('http://localhost/api/studio-voice/transcribe',{method:'POST',body:form});
}
test('transcription capability gates authentication and server configuration',async()=>{
  assert.equal((await harness({signedIn:false}).GET()).status,401);
  assert.equal((await harness({key:''}).GET()).status,503);
  const good=harness();assert.equal((await good.GET()).body.available,true);assert.equal(good.calls.length,0);
});
test('server transcription uses bounded authenticated audio with multilingual whisper and never exposes credentials',async()=>{
  const h=harness(),result=await h.POST(request());assert.equal(result.status,200);assert.equal(result.body.text,'Përshëndetje');
  assert.equal(h.calls[0].id,'studio-transcription:user-a');
  const provider=h.calls[1];assert.equal(provider.url,'https://api.groq.com/openai/v1/audio/transcriptions');
  assert.equal(provider.options.body.get('model'),'whisper-large-v3');assert.equal(provider.options.body.get('language'),'sq');
  assert.equal(provider.options.body.get('file').name,'voice.webm');assert.ok(provider.options.signal);
  assert.equal(result.headers['Cache-Control'],'no-store');assert.ok(!JSON.stringify(result).includes('server-secret'));
});
test('rejects missing authentication, unsupported audio/languages, rate limits, provider failures and oversize input',async()=>{
  assert.equal((await harness({signedIn:false}).POST(request())).status,401);
  assert.equal((await harness({allowed:false}).POST(request())).status,429);
  assert.equal((await harness().POST(request({language:'bad'}))).status,400);
  assert.equal((await harness().POST(request({type:'text/plain'}))).status,400);
  assert.equal((await harness().POST(request({size:3_100_001}))).status,413);
  assert.equal((await harness({status:429}).POST(request())).status,429);
  assert.equal((await harness({status:500}).POST(request())).status,502);
  assert.equal((await harness({text:''}).POST(request())).status,422);
});
