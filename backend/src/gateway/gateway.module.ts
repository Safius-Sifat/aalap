import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatsModule } from '../chats/chats.module';
import { MessagesModule } from '../messages/messages.module';
import { ChatGateway } from './chat.gateway';
import { WsJwtGuard } from './ws-jwt.guard';

@Module({
  imports: [JwtModule.register({}), ChatsModule, MessagesModule],
  providers: [ChatGateway, WsJwtGuard],
})
export class GatewayModule {}
