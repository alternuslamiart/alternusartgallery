import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, mapUnknownError, ok, parseId } from "@/lib/platform/api";
import { ensureHelpArticles } from "@/lib/platform/help-content";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await ensureHelpArticles();
    const slug = parseId(params, "slug");
    if (!slug) return apiError("VALIDATION_ERROR", "Invalid article slug.", 400);
    const article = await prisma.helpArticle.findFirst({ where: { slug, published: true } });
    if (!article) return apiError("NOT_FOUND", "Help article not found.", 404);
    return ok({ article });
  } catch (error) {
    return mapUnknownError(error);
  }
}
