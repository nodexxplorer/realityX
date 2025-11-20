// components/admin/common/LoadingSkeleton.tsx

'use client';

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4 p-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded flex-1"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded flex-1"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
      </div>
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
);
