import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isApiResponse, requirePlatformContext } from "@/lib/platform/api";
import { fail3D, owned3D } from "@/lib/ai3d/jobs";
import { safeModelURL } from "@/lib/ai3d/providers.mjs";
import { readModelBytes } from "@/lib/ai3d/client.mjs";
import { readStoredFile } from '@/lib/platform/storage';
import {signedHunyuanAsset} from '@/lib/ai3d/hunyuan-object-storage';
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext(); if (isApiResponse(context)) return context;
    const job = await prisma.aIProviderJob.findFirst({ where: owned3D(context, params.id) });
    if (!job || job.status !== "SUCCEEDED") return fail3D("Generated model not found.", 404);
    const output = job.output as { modelURL?: string; storageKey?: string } | null;
    if(job.provider==='hunyuan') {
      if(!output?.storageKey)return fail3D('Generated model is not persisted yet.',409);
      try{
        const signed=await signedHunyuanAsset(output.storageKey);
        if(signed)return new NextResponse(null,{status:307,headers:{Location:signed,'Cache-Control':'private, no-store'}});
        const bytes=await readStoredFile(output.storageKey);
        return new NextResponse(new Uint8Array(bytes),{headers:{'Content-Type':'model/gltf-binary','Cache-Control':'private, no-store','Content-Disposition':'attachment; filename="Casynus_Hunyuan.glb"'}});
      }catch{return fail3D('The saved Hunyuan GLB is unavailable. Restore the private asset volume from backup.',503);}
    }
    const url = safeModelURL(output?.modelURL);
    // Never forward API credentials to a CDN or follow its redirects. Keep the
    // proxy below Vercel's response limit; larger assets use the CDN directly.
    const response = await fetch(url, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(25_000) });
    const bytes = await readModelBytes(response, 4_000_000);
    return new NextResponse(bytes, { headers: { "Content-Type": "model/gltf-binary", "Content-Disposition": 'attachment; filename="Casynus_generated.glb"', "Cache-Control": "private, no-store" } });
  } catch { return fail3D("Model download failed or exceeds the 4 MB proxy limit. Resume to refresh its link, or download the source GLB directly.", 502); }
}
