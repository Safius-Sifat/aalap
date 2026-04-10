export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'STICKER';

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  type: MessageType;
  content?: string | null;
  mediaUrl?: string | null;
  fileName?: string | null;
  replyToId?: string | null;
  isDeleted: boolean;
  editedAt?: string | null;
  createdAt: string;
};
