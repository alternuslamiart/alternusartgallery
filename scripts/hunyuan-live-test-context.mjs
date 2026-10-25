// Explicit local-only integration-test principal. Never impersonates a customer,
// sends email, changes subscriptions or bypasses the existing Credentials handler.
import fs from 'node:fs';
import dotenv from 'dotenv';
import {randomUUID,randomBytes,randomInt} from 'node:crypto';
import bcrypt from 'bcryptjs';
import {PrismaClient} from '@prisma/client';

export async function createHunyuanLiveContext(base,resume=false){
  const root=new URL(base);if(!['127.0.0.1','localhost'].includes(root.hostname))throw Error('Live test must target localhost.');
  const env={...dotenv.parse(fs.readFileSync('.env')),...dotenv.parse(fs.readFileSync('.env.local'))};
  const db=new PrismaClient({datasourceUrl:env.DATABASE_URL,log:[]});
  let id=randomUUID(),email=`hunyuan-qa-${id}@example.invalid`,resumeJob;
  const password=randomBytes(24).toString('hex');
  const cookies=new Map();
  const saveCookies=response=>{for(const line of response.headers.getSetCookie()){const [pair]=line.split(';'),split=pair.indexOf('=');const name=pair.slice(0,split),value=pair.slice(split+1);if(value)cookies.set(name,value);else cookies.delete(name);}};
  const request=async(path,init={})=>{const response=await fetch(base+path,{...init,headers:{Cookie:[...cookies].map(([k,v])=>`${k}=${v}`).join(';'),Origin:base,...init.headers},redirect:'manual',signal:AbortSignal.timeout(60000)});saveCookies(response);return response;};
  const json=async(path,init)=>{const response=await request(path,init);const body=await response.json();if(!response.ok)throw Error('Live API '+path.split('?')[0]+' failed '+response.status);return body;};
  if(resume){
    const candidate=await db.user.findFirst({where:{email:{startsWith:'hunyuan-qa-'},firstName:'Hunyuan',lastName:'Local QA',createdAt:{gt:new Date(Date.now()-86400000)}},orderBy:{createdAt:'desc'}});
    if(!candidate||candidate.email!==`hunyuan-qa-${candidate.id}@example.invalid`)throw Error('No isolated QA principal to resume.');
    const job=await db.aIProviderJob.findFirst({where:{userId:candidate.id,provider:'hunyuan',status:{in:['QUEUED','RUNNING','SUCCEEDED']}},orderBy:{createdAt:'desc'}});
    if(!job)throw Error('No owned QA GPU job to resume.');
    id=candidate.id;email=candidate.email;resumeJob={id:job.id,projectId:job.input.projectId};
    await db.user.update({where:{id},data:{passwordHash:await bcrypt.hash(password,12)}});
  }else await db.user.create({data:{id,email,passwordHash:await bcrypt.hash(password,12),firstName:'Hunyuan',lastName:'Local QA',age:30,emailVerified:true}});
  async function login(){
    const code=String(randomInt(100000,1000000));await db.verificationToken.create({data:{identifier:`login:${email}`,token:code,expires:new Date(Date.now()+10*60000)}});
    const {csrfToken}=await json('/api/auth/csrf');
    const result=await json('/api/auth/callback/credentials',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','X-Auth-Return-Redirect':'1'},body:new URLSearchParams({csrfToken,email,password,verificationCode:code,callbackUrl:base+'/casynus'})});
    if(result.url?.includes('error='))throw Error('Credentials sign-in failed.');
    const session=await json('/api/auth/session');if(session.user?.id!==id)throw Error('Real NextAuth session was not established.');
    console.log('PASS real Credentials sign-in for isolated QA principal');
  }
  async function logout(){const {csrfToken}=await json('/api/auth/csrf');await json('/api/auth/signout',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','X-Auth-Return-Redirect':'1'},body:new URLSearchParams({csrfToken,callbackUrl:base})});const session=await json('/api/auth/session');if(session?.user)throw Error('Sign-out failed.');}
  async function cleanup(){
    const workspaces=await db.workspace.findMany({where:{ownerId:id},select:{id:true}}),ids=workspaces.map(w=>w.id);
    const active=await db.aIProviderJob.count({where:{userId:id,status:{in:['QUEUED','RUNNING']}}});
    if(active){console.log('Retained isolated QA data for an active GPU job.');await db.$disconnect();return;}
    await db.$transaction(async tx=>{
      await tx.aIProviderJob.deleteMany({where:{userId:id}});await tx.blenderProject.deleteMany({where:{userId:id}});await tx.project.deleteMany({where:{userId:id}});
      await tx.notification.deleteMany({where:{userId:id}});await tx.userSettings.deleteMany({where:{userId:id}});
      await tx.workspaceSettings.deleteMany({where:{workspaceId:{in:ids}}});await tx.subscriptionState.deleteMany({where:{workspaceId:{in:ids}}});await tx.workspaceMember.deleteMany({where:{workspaceId:{in:ids}}});await tx.workspace.deleteMany({where:{id:{in:ids},ownerId:id}});
      for(const workspaceId of ids)await tx.rateLimitBucket.deleteMany({where:{id:{startsWith:`ai-usage:v1:${workspaceId}:`}}});
      await tx.rateLimitBucket.deleteMany({where:{id:`login-code:${email}`}});await tx.verificationToken.deleteMany({where:{identifier:`login:${email}`}});await tx.user.delete({where:{id}});
    },{timeout:60000});await db.$disconnect();console.log('Cleaned only fresh QA principal/workspace records; customer data untouched.');
  }
  try{await login();}catch(error){await cleanup();throw error;}
  return{id,db,cookies,json,request,login,logout,cleanup,resumeJob};
}
