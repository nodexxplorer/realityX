// app/components/UsageStats.tsx - PREMIUM-AWARE VERSION
"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, Zap, Clock, TrendingUp, Crown } from "lucide-react";
import { getUsageStats } from "@/lib/api/dashboard";

interface UsageStatsProps {
  usage?: {
    used: number;
    remaining: number;
    total: number;
    thisWeek: number[];
  };
  is_premium?: boolean;
}

const defaultUsage = {
  used: 0,
  remaining: 100,
  total: 100,
  thisWeek: [0, 0, 0, 0, 0, 0, 0],
};

const UsageStats: React.FC<UsageStatsProps> = ({ 
  usage = defaultUsage,
  is_premium = false 
}) => {
  const [stats, setStats] = useState(usage);

  // Load real usage stats from backend
  useEffect(() => {
    let isMounted = true;

    const loadUsage = async () => {
      try {
        const backendUsage = await getUsageStats();

        if (!isMounted) return;

        setStats({
          used: backendUsage.messagesUsed,
          total: backendUsage.messagesLimit,
          remaining: backendUsage.messagesLimit - backendUsage.messagesUsed,
          thisWeek: usage.thisWeek ?? defaultUsage.thisWeek,
        });
      } catch (error) {
        console.error("❌ Error loading usage stats in dashboard:", error);
        // Fall back to existing stats (defaults)
      }
    };

    loadUsage();

    return () => {
      isMounted = false;
    };
  }, [usage.thisWeek]);

  // Set limits based on subscription
  const messageLimit = is_premium ? 1000 : 100;
  const tokenLimit = is_premium ? 1000000 : 100000;
  const messagesUsed = stats.used;
  const tokensUsed = Math.floor((messagesUsed / messageLimit) * tokenLimit);

  const messagePercentage = (messagesUsed / messageLimit) * 100;
  const tokenPercentage = (tokensUsed / tokenLimit) * 100;

  // Warning level logic
  const getWarningLevel = (percentage: number) => {
    if (percentage >= 90) return "critical";
    if (percentage >= 75) return "warning";
    if (percentage >= 50) return "caution";
    return "safe";
  };

  const messageWarning = getWarningLevel(messagePercentage);
  const tokenWarning = getWarningLevel(tokenPercentage);

  const getProgressColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-500";
      case "warning":
        return "bg-orange-500";
      case "caution":
        return "bg-yellow-500";
      default:
        return "bg-gradient-to-r from-purple-500 to-blue-500";
    }
  };

  const getProgressBgColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-900/30";
      case "warning":
        return "bg-orange-900/30";
      case "caution":
        return "bg-yellow-900/30";
      default:
        return "bg-gray-700/50";
    }
  };

  return (
    <div className="bg-gray-800/50 mt-8 backdrop-blur-md border border-gray-700 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Usage Stats</h3>
        </div>
        {is_premium && (
          <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full font-semibold">
            <Crown className="w-3 h-3" />
            Premium
          </span>
        )}
      </div>

      {/* Messages Usage */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-300">Monthly Messages</label>
          <span className={`text-sm font-bold ${
            messageWarning === "critical" ? "text-red-400" :
            messageWarning === "warning" ? "text-orange-400" :
            messageWarning === "caution" ? "text-yellow-400" :
            "text-green-400"
          }`}>
            {messagesUsed.toLocaleString()} / {messageLimit.toLocaleString()}
          </span>
        </div>
        <div className={`w-full h-2 rounded-full overflow-hidden ${getProgressBgColor(messageWarning)}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${getProgressColor(messageWarning)}`}
            style={{ width: `${Math.min(messagePercentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {messageWarning === "critical" && "🚨 You've reached 90% of your limit"}
          {messageWarning === "warning" && "⚠️ Approaching your monthly limit"}
          {messageWarning === "caution" && "ℹ️ You're using 50% of your limit"}
          {messageWarning === "safe" && `✅ ${messageLimit - messagesUsed} messages remaining`}
        </p>
      </div>

      {/* Token Usage */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-300">Token Usage</label>
          <span className={`text-sm font-bold ${
            tokenWarning === "critical" ? "text-red-400" :
            tokenWarning === "warning" ? "text-orange-400" :
            tokenWarning === "caution" ? "text-yellow-400" :
            "text-green-400"
          }`}>
            {Math.floor(tokensUsed).toLocaleString()} / {(tokenLimit / 1000).toLocaleString()}K
          </span>
        </div>
        <div className={`w-full h-2 rounded-full overflow-hidden ${getProgressBgColor(tokenWarning)}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${getProgressColor(tokenWarning)}`}
            style={{ width: `${Math.min(tokenPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Subscription Info */}
      <div className={`p-4 rounded-lg border ${
        is_premium 
          ? "bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30" 
          : "bg-gray-700/50 border-gray-600"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-300">
            {is_premium ? "Premium Subscription" : "Free Plan"}
          </span>
          {is_premium && (
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded font-semibold">
              Active
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">
          {is_premium 
            ? "You have unlimited AI credits and premium features enabled"
            : "Upgrade to Premium for unlimited credits and image analysis"
          }
        </p>
      </div>

      {/* Reset Info */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Resets on the first day of each month</span>
        </div>
      </div>

      {/* Upgrade Suggestion for Free Users */}
      {!is_premium && (
        <div className="mt-4">
          <button
            onClick={() => window.location.href = "/dashboard/upgrade"}
            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-semibold transition-all"
          >
            Upgrade to Premium
          </button>
        </div>
      )}
    </div>
  );
};

export default UsageStats;















// // components/UsageStats.tsx

// "use client";
// import React, { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";

// type UsageData = {
//   messagesUsed: number;
//   messagesLimit: number;
//   tokensUsed: number;
//   tokensLimit: number;
//   subscriptionType: "free" | "premium";
//   subscriptionEndsAt?: string;
//   streakDays: number;
//   activeDaysThisMonth: number;
// };

// const StatCard = ({
//   icon,
//   label,
//   value,
//   subValue,
//   progress,
//   color = "purple"
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value: string;
//   subValue?: string;
//   progress?: number;
//   color?: string;
// }) => {
//   const colorClasses = {
//     purple: "from-purple-500 to-blue-500",
//     green: "from-green-500 to-emerald-500",
//     orange: "from-orange-500 to-red-500",
//     blue: "from-blue-500 to-cyan-500"
//   };

//   return (
//     <div className="p-6 bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-xl hover:border-purple-500/30 transition-all">
//       <div className="flex items-start justify-between mb-4">
//         <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center shadow-lg`}>
//           {icon}
//         </div>
//         <div className="text-right">
//           <div className="text-2xl font-bold text-white">{value}</div>
//           {subValue && <div className="text-xs text-slate-400">{subValue}</div>}
//         </div>
//       </div>
      
//       <div className="text-sm text-slate-400 mb-2">{label}</div>
      
//       {progress !== undefined && (
//         <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
//           <div
//             className={`h-full bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} transition-all duration-500`}
//             style={{ width: `${Math.min(progress, 100)}%` }}
//           ></div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default function UsageStats() {
//   const { data: session, status } = useSession();
//   const [usageData, setUsageData] = useState<UsageData>({
//     messagesUsed: 0,
//     messagesLimit: 100,
//     tokensUsed: 0,
//     tokensLimit: 100000,
//     subscriptionType: "free",
//     streakDays: 0,
//     activeDaysThisMonth: 0
//   });
//   const [loading, setLoading] = useState(true);

//   const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

//   useEffect(() => {
//     if (status !== "authenticated" || !session?.user?.email) return;

//     loadUsageStats();
//   }, [session?.user?.email, status]);

//   const loadUsageStats = async () => {
//     try {
//       setLoading(true);

//       const res = await fetch(`${API_URL}/dashboard/usage-stats`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${session?.user?.email}`,
//         },
//       });

//       if (res.ok) {
//         const data = await res.json();
//         setUsageData(data);
//       }
//     } catch (err) {
//       console.error("❌ Error loading usage stats:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getDaysUntilReset = () => {
//     const now = new Date();
//     const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
//     const daysLeft = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
//     return daysLeft;
//   };

//   const getDaysUntilExpiry = () => {
//     if (!usageData.subscriptionEndsAt) return null;
//     const now = new Date();
//     const expiryDate = new Date(usageData.subscriptionEndsAt);
//     const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
//     return daysLeft;
//   };

//   const messageProgress = (usageData.messagesUsed / usageData.messagesLimit) * 100;
//   const tokenProgress = (usageData.tokensUsed / usageData.tokensLimit) * 100;

//   if (loading) {
//     return (
//       <div className="space-y-6">
//         <h3 className="text-2xl font-bold text-white">Usage & Stats</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           {[1, 2, 3, 4].map((i) => (
//             <div key={i} className="p-6 bg-slate-800/50 rounded-xl animate-pulse">
//               <div className="h-12 w-12 bg-slate-700 rounded-lg mb-4"></div>
//               <div className="h-8 bg-slate-700 rounded w-1/2 mb-2"></div>
//               <div className="h-4 bg-slate-700 rounded w-3/4"></div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h3 className="text-2xl font-bold text-white">Usage & Stats</h3>
//           <p className="text-sm text-slate-400 mt-1">Track your activity and limits</p>
//         </div>
//         {usageData.subscriptionType === "premium" && (
//           <span className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-semibold">
//             ⭐ Premium
//           </span>
//         )}
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
//         {/* Messages Used */}
//         <StatCard
//           icon={
//             <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//             </svg>
//           }
//           label="Messages Used"
//           value={`${usageData.messagesUsed}/${usageData.messagesLimit}`}
//           subValue={`Resets in ${getDaysUntilReset()} days`}
//           progress={messageProgress}
//           color="purple"
//         />

//         {/* Tokens Used */}
//         {/* <StatCard
//           icon={
//             <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//             </svg>
//           }
//           label="Tokens Used"
//           value={`${(usageData.tokensUsed / 1000).toFixed(1)}K`}
//           subValue={`of ${(usageData.tokensLimit / 1000).toFixed(0)}K`}
//           progress={tokenProgress}
//           color="blue"
//         /> */}

//         {/* Streak */}
//         <StatCard
//           icon={
//             <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
//             </svg>
//           }
//           label="Day Streak"
//           value={`${usageData.streakDays}`}
//           subValue="Keep it going! 🔥"
//           color="orange"
//         />

//         {/* Active Days */}
//         {/* <StatCard
//           icon={
//             <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//             </svg>
//           }
//           label="Active Days (Month)"
//           value={`${usageData.activeDaysThisMonth}`}
//           subValue={usageData.subscriptionType === "premium" && getDaysUntilExpiry() ? `Premium: ${getDaysUntilExpiry()} days left` : "Free Plan"}
//           color="green"
//         /> */}
//       </div>

//       {/* Warning if approaching limits */}
//       {messageProgress > 80 && (
//         <div className="p-4 bg-orange-500/10 border border-orange-500/50 rounded-lg">
//           <div className="flex items-start gap-3">
//             <svg className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//             </svg>
//             <div>
//               <p className="text-orange-400 font-semibold text-sm">Approaching Message Limit</p>
//               <p className="text-orange-300/80 text-xs mt-1">
//                 You've used {messageProgress.toFixed(0)}% of your monthly messages. 
//                 {usageData.subscriptionType === "free" && " Consider upgrading to Premium for unlimited messages."}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }