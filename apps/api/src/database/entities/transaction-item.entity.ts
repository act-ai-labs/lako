import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { Product } from './product.entity';

@Entity('transaction_items')
export class TransactionItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  transactionId: string;

  @ManyToOne(() => Transaction, (transaction) => transaction.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column({ type: 'varchar', nullable: true })
  productId: string | null;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product | null;

  @Column({ type: 'int', default: 1 })
  qty: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount: string;

  @CreateDateColumn()
  createdAt: Date;
}
