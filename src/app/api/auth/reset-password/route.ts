import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
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
  const [payload, signature] = token.split(".");
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!payload || !signature || !secret) {
   return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }
  const expectedSignature = createHmac("sha256", secret).update(payload).digest("base64url");
  const signaturesMatch = signature.length === expectedSignature.length &&
   timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  if (!signaturesMatch) {
   return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }
  let tokenData: { email?: unknown; expires?: unknown };
  try {
   tokenData = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email?: unknown; expires?: unknown };
  } catch {
   return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }
  const email = typeof tokenData.email === "string" ? tokenData.email : "";
  if (!email || typeof tokenData.expires !== "number" || tokenData.expires < Date.now()) {
   return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { email }, data: { passwordHash } });
  return NextResponse.json({ success: true });
 } catch (error) {
  console.error("[Auth] Password reset failed:", error);
  return NextResponse.json({ error: "Could not reset your password." }, { status: 500 });
 }
}
