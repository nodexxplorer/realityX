// components/admin/UsersList.tsx

'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useUsers, useBanUserMutation, usePromoteUserMutation, useDeleteUserMutation } from '@/lib/admin/hooks/useUsers';
import { useToast } from '@/components/admin/common/Toast';
import { TableSkeleton } from '@/components/admin/common/LoadingSkeleton';
import { Ban, Shield, Trash2, ChevronRight, CheckCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';

export function UsersList() {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useUsers({
    page,
    limit: 10,
    role: roleFilter === 'All' ? undefined : roleFilter,
    status: statusFilter === 'All' ? undefined : statusFilter,
    search: debouncedSearch || undefined,
  });

  const banMutation = useBanUserMutation();
  const promoteMutation = usePromoteUserMutation();
  const deleteMutation = useDeleteUserMutation();
  const { addToast } = useToast();

  const handleBanUser = async (userId: string) => {
    try {
      await banMutation.mutateAsync({ userId });
      addToast('User banned successfully', 'success');
    } catch (error) {
      addToast('Failed to ban user', 'error');
    }
  };

  const handlePromoteUser = async (userId: string) => {
    try {
      await promoteMutation.mutateAsync(userId);
      addToast('User promoted to admin', 'success');
    } catch (error) {
      addToast('Failed to promote user', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteMutation.mutateAsync(userId);
      addToast('User deleted successfully', 'success');
    } catch (error) {
      addToast('Failed to delete user', 'error');
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'banned':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'deleted':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (isLoading) return <TableSkeleton rows={10} />;
  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg">
        Error loading users. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="User">User</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premium</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data?.data && data.data.length > 0 ? (
              data.data.map((user) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td className="px-5 py-4">
                    <Link href={`/admin/users/${user.id}`}
                     className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      {user.name}
                  </Link>
                </td>
                <td className="px-3 py-4 text-sm">{user.email}</td>
                <td className="px-3 py-4 text-sm font-medium">{user.role}</td>
                <td className="px-3 py-4">
                  {user.is_premium ? (
                    <CheckCircle size={18} className="text-green-500" />
                  ) : (
                    <X size={18} className="text-gray-400" />
                  )}
                </td>
                <td className="px-3 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-3 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePromoteUser(user.id)}
                      disabled={promoteMutation.isPending}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                      title="Promote"
                    >
                      <Shield size={16} />
                    </button>
                    <button
                      onClick={() => handleBanUser(user.id)}
                      disabled={banMutation.isPending}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                      title="Ban"
                    >
                      <Ban size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deleteMutation.isPending}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Page {page} of {Math.ceil((data?.total || 0) / 10)}
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data?.hasMore}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}






