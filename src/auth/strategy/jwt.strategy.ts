import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'secret',
    });
  }

  
  async validate(payload: any) {
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp < currentTime) {
      console.log('Token has expired');
      throw new UnauthorizedException({
        status_code: 401,
        error: 'Unauthorized',
        message: 'Token has expired',
        data: {},
      });
    } else {
      return payload;
    }
  }
}
