'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Chat } from '@/types';

export function useChats(enabled = true) {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const { data } = await api.get<Chat[]>('/chats');
      return data;
    },
    enabled,
  });
}
