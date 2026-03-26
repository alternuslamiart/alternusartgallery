import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter for edge runtime
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

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

function getClientIP(request: NextRequest): string {
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
// Example: ADMIN_ALLOWED_IPS=192.168.1.1,10.0.0.1
function isIPAllowed(ip: string): boolean {
  const allowedIPs = process.env.ADMIN_ALLOWED_IPS;

  // If no IP restriction is set, allow all (for development)
  if (!allowedIPs || allowedIPs === '*') {
    return true;
  }

  const allowedList = allowedIPs.split(',').map(ip => ip.trim());

  // Check exact match or CIDR-like prefix match (e.g., 192.168.1.)
  return allowedList.some(allowed => {
    if (allowed.endsWith('.')) {
      // Prefix match (e.g., 192.168.1. matches 192.168.1.*)
      return ip.startsWith(allowed);
    }
    return ip === allowed;
  });
}

// Verify admin session token
function verifyAdminSession(token: string | undefined): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [hash, timestamp] = parts;
  const timestampNum = parseInt(timestamp, 10);

  // Check if token is expired (24 hours)
  const maxAge = 24 * 60 * 60 * 1000;
  if (Date.now() - timestampNum > maxAge) {
    return false;
  }

  // Check hash format is valid (64 character hex string)
  return hash.length === 64 && !isNaN(timestampNum);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);

  // Admin route protection
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isAdminPublicRoute = adminPublicRoutes.some((route) => pathname === route);

  // IP restriction for ALL admin routes (including login page)
  if (isAdminRoute) {
    if (!isIPAllowed(ip)) {
      // Return 404 to hide admin panel existence from unauthorized IPs
      return NextResponse.json(
        { error: "Not Found" },
        { status: 404 }
      );
    }
  }

  if (isAdminRoute && !isAdminPublicRoute) {
    const adminSession = request.cookies.get('admin-session')?.value;

    if (!verifyAdminSession(adminSession)) {
      // Redirect to admin login
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

    // Stricter limits for sensitive endpoints
    if (pathname.includes("/auth") || pathname.includes("/login")) {
      limit = 10; // 10 requests per minute for auth
    } else if (pathname.includes("/payment") || pathname.includes("/stripe")) {
      limit = 20; // 20 requests per minute for payments
    } else if (pathname.includes("/support")) {
      limit = 5; // 5 requests per minute for contact
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
    /python-requests\/2\.[0-9]+\.[0-9]+$/i, // Generic Python requests without custom UA
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
    /\.\.\/\.\.\//,  // Path traversal
    /%00/,          // Null byte
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
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
