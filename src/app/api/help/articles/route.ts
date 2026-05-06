import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureHelpArticles } from "@/lib/platform/help-content";
import { mapUnknownError, ok } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await ensureHelpArticles();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const articles = await prisma.helpArticle.findMany({
      where: { published: true, ...(category ? { category } : {}) },
      orderBy: [{ order: "asc" }, { title: "asc" }],
    });
    return ok({ articles });
  } catch (error) {
    return mapUnknownError(error);
  }
}
