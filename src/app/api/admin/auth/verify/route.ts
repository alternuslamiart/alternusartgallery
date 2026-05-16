import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminRequest } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
 try {
 const authResult = await verifyAdminRequest();

 if (!authResult.authorized) {
 // Clear invalid/expired cookie
 const cookieStore = await cookies();
 cookieStore.delete('admin-session');
 return NextResponse.json({ authenticated: false }, { status: 401 });
 }

 return NextResponse.json({ authenticated: true });
 } catch (error) {
 console.error('Admin verify error:', error);
 return NextResponse.json({ authenticated: false }, { status: 401 });
 }
}
