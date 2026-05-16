import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function getUserId(): Promise<string | null> {
 try {
 const session = await auth();
 if (session?.user?.email) {
 const user = await prisma.user.findUnique({
 where: { email: session.user.email },
 select: { id: true },
 });
 if (user) return user.id;
 }
 } catch {
 // session not available
 }
 return process.env.OS_DEMO_USER_ID || null;
}

// GET /api/os/files/[id]
export async function GET(
 _request: NextRequest,
 { params }: { params: { id: string } }
) {
 const userId = await getUserId();
 if (!userId) {
 return NextResponse.json({ error: 'No user session' }, { status: 401 });
 }

 const file = await prisma.osFile.findFirst({
 where: { id: params.id, userId },
 include: { children: { orderBy: [{ type: 'asc' }, { name: 'asc' }] } },
 });

 if (!file) {
 return NextResponse.json({ error: 'Not found' }, { status: 404 });
 }

 return NextResponse.json({ file });
}

// PUT /api/os/files/[id]
export async function PUT(
 request: NextRequest,
 { params }: { params: { id: string } }
) {
 const userId = await getUserId();
 if (!userId) {
 return NextResponse.json({ error: 'No user session' }, { status: 401 });
 }

 const body = await request.json();
 const { name, content, path } = body;

 const updateData: Record<string, string | number | Date> = { updatedAt: new Date() };
 if (name !== undefined) updateData.name = name;
 if (path !== undefined) updateData.path = path;
 if (content !== undefined) {
 updateData.content = content;
 updateData.size = Buffer.byteLength(content || '', 'utf8');
 }

 await prisma.osFile.updateMany({
 where: { id: params.id, userId },
 data: updateData,
 });

 return NextResponse.json({ success: true });
}

// DELETE /api/os/files/[id]
export async function DELETE(
 _request: NextRequest,
 { params }: { params: { id: string } }
) {
 const userId = await getUserId();
 if (!userId) {
 return NextResponse.json({ error: 'No user session' }, { status: 401 });
 }

 const result = await prisma.osFile.deleteMany({
 where: { id: params.id, userId },
 });

 if (result.count === 0) {
 return NextResponse.json({ error: 'Not found' }, { status: 404 });
 }

 return NextResponse.json({ success: true });
}
