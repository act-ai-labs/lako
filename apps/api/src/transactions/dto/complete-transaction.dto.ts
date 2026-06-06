import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '../../database/entities';

class TransactionItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  qty: number;

  @IsNumberString()
  unitPrice: string;

  @IsOptional()
  @IsNumberString()
  discountAmount?: string;
}

class PaymentDto {
  @IsString()
  method: PaymentMethod;

  @IsNumberString()
  amount: string;

  @IsOptional()
  @IsString()
  referenceNo?: string;
}

export class CompleteTransactionDto {
  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDto)
  items: TransactionItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentDto)
  payments: PaymentDto[];
}
