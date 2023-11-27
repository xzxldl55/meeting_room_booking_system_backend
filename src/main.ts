import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { FormatResponseInterceptor } from './interceptors/format-response.interceptor';
import { InvokeRecordInterceptor } from './interceptors/invoke-record.interceptor';
import { CustomExceptionFilter } from './filters/custom-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 开启全局参数校验 Pipe
  app.useGlobalPipes(new ValidationPipe());

  // 全局开启响应拦截器
  app.useGlobalInterceptors(new FormatResponseInterceptor());

  // 全局开启日志记录
  app.useGlobalInterceptors(new InvokeRecordInterceptor());

  // 全局开启异常处理过滤器，标准化异常处理
  app.useGlobalFilters(new CustomExceptionFilter());

  await app.listen(configService.get('nest_server_port'));
}
bootstrap();
