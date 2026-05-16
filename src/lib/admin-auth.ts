import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';

/**
 * Verify the admin session token using HMAC signature.
 * Call this at the start of every admin API route handler.
 */
export async function verifyAdminRequest(): Promise<{ authorized: boolean; error?: NextResponse }> {
 const secret = process.env.ADMIN_SESSION_SECRET;
 if (!secret) {
 return {
 authorized: false,
 error: NextResponse.json({ error: 'Server configuration error' }, { status: 500 }),
 };
 }

 const cookieStore = await cookies();
 const token = cookieStore.get('admin-session')?.value;

 if (!token) {
 return {
 authorized: false,
 error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
 };
 }

 const parts = token.split('.');
 if (parts.length !== 3) {
 return {
 authorized: false,
 error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
 };
 }

 const [providedSignature, timestamp, nonce] = parts;
 const timestampNum = parseInt(timestamp, 10);

 if (isNaN(timestampNum)) {
 return {
 authorized: false,
 error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
 };
 }

 // Check if token is expired (24 hours)
 const maxAge = 24 * 60 * 60 * 1000;
 if (Date.now() - timestampNum > maxAge) {
 return {
 authorized: false,
 error: NextResponse.json({ error: 'Session expired' }, { status: 401 }),
 };
 }

 // Verify HMAC signature
 const payload = `${timestamp}.${nonce}`;
 const expectedSignature = createHmac('sha256', secret)
 .update(payload)
 .digest('hex');

 try {
 const isValid = timingSafeEqual(
 Buffer.from(providedSignature, 'hex'),
 Buffer.from(expectedSignature, 'hex')
 );

 if (!isValid) {
 return {
 authorized: false,
 error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
 };
 }
 } catch {
 return {
 authorized: false,
 error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
 };
 }

 return { authorized: true };
}
