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

// POST /api/os/files/seed — create default folder structure for a user
export async function POST(_request: NextRequest) {
 const userId = await getUserId();
 if (!userId) {
 return NextResponse.json({ error: 'No user session' }, { status: 401 });
 }

 // Check if already seeded
 const existing = await prisma.osFile.count({ where: { userId } });
 if (existing > 0) {
 return NextResponse.json({ message: 'Already seeded', count: existing });
 }

 // Create root folders
 const folders = [
 { name: 'Documents', path: '/' },
 { name: 'Downloads', path: '/' },
 { name: 'Pictures', path: '/' },
 { name: 'Music', path: '/' },
 { name: 'Videos', path: '/' },
 { name: 'Projects', path: '/' },
 { name: 'Desktop', path: '/' },
 ];

 const createdFolders: Record<string, string> = {};
 for (const folder of folders) {
 const created = await prisma.osFile.create({
 data: {
 name: folder.name,
 path: folder.path,
 type: 'FOLDER',
 userId,
 },
 });
 createdFolders[folder.name] = created.id;
 }

 // Create sample files inside Documents
 const docFiles = [
 { name: 'Budget Report Q1.docx', content: 'Budget expenses quarterly revenue financial analysis', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
 { name: 'Project Proposal.docx', content: 'Project proposal timeline milestones deliverables team allocation', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
 { name: 'Meeting Notes.md', content: '# Meeting Notes\n\n## Agenda\n- Review project status\n- Discuss next steps\n\n## Action Items\n- Follow up with team', mimeType: 'text/markdown' },
 { name: 'Personal Notes.txt', content: 'Personal ideas and reminders\n- Goals for this year\n- Books to read', mimeType: 'text/plain' },
 ];

 for (const file of docFiles) {
 await prisma.osFile.create({
 data: {
 name: file.name,
 content: file.content,
 path: '/Documents',
 type: 'FILE',
 mimeType: file.mimeType,
 size: Buffer.byteLength(file.content, 'utf8'),
 userId,
 parentId: createdFolders['Documents'],
 },
 });
 }

 // Create sample files inside Projects
 const projectFiles = [
 { name: 'API Documentation.md', content: '# API Documentation\n\n## Endpoints\n- GET /api/os/files\n- POST /api/os/ai', mimeType: 'text/markdown' },
 { name: 'README.md', content: '# Crystal Studio Desktop\n\nAdvanced AI engineering desktop workspace.', mimeType: 'text/markdown' },
 ];

 for (const file of projectFiles) {
 await prisma.osFile.create({
 data: {
 name: file.name,
 content: file.content,
 path: '/Projects',
 type: 'FILE',
 mimeType: file.mimeType,
 size: Buffer.byteLength(file.content, 'utf8'),
 userId,
 parentId: createdFolders['Projects'],
 },
 });
 }

 const total = await prisma.osFile.count({ where: { userId } });
 return NextResponse.json({ message: 'Seeded successfully', count: total });
}
