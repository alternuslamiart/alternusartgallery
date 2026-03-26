import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin-session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify token format and expiry
    const parts = sessionToken.split('.');
    if (parts.length !== 2) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const [hash, timestamp] = parts;
    const timestampNum = parseInt(timestamp, 10);

    // Check if token is expired (24 hours)
    const maxAge = 24 * 60 * 60 * 1000;
    if (Date.now() - timestampNum > maxAge) {
      // Clear expired cookie
      cookieStore.delete('admin-session');
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Check hash format is valid
    if (hash.length !== 64 || isNaN(timestampNum)) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error('Admin verify error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
