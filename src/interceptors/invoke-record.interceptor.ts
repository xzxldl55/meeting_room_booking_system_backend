import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class InvokeRecordInterceptor implements NestInterceptor {
  private readonly logger = new Logger(InvokeRecordInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    const userAgent = request.header['user-agent'];

    const { method, path, ip } = request;

    this.logger.debug(
      `[${method}] ${path} ${ip} ${userAgent}: ${context.getClass().name} ${
        context.getHandler().name
      } invoke...`,
    );

    this.logger.debug(
      `[user]: ${request.user?.userId}, ${request.user?.username}`,
    );

    const now = Date.now();

    return next.handle().pipe(
      tap((res) => {
        this.logger.debug(
          `[${method}] ${path} ${ip} ${userAgent} ${response.statusCode} : ${
            Date.now() - now
          }ms`,
        );
        this.logger.debug(`[Response]: ${JSON.stringify(res)}`);
      }),
    );
  }
}
