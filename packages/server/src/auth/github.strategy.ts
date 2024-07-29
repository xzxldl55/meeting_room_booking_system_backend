/**
 * Github 第三方认证
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get('github_clientID'),
      clientSecret: configService.get('github_clientSecret'),
      callbackURL: 'http://localhost:9999/user/callback/github', // 登录后的回调地址
      scope: ['public_profile'], // 请求数据范围
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    return profile;
  }
}
