import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DiscountScope, DiscountTrigger, DiscountType } from './discount.enums';

@Entity('discount_rules')
export class DiscountRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', length: 20 })
  type: DiscountType;

  @Column({ type: 'varchar', length: 20 })
  scope: DiscountScope;

  @Column({ type: 'varchar', length: 30 })
  trigger: DiscountTrigger;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  value: string;

  @Column({ type: 'varchar', nullable: true })
  triggerValue: string | null;

  @Column({ default: false })
  authorizationRequired: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
