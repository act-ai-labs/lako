import {
  IsBoolean,
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  DiscountScope,
  DiscountTrigger,
  DiscountType,
} from '../../database/entities';

export class DiscountRuleDto {
  @IsString()
  name: string;

  @IsIn(Object.values(DiscountType))
  type: DiscountType;

  @IsIn(Object.values(DiscountScope))
  scope: DiscountScope;

  @IsIn(Object.values(DiscountTrigger))
  trigger: DiscountTrigger;

  @IsNumberString()
  value: string;

  @IsOptional()
  @IsString()
  triggerValue?: string;

  @IsOptional()
  @IsBoolean()
  authorizationRequired?: boolean;
}
