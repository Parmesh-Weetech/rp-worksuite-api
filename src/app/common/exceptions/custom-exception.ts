import { HttpException } from '@nestjs/common';
import { ErrorCodes } from './error-codes';

export class CustomException extends HttpException {
  readonly code: ErrorCodes;

  constructor(
    response: string | Record<string, unknown> | string[],
    status: number,
    code: ErrorCodes,
  ) {
    super(response, status);
    this.code = code;
  }
}
