import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existing) {
      throw new ConflictException('Phone already registered');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        name: dto.name,
        password: hashed,
      },
    });

    const tokens = await this.generateTokens(user.id, user.phone);
    return {
      ...tokens,
      user: this.safeUser(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.phone);
    return {
      ...tokens,
      user: this.safeUser(user),
    };
  }

  async refresh(userId: string, refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!stored || stored.userId !== userId || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.delete({ where: { token: refreshToken } });
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const tokens = await this.generateTokens(user.id, user.phone);
    return {
      ...tokens,
      user: this.safeUser(user),
    };
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });

    return { success: true };
  }

  private async generateTokens(userId: string, phone: string) {
    const payload = { sub: userId, phone };
    const accessExpires = this.configService.get<string>('JWT_ACCESS_EXPIRES') ?? '15m';
    const refreshExpires = this.configService.get<string>('JWT_REFRESH_EXPIRES') ?? '7d';

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET') ?? 'dev_access_secret',
      expiresIn: accessExpires as unknown as number,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') ?? 'dev_refresh_secret',
      expiresIn: refreshExpires as unknown as number,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      userId,
    };
  }

  private safeUser(user: {
    id: string;
    phone: string;
    name: string;
    about: string;
    avatar: string | null;
    lastSeen: Date | null;
    isOnline: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      ...user,
      lastSeen: user.lastSeen?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
