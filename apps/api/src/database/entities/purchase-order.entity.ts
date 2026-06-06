import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Supplier } from './supplier.entity';
import { PurchaseOrderStatus } from './purchase-order.enums';
import { PoItem } from './po-item.entity';
import { Delivery } from './delivery.entity';

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  supplierId: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.purchaseOrders)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ type: 'varchar', length: 30, default: PurchaseOrderStatus.PENDING })
  status: PurchaseOrderStatus;

  @Column({ type: 'date', nullable: true })
  expectedDate: string | null;

  @OneToMany(() => PoItem, (item) => item.purchaseOrder)
  items: PoItem[];

  @OneToMany(() => Delivery, (delivery) => delivery.purchaseOrder)
  deliveries: Delivery[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
