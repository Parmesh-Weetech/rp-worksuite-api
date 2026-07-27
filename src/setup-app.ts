import { INestApplication, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './app/redis/services/redis.service';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { NextFunction, Request, Response } from 'express';

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

  /* ---------- Bull Board Setup ---------- */
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    queues: [new BullMQAdapter(emailQueue), new BullMQAdapter(emailDlqQueue)],
    serverAdapter,
  });

  const bullBoardUsername = configService.get<string>('BULL_BOARD_USERNAME');
  const bullBoardPassword = configService.get<string>('BULL_BOARD_PASSWORD');

  app.use(
    '/admin/queues',
    (req: Request, res: Response, next: NextFunction) => {
      if (!bullBoardUsername || !bullBoardPassword) {
        return res
          .status(401)
          .send('Bull Board credentials not configured in environment.');
      }
      const authorization = req.headers.authorization;
      const b64auth = (authorization || '').split(' ')[1] || '';
      const [user, password] = Buffer.from(b64auth, 'base64')
        .toString()
        .split(':');

      if (
        user &&
        password &&
        user === bullBoardUsername &&
        password === bullBoardPassword
      ) {
        return next();
      }

      res.set('WWW-Authenticate', 'Basic realm="401"');
      res.status(401).send('Authentication required');
    },
    serverAdapter.getRouter(),
  );
};
