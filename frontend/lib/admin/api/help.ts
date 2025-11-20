// lib/admin/api/help.ts

import { HelpRequest, HelpRequestPaginated } from './types';
import { apiClient } from './client';

interface GetHelpRequestsParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  priority?: string;
  userId?: string;
  search?: string;
}

export const helpApi = {
  // Submit help/suggestion from user
  submitRequest: async (data: {
    type: 'help' | 'suggestion' | 'bug' | 'feedback';
    subject: string;
    message: string;
  }) =>
    apiClient.post<HelpRequest>('/help-requests', data),

  // Admin: Get all requests
  getRequests: async (params: GetHelpRequestsParams) =>
    apiClient.get<HelpRequestPaginated>('/help-requests', { params }),

  // Admin: Get single request
  getRequestById: async (requestId: string) =>
    apiClient.get<HelpRequest>(`/help-requests/${requestId}`),

  // Admin: Respond to request
  respondToRequest: async (requestId: string, data: {
    response: string;
    status: 'in-progress' | 'resolved' | 'closed';
  }) =>
    apiClient.put(`/help-requests/${requestId}`, data),

  // Admin: Update status
  updateStatus: async (requestId: string, status: string) =>
    apiClient.patch(`/help-requests/${requestId}`, { status }),

  // Admin: Update priority
  updatePriority: async (requestId: string, priority: string) =>
    apiClient.patch(`/help-requests/${requestId}`, { priority }),

  // Get user's own requests (this might need a different endpoint)
  getUserRequests: async (page = 1, limit = 10) =>
    apiClient.get<HelpRequestPaginated>('/help-requests', {
      params: { page, limit },
    }),
};
