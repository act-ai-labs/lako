import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Delivery } from './delivery.entity';
import { Product } from './product.entity';

@Entity('delivery_items')
export class DeliveryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  deliveryId: string;

  @ManyToOne(() => Delivery, (delivery) => delivery.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'deliveryId' })
  delivery: Delivery;

  @Column()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'int' })
  receivedQty: number;

  @CreateDateColumn()
  createdAt: Date;
}
