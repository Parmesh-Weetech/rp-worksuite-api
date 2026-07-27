import { INestApplication, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './app/redis/services/redis.service';

export const setupApp = (app: INestApplication) => {
  const configService = app.get(ConfigService);
  const redisService = app.get(RedisService);

  /* ---------- Global Prefix ---------- */
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix, { exclude: ['u/:shortUrl'] });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  /* ---------- CORS ---------- */
  app.enableCors({
    origin:
      configService.getOrThrow<string>('FRONTEND_URL') ||
      'http://localhost:3000',
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    methods: ['POST', 'GET', 'DELETE', 'PATCH', 'PUT'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
};
