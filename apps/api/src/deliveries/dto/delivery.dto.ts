import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class DeliveryItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  receivedQty: number;
}

export class DeliveryDto {
  @IsOptional()
  @IsString()
  poId?: string;

  @IsString()
  supplierId: string;

  @IsOptional()
  @IsDateString()
  receivedAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  discrepancyNotes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryItemDto)
  items: DeliveryItemDto[];
}
