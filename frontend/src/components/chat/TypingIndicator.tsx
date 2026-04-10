'use client';

import { useChatStore } from '@/stores/chatStore';

type Props = {
  chatId: string;
};

const EMPTY_TYPING_USERS: string[] = [];

export function TypingIndicator({ chatId }: Props) {
  const typingUsers = useChatStore((state) => state.typingUsers[chatId]);
  const visibleTypingUsers = typingUsers ?? EMPTY_TYPING_USERS;

  if (!visibleTypingUsers.length) {
    return null;
  }

  return (
    <div className="px-4 pb-1 text-xs text-[var(--wa-text-secondary)]">
      {visibleTypingUsers.length === 1
        ? 'Someone is typing...'
        : `${visibleTypingUsers.length} people are typing...`}
    </div>
  );
}
