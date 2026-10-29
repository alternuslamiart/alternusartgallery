import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asEnum, asString, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;

    const [user, settings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: context.userId },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatarUrl: true, role: true, createdAt: true },
      }),
      prisma.userSettings.findUnique({ where: { userId: context.userId } }),
    ]);

    return ok({ user, userSettings: settings });
  } catch (error) {
    return mapUnknownError(error);
  }
}

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

    const firstName = asString(body, "firstName", { max: 100 });
    const lastName = asString(body, "lastName", { max: 100 });
    const phone = asString(body, "phone", { max: 40 });
    const avatarUrl = asString(body, "avatarUrl", { max: 500 });

    const data = { theme, accentColor, language, timezone, emailNotifications };
    const hasSettings = Object.values(data).some((value) => value !== undefined);
    const hasProfile = firstName !== undefined || lastName !== undefined || phone !== undefined || avatarUrl !== undefined;

    if (!hasSettings && !hasProfile) {
      return apiError("VALIDATION_ERROR", "No supported user settings or profile fields were provided.", 400);
    }

    if (hasProfile) {
      const userData: Record<string, string | null> = {};
      if (firstName !== undefined) userData.firstName = firstName || null;
      if (lastName !== undefined) userData.lastName = lastName || null;
      if (phone !== undefined) userData.phone = phone || null;
      if (avatarUrl !== undefined) userData.avatarUrl = avatarUrl || null;

      await prisma.user.update({
        where: { id: context.userId },
        data: userData,
      });
    }

    let userSettings = null;
    if (hasSettings) {
      userSettings = await prisma.userSettings.upsert({
        where: { userId: context.userId },
        update: data,
        create: { userId: context.userId, ...data },
      });
    } else {
      userSettings = await prisma.userSettings.findUnique({ where: { userId: context.userId } });
    }

    await logActivity({
      workspaceId: context.workspaceId,
      userId: context.userId,
      action: "settings.user_updated",
      entityType: "user_settings",
      entityId: context.userId,
      message: "User settings updated.",
    });

    const user = await prisma.user.findUnique({
      where: { id: context.userId },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatarUrl: true, role: true, createdAt: true },
    });

    return ok({ user, userSettings });
  } catch (error) {
    if (error instanceof ValidationError) return apiError("VALIDATION_ERROR", error.message, 400, error.details);
    return mapUnknownError(error);
  }
}
