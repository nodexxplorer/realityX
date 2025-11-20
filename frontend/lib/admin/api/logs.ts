// 7. LOGS ENDPOINTS (lib/api/logs.ts)

import { Log, PaginatedResponse } from './types';
import { apiClient } from './client';

interface GetLogsParams {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
}

export const logApi = {
  getLogs: async (params: GetLogsParams) =>
    apiClient.get<PaginatedResponse<Log>>('/logs', { params }),

  getAdminLogs: async (params: GetLogsParams) =>
    apiClient.get<PaginatedResponse<Log>>('/logs/admin', { params }),
};
