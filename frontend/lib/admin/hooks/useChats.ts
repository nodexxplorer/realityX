// 10. REACT QUERY HOOKS - CHATS (lib/hooks/useChats.ts)
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chats';

export const useChats = (options = {}) =>
  useQuery({
    queryKey: ['chats', options],
    queryFn: () => chatApi.getChats(options),
    staleTime: 5 * 60 * 1000,
  });

export const useChatById = (chatId: string) =>
  useQuery({
    queryKey: ['chats', chatId],
    queryFn: () => chatApi.getChatById(chatId),
    enabled: !!chatId,
  });

export const useChatMessages = (chatId: string, page = 1) =>
  useQuery({
    queryKey: ['chats', chatId, 'messages', page],
    queryFn: () => chatApi.getChatMessages(chatId, page),
    enabled: !!chatId,
  });

export const useDeleteChatMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chatId: string) => chatApi.deleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};
