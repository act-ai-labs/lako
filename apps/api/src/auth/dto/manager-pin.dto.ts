import { IsString, MinLength } from 'class-validator';

export class ManagerPinDto {
  @IsString()
  @MinLength(4)
  pin: string;
}
