import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { Supplier } from './supplier.entity';
import { DeliveryItem } from './delivery-item.entity';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  poId: string | null;

  @ManyToOne(() => PurchaseOrder, (po) => po.deliveries, { nullable: true })
  @JoinColumn({ name: 'poId' })
  purchaseOrder: PurchaseOrder | null;

  @Column()
  supplierId: string;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ type: 'timestamptz' })
  receivedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'text', nullable: true })
  discrepancyNotes: string | null;

  @OneToMany(() => DeliveryItem, (item) => item.delivery)
  items: DeliveryItem[];

  @CreateDateColumn()
  createdAt: Date;
}
