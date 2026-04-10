'use client';

import { useChatStore } from '@/stores/chatStore';

type Props = {
  chatId: string;
};

export function TypingIndicator({ chatId }: Props) {
  const typingUsers = useChatStore((state) => state.typingUsers[chatId] ?? []);

  if (!typingUsers.length) {
    return null;
  }

  return (
    <div className="px-4 pb-1 text-xs text-[var(--wa-text-secondary)]">
      {typingUsers.length === 1 ? 'Someone is typing...' : `${typingUsers.length} people are typing...`}
    </div>
  );
}
