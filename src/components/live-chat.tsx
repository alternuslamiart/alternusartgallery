"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  text: string;
  sender: "user" | "support";
  senderName: string;
  timestamp: string;
}

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState<string>("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showNameForm, setShowNameForm] = useState(true);
  const [lastMessageTime, setLastMessageTime] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate or get chat ID
  useEffect(() => {
    let storedChatId = localStorage.getItem("alternus_chat_id");
    if (!storedChatId) {
      storedChatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("alternus_chat_id", storedChatId);
    }
    setChatId(storedChatId);

    // Get stored user info
    const storedName = localStorage.getItem("alternus_chat_name");
    const storedEmail = localStorage.getItem("alternus_chat_email");
    if (storedName) {
      setUserName(storedName);
      setShowNameForm(false);
    }
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!chatId) return;

    try {
      const url = lastMessageTime
        ? `/api/chat?chatId=${chatId}&since=${encodeURIComponent(lastMessageTime)}`
        : `/api/chat?chatId=${chatId}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          if (lastMessageTime) {
            // Only add new messages
            setMessages(prev => [...prev, ...data.messages]);
          } else {
            setMessages(data.messages);
          }
          const lastMsg = data.messages[data.messages.length - 1];
          if (lastMsg) {
            setLastMessageTime(lastMsg.timestamp);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [chatId, lastMessageTime]);

  // Initial fetch and polling
  useEffect(() => {
    if (chatId && isOpen && !showNameForm) {
      fetchMessages();

      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [chatId, isOpen, showNameForm, fetchMessages]);

  const handleStartChat = () => {
    if (!userName.trim()) return;

    localStorage.setItem("alternus_chat_name", userName);
    if (userEmail) {
      localStorage.setItem("alternus_chat_email", userEmail);
    }
    setShowNameForm(false);

    // Send welcome message
    sendMessage("Përshëndetje! Si mund t'ju ndihmoj sot?", "support", "Alternus CEO");
  };

  const sendMessage = async (text: string, sender: "user" | "support", senderName?: string) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          text,
          sender,
          senderName: senderName || userName,
          senderEmail: userEmail,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setLastMessageTime(data.message.timestamp);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText("");
    setIsTyping(true);

    await sendMessage(text, "user", userName);
    setIsTyping(false);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("sq-AL", {
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:scale-110 transition-transform"
          >
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
          </svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                  BL
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-primary" />
              </div>
              <div>
                <p className="font-semibold">Bulzart Lamiart</p>
                <p className="text-xs opacity-90">CEO • Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Name Form or Messages */}
          {showNameForm ? (
            <div className="flex-1 p-6 flex flex-col justify-center bg-gray-50">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Mirë se vini!</h3>
                <p className="text-gray-600 text-sm">Na tregoni emrin tuaj për të filluar bisedën</p>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Emri juaj *"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Email (opsional)"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  onClick={handleStartChat}
                  disabled={!userName.trim()}
                  className="w-full py-3 rounded-xl"
                >
                  Fillo Bisedën
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Filloni bisedën me ne!</p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-white border shadow-sm"
                      }`}
                    >
                      {message.sender === "support" && (
                        <p className="text-xs font-medium text-primary mb-1">{message.senderName}</p>
                      )}
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

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
                    placeholder="Shkruani mesazhin tuaj..."
                    className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                    size="icon"
                    className="rounded-full"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
