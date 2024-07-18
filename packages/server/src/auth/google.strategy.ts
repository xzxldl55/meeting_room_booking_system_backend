// clientID: 1004690134706-bnnkc2ind2959to1nd0sjasip2ie7m2h.apps.googleusercontent.com
// secret: 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

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID:
        '1004690134706-bnnkc2ind2959to1nd0sjasip2ie7m2h.apps.googleusercontent.com',
      secret: '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',
      callbackURL: 'http://localhost:9999/user/callback/google',
      scope: ['email', 'profile'],
      proxy: true,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };
    return user;
  }
}
