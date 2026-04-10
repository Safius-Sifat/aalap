import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<{ handshake?: { auth?: { token?: string } }; data?: Record<string, unknown> }>();
    const token = client.handshake?.auth?.token;

    if (!token) {
      throw new WsException('Unauthorized');
    }

    try {
      const payload = this.jwtService.verify<{ sub: string; phone: string }>(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET') ?? 'dev_access_secret',
      });

      client.data = {
        ...(client.data ?? {}),
        userId: payload.sub,
      };
      return true;
    } catch {
      throw new WsException('Unauthorized');
    }
  }
}
