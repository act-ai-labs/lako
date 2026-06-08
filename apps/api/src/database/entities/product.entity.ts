import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sku: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  unitCost: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  sellingPrice: string;

  @Column({ type: 'int', default: 0 })
  stockQty: number;

  @Column({ type: 'int', default: 0 })
  reorderPoint: number;

  @Column({ type: 'date', nullable: true })
  expiryDate: string | null;

  @Column({ type: 'varchar', nullable: true })
  barcode: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
