import { Body, Controller, Get, Post } from '@nestjs/common';
import { EnqueueSyncPayload, SyncService } from './sync.service';
import { SyncOperation } from '../database/entities';

class EnqueueSyncDto implements EnqueueSyncPayload {
  tableName: string;
  operation: SyncOperation;
  payload: Record<string, unknown>;
  recordId?: string;
}

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('status')
  async getStatus() {
    const pending = await this.syncService.getPendingCount();
    return { pending, status: pending === 0 ? 'synced' : 'pending' };
  }

  @Post('enqueue')
  async enqueue(@Body() body: EnqueueSyncDto) {
    const item = await this.syncService.enqueue(body);
    return { id: item.id, status: item.status };
  }

  @Post('flush')
  async flush() {
    return this.syncService.flushPendingQueue();
  }
}
