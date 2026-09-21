import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { consumePersistentRateLimit, rateLimitResponse } from "@/lib/persistent-rate-limit"

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
 try {
 const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
 const limit = await consumePersistentRateLimit(`signup:ip:${ip}`, { limit: 5, windowSeconds: 900 })
 if (!limit.success) {
 return NextResponse.json({ error: "Too many registration attempts. Please try again later." }, rateLimitResponse(limit))
 }
 const body = (await request.json()) as {
  email?: unknown
  password?: unknown
  firstName?: unknown
  lastName?: unknown
 }
 const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
 const password = typeof body.password === "string" ? body.password : ""
 const firstName = typeof body.firstName === "string" ? body.firstName.trim() : ""
 const lastName = typeof body.lastName === "string" ? body.lastName.trim() : ""

 // Validate required fields
 if (!email || !password) {
 return NextResponse.json(
 { error: "Email and password are required" },
 { status: 400 }
 )
 }

 // Validate email format
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 if (!emailRegex.test(email) || email.length > 320) {
 return NextResponse.json(
 { error: "Invalid email format" },
 { status: 400 }
 )
 }

 // Validate password strength
 if (password.length < 8 || password.length > 128) {
 return NextResponse.json(
 { error: "Password must be at least 8 characters" },
 { status: 400 }
 )
 }

 // Check if user already exists
 const existingUser = await prisma.user.findUnique({
 where: { email },
 })

 if (existingUser) {
 return NextResponse.json(
 { error: "User with this email already exists" },
 { status: 409 }
 )
 }

 // Hash password
 const passwordHash = await bcrypt.hash(password, 12)

 // Create user
 const user = await prisma.user.create({
 data: {
 email,
 passwordHash,
 firstName: firstName || null,
 lastName: lastName || null,
 role: "CUSTOMER",
 emailVerified: false,
 isActive: true,
 },
 })

 return NextResponse.json({
 success: true,
 user: {
 id: user.id,
 email: user.email,
 firstName: user.firstName,
 lastName: user.lastName,
 },
 })
 } catch (error) {
 console.error("Signup error:", error)
 return NextResponse.json(
 { error: "Failed to create account" },
 { status: 500 }
 )
 }
}
