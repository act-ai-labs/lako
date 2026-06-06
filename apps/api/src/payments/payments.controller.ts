import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  CreateCardIntentDto,
  CreateQrPaymentDto,
  ManualConfirmPaymentDto,
} from './dto/payment-provider.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('qr')
  createQrPayment(@Body() body: CreateQrPaymentDto) {
    return this.paymentsService.createQrPayment(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('manual-confirm')
  confirmManually(@Body() body: ManualConfirmPaymentDto) {
    return this.paymentsService.confirmManually(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('card-intent')
  createCardIntent(@Body() body: CreateCardIntentDto) {
    return this.paymentsService.createCardIntent(body);
  }

  @Post('webhooks/:provider')
  receiveWebhook(
    @Param('provider') provider: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.paymentsService.receiveWebhook(
      provider === 'paymaya' ? 'paymaya' : 'gcash',
      body,
    );
  }
}
