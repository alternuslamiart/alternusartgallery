import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { globalCyberDefense, sanitizeAndInspectPayload } from '@/lib/security/cyber-shield.mjs';

export const dynamic = 'force-dynamic';

function getClientIP(request: NextRequest): string {
 const forwardedFor = request.headers.get('x-forwarded-for');
 if (forwardedFor) return forwardedFor.split(',')[0].trim();
 const realIP = request.headers.get('x-real-ip');
 if (realIP) return realIP.trim();
 return 'unknown';
}

// Generate a cryptographically secure session token with HMAC signature
function generateSessionToken(): string {
 const secret = process.env.ADMIN_SESSION_SECRET;
 if (!secret) {
 throw new Error('ADMIN_SESSION_SECRET environment variable is required');
 }

 const timestamp = Date.now().toString();
 const nonce = randomBytes(16).toString('hex');
 const payload = `${timestamp}.${nonce}`;
 const signature = createHmac('sha256', secret)
 .update(payload)
 .digest('hex');

 return `${signature}.${timestamp}.${nonce}`;
}

export async function POST(request: NextRequest) {
 const ip = getClientIP(request);
 try {
 const lockout = globalCyberDefense.checkAuthLockout(ip);
 if (lockout.blocked) {
 return NextResponse.json(
 { error: 'Too many failed login attempts. Try again later.', retryAfter: lockout.retryAfter },
 { status: 429, headers: { 'Retry-After': String(lockout.retryAfter) } }
 );
 }

 const rawBody = await request.json();
 const body = sanitizeAndInspectPayload(rawBody, { maxDepth: 4, maxKeys: 10, maxStringLength: 512 }) as Record<string, unknown>;
 const { email, password } = body;

 // Validate input
 const inputEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
 const inputPassword = typeof password === 'string' ? password : '';

 if (!inputEmail || !inputPassword) {
 return NextResponse.json(
 { error: 'Email and password are required' },
 { status: 400 }
 );
 }

 // Only check against environment variables — no hardcoded fallbacks
 const envEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
 const envPassword = process.env.ADMIN_PASSWORD || '';

 if (!envEmail || !envPassword) {
 console.error('ADMIN_EMAIL or ADMIN_PASSWORD not configured');
 return NextResponse.json(
 { error: 'Admin login is not configured' },
 { status: 500 }
 );
 }

 // Constant-time comparison to prevent timing attacks
 const emailMatch = inputEmail.length === envEmail.length &&
 timingSafeEqual(Buffer.from(inputEmail), Buffer.from(envEmail));
 const passwordMatch = inputPassword.length === envPassword.length &&
 timingSafeEqual(Buffer.from(inputPassword), Buffer.from(envPassword));

 if (!emailMatch || !passwordMatch) {
 globalCyberDefense.recordAuthFailure(ip);
 globalCyberDefense.recordStrike(ip, 'ADMIN_LOGIN_FAILED', 1);
 return NextResponse.json(
 { error: 'Invalid email or password' },
 { status: 401 }
 );
 }

 globalCyberDefense.clearAuthFailures(ip);

 // Generate HMAC-signed session token
 const sessionToken = generateSessionToken();

 // Set HTTP-only secure cookie
 const cookieStore = await cookies();
 cookieStore.set('admin-session', sessionToken, {
 httpOnly: true,
 secure: process.env.NODE_ENV === 'production',
 sameSite: 'strict',
 maxAge: 60 * 60 * 24, // 24 hours
 path: '/',
 });

 return NextResponse.json({ success: true });
 } catch (error) {
 console.error('Admin login error:', error);
 return NextResponse.json(
 { error: 'An error occurred during login' },
 { status: 500 }
 );
 }
}
