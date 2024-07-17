import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { JwtUserData } from 'src/user/user.type';
import { AuthGuard } from '@nestjs/passport';

// 给 express 模块的 Request 类型添加字段 user
declare module 'express' {
  interface Request {
    user: JwtUserData;
  }
}

// 继承 AuthGuard 守卫，实现自定义登录校验守卫
@Injectable()
export class LoginGuard extends AuthGuard('jwt') {
  @Inject()
  private reflector: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 【获取元数据】使用 nestJs 的 reflector 对象，从目标 Controller【getClass】和 handler 上拿到 require-login 的 metadata
    const requireLogin = this.reflector.getAllAndOverride('require-login', [
      context.getClass(),
      context.getHandler(),
    ]);
    // 【匹配标识符】如果当前 Controller / handler 的 require-login 不为 true 则无需做后续用户校验
    if (!requireLogin) {
      return true;
    }

    // 否则需要进行登录校验，这里放行让继承的父级 AuthGuard('jwt') 来做判断
    return super.canActivate(context);
  }
}
