import {
  IsDateString,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class ExpenseDto {
  @IsString()
  categoryId: string;

  @IsNumberString()
  amount: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  supplierId?: string;
}

export class ExpenseCategoryDto {
  @IsString()
  name: string;
}
