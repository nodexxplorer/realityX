// app/dashboard/ai-sessions/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Conversation = {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_at: string;
};

export default function HistoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const isPremiumUser = session?.user?.is_premium;
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;

    loadConversations();
  }, [session?.user?.email, status]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/chat/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.email}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || err.message || res.statusText);
      }

      const data = await res.json();
      console.log("✅ Loaded conversations:", data);
      setConversations(data.conversations ?? []);
    } catch (err: any) {
      console.error("❌ Error loading conversations:", err);
      setError(err.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (conversation: Conversation) => {
    // FIX: Route to the correct path where your chat detail page is located
    router.push(`/dashboard/ai-sessions/${conversation.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, conversationId: number) => {
    e.stopPropagation();
    setDeleteConfirm(conversationId);
  };

  const handleConfirmDelete = async (e: React.MouseEvent, conversationId: number) => {
    e.stopPropagation();

    try {
      setDeleting(conversationId);

      const res = await fetch(`${API_URL}/chat/delete/${conversationId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.email}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || err.message || res.statusText);
      }

      console.log("✅ Conversation deleted");
      setConversations((prev) =>
        prev.filter((conv) => conv.id !== conversationId)
      );
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error("❌ Error deleting conversation:", err);
      alert(`Failed to delete: ${err.message || "Unknown error"}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm(null);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-200 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-base sm:text-lg">Loading session…</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-200 px-4">
        <div className="text-base sm:text-lg text-center">
          Please sign in to see your chat history.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 sm:p-6 lg:p-8">
      {/* Background elements */}
      <div className="fixed top-0 left-0 w-full h-full">
        <div className="absolute w-80 h-80 rounded-full bg-purple-600 opacity-20 -top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-60 h-60 rounded-full bg-blue-500 opacity-20 bottom-10 right-10 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Chat History
              {isPremiumUser && (
                <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full font-semibold">
                  Elite
                </span>
              )}
            </h1>
            
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/new-ai-session")}
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-white transition-colors bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-sm sm:text-base"
          >
            New Chat
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 sm:py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <div className="text-base sm:text-lg">Loading your history...</div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 sm:p-6 mb-6">
            <p className="text-red-400 text-sm sm:text-base">Error: {error}</p>
            <button
              onClick={loadConversations}
              className="mt-3 text-xs sm:text-sm text-red-300 hover:text-red-200 underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          {conversations.length === 0 && !loading && !error ? (
            <div className="text-center py-12 sm:py-16 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto mb-4 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-base sm:text-lg">No chat history yet.</p>
              <p className="text-xs sm:text-sm mt-2">
                Start a new AI chat to create your first conversation!
              </p>
            </div>
          ) : null}

          {conversations.map((conversation) => (
            <div key={conversation.id}>
              {deleteConfirm === conversation.id ? (
                <div className="w-full p-4 sm:p-6 bg-red-900/20 border border-red-500/50 rounded-xl space-y-3 sm:space-y-4">
                  <p className="text-sm sm:text-base text-red-300">
                    Are you sure you want to delete this conversation? This action cannot be undone.
                  </p>
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={(e) => handleConfirmDelete(e, conversation.id)}
                      disabled={deleting === conversation.id}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-medium transition-colors"
                    >
                      {deleting === conversation.id ? "Deleting..." : "Delete"}
                    </button>
                    <button
                      onClick={handleCancelDelete}
                      disabled={deleting === conversation.id}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleOpenChat(conversation)}
                  className="w-full text-left p-4 sm:p-6 bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-xl hover:border-purple-500/50 hover:bg-gray-800/70 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm text-gray-400">
                        {new Date(conversation.created_at).toLocaleString()}
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold mt-1 text-white group-hover:text-purple-300 transition-colors line-clamp-2 break-words">
                        {conversation.title}
                      </h3>
                      {/* <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {conversation.message_count} message{conversation.message_count !== 1 ? "s" : ""}
                      </p> */}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => handleDeleteClick(e, conversation.id)}
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete conversation"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}





