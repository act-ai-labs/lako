import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SyncOperation, SyncStatus } from './sync-queue.enums';

@Entity('sync_queue')
export class SyncQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tableName: string;

  @Column({ type: 'varchar', length: 20 })
  operation: SyncOperation;

  @Column({ type: 'simple-json' })
  payload: Record<string, unknown>;

  @Column({ nullable: true })
  recordId: string | null;

  @Column({ type: 'varchar', length: 20, default: SyncStatus.PENDING })
  status: SyncStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  syncedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
