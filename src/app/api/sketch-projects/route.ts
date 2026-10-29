import {NextRequest,NextResponse} from 'next/server';
import {Prisma} from '@prisma/client';
import {prisma} from '@/lib/prisma';
import {requirePlatformContext,isApiResponse} from '@/lib/platform/api';
import {parseFloorPlanRecovery} from '@/lib/floor-plan-recovery.mjs';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const kind='casynus-sketch';
const fail=(error:string,status:number)=>NextResponse.json({error},{status});
export async function GET(request:NextRequest){
  try{
    const context=await requirePlatformContext();if(isApiResponse(context))return context;
    const scope={workspaceId:context.workspaceId,userId:context.userId,deletedAt:null},id=request.nextUrl.searchParams.get('id');
    if(id){
      const row=await prisma.blenderProject.findFirst({where:{...scope,id,settings:{path:['kind'],equals:kind}}});if(!row)return fail('Sketch project not found.',404);
      const stored=row.settings as {document:unknown;revision:number};
      try{const document=parseFloorPlanRecovery(JSON.stringify(stored.document));if(document.id!==id||!Number.isSafeInteger(stored.revision)||stored.revision<1)throw Error();return NextResponse.json({document,revision:stored.revision});}catch{return fail('The stored sketch is invalid. Keep your recovery copy or export JSON.',422);}
    }
    const projects=await prisma.blenderProject.findMany({where:{...scope,settings:{path:['kind'],equals:kind}},select:{id:true,name:true,updatedAt:true},orderBy:{updatedAt:'desc'},take:100});return NextResponse.json({projects});
  }catch{return fail('Sketch storage is unavailable. Your browser recovery remains available.',503);}
}
class Conflict extends Error{}
export async function PUT(request:NextRequest){
  let context;try{context=await requirePlatformContext();}catch{return fail('Workspace storage is unavailable.',503);}if(isApiResponse(context))return context;
  let document,revision:number;
  try{
    if(Number(request.headers.get('content-length')||0)>3_501_000)return fail('Sketch project is too large.',413);
    const raw=await request.text();if(new TextEncoder().encode(raw).length>3_501_000)return fail('Sketch project is too large.',413);
    const body=JSON.parse(raw);document=parseFloorPlanRecovery(JSON.stringify(body.document));revision=body.revision;
    if(!document.id||!Number.isSafeInteger(revision)||revision<0||revision>2_000_000_000)return fail('Invalid sketch identity or revision.',400);
  }catch(error){return fail(error instanceof Error?error.message:'Invalid sketch project.',400);}
  const id=document.id,scope={workspaceId:context.workspaceId,userId:context.userId,deletedAt:null};
  const settings=JSON.parse(JSON.stringify({kind,document,revision:revision+1})) as Prisma.InputJsonValue;
  try{
    await prisma.$transaction(async tx=>{
      const existing=await tx.blenderProject.findFirst({where:{...scope,id}});
      if(existing){
        const old=existing.settings as {kind?:string;revision?:number};if(old.kind!==kind||old.revision!==revision)throw new Conflict();
        const changed=await tx.blenderProject.updateMany({where:{...scope,id,settings:{path:['revision'],equals:revision}},data:{name:document.name,settings}});if(changed.count!==1)throw new Conflict();
        await tx.project.updateMany({where:{...scope,id},data:{name:document.name}});
      }else{
        if(revision!==0||await tx.project.findUnique({where:{id}})||await tx.blenderProject.findUnique({where:{id}}))throw new Conflict();
        await tx.project.create({data:{id,workspaceId:context.workspaceId,userId:context.userId,name:document.name,type:'CAD'}});
        await tx.blenderProject.create({data:{...scope,id,projectId:id,name:document.name,settings}});
      }
    },{maxWait:15000,timeout:15000});return NextResponse.json({saved:true,id,revision:revision+1});
  }catch(error){if(error instanceof Conflict||(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002'))return fail('A newer sketch exists. Reload the cloud copy or save your drawing as a new project.',409);return fail('Sketch could not be saved. Keep your recovery copy or export JSON.',503);}
}
export async function DELETE(request:NextRequest){
  try{
    const context=await requirePlatformContext();if(isApiResponse(context))return context;
    const id=request.nextUrl.searchParams.get('id');if(!id)return fail('Sketch project ID is required.',400);
    const scope={workspaceId:context.workspaceId,userId:context.userId,deletedAt:null};
    const existing=await prisma.blenderProject.findFirst({where:{...scope,id,settings:{path:['kind'],equals:kind}}});if(!existing)return fail('Sketch project not found.',404);
    await prisma.$transaction(async tx=>{
      await tx.blenderProject.updateMany({where:{...scope,id},data:{deletedAt:new Date()}});
      await tx.project.updateMany({where:{...scope,id},data:{status:'DELETED',deletedAt:new Date()}});
    },{maxWait:15000,timeout:15000});
    return NextResponse.json({id,deleted:true});
  }catch{return fail('Could not delete sketch project.',503);}
}
