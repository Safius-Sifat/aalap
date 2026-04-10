import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET') ?? 'dev_refresh_secret',
      passReqToCallback: true,
    });
  }

  validate(req: { body?: { refreshToken?: string } }, payload: { sub: string; phone: string }) {
    return {
      sub: payload.sub,
      phone: payload.phone,
      refreshToken: req.body?.refreshToken,
    };
  }
}
