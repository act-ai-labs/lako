import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../database/database.module';
import {
  POSTGRES_CONNECTION,
  SQLITE_CONNECTION,
} from '../database/data-source';
import { SyncQueue } from '../database/entities';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
  imports: [
    DatabaseModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([SyncQueue], SQLITE_CONNECTION),
    TypeOrmModule.forFeature([SyncQueue], POSTGRES_CONNECTION),
  ],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
