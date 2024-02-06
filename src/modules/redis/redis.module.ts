import { Module } from '@nestjs/common';
import { redisProvider } from '../../provider/redis.provider';
import { RedisService } from './redis.service';

@Module({
    exports: [RedisService],
    providers: [redisProvider, RedisService],
})
export class RedisModule {}