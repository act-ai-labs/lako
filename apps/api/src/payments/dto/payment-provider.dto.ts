import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export type QrPaymentProvider = 'gcash' | 'paymaya';

export class CreateQrPaymentDto {
  @IsIn(['gcash', 'paymaya'])
  provider: QrPaymentProvider;

  @IsNumberString()
  amount: string;

  @IsOptional()
  @IsString()
  transactionRef?: string;
}

export class ManualConfirmPaymentDto {
  @IsIn(['gcash', 'paymaya', 'card'])
  provider: QrPaymentProvider | 'card';

  @IsString()
  referenceNo: string;

  @IsNumberString()
  amount: string;
}

export class CreateCardIntentDto {
  @IsNumberString()
  amount: string;

  @IsOptional()
  @IsString()
  transactionRef?: string;
}
