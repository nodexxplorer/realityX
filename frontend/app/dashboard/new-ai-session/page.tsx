// app/dashboard/new-ai-session/page.tsx (Fully Fixed)
"use client";

import { useRouter as useAppRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useState, useEffect, useRef } from "react";
import { CopyButton } from "@/components/CopyButton";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
  var SpeechRecognition: {
    prototype: typeof SpeechRecognition.prototype;
    new (): typeof SpeechRecognition.prototype;
  };
  var webkitSpeechRecognition: {
    prototype: typeof SpeechRecognition.prototype;
    new (): typeof SpeechRecognition.prototype;
  };
}
declare var webkitSpeechRecognition: any;

interface Message {
  sender: "ai" | "user";
  text: string;
  id?: number;
  images?: string[];
}

interface UploadedImage {
  id: string;
  data: string;
  fileName: string;
}

const App = () => {
  const router = useAppRouter();
  const { data: session } = useSession();

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hello! I am your AI advisor. Share your question or idea and I'll help you explore it.",
      id: 0,
    },
  ]);

  const [input, setInput] = useState("");
  const [partialInput, setPartialInput] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [templateTitle, setTemplateTitle] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [copied, setCopied] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortCtrl = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const isPremiumUser = session?.user?.is_premium;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Template handling
  useEffect(() => {
    if (typeof window !== "undefined") {
      let storedPrompt = sessionStorage.getItem("templatePrompt");
      let storedTitle = sessionStorage.getItem("templateTitle");

      if (!storedPrompt) {
        storedPrompt = localStorage.getItem("templatePrompt");
        storedTitle = localStorage.getItem("templateTitle");
      }

      if (storedPrompt && session?.user?.email) {
        setInput(storedPrompt);
        setTemplateTitle(storedTitle || "");

        // Clear storage after populating input (don't auto-send)
        sessionStorage.removeItem("templatePrompt");
        sessionStorage.removeItem("templateTitle");
        localStorage.removeItem("templatePrompt");
        localStorage.removeItem("templateTitle");
      }
    }
  }, [session?.user?.email]);

  // Speech recognition
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const newRecognition = new SpeechRecognition();

      newRecognition.continuous = true;
      newRecognition.interimResults = true;
      newRecognition.lang = "en-US";

      newRecognition.onstart = () => setIsRecording(true);
      newRecognition.onend = () => setIsRecording(false);

      newRecognition.onresult = (event: Event) => {
        const speechEvent = event as any;
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = speechEvent.resultIndex; i < speechEvent.results.length; ++i) {
          if (speechEvent.results[i].isFinal) {
            finalTranscript += speechEvent.results[i][0].transcript;
          } else {
            interimTranscript += speechEvent.results[i][0].transcript;
          }
        }

        setPartialInput(interimTranscript);
        if (finalTranscript) {
          setInput((prev) => prev + finalTranscript);
        }
      };

      newRecognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      setRecognition(newRecognition);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) {
      alert("Speech recognition not supported.");
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      setInput("");
      setPartialInput("");
      recognition.start();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as string;
        const newImage: UploadedImage = {
          id: Date.now().toString() + Math.random(),
          data: data,
          fileName: file.name,
        };
        setUploadedImages((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const formatAIResponse = (text: string) => {
    return text.replace(/\*\*/g, "").replace(/\*/g, "").trim();
  };

  const getFriendlyErrorMessage = (status?: number, message?: string) => {
    const normalized = (message || "").toLowerCase();

    if (status === 503 || normalized.includes("overload")) {
      return "The model is a bit busy right now. Please try again in a few moments.";
    }

    if (status === 429 || normalized.includes("rate limit") || normalized.includes("too many")) {
      return "You've reached the current usage limit. Please wait a bit or upgrade for more capacity.";
    }

    if (status === 502 || status === 504 || normalized.includes("network")) {
      return "We ran into a brief network hiccup. Please resend your message.";
    }

    return "Something went wrong while generating a response. Please try again shortly.";
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!session?.user?.email) {
      alert("Please log in to use the AI chat");
      router.push("/login");
      return;
    }

    const finalMessage = (input + " " + partialInput).trim();
    if (finalMessage === "" && uploadedImages.length === 0) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: finalMessage,
        images: uploadedImages.map((img) => img.data),
      },
    ]);

    setInput("");
    setPartialInput("");
    setTemplateTitle("");
    setUploadedImages([]);

    try {
      if (recognition && isRecording) {
        recognition.stop();
        setIsRecording(false);
      }
    } catch (err) {
      // ignore
    }

    (async () => {
      try {
        setIsStreaming(true);
        const newMessageId = Date.now();
        setMessages((prev) => [...prev, { sender: "ai", text: "", id: newMessageId }]);

        const controller = new AbortController();
        abortCtrl.current = controller;

        const userEmail = session.user.email;
        if (!userEmail) {
          throw new Error("User email not found in session");
        }
        
        console.log("📤 Sending message with email:", userEmail);

        // Use different endpoints for new vs existing conversations
        const endpoint = conversationId
          ? `${API_URL}/chat/send/stream`
          : `${API_URL}/chat/new/stream`;

        console.log("🔗 Endpoint:", endpoint);
        console.log("💬 Message:", finalMessage);

        const payload = conversationId
          ? {
              conversation_id: conversationId,
              message: finalMessage,
              ...(uploadedImages.length > 0 && { images: uploadedImages.map((img) => img.data) }),
            }
          : {
              first_message: finalMessage,
              ...(uploadedImages.length > 0 && { images: uploadedImages.map((img) => img.data) }),
            };

        console.log("📦 Payload:", JSON.stringify(payload).substring(0, 100) + "...");

        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userEmail}`,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        console.log("📡 Response Status:", res.status, res.statusText);

        if (!res.ok) {
          const errorBody = await res.text();
          console.error("❌ Error Response:", errorBody);
          let errorMsg = "Request failed";
          try {
            const err = JSON.parse(errorBody);
            errorMsg = err.error || err.message || errorMsg;
          } catch {
            errorMsg = errorBody || res.statusText;
          }
          const friendlyError = getFriendlyErrorMessage(res.status, errorMsg);

          setMessages((prev) => {
            const copy = [...prev];
            const lastIdx = copy.length - 1;
            copy[lastIdx] = {
              ...copy[lastIdx],
              text: friendlyError,
            };
            return copy;
          });
          setIsStreaming(false);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          throw new Error("Streaming not supported or empty response body");
        }

        const decoder = new TextDecoder();
        let done = false;
        let aiText = "";
        let buffer = "";
        let chunkCount = 0;

        console.log("🔄 Starting stream reading...");

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;

          if (!value) {
            console.log("⏸️ Empty chunk received");
            continue;
          }

          chunkCount++;
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk.replace(/\r/g, "");
          console.log(`📥 Chunk ${chunkCount} received, buffer length: ${buffer.length}`);

          // Split by double newlines (SSE format)
          const segments = buffer.split("\n\n");
          buffer = segments.pop() || "";

          console.log(`🔀 Processing ${segments.length} segments`);

          for (const segment of segments) {
            const line = segment.trim();
            
            if (!line) {
              console.log("⏭️ Empty segment");
              continue;
            }

            if (!line.startsWith("data:")) {
              console.log(`⏭️ Non-data line: ${line.substring(0, 30)}`);
              continue;
            }

            const payload = line.slice(5).trim();
            if (!payload) {
              console.log("⏭️ Empty payload after 'data:'");
              continue;
            }

            try {
              const data = JSON.parse(payload);
              console.log("✅ Parsed data:", {
                hasChunk: !!data.chunk,
                chunkLength: data.chunk?.length || 0,
                isDone: data.done,
                conversationId: data.conversation_id,
              });

              if (data.chunk) {
                aiText += data.chunk;
                console.log(`📝 Added chunk, total text length: ${aiText.length}`);
              }

              if (data.done && data.conversation_id) {
                setConversationId(data.conversation_id);
                console.log("🆔 Set conversation_id:", data.conversation_id);
              }

              if (data.error) {
                console.error("❌ Stream error:", data.error);
              }
            } catch (e) {
              console.error("❌ Failed to parse JSON:", e, "Payload:", payload);
            }
          }

          // Update UI with current text
          setMessages((prev) => {
            const copy = [...prev];
            const lastIdx = copy.length - 1;
            copy[lastIdx] = {
              ...copy[lastIdx],
              text: aiText || "Loading...",
            };
            return copy;
          });
        }

        console.log("✅ Stream complete. Total text:", aiText.length);

        if (!aiText) {
          console.warn("⚠️ No text received from stream");
        }

        setMessages((prev) => {
          const copy = [...prev];
          const lastIdx = copy.length - 1;
          copy[lastIdx] = {
            ...copy[lastIdx],
            text: formatAIResponse(aiText.trim()) || "No response received",
          };
          return copy;
        });

        setIsStreaming(false);
        abortCtrl.current = null;
      } catch (err: any) {
        console.error("❌ Stream error:", err);

        if (err?.name === "AbortError") {
          console.log("🛑 Stream was cancelled by user");
          setMessages((prev) => {
            const copy = [...prev];
            const lastIdx = copy.length - 1;
            copy[lastIdx] = {
              ...copy[lastIdx],
              text: (copy[lastIdx].text || "") + "\n\n[Stream cancelled]",
            };
            return copy;
          });
          setIsStreaming(false);
          abortCtrl.current = null;
          return;
        }

        const errorMsg = err.message || String(err);
        console.error("💥 Error message:", errorMsg);
        const friendlyError = getFriendlyErrorMessage(undefined, errorMsg);

        setMessages((prev) => {
          const copy = [...prev];
          const lastIdx = copy.length - 1;
          copy[lastIdx] = {
            ...copy[lastIdx],
            text: friendlyError,
          };
          return copy;
        });

        setIsStreaming(false);
        abortCtrl.current = null;
      }
    })();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const cancelStreaming = () => {
    if (abortCtrl.current) {
      try {
        abortCtrl.current.abort();
      } catch (e) {
        console.error("Error aborting:", e);
      }
    }
    setIsStreaming(false);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-5xl h-full sm:h-full flex flex-col p-4 sm:p-6 bg-gray-950 text-gray-200 shadow-2xl">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute w-80 h-80 rounded-full bg-purple-600 opacity-20 -top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-60 h-60 rounded-full bg-blue-500 opacity-20 bottom-10 right-10 animate-pulse animation-delay-500"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl h-[90vh] flex flex-col p-6 rounded-3xl bg-gray-800/50 shadow-2xl">
        {/* Header with Premium Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-700 mb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              AI Chat Session
              {isPremiumUser && (
                <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full font-semibold">
                  Elite
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Template Badge */}
        {templateTitle && (
          <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-purple-400">📝 Using template:</span>
              <span className="text-white font-medium">{templateTitle}</span>
              <button
                onClick={() => setTemplateTitle("")}
                className="ml-auto text-purple-400 hover:text-purple-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-4 rounded-3xl max-w-[85%] ${
                  msg.sender === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                {msg.images && msg.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {msg.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`uploaded ${idx}`}
                        className="rounded-lg max-h-32 object-cover"
                      />
                    ))}
                  </div>
                )}
                {msg.sender === "ai" ? (
                  <div className="leading-relaxed">
                    <MarkdownRenderer content={msg.text} />
                    {msg.text && msg.text !== "Loading..." && (
                      <div className="mt-2 flex justify-end">
                        <CopyButton text={msg.text} />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing indicator */}
        {isStreaming && (
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
            <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse animation-delay-200" />
            <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse animation-delay-400" />
            <div>AI is typing...</div>
          </div>
        )}

        {/* Uploaded Images Preview */}
        {uploadedImages.length > 0 && (
          <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
            <div className="text-sm text-gray-300 mb-2">Attached Images:</div>
            <div className="grid grid-cols-3 gap-2">
              {uploadedImages.map((img) => (
                <div key={img.id} className="relative">
                  <img
                    src={img.data}
                    alt={img.fileName}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input form */}
        <form
          onSubmit={handleSendMessage}
          className="pt-4 border-t border-gray-700 flex items-end space-x-2"
        >
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-3 rounded-full font-semibold text-white transition-colors mb-1 ${
              isRecording
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            disabled={!recognition}
          >
            {isRecording ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </button>

          {isPremiumUser && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-full font-semibold text-white bg-gray-700 hover:bg-gray-600 transition-colors mb-1"
              title="Upload images (Premium only)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={!isPremiumUser}
          />

          <textarea
            placeholder={templateTitle ? "Edit template or add your own message..." : "Type your message..."}
            value={input + (partialInput ? " " + partialInput : "")}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex-1 px-4 py-3 rounded-2xl bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 border border-transparent focus:border-purple-600 transition-colors resize-none min-h-[48px] max-h-[200px] overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#6B7280 #374151",
            }}
          />

          <button
            type="submit"
            disabled={isStreaming}
            className="px-6 py-3 rounded-full font-semibold text-white transition-colors bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed mb-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>

          {isStreaming && (
            <button
              type="button"
              onClick={cancelStreaming}
              className="ml-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold mb-1"
            >
              Stop
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default App;


