import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: 'Ov23liY1KdhndzQ5oisd',
      clientSecret: '0c9cc0d3f829909fb6f2c155e0eebc27b902e44f',
      callbackURL: 'http://localhost:9999/user/callback/github', // 登录后的回调地址
      scope: ['public_profile'], // 请求数据范围
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    return profile;
  }
}
