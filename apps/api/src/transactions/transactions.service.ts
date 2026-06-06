import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { POSTGRES_CONNECTION } from '../database/data-source';
import { AuthService } from '../auth/auth.service';
import {
  Payment,
  Product,
  Transaction,
  TransactionItem,
  TransactionStatus,
  TransactionType,
  TransactionVoid,
} from '../database/entities';
import { CompleteTransactionDto } from './dto/complete-transaction.dto';
import { VoidTransactionDto } from './dto/void-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction, POSTGRES_CONNECTION)
    private readonly transactionsRepo: Repository<Transaction>,
    @InjectDataSource(POSTGRES_CONNECTION)
    private readonly dataSource: DataSource,
    private readonly authService: AuthService,
  ) {}

  async completeSale(dto: CompleteTransactionDto): Promise<Transaction> {
    if (dto.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    if (dto.transactionId) {
      const existing = await this.transactionsRepo.findOne({
        where: { id: dto.transactionId },
        relations: { items: { product: true }, payments: true },
      });
      if (existing) {
        return existing;
      }
    }

    const total = dto.items.reduce(
      (sum, item) =>
        sum +
        Number(item.unitPrice) * item.qty -
        Number(item.discountAmount ?? 0),
      0,
    );
    const paid = dto.payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    if (paid < total) {
      throw new BadRequestException(
        'Payment total is less than transaction total',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      for (const item of dto.items) {
        const product = await manager.findOne(Product, {
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }
        if (product.stockQty < item.qty) {
          throw new BadRequestException(
            `${product.name} has only ${product.stockQty} available`,
          );
        }
      }

      const transaction = await manager.save(
        manager.create(Transaction, {
          id: dto.transactionId,
          type: TransactionType.SALE,
          total: total.toFixed(2),
          tendered: paid.toFixed(2),
          change: Math.max(paid - total, 0).toFixed(2),
          status: TransactionStatus.COMPLETED,
        }),
      );

      for (const item of dto.items) {
        const product = await manager.findOneByOrFail(Product, {
          id: item.productId,
        });
        product.stockQty -= item.qty;
        await manager.save(product);
        await manager.save(
          manager.create(TransactionItem, {
            transactionId: transaction.id,
            productId: item.productId,
            qty: item.qty,
            unitPrice: item.unitPrice,
            discountAmount: item.discountAmount ?? '0',
          }),
        );
      }

      for (const payment of dto.payments) {
        await manager.save(
          manager.create(Payment, {
            transactionId: transaction.id,
            method: payment.method,
            amount: payment.amount,
            referenceNo: payment.referenceNo ?? null,
          }),
        );
      }

      return manager.findOneOrFail(Transaction, {
        where: { id: transaction.id },
        relations: { items: { product: true }, payments: true },
      });
    });
  }

  async voidTransaction(
    id: string,
    dto: VoidTransactionDto,
  ): Promise<Transaction> {
    await this.authService.verifyManagerPin(dto.managerPin);

    return this.dataSource.transaction(async (manager) => {
      const transaction = await manager.findOne(Transaction, {
        where: { id },
        relations: { items: true },
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }
      if (transaction.status === TransactionStatus.VOIDED) {
        throw new BadRequestException('Transaction already voided');
      }

      for (const item of transaction.items) {
        if (!item.productId) continue;
        const product = await manager.findOneByOrFail(Product, {
          id: item.productId,
        });
        product.stockQty += item.qty;
        await manager.save(product);
      }

      transaction.status = TransactionStatus.VOIDED;
      await manager.save(transaction);
      await manager.save(
        manager.create(TransactionVoid, {
          transactionId: transaction.id,
          reason: dto.reason,
          authorizedById: dto.authorizedById ?? null,
        }),
      );

      return manager.findOneOrFail(Transaction, {
        where: { id },
        relations: { items: { product: true }, payments: true },
      });
    });
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionsRepo.findOne({
      where: { id },
      relations: { items: { product: true }, payments: true },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }
}
