import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { consumePersistentRateLimit, rateLimitResponse } from "@/lib/persistent-rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
 try {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = await consumePersistentRateLimit(`password-reset:ip:${ip}`, { limit: 5, windowSeconds: 900 });
  if (!limit.success) return NextResponse.json({ error: "Too many requests. Please try again later." }, rateLimitResponse(limit));
  const body = (await request.json()) as { email?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
   return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" }, isActive: true } });
  if (user?.passwordHash) {
   const token = randomBytes(32).toString("hex");
   await prisma.verificationToken.deleteMany({ where: { identifier: `password-reset:${email}` } });
   await prisma.verificationToken.create({ data: { identifier: `password-reset:${email}`, token, expires: new Date(Date.now() + 60 * 60 * 1000) } });
   await sendPasswordResetEmail(email, token);
  }
  return NextResponse.json({ success: true });
 } catch (error) {
  console.error("[Auth] Password reset request failed:", error);
  return NextResponse.json({ error: "Could not send the reset link." }, { status: 500 });
 }
}
