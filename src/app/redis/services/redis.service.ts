import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { createRedisClient } from '../helper/redis';
import { logger } from '../../common/logger/logger';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  client: RedisClientType;

  constructor() {
    this.client = createRedisClient();
  }

  async onModuleInit() {
    try {
      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
    } catch (error) {
      logger.error('Failed to disconnect from Redis', error);
    }
  }

  getClient(): RedisClientType {
    if (!this.client) {
      this.client = createRedisClient();
    }
    return this.client;
  }

  async set<T>(key: string, data: T, ttl: number) {
    return await this.client.set(key, JSON.stringify(data), {
      EX: ttl,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  }

  delete(key: string) {
    return this.client.del(key);
  }

  async increment(key: string, ttlSeconds?: number): Promise<number> {
    const value = await this.client.incr(key);
    if (value === 1 && ttlSeconds) {
      await this.client.expire(key, ttlSeconds);
    }
    return value;
  }

  async update<T>(key: string, data: T, ttl: number) {
    await this.client.set(key, JSON.stringify(data), {
      EX: ttl,
    });
  }
}
