import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './messages.service';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Get(':chatId')
    getMessages(
        @Request() req: { user: { sub: string } },
        @Param('chatId') chatId: string,
        @Query('cursor') cursor?: string,
        @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit?: number,
    ) {
        return this.messagesService.getChatMessages(
            chatId,
            req.user.sub,
            cursor,
            limit,
        );
    }

    @Post(':chatId')
    createMessage(
        @Request() req: { user: { sub: string } },
        @Param('chatId') chatId: string,
        @Body() dto: CreateMessageDto,
    ) {
        return this.messagesService.createMessage(chatId, req.user.sub, dto);
    }

    @Post(':chatId/read')
    markRead(
        @Request() req: { user: { sub: string } },
        @Param('chatId') chatId: string,
    ) {
        return this.messagesService.markAsRead(chatId, req.user.sub);
    }

    @Delete(':id')
    deleteMessage(
        @Request() req: { user: { sub: string } },
        @Param('id') id: string,
    ) {
        return this.messagesService.deleteMessage(id, req.user.sub);
    }
}
