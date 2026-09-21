import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { consumePersistentRateLimit, rateLimitResponse } from "@/lib/persistent-rate-limit";

export const dynamic = "force-dynamic";

function normalizeEmail(value: unknown) {
 return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function POST(request: NextRequest) {
 try {
  const body = (await request.json()) as { email?: unknown; action?: unknown };
  const email = normalizeEmail(body.email);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
   return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }
  if (body.action !== "send") {
   return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = await consumePersistentRateLimit(`verify-send:ip:${ip}`, { limit: 3, windowSeconds: 900 });
  if (!limit.success) {
   return NextResponse.json({ error: "Too many verification requests. Please try again later." }, rateLimitResponse(limit));
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
   return NextResponse.json({ error: "No account was found for this email." }, { status: 404 });
  }
  if (user.emailVerified) {
   return NextResponse.json({ success: true, message: "Email is already verified." });
  }

  const code = randomInt(100000, 1000000).toString();
  await prisma.verificationToken.deleteMany({ where: { identifier: `signup:${email}` } });
  await prisma.verificationToken.create({
   data: {
    identifier: `signup:${email}`,
    token: code,
    expires: new Date(Date.now() + 10 * 60 * 1000),
   },
  });

  try {
   if (!(await sendVerificationEmail(email, code))) throw new Error("Email delivery is not configured.");
  } catch (error) {
   await prisma.verificationToken.deleteMany({ where: { identifier: `signup:${email}` } });
   console.error("[Auth] Verification email failed:", error);
   return NextResponse.json({ error: "Could not send the verification code." }, { status: 502 });
  }

  return NextResponse.json({ success: true, message: "Verification code sent." });
 } catch (error) {
  console.error("[Auth] Verification request failed:", error);
  return NextResponse.json({ error: "Failed to send verification code." }, { status: 500 });
 }
}

export async function PUT(request: NextRequest) {
 try {
  const body = (await request.json()) as { email?: unknown; code?: unknown };
  const email = normalizeEmail(body.email);
  const code = typeof body.code === "string" ? body.code.trim() : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) {
   return NextResponse.json({ error: "Email and a valid 6-digit code are required." }, { status: 400 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = await consumePersistentRateLimit(`verify-code:ip:${ip}:${email}`, { limit: 10, windowSeconds: 900 });
  if (!limit.success) {
   return NextResponse.json({ error: "Too many verification attempts. Please request a new code later." }, rateLimitResponse(limit));
  }

  const verification = await prisma.verificationToken.findFirst({
   where: { identifier: `signup:${email}`, token: code, expires: { gt: new Date() } },
  });
  if (!verification) {
   return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 });
  }

  await prisma.$transaction([
   prisma.verificationToken.delete({ where: { token: verification.token } }),
   prisma.user.updateMany({ where: { email, emailVerified: false }, data: { emailVerified: true } }),
  ]);

  return NextResponse.json({ success: true, message: "Email verified successfully." });
 } catch (error) {
  console.error("[Auth] Email verification failed:", error);
  return NextResponse.json({ error: "Failed to verify email." }, { status: 500 });
 }
}
