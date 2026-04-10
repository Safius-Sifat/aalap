'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Search, Users, X } from 'lucide-react';
import { api } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { useChatStore } from '@/stores/chatStore';
import type { Chat, User } from '@/types';

type NewGroupModalProps = {
  open: boolean;
  onClose: () => void;
};

export function NewGroupModal({ open, onClose }: NewGroupModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const upsertChat = useChatStore((state) => state.upsertChat);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [results, setResults] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const { data } = await api.get<User[]>('/users/search', {
        params: { q: debouncedQuery || 'a' },
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

  const canSubmit = useMemo(() => name.trim().length >= 2 && selectedIds.length > 0, [name, selectedIds]);

  const toggleMember = (userId: string) => {
    setSelectedIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );
  };

  const createGroup = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post<Chat>('/chats/group', {
        name: name.trim(),
        memberIds: selectedIds,
      });

      upsertChat(data);
      setActiveChat(data.id);
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      onClose();
      router.push(`/chat/${data.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-[#2A3942] bg-[#111B21] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#24343D] px-4 py-3">
          <h3 className="text-sm font-semibold text-white">Create a group</h3>
          <button onClick={onClose} className="rounded-md p-1 text-[var(--wa-text-secondary)] hover:bg-[#1F2C33]">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 p-4">
          <label className="block text-xs text-[var(--wa-text-secondary)]">
            Group name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Weekend Plan"
              className="mt-1 w-full rounded-lg border border-[#2A3942] bg-[#0D171D] px-3 py-2 text-sm text-white outline-none focus:border-[var(--wa-green)]"
            />
          </label>

          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--wa-text-meta)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find people"
              className="w-full rounded-lg border border-[#2A3942] bg-[#0D171D] py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-[var(--wa-green)]"
            />
          </div>

          <div className="max-h-64 space-y-1 overflow-y-auto">
            {results.map((user) => {
              const checked = selectedIds.includes(user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => toggleMember(user.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left ${
                    checked ? 'bg-[#1F2C33]' : 'hover:bg-[#1A262D]'
                  }`}
                >
                  <Avatar src={user.avatar} name={user.name} size={38} online={!!user.isOnline} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{user.name}</p>
                    <p className="truncate text-xs text-[var(--wa-text-secondary)]">{user.phone}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                      checked ? 'bg-[var(--wa-green)] text-[#0B141A]' : 'bg-[#2A3942] text-[var(--wa-text-secondary)]'
                    }`}
                  >
                    {checked ? 'Added' : 'Add'}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-[#24343D] pt-3">
            <p className="flex items-center gap-2 text-xs text-[var(--wa-text-secondary)]">
              <Users size={14} /> {selectedIds.length} selected
            </p>
            <button
              onClick={() => void createGroup()}
              disabled={!canSubmit || isSubmitting}
              className="rounded-lg bg-[var(--wa-green)] px-4 py-2 text-sm font-semibold text-[#0B141A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create group'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
