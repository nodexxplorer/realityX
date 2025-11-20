// app/dashboard/help/page.tsx

'use client';

import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { useUserHelpRequests, useSubmitHelpRequest } from '@/lib/admin/hooks/useHelp';
import { useToast } from '@/components/admin/common/Toast';
import { TableSkeleton } from '@/components/admin/common/LoadingSkeleton';

export default function HelpPage() {
  const [formData, setFormData] = useState({
    type: 'help' as 'help' | 'suggestion' | 'bug' | 'feedback',
    subject: '',
    message: '',
  });

  const { data: requests, isLoading } = useUserHelpRequests(1, 10);
  const submitMutation = useSubmitHelpRequest();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.message.trim()) {
      addToast('Please fill in all fields', 'warning');
      return;
    }

    try {
      await submitMutation.mutateAsync(formData);
      addToast('Thank you! Your submission has been received', 'success');
      setFormData({ type: 'help', subject: '', message: '' });
    } catch (error) {
      addToast('Failed to submit. Please try again', 'error');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'help':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'suggestion':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'bug':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'feedback':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock size={16} className="text-yellow-500" />;
      case 'in-progress':
        return <MessageSquare size={16} className="text-blue-500" />;
      case 'resolved':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'closed':
        return <AlertCircle size={16} className="text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Help & Suggestions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Have a question or suggestion? We'd love to hear from you!
          </p>
        </div>

        {/* Submit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Send us a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as 'help' | 'suggestion' | 'bug' | 'feedback',
                  })
                }
                className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="help">Help Request</option>
                <option value="suggestion">Suggestion</option>
                <option value="bug">Bug Report</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="Briefly describe your message"
                className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Tell us more details..."
                rows={5}
                className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              <Send size={18} />
              {submitMutation.isPending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Your Submissions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Submissions
          </h2>

          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : !requests?.data || requests.data.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
              <p>No submissions yet. Send your first message above!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests.data.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                        {request.subject}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(request.type)}`}>
                          {request.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                            {request.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}