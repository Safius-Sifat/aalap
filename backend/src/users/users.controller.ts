import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  search(@Request() req: { user: { sub: string } }, @Query('q') q = '') {
    return this.usersService.search(q.trim(), req.user.sub);
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch('me')
  updateMe(@Request() req: { user: { sub: string } }, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.sub, dto);
  }
}
