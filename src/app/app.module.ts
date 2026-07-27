import { Module } from '@nestjs/common';
import { RestModule } from './rest/rest.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { environmentConfig, postgresConfig } from './common/config';
import { DataSourceOptions } from 'typeorm';
import { getConfig } from './common/helpers';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      ignoreEnvFile:
        !!process.env.NODE_ENV && process.env.READ_LOCAL_ENV !== 'true',
      load: [postgresConfig, environmentConfig],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...getConfig<DataSourceOptions>(configService, 'postgresConfig'),
        autoLoadEntities: true,
      }),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.getOrThrow<string>('REDIS_HOST');
        const port = parseInt(configService.getOrThrow<string>('REDIS_PORT'));
        const password = configService.get<string>('REDIS_PASSWORD');

        return {
          connection: {
            host,
            port,
            ...(password ? { password } : {}),
          },
          defaultJobOptions: {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
            removeOnComplete: 1000,
            removeOnFail: false,
          },
        };
      },
    }),

    RestModule,
  ],
})
export class AppModule {}
