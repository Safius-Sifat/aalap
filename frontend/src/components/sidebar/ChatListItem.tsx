'use client';

import { Chat } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/authStore';
import { formatDistanceToNow } from 'date-fns';

type Props = {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
};

export function ChatListItem({ chat, isActive, onClick }: Props) {
  const user = useAuthStore((state) => state.user);
  const lastMessage = chat.messages[0];

  const otherMember = chat.members.find((member) => member.userId !== user?.id)?.user;
  const displayName = chat.type === 'GROUP' ? chat.name : otherMember?.name;
  const avatar = chat.type === 'GROUP' ? chat.avatar : otherMember?.avatar;

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-3 py-3 text-left transition ${
        isActive ? 'bg-[#2A3942]' : 'hover:bg-[#1F2C33]'
      }`}
    >
      <Avatar src={avatar} name={displayName} online={!!otherMember?.isOnline} size={48} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="truncate text-sm font-medium text-white">{displayName ?? 'Unknown'}</span>
          <span className="shrink-0 text-[11px] text-[var(--wa-text-meta)]">
            {lastMessage?.createdAt
              ? formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })
              : ''}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="truncate text-xs text-[var(--wa-text-secondary)]">
            {lastMessage?.isDeleted
              ? 'This message was deleted'
              : lastMessage?.type === 'IMAGE'
                ? 'Photo'
                : lastMessage?.type === 'VIDEO'
                  ? 'Video'
                  : lastMessage?.content ?? 'No messages yet'}
          </span>
          {chat.unreadCount > 0 ? <Badge>{chat.unreadCount > 99 ? '99+' : chat.unreadCount}</Badge> : null}
        </div>
      </div>
    </button>
  );
}
