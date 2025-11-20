// components/Achievements.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  color: string;
  progress?: string | null;
};

interface AchievementBadgeProps extends Achievement {}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  title,
  description,
  icon,
  unlocked,
  color,
  progress,
}) => {
  return (
    <div
      className={`relative p-6 rounded-xl border transition-all ${
        unlocked
          ? "bg-slate-800/50 border-white/10 hover:border-purple-500/50 hover:bg-slate-800/70"
          : "bg-slate-900/30 border-white/5 opacity-50"
      }`}
    >
      {/* Gradient glow on unlocked */}
      {unlocked && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 hover:opacity-10 transition-opacity rounded-xl`}
        ></div>
      )}

      <div className="relative z-10 flex flex-col items-center text-center space-y-3">
        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
            unlocked
              ? `bg-gradient-to-br ${color} shadow-lg`
              : "bg-slate-800/50 grayscale"
          }`}
        >
          {icon}
        </div>

        {/* Title */}
        <div>
          <h4
            className={`font-semibold text-sm ${
              unlocked ? "text-white" : "text-slate-500"
            }`}
          >
            {title}
          </h4>
          <p
            className={`text-xs mt-1 ${
              unlocked ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {description}
          </p>
        </div>

        {/* Status */}
        {unlocked ? (
          <div className="flex items-center gap-1 text-xs">
            <svg
              className="w-4 h-4 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-green-400 font-medium">Unlocked</span>
          </div>
        ) : progress ? (
          <div className="w-full">
            <div className="text-xs text-slate-500 mb-1">{progress}</div>
            <div className="w-full bg-slate-700/50 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full bg-gradient-to-r ${color}`}
                style={{
                  width: `${
                    (parseInt(progress.split("/")[0]) /
                      parseInt(progress.split("/")[1])) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs">
            <svg
              className="w-4 h-4 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="text-slate-600 font-medium">Locked</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Achievements() {
  const { data: session, status } = useSession();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;

    loadAchievements();
  }, [session?.user?.email, status]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/dashboard/achievements`, {
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
      setAchievements(data.achievements || []);
    } catch (err: any) {
      console.error("❌ Error loading achievements:", err);
      setError(err.message || "Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  if (loading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">Achievements</h3>
            <p className="text-gray-400 text-sm">
              Your milestones and accomplishments
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="p-6 bg-slate-800/50 rounded-xl animate-pulse"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-slate-700 rounded-full"></div>
                <div className="h-4 bg-slate-700 rounded w-24"></div>
                <div className="h-3 bg-slate-700 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white">Achievements</h3>
          <p className="text-gray-400 text-sm">
            Your milestones and accomplishments
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {unlockedCount}/{totalCount}
          </div>
          <div className="text-xs text-gray-400">Unlocked</div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">Error: {error}</p>
          <button
            onClick={loadAchievements}
            className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {achievements.map((achievement) => (
          <AchievementBadge key={achievement.id} {...achievement} />
        ))}
      </div>

      {achievements.length === 0 && !loading && !error && (
        <div className="text-center py-12 text-slate-400">
          <p>No achievements available yet.</p>
        </div>
      )}
    </section>
  );
}