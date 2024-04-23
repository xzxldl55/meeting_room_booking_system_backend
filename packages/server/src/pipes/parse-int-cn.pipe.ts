/**
 * 封装 ParseIntPipe 的错误处理
 */

import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  ParseIntPipe,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseIntCnPipe implements PipeTransform {
  constructor(protected readonly options?: { key: string }) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const key = this.options.key;
    const intPipe = new ParseIntPipe({
      exceptionFactory() {
        throw new BadRequestException(`${key} 应该传入数字`);
      },
    });

    return intPipe.transform(value, metadata);
  }
}
