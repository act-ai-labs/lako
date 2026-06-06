import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CompleteTransactionDto } from './dto/complete-transaction.dto';
import { VoidTransactionDto } from './dto/void-transaction.dto';
import { TransactionsService } from './transactions.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('complete')
  completeSale(@Body() body: CompleteTransactionDto) {
    return this.transactionsService.completeSale(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Post(':id/void')
  voidTransaction(@Param('id') id: string, @Body() body: VoidTransactionDto) {
    return this.transactionsService.voidTransaction(id, body);
  }
}
