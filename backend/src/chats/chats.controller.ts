import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { AddMemberDto } from './dto/add-member.dto';

@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  getChats(@Request() req: { user: { sub: string } }) {
    return this.chatsService.getUserChats(req.user.sub);
  }

  @Post('direct')
  createOrGetDirect(@Request() req: { user: { sub: string } }, @Body() dto: CreateChatDto) {
    return this.chatsService.getOrCreateDirectChat(req.user.sub, dto.targetUserId);
  }

  @Post('group')
  createGroup(@Request() req: { user: { sub: string } }, @Body() dto: CreateGroupDto) {
    return this.chatsService.createGroup(req.user.sub, dto);
  }

  @Get(':id')
  getChat(@Request() req: { user: { sub: string } }, @Param('id') chatId: string) {
    return this.chatsService.getChatById(chatId, req.user.sub);
  }

  @Patch(':id')
  updateChat(
    @Request() req: { user: { sub: string } },
    @Param('id') chatId: string,
    @Body() dto: UpdateChatDto,
  ) {
    return this.chatsService.updateChat(chatId, req.user.sub, dto);
  }

  @Post(':id/members')
  addMember(
    @Request() req: { user: { sub: string } },
    @Param('id') chatId: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.chatsService.addMember(chatId, req.user.sub, dto.userId);
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Request() req: { user: { sub: string } },
    @Param('id') chatId: string,
    @Param('userId') userId: string,
  ) {
    return this.chatsService.removeMember(chatId, req.user.sub, userId);
  }

  @Delete(':id/leave')
  leaveChat(@Request() req: { user: { sub: string } }, @Param('id') chatId: string) {
    return this.chatsService.leaveChat(chatId, req.user.sub);
  }
}
