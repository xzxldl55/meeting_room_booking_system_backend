import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response: Response = host.switchToHttp().getResponse();
    response.statusCode = exception.getStatus();

    response
      .json({
        code: response.statusCode,
        message:
          (exception.getResponse() as { message: string[] | string })
            ?.message || exception.message,
        data: '',
      })
      .end();
  }
}
