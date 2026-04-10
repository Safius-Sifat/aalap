import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getChatMessages(chatId: string, userId: string, cursor?: string, limit = 30) {
    await this.ensureMembership(chatId, userId);

    const messages = await this.prisma.message.findMany({
      where: { chatId, isDeleted: false },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        replyTo: {
          include: {
            sender: { select: { name: true } },
          },
        },
        readReceipts: {
          select: { userId: true, readAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = messages.length > limit;

    return {
      messages: messages.slice(0, limit).reverse(),
      hasMore,
      nextCursor: hasMore ? messages[limit - 1]?.id ?? null : null,
    };
  }

  async createMessage(chatId: string, senderId: string, dto: CreateMessageDto) {
    await this.ensureMembership(chatId, senderId);

    const message = await this.prisma.message.create({
      data: {
        chatId,
        senderId,
        type: dto.type ?? 'TEXT',
        content: dto.content,
        mediaUrl: dto.mediaUrl,
        fileName: dto.fileName,
        replyToId: dto.replyToId,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        replyTo: {
          include: {
            sender: { select: { name: true } },
          },
        },
      },
    });

    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async markAsRead(chatId: string, userId: string) {
    await this.ensureMembership(chatId, userId);

    const unread = await this.prisma.message.findMany({
      where: {
        chatId,
        senderId: { not: userId },
        readReceipts: { none: { userId } },
      },
      select: { id: true },
    });

    if (!unread.length) {
      return [];
    }

    await this.prisma.readReceipt.createMany({
      data: unread.map((m) => ({ messageId: m.id, userId })),
      skipDuplicates: true,
    });

    return unread.map((m) => m.id);
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own message');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        content: null,
      },
    });
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
  }
}
