import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('gcash_float_balances')
export class GcashFloatBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  loadBalance: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  cashDrawerBalance: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 1000 })
  lowFloatThreshold: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('gcash_float_adjustments')
export class GcashFloatAdjustment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30 })
  type: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  previousBalance: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  newBalance: string;

  @Column({ nullable: true })
  authorizedById: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('eload_denominations')
export class EloadDenomination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  sellingPrice: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
