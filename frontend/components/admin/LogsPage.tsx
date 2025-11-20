// components/admin/LogsPage.tsx

'use client';

import { useState } from 'react';
import { useLogs } from '@/lib/admin/hooks/useLogs';
import { useToast } from '@/components/admin/common/Toast';
import { TableSkeleton } from '@/components/admin/common/LoadingSkeleton';
import { motion } from 'framer-motion';
import { Download, Filter, X } from 'lucide-react';

export function LogsPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { addToast } = useToast();

  const { data, isLoading, error } = useLogs({
    page,
    limit: 20,
    type: typeFilter === 'All' ? undefined : typeFilter,
    search: search || undefined,
  });

  const getTypeClass = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full text-xs font-bold';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full text-xs font-bold';
      case 'admin':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full text-xs font-bold';
      case 'info':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full text-xs font-bold';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 px-3 py-1 rounded-full text-xs font-bold';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error':
        return '🔴';
      case 'warning':
        return '🟡';
      case 'admin':
        return '🔵';
      case 'info':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      // Build query params
      const params = new URLSearchParams({
        type: typeFilter === 'All' ? '' : typeFilter,
        search: search || '',
      });

      const response = await fetch(`/api/admin/logs/export?format=${format}&${params.toString()}`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addToast(`Logs exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      addToast(`Failed to export logs as ${format}`, 'error');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('All');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const isFiltered = search || typeFilter !== 'All' || dateFrom || dateTo;

  if (isLoading) return <TableSkeleton rows={20} />;

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">System & Admin Activity Logs</h1>
        <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
          Error loading logs. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">System & Admin Activity Logs</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            title="Export as CSV"
          >
            <Download size={18} />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title="Export as JSON"
          >
            <Download size={18} />
            <span className="hidden sm:inline">JSON</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search log messages..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="All">All Types</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="admin">Admin Action</option>
            <option value="info">Info</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Reset Button */}
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg transition-colors text-sm h-fit mt-auto"
            >
              <X size={16} />
              Reset
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {isFiltered && (
          <div className="flex flex-wrap gap-2 pt-2">
            {search && (
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                Search: {search}
                <button onClick={() => setSearch('')} className="hover:font-bold">
                  ×
                </button>
              </span>
            )}
            {typeFilter !== 'All' && (
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                Type: {typeFilter}
                <button onClick={() => setTypeFilter('All')} className="hover:font-bold">
                  ×
                </button>
              </span>
            )}
            {dateFrom && (
              <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                From: {dateFrom}
                <button onClick={() => setDateFrom('')} className="hover:font-bold">
                  ×
                </button>
              </span>
            )}
            {dateTo && (
              <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                To: {dateTo}
                <button onClick={() => setDateTo('')} className="hover:font-bold">
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {data?.data.length || 0} logs out of {data?.total || 0} total
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User ID
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {!data || data.data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  <div className="space-y-2">
                    <p className="font-medium">No logs found.</p>
                    {data?.message ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500">{data.message}</p>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Try adjusting your filters or check if the logs table exists in the database.
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              data?.data.map((log, idx) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-mono text-gray-700 dark:text-gray-300">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={getTypeClass(log.type)}>
                      {getTypeIcon(log.type)} {log.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-md">
                    <div className="line-clamp-2 hover:line-clamp-none cursor-help" title={log.message}>
                      {log.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {log.userId ? (
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        {log.userId.substring(0, 8)}...
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Page <span className="font-semibold">{page}</span> of{' '}
          <span className="font-semibold">{Math.ceil((data?.total || 0) / 20)}</span>
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            Previous
          </button>

          {/* Page numbers */}
          <div className="flex gap-1">
            {Array.from({
              length: Math.min(5, Math.ceil((data?.total || 0) / 20)),
            }).map((_, i) => {
              const pageNum = Math.max(1, page - 2) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data?.hasMore}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            Next
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">TOTAL LOGS</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{data?.total || 0}</p>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">ERRORS</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {data?.data.filter((l) => l.type === 'error').length || 0}
          </p>
        </div>
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">WARNINGS</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
            {data?.data.filter((l) => l.type === 'warning').length || 0}
          </p>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">ADMIN ACTIONS</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {data?.data.filter((l) => l.type === 'admin').length || 0}
          </p>
        </div>
      </div>
    </div>
  );
}