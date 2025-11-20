// components/admin/Topbar.tsx

'use client';

import { Menu, Bell, Sun, Moon, LogOut, AlertCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { signOut, useSession } from 'next-auth/react';

interface TopbarProps {
  onMenuClick: () => void;
}

interface HelpRequest {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  isNew: boolean;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  const user = session?.user;

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch help requests
  useEffect(() => {
    const fetchHelpRequests = async () => {
      try {
        const response = await fetch('/api/help-requests/unread');
        if (response.ok) {
          const data = await response.json();
          setHelpRequests(data);
        }
      } catch (error) {
        console.error('Failed to fetch help requests:', error);
      }
    };

    fetchHelpRequests();

    // Poll for new requests every 30 seconds
    const interval = setInterval(fetchHelpRequests, 30000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = helpRequests.filter(req => req.isNew).length;
  const highPriorityCount = helpRequests.filter(req => req.priority === 'high').length;

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/help-requests/${id}/read`, { method: 'POST' });
      setHelpRequests(prev => prev.map(req => 
        req.id === id ? { ...req, isNew: false } : req
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  return (
    <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      {/* Left */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
      >
        <Menu size={24} />
      </button>

      {/* Right */}
      <div className="flex items-center space-x-4 ml-auto">
        {/* Search */}
        <div className="hidden sm:block relative">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-lg">Help Requests</h3>
                {highPriorityCount > 0 && (
                  <span className="flex items-center space-x-1 text-red-600 text-sm">
                    <AlertCircle size={16} />
                    <span>{highPriorityCount} High Priority</span>
                  </span>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {helpRequests.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Bell size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No help requests</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {helpRequests.map((request) => (
                      <div
                        key={request.id}
                        onClick={() => markAsRead(request.id)}
                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                          request.isNew ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-sm flex-1">{request.title}</h4>
                          {request.isNew && (
                            <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`px-2 py-1 rounded-full font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority.toUpperCase()}
                          </span>
                          <span className="text-gray-500 flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{formatTimeAgo(request.timestamp)}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {helpRequests.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <button 
                    onClick={() => {
                      setShowNotifications(false);
                      window.location.href = '/admin/help-requests';
                    }}
                    className="w-full text-center text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                  >
                    View All Help Requests
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => {
            if (setTheme) {
              setTheme(theme === 'dark' ? 'light' : 'dark');
            }
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          aria-label="Toggle theme"
        >
          {mounted && theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="font-semibold">{user?.name || 'Admin User'}</p>
                <p className="text-sm text-gray-500">{user?.email || 'admin@example.com'}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}