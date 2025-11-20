// app/dashboard/page.tsx - WITHOUT X-AXIS OVERFLOW

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  Sparkles, TrendingUp, Clock, MessageSquare, Eye, Heart, Trophy, 
  Target, Zap, Users, Calendar, BarChart3, Settings, LogOut, Crown, Flame 
} from "lucide-react";
import { DashboardStatsSection } from '@/components/DashboardStats';
import { WeeklyActivityChart } from '@/components/WeeklyActivityChart';
import RecentSessions from '@/components/RecentSessions';
import QuickStartTemplates from "@/components/QuickStartTemplates";
import UsageStats from "@/components/UsageStats";
// import DailyChatLimit from "@/components/DailyChatLimit";
import Achievements from "@/components/Achievements";
import SettingsPage from "./Settings/page";
import { RateLimitDisplay } from "@/components/RateLimitDisplay";


const DashboardPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    stats: { ideas: 0, sessions: 0, hours: 0, growth: 0 },
    usage: { used: 0, remaining: 100, total: 100, thisWeek: [] as number[] },
    communityIdeas: [] as any[],
    recentSessions: [] as any[],
    achievements: [] as any[],
    upcomingEvents: [] as any[],
  });

  const is_premium = session?.user?.is_premium;
  const userEmail = session?.user?.email;

  // Fetch dashboard data from backend
  useEffect(() => {
    if (status === "authenticated" && userEmail) {
      fetchDashboardData();
    }
  }, [status, session, userEmail]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/dashboard/stats`,
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
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-gray-400">Loading Dashboard...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 overflow-x-hidden">
      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="w-full sm:flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white break-words">
                Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  {session?.user?.name || "User"}
                </span>
              </h2>
            </div>
            
            {/* Premium Badge - Enhanced */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {is_premium ? (
                <div className="flex flex-wrap items-center gap-2">
                  {/* Animated Premium Badge */}
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow-lg">
                      <Crown className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="whitespace-nowrap">Elite Member</span>
                    </div>
                  </div>
                  
                  {/* Tier Info */}
                  <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded whitespace-nowrap">
                    Tier 2 • More chats
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => router.push("/dashboard/upgrade")}
                  className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/50 whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                  Upgrade to Elite
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full sm:w-auto">
            <button
              onClick={() => router.push("/dashboard/new-ai-session")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all shadow-lg hover:shadow-purple-500/50 whitespace-nowrap"
            >
              <Zap className="w-5 h-5 flex-shrink-0" />
              New AI Session
            </button>
          </div>
        </header>

        {/* Premium Features Banner - Only show if not premium */}
        {!is_premium && (
          <div className="mb-8 p-4 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <Crown className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0">
                  <h3 className="font-semibold text-white mb-1">Unlock Premium Features</h3>
                  <p className="text-sm text-gray-300 break-words">
                    Get unlimited chats, AI credits, image analysis, and more with premium
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push("/dashboard/upgrade")}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold transition-all whitespace-nowrap"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <section className="mb-8">
          <DashboardStatsSection />
        </section>

        {/* Weekly Activity Chart */}
        <section className="mb-8 overflow-x-auto">
          <WeeklyActivityChart />
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Sessions */}
          <div className="lg:col-span-2 pb-8 min-w-0">
            <RecentSessions />
            
           <section>
              {/* Usage Stats */}
            <UsageStats usage={dashboardData.usage} is_premium={is_premium} />
            </section>
          </div>

          <div className="flex flex-col gap-6">
            {/* Daily Chat Limit (Free users only) */}
            {/* <DailyChatLimit is_premium={is_premium} /> */}
           
            {/* Rate Limit Display */}
            <RateLimitDisplay />
          </div>
        </div>

        {/* Quick Start Templates - Full Width */}
        {/* <section className="mb-8 overflow-x-auto">
          <QuickStartTemplates />
        </section> */}

        {/* Premium Features Section - Only show if premium */}
        {is_premium && (
          <section className="mb-8 p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <h3 className="text-xl font-bold text-white">Premium Features</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <h4 className="font-semibold text-white break-words">More Chats</h4>
                </div>
                <p className="text-sm text-gray-400">Create more conversations daily without restrictions</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <h4 className="font-semibold text-white break-words">Image Analysis</h4>
                </div>
                <p className="text-sm text-gray-400">Upload and analyze images with AI vision capabilities</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <h4 className="font-semibold text-white break-words">Advanced Analytics</h4>
                </div>
                <p className="text-sm text-gray-400">View detailed usage statistics and insights</p>
              </div>
            </div>
          </section>
        )}

        {/* Achievements */}
        <section>
          <Achievements />
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;



