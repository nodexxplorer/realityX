// components/admin/UserDetail.tsx

'use client';

import { 
  useUserById, 
  useBanUserMutation, 
  usePromoteUserMutation, 
  useDeleteUserMutation 
} from '@/lib/admin/hooks/useUsers';  // ✅ CORRECT ABSOLUTE PATH
import { useToast } from '@/components/admin/common/Toast';  // ✅ CORRECT ABSOLUTE PATH
import { ChartSkeleton } from '@/components/admin/common/LoadingSkeleton';  // ✅ CORRECT ABSOLUTE PATH
import { Shield, Ban, Trash2, ArrowLeft, Mail, Calendar } from 'lucide-react';
import Link from 'next/link';

interface UserDetailProps {
  userId: string;
}

export function UserDetail({ userId }: UserDetailProps) {
  const { data: user, isLoading, error } = useUserById(userId);
  const banMutation = useBanUserMutation();
  const promoteMutation = usePromoteUserMutation();
  const deleteMutation = useDeleteUserMutation();
  const { addToast } = useToast();

  if (isLoading) return <ChartSkeleton />;
  if (error || !user) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
        User not found or error loading user data.
      </div>
    );
  }

  const handleBan = async () => {
    try {
      await banMutation.mutateAsync({ userId });
      addToast('User banned successfully', 'success');
    } catch {
      addToast('Failed to ban user', 'error');
    }
  };

  const handlePromote = async () => {
    try {
      await promoteMutation.mutateAsync(userId);
      addToast('User promoted to admin', 'success');
    } catch {
      addToast('Failed to promote user', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteMutation.mutateAsync(userId);
      addToast('User deleted successfully', 'success');
    } catch {
      addToast('Failed to delete user', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <Link 
        href="/admin/users" 
        className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline"
      >
        <ArrowLeft size={20} />
        <span>Back to Users</span>
      </Link>

      <h1 className="text-3xl font-bold">User Profile: {user.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="md:col-span-2 p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">
            Account Details
          </h2>

          <div className="space-y-4">
            {/* Avatar and Name */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-lg">{user.name}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{user.role}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 pt-4 border-t dark:border-gray-700">
              <div className="flex items-center space-x-3 text-sm">
                <Mail size={16} className="text-gray-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Calendar size={16} className="text-gray-400" />
                <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <span className="text-gray-400">Last Active:</span>
                <span>{new Date(user.lastActive).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Status Info */}
            <div className="pt-4 border-t dark:border-gray-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Premium Status</span>
                <span className={`text-sm font-semibold ${user.is_premium ? 'text-green-600' : 'text-gray-600'}`}>
                  {user.is_premium ? 'Active' : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Account Status</span>
                <span className={`text-sm font-semibold ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions Card */}
        <div className="p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-fit">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">
            Administrative Actions
          </h2>

          <div className="space-y-3">
            {/* Promote Button */}
            <button
              onClick={handlePromote}
              disabled={promoteMutation.isPending}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Shield size={18} />
              <span>{promoteMutation.isPending ? 'Promoting...' : 'Promote to Admin'}</span>
            </button>

            {/* Ban Button */}
            <button
              onClick={handleBan}
              disabled={banMutation.isPending}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Ban size={18} />
              <span>{banMutation.isPending ? 'Banning...' : 'Ban User'}</span>
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Trash2 size={18} />
              <span>{deleteMutation.isPending ? 'Deleting...' : 'Delete User'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
