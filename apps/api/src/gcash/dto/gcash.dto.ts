import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class FloatAdjustmentDto {
  @IsIn(['top_up', 'withdrawal'])
  type: 'top_up' | 'withdrawal';

  @IsNumberString()
  amount: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class EloadDenominationDto {
  @IsNumberString()
  amount: string;

  @IsNumberString()
  sellingPrice: string;
}

export class GcashServiceTransactionDto {
  @IsIn(['cash_in', 'cash_out', 'load'])
  type: 'cash_in' | 'cash_out' | 'load';

  @IsNumberString()
  amount: string;

  @IsOptional()
  @IsNumberString()
  fee?: string;

  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @IsOptional()
  @IsString()
  denominationId?: string;
}
