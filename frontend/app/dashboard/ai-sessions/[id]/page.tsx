// app/ai-sessions/[id]/page.tsx - FIXED

"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { CopyButton } from "@/components/CopyButton";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

type Message = {
  id: number;
  role: "user" | "assistant";
  message_text: string;
  created_at: string;
};

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const chatId = params?.id as string;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Get auth token from session
  const getAuthToken = async () => {
    if (!session?.user?.email) return null;
    return (session as any)?.accessToken || session?.user?.email;
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch chat history on mount
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email || !chatId) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await getAuthToken();
        if (!token) throw new Error("No auth token available");

        console.log(`🔍 Fetching chat history from: ${API_URL}/chat/history/${chatId}`);
        console.log(`📧 Using email: ${session.user?.email}`);

        const res = await fetch(`${API_URL}/chat/history/${chatId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          console.error("❌ Error response:", err, res.status);
          throw new Error(err.error || err.message || "Failed to load chat");
        }

        const data = await res.json();
        console.log("✅ Loaded messages:", data);
        setMessages(data.messages || []);
      } catch (err: any) {
        console.error("❌ Error loading chat:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [chatId, session?.user?.email, status, API_URL]);

  const formatAIResponse = (text: string) => {
    return text.replace(/\*\*/g, "").replace(/\*/g, "").trim();
  };

  // Voice input setup
  const startListening = () => {
    if (typeof window === "undefined") return;

    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  // Send new message
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setInput("");
    setIsSending(true);

    try {
      const token = await getAuthToken();
      if (!token) throw new Error("No auth token available");

      console.log(`📤 Sending message to: ${API_URL}/chat/send/stream`);

      const res = await fetch(`${API_URL}/chat/send/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: parseInt(chatId),
          message: userMessage,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || err.message || "AI failed to respond");
      }

      // Parse SSE stream
      const reader = res.body?.getReader();
      if (!reader) throw new Error("Streaming not supported");

      const decoder = new TextDecoder();
      let done = false;
      let aiText = "";

      // Add user message immediately
      const userMsg: Message = {
        id: Date.now(),
        role: "user",
        message_text: userMessage,
        created_at: new Date().toISOString(),
      };

      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        message_text: "",
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, aiMsg]);

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.chunk) {
                  aiText += data.chunk;
                  setMessages((prev) => {
                    const copy = [...prev];
                    copy[copy.length - 1] = {
                      ...copy[copy.length - 1],
                      message_text: formatAIResponse(aiText),
                    };
                    return copy;
                  });
                }
              } catch (e) {
                console.error("Failed to parse stream:", e);
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error("❌ Send error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          message_text: `⚠️ Error: ${err.message || "Failed to get AI response"}`,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Start editing message
  const startEdit = (msg: Message) => {
    setEditingId(msg.id);
    setEditText(msg.message_text);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  // Save edit and send as new message
  const saveEdit = async () => {
    if (!editText.trim() || editingId === null) return;

    setEditingId(null);
    setEditText("");
    setInput(editText);
    await handleSend();
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-base sm:text-lg">Loading session...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-200 px-4">
        <p className="text-red-400 mb-4 text-sm sm:text-base">Please sign in to access this chat</p>
        <button
          onClick={() => router.push("/dashboard/ai-sessions")}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm sm:text-base"
        >
          Back to History
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-base sm:text-lg">Loading chat...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-200 px-4">
        <p className="text-red-400 mb-4 text-sm sm:text-base">Error: {error}</p>
        <button
          onClick={() => router.push("/dashboard/ai-sessions")}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm sm:text-base"
        >
          Back to History
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-200 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b border-gray-800 flex-shrink-0">
        <button
          onClick={() => router.push("/dashboard/ai-sessions")}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-lg lg:text-xl font-bold">Chat Conversation</h1>
          {/* <p className="text-xs sm:text-sm text-gray-400">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </p> */}
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-center">
            <p className="text-sm sm:text-base">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group`}
            >
              {editingId === msg.id && msg.role === "user" ? (
                <div className="w-full sm:max-w-[85%] space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-3 sm:p-4 rounded-lg bg-gray-700 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-600"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
                    >
                      Save & Send
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`max-w-[90%] sm:max-w-[85%] p-3 sm:p-4 rounded-3xl text-sm sm:text-base break-words whitespace-pre-wrap relative ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-100"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <>
                      <MarkdownRenderer content={msg.message_text} />
                      {msg.message_text && (
                        <div className="mt-2 flex justify-end">
                          <CopyButton text={msg.message_text} className="text-xs" />
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.message_text}</p>
                  )}

                  {/* Edit button for user messages */}
                  {msg.role === "user" && (
                    <button
                      onClick={() => startEdit(msg)}
                      className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-700 rounded-lg transition-all text-gray-400 hover:text-white"
                      title="Edit message"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))
        )}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-gray-800 p-3 sm:p-4 rounded-3xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="border-t border-gray-800 p-3 sm:p-4 bg-gray-950 flex items-center gap-2 sm:gap-3 flex-shrink-0"
      >
        <button
          type="button"
          onClick={startListening}
          disabled={listening || isSending}
          className={`p-2 sm:p-3 rounded-full transition-colors flex-shrink-0 ${
            listening ? "bg-red-600 text-white" : "bg-gray-800 hover:bg-gray-700 text-white"
          }`}
        >
          {listening ? (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 20 20" fill="currentColor">
              <rect x="6" y="4" width="8" height="12" rx="1" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          )}
        </button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message... (Shift+Enter for new line)"
          disabled={isSending}
          rows={1}
          className="flex-1 bg-gray-800 text-gray-200 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50 resize-none max-h-32 overflow-y-auto"
          style={{ minHeight: '40px' }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="p-2 sm:p-3 bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 disabled:opacity-50 rounded-full transition-opacity flex-shrink-0"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 rotate-90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}







