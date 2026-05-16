import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { createStubJob } from "@/lib/platform/stub-provider";
import { asEnum, asJsonArray, asString, parseListQuery, sortToOrderBy, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

const prototypeTypes = ["WEBSITE", "MOBILE_APP", "DASHBOARD", "LANDING_PAGE", "DESIGN_SYSTEM"] as const;
const qualities = ["WIREFRAME", "HIGH_FIDELITY"] as const;

export async function GET(request: NextRequest) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const query = parseListQuery(request);

 const prototypes = await prisma.prototype.findMany({
 where: {
 workspaceId: context.workspaceId,
 deletedAt: null,
 ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
 ...(query.type ? { type: query.type.toUpperCase() as never } : {}),
 ...(query.quality ? { quality: query.quality.toUpperCase() as never } : {}),
 ...(query.status ? { status: query.status.toUpperCase() as never } : {}),
 ...(query.projectId ? { projectId: query.projectId } : {}),
 ...(query.tab === "mine" ? { userId: context.userId } : {}),
 ...(query.tab === "design_systems" ? { type: "DESIGN_SYSTEM" } : {}),
 },
 orderBy: sortToOrderBy(query.sort) as never,
 take: query.limit,
 });

 return ok({ prototypes, pageInfo: { limit: query.limit } });
 } catch (error) {
 return mapUnknownError(error);
 }
}

export async function POST(request: NextRequest) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const body = await readJsonBody(request);
 const name = asString(body, "name", { required: true, max: 120 });
 const type = asEnum(body, "type", prototypeTypes, "WEBSITE");
 const quality = asEnum(body, "quality", qualities, "HIGH_FIDELITY");
 const brief = asString(body, "brief", { max: 5000 });
 const projectId = asString(body, "projectId", { max: 80 });
 const tags = asJsonArray(body, "tags") ?? [];

 if (projectId) {
 const project = await prisma.project.findFirst({ where: { id: projectId, workspaceId: context.workspaceId, deletedAt: null } });
 if (!project) return apiError("NOT_FOUND", "Project not found.", 404);
 }

 const designSystem = await prisma.designSystem.create({
 data: {
 workspaceId: context.workspaceId,
 userId: context.userId,
 projectId,
 name: `${name} design system`,
 colorPreset: "SKY_PAPER_GRAPHITE",
 typographyPreset: "CLEAN_UI_SCALE",
 spacingPreset: "EIGHT_PX_RHYTHM",
 tokens: {},
 },
 });

 const prototype = await prisma.prototype.create({
 data: {
 workspaceId: context.workspaceId,
 userId: context.userId,
 projectId,
 name,
 type,
 quality,
 brief,
 tags,
 designSystemId: designSystem.id,
 },
 });

 await prisma.designSystem.update({ where: { id: designSystem.id }, data: { prototypeId: prototype.id } });
 await createStubJob(context, "DESIGN_GENERATION", { prototypeId: prototype.id, name, type, quality }, "Prototype generation stub recorded.");
 await logActivity({
 workspaceId: context.workspaceId,
 userId: context.userId,
 action: "prototype.created",
 entityType: "prototype",
 entityId: prototype.id,
 message: `Prototype "${prototype.name}" created.`,
 });

 return ok({ prototype, designSystem }, { status: 201 });
 } catch (error) {
 if (error instanceof ValidationError) return apiError("VALIDATION_ERROR", error.message, 400, error.details);
 return mapUnknownError(error);
 }
}
