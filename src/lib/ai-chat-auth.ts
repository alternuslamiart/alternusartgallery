import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getAuthenticatedAIChatUserId(): Promise<string | null> {
  const session = await auth();
  const sessionUser = session?.user;
  if (!sessionUser) return null;

  if (sessionUser.id) {
    const userById = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, isActive: true },
    });
    if (userById) return userById.isActive ? userById.id : null;
  }

  if (!sessionUser.email) return null;
  const userByEmail = await prisma.user.findFirst({
    where: { email: { equals: sessionUser.email, mode: "insensitive" }, isActive: true },
    select: { id: true },
  });
  return userByEmail?.id ?? null;
}
