'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { useChatStore } from '@/stores/chatStore';
import type { Chat, User } from '@/types';

type UserSearchResultsProps = {
  query: string;
};

export function UserSearchResults({ query }: UserSearchResultsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const upsertChat = useChatStore((state) => state.upsertChat);

  const [results, setResults] = useState<User[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function runSearch() {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      const { data } = await api.get<User[]>('/users/search', {
        params: { q: query.trim() },
      });

      if (mounted) {
        setResults(data);
      }
    }

    void runSearch();

    return () => {
      mounted = false;
    };
  }, [query]);

  const startChat = async (targetUserId: string) => {
    setLoadingId(targetUserId);
    try {
      const { data } = await api.post<Chat>('/chats/direct', { targetUserId });
      upsertChat(data);
      setActiveChat(data.id);
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      router.push(`/chat/${data.id}`);
    } finally {
      setLoadingId(null);
    }
  };

  if (!results.length) {
    return <div className="p-4 text-sm text-[var(--wa-text-secondary)]">No contacts found</div>;
  }

  return (
    <div className="divide-y divide-[#1F2C33]">
      {results.map((user) => (
        <button
          key={user.id}
          onClick={() => void startChat(user.id)}
          disabled={loadingId === user.id}
          className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-[#1F2C33] disabled:opacity-60"
        >
          <Avatar src={user.avatar} name={user.name} size={46} online={!!user.isOnline} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate text-xs text-[var(--wa-text-secondary)]">{user.phone}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
