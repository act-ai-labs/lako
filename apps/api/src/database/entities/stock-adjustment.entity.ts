import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('stock_adjustments')
export class StockAdjustment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'int' })
  qtyChange: number;

  @Column({ type: 'int' })
  previousQty: number;

  @Column({ type: 'int' })
  newQty: number;

  @Column()
  reason: string;

  @Column({ nullable: true })
  adjustedById: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
