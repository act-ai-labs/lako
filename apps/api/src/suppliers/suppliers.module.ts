import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { POSTGRES_CONNECTION } from '../database/data-source';
import { PoItem, PurchaseOrder, Supplier } from '../database/entities';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Supplier, PurchaseOrder, PoItem],
      POSTGRES_CONNECTION,
    ),
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService],
})
export class SuppliersModule {}
