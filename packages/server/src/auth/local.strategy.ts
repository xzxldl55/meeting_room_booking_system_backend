/**
 * 用户名&密码登录策略
 * 使用 passport-local
 */

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginUserDto } from 'src/user/user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  @Inject(UserService)
  private userService: UserService;

  /**
   * 用户名&密码本地登录策略
   * 会自动从 request Body 中取出 username 与 password 参数交付认证
   * 最后通过 return 将认证结果返回到 request.user 上
   * @param username 用户名
   * @param password 密码
   * @returns LoginUserVo
   */
  async validate(username: string, password: string) {
    const dto = new LoginUserDto();
    dto.username = username;
    dto.password = password;

    const user = await this.userService.login(dto);

    // 登录后 passport 会自动将这个 user 数据存储到 request.user 可以用@GetUserParam装饰器来获取
    return user;
  }
}
