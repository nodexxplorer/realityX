// components/admin/AnalyticsPage.tsx

'use client';

import { useAnalytics } from '@/lib/admin/hooks/useAnalytics';
import { useTheme } from 'next-themes';
import { ChartSkeleton } from '@/components/admin/common/LoadingSkeleton';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function AnalyticsPage() {
  const { theme } = useTheme();
  const { data, isLoading, error } = useAnalytics({ groupBy: 'day' });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">System Analytics</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">System Analytics</h1>
        <div className="p-6 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
          Failed to load analytics data. Please try again later.
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">System Analytics</h1>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center space-y-4">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No analytics data available yet.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Analytics data will appear here once users start creating chats. The system tracks usage, tokens, errors, and user growth over time.
            </p>
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400 mt-2">
                Error: {typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : 'Unknown error'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const chartTheme = {
    text: theme === 'dark' ? '#d1d5db' : '#374151',
    grid: theme === 'dark' ? '#4b5563' : '#e5e7eb',
    tooltipBg: theme === 'dark' ? '#374151' : '#ffffff',
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div
          className="p-3 rounded-lg shadow-xl text-sm"
          style={{ backgroundColor: chartTheme.tooltipBg, color: chartTheme.text }}
        >
          <p className="font-bold">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }}>
              {`${p.name}: ${p.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-96">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Usage */}
        <ChartCard title="Daily Usage (Chat Count)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="date" stroke={chartTheme.text} />
              <YAxis stroke={chartTheme.text} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="usage"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorUsage)"
                name="Daily Chats"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Token Consumption */}
        <ChartCard title="Token Consumption">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="date" stroke={chartTheme.text} />
              <YAxis stroke={chartTheme.text} tickFormatter={(value: number) => `${value / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="tokens" fill="#059669" name="Total Tokens" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Error Rate */}
        <ChartCard title="Error Rate per Day">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="date" stroke={chartTheme.text} />
              <YAxis stroke={chartTheme.text} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="errors" stroke="#ef4444" name="Errors" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* User Growth */}
        <ChartCard title="User Growth Over Time">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="date" stroke={chartTheme.text} />
              <YAxis stroke={chartTheme.text} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#a855f7" name="Total Users" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}