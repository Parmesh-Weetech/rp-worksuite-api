import { getEnvVal } from '../helpers/env';
import { PLATFORM_ENVIRONMENT } from '../types';

export const environmentConfig = () => {
  const environment = getEnvVal('NODE_ENV');
  if (!Object.values(PLATFORM_ENVIRONMENT).includes(environment)) {
    throw new Error('Invalid NODE_ENV value');
  }
  return {
    environment: environment,
    isProd: environment === 'prod' || environment === 'uat',
    isDev: environment === 'dev',
    isUat: environment === 'uat',
    isTest: environment === 'test',
  };
};
