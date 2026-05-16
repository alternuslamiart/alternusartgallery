import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asEnum, asString, parseListQuery, sortToOrderBy, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

const languages = ["JAVASCRIPT", "TYPESCRIPT", "PYTHON", "GO", "RUST", "HTML", "CSS", "OTHER"] as const;
const statuses = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;

export async function GET(request: NextRequest) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const query = parseListQuery(request);
 const projects = await prisma.codeProject.findMany({
 where: {
 workspaceId: context.workspaceId,
 ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
 ...(query.status ? { status: query.status.toUpperCase() as never } : {}),
 ...(query.projectId ? { projectId: query.projectId } : {}),
 },
 orderBy: sortToOrderBy(query.sort) as never,
 take: query.limit,
 });
 return ok({ projects, pageInfo: { limit: query.limit } });
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
 const project = await prisma.codeProject.create({
 data: {
 workspaceId: context.workspaceId,
 userId: context.userId,
 projectId: asString(body, "projectId", { max: 80 }),
 name,
 description: asString(body, "description", { max: 2000 }),
 language: asEnum(body, "language", languages, "TYPESCRIPT"),
 framework: asString(body, "framework", { max: 80 }),
 status: asEnum(body, "status", statuses, "DRAFT"),
 files: [],
 },
 });
 await logActivity({ workspaceId: context.workspaceId, userId: context.userId, action: "code_project.created", entityType: "code_project", entityId: project.id, message: `Code project "${project.name}" created.` });
 return ok({ project }, { status: 201 });
 } catch (error) {
 if (error instanceof ValidationError) return apiError("VALIDATION_ERROR", error.message, 400, error.details);
 return mapUnknownError(error);
 }
}
