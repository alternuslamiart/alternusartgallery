import { NextResponse } from "next/server";
import { configured3DProviders } from "@/lib/ai3d/providers.mjs";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json({ providers: configured3DProviders() }); }
