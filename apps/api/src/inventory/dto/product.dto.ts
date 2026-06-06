import {
  IsDateString,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  sku: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsNumberString()
  unitCost: string;

  @IsNumberString()
  sellingPrice: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockQty?: number;

  @IsInt()
  @Min(0)
  reorderPoint: number;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  barcode?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @IsOptional()
  @IsNumberString()
  unitCost?: string;

  @IsOptional()
  @IsNumberString()
  sellingPrice?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockQty?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  reorderPoint?: number;

  @IsOptional()
  @IsDateString()
  expiryDate?: string | null;

  @IsOptional()
  @IsString()
  barcode?: string | null;
}
