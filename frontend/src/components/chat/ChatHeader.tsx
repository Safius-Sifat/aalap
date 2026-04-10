'use client';

import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { Chat } from '@/types';
import { ChevronLeft, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Props = {
  chat: Chat | undefined;
  onOpenGroupInfo?: () => void;
};

export function ChatHeader({ chat, onOpenGroupInfo }: Props) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const other = chat?.members.find((member) => member.userId !== user?.id)?.user;

  const title = chat?.type === 'GROUP' ? chat.name : other?.name;
  const subtitle =
    chat?.type === 'GROUP'
      ? `${chat.members.length} members`
      : other?.isOnline
        ? 'online'
        : other?.lastSeen
          ? `last seen ${new Date(other.lastSeen).toLocaleString()}`
          : 'offline';

  return (
    <header className="flex items-center gap-3 border-b border-[#2A3942] bg-[#202C33] px-4 py-3">
      <button
        onClick={() => router.push('/')}
        className="rounded-md p-1 text-[var(--wa-text-secondary)] hover:bg-[#2A3942] lg:hidden"
      >
        <ChevronLeft size={18} />
      </button>
      <Avatar src={chat?.type === 'GROUP' ? chat.avatar : other?.avatar} name={title} size={40} online={!!other?.isOnline} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{title ?? 'Select a chat'}</p>
        <p className="truncate text-xs text-[var(--wa-text-secondary)]">{subtitle}</p>
      </div>

      {chat?.type === 'GROUP' ? (
        <button
          onClick={onOpenGroupInfo}
          className="ml-auto rounded-md p-1 text-[var(--wa-text-secondary)] hover:bg-[#2A3942]"
          title="Group info"
        >
          <Info size={16} />
        </button>
      ) : null}
    </header>
  );
}
