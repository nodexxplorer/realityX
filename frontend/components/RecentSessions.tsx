// components/RecentSessions.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Session = {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_at: string;
};

interface SessionCardProps extends Session {
  onClick: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({
  title,
  message_count,
  created_at,
  onClick,
}) => {
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return "just now";
  };

  const getDuration = (count: number) => {
    // Estimate duration based on message count (avg 2 min per message)
    const minutes = count * 2;
    if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-6 bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-xl hover:border-purple-500/50 hover:bg-slate-800/70 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-8 ">
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-2 break-words">
            {title}
          </h4>
        </div>
        <svg
          className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2"
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

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            {message_count} messages
          </span>
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {getDuration(message_count)}
          </span>
        </div>
        <span className="text-slate-500 text-xs">{getTimeAgo(created_at)}</span>
      </div>
    </button>
  );
};

export default function RecentSessions() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;

    loadSessions();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSessions, 30000);
    return () => clearInterval(interval);
  }, [session?.user?.email, status]);

  const loadSessions = async () => {
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
      // Only take first 4 sessions
      setSessions((data.conversations ?? []).slice(0, 4));
    } catch (err: any) {
      console.error("❌ Error loading sessions:", err);
      setError(err.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSession = (sessionId: number) => {
    router.push(`/dashboard/ai-sessions/${sessionId}`);
  };

  const handleViewAll = () => {
    router.push("/dashboard/ai-sessions");
  };

  if (status === "loading" || loading) {
    return (
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">Recent Sessions</h3>
          <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
            View All →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-slate-800/50 rounded-xl p-6 animate-pulse"
            >
              <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-slate-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Recent Sessions</h3>
        <button
          onClick={handleViewAll}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
        >
          View All →
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">Error: {error}</p>
          <button
            onClick={loadSessions}
            className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
          >
            Try again
          </button>
        </div>
      )}

      {!error && sessions.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-white/5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-4 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <p className="text-slate-400 mb-2">No sessions yet</p>
          <p className="text-sm text-slate-500">
            Start your first AI conversation to see it here
          </p>
          <button
            onClick={() => router.push("/dashboard/new-ai-session")}
            className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm font-medium transition-all"
          >
            Start New Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              {...session}
              onClick={() => handleOpenSession(session.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}