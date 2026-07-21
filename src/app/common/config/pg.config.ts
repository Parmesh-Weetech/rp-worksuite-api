import { DataSourceOptions } from 'typeorm';
import { getEnvVal, getNumericEnvVal } from '../helpers/env';

declare global {
  interface EnvVar {
    DB_HOST: string;
    DB_PORT?: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_NAME: string;
  }
}

export const entities = [];

const isLocal = process.env.NODE_ENV === 'local';

export const postgresConfig = (): { postgresConfig: DataSourceOptions } => {
  return {
    postgresConfig: {
      type: 'postgres',
      host: getEnvVal('DB_HOST'),
      port: getNumericEnvVal('DB_PORT', 5432),
      username: getEnvVal('DB_USERNAME'),
      password: getEnvVal('DB_PASSWORD'),
      database: getEnvVal('DB_NAME'),
      entities: entities,
      synchronize: false,
      logging: false,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    },
  };
};
