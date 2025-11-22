// components/RateLimitDisplay.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { AlertCircle, Zap, TrendingUp, RefreshCw, Clock, Flame, Target } from 'lucide-react';

interface RateLimitInfo {
  user_id: string;
  tier: string;
  current_count: number;
  limit: number;
  remaining: number;
  reset_time: string;
  allowed: boolean;
}

export function RateLimitDisplay() {
  const { data: session } = useSession();
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch rate limit info on mount and when session changes
  useEffect(() => {
    if (session?.user?.email) {
      fetchRateLimitInfo();
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchRateLimitInfo();
      }, 300000);
      return () => clearInterval(interval);
    }
  }, [session?.user?.email]);

  const fetchRateLimitInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/rate-limit/check', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rate limit info');
      }

      const data = await response.json();
      setRateLimitInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return null;
  }

  if (loading && !rateLimitInfo) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin">
            <RefreshCw className="w-6 h-6 text-blue-400" />
          </div>
          <span className="ml-3 text-sm text-gray-400">Loading rate limit info...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md border border-red-500/30 rounded-2xl p-6 shadow-2xl flex gap-3">
        <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-red-300 mb-1">Error</div>
          <div className="text-xs text-red-200">{error}</div>
        </div>
      </div>
    );
  }

  if (!rateLimitInfo) {
    return null;
  }

  // Calculate circle properties with proper viewBox for stroke
  const percentage = (rateLimitInfo.current_count / rateLimitInfo.limit) * 100;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isLimitReached = rateLimitInfo.current_count >= rateLimitInfo.limit;
  const isWarning = rateLimitInfo.remaining <= 2;
  const resetDate = new Date(rateLimitInfo.reset_time);

  // Determine color based on usage
  const getColor = () => {
    if (isLimitReached) return '#ef4444'; // red
    if (percentage >= 75) return '#f97316'; // orange
    if (percentage >= 50) return '#eab308'; // yellow
    return '#a855f7'; // purple
  };

  const getTextColor = () => {
    if (isLimitReached) return 'text-red-500';
    if (percentage >= 75) return 'text-orange-500';
    if (percentage >= 50) return 'text-yellow-500';
    return 'text-purple-500';
  };

  const getStatusBgColor = () => {
    if (isLimitReached) return 'from-red-900/30 to-red-800/20 border-red-500/30';
    if (percentage >= 75) return 'from-orange-900/30 to-orange-800/20 border-orange-500/30';
    if (percentage >= 50) return 'from-yellow-900/30 to-yellow-800/20 border-yellow-500/30';
    return 'from-green-900/30 to-green-800/20 border-green-500/30';
  };

  const getStatusTextColor = () => {
    if (isLimitReached) return 'text-red-300';
    if (percentage >= 75) return 'text-orange-300';
    if (percentage >= 50) return 'text-yellow-300';
    return 'text-green-300';
  };

  const getWarningText = () => {
    if (isLimitReached) return '🚨 Limit reached!';
    if (percentage >= 75) return '⚠️ Approaching limit';
    if (percentage >= 50) return 'ℹ️ Half limit used';
    return '✅ Plenty of requests left';
  };

  const tierColors = {
    free: { icon: 'bg-gray-700', text: 'text-gray-300', glow: 'shadow-gray-900/50' },
    pro: { icon: 'bg-blue-600', text: 'text-blue-300', glow: 'shadow-blue-900/50' },
    elite: { icon: 'bg-purple-600', text: 'text-purple-300', glow: 'shadow-purple-900/50' },
    premium: { icon: 'bg-purple-600', text: 'text-purple-300', glow: 'shadow-purple-900/50' }, // Legacy support
  };

  const tierColor = tierColors[rateLimitInfo.tier as keyof typeof tierColors] || tierColors.free;

  return (
    <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl relative">
      {/* Ambient background glow */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Daily Usage Limit</h3>
            <p className="text-xs text-gray-400 mt-0.5">Monitor your daily quota</p>
          </div>
        </div>
        <button
          onClick={fetchRateLimitInfo}
          disabled={loading}
          className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-300 disabled:opacity-50 border border-gray-700/30 hover:border-gray-600/50"
          title="Refresh usage"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tier Badge */}
      <div className="flex justify-center mb-8 relative z-10">
        <div className={`px-4 py-2 text-xs font-bold rounded-full bg-gradient-to-r ${tierColor.icon} border border-gray-600/50 ${tierColor.text} flex items-center gap-2 shadow-lg ${tierColor.glow}`}>
          <Target className="w-3.5 h-3.5" />
          {rateLimitInfo.tier.toUpperCase()}
        </div>
      </div>

      {/* Circular Progress */}
      <div className="flex flex-col items-center justify-center mb-8 relative z-10">
        <div className="w-56 h-56 flex items-center justify-center">
          {/* SVG Circle */}
          <svg
            className="w-full h-full drop-shadow-lg"
            viewBox="0 0 120 120"
            style={{ transform: 'rotate(-90deg)' }}
          >
            {/* Background circle with gradient */}
            <defs>
              <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(107, 114, 128, 0.3)" />
                <stop offset="100%" stopColor="rgba(75, 85, 99, 0.3)" />
              </linearGradient>
            </defs>
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="url(#bgGradient)"
              strokeWidth="2.5"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={getColor()}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 drop-shadow-lg"
              style={{
                filter: `drop-shadow(0 0 8px ${getColor()})`,
              }}
            />

            {/* Center content - counter-rotate text */}
            <g transform="rotate(90 60 60)">
              <text
                x="60"
                y="55"
                textAnchor="middle"
                className={`text-3xl font-bold transition-colors drop-shadow-lg ${getTextColor()}`}
                style={{ fontSize: '32px', fontWeight: 'bold', fill: getColor() }}
              >
                {rateLimitInfo.current_count}
              </text>
              <text
                x="60"
                y="75"
                textAnchor="middle"
                style={{ fontSize: '12px', fill: 'rgb(156, 163, 175)' }}
              >
                of {rateLimitInfo.limit}
              </text>
            </g>
          </svg>
        </div>

        {/* Percentage text */}
        <p className="text-base text-gray-300 mt-4 font-semibold">
          {Math.round(percentage)}% of limit used
        </p>
      </div>

      {/* Status Cards Row */}
      <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
        {/* Remaining card */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-2 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
           {/* <Zap className="w-4 h-4 text-yellow-400" /> */}
            <span className="text-xs text-gray-400 font-medium">Remaining</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {rateLimitInfo.remaining}
          </div>
          <p className="text-xs text-gray-500 mt-1">prompts left</p>
        </div>

        {/* Reset Time card */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl pt-5 p-1 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400 font-medium">Resets</span>
          </div>
          <div className="text-xs font-bold text-white line-clamp-1">
            {resetDate.toLocaleDateString()}
          </div>
          <p className="text-xs text-gray-500 mt-1">{resetDate.toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Status Message */}
      <div className={`bg-gradient-to-r ${getStatusBgColor()} border rounded-xl p-4 mb-6 backdrop-blur-sm relative z-10`}>
        <div className="flex items-center gap-3">
          {isLimitReached ? (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          ) : percentage >= 75 ? (
            <Flame className="w-5 h-5 text-orange-400 flex-shrink-0" />
          ) : (
            <TrendingUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
          )}
          <div>
            <p className={`text-sm font-semibold ${getStatusTextColor()}`}>
              {getWarningText()}
            </p>
            {isLimitReached && (
              <p className="text-xs text-red-200/70 mt-1">Upgrade your plan or wait until reset</p>
            )}
            {isWarning && !isLimitReached && (
              <p className="text-xs text-yellow-200/70 mt-1">Consider upgrading to continue uninterrupted</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 relative z-10">
        {/* Upgrade CTA - show when at 50% or more */}
        {percentage >= 50 && (
          rateLimitInfo.tier === 'free' ? (
            <button
              onClick={() => (window.location.href = '/pricing')}
              className="w-full px-4 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 border border-blue-400/20 shadow-lg hover:shadow-blue-500/50"
            >
              Upgrade to Pro
            </button>
          ) : rateLimitInfo.tier === 'pro' ? (
            <button
              onClick={() => (window.location.href = '/pricing')}
              className="w-full px-4 py-3 text-sm font-semibold bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 border border-purple-400/20 shadow-lg hover:shadow-purple-500/50"
            >
              Upgrade to Elite
            </button>
          ) : null
        )}

        {/* Refresh Button */}
        <button
          onClick={fetchRateLimitInfo}
          disabled={loading}
          className="w-full px-4 py-3 text-sm font-semibold bg-gray-700/50 hover:bg-gray-600/70 text-gray-200 rounded-xl transition-all duration-300 disabled:opacity-50 border border-gray-600/50 hover:border-gray-500/70"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
}