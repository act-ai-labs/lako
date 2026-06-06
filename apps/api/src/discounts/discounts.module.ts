import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { POSTGRES_CONNECTION } from '../database/data-source';
import { DiscountRule } from '../database/entities';
import { DiscountsController } from './discounts.controller';
import { DiscountsService } from './discounts.service';

@Module({
  imports: [TypeOrmModule.forFeature([DiscountRule], POSTGRES_CONNECTION)],
  controllers: [DiscountsController],
  providers: [DiscountsService],
})
export class DiscountsModule {}
