import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { POSTGRES_CONNECTION } from '../database/data-source';
import {
  Payment,
  Product,
  Transaction,
  TransactionItem,
  TransactionVoid,
} from '../database/entities';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature(
      [Transaction, TransactionItem, TransactionVoid, Payment, Product],
      POSTGRES_CONNECTION,
    ),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
