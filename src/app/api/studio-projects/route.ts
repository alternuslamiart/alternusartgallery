import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isApiResponse, requirePlatformContext } from "@/lib/platform/api";
import { MAX_SCENE_BYTES, validateDocument } from "@/lib/scene/document.mjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const kind = "casynus-scene";
const error = (message: string, status: number) => NextResponse.json({ error: message }, { status });
function logStorageFailure(operation: string, caught: unknown) {
  // Prisma codes identify connection/pool failures without logging documents,
  // account identifiers, URLs, or credentials.
  const code = caught instanceof Prisma.PrismaClientKnownRequestError ? caught.code : caught instanceof Prisma.PrismaClientInitializationError ? caught.errorCode : "UNKNOWN";
  console.error("studio-project-storage", { operation, code });
}

export async function GET(request: NextRequest) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = request.nextUrl.searchParams.get("id");
    const scope = { workspaceId: context.workspaceId, userId: context.userId, deletedAt: null };
    if (id) {
      const row = await prisma.blenderProject.findFirst({ where: { ...scope, id, settings: { path: ["kind"], equals: kind } } });
      if (!row) return error("Project not found.", 404);
      const settings = row.settings as { revision: number; document: unknown };
      return NextResponse.json({ document: validateDocument(settings.document), revision: settings.revision });
    }
    const projects = await prisma.blenderProject.findMany({ where: { ...scope, settings: { path: ["kind"], equals: kind } }, orderBy: { updatedAt: "desc" }, take: 100, select: { id: true, name: true, updatedAt: true } });
    return NextResponse.json({ projects });
  } catch (caught) { logStorageFailure("read", caught); return error("Project storage is unavailable. Your browser recovery copy has not been uploaded.", 503); }
}

class SceneConflict extends Error {}

export async function PUT(request: NextRequest) {
  let context;
  try { context = await requirePlatformContext(); }
  catch (caught) { logStorageFailure("context", caught); return error("Workspace storage is unavailable. Keep your recovery copy or download JSON.", 503); }
  if (isApiResponse(context)) return context;
  let document;
  let revision: number;
  try {
    if (Number(request.headers.get("content-length") || 0) > MAX_SCENE_BYTES + 1000) return error("Project is too large.", 413);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_SCENE_BYTES + 1000) return error("Project is too large.", 413);
    const body = JSON.parse(raw);
    document = validateDocument(body.document);
    if (!Number.isSafeInteger(body.revision) || body.revision < 0 || body.revision > 2_000_000_000) return error("Invalid project revision.", 400);
    revision = body.revision;
  } catch (caught) { return error(caught instanceof Error ? caught.message : "Invalid project document.", 400); }
  try {
    const scope = { workspaceId: context.workspaceId, userId: context.userId, deletedAt: null };
    const settings = JSON.parse(JSON.stringify({ kind, revision: revision + 1, document })) as Prisma.InputJsonValue;
    await prisma.$transaction(async tx => {
      const existing = await tx.blenderProject.findFirst({ where: { ...scope, id: document.id } });
      if (existing) {
        const current = existing.settings as { kind?: string; revision?: number } | null;
        if (current?.kind !== kind || current.revision !== revision) throw new SceneConflict();
        const result = await tx.blenderProject.updateMany({
          where: { ...scope, id: document.id, settings: { path: ["revision"], equals: revision } },
          data: { name: document.name, settings },
        });
        if (result.count !== 1) throw new SceneConflict();
        await tx.project.updateMany({ where: { ...scope, id: document.id }, data: { name: document.name } });
      } else {
        if (revision !== 0 || await tx.project.findUnique({ where: { id: document.id } }) || await tx.blenderProject.findUnique({ where: { id: document.id } })) throw new SceneConflict();
        await tx.project.create({ data: { id: document.id, workspaceId: context.workspaceId, userId: context.userId, name: document.name, type: "CAD" } });
        // Reuse the existing JSON-capable scene container, not a Blender job.
        await tx.blenderProject.create({ data: { id: document.id, projectId: document.id, workspaceId: context.workspaceId, userId: context.userId, name: document.name, settings } });
      }
    });
    return NextResponse.json({ id: document.id, revision: revision + 1, saved: true });
  } catch (caught) {
    if (caught instanceof SceneConflict || (caught instanceof Prisma.PrismaClientKnownRequestError && caught.code === "P2002")) return error("A newer version or another project already uses this ID. Reopen the cloud version or save a copy.", 409);
    logStorageFailure("write", caught);
    return error("Project could not be saved. Keep the browser recovery copy or download JSON.", 503);
  }
}
