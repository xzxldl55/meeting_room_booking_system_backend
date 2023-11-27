import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { JwtUserData } from 'src/user/user.type';
import { Request } from 'express';

// 给 express 模块的 Request 类型添加字段 user
declare module 'express' {
  interface Request {
    user: JwtUserData;
  }
}

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject()
  private reflector: Reflector;

  @Inject(JwtService)
  private jwtService: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 获取 express 的 request 对象
    const request: Request = context.switchToHttp().getRequest();

    // 【获取元数据】使用 nestJs 的 reflector 对象，从目标 Controller【getClass】和 handler 上拿到 require-login 的 metadata
    const requireLogin = this.reflector.getAllAndOverride('require-login', [
      context.getClass(),
      context.getHandler(),
    ]);
    // 【匹配标识符】如果当前 Controller / handler 的 require-login 不为 true 则无需做后续用户校验
    if (!requireLogin) {
      return true;
    }

    // 【检查登录情况】
    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new UnauthorizedException('用户未登录');
    }

    // 【解析并缓存用户数据】
    try {
      const token = authorization.split(' ')[1];
      const data = this.jwtService.verify<JwtUserData>(token);

      // 从 jwt 中取出用户数据放到 request 里去
      request.user = {
        userId: data.userId,
        username: data.username,
        roles: data.roles,
        permissions: data.permissions,
      };
      return true;
    } catch (e) {
      throw new UnauthorizedException('token 失效，请重新登录');
    }
  }
}
