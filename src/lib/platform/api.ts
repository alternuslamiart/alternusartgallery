import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ValidationError } from "@/lib/platform/validation";
import { sanitizeAndInspectPayload } from "@/lib/security/cyber-shield.mjs";

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

const userWorkspaceCache = new Map<string, string>();
export async function requirePlatformContext(): Promise<PlatformContext | NextResponse> {
 const session = await auth();
 const userId = session?.user?.id;
 if (!userId) {
 return apiError("UNAUTHENTICATED", "You must be signed in to use this workspace API.", 401);
 }

 const cachedWorkspaceId = userWorkspaceCache.get(userId);
 if (cachedWorkspaceId) return { userId, workspaceId: cachedWorkspaceId };
 const workspace = await prisma.workspace.findFirst({
 where: { ownerId: userId },
 orderBy: { createdAt: "asc" },
 });

 if (workspace) {
 userWorkspaceCache.set(userId, workspace.id);
 if (userWorkspaceCache.size > 256) userWorkspaceCache.delete(userWorkspaceCache.keys().next().value!);
 void ensureWorkspaceDefaultsOnce(userId, workspace.id, workspace.trialEndsAt, workspace.plan).catch(() => {});
 return { userId, workspaceId: workspace.id };
 }

 // The read and creation must share a serializable transaction. Otherwise two
 // first requests can create two personal workspaces for the same owner.
 for (let attempt = 0; attempt < 3; attempt++) {
  try {
   const workspaceId = await prisma.$transaction(async tx => {
    const existing = await tx.workspace.findFirst({ where: { ownerId: userId }, orderBy: { createdAt: "asc" } });
    if (existing) return existing.id;
    const trialEndsAt = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000);
    const created = await tx.workspace.create({ data: { ownerId: userId, name: "Personal", plan: "TRIAL", trialEndsAt } });
    await tx.workspaceMember.create({ data: { workspaceId: created.id, userId, role: "OWNER" } });
    await tx.subscriptionState.create({ data: { workspaceId: created.id, plan: "TRIAL", status: "TRIALING", trialEndsAt, usageLimits: defaultUsageLimits() } });
    await tx.workspaceSettings.create({ data: { workspaceId: created.id, allowedAssetTypes: defaultAllowedAssetTypes() } });
    await tx.userSettings.upsert({ where: { userId }, update: {}, create: { userId } });
    return created.id;
   }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 15000, timeout: 15000 });
   userWorkspaceCache.set(userId, workspaceId);
   if (userWorkspaceCache.size > 256) userWorkspaceCache.delete(userWorkspaceCache.keys().next().value!);
   return { userId, workspaceId };
  } catch (error) {
   if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") || attempt === 2) throw error;
   await new Promise(resolve => setTimeout(resolve, 40 * 2 ** attempt));
  }
 }
 throw new Error("Workspace initialization failed.");
}

export function isApiResponse(value: PlatformContext | NextResponse): value is NextResponse {
 return value instanceof NextResponse;
}

const initializedWorkspaces = new Map<string, Promise<void>>();

async function ensureWorkspaceDefaultsOnce(userId: string, workspaceId: string, existingTrialEndsAt: Date | null, plan: Prisma.WorkspaceCreateInput["plan"]) {
 const key = `${userId}:${workspaceId}`;
 let pending = initializedWorkspaces.get(key);
 if (!pending) {
  const trialEndsAt = existingTrialEndsAt ?? new Date(Date.now() + 12 * 24 * 60 * 60 * 1000);
  pending = (async () => { await prisma.workspaceMember.upsert({ where: { workspaceId_userId: { workspaceId, userId } }, update: {}, create: { workspaceId, userId, role: "OWNER" } }); await prisma.subscriptionState.upsert({ where: { workspaceId }, update: {}, create: { workspaceId, plan: plan ?? "TRIAL", status: "TRIALING", trialEndsAt, usageLimits: defaultUsageLimits() } }); await prisma.workspaceSettings.upsert({ where: { workspaceId }, update: {}, create: { workspaceId, allowedAssetTypes: defaultAllowedAssetTypes() } }); await prisma.userSettings.upsert({ where: { userId }, update: {}, create: { userId } }); })(); if (false) void Promise.all([
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
 plan: plan ?? "TRIAL",
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
  initializedWorkspaces.set(key, pending);
  if (initializedWorkspaces.size > 256) initializedWorkspaces.delete(initializedWorkspaces.keys().next().value!);
  void pending.catch(() => { if (initializedWorkspaces.get(key) === pending) initializedWorkspaces.delete(key); });
 }
 await pending;
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

export async function readJsonBody(request: NextRequest, maxBytes = 262_144) {
 try {
 const contentLength = Number(request.headers.get("content-length") || "0");
 if (Number.isFinite(contentLength) && contentLength > maxBytes) {
 throw new ValidationError("Request payload exceeds maximum allowed size.", { maxBytes });
 }
 const rawText = await request.text();
 if (!rawText.trim()) return {};
 if (rawText.length > maxBytes) {
 throw new ValidationError("Request payload exceeds maximum allowed size.", { maxBytes });
 }
 const parsed = JSON.parse(rawText) as unknown;
 if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
 return {};
 }
 return sanitizeAndInspectPayload(parsed) as Record<string, unknown>;
 } catch (error) {
 if (error instanceof ValidationError) throw error;
 if (error instanceof Error && (error.message.includes("Forbidden object key") || error.message.includes("Null byte") || error.message.includes("exceeds maximum"))) {
 throw new ValidationError(error.message);
 }
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
