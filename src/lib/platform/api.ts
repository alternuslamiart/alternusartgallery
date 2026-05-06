import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type PlatformContext = {
  userId: string;
  workspaceId: string;
};

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "INTERNAL_ERROR";

export function apiError(code: ApiErrorCode, message: string, status: number, details: Record<string, unknown> = {}) {
  return NextResponse.json({ error: { code, message, details } }, { status });
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export async function requirePlatformContext(): Promise<PlatformContext | NextResponse> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return apiError("UNAUTHENTICATED", "You must be signed in to use this workspace API.", 401);
  }

  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
  });

  if (workspace) {
    await ensureWorkspaceDefaults(userId, workspace.id);
    return { userId, workspaceId: workspace.id };
  }

  const trialEndsAt = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000);
  const created = await prisma.workspace.create({
    data: {
      ownerId: userId,
      name: "Personal",
      plan: "TRIAL",
      trialEndsAt,
    },
  });

  await Promise.all([
    prisma.workspaceMember.create({
      data: { workspaceId: created.id, userId, role: "OWNER" },
    }),
    prisma.subscriptionState.create({
      data: {
        workspaceId: created.id,
        plan: "TRIAL",
        status: "TRIALING",
        trialEndsAt,
        usageLimits: defaultUsageLimits(),
      },
    }),
    prisma.workspaceSettings.create({
      data: { workspaceId: created.id, allowedAssetTypes: defaultAllowedAssetTypes() },
    }),
    prisma.userSettings.upsert({
      where: { userId },
      update: {},
      create: { userId },
    }),
  ]);

  return { userId, workspaceId: created.id };
}

export function isApiResponse(value: PlatformContext | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}

async function ensureWorkspaceDefaults(userId: string, workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  const trialEndsAt = workspace?.trialEndsAt ?? new Date(Date.now() + 12 * 24 * 60 * 60 * 1000);

  await Promise.all([
    prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId, userId } },
      update: {},
      create: { workspaceId, userId, role: "OWNER" },
    }),
    prisma.subscriptionState.upsert({
      where: { workspaceId },
      update: {},
      create: {
        workspaceId,
        plan: workspace?.plan ?? "TRIAL",
        status: "TRIALING",
        trialEndsAt,
        usageLimits: defaultUsageLimits(),
      },
    }),
    prisma.workspaceSettings.upsert({
      where: { workspaceId },
      update: {},
      create: { workspaceId, allowedAssetTypes: defaultAllowedAssetTypes() },
    }),
    prisma.userSettings.upsert({
      where: { userId },
      update: {},
      create: { userId },
    }),
  ]);
}

export function defaultUsageLimits(): Prisma.InputJsonObject {
  return {
    prototypes: 25,
    assetsMb: 500,
    prompts: 100,
    activeJobs: 10,
  };
}

export function defaultAllowedAssetTypes(): Prisma.InputJsonArray {
  return ["image", "vector", "model", "document", "texture", "reference", "export", "audio", "code", "unknown"];
}

export async function readJsonBody(request: NextRequest) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function mapUnknownError(error: unknown) {
  console.error(error);
  return apiError("INTERNAL_ERROR", "Unexpected server error.", 500);
}

export function parseId(params: { id?: string; slug?: string }, key: "id" | "slug" = "id") {
  const value = params[key];
  if (!value || value.length > 200 || value.includes("..")) {
    return null;
  }
  return value;
}

export async function logActivity(input: {
  workspaceId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  message: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.activityLog.create({
    data: {
      workspaceId: input.workspaceId,
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      message: input.message,
      metadata: input.metadata ?? undefined,
    },
  });
}

export async function createNotification(input: {
  workspaceId: string;
  userId: string;
  type: string;
  title: string;
  message?: string;
  actionUrl?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.notification.create({
    data: {
      workspaceId: input.workspaceId,
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      actionUrl: input.actionUrl,
      linkUrl: input.actionUrl,
      metadata: input.metadata ?? undefined,
    },
  });
}
