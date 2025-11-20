// lib/admin/hooks/useAnalytics.ts

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics';

export const useAnalytics = (options = {}) =>
  useQuery({
    queryKey: ['analytics', options],
    queryFn: () => analyticsApi.getAnalytics(options),
    staleTime: 10 * 60 * 1000,
  });

export const useSystemHealth = () =>
  useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => analyticsApi.getSystemHealth(),
    refetchInterval: 30 * 1000,
  });
