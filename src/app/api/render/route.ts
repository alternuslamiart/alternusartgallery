import { NextResponse } from "next/server";
export async function POST(request:Request){const scene=await request.json();await new Promise(r=>setTimeout(r,900));if(!scene?.asset)return NextResponse.json({error:"Scene is empty"},{status:400});return NextResponse.json({id:crypto.randomUUID(),status:"done",createdAt:new Date().toISOString()})}
