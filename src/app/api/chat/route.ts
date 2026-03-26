import { NextRequest, NextResponse } from 'next/server';

// In-memory chat storage (will reset on server restart)
// In production, use a database like the existing Prisma setup
interface ChatMessage {
  id: string;
  chatId: string;
  text: string;
  sender: 'user' | 'support';
  senderName: string;
  senderEmail?: string;
  timestamp: string;
  read: boolean;
}

interface Chat {
  id: string;
  userName: string;
  userEmail?: string;
  messages: ChatMessage[];
  createdAt: string;
  lastMessageAt: string;
  unreadCount: number;
}

// Global storage (persists during server runtime)
const globalForChat = globalThis as unknown as {
  chats: Map<string, Chat>;
};

if (!globalForChat.chats) {
  globalForChat.chats = new Map();
}

const chats = globalForChat.chats;

// POST - Send a message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId, text, sender, senderName, senderEmail } = body;

    if (!text || !sender) {
      return NextResponse.json(
        { error: 'Text and sender are required' },
        { status: 400 }
      );
    }

    // Create or get chat
    let chat = chats.get(chatId);

    if (!chat) {
      chat = {
        id: chatId,
        userName: senderName || 'Visitor',
        userEmail: senderEmail,
        messages: [],
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
      };
      chats.set(chatId, chat);
    }

    // Add message
    const message: ChatMessage = {
      id: Date.now().toString(),
      chatId,
      text,
      sender,
      senderName: senderName || (sender === 'support' ? 'Alternus CEO' : 'Visitor'),
      senderEmail,
      timestamp: new Date().toISOString(),
      read: false,
    };

    chat.messages.push(message);
    chat.lastMessageAt = message.timestamp;

    // Update unread count
    if (sender === 'user') {
      chat.unreadCount += 1;
    }

    return NextResponse.json({
      success: true,
      message,
      chat,
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// GET - Get messages for a chat or all chats (for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const isAdmin = searchParams.get('admin') === 'true';
    const since = searchParams.get('since'); // For polling new messages

    if (isAdmin) {
      // Return all chats for admin
      const allChats = Array.from(chats.values())
        .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

      return NextResponse.json({ chats: allChats });
    }

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    const chat = chats.get(chatId);

    if (!chat) {
      return NextResponse.json({ messages: [], chat: null });
    }

    // Filter messages if 'since' is provided (for polling)
    let messages = chat.messages;
    if (since) {
      messages = chat.messages.filter(m => new Date(m.timestamp) > new Date(since));
    }

    return NextResponse.json({ messages, chat });
  } catch (error) {
    console.error('Get chat messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// PATCH - Mark messages as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId, markAsRead } = body;

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    const chat = chats.get(chatId);

    if (chat && markAsRead) {
      chat.messages.forEach(m => {
        if (m.sender === 'user') {
          m.read = true;
        }
      });
      chat.unreadCount = 0;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update chat error:', error);
    return NextResponse.json(
      { error: 'Failed to update chat' },
      { status: 500 }
    );
  }
}
