// 12. REACT QUERY HOOKS - LOGS (lib/hooks/useLogs.ts)
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import { logApi } from '../api/logs';

export const useLogs = (options = {}) =>
  useQuery({
    queryKey: ['logs', options],
    queryFn: () => logApi.getLogs(options),
    staleTime: 5 * 60 * 1000,
  });
