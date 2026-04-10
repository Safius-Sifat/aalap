export type ChatType = 'DIRECT' | 'GROUP';
export type MemberRole = 'MEMBER' | 'ADMIN';

export type ChatMember = {
  id: string;
  chatId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
};

export type Chat = {
  id: string;
  type: ChatType;
  name?: string | null;
  avatar?: string | null;
  description?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
};
