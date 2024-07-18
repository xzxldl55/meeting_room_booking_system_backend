import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

/**
 * 检查用户信息，并做出相应提示（这里做守卫拦截的作用）
 * LoginGuard 继承了 AuthGuard('jwt')，会先过一遍 LoginGuard，当判断 metadata 中 requireLogin 标识为 true 时会反过来在这里在进行校验检查
 * passport-jwt 针对解析不出信息的情况会自动抛出 401 错误
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 从 request.header.Authorization 取出 token
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt_secret'),
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.userId,
      username: payload.username,
      roles: payload.roles,
      permissions: payload.permissions,
      email: payload.email,
    };
  }
}
