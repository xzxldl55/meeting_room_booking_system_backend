import { Module } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { UserModule } from 'src/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [UserModule, ConfigModule],
  providers: [LocalStrategy, JwtStrategy],
})
export class AuthModule {}
