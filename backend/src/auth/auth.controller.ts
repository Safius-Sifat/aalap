import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(@Request() req: { user: { sub: string; refreshToken?: string } }) {
    const refreshToken = req.user.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    return this.authService.refresh(req.user.sub, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(
    @Request() req: { user: { sub: string } },
    @Body('refreshToken') refreshToken: string,
  ) {
    return this.authService.logout(req.user.sub, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: { user: { sub: string; phone: string } }) {
    return req.user;
  }
}
