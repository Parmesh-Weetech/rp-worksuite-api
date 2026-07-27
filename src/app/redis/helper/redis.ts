import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import { logger } from '../../common/logger/logger';

export function createRedisClient(): RedisClientType {
  const client = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD,
    socket: {
      reconnectStrategy: (retries) => {
        return Math.min(100 * 2 ** retries, 30000);
      },
      connectTimeout: 10000,
    },
  });

  client.on('connect', () => logger.log('Redis connected'));
  client.on('ready', () => logger.log('Redis ready'));
  client.on('reconnecting', () => logger.warn('Redis reconnecting'));
  client.on('error', (err) => logger.error(err));
  client.on('end', () => logger.warn('Redis connection closed'));

  return client;
}
