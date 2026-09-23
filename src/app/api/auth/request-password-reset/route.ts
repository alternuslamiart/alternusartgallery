import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
 try {
  const body = (await request.json()) as { email?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
   return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  const expires = Date.now() + 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ email, expires }), "utf8").toString("base64url");
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || process.env.SMTP_PASS?.replace(/\s/g, "");
  if (!secret) {
   console.error("[Auth] Password reset signing secret is not configured.");
   return NextResponse.json({ error: "Password reset is not configured. Please contact support." }, { status: 503 });
  }
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  const token = `${payload}.${signature}`;
  try {
   const emailSent = await sendPasswordResetEmail(email, token);
   if (!emailSent) {
    return NextResponse.json({ error: "Email delivery is not configured. Please contact support." }, { status: 503 });
   }
  } catch (error) {
   console.error("[Auth] Password reset email failed:", error);
   const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
   const message = code === "EAUTH"
    ? "Gmail rejected the SMTP login. Use a Google App Password in SMTP_PASS, not your normal Gmail password."
    : code === "ETIMEDOUT" || code === "ESOCKET"
     ? "The email server could not be reached. Check SMTP_HOST, SMTP_PORT, and SMTP_SECURE."
     : "Could not send the reset link. Check the SMTP settings in Vercel.";
   return NextResponse.json({ error: message }, { status: 502 });
  }
  return NextResponse.json({ success: true });
 } catch (error) {
  console.error("[Auth] Password reset request failed:", error);
  return NextResponse.json({ error: "Could not send the reset link." }, { status: 500 });
 }
}
