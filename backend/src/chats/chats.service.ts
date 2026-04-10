import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateDirectChat(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException('You cannot create a direct chat with yourself');
    }

    const existing = await this.prisma.chat.findFirst({
      where: {
        type: 'DIRECT',
        members: { every: { userId: { in: [userId, targetUserId] } } },
        AND: [
          { members: { some: { userId } } },
          { members: { some: { userId: targetUserId } } },
        ],
      },
      include: {
        members: { include: { user: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.chat.create({
      data: {
        type: 'DIRECT',
        members: {
          create: [{ userId }, { userId: targetUserId }],
        },
      },
      include: {
        members: { include: { user: true } },
      },
    });
  }

  async createGroup(userId: string, dto: CreateGroupDto) {
    const uniqueMemberIds = [...new Set(dto.memberIds.filter((id) => id !== userId))];

    return this.prisma.chat.create({
      data: {
        type: 'GROUP',
        name: dto.name,
        description: dto.description,
        createdById: userId,
        members: {
          create: [
            { userId, role: 'ADMIN' },
            ...uniqueMemberIds.map((id) => ({ userId: id, role: 'MEMBER' as const })),
          ],
        },
      },
      include: {
        members: { include: { user: true } },
      },
    });
  }

  async getUserChats(userId: string) {
    const chats = await this.prisma.chat.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const withUnread = await Promise.all(
      chats.map(async (chat) => {
        const unread = await this.prisma.message.count({
          where: {
            chatId: chat.id,
            senderId: { not: userId },
            readReceipts: { none: { userId } },
          },
        });

        return {
          ...chat,
          unreadCount: unread,
        };
      }),
    );

    return withUnread;
  }

  async getChatById(chatId: string, userId: string) {
    await this.ensureMembership(chatId, userId);

    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  async updateChat(chatId: string, userId: string, dto: UpdateChatDto) {
    await this.ensureGroupAdmin(chatId, userId);

    return this.prisma.chat.update({
      where: { id: chatId },
      data: dto,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async addMember(chatId: string, userId: string, memberId: string) {
    await this.ensureGroupAdmin(chatId, userId);

    await this.prisma.chatMember.upsert({
      where: {
        chatId_userId: {
          chatId,
          userId: memberId,
        },
      },
      create: {
        chatId,
        userId: memberId,
        role: 'MEMBER',
      },
      update: {},
    });

    return this.getChatById(chatId, userId);
  }

  async removeMember(chatId: string, actingUserId: string, memberId: string) {
    await this.ensureGroupAdmin(chatId, actingUserId);

    await this.prisma.chatMember.deleteMany({
      where: {
        chatId,
        userId: memberId,
      },
    });

    return { success: true };
  }

  async leaveChat(chatId: string, userId: string) {
    await this.ensureMembership(chatId, userId);

    await this.prisma.chatMember.delete({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    return { success: true };
  }

  private async ensureMembership(chatId: string, userId: string) {
    const member = await this.prisma.chatMember.findUnique({
      where: {
        chatId_userId: { chatId, userId },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this chat');
    }

    return member;
  }

  private async ensureGroupAdmin(chatId: string, userId: string) {
    const member = await this.ensureMembership(chatId, userId);
    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.type !== 'GROUP') {
      throw new BadRequestException('Action only valid for group chats');
    }

    if (member.role !== 'ADMIN') {
      throw new ForbiddenException('Only group admins can do this action');
    }
  }
}
