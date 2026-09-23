import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
 try {
  const body = (await request.json()) as { token?: unknown; password?: unknown };
  const token = typeof body.token === "string" ? body.token : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!token || password.length < 8 || password.length > 128) {
   return NextResponse.json({ error: "The reset link or password is invalid." }, { status: 400 });
  }
  const resetToken = await prisma.verificationToken.findUnique({ where: { token } });
  if (!resetToken || !resetToken.identifier.startsWith("password-reset:") || resetToken.expires < new Date()) {
   return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }
  const email = resetToken.identifier.slice("password-reset:".length);
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
   prisma.user.update({ where: { email }, data: { passwordHash } }),
   prisma.verificationToken.delete({ where: { token } }),
  ]);
  return NextResponse.json({ success: true });
 } catch (error) {
  console.error("[Auth] Password reset failed:", error);
  return NextResponse.json({ error: "Could not reset your password." }, { status: 500 });
 }
}
