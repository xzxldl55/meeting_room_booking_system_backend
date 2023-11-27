/**
 * 响应拦截器
 *
 * 这里会修改成功的响应消息为固定的标准格式
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, map } from 'rxjs';

@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response: Response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        return {
          code: response.statusCode || 200,
          message: 'success',
          data,
        };
      }),
    );
  }
}
