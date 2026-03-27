import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

// Generate a secure session token
function generateSessionToken(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || 'alternus-admin-secret-key-change-in-production';
  const randomPart = randomBytes(32).toString('hex');
  const timestamp = Date.now().toString();
  const hash = createHash('sha256')
    .update(randomPart + timestamp + secret)
    .digest('hex');
  return `${hash}.${timestamp}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate credentials
    const inputEmail = (email || '').trim().toLowerCase();
    const inputPassword = (password || '').toString();

    // Check against env vars first, then fallback hardcoded credentials
    const envEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const envPassword = (process.env.ADMIN_PASSWORD || '').trim();

    // Hardcoded fallback credentials
    const fallbackEmail = 'admin@alternusart.com';
    const fallbackPassword = 'Alternus333#';

    const matchesEnv = envEmail && envPassword &&
      inputEmail === envEmail && inputPassword === envPassword;

    const matchesFallback =
      inputEmail === fallbackEmail && inputPassword === fallbackPassword;

    if (!matchesEnv && !matchesFallback) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate session token
    const sessionToken = generateSessionToken();

    // Set HTTP-only secure cookie
    const cookieStore = await cookies();
    cookieStore.set('admin-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
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
