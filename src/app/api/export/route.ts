import { NextResponse } from "next/server";
export async function POST(request:Request){const body=await request.json();await new Promise(r=>setTimeout(r,500));if(!body?.asset)return NextResponse.json({error:"Scene is empty"},{status:400});return NextResponse.json({status:"ready",format:body.format,asset:body.asset})}
