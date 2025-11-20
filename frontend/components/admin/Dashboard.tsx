// components/admin/Dashboard.tsx - FIXED FOR REACT QUERY

'use client';

import Link from 'next/link';
import { Users, MessageSquare, Clock, Zap, AlertCircle } from 'lucide-react';
import { useSystemHealth } from '@/lib/admin/hooks/useAnalytics';
import { useUsers } from '@/lib/admin/hooks/useUsers';
import { useChats } from '@/lib/admin/hooks/useChats';

export function Dashboard() {
  const { 
    data: health, 
    isLoading: healthLoading, 
    error: healthError,
    isError: isHealthError 
  } = useSystemHealth();
  
  const { 
    data: usersData, 
    isLoading: usersLoading, 
    error: usersError,
    isError: isUsersError 
  } = useUsers({ limit: 5 });
  
  const { 
    data: chatsData, 
    isLoading: chatsLoading, 
    error: chatsError,
    isError: isChatsError 
  } = useChats({ limit: 5 });

  // Debug logging
  console.log('🔍 Dashboard Debug:', {
    health,
    healthLoading,
    healthError: healthError?.message,
    isHealthError,
    usersData,
    usersLoading,
    usersError: usersError?.message,
    isUsersError,
    chatsData,
    chatsLoading,
    chatsError: chatsError?.message,
    isChatsError
  });

  const stats = [
    { 
      label: 'Active Users', 
      value: usersData?.total || 0, 
      icon: Users, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10',
      loading: usersLoading,
      error: isUsersError
    },
    { 
      label: 'Total Chats', 
      value: chatsData?.total || 0, 
      icon: MessageSquare, 
      color: 'text-green-500', 
      bg: 'bg-green-500/10',
      loading: chatsLoading,
      error: isChatsError
    },
    { 
      label: 'Uptime', 
      value: health?.uptime || '99.9%', 
      icon: Clock, 
      color: 'text-purple-500', 
      bg: 'bg-purple-500/10',
      loading: healthLoading,
      error: isHealthError
    },
    { 
      label: 'Avg. Temp.', 
      value: health?.avgTemp || '0.65', 
      icon: Zap, 
      color: 'text-yellow-500', 
      bg: 'bg-yellow-500/10',
      loading: healthLoading,
      error: isHealthError
    },
  ];

  // Show critical error state
  const hasCriticalError = isHealthError && isUsersError && isChatsError;
  
  if (hasCriticalError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                Unable to Load Dashboard
              </h3>
              <div className="space-y-2 text-sm text-red-700 dark:text-red-400">
                <p>The admin dashboard could not load data. This might be due to:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>API endpoints not configured</li>
                  <li>Database connection issues</li>
                  <li>Authentication problems</li>
                </ul>
                {healthError && <p className="mt-2">• Health: {healthError.message}</p>}
                {usersError && <p>• Users: {usersError.message}</p>}
                {chatsError && <p>• Chats: {chatsError.message}</p>}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        {(isHealthError || isUsersError || isChatsError) && (
          <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
            <AlertCircle className="w-4 h-4" />
            <span>Some data failed to load</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className={`p-3 rounded-full w-fit ${stat.bg}`}>
                <Icon size={24} className={stat.color} />
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                {stat.loading ? (
                  <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
                ) : stat.error ? (
                  <p className="text-sm text-red-500 mt-1">Failed to load</p>
                ) : (
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Chats */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Recent Chats</h2>
          {chatsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse">
                  <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : isChatsError ? (
            <div className="text-center py-8 text-red-500">
              <AlertCircle className="mx-auto mb-2 w-12 h-12" />
              <p>Failed to load chats</p>
              <p className="text-sm mt-1">{chatsError?.message}</p>
            </div>
          ) : chatsData?.data && chatsData.data.length > 0 ? (
            <>
              <div className="space-y-3">
                {chatsData.data.slice(0, 3).map((chat: any) => (
                  <Link key={chat.id} href={`/admin/chats/${chat.id}`}>
                    <div className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                      <p className="font-medium">{chat.title || 'Untitled Chat'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {chat.user || 'Unknown'} • {chat.messagesCount || 0} messages
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link 
                href="/admin/chats"
                className="mt-4 inline-block text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All Chats →
              </Link>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare className="mx-auto mb-2 w-12 h-12 opacity-50" />
              <p>No chats yet</p>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">API Server</span>
              {healthLoading ? (
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : isHealthError ? (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded">
                  Error
                </span>
              ) : (
                <span className={`px-2 py-1 text-xs rounded ${
                  health?.apiStatus === 'online' || !health
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {health?.apiStatus || 'Online'}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Database</span>
              {healthLoading ? (
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : isHealthError ? (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded">
                  Error
                </span>
              ) : (
                <span className={`px-2 py-1 text-xs rounded ${
                  health?.dbStatus === 'connected' || !health
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {health?.dbStatus || 'Connected'}
                </span>
              )}
            </div>
            {isHealthError && (
              <div className="text-xs text-red-500 mt-2">
                {healthError?.message}
              </div>
            )}
            <Link
              href="/admin/settings"
              className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-center block"
            >
              Go to Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}