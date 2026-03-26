import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'crypto';

// Admin credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'lamialiuart@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Alternus333#';
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'alternus-admin-secret-key-change-in-production';

// Generate a secure session token
function generateSessionToken(): string {
  const randomPart = randomBytes(32).toString('hex');
  const timestamp = Date.now().toString();
  const hash = createHash('sha256')
    .update(randomPart + timestamp + ADMIN_SESSION_SECRET)
    .digest('hex');
  return `${hash}.${timestamp}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate credentials
    const inputEmail = email?.trim().toLowerCase();
    const inputPassword = password;

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
