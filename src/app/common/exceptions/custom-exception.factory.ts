import { CustomException } from './custom-exception';
import { defaultErrorMessages } from './default-error-message';
import { ErrorCodes } from './error-codes';

export class CustomExceptionFactory {
  public static create(
    code: ErrorCodes,
    message?: string | string[],
    statusCode?: number,
  ): CustomException {
    return new CustomException(
      message ?? defaultErrorMessages[code].message,
      statusCode ?? defaultErrorMessages[code].statusCode,
      code,
    );
  }
}
