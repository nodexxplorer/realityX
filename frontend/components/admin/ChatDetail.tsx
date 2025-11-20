// components/admin/ChatDetail.tsx


'use client';

import { useChatById, useChatMessages } from '@/lib/admin/hooks/useChats';
import { ChartSkeleton } from '@/components/admin/common/LoadingSkeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface ChatDetailProps {
  chatId: string;
}

export function ChatDetail({ chatId }: ChatDetailProps) {
  const [messagesPage, setMessagesPage] = useState(1);
  const { data: chat, isLoading: chatLoading, error: chatError } = useChatById(chatId);
  const { data: messagesData, isLoading: messagesLoading } = useChatMessages(chatId, messagesPage);

  if (chatLoading) return <ChartSkeleton />;
  
  if (chatError || !chat) {
    return (
      <div className="space-y-6">
        <Link 
          href="/admin/chats"
          className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ArrowLeft size={20} />
          <span>Back to Chats</span>
        </Link>
        <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
          Chat not found or error loading chat.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link 
        href="/admin/chats"
        className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline w-fit"
      >
        <ArrowLeft size={20} />
        <span>Back to Chats</span>
      </Link>

      <h1 className="text-3xl font-bold">Chat: {chat.title}</h1>

      {/* Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">User</p>
          <p className="font-semibold">{chat.user}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Model</p>
          <p className="font-semibold">{chat.model}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
          <p className="font-semibold">{new Date(chat.date).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Messages</p>
          <p className="font-semibold">{chat.messagesCount}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Conversation</h2>

        <div className="h-96 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          {messagesLoading ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading messages...</p>
          ) : !messagesData?.data || messagesData.data.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No messages found</p>
          ) : (
            messagesData.data.map((msg, idx) => (
              <motion.div
                key={`${msg.id}-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex ${msg.sender === 'user' || msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === 'user' || msg.sender === 'User'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none'
                  }`}
                >
                  <p className="text-xs font-semibold opacity-75 mb-1">
                    {msg.sender === 'user' || msg.sender === 'User' ? 'User' : 'AI'}
                  </p>
                  {msg.sender === 'user' || msg.sender === 'User' ? (
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="text-sm">
                      <MarkdownRenderer content={msg.text} />
                    </div>
                  )}
                  <p className="text-xs opacity-50 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {messagesData && (
          <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {messagesPage} of {Math.ceil((messagesData?.total || 0) / 50)}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setMessagesPage((p) => Math.max(1, p - 1))}
                disabled={messagesPage === 1}
                className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setMessagesPage((p) => p + 1)}
                disabled={!messagesData?.hasMore}
                className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
