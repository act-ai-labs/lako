import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ALL_ENTITIES } from './entities';
import {
  buildPostgresConfig,
  buildSqliteConfig,
  POSTGRES_CONNECTION,
  SQLITE_CONNECTION,
} from './data-source';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: POSTGRES_CONNECTION,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => buildPostgresConfig(),
    }),
    TypeOrmModule.forRootAsync({
      name: SQLITE_CONNECTION,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => buildSqliteConfig(),
    }),
    TypeOrmModule.forFeature(ALL_ENTITIES, POSTGRES_CONNECTION),
    TypeOrmModule.forFeature(ALL_ENTITIES, SQLITE_CONNECTION),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
