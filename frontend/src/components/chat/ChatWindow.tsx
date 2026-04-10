'use client';

import { useChat } from '@/hooks/useChat';
import { useChats } from '@/hooks/useChats';
import { useMessages } from '@/hooks/useMessages';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { SocketEvents } from '@/types';
import { useEffect, useState } from 'react';
import { ChatHeader } from './ChatHeader';
import { GroupInfoDrawer } from './GroupInfoDrawer';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { TypingIndicator } from './TypingIndicator';

export function ChatWindow({ chatId }: { chatId: string }) {
    const accessToken = useAuthStore((state) => state.accessToken);
    const { data: chats } = useChats(true);
    const { data: chatDetail } = useChat(chatId, true);
    const { messages, isLoading, hasMore, fetchNextPage, isFetchingNextPage } = useMessages(chatId);
    const setActiveChat = useChatStore((state) => state.setActiveChat);
    const setReplyTo = useChatStore((state) => state.setReplyTo);
    const clearReplyTo = useChatStore((state) => state.clearReplyTo);
    const [showGroupInfo, setShowGroupInfo] = useState(false);

    const fallbackChat = chats?.find((item) => item.id === chatId);
    const chat = chatDetail ?? fallbackChat;

    useEffect(() => {
        setActiveChat(chatId);
        clearReplyTo();
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
            <ChatHeader chat={chat} onOpenGroupInfo={() => setShowGroupInfo(true)} />

            {isLoading ? (
                <div className="flex flex-1 items-center justify-center text-sm text-[var(--wa-text-secondary)]">Loading messages...</div>
            ) : (
                <>
                    <MessageList
                        messages={messages}
                        hasMore={!!hasMore}
                        onLoadOlder={() => fetchNextPage()}
                        loadingOlder={isFetchingNextPage}
                        onReply={(message) => setReplyTo(message)}
                    />
                    <TypingIndicator chatId={chatId} />
                    <MessageInput chatId={chatId} />
                </>
            )}

            {chat?.type === 'GROUP' ? (
                <GroupInfoDrawer
                    chatId={chatId}
                    open={showGroupInfo}
                    onClose={() => setShowGroupInfo(false)}
                />
            ) : null}
        </section>
    );
}
