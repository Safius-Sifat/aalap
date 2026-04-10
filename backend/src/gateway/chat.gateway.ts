import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages/messages.service';
import { ChatsService } from '../chats/chats.service';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import { SocketEvents } from './socket-events';
import { WsJwtGuard } from './ws-jwt.guard';

type AuthedSocket = Socket & {
  data: {
    userId?: string;
  };
};

@WebSocketGateway({ cors: { origin: process.env.CLIENT_URL, credentials: true } })
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly chatsService: ChatsService,
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: AuthedSocket) {
    try {
      const token = client.handshake.auth.token as string;
      const payload = this.jwtService.verify<{ sub: string }>(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET') ?? 'dev_access_secret',
      });

      client.data.userId = payload.sub;

      await this.redisService.setOnline(payload.sub, client.id);
      await this.prismaService.user.update({
        where: { id: payload.sub },
        data: { isOnline: true },
      });

      const chats = await this.prismaService.chatMember.findMany({
        where: { userId: payload.sub },
      });

      for (const chat of chats) {
        client.join(chat.chatId);
      }

      this.server.emit(SocketEvents.USER_ONLINE, { userId: payload.sub });
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthedSocket) {
    const userId = client.data.userId;
    if (!userId) {
      return;
    }

    await this.redisService.setOffline(userId);

    const lastSeen = new Date();
    await this.prismaService.user.update({
      where: { id: userId },
      data: { isOnline: false, lastSeen },
    });

    this.server.emit(SocketEvents.USER_OFFLINE, { userId, lastSeen });
  }

  @SubscribeMessage(SocketEvents.JOIN_CHAT)
  handleJoinChat(@ConnectedSocket() client: AuthedSocket, @MessageBody() data: { chatId: string }) {
    client.join(data.chatId);
  }

  @SubscribeMessage(SocketEvents.LEAVE_CHAT)
  handleLeaveChat(@ConnectedSocket() client: AuthedSocket, @MessageBody() data: { chatId: string }) {
    client.leave(data.chatId);
  }

  @SubscribeMessage(SocketEvents.SEND_MESSAGE)
  async handleSendMessage(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody()
    data: {
      chatId: string;
      content?: string;
      type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'STICKER';
      mediaUrl?: string;
      fileName?: string;
      replyToId?: string;
    },
  ) {
    if (!client.data.userId) {
      return;
    }

    const message = await this.messagesService.createMessage(data.chatId, client.data.userId, {
      content: data.content,
      type: data.type,
      mediaUrl: data.mediaUrl,
      fileName: data.fileName,
      replyToId: data.replyToId,
    });

    this.server.to(data.chatId).emit(SocketEvents.NEW_MESSAGE, message);
    this.server.to(data.chatId).emit(SocketEvents.CHAT_UPDATED, { chatId: data.chatId });
  }

  @SubscribeMessage(SocketEvents.TYPING_START)
  handleTypingStart(@ConnectedSocket() client: AuthedSocket, @MessageBody() data: { chatId: string }) {
    if (!client.data.userId) {
      return;
    }

    client.to(data.chatId).emit(SocketEvents.USER_TYPING, {
      chatId: data.chatId,
      userId: client.data.userId,
      isTyping: true,
    });
  }

  @SubscribeMessage(SocketEvents.TYPING_STOP)
  handleTypingStop(@ConnectedSocket() client: AuthedSocket, @MessageBody() data: { chatId: string }) {
    if (!client.data.userId) {
      return;
    }

    client.to(data.chatId).emit(SocketEvents.USER_TYPING, {
      chatId: data.chatId,
      userId: client.data.userId,
      isTyping: false,
    });
  }

  @SubscribeMessage(SocketEvents.MARK_READ)
  async handleMarkRead(@ConnectedSocket() client: AuthedSocket, @MessageBody() data: { chatId: string }) {
    if (!client.data.userId) {
      return;
    }

    const readMessageIds = await this.messagesService.markAsRead(data.chatId, client.data.userId);
    if (readMessageIds.length) {
      this.server.to(data.chatId).emit(SocketEvents.MESSAGES_READ, {
        chatId: data.chatId,
        userId: client.data.userId,
        messageIds: readMessageIds,
      });
    }
  }
}
