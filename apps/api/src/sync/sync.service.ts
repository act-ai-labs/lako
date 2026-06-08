import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import {
  POSTGRES_CONNECTION,
  SQLITE_CONNECTION,
} from '../database/data-source';
import { SyncOperation, SyncQueue, SyncStatus } from '../database/entities';

export interface EnqueueSyncPayload {
  tableName: string;
  operation: SyncOperation;
  payload: Record<string, unknown>;
  recordId?: string;
}

@Injectable()
export class SyncService implements OnModuleInit {
  private readonly logger = new Logger(SyncService.name);
  private isSyncing = false;

  constructor(
    @InjectRepository(SyncQueue, SQLITE_CONNECTION)
    private readonly offlineQueueRepo: Repository<SyncQueue>,
    @InjectRepository(SyncQueue, POSTGRES_CONNECTION)
    private readonly postgresQueueRepo: Repository<SyncQueue>,
  ) {}

  onModuleInit(): void {
    void this.flushPendingQueue();
  }

  async enqueue(entry: EnqueueSyncPayload): Promise<SyncQueue> {
    const queueItem = this.offlineQueueRepo.create({
      tableName: entry.tableName,
      operation: entry.operation,
      payload: entry.payload,
      recordId: entry.recordId ?? null,
      status: SyncStatus.PENDING,
    });

    return this.offlineQueueRepo.save(queueItem);
  }

  async getPendingCount(): Promise<number> {
    return this.offlineQueueRepo.count({
      where: { status: SyncStatus.PENDING },
    });
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleScheduledSync(): Promise<void> {
    await this.flushPendingQueue();
  }

  async flushPendingQueue(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) {
      return { synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    let synced = 0;
    let failed = 0;

    try {
      const pending = await this.offlineQueueRepo.find({
        where: { status: SyncStatus.PENDING },
        order: { createdAt: 'ASC' },
        take: 50,
      });

      for (const item of pending) {
        try {
          await this.applyToPostgres(item);
          item.status = SyncStatus.SYNCED;
          item.syncedAt = new Date().toISOString();
          item.errorMessage = null;
          await this.offlineQueueRepo.save(item);
          synced += 1;
        } catch (error) {
          item.status = SyncStatus.FAILED;
          item.errorMessage =
            error instanceof Error ? error.message : 'Unknown sync error';
          await this.offlineQueueRepo.save(item);
          failed += 1;
          this.logger.error(`Sync failed for ${item.id}: ${item.errorMessage}`);
        }
      }
    } finally {
      this.isSyncing = false;
    }

    if (synced > 0 || failed > 0) {
      this.logger.log(`Sync complete: ${synced} synced, ${failed} failed`);
    }

    return { synced, failed };
  }

  private async applyToPostgres(item: SyncQueue): Promise<void> {
    this.assertSafeTableName(item.tableName);
    const recordId = item.recordId ?? (item.payload.id as string | undefined);

    if (recordId) {
      const existing = await this.postgresQueueRepo.manager
        .createQueryBuilder()
        .select('record.id', 'id')
        .from(item.tableName, 'record')
        .where('record.id = :id', { id: recordId })
        .limit(1)
        .getRawMany<{ id: string }>();

      if (existing.length > 0 && item.operation === SyncOperation.INSERT) {
        await this.postgresQueueRepo.manager
          .createQueryBuilder()
          .update(item.tableName)
          .set(item.payload)
          .where('id = :id', { id: recordId })
          .execute();
        return;
      }
    }

    switch (item.operation) {
      case SyncOperation.INSERT:
        await this.postgresQueueRepo.manager
          .createQueryBuilder()
          .insert()
          .into(item.tableName)
          .values(item.payload)
          .orIgnore()
          .execute();
        break;
      case SyncOperation.UPDATE:
        if (!recordId) {
          throw new Error('Update sync requires recordId');
        }
        await this.postgresQueueRepo.manager
          .createQueryBuilder()
          .update(item.tableName)
          .set(item.payload)
          .where('id = :id', { id: recordId })
          .execute();
        break;
      case SyncOperation.DELETE:
        if (!recordId) {
          throw new Error('Delete sync requires recordId');
        }
        await this.postgresQueueRepo.manager
          .createQueryBuilder()
          .delete()
          .from(item.tableName)
          .where('id = :id', { id: recordId })
          .execute();
        break;
    }
  }

  private assertSafeTableName(tableName: string): void {
    if (!/^[a-z_]+$/.test(tableName)) {
      throw new Error('Invalid sync table name');
    }
  }
}
