'use client';

import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { Message, SocketEvents } from '@/types';

export function useSocket() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const { setTyping, updateLastMessage } = useChatStore();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken || !user) {
      return;
    }

    const socket = getSocket(accessToken);
    socketRef.current = socket;

    socket.on(SocketEvents.NEW_MESSAGE, (message: Message) => {
      queryClient.invalidateQueries({ queryKey: ['messages', message.chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      updateLastMessage(message.chatId, message);
    });

    socket.on(
      SocketEvents.USER_TYPING,
      ({ chatId, userId, isTyping }: { chatId: string; userId: string; isTyping: boolean }) => {
        setTyping(chatId, userId, isTyping);
      },
    );

    socket.on(SocketEvents.USER_ONLINE, ({ userId }: { userId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    });

    socket.on(SocketEvents.USER_OFFLINE, ({ userId }: { userId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    });

    socket.on(SocketEvents.CHAT_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    });

    socket.on(SocketEvents.MESSAGES_READ, ({ chatId }: { chatId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
    });

    return () => {
      socket.off(SocketEvents.NEW_MESSAGE);
      socket.off(SocketEvents.USER_TYPING);
      socket.off(SocketEvents.USER_ONLINE);
      socket.off(SocketEvents.USER_OFFLINE);
      socket.off(SocketEvents.CHAT_UPDATED);
      socket.off(SocketEvents.MESSAGES_READ);
    };
  }, [accessToken, user, queryClient, setTyping, updateLastMessage]);

  return socketRef.current;
}
