import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
 try {
  const body = (await request.json()) as {
   email?: unknown;
   password?: unknown;
   firstName?: unknown;
   lastName?: unknown;
   phone?: unknown;
  };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";

  if (!email || !password || !firstName || !lastName) {
   return NextResponse.json({ error: "All required fields must be provided." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
   return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 128) {
   return NextResponse.json({ error: "Password must be between 8 and 128 characters." }, { status: 400 });
  }
  if (firstName.length > 100 || lastName.length > 100 || phone.length > 40) {
   return NextResponse.json({ error: "Profile fields are too long." }, { status: 400 });
  }

  const existingUser = await prisma.user.findFirst({
   where: { email: { equals: email, mode: "insensitive" } },
  });
  if (existingUser) {
   return NextResponse.json(
    { error: "This email is already registered. Please sign in instead." },
    { status: 409 }
   );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
   data: {
    email,
    passwordHash,
    firstName,
    lastName,
    phone: phone || null,
    role: "CUSTOMER",
    emailVerified: false,
    isActive: true,
   },
  });

  return NextResponse.json({
   success: true,
   message: "Account created. Verify your email before signing in.",
   user: {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
   },
  });
 } catch (error) {
  console.error("[Auth] Registration failed:", error);
  return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
 }
}
