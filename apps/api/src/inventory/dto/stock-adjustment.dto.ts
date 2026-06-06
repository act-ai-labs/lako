import { IsInt, IsString } from 'class-validator';

export class StockAdjustmentDto {
  @IsInt()
  qtyChange: number;

  @IsString()
  reason: string;
}
