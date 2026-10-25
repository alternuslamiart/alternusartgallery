// Read-only, secret-safe Next/Prisma configuration and connectivity audit.
import fs from 'node:fs';
import dotenv from 'dotenv';
import nextEnv from '@next/env';
import {PrismaClient} from '@prisma/client';
import {encodedDatabaseURL} from './hunyuan-database-urls.mjs';
const explicit=process.argv.find(a=>a.startsWith('--env-file='))?.slice(11);
let values;
if(explicit)values=dotenv.parse(fs.readFileSync(explicit));
else {
  nextEnv.loadEnvConfig(process.cwd(),true,{info:()=>{},error:()=>{}});values={...process.env};
  // Report the files independently of stale variables inherited by this shell.
  for(const file of ['.env','.env.local'])if(fs.existsSync(file))Object.assign(values,dotenv.parse(fs.readFileSync(file)));
  console.log(JSON.stringify({inheritedDatabaseOverride:!!process.env.DATABASE_URL&&process.env.DATABASE_URL!==values.DATABASE_URL}));
}
for(const file of explicit?[explicit]:['.env','.env.local']){
  if(!fs.existsSync(file))continue;const parsed=dotenv.parse(fs.readFileSync(file));
  console.log(JSON.stringify({source:explicit?'downloaded Vercel production environment':file,present:Object.keys(parsed).filter(k=>/DATABASE_URL|DIRECT_URL|SUPABASE|HUNYUAN/.test(k))}));
}
for(const key of ['DATABASE_URL','DIRECT_URL']){
  if(!values[key]){console.log(key+': MISSING');continue;}
  let url;try{url=new URL(values[key]);if(!['postgres:','postgresql:'].includes(url.protocol))throw Error();}catch{
    console.log(key+': INVALID_URL (credentials/encoding need correction)');
    if(!process.argv.includes('--check-encoding'))continue;
    try{url=new URL(encodedDatabaseURL(values[key]));console.log(key+': checking password-encoded copy in memory only');}catch{continue;}
  }
  const pooler=url.hostname.endsWith('.pooler.supabase.com'),port=url.port||'5432';
  console.log(JSON.stringify({key,mode:pooler?(port==='6543'?'Supavisor transaction':'Supavisor session'):'direct/other',port,pgbouncer:url.searchParams.get('pgbouncer')==='true',transactionCompatibility:pooler&&port==='6543'?(url.searchParams.get('pgbouncer')==='true'?'configured':'prepared-statement compatibility not confirmed'):'not applicable'}));
  url.searchParams.set('connect_timeout','8');url.searchParams.set('pool_timeout','8');
  const client=new PrismaClient({datasourceUrl:url.href,log:[]});
  try{await client.$queryRaw`SELECT 1`;console.log(key+': CONNECTED (read-only SELECT 1)');}
  catch(error){console.log(key+': CONNECTION_FAILED '+(error.code||error.name||'unknown'));}
  finally{await client.$disconnect();}
}
console.log(JSON.stringify({supabaseUrl:!!(values.SUPABASE_URL||values.NEXT_PUBLIC_SUPABASE_URL),storageServiceCredential:!!values.SUPABASE_SERVICE_ROLE_KEY,assetBucket:!!values.HUNYUAN_STORAGE_BUCKET,workerConfigured:!!values.HUNYUAN_API_URL,remoteWorkerAuthenticated:!!values.HUNYUAN_API_TOKEN}));
