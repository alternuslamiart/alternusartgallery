import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
 try {
  const session = await auth();
  if (!session?.user?.id) {
   return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
   where: { id: session.user.id },
   select: { age: true },
  });
  if (!user) {
   return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ age: user.age });
 } catch (error) {
  console.error("[Auth] Could not load user age:", error);
  return NextResponse.json({ error: "Could not load your age." }, { status: 500 });
 }
}

export async function POST(request: NextRequest) {
 try {
  const session = await auth();
  if (!session?.user?.id) {
   return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const body = (await request.json()) as { age?: unknown };
  if (typeof body.age !== "number" || !Number.isInteger(body.age) || body.age < 1 || body.age > 120) {
   return NextResponse.json({ error: "Enter a valid age between 1 and 120." }, { status: 400 });
  }

  await prisma.user.update({
   where: { id: session.user.id },
   data: { age: body.age },
  });

  return NextResponse.json({ success: true, age: body.age });
 } catch (error) {
  console.error("[Auth] Could not save user age:", error);
  return NextResponse.json({ error: "Could not save your age." }, { status: 500 });
 }
}
