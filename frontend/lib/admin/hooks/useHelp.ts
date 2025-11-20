// lib/admin/hooks/useHelp.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { helpApi } from '../api/help';

interface UseHelpRequestsOptions {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  priority?: string;
  userId?: string;
  search?: string;
}

// User Hook - Get own requests
export const useUserHelpRequests = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['user-help-requests', page],
    queryFn: () => helpApi.getUserRequests(page, limit),
    staleTime: 5 * 60 * 1000,
  });
};

// User Hook - Submit request
export const useSubmitHelpRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      type: 'help' | 'suggestion' | 'bug' | 'feedback';
      subject: string;
      message: string;
    }) => helpApi.submitRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-help-requests'] });
    },
  });
};

// Admin Hook - Get all requests
export const useHelpRequests = (options: UseHelpRequestsOptions = {}) =>
  useQuery({
    queryKey: ['admin-help-requests', options],
    queryFn: () => helpApi.getRequests(options),
    staleTime: 5 * 60 * 1000,
  });

// Admin Hook - Get single request
export const useHelpRequestById = (requestId: string) =>
  useQuery({
    queryKey: ['admin-help-requests', requestId],
    queryFn: () => helpApi.getRequestById(requestId),
    enabled: !!requestId,
  });

// Admin Hook - Respond to request
export const useRespondToRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: string;
      data: { response: string; status: 'in-progress' | 'resolved' | 'closed' };
    }) => helpApi.respondToRequest(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-help-requests'] });
    },
  });
};

// Admin Hook - Update status
export const useUpdateRequestStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      status,
    }: {
      requestId: string;
      status: string;
    }) => helpApi.updateStatus(requestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-help-requests'] });
    },
  });
};

// Admin Hook - Update priority
export const useUpdateRequestPriority = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      priority,
    }: {
      requestId: string;
      priority: string;
    }) => helpApi.updatePriority(requestId, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-help-requests'] });
    },
  });
};
