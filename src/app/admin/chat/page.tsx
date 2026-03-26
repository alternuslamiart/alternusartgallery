"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: string;
  chatId: string;
  text: string;
  sender: "user" | "support";
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

export default function AdminChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  // Fetch all chats
  const fetchChats = useCallback(async () => {
    try {
      const response = await fetch("/api/chat?admin=true");
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);

        // Update selected chat if it exists
        if (selectedChat) {
          const updatedChat = data.chats?.find((c: Chat) => c.id === selectedChat.id);
          if (updatedChat) {
            setSelectedChat(updatedChat);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedChat]);

  // Poll for new messages
  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 3000);
    return () => clearInterval(interval);
  }, [fetchChats]);

  // Mark messages as read when selecting a chat
  const handleSelectChat = async (chat: Chat) => {
    setSelectedChat(chat);

    if (chat.unreadCount > 0) {
      try {
        await fetch("/api/chat", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId: chat.id, markAsRead: true }),
        });

        // Update local state
        setChats(prev => prev.map(c =>
          c.id === chat.id ? { ...c, unreadCount: 0 } : c
        ));
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }
  };

  // Send message as support
  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedChat) return;

    const text = inputText;
    setInputText("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: selectedChat.id,
          text,
          sender: "support",
          senderName: "Bulzart Lamiart",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedChat(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, data.message],
          };
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("sq-AL", {
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return formatTime(dateStr);
    }

    return date.toLocaleDateString("sq-AL", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Chat Admin</h1>
            <p className="text-sm text-gray-500">
              {chats.length} biseda aktive • {totalUnread} mesazhe të palexuara
            </p>
          </div>
          <a href="/admin" className="text-primary hover:underline">
            ← Kthehu te Admin
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex h-[calc(100vh-180px)]">
          {/* Chat List */}
          <div className="w-80 border-r flex flex-col">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold text-gray-700">Bisedat</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Duke ngarkuar...</div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Nuk ka biseda aktive
                </div>
              ) : (
                chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    className={`w-full p-4 text-left border-b hover:bg-gray-50 transition-colors ${
                      selectedChat?.id === chat.id ? "bg-primary/5 border-l-4 border-l-primary" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate">
                            {chat.userName}
                          </p>
                          {chat.unreadCount > 0 && (
                            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                        {chat.userEmail && (
                          <p className="text-xs text-gray-500 truncate">{chat.userEmail}</p>
                        )}
                        {chat.messages.length > 0 && (
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {chat.messages[chat.messages.length - 1]?.text}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                        {formatDate(chat.lastMessageAt)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedChat.userName}</h3>
                    {selectedChat.userEmail && (
                      <p className="text-sm text-gray-500">{selectedChat.userEmail}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    Filluar: {formatDate(selectedChat.createdAt)}
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {selectedChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "support" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          message.sender === "support"
                            ? "bg-primary text-primary-foreground"
                            : "bg-white border shadow-sm"
                        }`}
                      >
                        {message.sender === "user" && (
                          <p className="text-xs font-medium text-primary mb-1">
                            {message.senderName}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === "support"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Shkruani përgjigjen tuaj..."
                      className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputText.trim()}
                      className="rounded-full px-6"
                    >
                      Dërgo
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="mx-auto mb-4 text-gray-300"
                  >
                    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
                  </svg>
                  <p>Zgjidhni një bisedë për të parë mesazhet</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
