import { Module } from '@nestjs/common';
import { RestModule } from './rest/rest.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { environmentConfig, postgresConfig } from './common/config';
import { DataSourceOptions } from 'typeorm';
import { getConfig } from './common/helpers';
import { MailModule } from './mail/mail.module';

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

    RestModule,
  ],
})
export class AppModule {}
