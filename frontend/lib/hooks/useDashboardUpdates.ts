// frontend/lib/hooks/useDashboardUpdates.ts

import { useEffect, useState } from 'react';
import type { DashboardStats } from '@/lib/api/dashboard';

export function useDashboardUpdates(initialStats: DashboardStats) {
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/dashboard`);

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setStats(prev => ({ ...prev, ...update }));
    };

    return () => ws.close();
  }, []);

  return stats;
}