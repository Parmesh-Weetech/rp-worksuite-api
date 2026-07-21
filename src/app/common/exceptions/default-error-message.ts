import { APIResponse } from '../helpers';
import { ErrorCodes } from './error-codes';

export const defaultErrorMessages: Record<
  ErrorCodes,
  Pick<APIResponse, 'message' | 'statusCode'>
> = {
  [ErrorCodes.BAD_REQUEST]: {
    message: 'Bad request',
    statusCode: 400,
  },
  [ErrorCodes.VALIDATION_FAILED]: {
    message: 'Validation failed',
    statusCode: 400,
  },
  [ErrorCodes.UNAUTHORIZED]: {
    message: 'Unauthorized',
    statusCode: 401,
  },
  [ErrorCodes.FORBIDDEN]: {
    message: 'Forbidden',
    statusCode: 403,
  },
  [ErrorCodes.TOO_MANY_REQUEST]: {
    message: 'Too many requests',
    statusCode: 429,
  },
  [ErrorCodes.INTERNAL_SERVER_ERROR]: {
    message: 'Internal server error',
    statusCode: 500,
  },
  [ErrorCodes.ENVIRONMENT_VARIABLE_NOT_DEFINED]: {
    message: 'Environment variable is not defined',
    statusCode: 500,
  },
};
