import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { Expense } from './expense.entity';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  contact: string | null;

  @Column({ type: 'varchar', nullable: true })
  paymentTerms: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => PurchaseOrder, (po) => po.supplier)
  purchaseOrders: PurchaseOrder[];

  @OneToMany(() => Expense, (expense) => expense.supplier)
  expenses: Expense[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
