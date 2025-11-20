// lib/api/chats.ts

import { Chat, ChatMessage, PaginatedResponse } from './types';
import { apiClient } from './client';

interface GetChatsParams {
  page?: number;
  limit?: number;
  userId?: string;
  search?: string;
}

export const chatApi = {
  getChats: async (params: GetChatsParams) =>
    apiClient.get<PaginatedResponse<Chat>>('/chats', { params }),

  getChatById: async (chatId: string) =>
    apiClient.get<Chat>(`/chats/${chatId}`),

  getChatMessages: async (chatId: string, page = 1, limit = 50) =>
    apiClient.get<PaginatedResponse<ChatMessage>>(`/chats/${chatId}/messages`, {
      params: { page, limit },
    }),

  deleteChat: async (chatId: string) =>
    apiClient.delete(`/chats/${chatId}`),

  archiveChat: async (chatId: string) =>
    apiClient.patch(`/chats/${chatId}`, { archived: true }),
};
