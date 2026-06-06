import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  EloadDenominationDto,
  FloatAdjustmentDto,
  GcashServiceTransactionDto,
} from './dto/gcash.dto';
import { GcashService } from './gcash.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('gcash')
export class GcashController {
  constructor(private readonly gcashService: GcashService) {}

  @Get('balance')
  getBalance() {
    return this.gcashService.getBalance();
  }

  @Post('float-adjustments')
  adjustFloat(@Body() body: FloatAdjustmentDto) {
    return this.gcashService.adjustFloat(body);
  }

  @Get('denominations')
  listDenominations() {
    return this.gcashService.listDenominations();
  }

  @Post('denominations')
  createDenomination(@Body() body: EloadDenominationDto) {
    return this.gcashService.createDenomination(body);
  }

  @Post('transactions')
  processTransaction(@Body() body: GcashServiceTransactionDto) {
    return this.gcashService.processTransaction(body);
  }
}
