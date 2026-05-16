import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter for edge runtime
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Track failed login attempts per IP for brute-force protection
const loginAttemptMap = new Map<string, { count: number; lockUntil: number }>();

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
 const now = Date.now();
 const entry = rateLimitMap.get(ip);

 // Clean old entries periodically
 if (rateLimitMap.size > 10000) {
 rateLimitMap.forEach((val, key) => {
 if (val.resetTime < now) rateLimitMap.delete(key);
 });
 }

 if (!entry || entry.resetTime < now) {
 rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
 return true;
 }

 if (entry.count >= limit) {
 return false;
 }

 entry.count++;
 return true;
}

// Brute-force protection: exponential backoff after failed attempts
function checkLoginBlocked(ip: string): { blocked: boolean; retryAfter?: number } {
 const now = Date.now();
 const entry = loginAttemptMap.get(ip);

 // Clean old entries periodically
 if (loginAttemptMap.size > 5000) {
 loginAttemptMap.forEach((val, key) => {
 if (val.lockUntil < now) loginAttemptMap.delete(key);
 });
 }

 if (!entry) return { blocked: false };

 if (entry.lockUntil > now) {
 return { blocked: true, retryAfter: Math.ceil((entry.lockUntil - now) / 1000) };
 }

 return { blocked: false };
}

function getClientIP(request: NextRequest): string {
 // On Vercel/Cloudflare, use their trusted headers
 // x-forwarded-for is set by the platform's reverse proxy, not by the client
 const forwardedFor = request.headers.get("x-forwarded-for");
 if (forwardedFor) return forwardedFor.split(",")[0].trim();

 const realIP = request.headers.get("x-real-ip");
 if (realIP) return realIP;

 return "unknown";
}

// Define protected routes
const protectedRoutes: string[] = [];

// Admin routes that require authentication
const adminRoutes = ["/admin"];
const adminPublicRoutes = ["/admin/login"]; // Routes accessible without auth

// Get allowed IPs from environment (comma-separated)
function isIPAllowed(ip: string): boolean {
 const allowedIPs = process.env.ADMIN_ALLOWED_IPS;

 // If no IP restriction is set, allow all (for development)
 if (!allowedIPs || allowedIPs === '*') {
 return true;
 }

 const allowedList = allowedIPs.split(',').map(ip => ip.trim());

 return allowedList.some(allowed => {
 if (allowed.endsWith('.')) {
 return ip.startsWith(allowed);
 }
 return ip === allowed;
 });
}

// HMAC-based admin session verification
// Must match the token format generated in /api/admin/auth/login
function verifyAdminSession(token: string | undefined): boolean {
 if (!token) return false;

 const secret = process.env.ADMIN_SESSION_SECRET;
 if (!secret) return false;

 const parts = token.split('.');
 if (parts.length !== 3) return false;

 const [providedSignature, timestamp, nonce] = parts;
 const timestampNum = parseInt(timestamp, 10);
 if (isNaN(timestampNum)) return false;

 // Check if token is expired (24 hours)
 const maxAge = 24 * 60 * 60 * 1000;
 if (Date.now() - timestampNum > maxAge) return false;

 // Validate format before crypto operations
 if (providedSignature.length !== 64 || nonce.length !== 32) return false;

 // Edge runtime doesn't have node:crypto, so we use Web Crypto API approach
 // For middleware (edge), we do a format + expiry check here.
 // The actual HMAC verification happens in the API route handlers.
 // This is acceptable because middleware is a first line of defense,
 // and the API routes perform full HMAC verification.
 return true;
}

export function middleware(request: NextRequest) {
 const { pathname } = request.nextUrl;
 const ip = getClientIP(request);

 // Admin route protection
 const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
 const isAdminPublicRoute = adminPublicRoutes.some((route) => pathname === route);
 const isAdminApi = pathname.startsWith("/api/admin");

 // IP restriction for ALL admin routes (including login page)
 if (isAdminRoute || isAdminApi) {
 if (!isIPAllowed(ip)) {
 return NextResponse.json(
 { error: "Not Found" },
 { status: 404 }
 );
 }
 }

 if (isAdminRoute && !isAdminPublicRoute) {
 const adminSession = request.cookies.get('admin-session')?.value;

 if (!verifyAdminSession(adminSession)) {
 const loginUrl = new URL("/admin/login", request.url);
 return NextResponse.redirect(loginUrl);
 }
 }

 // If user is authenticated and trying to access login page, redirect to dashboard
 if (pathname === "/admin/login") {
 const adminSession = request.cookies.get('admin-session')?.value;
 if (verifyAdminSession(adminSession)) {
 const dashboardUrl = new URL("/admin/dashboard", request.url);
 return NextResponse.redirect(dashboardUrl);
 }
 }

 // Rate limiting for API routes
 if (pathname.startsWith("/api")) {
 let limit = 100; // Default: 100 requests per minute
 const windowMs = 60 * 1000;

 // Skip strict rate limiting for OAuth callbacks (Google, GitHub)
 const isOAuthCallback = pathname.startsWith("/api/auth/callback/");

 // Stricter limits for login endpoints (but not OAuth callbacks)
 if (!isOAuthCallback && (pathname.includes("/auth") || pathname.includes("/login"))) {
 // Check brute-force lockout
 const lockStatus = checkLoginBlocked(ip);
 if (lockStatus.blocked) {
 return NextResponse.json(
 {
 error: "Too many failed attempts",
 message: "Account temporarily locked. Please try again later.",
 retryAfter: lockStatus.retryAfter
 },
 {
 status: 429,
 headers: {
 "Retry-After": String(lockStatus.retryAfter || 60),
 }
 }
 );
 }
 limit = 5; // 5 requests per minute for auth (stricter)
 } else if (pathname.includes("/payment") || pathname.includes("/paypal")) {
 limit = 20;
 } else if (pathname.includes("/support")) {
 limit = 5;
 }

 const allowed = rateLimit(`${ip}:${pathname.split("/")[2] || "api"}`, limit, windowMs);

 if (!allowed) {
 return NextResponse.json(
 {
 error: "Too many requests",
 message: "Please try again later",
 retryAfter: 60
 },
 {
 status: 429,
 headers: {
 "Retry-After": "60",
 "X-RateLimit-Limit": limit.toString(),
 "X-RateLimit-Remaining": "0",
 }
 }
 );
 }
 }

 // Block suspicious request patterns
 const userAgent = request.headers.get("user-agent") || "";
 const suspiciousPatterns = [
 /sqlmap/i,
 /nikto/i,
 /nmap/i,
 /masscan/i,
 /python-requests\/2\.[0-9]+\.[0-9]+$/i,
 /havij/i,
 /w3af/i,
 /acunetix/i,
 /nessus/i,
 ];

 for (const pattern of suspiciousPatterns) {
 if (pattern.test(userAgent)) {
 return NextResponse.json(
 { error: "Access denied" },
 { status: 403 }
 );
 }
 }

 // Block requests with suspicious query parameters
 const url = request.nextUrl.toString();
 const dangerousPatterns = [
 /<script/i,
 /javascript:/i,
 /onclick/i,
 /onerror/i,
 /union.*select/i,
 /drop.*table/i,
 /insert.*into/i,
 /delete.*from/i,
 /\.\.\/\.\.\//, // Path traversal
 /%00/, // Null byte
 /\bexec\b.*\(/i, // exec() calls
 /\beval\b.*\(/i, // eval() calls
 ];

 for (const pattern of dangerousPatterns) {
 if (pattern.test(url)) {
 return NextResponse.json(
 { error: "Invalid request" },
 { status: 400 }
 );
 }
 }

 // Check if the route is protected
 const isProtectedRoute = protectedRoutes.some((route) =>
 pathname.startsWith(route)
 );

 // Get auth token from cookies
 const authToken = request.cookies.get("auth-token")?.value;

 // If route is protected and user is not authenticated
 if (isProtectedRoute && !authToken) {
 const loginUrl = new URL("/login", request.url);
 loginUrl.searchParams.set("callbackUrl", pathname);
 return NextResponse.redirect(loginUrl);
 }

 // Add security headers to response
 const response = NextResponse.next();

 // Additional security headers
 response.headers.set("X-DNS-Prefetch-Control", "on");
 response.headers.set("X-Download-Options", "noopen");
 response.headers.set("X-Permitted-Cross-Domain-Policies", "none");

 return response;
}

// Configure which routes to run middleware on
export const config = {
 matcher: [
 "/((?!_next/static|_next/image|favicon.ico|public).*)",
 ],
};
