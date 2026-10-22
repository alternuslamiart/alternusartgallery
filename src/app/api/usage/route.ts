import { NextRequest } from "next/server";
import { isApiResponse, requirePlatformContext, ok } from "@/lib/platform/api";
import { aiUsage, usageError } from "@/lib/platform/usage";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const days = Number(request.nextUrl.searchParams.get("days") ?? 15);
    if (![7, 15, 30, 90].includes(days)) return Response.json({ error: "Choose 7, 15, 30 or 90 days." }, { status: 400 });
    return ok(await aiUsage.summary(context.workspaceId, days), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return usageError(error); }
}
