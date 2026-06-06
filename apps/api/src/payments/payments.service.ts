import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateCardIntentDto,
  CreateQrPaymentDto,
  ManualConfirmPaymentDto,
  QrPaymentProvider,
} from './dto/payment-provider.dto';

export interface QrPaymentResponse {
  provider: QrPaymentProvider;
  amount: string;
  referenceNo: string;
  status: 'pending';
  qrPayload: string;
  expiresAt: string;
  timeoutSeconds: number;
  manualConfirmationRequired: boolean;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly configService: ConfigService) {}

  createQrPayment(dto: CreateQrPaymentDto): QrPaymentResponse {
    const timeoutSeconds = Number(
      this.configService.get<string>('QR_PAYMENT_TIMEOUT_SECONDS') || 300,
    );
    const referenceNo = `${dto.provider.toUpperCase()}-${Date.now()}`;
    const configured = this.hasProviderCredentials(dto.provider);
    const qrPayload = configured
      ? this.buildMerchantQrPayload(dto.provider, dto.amount, referenceNo)
      : this.buildManualQrPayload(dto.provider, dto.amount, referenceNo);

    return {
      provider: dto.provider,
      amount: dto.amount,
      referenceNo,
      status: 'pending',
      qrPayload,
      expiresAt: new Date(Date.now() + timeoutSeconds * 1000).toISOString(),
      timeoutSeconds,
      manualConfirmationRequired: !configured,
    };
  }

  confirmManually(dto: ManualConfirmPaymentDto) {
    return {
      provider: dto.provider,
      amount: dto.amount,
      referenceNo: dto.referenceNo,
      status: 'confirmed' as const,
      confirmedAt: new Date().toISOString(),
      source: 'manual',
    };
  }

  receiveWebhook(
    provider: QrPaymentProvider,
    payload: Record<string, unknown>,
  ) {
    return {
      provider,
      status: 'accepted' as const,
      receivedAt: new Date().toISOString(),
      referenceNo: this.extractReference(payload),
    };
  }

  createCardIntent(dto: CreateCardIntentDto) {
    const configured = Boolean(
      this.configService.get<string>('PAYMONGO_SECRET_KEY'),
    );
    const referenceNo = `CARD-${Date.now()}`;

    return {
      provider: 'paymongo',
      amount: dto.amount,
      referenceNo,
      status: configured ? 'pending' : 'manual_reference_required',
      configured,
      instructions: configured
        ? 'PayMongo credentials configured. Send this intent to the terminal and wait for approval.'
        : 'PayMongo credentials are empty. Process the card on the terminal and enter the approval reference manually.',
    };
  }

  private hasProviderCredentials(provider: QrPaymentProvider): boolean {
    const key =
      provider === 'gcash' ? 'GCASH_MERCHANT_KEY' : 'PAYMAYA_MERCHANT_KEY';
    return Boolean(this.configService.get<string>(key));
  }

  private buildMerchantQrPayload(
    provider: QrPaymentProvider,
    amount: string,
    referenceNo: string,
  ): string {
    return JSON.stringify({
      provider,
      amount,
      referenceNo,
      merchantId: this.configService.get<string>(
        provider === 'gcash' ? 'GCASH_MERCHANT_ID' : 'PAYMAYA_MERCHANT_ID',
      ),
    });
  }

  private buildManualQrPayload(
    provider: QrPaymentProvider,
    amount: string,
    referenceNo: string,
  ): string {
    return `${provider.toUpperCase()} MANUAL PAY | AMOUNT ${amount} | REF ${referenceNo}`;
  }

  private extractReference(payload: Record<string, unknown>): string | null {
    const reference = payload.referenceNo ?? payload.reference_no ?? payload.id;
    return typeof reference === 'string' ? reference : null;
  }
}
