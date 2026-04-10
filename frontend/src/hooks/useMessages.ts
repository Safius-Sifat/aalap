'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Message } from '@/types';

type MessageResponse = {
  messages: Message[];
  hasMore: boolean;
  nextCursor: string | null;
};

export function useMessages(chatId?: string) {
  const query = useInfiniteQuery({
    queryKey: ['messages', chatId],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<MessageResponse>(`/messages/${chatId}`, {
        params: {
          cursor: pageParam ?? undefined,
          limit: 30,
        },
      });
      return data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!chatId,
  });

  const pages = query.data?.pages ?? [];
  const messages = pages
    .slice()
    .reverse()
    .flatMap((page) => page.messages);

  return {
    ...query,
    messages,
    hasMore: query.hasNextPage,
  };
}
