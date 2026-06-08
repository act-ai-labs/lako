import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentMethod } from './payment.enums';
import { Transaction } from './transaction.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  transactionId: string;

  @ManyToOne(() => Transaction, (transaction) => transaction.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column({ type: 'varchar', length: 20 })
  method: PaymentMethod;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: string;

  @Column({ type: 'varchar', nullable: true })
  referenceNo: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
