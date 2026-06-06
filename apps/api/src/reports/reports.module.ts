import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { POSTGRES_CONNECTION } from '../database/data-source';
import { Expense, Product, Transaction } from '../database/entities';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Transaction, Expense, Product],
      POSTGRES_CONNECTION,
    ),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
