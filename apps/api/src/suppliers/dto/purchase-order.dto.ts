import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class PurchaseOrderItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  orderedQty: number;

  @IsNumberString()
  unitCost: string;
}

export class PurchaseOrderDto {
  @IsString()
  supplierId: string;

  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];
}
