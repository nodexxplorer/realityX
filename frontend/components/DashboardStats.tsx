// frontend/components/DashboardStats.tsx

'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Clock, TrendingUp, MessageSquare } from 'lucide-react';
import { getDashboardStats, startSession, endSession, type DashboardStats } from '@/lib/api/dashboard';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon: Icon, trend, color, subtitle }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${color} p-6 text-white shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs opacity-75">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">
                {trend > 0 ? '+' : ''}{trend}% from last month
              </span>
            </div>
          )}
        </div>
        <div className="rounded-lg bg-white/20 p-3">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export function DashboardStatsSection() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<number | null>(null);

  useEffect(() => {
    // Start session tracking
    startSession()
      .then(({ session_id }) => setSessionId(session_id))
      .catch(console.error);

    // Load initial stats
    loadStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);

    // End session on unmount
    return () => {
      clearInterval(interval);
      if (sessionId) {
        endSession(sessionId).catch(console.error);
      }
    };
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Chats"
        value={stats.conversations.total}
        icon={Sparkles}
        trend={stats.growth}
        color="from-purple-500 to-pink-500"
        subtitle={`${stats.conversations.today} created today`}
      />
      
      <StatCard
        title="Active Hours"
        value={`${stats.hours.total}h`}
        icon={Clock}
        color="from-green-500 to-emerald-500"
        subtitle={`${stats.hours.today}h today`}
      />
      
      <StatCard
        title="Growth"
        value={`${stats.growth > 0 ? '+' : ''}${stats.growth}%`}
        icon={TrendingUp}
        color="from-orange-500 to-red-500"
        subtitle="vs last month"
      />
      
      <StatCard
        title="Messages"
        value={stats.messages.total}
        icon={MessageSquare}
        color="from-blue-500 to-cyan-500"
        subtitle={`${stats.messages.today} today`}
      />
    </div>
  );
}