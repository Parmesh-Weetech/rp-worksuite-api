import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { entities } from 'src/app/common/config';

dotenv.config();

const env = process.env.NODE_ENV || 'local';
const isLocal = env === 'local';

dotenv.config({
  path: isLocal ? '.env' : `.env.${env}`,
});

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: entities,
  migrations: ['./db/migrations/*.ts'],
  migrationsTableName: process.env.DB_MIGRATION_TABLE_NAME,
  migrationsTransactionMode: 'each',
  synchronize: false,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});
