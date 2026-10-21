import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isApiResponse, requirePlatformContext } from "@/lib/platform/api";
import { create3DJob, fail3D, jobDTO, owned3D } from "@/lib/ai3d/jobs";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: NextRequest) {
  try {
    const context = await requirePlatformContext(); if (isApiResponse(context)) return context;
    const raw = await request.text(); if (raw.length > 4000) return fail3D("Generation request is too large.", 413);
    let body; try { body = JSON.parse(raw); if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error(); } catch { return fail3D("Invalid generation request.", 400); }
    return await create3DJob(context, body);
  } catch { return fail3D("Generation storage is unavailable. No generation is confirmed; check your jobs before retrying.", 503); }
}
export async function GET(request: NextRequest) {
  try {
    const context = await requirePlatformContext(); if (isApiResponse(context)) return context;
    const projectId = request.nextUrl.searchParams.get("project");
    const jobs = await prisma.aIProviderJob.findMany({ where: { ...owned3D(context), ...(projectId ? { AND: { input: { path: ["projectId"], equals: projectId } } } : {}) }, orderBy: { createdAt: "desc" }, take: 30 });
    return NextResponse.json({ jobs: jobs.map(jobDTO) });
  } catch { return fail3D("Generation jobs could not be loaded.", 503); }
}
