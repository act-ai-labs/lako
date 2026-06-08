import { DataSource, DataSourceOptions } from 'typeorm';
import { ALL_ENTITIES, SyncQueue } from './entities';

export const POSTGRES_CONNECTION = 'default';
export const SQLITE_CONNECTION = 'offline';

export function buildPostgresConfig(): DataSourceOptions {
  return {
    name: POSTGRES_CONNECTION,
    type: 'postgres',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    username: process.env.DATABASE_USER ?? 'lako',
    password: process.env.DATABASE_PASSWORD ?? 'lako',
    database: process.env.DATABASE_NAME ?? 'lako_pos',
    entities: ALL_ENTITIES,
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
  };
}

export function buildSqliteConfig(): DataSourceOptions {
  return {
    name: SQLITE_CONNECTION,
    type: 'better-sqlite3',
    database: process.env.SQLITE_PATH ?? './data/lako-offline.sqlite',
    entities: [SyncQueue],
    synchronize: true,
    logging: process.env.NODE_ENV === 'development',
  };
}

export const AppDataSource = new DataSource(buildPostgresConfig());
