// components/WeeklyActivityChart.tsx

'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getWeeklyActivity, type WeeklyActivity } from '@/lib/api/dashboard';

export function WeeklyActivityChart() {
  const [data, setData] = useState<WeeklyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalChats, setTotalChats] = useState(0);

  useEffect(() => {
    loadWeeklyActivity();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadWeeklyActivity();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadWeeklyActivity = async () => {
    try {
      setLoading(true);
      setError(null);
      const activity = await getWeeklyActivity();
      setData(activity);
      
      // Calculate total conversations this week
      const total = activity.reduce((sum, day) => sum + day.conversations, 0);
      setTotalChats(total);
    } catch (err) {
      console.error('Failed to load weekly activity:', err);
      setError('Failed to load weekly activity');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 mb-8">
        <div className="h-80 bg-gray-700/50 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <section className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Weekly Activity</h3>
          <p className="text-gray-400 text-sm">Your chat usage this week</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{totalChats}</p>
          <p className="text-gray-400 text-sm">chats this week</p>
        </div>
      </div>

      {error ? (
        <div className="text-red-400 text-center py-8">{error}</div>
      ) : data.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No activity data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              }}
            />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#F3F4F6' }}
              formatter={(value) => [value, '']}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
            />
            <Bar
              dataKey="conversations"
              fill="#A78BFA"
              name="Conversations"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="messages"
              fill="#60A5FA"
              name="Messages"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}