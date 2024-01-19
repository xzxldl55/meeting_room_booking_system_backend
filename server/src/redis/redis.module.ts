import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

// 注册为全局模块：这样其他模块使用时无需再导入了
@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory(configService: ConfigService) {
        const client = createClient({
          socket: {
            host: configService.get('redis_server_host'),
            port: configService.get('redis_server_port'),
          },
          database: configService.get('redis_server_db'), // 这里这个值是数据库命名空间
        });

        await client.connect();
        return client;
      },
      inject: [ConfigService], // 注入配置服务，这样可以直接在 useFactory 使用
    },
  ],
  // 导出 Redis 服务作为全局服务
  exports: [RedisService],
})
export class RedisModule {}
