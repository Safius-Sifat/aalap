'use client';

import { useEffect } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useChats } from '@/hooks/useChats';
import { useChatStore } from '@/stores/chatStore';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';
import { SocketEvents } from '@/types';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';

export function ChatWindow({ chatId }: { chatId: string }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: chats } = useChats(true);
  const { messages, isLoading, hasMore, fetchNextPage, isFetchingNextPage } = useMessages(chatId);
  const setActiveChat = useChatStore((state) => state.setActiveChat);

  const chat = chats?.find((item) => item.id === chatId);

  useEffect(() => {
    setActiveChat(chatId);
  }, [chatId, setActiveChat]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const socket = getSocket(accessToken);
    socket.emit(SocketEvents.JOIN_CHAT, { chatId });
    socket.emit(SocketEvents.MARK_READ, { chatId });

    return () => {
      socket.emit(SocketEvents.LEAVE_CHAT, { chatId });
    };
  }, [accessToken, chatId]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const socket = getSocket(accessToken);

    const onFocus = () => {
      socket.emit(SocketEvents.MARK_READ, { chatId });
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [accessToken, chatId]);

  return (
    <section className="flex h-full flex-col bg-[var(--wa-bg-dark)]">
      <ChatHeader chat={chat} />

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-[var(--wa-text-secondary)]">Loading messages...</div>
      ) : (
        <>
          <MessageList
            messages={messages}
            hasMore={!!hasMore}
            onLoadOlder={() => void fetchNextPage()}
            loadingOlder={isFetchingNextPage}
          />
          <TypingIndicator chatId={chatId} />
          <MessageInput chatId={chatId} />
        </>
      )}
    </section>
  );
}
