import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function getUserId(request: NextRequest): Promise<string | null> {
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
  // Fall back to demo user from env
  return process.env.OS_DEMO_USER_ID || null;
}

// GET /api/os/files?parentId=xxx  OR  ?path=/Documents  (defaults to root)
export async function GET(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ files: [] });
  }

  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parentId');
  const path = searchParams.get('path');

  let where: { userId: string; parentId?: string | null; path?: string };
  if (parentId) {
    where = { userId, parentId };
  } else if (path) {
    where = { userId, path };
  } else {
    where = { userId, parentId: null };
  }

  const files = await prisma.osFile.findMany({
    where,
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  });

  return NextResponse.json({ files });
}

// POST /api/os/files — create file or folder
export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'No user session' }, { status: 401 });
  }

  const body = await request.json();
  const { name, content, path, type, parentId, mimeType } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const file = await prisma.osFile.create({
    data: {
      name,
      content: content || null,
      path: path || '/',
      type: type === 'FOLDER' ? 'FOLDER' : 'FILE',
      mimeType: mimeType || null,
      size: content ? Buffer.byteLength(content, 'utf8') : 0,
      userId,
      parentId: parentId || null,
    },
  });

  return NextResponse.json({ file }, { status: 201 });
}
