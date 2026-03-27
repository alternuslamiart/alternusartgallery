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

    // Read credentials at runtime (not build time)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@alternusart.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Alternus333#';

    // Validate credentials
    const inputEmail = email?.trim().toLowerCase();
    const inputPassword = password?.toString() || '';

    // Debug logging (temporary)
    console.log('Admin login attempt:', {
      inputEmail,
      expectedEmail: ADMIN_EMAIL.toLowerCase(),
      emailMatch: inputEmail === ADMIN_EMAIL.toLowerCase(),
      inputPwdLength: inputPassword.length,
      expectedPwdLength: ADMIN_PASSWORD.length,
      pwdMatch: inputPassword === ADMIN_PASSWORD,
      envEmailSet: !!process.env.ADMIN_EMAIL,
      envPwdSet: !!process.env.ADMIN_PASSWORD,
    });

    if (inputEmail !== ADMIN_EMAIL.toLowerCase() || inputPassword !== ADMIN_PASSWORD) {
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
