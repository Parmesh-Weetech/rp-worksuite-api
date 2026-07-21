import { CustomExceptionFactory } from '../exceptions/custom-exception.factory';
import { ErrorCodes } from '../exceptions/error-codes';
import { PLATFORM_ENVIRONMENT, PlatformEnvironment } from '../types';

declare global {
  interface EnvVar {
    NODE_ENV: PlatformEnvironment;
    READ_LOCAL_ENV?: 'true' | 'false';
    SWAGGER_USER?: string;
    SWAGGER_PASSWORD?: string;
    SESSION_SECRET?: string;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends EnvVar {}
  }
}

export const isProd = (): boolean => {
  return process.env.NODE_ENV === PLATFORM_ENVIRONMENT.PROD;
};

export const isDev = (): boolean => {
  return process.env.NODE_ENV === PLATFORM_ENVIRONMENT.DEV;
};

export const isTest = (): boolean => {
  return process.env.NODE_ENV === PLATFORM_ENVIRONMENT.TEST;
};

export const getEnvVal = (env: keyof EnvVar, defaultVal?: string): string => {
  const envVal = process.env[env];
  if (defaultVal === undefined) {
    if (!envVal)
      throw CustomExceptionFactory.create(
        ErrorCodes.ENVIRONMENT_VARIABLE_NOT_DEFINED,
      );
  }
  return (envVal ?? defaultVal) as string;
};

export const getOptionalEnvVal = (env: keyof EnvVar): string | undefined => {
  return process.env[env];
};

export const getBoolEnvVal = (
  env: keyof EnvVar,
  defaultVal?: boolean,
): boolean => {
  if (defaultVal === undefined) {
    if (!process.env[env]) {
      throw new Error(`${env} environment variable is not defined.`);
    }
    if (!validateIsBooleanString(process.env[env])) {
      throw new Error(`${env} environment variable is not a boolean string.`);
    }
  }
  return process.env[env]
    ? process.env[env] === 'true'
    : (defaultVal as boolean);
};

export const getNumericEnvVal = (
  env: keyof EnvVar,
  defaultVal?: number,
): number => {
  const envVal = process.env[env];
  if (defaultVal === undefined) {
    if (envVal === undefined) {
      throw CustomExceptionFactory.create(
        ErrorCodes.ENVIRONMENT_VARIABLE_NOT_DEFINED,
      );
    }
    if (isNaN(Number(envVal))) {
      throw CustomExceptionFactory.create(
        ErrorCodes.ENVIRONMENT_VARIABLE_NOT_DEFINED,
      );
    }
  }
  return envVal ? Number(envVal) : defaultVal!;
};

export const getSessionSalt = (): number => {
  const salt = process.env.BCRYPT_SALT;

  if (!salt) {
    throw new Error('Environment Variable BCRYPT_SALT is required');
  }

  if (!validateIsIntegerString(salt)) {
    throw new Error(
      'Environment Variable BCRYPT_SALT must be an integer string',
    );
  }

  const saltNum = Number(salt);

  if (saltNum < 10 || saltNum > 14) {
    throw new Error(
      'Environment Variable BCRYPT_SALT must be between 10 and 14',
    );
  }
  return saltNum;
};

const validateIsIntegerString = (s: string) => {
  if (!/^-?\d+$/.test(s)) {
    return false;
  }
  return true;
};

const validateIsBooleanString = (value: string): value is 'true' | 'false' => {
  return value === 'true' || value === 'false';
};
