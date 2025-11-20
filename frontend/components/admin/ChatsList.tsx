// components/admin/ChatsList.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useChats, useDeleteChatMutation } from '@/lib/admin/hooks/useChats';
import { useToast } from '@/components/admin/common/Toast';
import { TableSkeleton } from '@/components/admin/common/LoadingSkeleton';
import { Trash2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';


export function ChatsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useChats({
    page,
    limit: 10,
    search: search || undefined,
  });

  const deleteMutation = useDeleteChatMutation();
  const { addToast } = useToast();

  const handleDeleteChat = async (chatId: string) => {
    if (!confirm('Are you sure you want to delete this chat?')) return;
    try {
      await deleteMutation.mutateAsync(chatId);
      addToast('Chat deleted successfully', 'success');
    } catch (error) {
      addToast('Failed to delete chat', 'error');
    }
  };

  if (isLoading) return <TableSkeleton rows={10} />;
  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
        Error loading chats. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Chat Threads</h1>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search chats by title or user..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Messages</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data?.data && data.data.length > 0 ? (
              data.data.map((chat) => (
                <motion.tr
                  key={chat.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link 
                      href={`/admin/chats/${chat.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium block"
                    >
                      {chat.title || 'Untitled Chat'}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link 
                      href={`/admin/chats/${chat.id}`}
                      className="block hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {chat.user || 'Unknown User'}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link 
                      href={`/admin/chats/${chat.id}`}
                      className="block hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {new Date(chat.date).toLocaleDateString()}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link 
                      href={`/admin/chats/${chat.id}`}
                      className="block"
                    >
                      <span className="inline-flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                        <MessageSquare size={14} />
                        <span>{chat.messagesCount}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link 
                      href={`/admin/chats/${chat.id}`}
                      className="block hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {chat.model}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }}
                      disabled={deleteMutation.isPending}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No chats found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500">
          Page {page} of {Math.ceil((data?.total || 0) / 10)}
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data?.hasMore}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
