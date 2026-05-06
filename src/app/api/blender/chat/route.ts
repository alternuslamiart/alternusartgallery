import { NextRequest, NextResponse } from "next/server";
import { generateBlenderChatScript } from "@/lib/blender-chat";
import { apiError, mapUnknownError, ok, readJsonBody } from "@/lib/platform/api";
import { asJsonObject, asString, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const expectedToken = process.env.BLENDER_ADDON_TOKEN?.trim();
  if (!expectedToken) return true;

  const authHeader = request.headers.get("authorization") ?? "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const headerToken = request.headers.get("x-alternus-blender-token")?.trim() ?? "";
  return bearerToken === expectedToken || headerToken === expectedToken;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Alternus-Blender-Token",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return apiError("FORBIDDEN", "Invalid Blender add-on token.", 403);
    }

    const body = await readJsonBody(request);
    const prompt = asString(body, "prompt", { required: true, max: 1200 });
    const mode = asString(body, "mode", { max: 40 });
    const sceneContext = asJsonObject(body, "sceneContext") ?? {};
    const result = generateBlenderChatScript(prompt, { mode, sceneContext });

    return ok(
      {
        ...result,
        provider: "local_blender_template",
      },
      {
        status: 201,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return apiError("VALIDATION_ERROR", error.message, 400, error.details);
    }
    return mapUnknownError(error);
  }
}
