import { IsOptional, IsString } from 'class-validator';

export class SupplierDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
