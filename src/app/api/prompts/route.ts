import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asEnum, asJsonArray, asJsonObject, asString, parseListQuery, sortToOrderBy, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

const categories = ["DESIGN", "IMAGE", "VIDEO", "CODE", "CAD", "BLENDER", "MARKETING", "SYSTEM", "OTHER"] as const;
const statuses = ["DRAFT", "SAVED", "ARCHIVED"] as const;

export async function GET(request: NextRequest) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const query = parseListQuery(request);
 const prompts = await prisma.prompt.findMany({
 where: {
 workspaceId: context.workspaceId,
 ...(query.search ? { OR: [{ title: { contains: query.search, mode: "insensitive" } }, { content: { contains: query.search, mode: "insensitive" } }] } : {}),
 ...(query.type ? { category: query.type.toUpperCase() as never } : {}),
 ...(query.status ? { status: query.status.toUpperCase() as never } : {}),
 },
 orderBy: sortToOrderBy(query.sort) as never,
 take: query.limit,
 });
 return ok({ prompts, pageInfo: { limit: query.limit } });
 } catch (error) {
 return mapUnknownError(error);
 }
}

export async function POST(request: NextRequest) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const body = await readJsonBody(request);
 const title = asString(body, "title", { required: true, max: 120 });
 const prompt = await prisma.prompt.create({
 data: {
 workspaceId: context.workspaceId,
 userId: context.userId,
 projectId: asString(body, "projectId", { max: 80 }),
 title,
 content: asString(body, "content", { required: true, max: 20000 }),
 category: asEnum(body, "category", categories, "OTHER"),
 status: asEnum(body, "status", statuses, "SAVED"),
 tags: asJsonArray(body, "tags") ?? [],
 variables: asJsonObject(body, "variables"),
 },
 });
 await logActivity({ workspaceId: context.workspaceId, userId: context.userId, action: "prompt.saved", entityType: "prompt", entityId: prompt.id, message: `Prompt "${prompt.title}" saved.` });
 return ok({ prompt }, { status: 201 });
 } catch (error) {
 if (error instanceof ValidationError) return apiError("VALIDATION_ERROR", error.message, 400, error.details);
 return mapUnknownError(error);
 }
}
