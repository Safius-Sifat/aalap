export type User = {
    id: string;
    phone: string;
    name: string;
    about: string;
    avatar?: string | null;
    isOnline?: boolean;
    lastSeen?: string | null;
};

export type ChatMember = {
    id: string;
    userId: string;
    role: 'MEMBER' | 'ADMIN';
    user: User;
};

export type Message = {
    id: string;
    chatId: string;
    senderId: string;
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'STICKER';
    content?: string | null;
    mediaUrl?: string | null;
    fileName?: string | null;
    replyToId?: string | null;
    isDeleted: boolean;
    createdAt: string;
    sender: Pick<User, 'id' | 'name' | 'avatar'>;
    replyTo?: {
        id: string;
        content?: string | null;
        type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'STICKER';
        isDeleted?: boolean;
        sender?: {
            name?: string;
        } | null;
    } | null;
    readReceipts?: Array<{ userId: string; readAt: string }>;
};

export type Chat = {
    id: string;
    type: 'DIRECT' | 'GROUP';
    name?: string | null;
    avatar?: string | null;
    description?: string | null;
    members: ChatMember[];
    messages: Message[];
    unreadCount: number;
};

export enum SocketEvents {
    JOIN_CHAT = 'join_chat',
    LEAVE_CHAT = 'leave_chat',
    SEND_MESSAGE = 'send_message',
    TYPING_START = 'typing_start',
    TYPING_STOP = 'typing_stop',
    MARK_READ = 'mark_read',
    NEW_MESSAGE = 'new_message',
    MESSAGE_UPDATED = 'message_updated',
    USER_TYPING = 'user_typing',
    USER_ONLINE = 'user_online',
    USER_OFFLINE = 'user_offline',
    MESSAGES_READ = 'messages_read',
    CHAT_UPDATED = 'chat_updated',
}
