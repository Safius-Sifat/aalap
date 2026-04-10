'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChatListItem } from './ChatListItem';
import { useChatStore } from '@/stores/chatStore';

type Props = {
  query: string;
};

export function ChatList({ query }: Props) {
  const router = useRouter();
  const chats = useChatStore((state) => state.chats);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const setActiveChat = useChatStore((state) => state.setActiveChat);

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return chats;
    }

    const q = query.toLowerCase();
    return chats.filter((chat) => {
      const groupName = chat.name?.toLowerCase() ?? '';
      const memberNames = chat.members.map((member) => member.user.name.toLowerCase()).join(' ');
      return groupName.includes(q) || memberNames.includes(q);
    });
  }, [chats, query]);

  if (!filtered.length) {
    return <div className="p-4 text-sm text-[var(--wa-text-secondary)]">No chats found.</div>;
  }

  return (
    <div className="divide-y divide-[#1F2C33]">
      {filtered.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          isActive={activeChatId === chat.id}
          onClick={() => {
            setActiveChat(chat.id);
            router.push(`/chat/${chat.id}`);
          }}
        />
      ))}
    </div>
  );
}
