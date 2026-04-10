'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Search, UserMinus, UserPlus, X } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/ui/Avatar';
import type { User } from '@/types';

type GroupInfoDrawerProps = {
  chatId: string;
  open: boolean;
  onClose: () => void;
};

export function GroupInfoDrawer({ chatId, open, onClose }: GroupInfoDrawerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const { data: chat, isLoading } = useChat(chatId, open);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isSavingMeta, setIsSavingMeta] = useState(false);

  useEffect(() => {
    if (!chat) {
      return;
    }

    setName(chat.name ?? '');
    setDescription(chat.description ?? '');
  }, [chat]);

  useEffect(() => {
    if (!open || !search.trim()) {
      setResults([]);
      return;
    }

    let mounted = true;
    const timer = setTimeout(async () => {
      const { data } = await api.get<User[]>('/users/search', {
        params: { q: search.trim() },
      });

      if (mounted) {
        setResults(data);
      }
    }, 250);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [open, search]);

  const myMember = chat?.members.find((member) => member.userId === currentUser?.id);
  const isAdmin = myMember?.role === 'ADMIN';

  const refreshGroupData = async () => {
    await queryClient.invalidateQueries({ queryKey: ['chats'] });
    await queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
  };

  const saveGroupDetails = async () => {
    if (!isAdmin) {
      return;
    }

    setIsSavingMeta(true);
    try {
      await api.patch(`/chats/${chatId}`, {
        name: name.trim(),
        description: description.trim(),
      });
      await refreshGroupData();
    } finally {
      setIsSavingMeta(false);
    }
  };

  const addMember = async (userId: string) => {
    await api.post(`/chats/${chatId}/members`, { userId });
    await refreshGroupData();
  };

  const removeMember = async (userId: string) => {
    await api.delete(`/chats/${chatId}/members/${userId}`);
    await refreshGroupData();
  };

  const leaveGroup = async () => {
    await api.delete(`/chats/${chatId}/leave`);
    await queryClient.invalidateQueries({ queryKey: ['chats'] });
    onClose();
    router.push('/');
  };

  if (!open) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[#2A3942] bg-[#111B21] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#24343D] px-4 py-3">
          <h3 className="text-sm font-semibold text-white">Group info</h3>
          <button onClick={onClose} className="rounded-md p-1 text-[var(--wa-text-secondary)] hover:bg-[#1F2C33]">
            <X size={18} />
          </button>
        </div>

        {isLoading || !chat ? (
          <div className="p-4 text-sm text-[var(--wa-text-secondary)]">Loading group data...</div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <div className="flex items-center gap-3 rounded-xl bg-[#0D171D] p-3">
              <Avatar src={chat.avatar} name={chat.name} size={52} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{chat.name}</p>
                <p className="truncate text-xs text-[var(--wa-text-secondary)]">{chat.members.length} members</p>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-[#24343D] p-3">
              <p className="text-xs font-semibold text-[var(--wa-text-secondary)]">Group details</p>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={!isAdmin}
                className="w-full rounded-lg border border-[#2A3942] bg-[#0D171D] px-3 py-2 text-sm text-white outline-none disabled:opacity-70"
                placeholder="Group name"
              />
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={!isAdmin}
                rows={3}
                className="w-full resize-none rounded-lg border border-[#2A3942] bg-[#0D171D] px-3 py-2 text-sm text-white outline-none disabled:opacity-70"
                placeholder="Description"
              />
              {isAdmin ? (
                <button
                  onClick={() => void saveGroupDetails()}
                  disabled={isSavingMeta}
                  className="rounded-lg bg-[var(--wa-green)] px-3 py-1.5 text-xs font-semibold text-[#0B141A] disabled:opacity-60"
                >
                  {isSavingMeta ? 'Saving...' : 'Save details'}
                </button>
              ) : (
                <p className="text-[11px] text-[var(--wa-text-meta)]">Only admins can edit group details.</p>
              )}
            </div>

            {isAdmin ? (
              <div className="space-y-2 rounded-xl border border-[#24343D] p-3">
                <p className="text-xs font-semibold text-[var(--wa-text-secondary)]">Add members</p>
                <div className="relative">
                  <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--wa-text-meta)]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search people"
                    className="w-full rounded-lg border border-[#2A3942] bg-[#0D171D] py-2 pl-8 pr-3 text-xs text-white outline-none"
                  />
                </div>

                <div className="max-h-40 space-y-1 overflow-y-auto">
                  {results
                    .filter((user) => !chat.members.some((member) => member.userId === user.id))
                    .map((user) => (
                      <button
                        key={user.id}
                        onClick={() => void addMember(user.id)}
                        className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-[#1F2C33]"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Avatar src={user.avatar} name={user.name} size={30} online={!!user.isOnline} />
                          <span className="truncate text-xs text-white">{user.name}</span>
                        </div>
                        <UserPlus size={14} className="text-[var(--wa-green)]" />
                      </button>
                    ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-1 rounded-xl border border-[#24343D] p-3">
              <p className="text-xs font-semibold text-[var(--wa-text-secondary)]">Members</p>
              {chat.members.map((member) => {
                const isSelf = member.userId === currentUser?.id;
                return (
                  <div key={member.id} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-[#1A262D]">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar src={member.user.avatar} name={member.user.name} size={30} online={!!member.user.isOnline} />
                      <div className="min-w-0">
                        <p className="truncate text-xs text-white">{member.user.name} {isSelf ? '(You)' : ''}</p>
                        <p className="text-[11px] text-[var(--wa-text-meta)]">{member.role}</p>
                      </div>
                    </div>

                    {isAdmin && !isSelf ? (
                      <button onClick={() => void removeMember(member.userId)} className="rounded-md p-1 text-red-400 hover:bg-[#2A3942]">
                        <UserMinus size={14} />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => void leaveGroup()}
              className="w-full rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300"
            >
              Leave group
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
