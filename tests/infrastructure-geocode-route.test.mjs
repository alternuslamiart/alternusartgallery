import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { normalizePlaces } from '../src/lib/infrastructure/geography.mjs';

const compiled = ts.transpileModule(fs.readFileSync('src/app/api/infrastructure/geocode/route.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function harness({key='test-secret', allowed=true, response={ok:true,json:async()=>({features:[{center:[13,52],place_name:'Berlin'}]})}, fail=false}={}) {
  const calls=[];
  const adapters={
    'next/server': {NextResponse:{json:(body,init)=>({body,status:init?.status??200})}},
    '@/lib/infrastructure/geography.mjs': {normalizePlaces},
    '@/lib/rate-limit': {getClientIP:()=> 'local',rateLimit:()=>({success:allowed})},
  };
  const exports={};
  new Function('require','exports','process','fetch',compiled)(name=>adapters[name],exports,{env:{MAPTILER_API_KEY:key}},async(url,options)=>{calls.push({url,options});if(fail)throw new Error('provider secret error');return response;});
  return {calls, get:q=>exports.GET({nextUrl:new URL(`http://localhost/api/infrastructure/geocode?q=${encodeURIComponent(q)}`)})};
}
test('geocoding route validates input and configured credentials before HTTP',async()=>{
  const h=harness({key:''});assert.equal((await h.get('x')).status,400);assert.equal((await h.get('Berlin')).status,503);assert.equal(h.calls.length,0);
});
test('geocoding uses server key, bounded explicit searches and normalized coordinates',async()=>{
  const h=harness();const r=await h.get('Berlin');assert.equal(r.status,200);assert.equal(r.body.places[0].latitude,52);
  assert.equal(h.calls[0].url.hostname,'api.maptiler.com');assert.equal(h.calls[0].url.searchParams.get('key'),'test-secret');assert.equal(h.calls[0].url.searchParams.get('autocomplete'),'false');assert.ok(!JSON.stringify(r).includes('test-secret'));
});
test('rate limit, provider failures and timeouts return safe errors',async()=>{
  assert.equal((await harness({allowed:false}).get('Berlin')).status,429);
  assert.equal((await harness({response:{ok:false,status:429}}).get('Berlin')).status,429);
  const failed=await harness({fail:true}).get('Berlin');assert.equal(failed.status,502);assert.ok(!JSON.stringify(failed).includes('secret'));
  assert.equal((await harness({response:{ok:true,json:async()=>({})}}).get('Berlin')).status,502);
});
