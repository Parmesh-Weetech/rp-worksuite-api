import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';
import { DevAlertEmailSender } from './dev-alert-email.sender';
import { logger } from 'src/app/common/logger';

@Catch()
export class DevAlertEmailExceptionFilter extends BaseExceptionFilter {
  constructor(
    private readonly sender: DevAlertEmailSender,
    httpAdapterHost: HttpAdapterHost,
  ) {
    super(httpAdapterHost.httpAdapter);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    const statusCode = this.extractStatusCode(exception);

    let message = 'Internal server error';
    let code: any;
    let expired = false;

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      message =
        typeof response === 'string'
          ? response
          : (response as any).message || response;
      code = (exception as any).code || exception.name;
    } else if (exception instanceof Error) {
      message = exception.message;
      code = (exception as any).code || exception.name;
    }

    if (
      code === 'TokenExpiredError' ||
      code === 'auth.access-token-expired' ||
      code === 'auth.refresh-token-expired'
    ) {
      expired = true;
    }

    const res = ctx.getResponse<Response>();
    res.status(statusCode).json({
      success: false,
      expired,
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });

    const serious =
      statusCode === 500 ||
      statusCode === 501 ||
      statusCode === 502 ||
      statusCode === 503 ||
      statusCode === 504;
    if (!serious) return;

    const mapped = this.sender.mapToStatusCode(statusCode, exception);

    this.sender
      .send({
        statusCode: mapped,
        requestInfo: {
          method: request?.method,
          url: request?.originalUrl || request?.url,
          headers: request?.headers,
          body: (request as any)?.body,
          query: (request as any)?.query,
          errorCode:
            exception instanceof Error
              ? (exception as any).code
              : (exception as any)?.code,
          ip: request.ip || request.socket?.remoteAddress,
          userAgent: request.headers['user-agent'],
          user: (request as any).user,
        },
        error: exception,
      })
      .catch((err) => {
        logger.error('DevAlertEmailExceptionFilter: email send failed', err);
      });
  }

  private extractStatusCode(exception: unknown): number {
    const anyEx = exception as any;

    const status = anyEx?.getStatus?.();
    if (typeof status === 'number') return status;

    const sc = anyEx?.statusCode ?? anyEx?.status;
    if (typeof sc === 'number') return sc;

    return 500;
  }
}
