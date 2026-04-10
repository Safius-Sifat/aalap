'use client';

import { Message } from '@/types';
import { MessageBubble } from './MessageBubble';
import { useAuthStore } from '@/stores/authStore';
import { format, isToday, isYesterday } from 'date-fns';

type Props = {
  messages: Message[];
  hasMore: boolean;
  onLoadOlder: () => void;
  loadingOlder: boolean;
};

export function MessageList({ messages, hasMore, onLoadOlder, loadingOlder }: Props) {
  const user = useAuthStore((state) => state.user);

  if (!messages.length) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 text-sm text-[var(--wa-text-secondary)]">
        No messages yet. Say hi!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-4">
      <div className="mb-3 flex justify-center">
        {hasMore ? (
          <button
            onClick={onLoadOlder}
            disabled={loadingOlder}
            className="rounded-full border border-[#2A3942] bg-[#111B21] px-3 py-1 text-xs text-[var(--wa-text-secondary)] disabled:opacity-70"
          >
            {loadingOlder ? 'Loading older...' : 'Load older messages'}
          </button>
        ) : (
          <span className="text-xs text-[var(--wa-text-meta)]">Beginning of conversation</span>
        )}
      </div>

      {messages.map((message, index) => {
        const current = new Date(message.createdAt);
        const prev = messages[index - 1] ? new Date(messages[index - 1].createdAt) : null;

        const showDateSeparator = !prev || current.toDateString() !== prev.toDateString();

        let dateLabel = format(current, 'dd MMM yyyy');
        if (isToday(current)) {
          dateLabel = 'Today';
        } else if (isYesterday(current)) {
          dateLabel = 'Yesterday';
        }

        return (
          <div key={message.id}>
            {showDateSeparator ? (
              <div className="my-3 flex justify-center">
                <span className="rounded-full bg-[#1D2D35] px-2.5 py-1 text-[11px] text-[var(--wa-text-meta)]">
                  {dateLabel}
                </span>
              </div>
            ) : null}
            <MessageBubble message={message} isOwn={message.senderId === user?.id} />
          </div>
        );
      })}
    </div>
  );
}
