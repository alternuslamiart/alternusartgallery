import { NextRequest } from "next/server";
import { isApiResponse, requirePlatformContext } from "@/lib/platform/api";
import { fail3D, refresh3DJob } from "@/lib/ai3d/jobs";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try { const context = await requirePlatformContext(); if (isApiResponse(context)) return context; return await refresh3DJob(context, params.id, request.nextUrl.searchParams.get("refresh") === "1"); }
  catch (caught) { return fail3D(caught instanceof Error && /^(3D provider|The 3D provider|meshy is not configured|tripo is not configured)/.test(caught.message) ? caught.message : "Generation status is temporarily unavailable. Resume this job later.", 502); }
}
