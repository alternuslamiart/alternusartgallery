import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
 try {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();

  if (!email || !body.password) {
   return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
   where: { email: { equals: email, mode: "insensitive" } },
  });

  if (!user?.passwordHash || !(await bcrypt.compare(body.password, user.passwordHash))) {
   return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await prisma.verificationToken.deleteMany({ where: { identifier: `login:${email}` } });
  await prisma.verificationToken.create({
   data: {
    identifier: `login:${email}`,
    token: code,
    expires: new Date(Date.now() + 10 * 60 * 1000),
   },
  });

  try {
   const emailSent = await sendVerificationEmail(email, code);
   if (!emailSent) {
    await prisma.verificationToken.deleteMany({ where: { identifier: `login:${email}` } });
    return NextResponse.json({ error: "Email delivery is not configured. Please contact support." }, { status: 503 });
   }
  } catch (error) {
   await prisma.verificationToken.deleteMany({ where: { identifier: `login:${email}` } });
   console.error("[Auth] Login verification email failed:", error);
   return NextResponse.json({ error: "Could not send the verification code." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
 } catch (error) {
  console.error("[Auth] Login code request failed:", error);
  return NextResponse.json({ error: "Could not start email verification." }, { status: 500 });
 }
}
