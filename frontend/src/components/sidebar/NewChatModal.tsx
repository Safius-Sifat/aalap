'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { api } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { useChatStore } from '@/stores/chatStore';
import type { Chat, User } from '@/types';

type NewChatModalProps = {
  open: boolean;
  onClose: () => void;
};

export function NewChatModal({ open, onClose }: NewChatModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const upsertChat = useChatStore((state) => state.upsertChat);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [results, setResults] = useState<User[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);

    return () => clearTimeout(timer);
  }, [query, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let mounted = true;

    async function runSearch() {
      if (!debouncedQuery) {
        setResults([]);
        return;
      }

      const { data } = await api.get<User[]>('/users/search', {
        params: { q: debouncedQuery },
      });

      if (mounted) {
        setResults(data);
      }
    }

    void runSearch();

    return () => {
      mounted = false;
    };
  }, [debouncedQuery, open]);

  const emptyLabel = useMemo(() => {
    if (!debouncedQuery) {
      return 'Search by name or phone number';
    }

    if (!results.length) {
      return 'No contacts found';
    }

    return null;
  }, [debouncedQuery, results.length]);

  const startChat = async (targetUserId: string) => {
    setLoadingId(targetUserId);
    try {
      const { data } = await api.post<Chat>('/chats/direct', { targetUserId });
      upsertChat(data);
      setActiveChat(data.id);
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      onClose();
      router.push(`/chat/${data.id}`);
    } finally {
      setLoadingId(null);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#2A3942] bg-[#111B21] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#24343D] px-4 py-3">
          <h3 className="text-sm font-semibold text-white">Start a new chat</h3>
          <button onClick={onClose} className="rounded-md p-1 text-[var(--wa-text-secondary)] hover:bg-[#1F2C33]">
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--wa-text-meta)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search contact"
              className="w-full rounded-lg border border-[#2A3942] bg-[#0D171D] py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-[var(--wa-green)]"
            />
          </div>

          {emptyLabel ? <p className="mt-4 text-sm text-[var(--wa-text-secondary)]">{emptyLabel}</p> : null}

          <div className="mt-3 max-h-80 space-y-1 overflow-y-auto">
            {results.map((user) => (
              <button
                key={user.id}
                onClick={() => void startChat(user.id)}
                disabled={loadingId === user.id}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-[#1F2C33] disabled:opacity-60"
              >
                <Avatar src={user.avatar} name={user.name} size={42} online={!!user.isOnline} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{user.name}</p>
                  <p className="truncate text-xs text-[var(--wa-text-secondary)]">{user.phone}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
