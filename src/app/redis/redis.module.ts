import { Module } from '@nestjs/common';
import { RedisService } from './services/redis.service';

@Module({
  providers: [RedisService],
})
export class RedisModule {}
