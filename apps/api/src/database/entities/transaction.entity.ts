import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionStatus, TransactionType } from './transaction.enums';
import { TransactionItem } from './transaction-item.entity';
import { Payment } from './payment.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  tendered: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  change: string | null;

  @Column({ type: 'varchar', length: 20, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ type: 'varchar', nullable: true })
  cashierId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  syncedAt: Date | null;

  @OneToMany(() => TransactionItem, (item) => item.transaction)
  items: TransactionItem[];

  @OneToMany(() => Payment, (payment) => payment.transaction)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
