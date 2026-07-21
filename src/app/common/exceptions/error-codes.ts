export enum ErrorCodes {
  BAD_REQUEST = 'request.bad-request',
  VALIDATION_FAILED = 'request.validation-failed',
  UNAUTHORIZED = 'auth.unauthorized',
  FORBIDDEN = 'authorization.forbidden',
  TOO_MANY_REQUEST = 'request.too-many-requests',
  INTERNAL_SERVER_ERROR = 'server.internal-server-error',
  ENVIRONMENT_VARIABLE_NOT_DEFINED = 'config.environment-variable-not-defined',
}
