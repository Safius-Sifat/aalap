import type { Chat, Message } from '@/types';
import { create } from 'zustand';

function normalizeChat(chat: Chat): Chat {
    return {
        ...chat,
        members: Array.isArray(chat.members) ? chat.members : [],
        messages: Array.isArray(chat.messages) ? chat.messages : [],
        unreadCount: typeof chat.unreadCount === 'number' ? chat.unreadCount : 0,
    };
}

type ChatState = {
    chats: Chat[];
    activeChatId: string | null;
    typingUsers: Record<string, string[]>;
    replyTo: Message | null;
    setChats: (chats: Chat[]) => void;
    upsertChat: (chat: Chat) => void;
    setActiveChat: (id: string | null) => void;
    setTyping: (chatId: string, userId: string, typing: boolean) => void;
    updateLastMessage: (chatId: string, message: Message) => void;
    setReplyTo: (message: Message | null) => void;
    clearReplyTo: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
    chats: [],
    activeChatId: null,
    typingUsers: {},
    replyTo: null,
    setChats: (chats) => set({ chats: chats.map(normalizeChat) }),
    upsertChat: (chat) =>
        set((state) => {
            const normalizedChat = normalizeChat(chat);
            const existing = state.chats.find((c) => c.id === chat.id);
            if (!existing) {
                return { chats: [normalizedChat, ...state.chats] };
            }

            return {
                chats: state.chats.map((c) =>
                    c.id === chat.id ? normalizeChat({ ...existing, ...normalizedChat }) : c,
                ),
            };
        }),
    setActiveChat: (id) => set({ activeChatId: id }),
    setTyping: (chatId, userId, typing) =>
        set((state) => {
            const current = state.typingUsers[chatId] ?? [];
            const next = typing
                ? Array.from(new Set([...current, userId]))
                : current.filter((id) => id !== userId);

            return {
                typingUsers: {
                    ...state.typingUsers,
                    [chatId]: next,
                },
            };
        }),
    updateLastMessage: (chatId, message) =>
        set((state) => ({
            chats: state.chats
                .map((chat) =>
                    chat.id === chatId
                        ? {
                            ...chat,
                            messages: [message],
                        }
                        : chat,
                )
                .sort((a, b) => {
                    const aDate = new Date(a.messages[0]?.createdAt ?? a.id).getTime();
                    const bDate = new Date(b.messages[0]?.createdAt ?? b.id).getTime();
                    return bDate - aDate;
                }),
        })),
    setReplyTo: (message) => set({ replyTo: message }),
    clearReplyTo: () => set({ replyTo: null }),
}));
