import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Tool definitions ──────────────────────────────────────────────────────────
const OS_TOOLS: Anthropic.Tool[] = [
  {
    name: 'open_app',
    description: 'Opens an application window in the OS. Use this immediately when the user asks to open any app.',
    input_schema: {
      type: 'object' as const,
      properties: {
        app_id: {
          type: 'string',
          description: 'The app window ID. Valid values: ai, terminal, code, files, settings, music, weather, calendar, notes, browser, store, movies, word, clock, calculator, accounts, downloads, controlpanel, studio, news, dashboard, tasks, mail, monaco, aihub, aivoice, knowledge, sysmon, business, agent',
        },
      },
      required: ['app_id'],
    },
  },
  {
    name: 'close_app',
    description: 'Closes an application window in the OS.',
    input_schema: {
      type: 'object' as const,
      properties: {
        app_id: { type: 'string', description: 'The app window ID to close.' },
      },
      required: ['app_id'],
    },
  },
  {
    name: 'minimize_app',
    description: 'Minimizes an application window to the taskbar.',
    input_schema: {
      type: 'object' as const,
      properties: {
        app_id: { type: 'string', description: 'The app window ID to minimize.' },
      },
      required: ['app_id'],
    },
  },
  {
    name: 'get_open_apps',
    description: 'Returns the list of currently open (non-minimized) applications.',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'send_notification',
    description: 'Sends an OS notification that appears in the notification center.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'Notification title' },
        message: { type: 'string', description: 'Notification body message' },
      },
      required: ['title', 'message'],
    },
  },
  {
    name: 'create_file',
    description: 'Creates a new file or folder in the OS file system, stored persistently in the database.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'File or folder name (with extension for files, e.g. notes.txt)' },
        content: { type: 'string', description: 'File text content (for files only, not folders)' },
        path: { type: 'string', description: 'Parent path like /Documents or /Projects. Use / for root.' },
        type: { type: 'string', enum: ['FILE', 'FOLDER'], description: 'Whether this is a file or folder' },
        parent_id: { type: 'string', description: 'Optional parent folder ID for nesting' },
      },
      required: ['name', 'type'],
    },
  },
  {
    name: 'read_file',
    description: 'Reads the content of a file from the OS file system.',
    input_schema: {
      type: 'object' as const,
      properties: {
        file_id: { type: 'string', description: 'The file ID to read' },
      },
      required: ['file_id'],
    },
  },
  {
    name: 'list_files',
    description: 'Lists files and folders at a given path or inside a parent folder.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Path like /Documents to list. Use / for root.' },
        parent_id: { type: 'string', description: 'Optional parent folder ID to list children.' },
      },
    },
  },
  {
    name: 'delete_file',
    description: 'Permanently deletes a file or folder from the file system.',
    input_schema: {
      type: 'object' as const,
      properties: {
        file_id: { type: 'string', description: 'The file ID to delete' },
      },
      required: ['file_id'],
    },
  },
  {
    name: 'update_file',
    description: 'Updates the content or name of an existing file.',
    input_schema: {
      type: 'object' as const,
      properties: {
        file_id: { type: 'string', description: 'The file ID to update' },
        name: { type: 'string', description: 'New name (optional)' },
        content: { type: 'string', description: 'New content (optional)' },
      },
      required: ['file_id'],
    },
  },
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface OSAIAction {
  type: 'open_app' | 'close_app' | 'minimize_app' | 'send_notification';
  payload: Record<string, string>;
}

interface OSChatRequest {
  message: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  osContext: {
    openApps: string[];
    theme: 'dark' | 'light';
    currentPath?: string;
    recentFiles?: string[];
  };
}

// ── Get user ID ───────────────────────────────────────────────────────────────
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

// ── Build system prompt ───────────────────────────────────────────────────────
function buildSystemPrompt(osContext: OSChatRequest['osContext']): string {
  return `You are Cerevix AI Agent, an intelligent operating system assistant integrated into Cerevix OS — a browser-based AI-powered desktop OS.

## Current OS State
- Theme: ${osContext.theme} mode
- Open applications: ${osContext.openApps.length > 0 ? osContext.openApps.join(', ') : 'none'}
${osContext.currentPath ? `- Current file path: ${osContext.currentPath}` : ''}
${osContext.recentFiles && osContext.recentFiles.length > 0 ? `- Recent files: ${osContext.recentFiles.join(', ')}` : ''}

## Your Capabilities
You have direct control over this OS. You can:
- Open, close, or minimize any application window using tools
- Create, read, update, and delete files stored persistently in the database
- Send OS notifications to the notification center
- Query which apps are currently open

## Behavior Guidelines
1. When the user asks to open an app, call open_app immediately — do not just describe what you'd do
2. When creating files, call create_file and confirm what was saved
3. Be concise in your text responses — actions speak louder than descriptions
4. You can chain multiple tool calls in a single turn (e.g., create a file then open word)
5. Always confirm tool results in plain language after executing them
6. Always respond in English regardless of the language the user writes in
7. For app IDs, use lowercase: terminal, code, files, settings, music, weather, calendar, notes, browser, store, movies, word, clock, calculator, downloads, controlpanel, studio, news, dashboard, tasks, mail, monaco, aihub, aivoice, knowledge, sysmon, business, agent, ai

## About Cerevix OS
This is a full-featured browser-based desktop OS with 36 applications including a code editor, terminal, file manager, music player, AI hub, and more. You are the brain of this OS.`;
}

// ── Execute tool calls server-side ────────────────────────────────────────────
async function executeToolCall(
  toolName: string,
  toolInput: Record<string, string>,
  userId: string | null,
  osContext: OSChatRequest['osContext']
): Promise<{ result: string; pendingActions: OSAIAction[] }> {
  const pendingActions: OSAIAction[] = [];

  switch (toolName) {
    case 'open_app':
      pendingActions.push({ type: 'open_app', payload: { app_id: toolInput.app_id } });
      return { result: `Opened application: ${toolInput.app_id}`, pendingActions };

    case 'close_app':
      pendingActions.push({ type: 'close_app', payload: { app_id: toolInput.app_id } });
      return { result: `Closed application: ${toolInput.app_id}`, pendingActions };

    case 'minimize_app':
      pendingActions.push({ type: 'minimize_app', payload: { app_id: toolInput.app_id } });
      return { result: `Minimized application: ${toolInput.app_id}`, pendingActions };

    case 'get_open_apps':
      return {
        result: osContext.openApps.length > 0
          ? `Currently open apps: ${osContext.openApps.join(', ')}`
          : 'No apps are currently open.',
        pendingActions: [],
      };

    case 'send_notification':
      pendingActions.push({
        type: 'send_notification',
        payload: { title: toolInput.title || 'Notification', message: toolInput.message || '' },
      });
      return { result: `Sent notification: "${toolInput.title}"`, pendingActions };

    case 'create_file': {
      if (!userId) return { result: 'Cannot create file: no user session.', pendingActions: [] };
      const file = await prisma.osFile.create({
        data: {
          name: toolInput.name,
          content: toolInput.content || null,
          path: toolInput.path || '/',
          type: toolInput.type === 'FOLDER' ? 'FOLDER' : 'FILE',
          size: toolInput.content ? Buffer.byteLength(toolInput.content, 'utf8') : 0,
          userId,
          parentId: toolInput.parent_id || null,
        },
      });
      return {
        result: `Created ${toolInput.type === 'FOLDER' ? 'folder' : 'file'} "${toolInput.name}" (ID: ${file.id}) at ${file.path}.`,
        pendingActions: [],
      };
    }

    case 'read_file': {
      if (!userId) return { result: 'Cannot read file: no user session.', pendingActions: [] };
      const file = await prisma.osFile.findFirst({
        where: { id: toolInput.file_id, userId },
      });
      if (!file) return { result: `File "${toolInput.file_id}" not found.`, pendingActions: [] };
      return {
        result: file.type === 'FOLDER'
          ? `"${file.name}" is a folder, not a text file.`
          : `File "${file.name}":\n\n${file.content || '(empty file)'}`,
        pendingActions: [],
      };
    }

    case 'list_files': {
      if (!userId) return { result: 'Cannot list files: no user session.', pendingActions: [] };
      const where = toolInput.parent_id
        ? { userId, parentId: toolInput.parent_id }
        : toolInput.path
        ? { userId, path: toolInput.path }
        : { userId, parentId: null };

      const files = await prisma.osFile.findMany({
        where,
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
      });

      if (files.length === 0) return { result: 'No files found at this location.', pendingActions: [] };
      const listing = files.map(f => `- ${f.type === 'FOLDER' ? '📁' : '📄'} ${f.name} (ID: ${f.id})`).join('\n');
      return { result: `Files at ${toolInput.path || 'root'}:\n${listing}`, pendingActions: [] };
    }

    case 'delete_file': {
      if (!userId) return { result: 'Cannot delete file: no user session.', pendingActions: [] };
      const deleted = await prisma.osFile.deleteMany({
        where: { id: toolInput.file_id, userId },
      });
      return {
        result: deleted.count > 0
          ? `Deleted file/folder with ID ${toolInput.file_id}.`
          : `File with ID ${toolInput.file_id} not found.`,
        pendingActions: [],
      };
    }

    case 'update_file': {
      if (!userId) return { result: 'Cannot update file: no user session.', pendingActions: [] };
      const updateData: Record<string, string | number | Date> = { updatedAt: new Date() };
      if (toolInput.name) updateData.name = toolInput.name;
      if (toolInput.content !== undefined) {
        updateData.content = toolInput.content;
        updateData.size = Buffer.byteLength(toolInput.content || '', 'utf8');
      }
      await prisma.osFile.updateMany({ where: { id: toolInput.file_id, userId }, data: updateData });
      return { result: `Updated file with ID ${toolInput.file_id}.`, pendingActions: [] };
    }

    default:
      return { result: `Unknown tool: ${toolName}`, pendingActions: [] };
  }
}

// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: OSChatRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const { message, conversationHistory = [], osContext } = body;
  if (!message) {
    return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400 });
  }

  const userId = await getUserId();
  const systemPrompt = buildSystemPrompt(osContext || { openApps: [], theme: 'dark' });

  // Build message history (last 10 turns to keep context fresh)
  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.slice(-10).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  const allPendingActions: OSAIAction[] = [];
  let finalTextResponse = '';

  try {
    // Agentic tool loop — runs until Claude produces a final text response
    let currentMessages = [...messages];
    const MAX_LOOPS = 5;

    for (let loop = 0; loop < MAX_LOOPS; loop++) {
      const response = await anthropic.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 2048,
        system: systemPrompt,
        tools: OS_TOOLS,
        messages: currentMessages,
      });

      // Collect text blocks
      const textBlocks = response.content.filter(
        (b): b is Anthropic.TextBlock => b.type === 'text'
      );
      if (textBlocks.length > 0) {
        finalTextResponse = textBlocks.map(b => b.text).join('\n');
      }

      // Check for tool use
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
      );

      if (toolUseBlocks.length === 0 || response.stop_reason === 'end_turn') {
        break;
      }

      // Execute all tool calls
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of toolUseBlocks) {
        const { result, pendingActions } = await executeToolCall(
          block.name,
          block.input as Record<string, string>,
          userId,
          osContext || { openApps: [], theme: 'dark' }
        );
        allPendingActions.push(...pendingActions);
        toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
      }

      // Add assistant + tool results to message history for next loop
      currentMessages = [
        ...currentMessages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults },
      ];
    }

    // Stream response: first line = JSON actions, rest = text
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send actions JSON as first newline-terminated line
        controller.enqueue(encoder.encode(JSON.stringify({ actions: allPendingActions }) + '\n'));

        // Stream final text response character by character
        const chars = finalTextResponse.split('');
        let idx = 0;
        const CHUNK_SIZE = 3; // send 3 chars at a time for smooth streaming

        const push = () => {
          if (idx < chars.length) {
            const chunk = chars.slice(idx, idx + CHUNK_SIZE).join('');
            controller.enqueue(encoder.encode(chunk));
            idx += CHUNK_SIZE;
            // Use setTimeout 0 to yield to the event loop
            setTimeout(push, 10);
          } else {
            controller.close();
          }
        };
        push();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('OS AI Agent error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: `AI agent error: ${msg}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
