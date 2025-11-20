// 6. ANALYTICS ENDPOINTS (lib/api/analytics.ts)

import { AnalyticsData } from './types';
import { apiClient } from './client';

interface GetAnalyticsParams {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}

export const analyticsApi = {
  getAnalytics: async (params: GetAnalyticsParams = {}) =>
    apiClient.get<AnalyticsData[]>('/analytics', { params }),

  getSystemHealth: async () =>
    apiClient.get('/analytics/health'),

  getModelUsage: async () =>
    apiClient.get('/analytics/models'),
};
