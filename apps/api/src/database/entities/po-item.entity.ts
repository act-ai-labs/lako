import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { Product } from './product.entity';

@Entity('po_items')
export class PoItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  poId: string;

  @ManyToOne(() => PurchaseOrder, (po) => po.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poId' })
  purchaseOrder: PurchaseOrder;

  @Column()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'int', default: 0 })
  orderedQty: number;

  @Column({ type: 'int', default: 0 })
  receivedQty: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  unitCost: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
