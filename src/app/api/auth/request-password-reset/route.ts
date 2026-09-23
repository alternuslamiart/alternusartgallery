import { createHmac } from "node:crypto";
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
   const expires = Date.now() + 60 * 60 * 1000;
   const payload = Buffer.from(JSON.stringify({ email, expires }), "utf8").toString("base64url");
   const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || process.env.SMTP_PASS?.replace(/\s/g, "");
   if (!secret) throw new Error("Password reset signing secret is not configured.");
   const signature = createHmac("sha256", secret).update(payload).digest("base64url");
   const token = `${payload}.${signature}`;
   try {
    const emailSent = await sendPasswordResetEmail(email, token);
    if (!emailSent) {
     return NextResponse.json({ error: "Email delivery is not configured. Please contact support." }, { status: 503 });
    }
   } catch (error) {
    console.error("[Auth] Password reset email failed:", error);
    return NextResponse.json({ error: "Could not send the reset link." }, { status: 502 });
   }
  }
  return NextResponse.json({ success: true });
 } catch (error) {
  console.error("[Auth] Password reset request failed:", error);
  return NextResponse.json({ error: "Could not send the reset link." }, { status: 500 });
 }
}
