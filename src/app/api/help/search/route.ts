import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureHelpArticles } from "@/lib/platform/help-content";
import { mapUnknownError, ok } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await ensureHelpArticles();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();
    const articles = await prisma.helpArticle.findMany({
      where: {
        published: true,
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { category: { contains: query, mode: "insensitive" } },
                { content: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ order: "asc" }, { title: "asc" }],
      take: 20,
    });
    return ok({ articles });
  } catch (error) {
    return mapUnknownError(error);
  }
}
