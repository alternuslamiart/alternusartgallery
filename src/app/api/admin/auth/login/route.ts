import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

export const dynamic = 'force-dynamic';

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
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    const inputEmail = (email || '').trim().toLowerCase();
    const inputPassword = (password || '').toString();

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
    const emailMatch = inputEmail === envEmail;
    const passwordMatch = inputPassword.length === envPassword.length &&
      timingSafeEqual(Buffer.from(inputPassword), Buffer.from(envPassword));

    if (!emailMatch || !passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

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
