import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(Reflector)
  private reflector: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    // 未登录情况，也就不存在什么权限控制了，未登录应交由 loginGuard 控制
    if (!request.user) {
      return true;
    }

    const permissions = request.user.permissions;

    // 获取当前目标的权限元数据
    const requirePermissions = this.reflector.getAllAndOverride<string[]>(
      'require-permission',
      [context.getClass(), context.getHandler()],
    );

    // 没有权限限制
    if (!requirePermissions) {
      return true;
    }

    requirePermissions.forEach((curPermission) => {
      if (!permissions.find((v) => v.code === curPermission)) {
        // 这里发现没有权限后使用 throw 抛出错误来跳出 forEach 执行
        throw new UnauthorizedException('您没有访问该接口的权限');
      }
    });

    return true;
  }
}
