// app/components/DailyChatLimit.tsx
"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, RefreshCw, Clock } from "lucide-react";

interface DailyChatLimitProps {
  is_premium?: boolean;
}

const DailyChatLimit: React.FC<DailyChatLimitProps> = ({ is_premium = false }) => {
  const [chatsUsed, setChatsUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const DAILY_LIMIT = is_premium ? Infinity : 10;
  const percentage = is_premium ? 0 : (chatsUsed / DAILY_LIMIT) * 100;

  // Fetch daily chat usage
  useEffect(() => {
    fetchDailyChatUsage();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDailyChatUsage, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDailyChatUsage = async () => {
    try {
      setIsLoading(true);
      const userEmail = localStorage.getItem("userEmail") || 
                       sessionStorage.getItem("userEmail");
      
      if (!userEmail) {
        setError("User not authenticated");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/dashboard/daily-usage`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${userEmail}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setChatsUsed(data.chatsUsed || 0);
        setError(null);
      } else {
        setError("Failed to fetch usage");
      }
    } catch (err) {
      console.error("Error fetching daily chat usage:", err);
      setError("Error loading usage data");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate circle properties
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color based on usage
  const getColor = () => {
    if (percentage >= 90) return "#ef4444"; // red
    if (percentage >= 75) return "#f97316"; // orange
    if (percentage >= 50) return "#eab308"; // yellow
    return "#a855f7"; // purple
  };

  const getTextColor = () => {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 75) return "text-orange-500";
    if (percentage >= 50) return "text-yellow-500";
    return "text-purple-500";
  };

  const getWarningText = () => {
    if (percentage >= 90) return "🚨 Limit almost reached!";
    if (percentage >= 75) return "⚠️ Approaching limit";
    if (percentage >= 50) return "ℹ️ Half limit used";
    return "✅ Plenty of chats left";
  };

  if (is_premium) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-center flex-col gap-4 py-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-1">Unlimited Chats</h3>
            <p className="text-sm text-gray-400">Premium members can create unlimited chats daily</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Daily Chat Limit</h3>
        </div>
        <button
          onClick={fetchDailyChatUsage}
          disabled={isLoading}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
          title="Refresh usage"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Circular Progress */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative w-40 h-40">
          {/* Background circle */}
          <svg
            className="transform -rotate-90 w-full h-full"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-700"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={getColor()}
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-3xl font-bold ${getTextColor()} transition-colors`}>
              {chatsUsed}
            </div>
            <div className="text-xs text-gray-400 mt-1">/ {DAILY_LIMIT}</div>
          </div>
        </div>

        {/* Percentage text */}
        <p className="text-sm text-gray-400 mt-4">
          {Math.round(percentage)}% of daily limit used
        </p>
      </div>

      {/* Status message */}
      <div className={`p-3 rounded-lg border ${
        percentage >= 90
          ? "bg-red-900/20 border-red-500/30 text-red-300"
          : percentage >= 75
          ? "bg-orange-900/20 border-orange-500/30 text-orange-300"
          : percentage >= 50
          ? "bg-yellow-900/20 border-yellow-500/30 text-yellow-300"
          : "bg-green-900/20 border-green-500/30 text-green-300"
      } text-sm font-medium text-center mb-4`}>
        {getWarningText()}
      </div>

      {/* Remaining chats info */}
      <div className="p-3 bg-gray-700/50 rounded-lg mb-4">
        <p className="text-sm text-gray-300 text-center">
          <span className="font-semibold text-white">{DAILY_LIMIT - chatsUsed}</span> chats remaining today
        </p>
      </div>

      {/* Reset time info */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <Clock className="w-3.5 h-3.5" />
        <span>Resets at midnight UTC</span>
      </div>

      {/* Upgrade suggestion */}
      {percentage >= 50 && (
        <button
          onClick={() => window.location.href = "/dashboard/upgrade"}
          className="w-full mt-4 py-2 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-semibold transition-all"
        >
          Upgrade to Unlimited
        </button>
      )}
    </div>
  );
};

export default DailyChatLimit;