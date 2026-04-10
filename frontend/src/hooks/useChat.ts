'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Chat } from '@/types';

export function useChat(chatId?: string, enabled = true) {
  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      const { data } = await api.get<Chat>(`/chats/${chatId}`);
      return data;
    },
    enabled: !!chatId && enabled,
  });
}
