import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asEnum, asString, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;

 const body = await readJsonBody(request);
 const theme = asEnum(body, "theme", ["LIGHT", "DARK", "SYSTEM"] as const);
 const accentColor = asString(body, "accentColor", { max: 32 });
 const language = asString(body, "language", { max: 12 });
 const timezone = asString(body, "timezone", { max: 64 });
 const emailNotifications = typeof body.emailNotifications === "boolean" ? body.emailNotifications : undefined;

 const data = { theme, accentColor, language, timezone, emailNotifications };
 if (Object.values(data).every((value) => value === undefined)) {
 return apiError("VALIDATION_ERROR", "No supported user settings fields were provided.", 400);
 }

 const userSettings = await prisma.userSettings.upsert({
 where: { userId: context.userId },
 update: data,
 create: { userId: context.userId, ...data },
 });

 await logActivity({
 workspaceId: context.workspaceId,
 userId: context.userId,
 action: "settings.user_updated",
 entityType: "user_settings",
 entityId: context.userId,
 message: "User settings updated.",
 });

 return ok({ userSettings });
 } catch (error) {
 if (error instanceof ValidationError) return apiError("VALIDATION_ERROR", error.message, 400, error.details);
 return mapUnknownError(error);
 }
}
