import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { POSTGRES_CONNECTION } from '../database/data-source';
import {
  EloadDenomination,
  GcashFloatAdjustment,
  GcashFloatBalance,
  Payment,
  Transaction,
} from '../database/entities';
import { GcashController } from './gcash.controller';
import { GcashService } from './gcash.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        GcashFloatBalance,
        GcashFloatAdjustment,
        EloadDenomination,
        Transaction,
        Payment,
      ],
      POSTGRES_CONNECTION,
    ),
  ],
  controllers: [GcashController],
  providers: [GcashService],
})
export class GcashModule {}
