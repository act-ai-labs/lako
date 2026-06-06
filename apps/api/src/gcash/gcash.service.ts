import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { POSTGRES_CONNECTION } from '../database/data-source';
import {
  EloadDenomination,
  GcashFloatAdjustment,
  GcashFloatBalance,
  Payment,
  PaymentMethod,
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../database/entities';
import {
  EloadDenominationDto,
  FloatAdjustmentDto,
  GcashServiceTransactionDto,
} from './dto/gcash.dto';

@Injectable()
export class GcashService {
  constructor(
    @InjectRepository(GcashFloatBalance, POSTGRES_CONNECTION)
    private readonly balanceRepo: Repository<GcashFloatBalance>,
    @InjectRepository(GcashFloatAdjustment, POSTGRES_CONNECTION)
    private readonly adjustmentRepo: Repository<GcashFloatAdjustment>,
    @InjectRepository(EloadDenomination, POSTGRES_CONNECTION)
    private readonly denominationRepo: Repository<EloadDenomination>,
    @InjectRepository(Transaction, POSTGRES_CONNECTION)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(Payment, POSTGRES_CONNECTION)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  async getBalance(): Promise<GcashFloatBalance> {
    const existing = await this.balanceRepo.findOne({ where: {} });
    if (existing) return existing;
    return this.balanceRepo.save(this.balanceRepo.create());
  }

  listDenominations(): Promise<EloadDenomination[]> {
    return this.denominationRepo.find({
      where: { isActive: true },
      order: { amount: 'ASC' },
    });
  }

  createDenomination(dto: EloadDenominationDto): Promise<EloadDenomination> {
    return this.denominationRepo.save(
      this.denominationRepo.create({
        amount: dto.amount,
        sellingPrice: dto.sellingPrice,
      }),
    );
  }

  async adjustFloat(dto: FloatAdjustmentDto): Promise<GcashFloatBalance> {
    const balance = await this.getBalance();
    const previous = Number(balance.balance);
    const amount = Number(dto.amount);
    const next = dto.type === 'top_up' ? previous + amount : previous - amount;
    if (next < 0)
      throw new BadRequestException('GCash float cannot be negative');

    balance.balance = next.toFixed(2);
    await this.balanceRepo.save(balance);
    await this.adjustmentRepo.save(
      this.adjustmentRepo.create({
        type: dto.type,
        amount: dto.amount,
        previousBalance: previous.toFixed(2),
        newBalance: balance.balance,
        notes: dto.notes ?? null,
      }),
    );
    return balance;
  }

  async processTransaction(
    dto: GcashServiceTransactionDto,
  ): Promise<Transaction> {
    const balance = await this.getBalance();
    const amount = Number(dto.amount);
    const fee = Number(dto.fee ?? 0);
    let total = amount + fee;

    if (dto.type === 'cash_in') {
      if (Number(balance.balance) < amount)
        throw new BadRequestException('Insufficient GCash float');
      balance.balance = (Number(balance.balance) - amount).toFixed(2);
      balance.cashDrawerBalance = (
        Number(balance.cashDrawerBalance) +
        amount +
        fee
      ).toFixed(2);
    }

    if (dto.type === 'cash_out') {
      if (Number(balance.cashDrawerBalance) < amount)
        throw new BadRequestException('Insufficient cash drawer balance');
      balance.balance = (Number(balance.balance) + amount).toFixed(2);
      balance.cashDrawerBalance = (
        Number(balance.cashDrawerBalance) -
        amount +
        fee
      ).toFixed(2);
    }

    if (dto.type === 'load') {
      const denomination = dto.denominationId
        ? await this.denominationRepo.findOne({
            where: { id: dto.denominationId },
          })
        : null;
      if (!denomination)
        throw new NotFoundException('E-load denomination not found');
      if (Number(balance.loadBalance) < Number(denomination.amount)) {
        throw new BadRequestException('Insufficient load balance');
      }
      total = Number(denomination.sellingPrice);
      balance.loadBalance = (
        Number(balance.loadBalance) - Number(denomination.amount)
      ).toFixed(2);
      balance.cashDrawerBalance = (
        Number(balance.cashDrawerBalance) + total
      ).toFixed(2);
    }

    await this.balanceRepo.save(balance);
    const transaction = await this.transactionRepo.save(
      this.transactionRepo.create({
        type:
          dto.type === 'cash_in'
            ? TransactionType.GCASH_IN
            : dto.type === 'cash_out'
              ? TransactionType.GCASH_OUT
              : TransactionType.LOAD,
        total: total.toFixed(2),
        tendered: total.toFixed(2),
        change: '0.00',
        status: TransactionStatus.COMPLETED,
      }),
    );
    await this.paymentRepo.save(
      this.paymentRepo.create({
        transactionId: transaction.id,
        method: PaymentMethod.CASH,
        amount: total.toFixed(2),
        referenceNo: dto.mobileNumber ?? null,
      }),
    );
    return transaction;
  }
}
