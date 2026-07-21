import { Module } from '@nestjs/common';
import { ObservabilityModule } from './observability/observability.module';
import { APP_FILTER } from '@nestjs/core';
import { LoggingModule } from './logging/logging.module';
import { DevAlertEmailModule } from './alert-dev-email';
import { DevAlertEmailExceptionFilter } from './alert-dev-email/dev-alert-email.exception-filter';

@Module({
  imports: [ObservabilityModule, LoggingModule, DevAlertEmailModule],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DevAlertEmailExceptionFilter,
    },
  ],
})
export class CoreModule {}
