import { Global, Module } from '@nestjs/common';
import { DevAlertEmailExceptionFilter } from './dev-alert-email.exception-filter';
import { DevAlertEmailSender } from './dev-alert-email.sender';

@Global()
@Module({
  imports: [],
  providers: [DevAlertEmailSender, DevAlertEmailExceptionFilter],
  exports: [DevAlertEmailSender, DevAlertEmailExceptionFilter],
})
export class DevAlertEmailModule {}
