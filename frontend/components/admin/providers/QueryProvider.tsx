// components/providers/QueryProvider.tsx

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Optional: React Query DevTools for debugging */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}



// // components/admin/providers/QueryProvider.tsx)

// 'use client';

// import React from 'react';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       retry: 1,
//       retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
//     },
//   },
// });

// export function QueryProvider({ children }: { children: React.ReactNode }) {
//   return (
//     <QueryClientProvider client={queryClient}>
//       {children}
//     </QueryClientProvider>
//   );
// }
